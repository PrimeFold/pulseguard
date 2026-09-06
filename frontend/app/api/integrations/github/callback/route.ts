import { prisma } from "@/lib/auth";
import { getInstallationOctokit } from "@/lib/github";
import { requireOrganizationRole } from '@/lib/authorization';
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest){
    const { searchParams } = new URL(req.url);
    const installationIdStr = searchParams.get('installation_id');
    if (!installationIdStr) {
      return NextResponse.redirect(new URL('/workspaces?error=missing_installation_id', req.url));
    }

    let targetOrgId = searchParams.get('state');

    // Fallback: If GitHub dropped the state parameter (e.g. during reconfigure), infer from current session
    if (!targetOrgId) {
      try {
        const { auth } = await import("@/lib/auth");
        const session = await auth.api.getSession({ headers: req.headers });
        if (session?.user) {
          const member = await prisma.organizationMember.findFirst({
            where: { userId: session.user.id, role: { in: ['OWNER', 'ADMIN'] } },
            orderBy: { createdAt: 'desc' },
          });
          if (member) {
            targetOrgId = member.organizationId;
          }
        }
      } catch (err) {
        console.error("Session fallback error:", err);
      }
    }

    if (!targetOrgId) {
      return NextResponse.redirect(
        new URL('/workspaces?error=missing_target_organization', req.url)
      );
    }

    try {
      await requireOrganizationRole(targetOrgId, ['OWNER', 'ADMIN'], req.headers);
    } catch {
      return NextResponse.redirect(
        new URL('/workspaces?error=unauthorized_organization', req.url)
      );
    }

    const installationId = parseInt(installationIdStr, 10);
    let defaultRepoName: string | null = null;
    let defaultRepoOwner: string | null = null;
    let octokitErrorMessage: string | null = null;

    try {
      // 1. Authenticate as the newly installed tenant
      const octokit = getInstallationOctokit(installationId);

      // 2. Fetch the repositories the user granted access to
      const { data } = await octokit.rest.apps.listReposAccessibleToInstallation();
      const defaultRepo = data.repositories?.[0];
      if (defaultRepo) {
        defaultRepoName = defaultRepo.name;
        defaultRepoOwner = defaultRepo.owner?.login || null;
      }
    } catch (octokitErr: any) {
      console.error("Octokit error during GitHub callback:", octokitErr);
      octokitErrorMessage = octokitErr.message || "Failed to query accessible repos";
    }

    try {
      // 3. Always link this installation ID to the user's organization in DB
      const updatedOrg = await prisma.organization.update({
        where: { id: targetOrgId },
        data: {
          githubInstallationId: installationId,
          githubDefaultRepo: defaultRepoName,
          githubOwner: defaultRepoOwner,
        }
      });

      const redirectUrl = new URL(`/${updatedOrg.slug}`, req.url);
      if (octokitErrorMessage) {
        redirectUrl.searchParams.set("github", "connected_with_warning");
        redirectUrl.searchParams.set("warning", octokitErrorMessage);
      } else {
        redirectUrl.searchParams.set("github", "connected");
      }

      return NextResponse.redirect(redirectUrl);
    } catch (dbError: any) {
      console.error("Database update error in GitHub callback:", dbError);
      return NextResponse.redirect(
        new URL(`/workspaces?error=github_link_failed&reason=${encodeURIComponent(dbError?.message || "db_error")}`, req.url)
      );
    }
}

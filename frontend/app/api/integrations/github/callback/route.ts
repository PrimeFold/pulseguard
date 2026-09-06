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
    try {
        // 1. Authenticate as the newly installed tenant
        const octokit = getInstallationOctokit(installationId);

        //2. Fetch the repositories the user granted access to : 
        const {data} = await octokit.rest.apps.listReposAccessibleToInstallation();
        const defaultRepo = data.repositories[0];

        //3. Linking this installation to the current user's organization in DB
        const updatedOrg = await prisma.organization.update({
            where: {
                id: targetOrgId
            },
            data: {
                githubInstallationId: installationId,
                githubDefaultRepo: defaultRepo ? defaultRepo.name : null,
                githubOwner: defaultRepo ? defaultRepo.owner.login : null,
            }
        });

        return NextResponse.redirect(
            new URL(`/${updatedOrg.slug}?github=connected`, req.url)
        );
    } catch (error) {
        console.error('GitHub link error:', error);
        return NextResponse.redirect(
          new URL('/workspaces?error=github_link_failed', req.url)
        );
    }
}

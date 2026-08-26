import { prisma } from "@/lib/auth";
import { getInstallationOctokit } from "@/lib/github";
import { requireOrganizationRole } from '@/lib/authorization';
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest){
    const {searchParams } = new URL(req.url);
    const installationIdStr = searchParams.get('installation_id');
    if(!installationIdStr){
        return NextResponse.redirect(new URL('/dashboard/settings?error=missing_installation_id',req.url));
    }
    const targetOrgId = searchParams.get('state');

    if (!installationIdStr || !targetOrgId) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=missing_params', req.url)
      );
    }

    try {
      await requireOrganizationRole(targetOrgId, ['OWNER', 'ADMIN'], req.headers);
    } catch {
      return NextResponse.redirect(
            new URL('/dashboard/settings?error=unauthorized_organization', req.url)
        );
    }

    const installationId = parseInt(installationIdStr, 10);
    try {
        // 1. Authenticate as the newly installed tenant
        const octokit = getInstallationOctokit(installationId);

        //2. Fetch the repositories the user granted access to : 
        const {data} = await octokit.rest.apps.listReposAccessibleToInstallation();
        const defaultRepo = data.repositories[0];

        //3.Linking.. this installation to the current user's organization in DB..
        await prisma.organization.update({
            where:{
                id:targetOrgId
            },
            data:{
                githubInstallationId:installationId,
                githubDefaultRepo: defaultRepo ? defaultRepo.name : null,
                githubOwner: defaultRepo ? defaultRepo.owner.login : null,
            }
        })

        return NextResponse.redirect(
            new URL(`/dashboard/${targetOrgId}/settings?github=connected`, req.url)
        )
    } catch (error) {
        console.error('GitHub link error:', error);
        return NextResponse.redirect(
          new URL('/dashboard/settings?error=github_link_failed', req.url)
        );
    }
}

import { prisma } from "@/lib/auth";
import { createFixPullRequest, getInstallationOctokit } from "@/lib/github";
import { getUser } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){
    try {
        const user = await getUser();
        if(!user){
            return NextResponse.json({error:'Unauthorized'},{status:401})
        }
        const { organizationId , filePath , patch , incidentId } = await req.json();
        if(!organizationId || !filePath || !patch){
            return NextResponse.json(
                {error:'Missing required parameters: organizationId , filePath , or patch'},
                {status:400}
            )
        }

        const org  = await prisma.organization.findUnique({
            where:{
                id:organizationId
            }
        })

        if(!org?.githubOwner || !org.githubDefaultRepo){
            return NextResponse.json(
                { error: 'GitHub repository is missing for this organization.' },
                { status: 400 }
            );
        }
        
        const octokit = getInstallationOctokit(Number(org.githubInstallationId));
        const timestamp = Date.now();


        const result = await createFixPullRequest({
            octokit,
            owner:org.githubOwner,
            repo:org.githubDefaultRepo,
            baseBranch:'main',
            newBranch:`fix/sre-${incidentId || timestamp}`,
            filePath,
            updatedContent:patch,
            commitMessage:`fix(sre):automated patch for ${filePath}`,
            prTitle:`fix(sre): automated incident hotfix for ${filePath}`,
            prBody: `### 🤖 Autonomous SRE Hotfix\n\n- **Target File:** \`${filePath}\`\n\nPlease review and merge.`,
        })

        return NextResponse.json({success:true, ...result});
    } catch (error:any) {
        return NextResponse.json({error:error.message},{status:500});
    }
}
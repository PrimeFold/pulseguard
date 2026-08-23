'use server';

import { prisma } from "@/lib/auth";
import { createFixPullRequest, getInstallationOctokit } from "@/lib/github";
import { github } from "better-auth";

export async function approveAndCreatePR(organizationId:string,proposal:any){
    const org = await prisma.organization.findUnique({
        where:{
            id:organizationId
        }
    })

    if(!org?.githubDefaultRepo || !org?.githubInstallationId || !org?.githubOwner){
        throw new Error("Connected repository not found..")
    }

    const octokit = getInstallationOctokit(org.githubInstallationId);

    const pr = await createFixPullRequest({
        octokit,
        owner:org.githubOwner,
        repo:org.githubDefaultRepo,
        newBranch:proposal.fixBranch,
        filePath:proposal.filePath,
        updatedContent:proposal.updatedContent,
        commitMessage: proposal.commitMessage,
        prTitle: proposal.prTitle,
        prBody: proposal.prBody,
    })

    return {
        prUrl:pr.prUrl,
        prNumber:pr.prNumber
    }

}
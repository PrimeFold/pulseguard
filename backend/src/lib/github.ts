import {Octokit} from 'octokit';
import {createAppAuth} from '@octokit/auth-app';
import { CreatePullRequestOptions } from '@/app/types/github';


export function formatPrivateKey(rawKey: string | undefined): string {
    if (!rawKey) return '';
    let key = rawKey.trim();
    // Strip surrounding quotes if present
    if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
        key = key.slice(1, -1);
    }
    // Replace literal escaped newlines (\n) with actual newlines
    key = key.replace(/\\n/g, '\n');

    // If key lacks PEM header, wrap it cleanly
    if (!key.includes('BEGIN')) {
        const cleaned = key.replace(/\s+/g, '');
        const chunks = cleaned.match(/.{1,64}/g)?.join('\n') || cleaned;
        return `-----BEGIN RSA PRIVATE KEY-----\n${chunks}\n-----END RSA PRIVATE KEY-----\n`;
    }
    return key;
}

export function getInstallationOctokit(installationId:number):Octokit{  
    const privateKey = formatPrivateKey(process.env.GITHUB_APP_PRIVATE_KEY);
    return new Octokit({
        authStrategy: createAppAuth,
        auth:{
            appId:process.env.GITHUB_APP_ID!,
            privateKey,
            installationId
        }
    })
}


//This function fetches repo and its metadata and checks if the repo has a single file or a directory..
export async function fetchFileFromRepo(
    octokit:Octokit,
    owner:string,
    repo:string,
    path:string,
    ref:string = 'main'
):Promise<string>{
    const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref
    });
    if('type' in data && data.type === 'file' && 'content' in data ){
        return Buffer.from(data.content , 'base64').toString('utf-8');
    }
    throw new Error(`Target path "${path}" is not a readable file.`)
}


export async function createFixPullRequest({
    octokit,
  owner,
  repo,
  baseBranch = 'main',
  newBranch,
  filePath,
  updatedContent,
  commitMessage,
  prTitle,
  prBody,
}:CreatePullRequestOptions){
   try {
        const { data : baseRef } = await octokit.rest.git.getRef({
            owner,
            repo,
            ref:`heads/${baseBranch}`
        })
        const latestCommitSha = baseRef.object.sha;

        await octokit.rest.git.createRef({
            owner,
            repo,
            ref:`refs/heads/${newBranch}`,
            sha:latestCommitSha
        })

        let fileSha : string | undefined;

        try {
            const { data : existingFile } = await octokit.rest.repos.getContent({
                owner,
                repo,
                path:filePath,
                ref:newBranch
            })
            if ('sha' in existingFile) {
              fileSha = existingFile.sha;
            }

        } catch (error) {
            // 404 means the file doesn't exist yet (creating a new file)
            const status = (error as { status?: number }).status;
            if (status !== 404) throw error;
        }

        // 4. Commit updated file contents (must be base64-encoded)
        await octokit.rest.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: filePath,
          message: commitMessage,
          content: Buffer.from(updatedContent).toString('base64'),
          branch: newBranch,
          sha: fileSha,
        });

        // 5. Open the Pull Request
        const { data: pullRequest } = await octokit.rest.pulls.create({
          owner,
          repo,
          title: prTitle,
          head: newBranch,
          base: baseBranch,
          body: prBody,
        });

        return {
          prNumber: pullRequest.number,
          prUrl: pullRequest.html_url,
        };

   } catch (error) {
        throw new Error((error as Error).message)
   }

}



import { Octokit } from "octokit";

//interface for creating PR REQUEST..
export interface CreatePullRequestOptions {
  octokit: Octokit;
  owner: string;
  repo: string;
  baseBranch?: string;
  newBranch: string;  
  filePath: string;    
  updatedContent: string;
  commitMessage: string;
  prTitle: string;
  prBody: string;
}
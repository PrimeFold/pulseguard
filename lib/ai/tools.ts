import { getTelemetry } from "@/app/api/action/telemetry";
import { tool } from "ai";
import { z } from "zod";
import { prisma } from "../auth";
import {
  getInstallationOctokit,
  fetchFileFromRepo,
  createFixPullRequest,
} from "../github";

export function createIncidentTools(organizationId: string) {
  return {
    // Tool 1: Query telemetry logs
    query_telemetry_logs: tool({
      description:
        "Query structured error logs and telemetry around an incident timeframe to identify stack traces and failure causes.",

      inputSchema: z.object({
        service: z
          .string()
          .optional()
          .describe('Filter by microservice name, e.g. "auth-service"'),

        level: z.enum(["INFO", "WARN", "ERROR"]).default("ERROR"),

        fromDate: z.string().optional().describe("ISO timestamp start window"),

        toDate: z.string().optional().describe("ISO timestamp end window"),

        searchQuery: z
          .string()
          .optional()
          .describe("Substring match in log messages"),

        limit: z.number().default(10).describe("Max log lines to fetch"),
      }),

      execute: async ({
        service,
        level,
        fromDate,
        toDate,
        searchQuery,
        limit,
      }) => {
        const result = await getTelemetry({
          organizationId,
          service,
          level,
          fromDate: fromDate ? new Date(fromDate) : undefined,
          toDate: toDate ? new Date(toDate) : undefined,
          searchQuery,
          limit,
        });

        return result.data;
      },
    }),

    // Tool 2: Read source code flagged in logs/stack traces
    fetch_repo_file: tool({
      description:
        "Fetch the source code of a specific file from the connected repository.",

      inputSchema: z.object({
        filePath: z
          .string()
          .describe('Relative path to the file, e.g. "src/lib/db.ts"'),

        ref: z
          .string()
          .default("main")
          .describe("Branch or commit SHA to read from"),
      }),

      execute: async ({ filePath, ref }) => {
        const org = await prisma.organization.findUnique({
          where: {
            id: organizationId,
          },
        });

        if (
          !org?.githubInstallationId ||
          !org.githubOwner ||
          !org.githubDefaultRepo
        ) {
          throw new Error(
            "Organization does not have a GitHub repository connected.",
          );
        }

        const octokit = getInstallationOctokit(org.githubInstallationId);

        const fileContent = await fetchFileFromRepo(
          octokit,
          org.githubOwner,
          org.githubDefaultRepo,
          filePath,
          ref,
        );

        return {
          filePath,
          content: fileContent,
        };
      },
    }),

    // Tool 3: Create the pull request fixing the issue
    create_hotfix_pull_request: tool({
      description:
        "Create a hotfix branch, commit updated code, and open a Pull Request.",

      inputSchema: z.object({
        filePath: z.string().describe("Path of the file being modified"),

        updatedContent: z
          .string()
          .describe("Complete updated code for the file"),

        fixBranch: z
          .string()
          .describe('Branch name, e.g. "hotfix/increase-db-pool"'),

        commitMessage: z.string().describe("Conventional commit message"),

        prTitle: z.string().describe("Pull request title"),

        prBody: z
          .string()
          .describe(
            "Detailed PR markdown description explaining the fix and root cause",
          ),
      }),

      execute: async ({
        filePath,
        updatedContent,
        fixBranch,
        commitMessage,
        prTitle,
        prBody,
      }) => {
        const org = await prisma.organization.findUnique({
          where: {
            id: organizationId,
          },
        });

        if (
          !org?.githubInstallationId ||
          !org.githubOwner ||
          !org.githubDefaultRepo
        ) {
          throw new Error("GitHub app not installed for this organization.");
        }

        const octokit = getInstallationOctokit(org.githubInstallationId);

        const pr = await createFixPullRequest({
          octokit,
          owner: org.githubOwner,
          repo: org.githubDefaultRepo,
          newBranch: fixBranch,
          filePath,
          updatedContent,
          commitMessage,
          prTitle,
          prBody,
        });

        return {
          status: "success",
          prUrl: pr.prUrl,
          prNumber: pr.prNumber,
        };
      },
    }),
    propose_hotfix: tool({
      description:'Propose a code fix and PR structure for human review before creating the GitHub PR.',
      inputSchema: z.object({
        filePath: z.string().describe('Target file path'),
        originalSnippet: z.string().describe('The broken code lines'),
        updatedContent: z.string().describe('The full modified file content or patch'),
        fixBranch: z.string().describe('Suggested branch name, e.g. "hotfix/db-pool-fix"'),
        commitMessage: z.string().describe('Commit message'),
        prTitle: z.string().describe('PR Title'),
        prBody: z.string().describe('Markdown explanation of root cause and fix'),
      }),
      execute: async (proposal)=>{
        return{
          status:`requires_approval`,
          proposal
        }
      }
    })

  };
}

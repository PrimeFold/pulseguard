import { getTelemetry } from "@/app/api/action/telemetry";
import { tool } from "ai";
import { z } from "zod";
import { prisma } from "../auth";
import { getInstallationOctokit, fetchFileFromRepo } from "../github";
import { searchKnowledgeBase } from "@/app/api/action/agent";

const telemetryLevels = ["INFO", "WARN", "ERROR", "FATAL"] as const;

export function createIncidentTools(organizationId: string) {
  return {
    // Tool 1: Search parsed organization runbooks (RAG)
    search_knowledge_base: tool({
      description:
        "Search the organization's parsed runbooks and troubleshooting documentation for matching error mitigation steps.",
      inputSchema: z.object({
        query: z
          .string()
          .describe(
            "Semantic search query, e.g. 'postgres pool limit' or 'OAuth connection timeout'",
          ),
      }),
      execute: async ({ query }) => {
        try {
          const results = await searchKnowledgeBase(query, organizationId);
          return (results || []).map((r) => ({
            id: String(r.id),
            content: r.content,
            similarity: typeof r.similarity === "number" ? r.similarity : 0.8,
          }));
        } catch (err: any) {
          return { error: err.message || "Knowledge base query failed" };
        }
      },
    }),

    // Tool 2: Query telemetry logs
    query_telemetry_logs: tool({
      description:
        "Query structured error logs and telemetry around an incident timeframe to identify stack traces and failure causes.",
      inputSchema: z.object({
        service: z
          .string()
          .optional()
          .describe('Filter by microservice name, e.g. "auth-service"'),
        level: z.enum(telemetryLevels).default("ERROR"),
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
        try {
          const result = await getTelemetry({
            organizationId,
            service,
            level,
            fromDate: fromDate ? new Date(fromDate) : undefined,
            toDate: toDate ? new Date(toDate) : undefined,
            searchQuery,
            limit,
          });

          return (result?.data || []).map((log) => ({
            id: log.id,
            service: log.service,
            level: log.level,
            message: log.message,
            stackTrace: log.stackTrace || null,
            metadata: log.metadata || null,
            timestamp:
              log.timestamp instanceof Date
                ? log.timestamp.toISOString()
                : String(log.timestamp),
          }));
        } catch (err: any) {
          return { error: err.message || "Failed to query telemetry logs" };
        }
      },
    }),

    // Tool 3: Read source code flagged in logs/stack traces
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
        try {
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
            return {
              error:
                "Organization does not have a GitHub repository connected.",
            };
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
        } catch (err: any) {
          return { error: err.message || "Failed to fetch repository file" };
        }
      },
    }),

    // Tool 4: Propose hotfix
    propose_hotfix: tool({
      description:
        "Propose a code fix and PR structure for human review before creating the GitHub PR.",
      inputSchema: z.object({
        filePath: z.string().describe("Target file path"),
        originalSnippet: z.string().describe("The broken code lines"),
        updatedContent: z
          .string()
          .describe("The full modified file content or patch"),
        fixBranch: z
          .string()
          .describe('Suggested branch name, e.g. "hotfix/db-pool-fix"'),
        commitMessage: z.string().describe("Commit message"),
        prTitle: z.string().describe("PR Title"),
        prBody: z
          .string()
          .describe("Markdown explanation of root cause and fix"),
      }),
      execute: async (proposal) => {
        return {
          status: "requires_approval",
          proposal,
        };
      },
    }),
  };
}

import { tool } from "ai";
import { z } from "zod";
import { prisma } from "../auth";
import { getInstallationOctokit, fetchFileFromRepo } from "../github";
import { getEmbeddingVectorString } from "@/app/api/action/embedding";
import { queryResult } from "@/app/types/searchResult";

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
      execute: async ({ query }: { query: string }) => {
        try {
          if (!query || !query.trim()) return [];
          const queryVectorString = await getEmbeddingVectorString(query, organizationId);
          await prisma.$executeRawUnsafe(`SET hnsw.ef_search = 40;`);

          const results = await prisma.$queryRaw<queryResult[]>`
            SELECT 
            chunk.id,
            chunk.content,
            1 - (chunk.embedding <=> ${queryVectorString}::vector) AS similarity
            FROM "DocumentChunk" AS chunk
            INNER JOIN "Document" AS document ON document.id = chunk."documentId"
            WHERE document."organizationId" = ${organizationId}
              AND 1 - (chunk.embedding <=> ${queryVectorString}::vector) > 0.60
            ORDER BY chunk.embedding <=> ${queryVectorString}::vector ASC
            LIMIT 3;
          `;

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
        level: z.enum(telemetryLevels).optional().describe("Log severity level (FATAL, ERROR, WARN, INFO). Omit to query all log levels."),
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
        limit = 10,
      }: {
        service?: string;
        level?: (typeof telemetryLevels)[number];
        fromDate?: string;
        toDate?: string;
        searchQuery?: string;
        limit?: number;
      }) => {
        try {
          const where: any = {
            organizationId,
            ...(service && { service }),
            ...(level && { level }),
            ...(fromDate || toDate
              ? {
                  timestamp: {
                    ...(fromDate && { gte: new Date(fromDate) }),
                    ...(toDate && { lte: new Date(toDate) }),
                  },
                }
              : {}),
            ...(searchQuery && {
              OR: [
                { message: { contains: searchQuery, mode: "insensitive" } },
                { service: { contains: searchQuery, mode: "insensitive" } },
              ],
            }),
          };

          let logs = await prisma.telemetryLog.findMany({
            where,
            orderBy: { timestamp: "desc" },
            take: limit,
          });

          // Fallback: If initial filter yielded no logs, query latest logs for the organization
          if (!logs || logs.length === 0) {
            logs = await prisma.telemetryLog.findMany({
              where: { organizationId },
              orderBy: { timestamp: "desc" },
              take: limit,
            });
          }

          return (logs || []).map((log) => ({
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
      execute: async ({ filePath, ref }: { filePath: string; ref?: string }) => {
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
        originalSnippet: z.string().optional().describe("The broken code lines"),
        updatedContent: z
          .string()
          .describe("The full modified file content or patch"),
        fixBranch: z
          .string()
          .optional()
          .describe('Suggested branch name, e.g. "hotfix/db-pool-fix"'),
        commitMessage: z.string().describe("Commit message"),
        prTitle: z.string().describe("PR Title"),
        prBody: z
          .string()
          .describe("Markdown explanation of root cause and fix"),
      }),
      execute: async (proposal: any) => {
        return {
          status: "requires_approval",
          proposal: {
            ...proposal,
            originalSnippet: proposal.originalSnippet || "",
            fixBranch: proposal.fixBranch || "hotfix/incident-resolution",
          },
        };
      },
    }),
  };
}

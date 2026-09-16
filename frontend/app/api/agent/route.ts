import {
  streamText,
  convertToModelMessages,
} from "ai";
import { google } from "@ai-sdk/google";

import { prisma } from "@/lib/auth";
import { createIncidentTools } from "@/lib/ai/tools";
import { checkRateLimit } from "@/lib/rate-limit";
import { getOrgLanguageModel } from "@/lib/ai/provider";
import { NextRequest } from "next/server";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const rateLimit = await checkRateLimit(req);
    if (!rateLimit.success) {
      return new Response(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { messages } = body;
    const organizationId =
      body.organizationId || req.nextUrl.searchParams.get("organizationId");
    const incidentId =
      body.incidentId || req.nextUrl.searchParams.get("incidentId");

    if (!organizationId) {
      return new Response(
        JSON.stringify({ error: "Missing required parameter: organizationId" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const org = await prisma.organization.findFirst({
      where: {
        OR: [{ id: organizationId }, { slug: organizationId }],
      },
    });

    if (!org) {
      return new Response(
        JSON.stringify({
          error: `Organization not found for identifier: ${organizationId}`,
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    let incident = null;
    if (incidentId) {
      incident = await prisma.incident.findFirst({
        where: { id: incidentId, organizationId: org.id },
      });
    }

    // Dynamic model resolution for organization
    let aiModel: any;
    try {
      aiModel = await getOrgLanguageModel(org.id);
    } catch (modelErr: any) {
      return new Response(
        JSON.stringify({
          error:
            modelErr.message ||
            "AI Provider API Key is missing. Please configure your key in Organization Settings.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Convert messages safely and filter out empty items
    let modelMessages: any[] = [];
    if (Array.isArray(messages) && messages.length > 0) {
      try {
        modelMessages = await convertToModelMessages(messages);
      } catch (err) {
        console.warn("convertToModelMessages failed, using fallback:", err);
      }

      if (!Array.isArray(modelMessages) || modelMessages.length === 0) {
        modelMessages = messages
          .map((m: any) => {
            let text = "";
            if (typeof m.content === "string" && m.content.trim()) {
              text = m.content.trim();
            } else if (Array.isArray(m.parts)) {
              text = m.parts
                .filter((p: any) => p.type === "text" && p.text)
                .map((p: any) => p.text)
                .join("\n")
                .trim();
            }
            return {
              role: m.role === "assistant" ? "assistant" : "user",
              content: text,
            };
          })
          .filter((m: any) => m.content && m.content.trim().length > 0);
      }
    }

    if (modelMessages.length === 0) {
      modelMessages = [
        {
          role: "user",
          content: "Investigate this incident and check available telemetry logs.",
        },
      ];
    }

    const result = streamText({
      model: aiModel,
      system: `You are an Autonomous Site Reliability Engineer (SRE).
Investigate production incidents by:
1. Searching the organization runbook knowledge base using 'search_knowledge_base' to retrieve resolution steps.
2. Querying recent ERROR/FATAL telemetry logs using 'query_telemetry_logs' around the timeframe.
3. Identifying the breaking file and fetching its code with 'fetch_repo_file'.
4. Providing root-cause analysis and creating a unified patch with 'propose_hotfix' and waiting for human approval.

CRITICAL RESPONSE REQUIREMENTS:
- You MUST ALWAYS emit a clear, professional Markdown text response summarizing your technical analysis for the user.
- EVEN IF 'search_knowledge_base', 'query_telemetry_logs', or 'fetch_repo_file' return empty results (0 matches, no logs, or no breaking files found), ALWAYS explain what was checked, explicitly state that no relevant logs or runbooks were found, and provide a helpful diagnosis or next steps. Never end your turn without text output.`,
      messages: modelMessages,
      tools: createIncidentTools(org.id),
      maxSteps: 5,
      onFinish: async ({ text }) => {
        if (incidentId && text) {
          try {
            await prisma.incidentMessage.create({
              data: {
                incidentId,
                role: "ASSISTANT",
                messages: text,
              },
            });
          } catch (err) {
            console.warn("Failed to persist incident message:", err);
          }
        }

        if (incidentId) {
          try {
            await prisma.agentExecution.create({
              data: {
                organizationId: org.id,
                incidentId: incidentId,
                model: org.aiModel || "gemini-1.5-flash",
                totalTokens: 0,
                fingerprint: incident?.fingerprint || "manual-query",
              },
            });
          } catch (err) {
            console.warn("Failed to log agent execution:", err);
          }
        }
      },
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("POST /api/agent error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
        details: String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

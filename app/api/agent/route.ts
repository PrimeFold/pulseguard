import {
  streamText,
  convertToModelMessages,
  isStepCount,
  toUIMessageStream,
  createUIMessageStreamResponse,
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

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org) {
      return new Response(
        JSON.stringify({
          error: `Organization not found for id: ${organizationId}`,
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    let incident = null;
    if (incidentId) {
      incident = await prisma.incident.findUnique({
        where: { id: incidentId, organizationId },
      });
    }

    // Dynamic model resolution for organization
    const aiModel = await getOrgLanguageModel(org.id);

    // Convert messages safely
    let modelMessages: any[] = [];
    if (Array.isArray(messages) && messages.length > 0) {
      try {
        modelMessages = await convertToModelMessages(messages);
      } catch {
        modelMessages = messages.map((m: any) => ({
          role: m.role || "user",
          content:
            typeof m.content === "string"
              ? m.content
              : m.parts?.map((p: any) => p.text || "").join("") || "",
        }));
      }
    }

    const result = streamText({
      model: aiModel,
      system: `You are an Autonomous Site Reliability Engineer (SRE).
Investigate production incidents by:
1. Searching the organization runbook knowledge base using 'search_knowledge_base' to retrieve resolution steps.
2. Querying recent ERROR/FATAL telemetry logs using 'query_telemetry_logs' around the timeframe.
3. Identifying the breaking file and fetching its code with 'fetch_repo_file'.
4. Providing root-cause analysis and creating a unified patch with 'propose_hotfix' and waiting for human approval.`,
      messages: modelMessages,
      tools: createIncidentTools(org.id),
      stopWhen: isStepCount(5),
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({
        stream: result.stream,
        originalMessages: messages || [],
        onFinish: async ({ messages: allMessages }) => {
          const lastAssitantMessage = allMessages
            .filter((m) => m.role === "assistant")
            .pop();
          const textContent =
            lastAssitantMessage?.parts
              .filter((part) => part.type === "text")
              .map((part) => part.text)
              .join("") || "";

          if (incidentId && lastAssitantMessage) {
            try {
              await prisma.incidentMessage.create({
                data: {
                  incidentId,
                  role: "ASSISTANT",
                  messages: textContent,
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
      }),
    });
  } catch (error: any) {
    console.error("POST /api/agent error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

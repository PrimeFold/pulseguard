import {
  streamText,
  convertToModelMessages,
  createUIMessageStream,
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
    console.log("[AGENT API] 🚀 POST /api/agent request started");

    const rateLimit = await checkRateLimit(req);
    if (!rateLimit.success) {
      console.warn("[AGENT API] ⚠️ Rate limit exceeded");
      return new Response(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch (e) {
      console.warn("[AGENT API] Failed to parse JSON body:", e);
      body = {};
    }

    const { messages } = body;
    const organizationId =
      body.organizationId || req.nextUrl.searchParams.get("organizationId");
    const incidentId =
      body.incidentId || req.nextUrl.searchParams.get("incidentId");

    console.log("[AGENT API] Parameters:", {
      organizationId,
      incidentId,
      messagesCount: Array.isArray(messages) ? messages.length : 0,
    });

    if (!organizationId) {
      console.error("[AGENT API] ❌ Missing organizationId parameter");
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
      console.error(
        `[AGENT API] ❌ Organization not found for identifier: ${organizationId}`,
      );
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

    console.log(
      `[AGENT API] ✅ Resolved Organization: id=${org.id}, slug=${org.slug}`,
    );

    let incident = null;
    if (incidentId) {
      incident = await prisma.incident.findFirst({
        where: { id: incidentId, organizationId: org.id },
      });
      console.log(
        `[AGENT API] Incident lookup result: ${incident ? "Found (" + incident.id + ")" : "Not Found"}`,
      );
    }

    // Dynamic model resolution for organization
    let aiModel: any;
    try {
      aiModel = await getOrgLanguageModel(org.id);
      console.log("[AGENT API] ✅ Successfully resolved AI Model client");
    } catch (modelErr: any) {
      console.error("[AGENT API] ❌ Failed to resolve AI Model:", modelErr);
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

    // Convert messages safely
    let modelMessages: any[] = [];
    if (Array.isArray(messages) && messages.length > 0) {
      try {
        modelMessages = await convertToModelMessages(messages);
        console.log(
          `[AGENT API] convertToModelMessages produced ${modelMessages.length} messages`,
        );
      } catch (err) {
        console.warn(
          "[AGENT API] convertToModelMessages failed, using clean fallback:",
          err,
        );
      }
    }

    if (!Array.isArray(modelMessages) || modelMessages.length === 0) {
      modelMessages = (Array.isArray(messages) ? messages : [])
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

    if (modelMessages.length === 0) {
      modelMessages = [
        {
          role: "user",
          content:
            "Investigate this incident and check available telemetry logs.",
        },
      ];
    }

    console.log(
      "[AGENT API] Final modelMessages to streamText:",
      JSON.stringify(modelMessages),
    );

    const tools = createIncidentTools(org.id);
    console.log("[AGENT API] Tools initialized successfully");

    const stream = createUIMessageStream({
      execute: ({ writer }) => {
        let accumulatedText = "";

        const result = streamText({
          model: aiModel,
          system: `You are an Autonomous Site Reliability Engineer (SRE).
Investigate production incidents by:
1. Searching the organization runbook knowledge base using 'search_knowledge_base' to retrieve resolution steps.
2. Querying recent telemetry logs using 'query_telemetry_logs' around the timeframe.
3. Identifying the breaking file and fetching its code with 'fetch_repo_file'.
4. Providing root-cause analysis and creating a unified patch with 'propose_hotfix' and waiting for human approval.

CRITICAL RESPONSE REQUIREMENTS:
- You MUST ALWAYS emit a clear, detailed, and professional Markdown text response summarizing your technical analysis and diagnosis for the user.
- AFTER EVERY TOOL EXECUTION, YOU MUST IMMEDIATELY EXPLAIN THE FINDINGS FROM THE LOGS/RUNBOOKS AND PROVIDE YOUR TECHNICAL DIAGNOSIS. NEVER END YOUR TURN WITHOUT TEXT OUTPUT.`,
          messages: modelMessages,
          tools,
          maxSteps: 5,
          onChunk: ({ chunk }) => {
            if (chunk.type === "text-delta" && chunk.textDelta) {
              accumulatedText += chunk.textDelta;
            }
          },
          onError: ({ error }) => {
            console.error(
              "[AGENT API] ❌ Error during streamText execution:",
              error,
            );
            const errStr = String(error);
            if (
              errStr.includes("Quota exceeded") ||
              errStr.includes("RESOURCE_EXHAUSTED") ||
              errStr.includes("429")
            ) {
              try {
                const errId = "err-" + Date.now();
                writer.write({ type: "text-start", id: errId });
                writer.write({
                  type: "text-delta",
                  id: errId,
                  delta:
                    "\n\n> [!WARNING]\n> **Google Gemini API Quota Exceeded (429 Rate Limit)**\n> The shared Google Gemini free-tier daily request limit (20 req/day) has been reached.\n> Please go to **Settings ➔ Model Configuration** and enter your own API Key to continue.",
                });
                writer.write({ type: "text-end", id: errId });
              } catch (writeErr) {
                console.warn("[AGENT API] Could not write quota alert to stream:", writeErr);
              }
            }
          },
          onFinish: async ({ text }) => {
            console.log(
              "[AGENT API] 🏁 streamText finished. Emitted text length:",
              text?.length || accumulatedText.length,
            );

            const finalText = text || accumulatedText;

            if (incidentId && finalText) {
              try {
                await prisma.incidentMessage.create({
                  data: {
                    incidentId,
                    role: "ASSISTANT",
                    messages: finalText,
                  },
                });
                console.log(
                  "[AGENT API] Saved assistant incident message to DB",
                );
              } catch (err) {
                console.warn(
                  "[AGENT API] Failed to persist incident message:",
                  err,
                );
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
                console.log("[AGENT API] Saved agent execution record to DB");
              } catch (err) {
                console.warn("[AGENT API] Failed to log agent execution:", err);
              }
            }
          },
        });

        writer.merge(result.toUIMessageStream());
      },
    });

    console.log("[AGENT API] Returning createUIMessageStreamResponse stream");
    return createUIMessageStreamResponse({ stream });
  } catch (error: any) {
    console.error(
      "[AGENT API] ❌ UNCAUGHT EXCEPTION in POST /api/agent:",
      error,
    );
    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
        details: String(error),
        stack: error.stack || null,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

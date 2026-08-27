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
      return new Response(JSON.stringify({ error: "Too many requests" }), { status: 429 });
    }
    const { messages, organizationId, incidentId } = await req.json();

    if (!organizationId || !incidentId) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const [org, incident] = await Promise.all([
      prisma.organization.findUnique({ where: { id: organizationId } }),
      prisma.incident.findUnique({ where: { id: incidentId, organizationId } }),
    ]);

    if (!org || !incident) {
      return new Response(
        JSON.stringify({ error: "Organization or Incident not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Dynamic model resolution for organization
    const aiModel = await getOrgLanguageModel(org.id);

    //converting to model messages..
    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: aiModel,
      messages: [
        {
          role: "system",
          content: `You are an Autonomous Site Reliability Engineer (SRE).
            Investigate production incidents by:
            1. Querying recent ERROR/FATAL telemetry logs using 'query_telemetry_logs'.
            2. Identifying the breaking file and fetching its code with 'fetch_repo_file'.
            3. Providing root-cause analysis and creating a unified patch with 'propose_hotfix' and wait for human approval.`,
        },
        ...modelMessages,
      ],
      tools: createIncidentTools(org.id),
      stopWhen: isStepCount(5),
    });
    return createUIMessageStreamResponse({
      stream: toUIMessageStream({
        stream: result.stream,
        originalMessages: messages,
        //Using OnFinish for persistance i.e saving in database.

        onFinish: async ({ messages: allMessages }) => {
          // Extract the latest assistant message generated in this turn
          const lastAssitantMessage = allMessages
            .filter((m) => m.role === "assistant")
            .pop();
          const textContent =
            lastAssitantMessage?.parts
              .filter((part) => part.type === "text")
              .map((part) => part.text)
              .join("") || "";

          if (incidentId && lastAssitantMessage) {
            await prisma.incidentMessage.create({
              data: {
                incidentId,
                role: "ASSISTANT",
                messages: textContent,
              },
            });
          }

          await prisma.agentExecution.create({
            data: {
              organizationId: org.id,
              model: org.aiModel || "gemini-1.5-flash",
              incidentId: incidentId || null,
              totalTokens: 0, // result.usage might not be synchronously available here
              fingerprint: incident?.fingerprint || "manual-query",
            },
          });
        },
      }),
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

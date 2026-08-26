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

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, organizationId, incidentId } = await req.json();
    const TEXT_MODEL = process.env.TEXT_MODEL;
    if (!TEXT_MODEL) {
      return new Response(JSON.stringify({ error: "Model Missing" }));
    }

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

    //converting to model messages..
    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: google("gemini-3.5-flash"),
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
              model: String(process.env.TEXT_MODEL),
              incidentId: incidentId || null,
              totalTokens: Number(result.usage),
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

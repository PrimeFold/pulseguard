import { streamText } from 'ai';
import { createIncidentTools } from '@/lib/ai/tools';
import { google } from '@ai-sdk/google';


export async function POST(req: Request) {
  const { messages, organizationId } = await req.json();

  if (!organizationId) {
    return new Response(JSON.stringify({ error: 'Missing organizationId' }), {
      status: 400,
    });
  }

  // 1. Instantiate the toolset scoped to this specific workspace..
  const tools = createIncidentTools(organizationId);

  // 2. Execute the autonomous loop and stream the results
  const result = streamText({
    model: google("gemini-3.7-flash"),
    system: `You are an automated Site Reliability Engineering (SRE) agent.
        When diagnosing an incident:
        1. Inspect structured error logs using 'query_telemetry_logs' around the incident window.
        2. Read the flagged source code files using 'fetch_repo_file'.
        3. Formulate the fix and call 'propose_hotfix' so the team can review and approve the pull request.`,
    messages,
    tools,
  });

  // 3. Return as an AI SDK UI message stream
  return result.textStream;
}

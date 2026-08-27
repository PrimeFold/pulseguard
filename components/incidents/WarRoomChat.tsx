"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { DefaultChatTransport } from "ai";
import { Send, Bot, User, Sparkles, Terminal, FileCode } from "lucide-react";
import { useState, type ComponentType, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DiffApprovalCard } from "./DiffApprovalCard";

interface WarRoomChatProps {
  organizationId: string;
  incidentId: string;
  initialPrompt: string;
}

type IncidentTools = {
  query_telemetry_logs: { input: unknown; output: unknown };
  fetch_repo_file: { input: unknown; output: unknown };
  propose_hotfix: { input: unknown; output: unknown };
};

type IncidentUIMessage = UIMessage<
  unknown,
  Record<string, never>,
  IncidentTools
>;

const toolIcons: Record<
  keyof IncidentTools,
  ComponentType<{ className?: string }>
> = {
  query_telemetry_logs: Terminal,
  fetch_repo_file: FileCode,
  propose_hotfix: Sparkles,
} as const;

export function WarRoomChat({
  organizationId,
  incidentId,
  initialPrompt,
}: WarRoomChatProps) {
  const [input, setInput] = useState("");

  const initialMessages: IncidentUIMessage[] = [
    {
      id: "init-1",
      role: "user",
      parts: [{ type: "text", text: initialPrompt }],
    },
  ];

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/agent",
      body: {
        organizationId,
        incidentId,
      },
    }),
    messages: initialMessages,
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    await sendMessage({ text: trimmedInput });
    setInput("");
  };

  return (
    <div className="flex flex-col h-175 bg-black border border-border rounded-xl overflow-hidden">
      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 text-sm leading-relaxed ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {m.role !== "user" && (
              <div className="h-7 w-7 rounded-full bg-zinc-900 border border-border flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="h-4 w-4 text-zinc-100" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-lg p-3.5 ${
                m.role === "user"
                  ? "bg-white text-black font-sans"
                  : "bg-zinc-950 border border-border text-foreground font-sans"
              }`}
            >
              <div className="space-y-2 whitespace-pre-wrap">
                {m.parts?.map((part, index) => {
                  // 1. Render regular text
                  if (part.type === "text") {
                    return (
                      <div key={index} className="whitespace-pre-wrap">
                        {part.text}
                      </div>
                    );
                  }

                  // 2. Propose Hotfix -> Render Diff Approval Card
                  if (part.type === "tool-propose_hotfix") {
                    if (part.state === "output-available") {
                      const output = part.output as {
                        filePath: string;
                        patch: string;
                        explanation: string;
                      };

                      return (
                        <DiffApprovalCard
                          key={index}
                          organizationId={organizationId}
                          incidentId={incidentId}
                          filePath={output.filePath}
                          patch={output.patch}
                          explanation={output.explanation}
                        />
                      );
                    }
                  }

                  // 3. Status Badges for Telemetry Logs & GitHub File Fetch
                  if (
                    part.type === "tool-query_telemetry_logs" ||
                    part.type === "tool-fetch_repo_file" ||
                    part.type === "tool-propose_hotfix"
                  ) {
                    const isDone = part.state === "output-available";
                    const cleanName = part.type
                      .replace("tool-", "")
                      .replace(/_/g, " ");

                    return (
                      <div
                        key={index}
                        className="mt-2 flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-zinc-900 border border-border text-muted-foreground font-mono text-[11px]"
                      >
                        <span>
                          {cleanName}
                          {!isDone ? (
                            <span className="text-yellow-500 ml-1.5">
                              (running...)
                            </span>
                          ) : (
                            <span className="text-emerald-500 ml-1.5">✓</span>
                          )}
                        </span>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </div>

            {m.role === "user" && (
              <div className="h-7 w-7 rounded-full bg-zinc-900 border border-border flex items-center justify-center shrink-0 mt-0.5">
                <User className="h-4 w-4 text-zinc-100" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={handleSubmit}
        className="p-3 bg-black border-t border-border flex gap-2"
      >
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask agent to investigate further, query logs, or modify patch..."
          className="text-sm bg-zinc-950 border-border text-white focus-visible:ring-1 focus-visible:ring-zinc-700"
        />
        <Button
          size="sm"
          type="submit"
          disabled={status !== "ready"}
          className="gap-2 text-sm bg-white hover:bg-zinc-200 text-black border border-transparent font-medium"
        >
          <Send className="h-3.5 w-3.5" /> Send
        </Button>
      </form>
    </div>
  );
}

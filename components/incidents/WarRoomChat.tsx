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
    <div className="flex flex-col h-175 bg-card/30 border border-border/60 rounded-xl overflow-hidden backdrop-blur">
      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 text-xs leading-relaxed ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {m.role !== "user" && (
              <div className="h-6 w-6 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="h-3.5 w-3.5 text-purple-400" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-xl p-3.5 ${
                m.role === "user"
                  ? "bg-purple-600 text-white font-sans"
                  : "bg-muted/40 border border-border/40 text-foreground font-sans"
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
                        className="mt-2 flex items-center gap-2 px-2.5 py-1.5 rounded bg-zinc-950/60 border border-zinc-800 text-zinc-400 font-mono text-[11px]"
                      >
                        <span>
                          {cleanName}
                          {!isDone ? (
                            <span className="text-amber-400 ml-1.5">
                              (running...)
                            </span>
                          ) : (
                            <span className="text-emerald-400 ml-1.5">✓</span>
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
              <div className="h-6 w-6 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <User className="h-3.5 w-3.5 text-blue-400" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={handleSubmit}
        className="p-3 bg-background/50 border-t border-border/40 flex gap-2"
      >
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask agent to investigate further, query logs, or modify patch..."
          className="text-xs bg-muted/20 border-border/60"
        />
        <Button
          size="sm"
          type="submit"
          disabled={status !== "ready"}
          className="gap-1 text-xs bg-purple-600 hover:bg-purple-500 text-white"
        >
          <Send className="h-3 w-3" /> Send
        </Button>
      </form>
    </div>
  );
}

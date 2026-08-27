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
  search_knowledge_base: { input: { query: string }; output: Array<{ id: string; content: string; similarity: number }> };
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
  search_knowledge_base: BookOpen,
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
    <div className="flex flex-col h-175 bg-[#09090b] border border-zinc-800 rounded-none overflow-hidden">
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
              <div className="h-7 w-7 rounded-none bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="h-4 w-4 text-zinc-100" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-none p-3.5 ${
                m.role === "user"
                  ? "bg-white text-black font-mono font-medium text-xs border border-transparent"
                  : "bg-zinc-950/80 border border-zinc-800 text-zinc-100 font-sans"
              }`}
            >
              <div className="space-y-2 whitespace-pre-wrap">
                {m.parts?.map((part, index) => {
                  // 1. Render regular text
                  if (part.type === "text") {
                    return (
                      <div key={index} className="whitespace-pre-wrap text-xs leading-relaxed">
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

                  // 3. Render Semantic Knowledge Base / Runbook Results
                  if (part.type === "tool-search_knowledge_base") {
                    if (part.state === "output-available") {
                      const results = part.output;
                      return (
                        <div key={index} className="mt-3 space-y-2 font-mono">
                          <div className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 font-semibold">
                            <BookOpen className="h-3.5 w-3.5 text-emerald-500" /> Runbook Search Matches
                          </div>
                          {results.length === 0 ? (
                            <div className="text-[11px] text-zinc-600">No correlated runbooks discovered.</div>
                          ) : (
                            <div className="space-y-2">
                              {results.map((res) => (
                                <div key={res.id} className="p-3 bg-zinc-900/60 border border-zinc-800 text-[11px] space-y-1.5 rounded-none">
                                  <div className="flex items-center justify-between text-[9px] text-zinc-500">
                                    <span>REF: RUNBOOK_CHUNK_{res.id.slice(0, 6).toUpperCase()}</span>
                                    <span className="text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 px-1.5 py-0.5 rounded-none font-bold">
                                      {(res.similarity * 100).toFixed(1)}% RELEVANCE
                                    </span>
                                  </div>
                                  <p className="text-zinc-300 font-mono leading-relaxed select-all whitespace-pre-wrap">{res.content}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }
                  }

                  // 4. Status Badges for Running Tools
                  if (
                    part.type === "tool-query_telemetry_logs" ||
                    part.type === "tool-fetch_repo_file" ||
                    part.type === "tool-propose_hotfix" ||
                    part.type === "tool-search_knowledge_base"
                  ) {
                    const isDone = part.state === "output-available";
                    const cleanName = part.type
                      .replace("tool-", "")
                      .replace(/_/g, " ");

                    return (
                      <div
                        key={index}
                        className="mt-2 flex items-center gap-2 px-2.5 py-1.5 rounded-none bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-[10px]"
                      >
                        <span>
                          {cleanName.toUpperCase()}
                          {!isDone ? (
                            <span className="text-amber-500 ml-1.5 font-bold animate-pulse">
                              (RUNNING...)
                            </span>
                          ) : (
                            <span className="text-emerald-500 ml-1.5 font-bold">✓ DONE</span>
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
              <div className="h-7 w-7 rounded-none bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                <User className="h-4 w-4 text-zinc-100" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={handleSubmit}
        className="p-3 bg-black border-t border-zinc-800 flex gap-2"
      >
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask agent to investigate further, query logs, or modify patch..."
          className="text-xs bg-zinc-950 border-zinc-800 text-white rounded-none focus-visible:ring-1 focus-visible:ring-zinc-700"
        />
        <Button
          size="sm"
          type="submit"
          disabled={status !== "ready"}
          className="gap-2 text-[10px] bg-white hover:bg-zinc-200 text-black border border-transparent font-mono font-bold tracking-wide rounded-none active:scale-[0.98] transition-all cursor-pointer"
        >
          <Send className="h-3 w-3" /> SEND
        </Button>
      </form>
    </div>
  );
}

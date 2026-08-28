"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { DefaultChatTransport } from "ai";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Terminal,
  FileCode,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState, type FormEvent, useEffect, useRef } from "react";
import { DiffApprovalCard } from "./DiffApprovalCard";

interface WarRoomChatProps {
  organizationId: string;
  incidentId: string;
  initialPrompt: string;
  hasAiKey?: boolean;
}

type IncidentTools = {
  search_knowledge_base: {
    input: { query: string };
    output: Array<{ id: string; content: string; similarity: number }>;
  };
  query_telemetry_logs: { input: unknown; output: unknown };
  fetch_repo_file: { input: unknown; output: unknown };
  propose_hotfix: { input: unknown; output: unknown };
};

type IncidentUIMessage = UIMessage<
  unknown,
  Record<string, never>,
  IncidentTools
>;

const QUICK_PROMPTS = [
  {
    label: "Correlate Runbooks",
    prompt:
      "Search the knowledge base for any runbooks related to this incident.",
  },
  {
    label: "Scan Error Logs",
    prompt:
      "Query recent telemetry error logs for this service and summarize findings.",
  },
  {
    label: "Draft Hotfix Patch",
    prompt:
      "Inspect the affected repository files and propose an actionable hotfix patch.",
  },
  {
    label: "Explain Root Cause",
    prompt:
      "Break down the exact technical root cause of this incident step-by-step.",
  },
];

export function WarRoomChat({
  organizationId,
  incidentId,
  initialPrompt,
  hasAiKey = false,
}: WarRoomChatProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Auto scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (
    event?: FormEvent<HTMLFormElement>,
    customText?: string,
  ) => {
    if (event) event.preventDefault();

    const textToSend = customText || input.trim();
    if (!textToSend || status !== "ready") return;

    await sendMessage({ text: textToSend });
    if (!customText) setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-black border border-zinc-900 rounded-none overflow-hidden">
      {/* 1. Terminal Header Strip */}
      <div className="px-4 py-2 border-b border-zinc-900 bg-zinc-950/80 flex items-center justify-between font-mono text-[10px] shrink-0">
        <div className="flex items-center gap-2 text-zinc-400">
          <Terminal className="h-3 w-3 text-emerald-400" />
          <span className="text-zinc-200 font-semibold uppercase tracking-wider">
            SRE AGENT SESSION
          </span>
          <span className="text-zinc-700">|</span>
          <span className="text-zinc-500">ID: {incidentId.slice(0, 8)}</span>
        </div>
        <div className="flex items-center gap-2">
          {status !== "ready" ? (
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="h-1.5 w-1.5 rounded-none bg-amber-500 animate-pulse" />{" "}
              REASONING...
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-none bg-emerald-500" /> AGENT
              ONLINE
            </span>
          )}
        </div>
      </div>

      {/* 2. Message Feed or Empty State */}
      {!hasAiKey ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-zinc-950/30">
          <div className="h-12 w-12 border border-zinc-800 bg-zinc-950 flex items-center justify-center rounded-none text-zinc-500 mb-2">
            <Sparkles className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-mono font-bold tracking-widest text-zinc-300 uppercase">
            AI AGENT OFFLINE
          </h3>
          <p className="text-zinc-500 text-[11px] font-mono max-w-sm leading-relaxed">
            Please configure your AI Provider API Key in the Organization
            Settings to initialize the SRE agent.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2.5 leading-relaxed ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {m.role !== "user" && (
                <div className="h-5 w-5 rounded-none bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-3 w-3 text-zinc-300" />
                </div>
              )}

              <div
                className={`max-w-[88%] rounded-none p-3 ${
                  m.role === "user"
                    ? "bg-zinc-900 border border-zinc-800 text-white font-mono text-[11px]"
                    : "bg-black border border-zinc-900 text-zinc-200 font-sans text-[11px]"
                }`}
              >
                <div className="space-y-2 whitespace-pre-wrap">
                  {m.parts?.map((part, index) => {
                    // 1. Regular text
                    if (part.type === "text") {
                      return (
                        <div
                          key={index}
                          className="whitespace-pre-wrap leading-relaxed text-[11px]"
                        >
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
                          <div
                            key={index}
                            className="mt-2 space-y-1.5 font-mono"
                          >
                            <div className="text-[9px] text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 font-semibold">
                              <BookOpen className="h-3 w-3 text-emerald-400" />{" "}
                              RUNBOOK MATCHES
                            </div>
                            {results.length === 0 ? (
                              <div className="text-[10px] text-zinc-600">
                                No correlated runbooks discovered.
                              </div>
                            ) : (
                              <div className="space-y-1.5">
                                {results.map((res) => (
                                  <div
                                    key={res.id}
                                    className="p-2 bg-zinc-950 border border-zinc-900 text-[10px] space-y-1 rounded-none"
                                  >
                                    <div className="flex items-center justify-between text-[9px] text-zinc-500">
                                      <span>REF: {res.id.slice(0, 8)}</span>
                                      <span className="text-emerald-400 font-bold">
                                        {(res.similarity * 100).toFixed(0)}%
                                        MATCH
                                      </span>
                                    </div>
                                    <p className="text-zinc-300 font-mono text-[10px] leading-relaxed select-all">
                                      {res.content}
                                    </p>
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
                          className="mt-1.5 flex items-center gap-2 px-2 py-1 rounded-none bg-zinc-950 border border-zinc-900 text-zinc-400 font-mono text-[9px]"
                        >
                          <Sparkles className="h-3 w-3 text-zinc-500" />
                          <span className="uppercase">{cleanName}</span>
                          {!isDone ? (
                            <span className="text-amber-400 font-bold animate-pulse">
                              (EXECUTING...)
                            </span>
                          ) : (
                            <span className="text-emerald-400 font-bold">
                              ✓ DONE
                            </span>
                          )}
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>
              </div>

              {m.role === "user" && (
                <div className="h-5 w-5 rounded-none bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-3 w-3 text-zinc-300" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* 3. Quick Action Chips */}
      <div className="px-4 py-2 border-t border-zinc-900 bg-zinc-950/40 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
        <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider shrink-0">
          PROMPTS:
        </span>
        {QUICK_PROMPTS.map((qp) => (
          <button
            key={qp.label}
            type="button"
            disabled={status !== "ready" || !hasAiKey}
            onClick={() => handleSubmit(undefined, qp.prompt)}
            className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-[9px] font-mono whitespace-nowrap rounded-none transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer active:scale-95"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* 4. Input Form */}
      <form
        onSubmit={(e) => handleSubmit(e)}
        className="p-3 bg-black border-t border-zinc-900 shrink-0"
      >
        <div className="relative flex items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              hasAiKey
                ? "Instruct SRE agent to pull logs, scan repo, or draft PR..."
                : "AI Agent Disabled (No API Key)"
            }
            disabled={status !== "ready" || !hasAiKey}
            className="w-full bg-zinc-950 border border-zinc-900 text-white placeholder:text-zinc-600 text-[11px] font-mono py-2.5 pl-3.5 pr-10 rounded-none focus:outline-none focus:border-zinc-500 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={status !== "ready" || !input.trim() || !hasAiKey}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 flex items-center justify-center bg-white text-black rounded-none disabled:opacity-40 disabled:pointer-events-none hover:bg-zinc-200 active:scale-95 transition-all cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}

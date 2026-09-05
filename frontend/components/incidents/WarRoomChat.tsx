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
import { KnowledgeView } from "./KnowledgeView";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";

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
  const [activeTab, setActiveTab] = useState<"chat" | "knowledge">("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialMessages: IncidentUIMessage[] = [
    {
      id: "init-1",
      role: "user",
      parts: [{ type: "text", text: initialPrompt }],
    },
  ];

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: `/api/agent?organizationId=${encodeURIComponent(organizationId)}&incidentId=${encodeURIComponent(incidentId)}`,
      body: {
        organizationId,
        incidentId,
      },
    }),
    messages: initialMessages,
  });

  const isBusy = status === "submitted" || status === "streaming";

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
    if (!textToSend || isBusy || !hasAiKey) return;

    if (!customText) setInput("");
    await sendMessage({ text: textToSend });
  };

  return (
    <div className="flex flex-col h-full bg-black border border-zinc-900 rounded-none overflow-hidden relative">
      {/* 1. Terminal Header Strip */}
      <div className="px-0 py-0 border-b border-zinc-900 bg-zinc-950/80 flex items-center justify-between font-mono text-xs shrink-0 h-10 sm:h-11">
        <div className="flex items-center h-full">
          <div className="flex items-center gap-2 text-zinc-300 px-3 sm:px-4 h-full border-r border-zinc-900 font-medium">
            <Terminal className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-zinc-200 font-semibold uppercase tracking-wider hidden sm:inline">
              SRE AGENT
            </span>
            <span className="text-zinc-500 ml-1">ID:{incidentId.slice(0, 8)}</span>
          </div>
          
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("chat");
            }}
            className={`h-full px-3.5 sm:px-4 flex items-center gap-1.5 transition-colors cursor-pointer border-r border-zinc-900 font-medium ${
              activeTab === "chat"
                ? "bg-zinc-900/80 text-emerald-400 font-bold"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30"
            }`}
          >
            CHAT
          </button>
          
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("knowledge");
            }}
            className={`h-full px-3.5 sm:px-4 flex items-center gap-1.5 transition-colors cursor-pointer border-r border-zinc-900 font-medium ${
              activeTab === "knowledge"
                ? "bg-zinc-900/80 text-emerald-400 font-bold"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">KNOWLEDGE</span>
          </button>
        </div>
        <div className="flex items-center gap-2 px-3 sm:px-4">
          {isBusy ? (
            <span className="flex items-center gap-1.5 text-amber-400 font-mono text-xs">
              <span className="h-2 w-2 rounded-none bg-amber-500 animate-pulse" />{" "}
              REASONING...
            </span>
          ) : error ? (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex items-center gap-1.5 text-red-400 hover:text-red-300 underline cursor-pointer font-mono text-xs"
            >
              <span className="h-2 w-2 rounded-none bg-red-500" /> RETRY LAST
            </button>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-400 font-mono text-xs">
              <span className="h-2 w-2 rounded-none bg-emerald-500" /> AGENT ONLINE
            </span>
          )}
        </div>
      </div>

      {activeTab === "chat" ? (
        <>
          {/* 2. Message Feed or Empty State */}
          {!hasAiKey ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 text-center space-y-4 bg-zinc-950/30">
              <div className="h-14 w-14 border border-zinc-800 bg-zinc-950 flex items-center justify-center rounded-none text-zinc-400 mb-2">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-base font-mono font-bold tracking-widest text-zinc-200 uppercase">
                AI AGENT OFFLINE
              </h3>
              <p className="text-zinc-400 text-xs sm:text-sm font-mono max-w-md leading-relaxed">
                Please configure your AI Provider API Key in the Organization
                Settings to initialize the autonomous SRE agent.
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 leading-relaxed ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {m.role !== "user" && (
                    <div className="h-6 w-6 rounded-none bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="h-3.5 w-3.5 text-zinc-300" />
                    </div>
                  )}

                  <div
                    className={`max-w-[92%] sm:max-w-[85%] rounded-none p-3.5 sm:p-4 ${
                      m.role === "user"
                        ? "bg-zinc-900 border border-zinc-800 text-white font-mono text-xs sm:text-sm"
                        : "bg-black border border-zinc-900 text-zinc-200 font-sans text-xs sm:text-sm"
                    }`}
                  >
                    <div className="space-y-2.5">
                      {(!m.parts || m.parts.length === 0) && (m as any).content && (
                        m.role === "user" ? (
                          <div className="whitespace-pre-wrap leading-relaxed text-xs sm:text-sm font-mono text-zinc-100">
                            {(m as any).content}
                          </div>
                        ) : (
                          <MarkdownRenderer
                            content={(m as any).content}
                            className="text-xs sm:text-sm"
                          />
                        )
                      )}
                      {m.parts?.map((part, index) => {
                        // 1. Regular text
                        if (part.type === "text") {
                          return m.role === "user" ? (
                            <div
                              key={index}
                              className="whitespace-pre-wrap leading-relaxed text-xs sm:text-sm font-mono text-zinc-100"
                            >
                              {part.text}
                            </div>
                          ) : (
                            <MarkdownRenderer
                              key={index}
                              content={part.text}
                              className="text-xs sm:text-sm"
                            />
                          );
                        }

                        // 2. Propose Hotfix -> Render Diff Approval Card
                        if (part.type === "tool-propose_hotfix") {
                          if (part.state === "output-available") {
                            const output = part.output as any;
                            if (
                              !output ||
                              typeof output !== "object" ||
                              !output.proposal
                            ) {
                              return null;
                            }

                            const proposal = output.proposal;

                            return (
                              <DiffApprovalCard
                                key={index}
                                organizationId={organizationId}
                                incidentId={incidentId}
                                filePath={proposal.filePath || "patch.diff"}
                                patch={proposal.updatedContent}
                                explanation={proposal.prBody || ""}
                              />
                            );
                          }
                        }

                        // 3. Render Semantic Knowledge Base / Runbook Results
                        if (part.type === "tool-search_knowledge_base") {
                          if (part.state === "output-available") {
                            const rawOutput: any = part.output;
                            const hasError =
                              rawOutput &&
                              typeof rawOutput === "object" &&
                              "error" in rawOutput;
                            const results: any[] = Array.isArray(rawOutput)
                              ? rawOutput
                              : Array.isArray(rawOutput?.results)
                                ? rawOutput.results
                                : [];

                            return (
                              <div
                                key={index}
                                className="mt-3 space-y-2 font-mono"
                              >
                                <div className="text-xs text-zinc-400 uppercase tracking-wider flex items-center gap-2 font-semibold">
                                  <BookOpen className="h-3.5 w-3.5 text-emerald-400" />{" "}
                                  RUNBOOK MATCHES
                                </div>
                                {hasError ? (
                                  <div className="text-xs text-zinc-400 bg-zinc-950 border border-zinc-900 p-2.5">
                                    No correlated runbook indexed ({rawOutput.error}
                                    )
                                  </div>
                                ) : results.length === 0 ? (
                                  <div className="text-xs text-zinc-500">
                                    No correlated runbooks discovered.
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {results.map((res: any, rIdx: number) => (
                                      <div
                                        key={res.id || rIdx}
                                        className="p-3 bg-zinc-950 border border-zinc-900 text-xs space-y-1.5 rounded-none"
                                      >
                                        <div className="flex items-center justify-between text-[10px] sm:text-xs text-zinc-500">
                                          <span className="text-zinc-400 font-medium">
                                            REF:{" "}
                                            {res.id
                                              ? String(res.id).slice(0, 8)
                                              : `DOC-${rIdx + 1}`}
                                          </span>
                                          {typeof res.similarity === "number" && (
                                            <span className="text-emerald-400 font-bold">
                                              {(res.similarity * 100).toFixed(0)}%
                                              MATCH
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-zinc-200 font-mono text-xs leading-relaxed select-all">
                                          {res.content || JSON.stringify(res)}
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
                              className="mt-2 flex items-center gap-2 px-2.5 py-1.5 rounded-none bg-zinc-950 border border-zinc-900 text-zinc-300 font-mono text-xs"
                            >
                              <Sparkles className="h-3.5 w-3.5 text-zinc-400" />
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
                    <div className="h-6 w-6 rounded-none bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="h-3.5 w-3.5 text-zinc-300" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* 3. Quick Action Chips */}
          <div className="px-4 py-2.5 border-t border-zinc-900 bg-zinc-950/60 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider shrink-0 font-medium">
              PROMPTS:
            </span>
            {QUICK_PROMPTS.map((qp) => (
              <button
                key={qp.label}
                type="button"
                disabled={isBusy || !hasAiKey}
                onClick={() => handleSubmit(undefined, qp.prompt)}
                className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-mono whitespace-nowrap rounded-none transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer active:scale-95"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* 4. Input Form */}
          <form
            onSubmit={(e) => handleSubmit(e)}
            className="p-3 sm:p-4 bg-black border-t border-zinc-900 shrink-0"
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
                disabled={isBusy || !hasAiKey}
                className="w-full bg-zinc-950 border border-zinc-900 text-white placeholder:text-zinc-500 text-xs sm:text-sm font-mono py-3 pl-4 pr-12 rounded-none focus:outline-none focus:border-zinc-500 transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isBusy || !input.trim() || !hasAiKey}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center bg-white text-black rounded-none disabled:opacity-40 disabled:pointer-events-none hover:bg-zinc-200 active:scale-95 transition-all cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </>
      ) : (
        <KnowledgeView organizationId={organizationId} />
      )}
    </div>
  );
}

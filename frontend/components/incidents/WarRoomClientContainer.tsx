"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Terminal,
  Radio,
  Code2,
  FileText,
  Clock,
  Activity,
} from "lucide-react";
import { WarRoomChat } from "@/components/incidents/WarRoomChat";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";

interface IncidentData {
  id: string;
  title: string;
  service: string;
  severity: string;
  status: string;
  createdAt: Date | string;
  description: string | null;
  fingerprint: string | null;
  errorPayload: any;
  rootCauseAnalysis: string | null;
}

interface WarRoomClientContainerProps {
  orgSlug: string;
  orgId: string;
  hasAiKey: boolean;
  incident: IncidentData;
  initialPrompt: string;
}

export function WarRoomClientContainer({
  orgSlug,
  orgId,
  hasAiKey,
  incident,
  initialPrompt,
}: WarRoomClientContainerProps) {
  const [mobileTab, setMobileTab] = useState<"agent" | "diagnostics">("agent");

  return (
    <div className="h-[calc(100dvh-7.5rem)] sm:h-[calc(100dvh-8rem)] flex flex-col space-y-3">
      {/* 1. SRE Incident HUD Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-900 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href={`/${orgSlug}/incidents`}
            prefetch={true}
            className="p-2 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <span
                className={`h-2.5 w-2.5 shrink-0 ${
                  incident.status === "OPEN"
                    ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"
                    : "bg-emerald-500"
                }`}
              />
              <h1 className="text-sm sm:text-base lg:text-lg font-mono font-bold tracking-tight text-white uppercase truncate max-w-xl">
                {incident.title}
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono text-zinc-400 uppercase flex-wrap">
              <span className="text-zinc-200 font-medium">SERVICE: {incident.service}</span>
              <span className="text-zinc-600">/</span>
              <span
                className={
                  incident.severity === "CRITICAL"
                    ? "text-red-400 font-bold"
                    : "text-amber-400 font-medium"
                }
              >
                SEV: {incident.severity}
              </span>
              <span className="text-zinc-600">/</span>
              <span className={incident.status === "OPEN" ? "text-red-400" : "text-emerald-400"}>
                STATUS: {incident.status}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-zinc-400 bg-zinc-950 border border-zinc-900 px-2.5 py-1">
            ID: {incident.id.slice(0, 10)}
          </span>
          <span
            className="text-zinc-400 bg-zinc-950 border border-zinc-900 px-2.5 py-1 flex items-center gap-1.5"
            suppressHydrationWarning
          >
            <Clock className="h-3 w-3 text-zinc-500" />
            {new Date(incident.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      {/* Mobile/Tablet Segmented Switch (< lg) */}
      <div className="flex lg:hidden items-center border border-zinc-900 bg-black shrink-0">
        <button
          type="button"
          onClick={() => setMobileTab("agent")}
          className={`flex-1 py-2 text-xs font-mono font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 ${
            mobileTab === "agent"
              ? "bg-zinc-900 text-emerald-400 border-b-2 border-emerald-500"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Terminal className="h-3.5 w-3.5" />
          SRE AGENT
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("diagnostics")}
          className={`flex-1 py-2 text-xs font-mono font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 ${
            mobileTab === "diagnostics"
              ? "bg-zinc-900 text-emerald-400 border-b-2 border-emerald-500"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Activity className="h-3.5 w-3.5" />
          DIAGNOSTICS & PAYLOAD
        </button>
      </div>

      {/* 2. Main Interface: Dual Column on Desktop (lg:grid), Tabbed on Mobile/Tablet */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
        {/* Left Side: Telemetry Context & Diagnostics (Visible on lg or when mobileTab === 'diagnostics') */}
        <div
          className={`${
            mobileTab === "diagnostics" ? "flex" : "hidden"
          } lg:flex lg:col-span-4 flex-col border border-zinc-900 bg-zinc-950/60 overflow-hidden font-mono text-xs h-full`}
        >
          <div className="p-3.5 border-b border-zinc-900 bg-zinc-950 flex items-center justify-between text-xs text-zinc-300 uppercase tracking-wider shrink-0 font-medium">
            <div className="flex items-center gap-2">
              <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
              <span>Incident Diagnostics</span>
            </div>
            <span className="text-zinc-500 font-bold">LIVE TELEMETRY</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin">
            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest block font-medium">
                Incident Summary
              </label>
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                {incident.description ||
                  "Automated anomaly threshold triggered by telemetry collector."}
              </p>
            </div>

            {/* Service & Fingerprint */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest block font-medium">
                Error Signature
              </label>
              <div className="p-2.5 bg-black border border-zinc-900 text-zinc-300 text-xs font-mono break-all select-all">
                {incident.fingerprint ||
                  "GENERIC_SIG_" + incident.id.slice(0, 8)}
              </div>
            </div>

            {/* Error Payload JSON Preview */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 font-medium">
                <Code2 className="h-3.5 w-3.5 text-zinc-400" /> Error Payload
              </label>
              <div className="p-3 bg-black border border-zinc-900 text-xs text-red-400 font-mono overflow-x-auto max-h-56 scrollbar-thin select-all">
                <pre>{JSON.stringify(incident.errorPayload, null, 2)}</pre>
              </div>
            </div>

            {/* RCA if present */}
            {incident.rootCauseAnalysis && (
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 font-medium">
                  <FileText className="h-3.5 w-3.5 text-emerald-400" /> Root Cause
                  Analysis
                </label>
                <div className="p-3 bg-black border border-zinc-900 text-zinc-200 max-h-56 overflow-y-auto scrollbar-thin text-xs">
                  <MarkdownRenderer content={incident.rootCauseAnalysis} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Agent Terminal (Visible on lg or when mobileTab === 'agent') */}
        <div
          className={`${
            mobileTab === "agent" ? "flex" : "hidden"
          } lg:flex lg:col-span-8 flex-col h-full min-h-0`}
        >
          <WarRoomChat
            organizationId={orgId}
            incidentId={incident.id}
            initialPrompt={initialPrompt}
            hasAiKey={hasAiKey}
          />
        </div>
      </div>
    </div>
  );
}

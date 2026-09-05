import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/auth";
import { WarRoomChat } from "@/components/incidents/WarRoomChat";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { getOrganizationAndMembership } from "@/lib/tenant";
import {
  ArrowLeft,
  Server,
  Flame,
  Clock,
  Code2,
  FileText,
  Radio,
} from "lucide-react";

interface Props {
  params: Promise<{ orgSlug: string; id: string }>;
}

export default async function IncidentPage({ params }: Props) {
  const { orgSlug, id: incidentId } = await params;
  const { org } = await getOrganizationAndMembership(orgSlug);

  const incident = await prisma.incident.findUnique({
    where: { id: incidentId, organizationId: org.id },
  });

  if (!incident) {
    notFound();
  }

  const initialPrompt = `Investigate the incident for service "${incident.service}". Signature: ${incident.fingerprint || "None"}. Analyze the logs and propose a fix.`;

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col space-y-3">
      {/* 1. Compact HUD Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-900 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href={`/${orgSlug}/incidents`}
            prefetch={true}
            className="p-1.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-none ${
                  incident.status === "OPEN"
                    ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"
                    : "bg-emerald-500"
                }`}
              />
              <h1 className="text-base font-mono font-bold tracking-tight text-white uppercase truncate max-w-xl">
                {incident.title}
              </h1>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500 uppercase">
              <span className="text-zinc-300">SERVICE: {incident.service}</span>
              <span>/</span>
              <span
                className={
                  incident.severity === "CRITICAL"
                    ? "text-red-400 font-bold"
                    : "text-amber-400"
                }
              >
                SEV: {incident.severity}
              </span>
              <span>/</span>
              <span className="text-zinc-400">STATUS: {incident.status}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="text-zinc-500 bg-zinc-950 border border-zinc-900 px-2 py-1">
            ID: {incident.id.slice(0, 10)}
          </span>
          <span
            className="text-zinc-500 bg-zinc-950 border border-zinc-900 px-2 py-1 flex items-center gap-1"
            suppressHydrationWarning
          >
            <Clock className="h-2.5 w-2.5" />
            {new Date(incident.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      {/* 2. Main 2-Column War Room Interface */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
        {/* Left Side: Telemetry Context & Diagnostics (4 Cols) */}
        <div className="hidden lg:flex lg:col-span-4 flex-col border border-zinc-900 bg-zinc-950/60 overflow-hidden font-mono text-xs">
          <div className="p-3 border-b border-zinc-900 bg-zinc-950 flex items-center justify-between text-[10px] text-zinc-400 uppercase tracking-wider shrink-0">
            <div className="flex items-center gap-2">
              <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
              <span>Incident Diagnostics</span>
            </div>
            <span className="text-zinc-600">LIVE</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3.5 space-y-4 scrollbar-thin">
            {/* Description */}
            <div className="space-y-1">
              <label className="text-[9px] text-zinc-500 uppercase tracking-widest block">
                Incident Summary
              </label>
              <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                {incident.description ||
                  "Automated anomaly threshold triggered by telemetry collector."}
              </p>
            </div>

            {/* Service & Fingerprint */}
            <div className="space-y-1">
              <label className="text-[9px] text-zinc-500 uppercase tracking-widest block">
                Error Signature
              </label>
              <div className="p-2 bg-black border border-zinc-900 text-zinc-300 text-[10px] font-mono break-all select-all">
                {incident.fingerprint ||
                  "GENERIC_SIG_" + incident.id.slice(0, 8)}
              </div>
            </div>

            {/* Error Payload JSON Preview */}
            <div className="space-y-1">
              <label className="text-[9px] text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                <Code2 className="h-3 w-3" /> Error Payload
              </label>
              <div className="p-2.5 bg-black border border-zinc-900 text-[10px] text-red-400 font-mono overflow-x-auto max-h-44 scrollbar-thin select-all">
                <pre>{JSON.stringify(incident.errorPayload, null, 2)}</pre>
              </div>
            </div>

            {/* RCA if present */}
            {incident.rootCauseAnalysis && (
              <div className="space-y-1">
                <label className="text-[9px] text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                  <FileText className="h-3 w-3 text-emerald-400" /> Root Cause
                  Analysis
                </label>
                <div className="p-3 bg-black border border-zinc-900 text-zinc-300 max-h-48 overflow-y-auto scrollbar-thin">
                  <MarkdownRenderer content={incident.rootCauseAnalysis} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Agent Terminal (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col h-full min-h-0">
          <WarRoomChat
            organizationId={org.id}
            incidentId={incidentId}
            initialPrompt={initialPrompt}
            hasAiKey={!!org.aiApiKeyEncrypted}
          />
        </div>
      </div>
    </div>
  );
}

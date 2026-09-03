"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Terminal, GitPullRequest } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const LOG_SEQUENCE = [
  {
    time: "08:42:01.129",
    type: "INGEST",
    color: "text-emerald-400",
    text: 'Ingested 14 error logs for microservice "billing-service"',
  },
  {
    time: "08:42:01.340",
    type: "CLUSTER",
    color: "text-yellow-400",
    text: "Fingerprint #a9f8b7c6d5e4 reached threshold >= 3 in 3m window",
  },
  {
    time: "08:42:01.512",
    type: "INCIDENT_OPEN",
    color: "text-red-400",
    text: "War Room #inc_89491 opened — SRE Agent Initialized",
  },
  {
    time: "08:42:01.780",
    type: "AGENT_TOOL",
    color: "text-blue-400",
    text: '> query_telemetry_logs(service="billing-service", level="ERROR")',
  },
  {
    time: "08:42:02.105",
    type: "AGENT_TOOL",
    color: "text-purple-400",
    text: '> fetch_repo_file(path="src/billing/stripe.ts", ref="main")',
  },
  {
    time: "08:42:02.490",
    type: "PROPOSAL",
    color: "text-emerald-400",
    text: '> propose_hotfix(path="src/billing/stripe.ts", fix="Null check customer ID")',
  },
];

export function AnimatedHeroTerminal() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 4 });

      tl.from(".log-row", {
        opacity: 0,
        x: -4,
        stagger: 0.8,
        duration: 0.3,
        ease: "power1.out",
      });

      tl.from(
        ".approval-card",
        {
          opacity: 0,
          y: 6,
          duration: 0.4,
          ease: "power2.out",
        },
        "+=0.3",
      );
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="border border-zinc-800 bg-black shadow-2xl rounded-none overflow-hidden"
    >
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 py-2 text-[11px] font-mono text-zinc-400">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 bg-zinc-800 border border-zinc-700 inline-block" />
          <span className="h-1.5 w-1.5 bg-zinc-800 border border-zinc-700 inline-block" />
          <span className="h-1.5 w-1.5 bg-zinc-800 border border-zinc-700 inline-block" />
          <span className="ml-1 text-zinc-400">
            pulseguard-agent://cluster-iad-01
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-none animate-pulse" />
            LIVE SRE STREAM
          </span>
          <span>•</span>
          <span>AES-256</span>
          <span>•</span>
          <span>REDIS_CACHE_READY</span>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="p-4 font-mono text-[11px] space-y-2 bg-[#050505] min-h-[220px] overflow-x-auto select-none">
        {LOG_SEQUENCE.map((log, idx) => (
          <div
            key={idx}
            className="log-row flex items-center gap-2 text-zinc-400"
          >
            <span className="text-zinc-600">[{log.time}]</span>
            <span className={`font-semibold ${log.color}`}>{log.type}:</span>
            <span className="text-zinc-300">{log.text}</span>
          </div>
        ))}

        <div className="approval-card mt-3 border border-zinc-800 bg-zinc-950 p-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 rounded-none">
          <div>
            <div className="flex items-center gap-1.5">
              <GitPullRequest className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-zinc-200 font-semibold">
                PR Hotfix Proposal Ready
              </span>
            </div>
            <span className="text-zinc-500 block text-[10px] font-mono mt-0.5">
              Branch:{" "}
              <code className="text-zinc-300">
                hotfix/fix-billing-npe-89491
              </code>{" "}
              &bull; 1 file changed (+4, -1)
            </span>
          </div>
          <Badge
            variant="outline"
            className="bg-emerald-950/40 border-emerald-800/60 text-emerald-400 rounded-none text-[9px] font-mono uppercase tracking-wider py-0.5 px-1.5"
          >
            Requires Human Approval
          </Badge>
        </div>
      </div>
    </div>
  );
}

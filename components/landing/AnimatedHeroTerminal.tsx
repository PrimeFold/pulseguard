"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Terminal, ShieldAlert, Cpu, Check, GitPullRequest, ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const LOG_SEQUENCE = [
  {
    time: "08:42:01.129",
    type: "INGEST",
    color: "text-emerald-400",
    text: "Ingested 14 error logs for microservice \"billing-service\"",
  },
  {
    time: "08:42:01.340",
    type: "CLUSTER",
    color: "text-yellow-400",
    text: "Fingerprint #a9f8b7c6d5e4 reached threshold >= 3 in 3m window",
  },
  {
    time: "08:42:01.512",
    type: "INCIDENT_TRIGGERED",
    color: "text-red-400",
    text: "War Room #inc_89491 opened — SRE Agent Initialized",
  },
  {
    time: "08:42:01.780",
    type: "AGENT_TOOL",
    color: "text-blue-400",
    text: "> query_telemetry_logs(service=\"billing-service\", level=\"ERROR\")",
  },
  {
    time: "08:42:02.105",
    type: "AGENT_TOOL",
    color: "text-purple-400",
    text: "> fetch_repo_file(path=\"src/billing/stripe.ts\", ref=\"main\")",
  },
  {
    time: "08:42:02.490",
    type: "PROPOSAL",
    color: "text-emerald-400",
    text: "> propose_hotfix(path=\"src/billing/stripe.ts\", fix=\"Null check customer ID\")",
  },
];

export function AnimatedHeroTerminal() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev < LOG_SEQUENCE.length ? prev + 1 : prev));
    }, 900);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="border border-zinc-800 bg-black shadow-2xl rounded-none overflow-hidden">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs font-mono text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 bg-zinc-800 border border-zinc-700 inline-block" />
          <span className="h-2 w-2 bg-zinc-800 border border-zinc-700 inline-block" />
          <span className="h-2 w-2 bg-zinc-800 border border-zinc-700 inline-block" />
          <span className="ml-2 text-zinc-300">pulseguard-agent://cluster-iad-01</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
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
      <div className="p-4 sm:p-6 font-mono text-xs space-y-2.5 bg-[#050505] min-h-[260px] overflow-x-auto">
        <AnimatePresence>
          {LOG_SEQUENCE.slice(0, activeStep).map((log, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-2.5 text-zinc-400"
            >
              <span className="text-zinc-600">[{log.time}]</span>
              <span className={`font-semibold ${log.color}`}>{log.type}:</span>
              <span className="text-zinc-300">{log.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>

        {activeStep >= LOG_SEQUENCE.length && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="mt-4 border border-zinc-800 bg-zinc-950 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-none"
          >
            <div>
              <div className="flex items-center gap-2">
                <GitPullRequest className="h-4 w-4 text-emerald-400" />
                <span className="text-zinc-100 font-semibold">PR Hotfix Proposal Ready</span>
              </div>
              <span className="text-zinc-500 block text-[11px] font-mono mt-0.5">
                Branch: <code className="text-zinc-300">hotfix/fix-billing-npe-89491</code> &bull; 1 file changed (+4, -1)
              </span>
            </div>
            <Badge variant="outline" className="bg-emerald-950/40 border-emerald-800/60 text-emerald-400 rounded-none text-[10px] font-mono uppercase tracking-wider">
              Requires Human Approval
            </Badge>
          </motion.div>
        )}
      </div>
    </div>
  );
}

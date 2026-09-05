"use client";

import { useRef } from "react";
import {
  Flame,
  Cpu,
  GitPullRequest,
  Database,
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  Code2,
  CheckCircle2,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export function BentoArchitectureGrid() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(".bento-item", {
        opacity: 0,
        y: 16,
        stagger: 0.1,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        },
      });
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left font-sans"
    >
      {/* 1. Large Card (Span 2): Deterministic Anomaly Ingestion */}
      <div className="bento-item md:col-span-2 p-2 sm:p-2.5 rounded-2xl bg-gradient-to-b from-zinc-800/40 via-zinc-900/30 to-black/80 border border-white/10 shadow-lg relative group">
        <div className="h-full rounded-xl border border-zinc-850 bg-black/95 p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-9 w-9 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-red-400">
                <Flame className="h-5 w-5 animate-pulse" />
              </div>
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest bg-zinc-950 px-2.5 py-1 border border-zinc-850">
                SUB-2MS INGESTION
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-mono font-bold text-white uppercase tracking-tight">
              Deterministic Anomaly Ingestion & Fingerprinting
            </h3>
            <p className="text-sm text-zinc-400 font-sans leading-relaxed max-w-xl">
              Production microservices flood SREs with repetitive stack traces. PulseGuard strips dynamic variables
              (timestamps, UUIDs, hostnames) to compute an immutable SHA-256 fingerprint, grouping 10,000 noisy events
              into a single actionable incident.
            </p>
          </div>

          {/* Visual Code Mockup */}
          <div className="rounded-lg bg-zinc-950 border border-zinc-850 p-3.5 font-mono text-xs space-y-2 select-all">
            <div className="flex items-center justify-between text-[11px] text-zinc-500 border-b border-zinc-900 pb-1.5">
              <span>POST /api/telemetry/ingest</span>
              <span className="text-emerald-400 font-semibold">200 OK • 1.4ms</span>
            </div>
            <div className="text-zinc-400 text-xs">
              <span className="text-zinc-600">// Raw Log Payload:</span>
              <br />
              <code className="text-red-400">
                Error: Pool exhausted (pid 9104) at /srv/checkout/redis.ts:84
              </code>
            </div>
            <div className="text-zinc-300 text-xs pt-1 flex items-center gap-2">
              <span className="text-zinc-500">&rarr; Fingerprint:</span>
              <code className="bg-zinc-900 px-2 py-0.5 text-emerald-400 font-bold border border-zinc-800">
                SIG_REDIS_CONN_POOL_89491
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Standard Card (Span 1): Multi-Model AI Orchestrator */}
      <div className="bento-item md:col-span-1 p-2 sm:p-2.5 rounded-2xl bg-gradient-to-b from-zinc-800/40 via-zinc-900/30 to-black/80 border border-white/10 shadow-lg relative group">
        <div className="h-full rounded-xl border border-zinc-850 bg-black/95 p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-9 w-9 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
                <Cpu className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest bg-emerald-950/30 border border-emerald-900/50 px-2 py-0.5">
                BYOM
              </span>
            </div>

            <h3 className="text-lg font-mono font-bold text-white uppercase tracking-tight">
              Multi-Model AI Orchestration
            </h3>
            <p className="text-sm text-zinc-400 font-sans leading-relaxed">
              Connect Google Gemini, Anthropic Claude, OpenAI, or DeepSeek. Organizations store encrypted API keys with
              zero vendor lock-in.
            </p>
          </div>

          {/* Model Badges */}
          <div className="space-y-2 pt-2 border-t border-zinc-900 font-mono text-xs">
            <div className="flex items-center justify-between text-zinc-300 py-1">
              <span>Google Gemini 2.5</span>
              <span className="text-emerald-400 text-[11px]">OPTIMIZED</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400 py-1">
              <span>Claude 3.5 Sonnet</span>
              <span className="text-zinc-600 text-[11px]">SUPPORTED</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400 py-1">
              <span>OpenAI GPT-4o</span>
              <span className="text-zinc-600 text-[11px]">SUPPORTED</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Standard Card (Span 1): pgvector Semantic Runbook RAG */}
      <div className="bento-item md:col-span-1 p-2 sm:p-2.5 rounded-2xl bg-gradient-to-b from-zinc-800/40 via-zinc-900/30 to-black/80 border border-white/10 shadow-lg relative group">
        <div className="h-full rounded-xl border border-zinc-850 bg-black/95 p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-9 w-9 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-blue-400">
                <Database className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-mono text-blue-400 uppercase tracking-widest bg-blue-950/30 border border-blue-900/50 px-2 py-0.5">
                PGVECTOR
              </span>
            </div>

            <h3 className="text-lg font-mono font-bold text-white uppercase tracking-tight">
              Semantic Runbook Vector RAG
            </h3>
            <p className="text-sm text-zinc-400 font-sans leading-relaxed">
              Upload PDF manuals and markdown docs. PulseGuard indexes them into sliced 736-D embeddings, matching
              anomalies against company documentation in milliseconds.
            </p>
          </div>

          <div className="p-3 bg-zinc-950 border border-zinc-850 font-mono text-xs space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-zinc-500">
              <span>MATCHED RUNBOOK:</span>
              <span className="text-emerald-400 font-bold">94% SIMILAR</span>
            </div>
            <p className="text-zinc-300 text-xs truncate">
              runbooks/checkout/redis-failover.md
            </p>
          </div>
        </div>
      </div>

      {/* 4. Large Card (Span 2): Human-in-the-Loop GitHub PR Engine */}
      <div className="bento-item md:col-span-2 p-2 sm:p-2.5 rounded-2xl bg-gradient-to-b from-zinc-800/40 via-zinc-900/30 to-black/80 border border-white/10 shadow-lg relative group">
        <div className="h-full rounded-xl border border-zinc-850 bg-black/95 p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-9 w-9 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
                <GitPullRequest className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest bg-emerald-950/30 border border-emerald-900/50 px-2 py-0.5">
                ZERO AUTO-MERGE
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-mono font-bold text-white uppercase tracking-tight">
              Human-in-the-Loop Remediation Engine
            </h3>
            <p className="text-sm text-zinc-400 font-sans leading-relaxed max-w-xl">
              AI agents inspect affected repository files, draft AST-accurate patches, and package them as GitHub pull
              requests. Critical safety: no code is ever pushed or merged without explicit human engineer sign-off.
            </p>
          </div>

          {/* PR Flow Visualizer */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3 bg-zinc-950 border border-zinc-850 space-y-1">
              <span className="text-[10px] text-zinc-500 block">STEP 01</span>
              <span className="text-zinc-200 font-semibold block">AST File Analysis</span>
              <p className="text-[11px] text-zinc-400 font-sans">Scans affected GitHub repository files.</p>
            </div>
            <div className="p-3 bg-zinc-950 border border-zinc-850 space-y-1">
              <span className="text-[10px] text-zinc-500 block">STEP 02</span>
              <span className="text-zinc-200 font-semibold block">Diff Generation</span>
              <p className="text-[11px] text-zinc-400 font-sans">Drafts isolated regression-tested fix.</p>
            </div>
            <div className="p-3 bg-emerald-950/20 border border-emerald-900/50 space-y-1">
              <span className="text-[10px] text-emerald-400 font-bold block">STEP 03</span>
              <span className="text-emerald-300 font-semibold block">Engineer Sign-Off</span>
              <p className="text-[11px] text-zinc-300 font-sans">Single-click PR dispatch to main branch.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

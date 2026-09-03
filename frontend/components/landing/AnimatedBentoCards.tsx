"use client";

import { useRef } from "react";
import { Flame, Cpu, GitPullRequest, Database, Zap, Lock } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const FEATURES = [
  {
    icon: Flame,
    color: "text-red-400",
    title: "Anomaly Ingestion Engine",
    desc: "Deterministic sanitization strips variables (UUIDs, timestamps, IPs) to create reproducible SHA-256 error signatures.",
    module: "MODULE: /lib/telemetry.ts",
  },
  {
    icon: Cpu,
    color: "text-zinc-100",
    title: "Multi-Model AI Orchestrator",
    desc: "Deploy Google Gemini, OpenAI, Claude, or Groq with encrypted client keys and dynamic model catalog discovery.",
    module: "MODULE: /lib/ai/provider.ts",
  },
  {
    icon: GitPullRequest,
    color: "text-emerald-400",
    title: "Human-in-the-Loop Hotfixes",
    desc: "Sandboxed SRE agents propose file modifications that are only committed to GitHub after authorized engineer approval.",
    module: "MODULE: /lib/github.ts",
  },
  {
    icon: Database,
    color: "text-blue-400",
    title: "pgvector runbook RAG",
    desc: "Index PDF runbooks and architectural specs into semantic 600-character chunks with vector similarity lookup.",
    module: "MODULE: /app/api/action/document.ts",
  },
  {
    icon: Zap,
    color: "text-yellow-400",
    title: "Distributed Redis Caching",
    desc: "Sub-2ms dashboard rendering, IP rate limiting, and log deduplication built on an atomic ioredis cluster.",
    module: "MODULE: /lib/redis.ts",
  },
  {
    icon: Lock,
    color: "text-zinc-300",
    title: "Multi-Tenant RBAC Isolation",
    desc: "Strict tenancy checks protecting incidents, organization settings, and member role access levels at the database level.",
    module: "MODULE: /lib/authorization.ts",
  },
];

export function AnimatedBentoCards() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.from(".bento-card", {
        opacity: 0,
        y: 12,
        stagger: 0.05,
        duration: 0.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
        },
      });
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {FEATURES.map((feature, idx) => (
        <div
          key={idx}
          className="bento-card border border-zinc-800 bg-black p-4 space-y-3 text-left rounded-none hover:border-zinc-700 hover:bg-zinc-950/20 transition-all duration-150 group relative"
        >
          <div className="h-7 w-7 bg-zinc-900 border border-zinc-800 flex items-center justify-center rounded-none group-hover:border-zinc-700 transition-colors">
            <feature.icon className={`h-3.5 w-3.5 ${feature.color}`} />
          </div>
          <h3 className="text-xs font-semibold font-mono text-white tracking-tight">
            {feature.title}
          </h3>
          <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
            {feature.desc}
          </p>
          <div className="pt-2 font-mono text-[10px] text-zinc-600 border-t border-zinc-900 group-hover:text-zinc-500 transition-colors">
            {feature.module}
          </div>
        </div>
      ))}
    </div>
  );
}

"use client";

import { motion } from "motion/react";
import { Flame, Cpu, GitPullRequest, Database, Zap, Lock } from "lucide-react";

const FEATURES = [
  {
    icon: Flame,
    color: "text-red-400",
    title: "Sliding-Window Anomaly Ingestion",
    desc: "Deterministic regex sanitization strips dynamic variables (UUIDs, timestamps, IPs) to create reproducible SHA-256 error fingerprints.",
    module: "MODULE: /lib/telemetry.ts",
  },
  {
    icon: Cpu,
    color: "text-zinc-100",
    title: "Multi-Model Dynamic SRE Engine",
    desc: "Deploy Google Gemini, OpenAI GPT-4o, Anthropic Claude, Groq Llama, or OpenRouter with 24-hour Redis model discovery caching.",
    module: "MODULE: /lib/ai/provider.ts",
  },
  {
    icon: GitPullRequest,
    color: "text-emerald-400",
    title: "Human-in-the-Loop Hotfix Dispatch",
    desc: "Fine-grained Octokit GitHub App integration ensures autonomous agents only create branches and open Pull Requests upon verified engineer approval.",
    module: "MODULE: /lib/github.ts",
  },
  {
    icon: Database,
    color: "text-blue-400",
    title: "pgvector Semantic Knowledge RAG",
    desc: "Parse PDF runbooks, markdown architecture specs, and post-mortems into semantic 600-character chunks with vector similarity search.",
    module: "MODULE: /app/api/action/document.ts",
  },
  {
    icon: Zap,
    color: "text-yellow-400",
    title: "Distributed Redis Architecture",
    desc: "Atomic sliding-window IP rate limiting, telemetry deduplication, and 60-second dashboard aggregation caching powered by ioredis.",
    module: "MODULE: /lib/redis.ts",
  },
  {
    icon: Lock,
    color: "text-zinc-300",
    title: "Multi-Tenant RBAC Isolation",
    desc: "Better Auth integration with compound tenant authorization checks protecting organizations, API keys, and workspace members.",
    module: "MODULE: /lib/authorization.ts",
  },
];

export function AnimatedBentoCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {FEATURES.map((feature, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.35, delay: idx * 0.08 }}
          whileHover={{ y: -2, transition: { duration: 0.15 } }}
          className="border border-zinc-800 bg-black p-6 space-y-4 text-left rounded-none hover:border-zinc-700 transition-colors group relative"
        >
          <div className="h-8 w-8 bg-zinc-900 border border-zinc-800 flex items-center justify-center rounded-none group-hover:border-zinc-700 transition-colors">
            <feature.icon className={`h-4 w-4 ${feature.color}`} />
          </div>
          <h3 className="text-sm font-semibold font-mono text-white tracking-tight">{feature.title}</h3>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed">{feature.desc}</p>
          <div className="pt-2 font-mono text-[11px] text-zinc-600 border-t border-zinc-900 group-hover:text-zinc-500 transition-colors">
            {feature.module}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

import Link from "next/link";
import { 
  ShieldAlert, 
  Terminal, 
  Cpu, 
  GitPullRequest, 
  Zap, 
  Database, 
  CheckCircle2, 
  ArrowRight, 
  Code2, 
  Flame, 
  Key, 
  Activity,
  Layers,
  Lock,
  ChevronRight,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 selection:bg-white selection:text-black font-sans">
      {/* Top Notification Bar */}
      <div className="border-b border-zinc-800 bg-zinc-950/80 px-4 py-2 text-center text-xs font-mono text-zinc-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 bg-emerald-500 animate-pulse" />
          <span className="text-zinc-200">PulseGuard V1 Engine Active</span>
          <span className="text-zinc-600">•</span>
          <span>Automated SRE Diagnostics with Gemini & Claude</span>
          <span className="text-zinc-600">•</span>
          <Link href="/docs" className="text-white hover:underline ml-1 inline-flex items-center">
            Read Docs <ChevronRight className="h-3 w-3 inline" />
          </Link>
        </span>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-7 w-7 bg-white flex items-center justify-center rounded-none">
                <ShieldAlert className="h-4 w-4 text-black" />
              </div>
              <span className="font-mono text-sm font-semibold tracking-wider text-white uppercase">
                PulseGuard<span className="text-zinc-600">_</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-5 text-xs font-mono">
              <Link href="#features" className="text-zinc-400 hover:text-white transition-colors">
                // ARCHITECTURE
              </Link>
              <Link href="#pipeline" className="text-zinc-400 hover:text-white transition-colors">
                // SRE_PIPELINE
              </Link>
              <Link href="#benchmarks" className="text-zinc-400 hover:text-white transition-colors">
                // TELEMETRY
              </Link>
              <Link href="/docs" className="text-zinc-300 hover:text-white flex items-center gap-1 transition-colors">
                <BookOpen className="h-3 w-3 text-zinc-400" /> DOCS
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <Link
              href="/login"
              className="px-3 py-1.5 text-zinc-400 hover:text-white transition-colors"
            >
              SIGN IN
            </Link>
            <Link
              href="/signup"
              className="px-4 py-1.5 bg-white text-black font-semibold hover:bg-zinc-200 transition-colors"
            >
              DEPLOY WAR ROOM &rarr;
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative border-b border-zinc-800 py-20 md:py-28 overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8">
          <div className="inline-flex items-center gap-2 border border-zinc-800 bg-zinc-950 px-3 py-1 text-xs font-mono text-zinc-400">
            <span className="h-2 w-2 bg-red-500 animate-ping" />
            <span className="text-zinc-300">AUTONOMOUS SRE INCIDENT RESPONSE</span>
            <span className="text-zinc-700">|</span>
            <span className="text-zinc-500">V1.0-STABLE</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white uppercase leading-[0.95] font-mono">
            Autonomous Incident <br />
            <span className="text-zinc-500">Diagnosis & Remediation</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-400 leading-relaxed font-sans">
            Connect live server telemetry, internal runbooks, and GitHub repositories. 
            When production breaks, autonomous agents isolate the root cause and draft PR hotfixes for instant engineer approval.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 font-mono text-xs">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-6 py-3 bg-white text-black font-semibold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
            >
              START INCIDENT RESPONSE <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/docs"
              className="w-full sm:w-auto px-6 py-3 border border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <Terminal className="h-4 w-4 text-zinc-500" /> EXPLORE DOCUMENTATION
            </Link>
          </div>

          {/* Live Terminal Telemetry Mock */}
          <div className="pt-8 max-w-4xl mx-auto text-left">
            <div className="border border-zinc-800 bg-black shadow-2xl">
              <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 py-2 text-xs font-mono text-zinc-400">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 bg-zinc-800 border border-zinc-700 inline-block" />
                  <span className="h-2.5 w-2.5 bg-zinc-800 border border-zinc-700 inline-block" />
                  <span className="h-2.5 w-2.5 bg-zinc-800 border border-zinc-700 inline-block" />
                  <span className="ml-2 text-zinc-300">pulseguard-agent://cluster-iad-01</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                  <span>AES-256</span>
                  <span>•</span>
                  <span>REDIS_CACHE_READY</span>
                </div>
              </div>

              <div className="p-4 sm:p-6 font-mono text-xs space-y-3 bg-[#050505] overflow-x-auto">
                <div className="text-zinc-500 flex items-center gap-2">
                  <span className="text-emerald-500">[08:42:01.129]</span>
                  <span className="text-zinc-400">INGEST:</span>
                  <span>Cluster ingested 14 error logs for service &quot;billing-service&quot;</span>
                </div>
                <div className="text-zinc-500 flex items-center gap-2">
                  <span className="text-yellow-500">[08:42:01.340]</span>
                  <span className="text-zinc-400">CLUSTER:</span>
                  <span>Fingerprint <span className="text-zinc-300 bg-zinc-900 px-1.5 py-0.5 border border-zinc-800">#a9f8b7c6d5e4</span> triggered threshold &ge; 3 in 3m</span>
                </div>
                <div className="text-red-400 flex items-center gap-2 font-semibold">
                  <span className="text-red-500">[08:42:01.512]</span>
                  <span>INCIDENT_OPENED:</span>
                  <span>Incident #inc_89491 opened &mdash; Autonomous SRE Agent Initialized</span>
                </div>
                <div className="text-zinc-400 pl-4 border-l-2 border-zinc-800 space-y-1.5 py-1">
                  <p className="text-zinc-300">&gt; Tool: query_telemetry_logs(service=&quot;billing-service&quot;, level=&quot;ERROR&quot;)</p>
                  <p className="text-zinc-500">&gt; Tool: fetch_repo_file(path=&quot;src/billing/stripe.ts&quot;, ref=&quot;main&quot;)</p>
                  <p className="text-emerald-400">&gt; Tool: propose_hotfix(path=&quot;src/billing/stripe.ts&quot;, fix=&quot;Null check stripe customer ID&quot;)</p>
                </div>
                <div className="border border-zinc-800 bg-zinc-950 p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-zinc-300 font-semibold">PR Hotfix Draft Ready:</span>
                    <span className="text-zinc-500 block text-[11px]">Branch: hotfix/fix-billing-npe-89491 &bull; 1 file changed (+4, -1)</span>
                  </div>
                  <Badge variant="outline" className="bg-emerald-950/40 border-emerald-800/60 text-emerald-400 rounded-none text-[11px] uppercase">
                    Requires Human Approval
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metric Pillars */}
      <section id="benchmarks" className="border-b border-zinc-800 bg-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-zinc-800 font-mono text-left">
          <div className="p-6 sm:p-8 space-y-2">
            <span className="text-xs text-zinc-500 uppercase">// MTTR REDUCTION</span>
            <div className="text-3xl font-bold text-white tracking-tight">64%</div>
            <p className="text-xs text-zinc-400 font-sans">Faster root-cause diagnosis via automated stack trace inspection.</p>
          </div>
          <div className="p-6 sm:p-8 space-y-2">
            <span className="text-xs text-zinc-500 uppercase">// INGESTION THROUGHPUT</span>
            <div className="text-3xl font-bold text-white tracking-tight">&lt; 2ms</div>
            <p className="text-xs text-zinc-400 font-sans">Redis atomic fingerprint deduplication and in-memory rate limiting.</p>
          </div>
          <div className="p-6 sm:p-8 space-y-2">
            <span className="text-xs text-zinc-500 uppercase">// RAG KNOWLEDGE BASE</span>
            <div className="text-3xl font-bold text-white tracking-tight">1536-D</div>
            <p className="text-xs text-zinc-400 font-sans">PostgreSQL pgvector embeddings for runbooks, docs, and architecture manuals.</p>
          </div>
          <div className="p-6 sm:p-8 space-y-2">
            <span className="text-xs text-zinc-500 uppercase">// KEY ENCRYPTION</span>
            <div className="text-3xl font-bold text-white tracking-tight">AES-256</div>
            <p className="text-xs text-zinc-400 font-sans">Bring-Your-Own-Model with encrypted client keys and live API model discovery.</p>
          </div>
        </div>
      </section>

      {/* Feature Grid / Bento Matrix */}
      <section id="features" className="border-b border-zinc-800 py-20 bg-zinc-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="space-y-2 text-left">
            <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest">// ARCHITECTURAL SPECIFICATION</div>
            <h2 className="text-3xl sm:text-4xl font-bold font-mono uppercase tracking-tight text-white">
              Engineered for Mission-Critical Reliability
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="border border-zinc-800 bg-black p-6 space-y-4 text-left">
              <div className="h-8 w-8 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-100">
                <Flame className="h-4 w-4 text-red-400" />
              </div>
              <h3 className="text-base font-semibold font-mono text-white">Sliding-Window Anomaly Ingestion</h3>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Deterministic regex sanitization strips dynamic parameters (UUIDs, timestamps, IPs) to create reproducible SHA-256 error fingerprints.
              </p>
              <div className="pt-2 font-mono text-[11px] text-zinc-500 border-t border-zinc-900">
                MODULE: /lib/telemetry.ts
              </div>
            </div>

            {/* Card 2 */}
            <div className="border border-zinc-800 bg-black p-6 space-y-4 text-left">
              <div className="h-8 w-8 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-100">
                <Cpu className="h-4 w-4 text-zinc-100" />
              </div>
              <h3 className="text-base font-semibold font-mono text-white">Multi-Model Dynamic SRE Engine</h3>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Deploy Gemini 3.5 Flash, Claude 3.5 Sonnet, or GPT-4o. Query live model lists dynamically via public provider APIs with 24h Redis caching.
              </p>
              <div className="pt-2 font-mono text-[11px] text-zinc-500 border-t border-zinc-900">
                MODULE: /lib/ai/provider.ts
              </div>
            </div>

            {/* Card 3 */}
            <div className="border border-zinc-800 bg-black p-6 space-y-4 text-left">
              <div className="h-8 w-8 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-100">
                <GitPullRequest className="h-4 w-4 text-emerald-400" />
              </div>
              <h3 className="text-base font-semibold font-mono text-white">Human-in-the-Loop Hotfix Dispatch</h3>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Fine-grained Octokit GitHub App integration ensures autonomous agents only create branches and open Pull Requests after verified engineer approval.
              </p>
              <div className="pt-2 font-mono text-[11px] text-zinc-500 border-t border-zinc-900">
                MODULE: /lib/github.ts
              </div>
            </div>

            {/* Card 4 */}
            <div className="border border-zinc-800 bg-black p-6 space-y-4 text-left">
              <div className="h-8 w-8 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-100">
                <Database className="h-4 w-4 text-blue-400" />
              </div>
              <h3 className="text-base font-semibold font-mono text-white">pgvector Semantic Knowledge RAG</h3>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Parse PDF runbooks, markdown architecture specs, and post-mortems into semantic 600-character chunks with vector similarity search.
              </p>
              <div className="pt-2 font-mono text-[11px] text-zinc-500 border-t border-zinc-900">
                MODULE: /app/api/action/document.ts
              </div>
            </div>

            {/* Card 5 */}
            <div className="border border-zinc-800 bg-black p-6 space-y-4 text-left">
              <div className="h-8 w-8 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-100">
                <Zap className="h-4 w-4 text-yellow-400" />
              </div>
              <h3 className="text-base font-semibold font-mono text-white">Distributed Redis Architecture</h3>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Atomic sliding-window IP rate limiting, telemetry deduplication, and 60-second dashboard aggregation caching powered by ioredis.
              </p>
              <div className="pt-2 font-mono text-[11px] text-zinc-500 border-t border-zinc-900">
                MODULE: /lib/redis.ts
              </div>
            </div>

            {/* Card 6 */}
            <div className="border border-zinc-800 bg-black p-6 space-y-4 text-left">
              <div className="h-8 w-8 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-100">
                <Lock className="h-4 w-4 text-zinc-300" />
              </div>
              <h3 className="text-base font-semibold font-mono text-white">Multi-Tenant RBAC Isolation</h3>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Better Auth integration with compound tenant authorization checks protecting organizations, API keys, and workspace members.
              </p>
              <div className="pt-2 font-mono text-[11px] text-zinc-500 border-t border-zinc-900">
                MODULE: /lib/authorization.ts
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SRE Pipeline Workflow */}
      <section id="pipeline" className="border-b border-zinc-800 py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12 text-left">
          <div className="space-y-2">
            <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest">// LIFECYCLE REVEAL</div>
            <h2 className="text-3xl sm:text-4xl font-bold font-mono uppercase tracking-tight text-white">
              End-to-End Incident Lifecycle
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 font-mono text-xs">
            <div className="border border-zinc-800 bg-zinc-950 p-5 space-y-3">
              <div className="text-zinc-500 font-semibold">01. INGESTION</div>
              <p className="text-zinc-300 font-sans text-xs">
                Microservices send JSON error logs to <code className="text-zinc-100 bg-zinc-900 px-1">/api/telemetry/ingest</code> with bearer API keys.
              </p>
            </div>
            <div className="border border-zinc-800 bg-zinc-950 p-5 space-y-3">
              <div className="text-zinc-500 font-semibold">02. FINGERPRINTING</div>
              <p className="text-zinc-300 font-sans text-xs">
                Logs are sanitized, grouped by SHA-256 signatures, and evaluated against the anomaly window in Redis.
              </p>
            </div>
            <div className="border border-zinc-800 bg-zinc-950 p-5 space-y-3">
              <div className="text-zinc-500 font-semibold">03. WAR ROOM CHAT</div>
              <p className="text-zinc-300 font-sans text-xs">
                The SRE Agent reads repo code, correlates logs with runbooks, and outputs root-cause diagnostics.
              </p>
            </div>
            <div className="border border-zinc-800 bg-zinc-950 p-5 space-y-3">
              <div className="text-zinc-500 font-semibold">04. ONE-CLICK HOTFIX</div>
              <p className="text-zinc-300 font-sans text-xs">
                Engineers review the proposed patch on <code className="text-zinc-100 bg-zinc-900 px-1">&lt;DiffApprovalCard /&gt;</code> and open a GitHub PR.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-20 bg-zinc-950 text-center border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-bold font-mono uppercase tracking-tight text-white">
            Upgrade Your Production Incident Response
          </h2>
          <p className="text-sm text-zinc-400 font-sans max-w-xl mx-auto">
            Deploy PulseGuard on your own infrastructure with PostgreSQL pgvector, Redis, and your choice of AI model.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 font-mono text-xs">
            <Link
              href="/signup"
              className="px-6 py-3 bg-white text-black font-semibold hover:bg-zinc-200 transition-colors"
            >
              DEPLOY WORKSPACE NOW &rarr;
            </Link>
            <Link
              href="/docs"
              className="px-6 py-3 border border-zinc-800 bg-black text-zinc-300 hover:text-white transition-colors"
            >
              READ FULL DOCUMENTATION
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 bg-white" />
          <span className="text-zinc-300 font-semibold">PULSEGUARD_SRE</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/docs" className="hover:text-zinc-300 transition-colors">DOCUMENTATION</Link>
          <Link href="/login" className="hover:text-zinc-300 transition-colors">CONSOLE</Link>
          <Link href="/signup" className="hover:text-zinc-300 transition-colors">REGISTER</Link>
        </div>
      </footer>
    </div>
  );
}

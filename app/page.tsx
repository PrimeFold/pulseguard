import Link from "next/link";
import { 
  ShieldAlert, 
  Terminal, 
  ChevronRight,
  ArrowRight, 
  BookOpen
} from "lucide-react";
import { AnimatedHeroTerminal } from "@/components/landing/AnimatedHeroTerminal";
import { AnimatedBentoCards } from "@/components/landing/AnimatedBentoCards";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 selection:bg-white selection:text-black font-sans">
      {/* Top Notification Bar */}
      <div className="border-b border-zinc-800 bg-zinc-950/80 px-4 py-2 text-center text-xs font-mono text-zinc-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 bg-emerald-500 rounded-none animate-pulse" />
          <span className="text-zinc-200">PulseGuard V1 Engine Active</span>
          <span className="text-zinc-600">•</span>
          <span>Multi-Provider SRE Diagnostics (Gemini, OpenAI, Claude, Groq, OpenRouter)</span>
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
              className="px-3 py-1.5 text-zinc-400 hover:text-white transition-colors rounded-none"
            >
              SIGN IN
            </Link>
            <Link
              href="/signup"
              className="px-4 py-1.5 bg-white text-black font-semibold hover:bg-zinc-200 transition-colors rounded-none"
            >
              DEPLOY WAR ROOM &rarr;
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative border-b border-zinc-800 py-20 md:py-28 overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8">
          <div className="inline-flex items-center gap-2 border border-zinc-800 bg-zinc-950 px-3 py-1 text-xs font-mono text-zinc-400 rounded-none">
            <span className="h-2 w-2 bg-red-500 rounded-none animate-ping" />
            <span className="text-zinc-300">AUTONOMOUS SRE INCIDENT RESPONSE</span>
            <span className="text-zinc-700">|</span>
            <span className="text-zinc-500">MULTI-PROVIDER_ENGINE</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white uppercase leading-[0.95] font-mono">
            Autonomous Incident <br />
            <span className="text-zinc-500">Diagnosis & Remediation</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-400 leading-relaxed font-sans">
            Connect live server telemetry, internal runbooks, and GitHub repositories. 
            When production breaks, autonomous agents isolate root cause and draft PR hotfixes for instant engineer approval.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 font-mono text-xs">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-6 py-3 bg-white text-black font-semibold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 rounded-none"
            >
              START INCIDENT RESPONSE <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/docs"
              className="w-full sm:w-auto px-6 py-3 border border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors flex items-center justify-center gap-2 rounded-none"
            >
              <Terminal className="h-4 w-4 text-zinc-500" /> EXPLORE DOCUMENTATION
            </Link>
          </div>

          {/* Animated Hero Terminal */}
          <div className="pt-6 max-w-4xl mx-auto">
            <AnimatedHeroTerminal />
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

          <AnimatedBentoCards />
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
            <div className="border border-zinc-800 bg-zinc-950 p-5 space-y-3 rounded-none">
              <div className="text-zinc-500 font-semibold">01. INGESTION</div>
              <p className="text-zinc-300 font-sans text-xs">
                Microservices send JSON error logs to <code className="text-zinc-100 bg-zinc-900 px-1">/api/telemetry/ingest</code> with bearer API keys.
              </p>
            </div>
            <div className="border border-zinc-800 bg-zinc-950 p-5 space-y-3 rounded-none">
              <div className="text-zinc-500 font-semibold">02. FINGERPRINTING</div>
              <p className="text-zinc-300 font-sans text-xs">
                Logs are sanitized, grouped by SHA-256 signatures, and evaluated against the anomaly window in Redis.
              </p>
            </div>
            <div className="border border-zinc-800 bg-zinc-950 p-5 space-y-3 rounded-none">
              <div className="text-zinc-500 font-semibold">03. WAR ROOM CHAT</div>
              <p className="text-zinc-300 font-sans text-xs">
                The SRE Agent reads repo code, correlates logs with runbooks, and outputs root-cause diagnostics.
              </p>
            </div>
            <div className="border border-zinc-800 bg-zinc-950 p-5 space-y-3 rounded-none">
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
            Deploy PulseGuard on your own infrastructure with PostgreSQL pgvector, Redis, and your choice of AI model provider.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 font-mono text-xs">
            <Link
              href="/signup"
              className="px-6 py-3 bg-white text-black font-semibold hover:bg-zinc-200 transition-colors rounded-none"
            >
              DEPLOY WORKSPACE NOW &rarr;
            </Link>
            <Link
              href="/docs"
              className="px-6 py-3 border border-zinc-800 bg-black text-zinc-300 hover:text-white transition-colors rounded-none"
            >
              READ FULL DOCUMENTATION
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 bg-white rounded-none" />
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

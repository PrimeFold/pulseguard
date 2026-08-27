import Link from "next/link";
import { 
  ShieldAlert, 
  Terminal, 
  ChevronRight,
  ArrowRight, 
  BookOpen
} from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { AnimatedHeroTerminal } from "@/components/landing/AnimatedHeroTerminal";
import { AnimatedBentoCards } from "@/components/landing/AnimatedBentoCards";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 selection:bg-white selection:text-black font-sans antialiased">
      {/* Top Notification Bar */}
      <div className="border-b border-zinc-800 bg-zinc-950/80 px-4 py-1.5 text-center text-[11px] font-mono text-zinc-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1 w-1 bg-emerald-500 rounded-none animate-pulse" />
          <span className="text-zinc-200">PulseGuard V1 Engine Active</span>
          <span className="text-zinc-600">•</span>
          <span>Multi-Provider SRE Diagnostics</span>
          <span className="text-zinc-600">•</span>
          <Link href="/docs" className="text-white hover:underline ml-1 inline-flex items-center">
            Read Docs <ChevronRight className="h-2.5 w-2.5 inline" />
          </Link>
        </span>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex h-12 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-5">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-6 w-6 bg-white flex items-center justify-center rounded-none">
                <ShieldAlert className="h-3.5 w-3.5 text-black" />
              </div>
              <span className="font-mono text-xs font-semibold tracking-wider text-white uppercase">
                PulseGuard<span className="text-zinc-600">_</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-4 text-[10px] font-mono">
              <Link href="#features" className="text-zinc-400 hover:text-white transition-colors">
                // ARCHITECTURE
              </Link>
              <Link href="#pipeline" className="text-zinc-400 hover:text-white transition-colors">
                // SRE_PIPELINE
              </Link>
              <Link href="/docs" className="text-zinc-300 hover:text-white flex items-center gap-1 transition-colors">
                <BookOpen className="h-3 w-3 text-zinc-400" /> DOCS
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3 font-mono text-[10px]">
            <Link
              href="https://github.com/PrimeFold"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors rounded-none"
            >
              <FaGithub className="h-3.5 w-3.5" /> STAR ON GITHUB
            </Link>
            <Link
              href="/login"
              className="px-2.5 py-1 text-zinc-400 hover:text-white transition-colors"
            >
              SIGN IN
            </Link>
            <Link
              href="/signup"
              className="px-3.5 py-1 bg-white text-black font-semibold hover:bg-zinc-200 transition-colors rounded-none"
            >
              CONSOLE &rarr;
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative border-b border-zinc-800 py-12 md:py-16 overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 border border-zinc-800 bg-zinc-950 px-2.5 py-0.5 text-[10px] font-mono text-zinc-400 rounded-none">
            <span className="h-1.5 w-1.5 bg-red-500 rounded-none animate-ping" />
            <span className="text-zinc-300">AUTONOMOUS SRE INCIDENT RESPONSE</span>
            <span className="text-zinc-700">|</span>
            <span className="text-zinc-500">BYOM_COMPATIBLE</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white uppercase leading-[0.98] font-mono">
            Autonomous Incident <br />
            <span className="text-zinc-500">Diagnosis & Remediation</span>
          </h1>

          <p className="max-w-xl mx-auto text-xs text-zinc-400 leading-relaxed font-sans">
            Connect telemetry metrics, runbooks, and GitHub repositories. 
            When production breaks, autonomous agents isolate root cause and draft PR hotfixes for engineer approval.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1 font-mono text-[10px]">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-4 py-2 bg-white text-black font-semibold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5 rounded-none"
            >
              START INCIDENT RESPONSE <ArrowRight className="h-3 w-3" />
            </Link>
            <Link
              href="/docs"
              className="w-full sm:w-auto px-4 py-2 border border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors flex items-center justify-center gap-1.5 rounded-none"
            >
              <Terminal className="h-3 w-3 text-zinc-500" /> EXPLORE DOCUMENTATION
            </Link>
          </div>

          {/* Animated Hero Terminal */}
          <div className="pt-4 max-w-3xl mx-auto">
            <AnimatedHeroTerminal />
          </div>
        </div>
      </section>

      {/* Metric Pillars */}
      <section id="benchmarks" className="border-b border-zinc-800 bg-black">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-zinc-800 font-mono text-left">
          <div className="p-4 sm:p-5 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase">// MTTR REDUCTION</span>
            <div className="text-2xl font-bold text-white tracking-tight">64%</div>
            <p className="text-[10px] text-zinc-400 font-sans leading-snug">Faster root-cause diagnosis via stack trace inspection.</p>
          </div>
          <div className="p-4 sm:p-5 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase">// INGESTION SPEED</span>
            <div className="text-2xl font-bold text-white tracking-tight">&lt; 2ms</div>
            <p className="text-[10px] text-zinc-400 font-sans leading-snug">Redis fingerprint matching and rate limiting.</p>
          </div>
          <div className="p-4 sm:p-5 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase">// VECTOR EMBEDDINGS</span>
            <div className="text-2xl font-bold text-white tracking-tight">1536-D</div>
            <p className="text-[10px] text-zinc-400 font-sans leading-snug">pgvector similarity metrics for runbooks and manuals.</p>
          </div>
          <div className="p-4 sm:p-5 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase">// ENCRYPTION STANDARD</span>
            <div className="text-2xl font-bold text-white tracking-tight">AES-256</div>
            <p className="text-[10px] text-zinc-400 font-sans leading-snug">Symmetric API key encryption at rest.</p>
          </div>
        </div>
      </section>

      {/* Feature Grid / Bento Matrix */}
      <section id="features" className="border-b border-zinc-800 py-16 bg-zinc-950/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="space-y-1.5 text-left">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">// ARCHITECTURAL SPECIFICATION</div>
            <h2 className="text-xl sm:text-2xl font-bold font-mono uppercase tracking-tight text-white">
              Engineered for Mission-Critical Reliability
            </h2>
          </div>

          <AnimatedBentoCards />
        </div>
      </section>

      {/* SRE Pipeline Workflow */}
      <section id="pipeline" className="border-b border-zinc-800 py-16 bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8 text-left">
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">// LIFECYCLE REVEAL</div>
            <h2 className="text-xl sm:text-2xl font-bold font-mono uppercase tracking-tight text-white">
              End-to-End Incident Lifecycle
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-[11px]">
            <div className="border border-zinc-800 bg-zinc-950 p-4 space-y-2 rounded-none">
              <div className="text-zinc-500 font-semibold">01. INGESTION</div>
              <p className="text-zinc-400 font-sans text-[11px] leading-snug">
                JSON logs hit <code className="text-zinc-100 bg-zinc-900 px-1">/api/telemetry/ingest</code> with bearer credentials.
              </p>
            </div>
            <div className="border border-zinc-800 bg-zinc-950 p-4 space-y-2 rounded-none">
              <div className="text-zinc-500 font-semibold">02. DEDUPLICATION</div>
              <p className="text-zinc-400 font-sans text-[11px] leading-snug">
                Logs are sanitized into SHA-256 fingerprint signatures and mapped to incidents in Redis.
              </p>
            </div>
            <div className="border border-zinc-800 bg-zinc-950 p-4 space-y-2 rounded-none">
              <div className="text-zinc-500 font-semibold">03. CHAT DIAGNOSTICS</div>
              <p className="text-zinc-400 font-sans text-[11px] leading-snug">
                The SRE agent fetches repository files and matches errors with runbook context.
              </p>
            </div>
            <div className="border border-zinc-800 bg-zinc-950 p-4 space-y-2 rounded-none">
              <div className="text-zinc-500 font-semibold">04. HOTFIX PR</div>
              <p className="text-zinc-400 font-sans text-[11px] leading-snug">
                Authorized engineers approve code modifications to automatically dispatch GitHub PRs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 bg-zinc-950 text-center border-b border-zinc-800">
        <div className="max-w-3xl mx-auto px-4 space-y-4">
          <h2 className="text-xl sm:text-3xl font-bold font-mono uppercase tracking-tight text-white">
            Upgrade Your Incident Response
          </h2>
          <p className="text-xs text-zinc-400 font-sans max-w-md mx-auto">
            Deploy PulseGuard on your own infrastructure with pgvector, Redis, and your choice of AI model provider.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5 font-mono text-[10px]">
            <Link
              href="/signup"
              className="px-4 py-2 bg-white text-black font-semibold hover:bg-zinc-200 transition-colors rounded-none"
            >
              DEPLOY WORKSPACE NOW &rarr;
            </Link>
            <Link
              href="/docs"
              className="px-4 py-2 border border-zinc-800 bg-black text-zinc-300 hover:text-white transition-colors rounded-none"
            >
              READ DOCUMENTATION
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 sm:px-6 max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] text-zinc-500">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 bg-white rounded-none" />
          <span className="text-zinc-300 font-semibold">PULSEGUARD_SRE</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/docs" className="hover:text-zinc-300 transition-colors">DOCUMENTATION</Link>
          <Link href="/login" className="hover:text-zinc-300 transition-colors">CONSOLE</Link>
          <Link href="/signup" className="hover:text-zinc-300 transition-colors">REGISTER</Link>
        </div>
      </footer>
    </div>
  );
}

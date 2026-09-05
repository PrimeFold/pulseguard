import Link from "next/link";
import {
  ShieldAlert,
  Terminal,
  ChevronRight,
  ArrowRight,
  BookOpen,
  Radio,
  ExternalLink,
  Flame,
  CheckCircle2,
  Lock,
  GitPullRequest,
  Zap,
} from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { HeroDashboardDemo } from "@/components/landing/HeroDashboardDemo";
import { BentoArchitectureGrid } from "@/components/landing/BentoArchitectureGrid";
import { LandingBackground } from "@/components/landing/LandingBackground";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 selection:bg-white selection:text-black font-sans antialiased overflow-x-hidden">
      {/* 1. Top Announcement Bar */}
      <div className="border-b border-zinc-850 bg-zinc-950/90 px-4 py-2 text-center text-xs font-mono text-zinc-400">
        <span className="inline-flex items-center gap-2 flex-wrap justify-center">
          <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-zinc-200 font-semibold">PulseGuard V1.2 Engine Active</span>
          <span className="text-zinc-600 hidden sm:inline">•</span>
          <span className="hidden sm:inline">Multi-Provider SRE Diagnostics</span>
          <span className="text-zinc-600">•</span>
          <Link
            href="/docs"
            className="text-white hover:text-emerald-400 underline transition-colors inline-flex items-center gap-1 font-medium"
          >
            Read Architecture Specs <ChevronRight className="h-3 w-3 inline" />
          </Link>
        </span>
      </div>

      {/* 2. Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-850 bg-black/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
              <div className="h-7 w-7 bg-white flex items-center justify-center rounded-none shadow-sm group-hover:scale-105 transition-transform">
                <ShieldAlert className="h-4 w-4 text-black" />
              </div>
              <span className="font-mono text-sm font-bold tracking-wider text-white uppercase">
                PulseGuard<span className="text-emerald-500">_</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-5 text-xs font-mono">
              <Link href="#demo" className="text-zinc-400 hover:text-white transition-colors">
                // SRE_DEMO
              </Link>
              <Link href="#architecture" className="text-zinc-400 hover:text-white transition-colors">
                // ARCHITECTURE
              </Link>
              <Link href="#pipeline" className="text-zinc-400 hover:text-white transition-colors">
                // SRE_PIPELINE
              </Link>
              <Link href="/docs" className="text-zinc-300 hover:text-white flex items-center gap-1 transition-colors">
                <BookOpen className="h-3.5 w-3.5 text-zinc-400" /> DOCS
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <Link
              href="https://github.com/PrimeFold/pulseguard"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors rounded-none"
            >
              <FaGithub className="h-3.5 w-3.5" />
              <span>GITHUB</span>
            </Link>
            <Link
              href="/login"
              className="px-3 py-1.5 text-zinc-400 hover:text-white transition-colors font-medium"
            >
              SIGN IN
            </Link>
            <Link
              href="/signup"
              className="px-4 py-1.5 bg-white text-black font-bold hover:bg-zinc-200 transition-all rounded-none active:scale-95 flex items-center gap-1 shadow-sm"
            >
              <span>CONSOLE</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* 3. Hero Section */}
      <section className="relative border-b border-zinc-850 pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        {/* Subtle Ambient Mesh Background */}
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
          <LandingBackground />
        </div>

        {/* Ambient Top Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 md:w-[600px] md:h-[600px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-8">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 border border-zinc-800 bg-zinc-950/80 px-3.5 py-1 text-xs font-mono text-zinc-300 rounded-full shadow-sm backdrop-blur-sm">
            <span className="h-2 w-2 bg-emerald-400 rounded-full animate-ping" />
            <span className="text-zinc-200 font-semibold uppercase tracking-wider">
              AUTONOMOUS SRE INCIDENT RESPONSE
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-emerald-400 font-medium">BYOM_COMPATIBLE</span>
          </div>

          {/* Headline with Wide Editorial Rhythm */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white uppercase leading-[1.02] font-mono max-w-4xl mx-auto">
            Autonomous Incident <br />
            <span className="text-zinc-500">Diagnosis & Remediation</span>
          </h1>

          {/* Subtext */}
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-400 leading-relaxed font-sans">
            Connect telemetry streams, runbooks, and GitHub repositories. When production fails, autonomous AI agents
            isolate root cause, inspect syntax trees, and engineer verified hotfix PRs with zero unsupervised merges.
          </p>

          {/* Dual Nested Button Architecture */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 font-mono text-xs sm:text-sm">
            {/* Primary Nested Button */}
            <Link
              href="/signup"
              className="w-full sm:w-auto rounded-full px-6 py-3.5 bg-white text-black font-bold uppercase tracking-wider hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-lg group cursor-pointer"
            >
              <span>DEPLOY SRE CONSOLE</span>
              <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="h-3.5 w-3.5 text-black" />
              </div>
            </Link>

            {/* Secondary Glass Button */}
            <Link
              href="#demo"
              className="w-full sm:w-auto rounded-full px-6 py-3.5 bg-zinc-950 border border-zinc-800 text-zinc-300 font-medium uppercase tracking-wider hover:bg-zinc-900 hover:text-white transition-all flex items-center justify-center gap-2.5 active:scale-[0.98] cursor-pointer"
            >
              <Terminal className="h-4 w-4 text-zinc-400" />
              <span>EXPLORE INTERACTIVE DEMO</span>
            </Link>
          </div>

          {/* 4. The Hero SRE Dashboard Demo */}
          <div id="demo" className="pt-8 max-w-5xl mx-auto">
            <HeroDashboardDemo />
          </div>
        </div>
      </section>

      {/* 4. Metric Pillars & Benchmarks */}
      <section id="benchmarks" className="border-b border-zinc-850 bg-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-zinc-850 font-mono text-left">
          <div className="p-6 space-y-1.5 hover:bg-zinc-950/40 transition-colors">
            <span className="text-xs text-zinc-500 uppercase tracking-widest block font-medium">
              // MTTR REDUCTION
            </span>
            <div className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              64%
            </div>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Faster root-cause diagnosis via automated stack trace inspection.
            </p>
          </div>

          <div className="p-6 space-y-1.5 hover:bg-zinc-950/40 transition-colors">
            <span className="text-xs text-zinc-500 uppercase tracking-widest block font-medium">
              // INGESTION SPEED
            </span>
            <div className="text-3xl sm:text-4xl font-bold text-emerald-400 tracking-tight">
              &lt; 2ms
            </div>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Sub-millisecond Redis fingerprint matching and atomic deduplication.
            </p>
          </div>

          <div className="p-6 space-y-1.5 hover:bg-zinc-950/40 transition-colors">
            <span className="text-xs text-zinc-500 uppercase tracking-widest block font-medium">
              // VECTOR EMBEDDINGS
            </span>
            <div className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              736-D
            </div>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Matryoshka pgvector similarity search for company runbooks and manuals.
            </p>
          </div>

          <div className="p-6 space-y-1.5 hover:bg-zinc-950/40 transition-colors">
            <span className="text-xs text-zinc-500 uppercase tracking-widest block font-medium">
              // ENCRYPTION VAULT
            </span>
            <div className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              AES-256
            </div>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Symmetric envelope encryption at rest for customer AI provider keys.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Architectural Specification (Asymmetrical Bento) */}
      <section id="architecture" className="border-b border-zinc-850 py-20 md:py-28 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="space-y-3 text-left max-w-2xl">
            <div className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-semibold">
              // ARCHITECTURAL SPECIFICATION
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-mono uppercase tracking-tight text-white">
              Engineered for Mission-Critical Production Reliability
            </h2>
            <p className="text-sm text-zinc-400 font-sans leading-relaxed">
              Designed from first principles for modern distributed systems: strict tenant isolation, human-verified git operations, and lightning-fast Redis pipelines.
            </p>
          </div>

          {/* Asymmetrical Bento Grid */}
          <BentoArchitectureGrid />
        </div>
      </section>

      {/* 6. End-to-End SRE Incident Lifecycle Pipeline */}
      <section id="pipeline" className="border-b border-zinc-850 py-20 md:py-28 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12 text-left">
          <div className="space-y-3 max-w-2xl">
            <div className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-semibold">
              // INCIDENT LIFECYCLE
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-mono uppercase tracking-tight text-white">
              End-to-End Autonomous Workflow
            </h2>
            <p className="text-sm text-zinc-400 font-sans leading-relaxed">
              From raw telemetry exception to merged pull request in under two minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 font-mono text-xs">
            {/* Step 1 */}
            <div className="border border-zinc-850 bg-zinc-950 p-5 space-y-3 rounded-none relative">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-semibold font-mono">01. INGESTION</span>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                Telemetry Push
              </h4>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                JSON logs hit <code className="text-zinc-200 bg-zinc-900 px-1 py-0.5">/api/telemetry/ingest</code> via HTTP or OpenTelemetry collector with bearer tokens.
              </p>
            </div>

            {/* Step 2 */}
            <div className="border border-zinc-850 bg-zinc-950 p-5 space-y-3 rounded-none relative">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-semibold font-mono">02. FINGERPRINTING</span>
                <span className="h-2 w-2 rounded-full bg-yellow-400" />
              </div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                Deduplication
              </h4>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Dynamic variables are stripped into a SHA-256 fingerprint, grouping identical anomalies into a single incident in Redis.
              </p>
            </div>

            {/* Step 3 */}
            <div className="border border-zinc-850 bg-zinc-950 p-5 space-y-3 rounded-none relative">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-semibold font-mono">03. TRIAGE & RAG</span>
                <span className="h-2 w-2 rounded-full bg-blue-400" />
              </div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                Agent War Room
              </h4>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                The SRE agent fetches repository ASTs and queries pgvector runbooks to isolate root cause within seconds.
              </p>
            </div>

            {/* Step 4 */}
            <div className="border border-emerald-900/60 bg-emerald-950/20 p-5 space-y-3 rounded-none relative">
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-400 font-bold font-mono">04. APPROVAL & PR</span>
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
              </div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                Remediation Dispatch
              </h4>
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                Engineers review the patch diff and approve with a single click. PulseGuard dispatches the verified PR directly to GitHub.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. High-Impact CTA Conversion Section */}
      <section className="py-24 md:py-32 bg-zinc-950 text-center border-b border-zinc-850 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08),transparent_70%)] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="inline-flex items-center gap-2 border border-zinc-800 bg-black px-3.5 py-1 text-xs font-mono text-zinc-400 rounded-full">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>SELF-HOSTED OR CLOUD // ZERO LOCK-IN</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold font-mono uppercase tracking-tight text-white">
            Transform Your Incident Response Today
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 font-sans max-w-xl mx-auto leading-relaxed">
            Deploy PulseGuard with PostgreSQL pgvector, Redis, and your choice of AI model provider. Stop waking up at 3 AM to read raw stack traces.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 font-mono text-xs sm:text-sm">
            <Link
              href="/signup"
              className="w-full sm:w-auto rounded-full px-7 py-3.5 bg-white text-black font-bold uppercase tracking-wider hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-lg group cursor-pointer"
            >
              <span>PROVISION WORKSPACE NOW</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/docs"
              className="w-full sm:w-auto rounded-full px-7 py-3.5 bg-black border border-zinc-800 text-zinc-300 font-medium uppercase tracking-wider hover:bg-zinc-900 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
            >
              <BookOpen className="h-4 w-4 text-zinc-500" />
              <span>READ ARCHITECTURE DOCS</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="py-8 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-zinc-500">
        <div className="flex items-center gap-2.5">
          <div className="h-3 w-3 bg-white rounded-none" />
          <span className="text-zinc-300 font-semibold uppercase">PULSEGUARD SRE ENGINE</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/docs" className="hover:text-zinc-300 transition-colors">
            DOCS
          </Link>
          <Link href="/login" className="hover:text-zinc-300 transition-colors">
            CONSOLE
          </Link>
          <Link href="/signup" className="hover:text-zinc-300 transition-colors">
            REGISTER
          </Link>
          <Link
            href="https://github.com/PrimeFold/pulseguard"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-300 transition-colors flex items-center gap-1"
          >
            GITHUB <ExternalLink className="h-3 w-3 inline" />
          </Link>
        </div>
      </footer>
    </div>
  );
}

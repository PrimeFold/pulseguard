import Link from "next/link";
import {
  ShieldAlert,
  Terminal,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Radio,
  ExternalLink,
  Flame,
  CheckCircle2,
  Lock,
  GitPullRequest,
  Database,
  Cpu,
  Zap,
  Layers,
  Code2,
  FileCode,
} from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { Badge } from "@/components/ui/badge";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 selection:bg-white selection:text-black font-sans antialiased overflow-x-hidden">
      {/* 1. Top Announcement Bar (Identical to Landing Page) */}
      <div className="border-b border-zinc-850 bg-zinc-950/90 px-4 py-2 text-center text-xs font-mono text-zinc-400">
        <span className="inline-flex items-center gap-2 flex-wrap justify-center">
          <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-zinc-200 font-semibold">PulseGuard Technical Specification &amp; API Reference</span>
          <span className="text-zinc-600 hidden sm:inline">•</span>
          <span className="hidden sm:inline">Engine v1.2 Release</span>
          <span className="text-zinc-600">•</span>
          <Link
            href="/"
            className="text-white hover:text-emerald-400 underline transition-colors inline-flex items-center gap-1 font-medium"
          >
            Return to Overview <ArrowRight className="h-3 w-3 inline" />
          </Link>
        </span>
      </div>

      {/* 2. Navigation Header (Matching Landing Page Height: h-14, max-w-7xl, text-xs) */}
      <header className="sticky top-0 z-50 border-b border-zinc-850 bg-black/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
              <div className="h-7 w-7 bg-white flex items-center justify-center rounded-none shadow-sm group-hover:scale-105 transition-transform">
                <ShieldAlert className="h-4 w-4 text-black" />
              </div>
              <span className="font-mono text-sm font-bold tracking-wider text-white uppercase">
                PulseGuard<span className="text-emerald-500">/docs</span>
              </span>
            </Link>

            <Badge
              variant="outline"
              className="hidden sm:inline-flex bg-zinc-950 border-zinc-800 text-emerald-400 text-xs font-mono rounded-none uppercase px-2.5 py-0.5 font-medium"
            >
              SPEC_v1.2 // ENTERPRISE
            </Badge>

            <nav className="hidden lg:flex items-center gap-5 text-xs font-mono">
              <a href="#overview" className="text-zinc-400 hover:text-white transition-colors">
                // ARCHITECTURE
              </a>
              <a href="#quickstart" className="text-zinc-400 hover:text-white transition-colors">
                // SETUP
              </a>
              <a href="#ingestion-api" className="text-zinc-400 hover:text-white transition-colors">
                // INGESTION_API
              </a>
              <a href="#sre-agent" className="text-zinc-400 hover:text-white transition-colors">
                // SRE_AGENT
              </a>
              <a href="#pgvector-rag" className="text-zinc-400 hover:text-white transition-colors">
                // VECTOR_RAG
              </a>
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
              <span>STAR ON GITHUB</span>
            </Link>
            <Link
              href="/"
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-zinc-400 hover:text-white transition-colors font-medium"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>HOME</span>
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

      {/* 3. Hero Header Section for Documentation (Consistent with Landing Page Rhythm) */}
      <section className="border-b border-zinc-850 bg-zinc-950/60 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4 text-left">
          <div className="inline-flex items-center gap-2 border border-zinc-800 bg-zinc-900/80 px-3 py-1 text-xs font-mono text-zinc-300 rounded-full">
            <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-ping" />
            <span className="text-emerald-400 font-semibold uppercase tracking-wider">
              OFFICIAL SYSTEM DOCUMENTATION
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400">ENGINEER REFERENCE</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold font-mono uppercase tracking-tight text-white max-w-4xl leading-tight">
            PulseGuard System Architecture &amp; API Reference
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 font-sans max-w-3xl leading-relaxed">
            Technical blueprint covering telemetry stream ingestion, deterministic SHA-256 anomaly clustering,
            pgvector semantic search, and human-in-the-loop autonomous SRE pull request generation.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono text-zinc-500">
            <span className="flex items-center gap-1.5 text-zinc-300 bg-zinc-900 px-2.5 py-1 border border-zinc-800">
              <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" /> CLUSTER V1.2
            </span>
            <span className="flex items-center gap-1.5 text-zinc-400 bg-zinc-900/50 px-2.5 py-1 border border-zinc-850">
              POSTGRESQL 16 + PGVECTOR
            </span>
            <span className="flex items-center gap-1.5 text-zinc-400 bg-zinc-900/50 px-2.5 py-1 border border-zinc-850">
              REDIS 7 ATOMIC INGESTION
            </span>
            <span className="flex items-center gap-1.5 text-zinc-400 bg-zinc-900/50 px-2.5 py-1 border border-zinc-850">
              VERCEL AI SDK 4.0
            </span>
          </div>
        </div>
      </section>

      {/* 4. Docs Body Layout (Max-Width 7xl Matching Landing Page) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex flex-col lg:flex-row gap-12">
        {/* Left Sticky Sidebar Navigation */}
        <aside className="w-full lg:w-72 shrink-0 space-y-6 lg:sticky lg:top-24 self-start text-xs font-mono">
          <div className="space-y-1.5 border-b border-zinc-850 pb-3">
            <span className="text-xs text-zinc-500 uppercase tracking-widest font-semibold block">
              // TABLE OF CONTENTS
            </span>
            <span className="text-[11px] text-zinc-600 block">
              9 CORE SYSTEM MODULES
            </span>
          </div>

          <nav className="space-y-1 text-zinc-400">
            <a
              href="#overview"
              className="flex items-center justify-between px-3 py-2 hover:bg-zinc-900 hover:text-white transition-colors border border-transparent hover:border-zinc-800"
            >
              <span>01. System Architecture</span>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
            </a>
            <a
              href="#quickstart"
              className="flex items-center justify-between px-3 py-2 hover:bg-zinc-900 hover:text-white transition-colors border border-transparent hover:border-zinc-800"
            >
              <span>02. Infrastructure Setup</span>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
            </a>
            <a
              href="#ingestion-api"
              className="flex items-center justify-between px-3 py-2 hover:bg-zinc-900 hover:text-white transition-colors border border-transparent hover:border-zinc-800"
            >
              <span>03. Telemetry Ingest API</span>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
            </a>
            <a
              href="#fingerprinting"
              className="flex items-center justify-between px-3 py-2 hover:bg-zinc-900 hover:text-white transition-colors border border-transparent hover:border-zinc-800"
            >
              <span>04. Anomaly Clustering</span>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
            </a>
            <a
              href="#sre-agent"
              className="flex items-center justify-between px-3 py-2 hover:bg-zinc-900 hover:text-white transition-colors border border-transparent hover:border-zinc-800"
            >
              <span>05. Autonomous SRE Agent</span>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
            </a>
            <a
              href="#pgvector-rag"
              className="flex items-center justify-between px-3 py-2 hover:bg-zinc-900 hover:text-white transition-colors border border-transparent hover:border-zinc-800"
            >
              <span>06. pgvector Semantic RAG</span>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
            </a>
            <a
              href="#custom-ai"
              className="flex items-center justify-between px-3 py-2 hover:bg-zinc-900 hover:text-white transition-colors border border-transparent hover:border-zinc-800"
            >
              <span>07. Custom AI &amp; Encryption</span>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
            </a>
            <a
              href="#github-hotfix"
              className="flex items-center justify-between px-3 py-2 hover:bg-zinc-900 hover:text-white transition-colors border border-transparent hover:border-zinc-800"
            >
              <span>08. GitHub PR Hotfixes</span>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
            </a>
            <a
              href="#redis-caching"
              className="flex items-center justify-between px-3 py-2 hover:bg-zinc-900 hover:text-white transition-colors border border-transparent hover:border-zinc-800"
            >
              <span>09. Redis Caching &amp; Limits</span>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
            </a>
          </nav>

          {/* Quick Reference Box (Double-Bezel) */}
          <div className="p-2 rounded-xl bg-gradient-to-b from-zinc-800/40 to-black/80 border border-white/10 shadow-sm">
            <div className="p-3.5 bg-black border border-zinc-850 rounded-lg space-y-2">
              <span className="text-xs text-zinc-200 font-semibold uppercase flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-emerald-400" /> API Authentication
              </span>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                All telemetry ingestion endpoints require an organization API key passed via the{" "}
                <code className="text-emerald-400 bg-zinc-900 px-1 py-0.5">Authorization: Bearer</code> header.
              </p>
            </div>
          </div>
        </aside>

        {/* Right Main Content Area */}
        <main className="flex-1 min-w-0 space-y-16 text-left">
          {/* Section 1: Overview */}
          <section id="overview" className="space-y-4">
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
              <span className="text-emerald-400 font-bold">01</span>
              <span>/ ARCHITECTURE OVERVIEW</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-mono uppercase tracking-tight text-white">
              System Architecture &amp; Tenancy
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans max-w-3xl">
              PulseGuard is an enterprise multi-tenant, AI-native incident response platform. It unifies high-throughput
              telemetry ingest, automated error clustering, pgvector runbook retrieval, and sandboxed GitHub pull
              request dispatching under strict tenant-level RBAC isolation.
            </p>

            <div className="border border-zinc-850 bg-zinc-950/80 p-5 font-mono text-xs text-zinc-300 space-y-3 rounded-none">
              <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">// CORE STACK SPECIFICATION</div>
              <ul className="space-y-2 text-zinc-300 list-disc list-inside font-sans text-sm">
                <li><strong className="text-white font-mono text-xs">Framework:</strong> Next.js 16 (App Router), React 19, TypeScript</li>
                <li><strong className="text-white font-mono text-xs">Database Layer:</strong> PostgreSQL 16 with pgvector extension via Prisma 7</li>
                <li><strong className="text-white font-mono text-xs">Distributed Cache:</strong> Redis (ioredis) for sliding-window rate limiting &amp; fingerprint deduplication</li>
                <li><strong className="text-white font-mono text-xs">AI Orchestration:</strong> Vercel AI SDK 4.0 with Google Gemini, Anthropic Claude, OpenAI, and Groq BYOM</li>
                <li><strong className="text-white font-mono text-xs">Git Automation:</strong> Octokit with fine-grained GitHub App installations and token caching</li>
              </ul>
            </div>
          </section>

          {/* Section 2: Quickstart */}
          <section id="quickstart" className="space-y-4 border-t border-zinc-850 pt-10">
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
              <span className="text-emerald-400 font-bold">02</span>
              <span>/ QUICKSTART &amp; LOCAL SETUP</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-mono uppercase tracking-tight text-white">
              Infrastructure Setup
            </h2>
            <p className="text-sm text-zinc-400 font-sans max-w-3xl leading-relaxed">
              PulseGuard can be deployed on any Docker-compatible infrastructure. Spin up PostgreSQL with pgvector and
              Redis using the included container configuration:
            </p>

            <div className="border border-zinc-850 bg-black p-4 sm:p-5 font-mono text-xs sm:text-sm text-zinc-300 overflow-x-auto space-y-2.5 rounded-none select-all">
              <div className="text-zinc-500">// 1. Boot up Docker containers (PostgreSQL + pgvector &amp; Redis)</div>
              <div className="text-emerald-400 font-bold">docker-compose up -d</div>
              <div className="text-zinc-500 pt-2">// 2. Push Prisma database schema &amp; generate client</div>
              <div className="text-emerald-400 font-bold">bunx prisma db push &amp;&amp; bunx prisma generate</div>
              <div className="text-zinc-500 pt-2">// 3. Start Next.js development server</div>
              <div className="text-emerald-400 font-bold">bun run dev</div>
            </div>
          </section>

          {/* Section 3: Ingestion API */}
          <section id="ingestion-api" className="space-y-4 border-t border-zinc-850 pt-10">
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
              <span className="text-emerald-400 font-bold">03</span>
              <span>/ TELEMETRY INGESTION API</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-mono uppercase tracking-tight text-white">
              Ingestion Endpoint Specification
            </h2>
            <p className="text-sm text-zinc-400 font-sans max-w-3xl leading-relaxed">
              Send single error telemetry objects or bulk batches to the public ingestion endpoint. Requests are
              validated via Zod schemas and checked against Redis rate-limit windows.
            </p>

            <div className="border border-zinc-850 bg-zinc-950 p-3.5 font-mono text-xs sm:text-sm text-zinc-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold px-2 py-0.5 bg-emerald-950/40 border border-emerald-900/50">
                  POST
                </span>
                <span className="text-white font-semibold">/api/telemetry/ingest</span>
              </div>
              <Badge variant="outline" className="rounded-none bg-black border-zinc-800 text-xs text-zinc-400 font-mono py-1 px-2.5">
                RATE LIMIT: 50 REQ / MIN
              </Badge>
            </div>

            <div className="border border-zinc-850 bg-black p-4 sm:p-5 font-mono text-xs text-zinc-300 overflow-x-auto space-y-2 rounded-none select-all">
              <div className="text-zinc-500">// cURL Request Example: Ingest Anomaly Log</div>
              <pre className="text-zinc-300 leading-relaxed font-mono">
{`curl -X POST https://pulseguard.app/api/telemetry/ingest \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer pg_live_9f8a1b2c3d4e..." \\
  -d '{
    "service": "checkout-api",
    "level": "ERROR",
    "message": "StripeClientException: PaymentIntent null pointer on customer cus_92819",
    "metadata": { "statusCode": 500, "region": "us-east-1" }
  }'`}
              </pre>
            </div>
          </section>

          {/* Section 4: Fingerprinting */}
          <section id="fingerprinting" className="space-y-4 border-t border-zinc-850 pt-10">
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
              <span className="text-emerald-400 font-bold">04</span>
              <span>/ ERROR FINGERPRINTING ENGINE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-mono uppercase tracking-tight text-white">
              Deterministic Anomaly Clustering
            </h2>
            <p className="text-sm text-zinc-400 font-sans max-w-3xl leading-relaxed">
              To prevent alert storms and fatigue, dynamic variables (UUIDs, timestamps, hex tokens, numeric IDs, IP
              addresses) are sanitized into canonical tokens before SHA-256 hashing.
            </p>

            <div className="border border-zinc-850 bg-black p-4 sm:p-5 font-mono text-xs space-y-3 rounded-none">
              <div className="text-zinc-500">// Sanitization Transformation Pipeline</div>
              <div className="space-y-2 text-zinc-400 font-mono text-xs">
                <p className="text-red-400">
                  &minus; &quot;Database connection timeout at 192.168.1.1:5432 for customer 9821 with token 0x9f8a7b...&quot;
                </p>
                <p className="text-emerald-400">
                  &plus; &quot;Database connection timeout at &lt;IP&gt; for customer &lt;NUM&gt; with token &lt;HEX&gt;&quot;
                </p>
                <p className="text-zinc-200 font-bold pt-1">
                  &rArr; Canonical SHA-256 Fingerprint:{" "}
                  <code className="text-emerald-400 bg-zinc-900 px-2 py-0.5 border border-zinc-800">
                    SIG_DB_TIMEOUT_e4a8b1c9
                  </code>
                </p>
              </div>
            </div>
          </section>

          {/* Section 5: SRE Agent */}
          <section id="sre-agent" className="space-y-4 border-t border-zinc-850 pt-10">
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
              <span className="text-emerald-400 font-bold">05</span>
              <span>/ AUTONOMOUS SRE AGENT</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-mono uppercase tracking-tight text-white">
              Agentic Tool Calling &amp; Stream Protocol
            </h2>
            <p className="text-sm text-zinc-400 font-sans max-w-3xl leading-relaxed">
              Inside each incident War Room, the autonomous SRE agent executes sandboxed tools to correlate telemetry,
              pull relevant source code, and propose targeted remediation diffs:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              <div className="border border-zinc-850 bg-zinc-950 p-4 space-y-2 rounded-none">
                <div className="text-white font-semibold flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-emerald-400" />
                  <span>query_telemetry_logs</span>
                </div>
                <p className="text-zinc-400 font-sans text-xs leading-relaxed">
                  Queries recent ERROR/FATAL logs by service and time window to isolate crash traces.
                </p>
              </div>
              <div className="border border-zinc-850 bg-zinc-950 p-4 space-y-2 rounded-none">
                <div className="text-white font-semibold flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-blue-400" />
                  <span>fetch_repo_file</span>
                </div>
                <p className="text-zinc-400 font-sans text-xs leading-relaxed">
                  Uses authenticated GitHub App tokens to fetch the exact breaking source code lines.
                </p>
              </div>
              <div className="border border-zinc-850 bg-zinc-950 p-4 space-y-2 rounded-none">
                <div className="text-white font-semibold flex items-center gap-2">
                  <GitPullRequest className="h-4 w-4 text-purple-400" />
                  <span>propose_hotfix</span>
                </div>
                <p className="text-zinc-400 font-sans text-xs leading-relaxed">
                  Generates an isolated diff patch and presents a cryptographic sign-off card to engineers.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6: pgvector RAG */}
          <section id="pgvector-rag" className="space-y-4 border-t border-zinc-850 pt-10">
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
              <span className="text-emerald-400 font-bold">06</span>
              <span>/ PGVECTOR SEMANTIC RAG</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-mono uppercase tracking-tight text-white">
              Document Ingestion &amp; Matryoshka Vector Embeddings
            </h2>
            <p className="text-sm text-zinc-400 font-sans max-w-3xl leading-relaxed">
              PDF and Markdown runbooks are chunked into 600-character segments with 60-character sliding overlap.
              Embeddings are sliced using Matryoshka Representation Learning (MRL) down to 736 dimensions to match
              database schema constraints without precision degradation.
            </p>

            <div className="border border-zinc-850 bg-black p-4 sm:p-5 font-mono text-xs sm:text-sm text-zinc-300 overflow-x-auto space-y-2 rounded-none select-all">
              <div className="text-zinc-500">// Vector SQL Insert via Prisma Transaction</div>
              <pre className="text-zinc-300 font-mono text-xs leading-relaxed">
{`INSERT INTO "DocumentChunk" ("id", "documentId", "chunkIndex", "content", "embedding", "createdAt")
VALUES (
  gen_random_uuid(), 
  document_id, 
  chunk_index, 
  chunk_content, 
  chunk_vector::vector(736), 
  NOW()
);`}
              </pre>
            </div>
          </section>

          {/* Section 7: Custom AI Providers */}
          <section id="custom-ai" className="space-y-4 border-t border-zinc-850 pt-10">
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
              <span className="text-emerald-400 font-bold">07</span>
              <span>/ CUSTOM AI PROVIDERS &amp; ENCRYPTION</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-mono uppercase tracking-tight text-white">
              AES-256 Key Encryption &amp; Model Catalogs
            </h2>
            <p className="text-sm text-zinc-400 font-sans max-w-3xl leading-relaxed">
              Organizations provide their own AI provider credentials. API keys are encrypted at rest using AES-256
              symmetric envelope encryption with random initialization vectors (IV).
            </p>

            <div className="border border-zinc-850 bg-zinc-950 p-4 font-mono text-xs space-y-2 rounded-none">
              <div className="text-zinc-400 font-semibold uppercase">// KEY VAULT ENCRYPTION PROTOCOL</div>
              <p className="text-zinc-300 font-sans text-sm leading-relaxed">
                Key input &rarr; AES-256 cipher (Random IV + SHA-256 server secret) &rarr; Stored in PostgreSQL as{" "}
                <code className="text-emerald-400 bg-zinc-900 px-1 py-0.5 font-mono text-xs">iv_hex:cipher_hex</code>.
                Only masked key tokens (<code className="text-zinc-200 font-mono text-xs">AIza...4F10</code>) are returned to client browsers.
              </p>
            </div>
          </section>

          {/* Section 8: GitHub PR */}
          <section id="github-hotfix" className="space-y-4 border-t border-zinc-850 pt-10">
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
              <span className="text-emerald-400 font-bold">08</span>
              <span>/ GITHUB HOTFIX DISPATCH</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-mono uppercase tracking-tight text-white">
              Human-in-the-Loop Git Automation
            </h2>
            <p className="text-sm text-zinc-400 font-sans max-w-3xl leading-relaxed">
              The AI agent is physically incapable of merging or pushing code autonomously. When an authorized engineer
              reviews the diff and clicks &quot;Approve &amp; Open PR&quot;, Octokit executes an atomic 5-step git transaction:
            </p>

            <div className="border border-zinc-850 bg-black p-4 sm:p-5 font-mono text-xs text-zinc-400 space-y-2 rounded-none">
              <p>1. <code className="text-emerald-400">getRef(&apos;heads/main&apos;)</code> &rarr; Reads latest upstream commit SHA</p>
              <p>2. <code className="text-emerald-400">createRef(&apos;refs/heads/hotfix/...&apos;)</code> &rarr; Provisions isolated hotfix branch</p>
              <p>3. <code className="text-emerald-400">getContent(filePath)</code> &rarr; Extracts existing repository file blob SHA</p>
              <p>4. <code className="text-emerald-400">createOrUpdateFileContents(...)</code> &rarr; Commits patched file with signed attribution</p>
              <p>5. <code className="text-emerald-400">pulls.create(...)</code> &rarr; Dispatches GitHub Pull Request with full incident RCA</p>
            </div>
          </section>

          {/* Section 9: Redis Caching */}
          <section id="redis-caching" className="space-y-4 border-t border-zinc-850 pt-10 pb-16">
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
              <span className="text-emerald-400 font-bold">09</span>
              <span>/ REDIS CACHING &amp; RATE LIMITS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-mono uppercase tracking-tight text-white">
              Distributed Redis Caching Layer
            </h2>
            <p className="text-sm text-zinc-400 font-sans max-w-3xl leading-relaxed">
              High-frequency telemetry and dashboard operations are cached in Redis to eliminate database bottlenecks:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              <div className="border border-zinc-850 bg-zinc-950 p-4 space-y-1.5 rounded-none">
                <span className="text-zinc-500 text-[10px] uppercase font-semibold">CACHE: RATE_LIMIT</span>
                <p className="text-white font-semibold">60s Sliding IP Window</p>
                <p className="text-zinc-400 font-sans text-xs leading-relaxed">Atomic INCR + PEXPIRE counters protect public endpoints.</p>
              </div>
              <div className="border border-zinc-850 bg-zinc-950 p-4 space-y-1.5 rounded-none">
                <span className="text-zinc-500 text-[10px] uppercase font-semibold">CACHE: INCIDENT_LOOKUP</span>
                <p className="text-white font-semibold">300s Fingerprint Cache</p>
                <p className="text-zinc-400 font-sans text-xs leading-relaxed">Bypasses database queries during million-log floods.</p>
              </div>
              <div className="border border-zinc-850 bg-zinc-950 p-4 space-y-1.5 rounded-none">
                <span className="text-zinc-500 text-[10px] uppercase font-semibold">CACHE: AI_MODELS</span>
                <p className="text-white font-semibold">24h Provider Catalog</p>
                <p className="text-zinc-400 font-sans text-xs leading-relaxed">Ensures instant zero-lag organization settings rendering.</p>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* 5. Footer (Matching Landing Page Max-Width 7xl and Text-Xs) */}
      <footer className="border-t border-zinc-850 py-8 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-zinc-500">
        <div className="flex items-center gap-2.5">
          <div className="h-3 w-3 bg-white rounded-none" />
          <span className="text-zinc-300 font-semibold uppercase">PULSEGUARD SRE DOCS</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/" className="hover:text-zinc-300 transition-colors">
            HOME
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

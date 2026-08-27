import Link from "next/link";
import { 
  ShieldAlert, 
  Terminal, 
  Layers, 
  Database, 
  Cpu, 
  GitPullRequest, 
  Key, 
  Zap, 
  Code2, 
  BookOpen, 
  ArrowLeft,
  Check,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 selection:bg-white selection:text-black font-sans">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-7 w-7 bg-white flex items-center justify-center rounded-none">
                <ShieldAlert className="h-4 w-4 text-black" />
              </div>
              <span className="font-mono text-sm font-semibold tracking-wider text-white uppercase">
                PulseGuard<span className="text-zinc-600">/docs</span>
              </span>
            </Link>
            <Badge variant="outline" className="hidden sm:inline-flex bg-zinc-950 border-zinc-800 text-zinc-400 text-[10px] font-mono rounded-none uppercase">
              SPECIFICATION_v1.0
            </Badge>
          </div>

          <div className="flex items-center gap-4 font-mono text-xs">
            <Link href="/" className="text-zinc-400 hover:text-white flex items-center gap-1 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> BACK TO HOME
            </Link>
            <Link
              href="/login"
              className="px-3 py-1.5 bg-white text-black font-semibold hover:bg-zinc-200 transition-colors"
            >
              CONSOLE &rarr;
            </Link>
          </div>
        </div>
      </header>

      {/* Docs Body Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col md:flex-row gap-10">
        {/* Left Sticky Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0 space-y-6 md:sticky md:top-20 self-start text-xs font-mono">
          <div className="space-y-1 border-b border-zinc-800 pb-4">
            <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-semibold">// NAVIGATION</span>
          </div>

          <nav className="space-y-1 text-zinc-400">
            <a href="#overview" className="block px-2.5 py-1.5 hover:bg-zinc-900 hover:text-white transition-colors">
              01. System Architecture
            </a>
            <a href="#quickstart" className="block px-2.5 py-1.5 hover:bg-zinc-900 hover:text-white transition-colors">
              02. Local Setup & Docker
            </a>
            <a href="#ingestion-api" className="block px-2.5 py-1.5 hover:bg-zinc-900 hover:text-white transition-colors">
              03. Telemetry Ingest API
            </a>
            <a href="#fingerprinting" className="block px-2.5 py-1.5 hover:bg-zinc-900 hover:text-white transition-colors">
              04. Anomaly Fingerprinting
            </a>
            <a href="#sre-agent" className="block px-2.5 py-1.5 hover:bg-zinc-900 hover:text-white transition-colors">
              05. Autonomous SRE Agent
            </a>
            <a href="#pgvector-rag" className="block px-2.5 py-1.5 hover:bg-zinc-900 hover:text-white transition-colors">
              06. pgvector Semantic RAG
            </a>
            <a href="#custom-ai" className="block px-2.5 py-1.5 hover:bg-zinc-900 hover:text-white transition-colors">
              07. Custom AI & Encryption
            </a>
            <a href="#github-hotfix" className="block px-2.5 py-1.5 hover:bg-zinc-900 hover:text-white transition-colors">
              08. GitHub PR Hotfix Flow
            </a>
            <a href="#redis-caching" className="block px-2.5 py-1.5 hover:bg-zinc-900 hover:text-white transition-colors">
              09. Redis Caching & Limits
            </a>
          </nav>

          <div className="border border-zinc-800 bg-zinc-950 p-4 space-y-2 text-[11px]">
            <span className="text-zinc-300 font-semibold uppercase">Quick Reference</span>
            <p className="text-zinc-500 font-sans">
              All API routes require an organization API key passed via the <code className="text-zinc-300">x-api-key</code> or <code className="text-zinc-300">Authorization: Bearer</code> header.
            </p>
          </div>
        </aside>

        {/* Right Main Content Area */}
        <main className="flex-1 min-w-0 space-y-16 text-left">
          {/* Section 1: Overview */}
          <section id="overview" className="space-y-4">
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
              <span className="text-emerald-400">01</span>
              <span>/ ARCHITECTURE OVERVIEW</span>
            </div>
            <h1 className="text-3xl font-bold font-mono uppercase tracking-tight text-white">
              System Architecture & Tenancy
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans">
              PulseGuard is a multi-tenant, AI-native incident response console. It unites raw telemetry streams, internal runbooks, and GitHub repositories into real-time collaborative War Rooms powered by autonomous LLM agents.
            </p>

            <div className="border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs text-zinc-300 space-y-2">
              <div className="text-zinc-500 font-semibold uppercase">// CORE STACK SPECIFICATION</div>
              <ul className="space-y-1 text-zinc-400 list-disc list-inside">
                <li><strong className="text-zinc-200">Framework:</strong> Next.js 16 (App Router), React 19, TypeScript</li>
                <li><strong className="text-zinc-200">Database:</strong> PostgreSQL 16 with pgvector extension via Prisma ORM</li>
                <li><strong className="text-zinc-200">Distributed Cache:</strong> Redis (ioredis) for rate limiting &amp; deduplication</li>
                <li><strong className="text-zinc-200">AI Framework:</strong> Vercel AI SDK (streamText) with Gemini 3.5 / Claude 3.5</li>
                <li><strong className="text-zinc-200">Git Integration:</strong> Octokit with fine-grained GitHub App tokens</li>
              </ul>
            </div>
          </section>

          {/* Section 2: Quickstart */}
          <section id="quickstart" className="space-y-4 border-t border-zinc-800 pt-12">
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
              <span className="text-emerald-400">02</span>
              <span>/ QUICKSTART &amp; LOCAL SETUP</span>
            </div>
            <h2 className="text-2xl font-bold font-mono uppercase tracking-tight text-white">
              Infrastructure Setup
            </h2>
            <p className="text-sm text-zinc-400 font-sans">
              Spin up PostgreSQL with pgvector and Redis using Docker Compose:
            </p>

            <div className="border border-zinc-800 bg-black p-4 font-mono text-xs text-zinc-300 overflow-x-auto space-y-2">
              <div className="text-zinc-500">// 1. Boot up Docker containers</div>
              <div className="text-emerald-400">docker-compose up -d</div>
              <div className="text-zinc-500 pt-2">// 2. Push Prisma database schema &amp; generate client</div>
              <div className="text-emerald-400">bunx prisma db push &amp;&amp; bunx prisma generate</div>
              <div className="text-zinc-500 pt-2">// 3. Start local Next.js dev server</div>
              <div className="text-emerald-400">bun run dev</div>
            </div>
          </section>

          {/* Section 3: Ingestion API */}
          <section id="ingestion-api" className="space-y-4 border-t border-zinc-800 pt-12">
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
              <span className="text-emerald-400">03</span>
              <span>/ TELEMETRY INGESTION API</span>
            </div>
            <h2 className="text-2xl font-bold font-mono uppercase tracking-tight text-white">
              Ingestion Endpoint Specification
            </h2>
            <p className="text-sm text-zinc-400 font-sans">
              Send single error logs or bulk arrays to the public ingestion route:
            </p>

            <div className="border border-zinc-800 bg-zinc-950 p-3 font-mono text-xs text-zinc-300 flex items-center justify-between">
              <div>
                <span className="text-emerald-400 font-bold">POST</span> <span className="text-white">/api/telemetry/ingest</span>
              </div>
              <Badge variant="outline" className="rounded-none bg-black border-zinc-800 text-[10px] text-zinc-400 font-mono">
                RATE_LIMIT: 50/min
              </Badge>
            </div>

            <div className="border border-zinc-800 bg-black p-4 font-mono text-xs text-zinc-300 overflow-x-auto space-y-2">
              <div className="text-zinc-500">// cURL Example: Ingest Error Log</div>
              <pre className="text-zinc-300 leading-relaxed">
{`curl -X POST https://your-domain.com/api/telemetry/ingest \\
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
          <section id="fingerprinting" className="space-y-4 border-t border-zinc-800 pt-12">
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
              <span className="text-emerald-400">04</span>
              <span>/ ERROR FINGERPRINTING ENGINE</span>
            </div>
            <h2 className="text-2xl font-bold font-mono uppercase tracking-tight text-white">
              Deterministic Anomaly Clustering
            </h2>
            <p className="text-sm text-zinc-400 font-sans">
              To prevent alert fatigue, dynamic parameters (UUIDs, timestamps, hex tokens, numeric IDs, IP addresses) are sanitized into canonical representations before SHA-256 hashing.
            </p>

            <div className="border border-zinc-800 bg-black p-4 font-mono text-xs space-y-3">
              <div className="text-zinc-500">// Regex Transformation Pipeline</div>
              <div className="space-y-1 text-zinc-400">
                <p className="text-red-400">&minus; &quot;Database error at 192.168.1.1:5432 for user 9821 with token 0x9f8a7b...&quot;</p>
                <p className="text-emerald-400">&plus; &quot;Database error at &lt;IP&gt; for user &lt;NUM&gt; with token &lt;HEX&gt;&quot;</p>
                <p className="text-zinc-300 font-bold">&rArr; SHA-256 Signature: <code className="text-white bg-zinc-900 px-1 border border-zinc-800">#e4a8b1c902d5</code></p>
              </div>
            </div>
          </section>

          {/* Section 5: SRE Agent */}
          <section id="sre-agent" className="space-y-4 border-t border-zinc-800 pt-12">
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
              <span className="text-emerald-400">05</span>
              <span>/ AUTONOMOUS SRE AGENT</span>
            </div>
            <h2 className="text-2xl font-bold font-mono uppercase tracking-tight text-white">
              Agentic Tool Calling &amp; Stream Protocol
            </h2>
            <p className="text-sm text-zinc-400 font-sans">
              The SRE agent is provided 3 autonomous tools within the War Room chat:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              <div className="border border-zinc-800 bg-zinc-950 p-4 space-y-2">
                <div className="text-zinc-200 font-semibold">1. query_telemetry_logs</div>
                <p className="text-zinc-500 font-sans text-[11px]">
                  Queries recent ERROR/FATAL logs by service and timeframe to extract stack traces.
                </p>
              </div>
              <div className="border border-zinc-800 bg-zinc-950 p-4 space-y-2">
                <div className="text-zinc-200 font-semibold">2. fetch_repo_file</div>
                <p className="text-zinc-500 font-sans text-[11px]">
                  Uses Octokit to read the exact line of breaking source code from GitHub.
                </p>
              </div>
              <div className="border border-zinc-800 bg-zinc-950 p-4 space-y-2">
                <div className="text-zinc-200 font-semibold">3. propose_hotfix</div>
                <p className="text-zinc-500 font-sans text-[11px]">
                  Generates an actionable diff patch and yields a human approval request card.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6: pgvector RAG */}
          <section id="pgvector-rag" className="space-y-4 border-t border-zinc-800 pt-12">
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
              <span className="text-emerald-400">06</span>
              <span>/ PGVECTOR SEMANTIC RAG</span>
            </div>
            <h2 className="text-2xl font-bold font-mono uppercase tracking-tight text-white">
              Document Ingestion &amp; Vector Embeddings
            </h2>
            <p className="text-sm text-zinc-400 font-sans">
              PDF and Markdown runbooks are parsed into 600-character chunks with 60-character overlap. Embeddings are generated using Gemini embedding models and indexed via PostgreSQL <code className="text-zinc-200 bg-zinc-900 px-1 border border-zinc-800">::vector</code>.
            </p>

            <div className="border border-zinc-800 bg-black p-4 font-mono text-xs text-zinc-300 overflow-x-auto space-y-2">
              <div className="text-zinc-500">// Vector SQL Insert via Prisma Transaction</div>
              <pre className="text-zinc-300">
{`INSERT INTO "DocumentChunk" ("id", "documentId", "chunkIndex", "content", "embedding", "createdAt")
VALUES (gen_random_uuid(), document_id, chunk_index, chunk_content, chunk_vector::vector, NOW());`}
              </pre>
            </div>
          </section>

          {/* Section 7: Custom AI Providers */}
          <section id="custom-ai" className="space-y-4 border-t border-zinc-800 pt-12">
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
              <span className="text-emerald-400">07</span>
              <span>/ CUSTOM AI PROVIDERS &amp; ENCRYPTION</span>
            </div>
            <h2 className="text-2xl font-bold font-mono uppercase tracking-tight text-white">
              AES-256 Key Encryption &amp; Live Model Discovery
            </h2>
            <p className="text-sm text-zinc-400 font-sans">
              Organizations can configure their own AI providers (Google Gemini, OpenAI, Anthropic Claude, Groq, OpenRouter). Keys are encrypted with symmetric AES-256-CBC at rest. Model lists are fetched live from provider APIs and cached in Redis for 24 hours.
            </p>

            <div className="border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs space-y-2">
              <div className="text-zinc-500 font-semibold uppercase">// KEY ENCRYPTION PROTOCOL</div>
              <p className="text-zinc-400 font-sans text-xs">
                Key input &rarr; AES-256 cipher (Random IV + SHA-256 server secret) &rarr; Stored as <code className="text-zinc-200">iv_hex:cipher_hex</code>. Only the first 4 and last 4 characters are ever displayed to the client (<code className="text-zinc-200">AIza...4F10</code>).
              </p>
            </div>
          </section>

          {/* Section 8: GitHub PR */}
          <section id="github-hotfix" className="space-y-4 border-t border-zinc-800 pt-12">
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
              <span className="text-emerald-400">08</span>
              <span>/ GITHUB HOTFIX DISPATCH</span>
            </div>
            <h2 className="text-2xl font-bold font-mono uppercase tracking-tight text-white">
              Human-in-the-Loop Git Automation
            </h2>
            <p className="text-sm text-zinc-400 font-sans">
              The agent cannot push code without explicit human verification. When an authorized engineer clicks &quot;Approve &amp; Open PR&quot;, Octokit performs a 5-step transaction:
            </p>

            <div className="border border-zinc-800 bg-black p-4 font-mono text-xs text-zinc-400 space-y-1.5">
              <p>1. <code className="text-zinc-200">getRef(&apos;heads/main&apos;)</code> &rarr; Fetches current base SHA</p>
              <p>2. <code className="text-zinc-200">createRef(&apos;refs/heads/hotfix/...&apos;)</code> &rarr; Creates isolated branch</p>
              <p>3. <code className="text-zinc-200">getContent(filePath)</code> &rarr; Retrieves existing file blob SHA</p>
              <p>4. <code className="text-zinc-200">createOrUpdateFileContents(...)</code> &rarr; Commits Base64 patch</p>
              <p>5. <code className="text-zinc-200">pulls.create(...)</code> &rarr; Opens Pull Request with incident context</p>
            </div>
          </section>

          {/* Section 9: Redis Caching */}
          <section id="redis-caching" className="space-y-4 border-t border-zinc-800 pt-12 pb-16">
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
              <span className="text-emerald-400">09</span>
              <span>/ REDIS CACHING &amp; RATE LIMITS</span>
            </div>
            <h2 className="text-2xl font-bold font-mono uppercase tracking-tight text-white">
              Distributed Redis Caching Layer
            </h2>
            <p className="text-sm text-zinc-400 font-sans">
              High-throughput operations are cached in Redis to eliminate database bottlenecks:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              <div className="border border-zinc-800 bg-zinc-950 p-4 space-y-1">
                <span className="text-zinc-500 text-[10px]">CACHE: RATE_LIMIT</span>
                <p className="text-zinc-200 font-semibold">60s Sliding IP Window</p>
                <p className="text-zinc-500 font-sans text-[11px]">Atomic INCR + PEXPIRE counters.</p>
              </div>
              <div className="border border-zinc-800 bg-zinc-950 p-4 space-y-1">
                <span className="text-zinc-500 text-[10px]">CACHE: INCIDENT_LOOKUP</span>
                <p className="text-zinc-200 font-semibold">300s Fingerprint Cache</p>
                <p className="text-zinc-500 font-sans text-[11px]">Bypasses DB on log floods.</p>
              </div>
              <div className="border border-zinc-800 bg-zinc-950 p-4 space-y-1">
                <span className="text-zinc-500 text-[10px]">CACHE: AI_MODELS</span>
                <p className="text-zinc-200 font-semibold">24h Provider Catalog</p>
                <p className="text-zinc-500 font-sans text-[11px]">Instant UI settings rendering.</p>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 bg-white" />
          <span className="text-zinc-300 font-semibold">PULSEGUARD_SRE_DOCS</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/" className="hover:text-zinc-300 transition-colors">HOME</Link>
          <Link href="/login" className="hover:text-zinc-300 transition-colors">CONSOLE</Link>
          <Link href="/signup" className="hover:text-zinc-300 transition-colors">REGISTER</Link>
        </div>
      </footer>
    </div>
  );
}

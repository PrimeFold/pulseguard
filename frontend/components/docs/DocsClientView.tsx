"use client";

import { useState, useEffect, useRef } from "react";
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
  Search,
  Copy,
  Check,
  Hash,
  Share2,
  Sliders,
  Workflow,
  Sparkles,
  ShieldCheck,
  Server,
  AlertTriangle,
} from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SectionItem {
  id: string;
  title: string;
  category: string;
  badge?: string;
  number: string;
}

const SECTIONS: SectionItem[] = [
  { id: "overview", title: "System Architecture", category: "Core Concepts", number: "01", badge: "CORE" },
  { id: "quickstart", title: "Infrastructure Setup", category: "Core Concepts", number: "02", badge: "DOCKER" },
  { id: "ingestion-api", title: "Telemetry Ingestion API", category: "Data Pipeline", number: "03", badge: "HTTP_POST" },
  { id: "fingerprinting", title: "Anomaly Clustering", category: "Data Pipeline", number: "04", badge: "SHA-256" },
  { id: "sre-agent", title: "Autonomous SRE Agent", category: "Agentic Engine", number: "05", badge: "WAR_ROOM" },
  { id: "pgvector-rag", title: "pgvector Semantic RAG", category: "Agentic Engine", number: "06", badge: "VECTOR_736" },
  { id: "custom-ai", title: "Custom AI & Key Vault", category: "Security & Tenancy", number: "07", badge: "AES-256" },
  { id: "github-hotfix", title: "GitHub PR Hotfixes", category: "Security & Tenancy", number: "08", badge: "OCTOKIT" },
  { id: "redis-caching", title: "Distributed Caching & Limits", category: "Security & Tenancy", number: "09", badge: "REDIS_7" },
];

export function DocsClientView() {
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Tab state for code examples
  const [ingestionTab, setIngestionTab] = useState<"curl" | "typescript" | "python" | "go">("curl");
  const [setupTab, setSetupTab] = useState<"docker" | "manual">("docker");

  // ScrollSpy to highlight currently active section in sidebar
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -65% 0px" }
    );

    SECTIONS.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const filteredSections = searchQuery.trim()
    ? SECTIONS.filter(
        (s) =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : SECTIONS;

  // Categories
  const categories = Array.from(new Set(filteredSections.map((s) => s.category)));

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-white selection:text-black font-sans antialiased relative overflow-x-hidden">
      {/* Global Background Grid Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_75%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-10 pointer-events-none" />

      {/* Top Announcement Bar */}
      <div className="border-b border-zinc-900 bg-black/90 px-4 py-2 text-center text-xs font-mono text-zinc-400 relative z-20">
        <span className="inline-flex items-center gap-2 flex-wrap justify-center">
          <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-zinc-200 font-semibold">PulseGuard Architecture &amp; Developer Specification</span>
          <span className="text-zinc-700 hidden sm:inline">•</span>
          <span className="text-zinc-500 hidden sm:inline">Enterprise SRE v1.2</span>
          <span className="text-zinc-700">•</span>
          <Link
            href="/"
            className="text-emerald-400 hover:text-white underline transition-colors inline-flex items-center gap-1 font-medium"
          >
            Back to Product Overview <ArrowRight className="h-3 w-3 inline" />
          </Link>
        </span>
      </div>

      {/* Header Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-zinc-900 bg-black/90 backdrop-blur-md">
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
              className="hidden sm:inline-flex bg-zinc-950 border-zinc-800 text-emerald-400 text-[10px] font-mono rounded-none uppercase px-2.5 py-0.5"
            >
              SPEC_v1.2 // LIVE REFERENCE
            </Badge>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <Link
              href="https://github.com/PrimeFold/pulseguard"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors rounded-none"
            >
              <FaGithub className="h-3.5 w-3.5" />
              <span>STAR ON GITHUB</span>
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

      {/* Documentation Hero Banner */}
      <section className="border-b border-zinc-900 bg-gradient-to-b from-black via-zinc-950 to-black py-12 md:py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="inline-flex items-center gap-2 border border-emerald-900/60 bg-emerald-950/20 px-3 py-1 text-xs font-mono text-emerald-400">
            <span className="h-2 w-2 bg-emerald-400 animate-pulse" />
            <span className="font-bold uppercase tracking-widest">
              SYSTEM ARCHITECTURE &amp; API SPECIFICATION
            </span>
            <span className="text-emerald-700">|</span>
            <span className="text-zinc-400">PRODUCTION BLUEPRINT</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-mono uppercase tracking-tight text-white max-w-4xl leading-tight">
            Developer Documentation &amp; Reference
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 font-sans max-w-3xl leading-relaxed">
            The complete technical architecture: high-throughput telemetry ingestion, deterministic SHA-256 error
            fingerprinting, pgvector runbook retrieval, and sandboxed AI SRE agent hotfix dispatching.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-2 text-[11px] font-mono text-zinc-400">
            <span className="flex items-center gap-1.5 bg-zinc-950 px-2.5 py-1 border border-zinc-800 text-zinc-300">
              <Radio className="h-3.5 w-3.5 text-emerald-400" /> ENGINE: 1.2
            </span>
            <span className="bg-zinc-950 px-2.5 py-1 border border-zinc-850 text-zinc-400">
              POSTGRESQL 16 + PGVECTOR
            </span>
            <span className="bg-zinc-950 px-2.5 py-1 border border-zinc-850 text-zinc-400">
              REDIS 7 ATOMIC PIPELINE
            </span>
            <span className="bg-zinc-950 px-2.5 py-1 border border-zinc-850 text-zinc-400">
              VERCEL AI SDK 4.0
            </span>
            <span className="bg-zinc-950 px-2.5 py-1 border border-zinc-850 text-zinc-400">
              OCTOKIT GITHUB APP
            </span>
          </div>
        </div>
      </section>

      {/* Main Layout Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col lg:flex-row gap-10 relative z-10">
        {/* Left Sticky Sidebar (Desktop & Tablet) */}
        <aside className="w-full lg:w-72 shrink-0 space-y-6 lg:sticky lg:top-20 self-start font-mono text-xs">
          {/* Quick Filter Search */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics, APIs, SDKs..."
              className="bg-black border-zinc-800 text-zinc-100 text-xs pl-8 h-9 rounded-none font-mono placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-emerald-500"
            />
          </div>

          {/* Table of Contents Header */}
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
            <span>// INDEX &amp; MODULES</span>
            <span className="text-zinc-600">{filteredSections.length} TOPICS</span>
          </div>

          {/* Grouped Sidebar Navigation Links */}
          <nav className="space-y-5">
            {categories.map((category) => (
              <div key={category} className="space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block px-2 py-0.5">
                  {category}
                </span>
                <div className="space-y-0.5">
                  {filteredSections
                    .filter((s) => s.category === category)
                    .map((item) => {
                      const isActive = activeSection === item.id;
                      return (
                        <a
                          key={item.id}
                          href={`#${item.id}`}
                          className={`flex items-center justify-between px-2.5 py-1.5 text-xs transition-all border-l-2 cursor-pointer ${
                            isActive
                              ? "border-emerald-400 bg-zinc-900/70 text-white font-medium pl-3"
                              : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-950"
                          }`}
                        >
                          <span className="truncate">
                            <span className="text-zinc-600 mr-1.5">{item.number}.</span>
                            {item.title}
                          </span>
                          {item.badge && (
                            <span className="text-[9px] font-mono text-zinc-500 shrink-0 ml-2">
                              {item.badge}
                            </span>
                          )}
                        </a>
                      );
                    })}
                </div>
              </div>
            ))}
          </nav>

          {/* Developer Quick-Reference Badge Card */}
          <div className="p-4 bg-black border border-zinc-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase">
              <Lock className="h-3.5 w-3.5 shrink-0" />
              <span>Authentication Gate</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
              API requests require an active workspace key passed in the <code className="text-emerald-400 font-mono text-[10px]">Authorization: Bearer</code> header or <code className="text-emerald-400 font-mono text-[10px]">x-api-key</code> header.
            </p>
          </div>
        </aside>

        {/* Right Main Content Sections */}
        <main className="flex-1 min-w-0 space-y-16 text-left">
          {/* Section 1: Overview */}
          <section id="overview" className="space-y-4">
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
              <span className="text-emerald-400 font-bold">01</span>
              <span>/ SYSTEM ARCHITECTURE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-mono uppercase tracking-tight text-white">
              System Architecture &amp; Tenancy
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans max-w-3xl">
              PulseGuard is an enterprise multi-tenant, AI-native incident response platform. It unifies high-throughput
              telemetry ingestion, automated deterministic error clustering, pgvector runbook retrieval, and sandboxed
              GitHub pull request dispatching under strict tenant-level RBAC isolation.
            </p>

            {/* Architecture Pipeline Diagram Card */}
            <div className="border border-zinc-850 bg-black p-5 font-mono text-xs text-zinc-300 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                <span className="text-emerald-400 font-bold uppercase tracking-wider">// TELEMETRY &amp; REMEDIATION PIPELINE</span>
                <span className="text-zinc-500 text-[10px]">END-TO-END FLOW</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-center text-[11px] font-mono">
                <div className="p-3 bg-zinc-950 border border-zinc-800">
                  <div className="text-emerald-400 font-bold">01. INGEST</div>
                  <div className="text-zinc-500 text-[10px] mt-1">HTTP / OpenTelemetry</div>
                </div>
                <div className="p-3 bg-zinc-950 border border-zinc-800">
                  <div className="text-amber-400 font-bold">02. CLUSTER</div>
                  <div className="text-zinc-500 text-[10px] mt-1">SHA-256 Fingerprint</div>
                </div>
                <div className="p-3 bg-zinc-950 border border-zinc-800">
                  <div className="text-blue-400 font-bold">03. RAG</div>
                  <div className="text-zinc-500 text-[10px] mt-1">pgvector Matryoshka</div>
                </div>
                <div className="p-3 bg-zinc-950 border border-zinc-800">
                  <div className="text-purple-400 font-bold">04. AI SRE</div>
                  <div className="text-zinc-500 text-[10px] mt-1">War Room Diagnosis</div>
                </div>
                <div className="p-3 bg-zinc-950 border border-zinc-800">
                  <div className="text-emerald-400 font-bold">05. HOTFIX</div>
                  <div className="text-zinc-500 text-[10px] mt-1">GitHub PR Dispatch</div>
                </div>
              </div>
            </div>

            {/* Stack Specification Table */}
            <div className="border border-zinc-850 bg-zinc-950/80 p-5 font-mono text-xs text-zinc-300 space-y-3">
              <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">// CORE STACK SPECIFICATION</div>
              <div className="divide-y divide-zinc-900 font-mono text-xs">
                <div className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-white font-bold">Application Framework</span>
                  <span className="text-zinc-400">Next.js 15 (App Router), React 19, Tailwind CSS</span>
                </div>
                <div className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-white font-bold">Persistence &amp; Vectors</span>
                  <span className="text-zinc-400">PostgreSQL 16 + pgvector (736-dim MRL embeddings) via Prisma 7</span>
                </div>
                <div className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-white font-bold">Distributed Ingestion</span>
                  <span className="text-zinc-400">Redis 7 (ioredis) atomic counters &amp; fingerprint deduplication</span>
                </div>
                <div className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-white font-bold">AI Multi-Provider Core</span>
                  <span className="text-zinc-400">Vercel AI SDK 4.0 (Gemini 1.5 Flash, Claude 3.5, GPT-4o BYOM)</span>
                </div>
                <div className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-white font-bold">Git Automation</span>
                  <span className="text-zinc-400">Octokit GitHub App with fine-grained repository permissions</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Quickstart */}
          <section id="quickstart" className="space-y-4 border-t border-zinc-850 pt-10">
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
              <span className="text-emerald-400 font-bold">02</span>
              <span>/ INFRASTRUCTURE SETUP</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-mono uppercase tracking-tight text-white">
              Local &amp; Production Setup
            </h2>
            <p className="text-sm text-zinc-400 font-sans max-w-3xl leading-relaxed">
              PulseGuard runs on any Docker-compatible infrastructure. Spin up PostgreSQL with pgvector and Redis using
              the standard configuration:
            </p>

            {/* Setup Tabs */}
            <div className="border border-zinc-850 bg-black">
              <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-900 bg-zinc-950">
                <div className="flex items-center gap-2">
                  <Terminal className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="font-mono text-xs text-zinc-300">Terminal Shell</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    handleCopy(
                      `docker-compose up -d\nbunx prisma db push && bunx prisma generate\nbun run dev`,
                      "setup-cmd"
                    )
                  }
                  className="font-mono text-[10px] text-zinc-400 hover:text-white h-7 px-2.5 gap-1"
                >
                  {copiedCodeId === "setup-cmd" ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" /> COPIED
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> COPY COMMANDS
                    </>
                  )}
                </Button>
              </div>
              <pre className="p-5 font-mono text-xs text-zinc-300 leading-relaxed overflow-x-auto selection:bg-emerald-500 selection:text-black">
                <span className="text-zinc-600"># 1. Boot up Docker containers (PostgreSQL + pgvector &amp; Redis)</span>{"\n"}
                <span className="text-emerald-400">docker-compose up -d</span>{"\n\n"}
                <span className="text-zinc-600"># 2. Push database schema &amp; generate Prisma client</span>{"\n"}
                <span className="text-emerald-400">bunx prisma db push &amp;&amp; bunx prisma generate</span>{"\n\n"}
                <span className="text-zinc-600"># 3. Start Next.js development server</span>{"\n"}
                <span className="text-emerald-400">bun run dev</span>
              </pre>
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

            {/* Endpoint Method Strip */}
            <div className="border border-zinc-850 bg-zinc-950 p-4 font-mono text-xs text-zinc-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="text-black bg-emerald-400 font-bold px-2 py-0.5 text-xs">
                  POST
                </span>
                <span className="text-white font-semibold tracking-wide">/api/telemetry/ingest</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                <Badge variant="outline" className="rounded-none bg-black border-zinc-800 text-[10px] text-zinc-400 font-mono py-0.5">
                  LIMIT: 50 REQ / MIN
                </Badge>
                <Badge variant="outline" className="rounded-none bg-black border-zinc-800 text-[10px] text-zinc-400 font-mono py-0.5">
                  BATCH: SUPPORTED
                </Badge>
              </div>
            </div>

            {/* Language Selector for Code Snippets */}
            <div className="border border-zinc-850 bg-black">
              <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-900 bg-zinc-950 flex-wrap gap-2">
                <div className="flex items-center gap-1 bg-black p-0.5 border border-zinc-800">
                  {(["curl", "typescript", "python", "go"] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setIngestionTab(lang)}
                      className={`px-3 py-1 text-[10px] font-mono uppercase transition-colors cursor-pointer ${
                        ingestionTab === lang
                          ? "bg-zinc-800 text-white font-bold"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {lang === "curl" ? "cURL" : lang === "typescript" ? "TypeScript / Next.js" : lang === "python" ? "Python" : "Go"}
                    </button>
                  ))}
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const code =
                      ingestionTab === "curl"
                        ? `curl -X POST https://pulseguard-app-navy.vercel.app/api/telemetry/ingest \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -d '{\n    "service": "checkout-api",\n    "level": "ERROR",\n    "message": "StripeClientException: PaymentIntent timeout",\n    "metadata": { "statusCode": 500, "region": "us-east-1" }\n  }'`
                        : ingestionTab === "typescript"
                        ? `await fetch("https://pulseguard-app-navy.vercel.app/api/telemetry/ingest", {\n  method: "POST",\n  headers: {\n    "Content-Type": "application/json",\n    "Authorization": "Bearer " + process.env.PULSEGUARD_API_KEY\n  },\n  body: JSON.stringify({\n    service: "checkout-api",\n    level: "ERROR",\n    message: error.message,\n    metadata: { stack: error.stack }\n  })\n});`
                        : ingestionTab === "python"
                        ? `import httpx\n\nhttpx.post(\n    "https://pulseguard-app-navy.vercel.app/api/telemetry/ingest",\n    headers={"Authorization": f"Bearer {API_KEY}"},\n    json={\n        "service": "billing-service",\n        "level": "ERROR",\n        "message": str(exception),\n        "metadata": {"stack": traceback.format_exc()}\n    }\n)`
                        : `// Go HTTP Request\nreq, _ := http.NewRequest("POST", "https://pulseguard-app-navy.vercel.app/api/telemetry/ingest", body)\nreq.Header.Set("Authorization", "Bearer " + apiKey)\nclient.Do(req)`;
                    handleCopy(code, "ingest-code");
                  }}
                  className="font-mono text-[10px] text-zinc-400 hover:text-white h-7 px-2.5 gap-1"
                >
                  {copiedCodeId === "ingest-code" ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" /> COPIED
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> COPY CODE
                    </>
                  )}
                </Button>
              </div>

              <pre className="p-5 font-mono text-xs text-zinc-300 leading-relaxed overflow-x-auto selection:bg-emerald-500 selection:text-black">
                {ingestionTab === "curl" && (
                  <code>{`curl -X POST https://pulseguard-app-navy.vercel.app/api/telemetry/ingest \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "service": "checkout-api",
    "level": "ERROR",
    "message": "StripeClientException: PaymentIntent timeout",
    "metadata": { "statusCode": 500, "region": "us-east-1" }
  }'`}</code>
                )}
                {ingestionTab === "typescript" && (
                  <code>{`// Next.js & TypeScript error dispatch
await fetch("https://pulseguard-app-navy.vercel.app/api/telemetry/ingest", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + process.env.PULSEGUARD_API_KEY,
  },
  body: JSON.stringify({
    service: "checkout-api",
    level: "ERROR",
    message: error.message,
    metadata: { stack: error.stack },
  }),
});`}</code>
                )}
                {ingestionTab === "python" && (
                  <code>{`import httpx
import traceback

httpx.post(
    "https://pulseguard-app-navy.vercel.app/api/telemetry/ingest",
    headers={"Authorization": f"Bearer {API_KEY}"},
    json={
        "service": "billing-service",
        "level": "ERROR",
        "message": str(exception),
        "metadata": {"stack": traceback.format_exc()}
    }
)`}</code>
                )}
                {ingestionTab === "go" && (
                  <code>{`package main

import (
    "bytes"
    "net/http"
)

func sendTelemetry(payload []byte, apiKey string) {
    req, _ := http.NewRequest("POST", "https://pulseguard-app-navy.vercel.app/api/telemetry/ingest", bytes.NewBuffer(payload))
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("Authorization", "Bearer " + apiKey)
    http.DefaultClient.Do(req)
}`}</code>
                )}
              </pre>
            </div>
          </section>

          {/* Section 4: Fingerprinting */}
          <section id="fingerprinting" className="space-y-4 border-t border-zinc-850 pt-10">
            <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
              <span className="text-emerald-400 font-bold">04</span>
              <span>/ ANOMALY FINGERPRINTING</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-mono uppercase tracking-tight text-white">
              Deterministic Anomaly Clustering
            </h2>
            <p className="text-sm text-zinc-400 font-sans max-w-3xl leading-relaxed">
              To prevent alert fatigue, dynamic variables (UUIDs, timestamps, hex tokens, numeric IDs, IP addresses)
              are sanitized into canonical tokens before SHA-256 hashing.
            </p>

            <div className="border border-zinc-850 bg-black p-5 font-mono text-xs space-y-3">
              <div className="text-zinc-500 uppercase font-semibold">// SANITIZATION TRANSFORMATION PIPELINE</div>
              <div className="space-y-2 text-zinc-300">
                <div className="p-3 bg-red-950/20 border border-red-900/50 text-red-300">
                  <span className="text-red-500 font-bold mr-2">&minus; RAW:</span>
                  &quot;Database connection timeout at 192.168.1.1:5432 for customer 9821 with token 0x9f8a7b...&quot;
                </div>
                <div className="p-3 bg-emerald-950/20 border border-emerald-900/50 text-emerald-300">
                  <span className="text-emerald-500 font-bold mr-2">&plus; SANITIZED:</span>
                  &quot;Database connection timeout at &lt;IP&gt; for customer &lt;NUM&gt; with token &lt;HEX&gt;&quot;
                </div>
                <div className="p-3 bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <span className="text-zinc-400 font-bold">SHA-256 FINGERPRINT:</span>
                  <code className="text-emerald-400 bg-black px-2 py-0.5 border border-zinc-800">
                    SIG_DB_TIMEOUT_e4a8b1c9
                  </code>
                </div>
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
              War Room Tools &amp; Streaming Protocol
            </h2>
            <p className="text-sm text-zinc-400 font-sans max-w-3xl leading-relaxed">
              Inside each incident War Room, the autonomous SRE agent executes sandboxed tools to correlate telemetry,
              pull relevant source code, and propose targeted remediation diffs:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              <div className="border border-zinc-850 bg-black p-4 space-y-2">
                <div className="text-white font-semibold flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-emerald-400" />
                  <span>query_telemetry_logs</span>
                </div>
                <p className="text-zinc-400 font-sans text-xs leading-relaxed">
                  Queries recent ERROR/FATAL logs by service and sliding time window to isolate the crash stack trace.
                </p>
              </div>
              <div className="border border-zinc-850 bg-black p-4 space-y-2">
                <div className="text-white font-semibold flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-blue-400" />
                  <span>fetch_repo_file</span>
                </div>
                <p className="text-zinc-400 font-sans text-xs leading-relaxed">
                  Uses authenticated GitHub App tokens to fetch the exact breaking source code lines in the repository.
                </p>
              </div>
              <div className="border border-zinc-850 bg-black p-4 space-y-2">
                <div className="text-white font-semibold flex items-center gap-2">
                  <GitPullRequest className="h-4 w-4 text-purple-400" />
                  <span>propose_hotfix</span>
                </div>
                <p className="text-zinc-400 font-sans text-xs leading-relaxed">
                  Generates an isolated diff patch and presents a cryptographic sign-off card to human engineers.
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
              Document Ingestion &amp; Matryoshka Embeddings
            </h2>
            <p className="text-sm text-zinc-400 font-sans max-w-3xl leading-relaxed">
              PDF and Markdown runbooks are chunked into 600-character segments with 60-character sliding overlap.
              Embeddings are sliced using Matryoshka Representation Learning (MRL) down to 736 dimensions to match
              database schema constraints without precision degradation.
            </p>

            <div className="border border-zinc-850 bg-black p-5 font-mono text-xs text-zinc-300 overflow-x-auto space-y-2">
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
              <span>/ CUSTOM AI KEY VAULT</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-mono uppercase tracking-tight text-white">
              AES-256 Key Encryption &amp; Model Catalogs
            </h2>
            <p className="text-sm text-zinc-400 font-sans max-w-3xl leading-relaxed">
              Organizations provide their own AI provider credentials. API keys are encrypted at rest using AES-256
              symmetric envelope encryption with random initialization vectors (IV).
            </p>

            <div className="border border-zinc-850 bg-black p-5 font-mono text-xs space-y-2">
              <div className="text-zinc-400 font-semibold uppercase">// KEY VAULT ENCRYPTION PROTOCOL</div>
              <p className="text-zinc-300 font-sans text-sm leading-relaxed">
                Key input &rarr; AES-256 cipher (Random IV + SHA-256 server secret) &rarr; Stored in PostgreSQL as{" "}
                <code className="text-emerald-400 bg-zinc-950 px-1 py-0.5 font-mono text-xs">iv_hex:cipher_hex</code>.
                Only masked key tokens (<code className="text-zinc-200 font-mono text-xs">AIza...4F10</code>) are returned to client browsers.
              </p>
            </div>
          </section>

          {/* Section 8: GitHub PR Hotfixes */}
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

            <div className="border border-zinc-850 bg-black p-5 font-mono text-xs text-zinc-300 space-y-2">
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
              <span>/ REDIS CACHING &amp; LIMITS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-mono uppercase tracking-tight text-white">
              Distributed Redis Caching Layer
            </h2>
            <p className="text-sm text-zinc-400 font-sans max-w-3xl leading-relaxed">
              High-frequency telemetry and dashboard operations are cached in Redis to eliminate database bottlenecks:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              <div className="border border-zinc-850 bg-black p-4 space-y-1.5">
                <span className="text-zinc-500 text-[10px] uppercase font-semibold">CACHE: RATE_LIMIT</span>
                <p className="text-white font-semibold">60s Sliding IP Window</p>
                <p className="text-zinc-400 font-sans text-xs leading-relaxed">Atomic INCR + PEXPIRE counters protect public endpoints.</p>
              </div>
              <div className="border border-zinc-850 bg-black p-4 space-y-1.5">
                <span className="text-zinc-500 text-[10px] uppercase font-semibold">CACHE: INCIDENT_LOOKUP</span>
                <p className="text-white font-semibold">300s Fingerprint Cache</p>
                <p className="text-zinc-400 font-sans text-xs leading-relaxed">Bypasses database queries during million-log floods.</p>
              </div>
              <div className="border border-zinc-850 bg-black p-4 space-y-1.5">
                <span className="text-zinc-500 text-[10px] uppercase font-semibold">CACHE: AI_MODELS</span>
                <p className="text-white font-semibold">24h Provider Catalog</p>
                <p className="text-zinc-400 font-sans text-xs leading-relaxed">Ensures instant zero-lag organization settings rendering.</p>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-black py-8 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-zinc-500 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="h-3 w-3 bg-white" />
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

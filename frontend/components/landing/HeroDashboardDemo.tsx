"use client";

import { useState } from "react";
import {
  Activity,
  Terminal,
  ShieldAlert,
  Radio,
  Clock,
  Code2,
  FileText,
  GitPullRequest,
  CheckCircle2,
  ExternalLink,
  Bot,
  User,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Server,
  Layers,
  Check,
  Copy,
} from "lucide-react";

interface TelemetryBucket {
  time: string;
  errors: number;
  warnings: number;
  info: number;
}

const SAMPLE_BUCKETS: TelemetryBucket[] = [
  { time: "-5h", errors: 4, warnings: 12, info: 180 },
  { time: "-4h", errors: 2, warnings: 8, info: 210 },
  { time: "-3h", errors: 6, warnings: 15, info: 195 },
  { time: "-2h", errors: 28, warnings: 45, info: 240 },
  { time: "-1h", errors: 142, warnings: 89, info: 310 },
  { time: "NOW", errors: 84, warnings: 62, info: 285 },
];

export function HeroDashboardDemo() {
  const [activeTab, setActiveTab] = useState<"telemetry" | "warroom">("telemetry");
  const [prStatus, setPrStatus] = useState<"idle" | "drafting" | "created">("idle");
  const [copied, setCopied] = useState(false);
  const [hoveredBucket, setHoveredBucket] = useState<TelemetryBucket | null>(null);

  const handleApprove = () => {
    setPrStatus("drafting");
    setTimeout(() => {
      setPrStatus("created");
    }, 1400);
  };

  const handleResetPr = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPrStatus("idle");
  };

  const handleCopyDiff = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full text-left font-sans">
      {/* Outer Shell: Double-Bezel Hardware Architecture */}
      <div className="p-2 sm:p-3 md:p-3.5 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-zinc-800/60 via-zinc-900/40 to-black/80 border border-white/10 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.9),0_0_50px_rgba(16,185,129,0.08)] backdrop-blur-xl relative">
        {/* Subtle hardware highlight overlay */}
        <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent pointer-events-none" />

        {/* Inner Core */}
        <div className="rounded-xl sm:rounded-2xl border border-zinc-800/90 bg-[#09090b] overflow-hidden flex flex-col shadow-inner">
          
          {/* Top Window Chrome Bar */}
          <div className="px-3 sm:px-4 py-2.5 bg-zinc-950 border-b border-zinc-850 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            {/* Window Controls & Breadcrumb */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/80 inline-block border border-red-400/40" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80 inline-block border border-yellow-400/40" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 inline-block border border-emerald-400/40" />
              </div>

              <div className="h-3.5 w-px bg-zinc-800 hidden sm:block" />

              <div className="flex items-center gap-2 text-zinc-400">
                <span className="text-zinc-200 font-semibold uppercase tracking-wider">
                  pulseguard
                </span>
                <span className="text-zinc-600">/</span>
                <span className="text-emerald-400 font-medium bg-emerald-950/40 border border-emerald-900/50 px-2 py-0.5 rounded-none text-[11px]">
                  acme-prod
                </span>
              </div>
            </div>

            {/* Interactive View Switcher Tabs */}
            <div className="flex items-center p-0.5 bg-black border border-zinc-800 rounded-none text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("telemetry")}
                className={`px-3 py-1 font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "telemetry"
                    ? "bg-zinc-800 text-white font-bold border border-zinc-700 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Activity className="h-3.5 w-3.5 text-emerald-400" />
                <span>Telemetry Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("warroom")}
                className={`px-3 py-1 font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "warroom"
                    ? "bg-zinc-800 text-white font-bold border border-zinc-700 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Terminal className="h-3.5 w-3.5 text-red-400" />
                <span>War Room</span>
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
              </button>
            </div>

            {/* Live Telemetry Ping */}
            <div className="hidden md:flex items-center gap-3 text-[11px] text-zinc-500 font-mono">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <Radio className="h-3 w-3 animate-pulse text-emerald-400" />
                CLUSTER LIVE
              </span>
              <span>•</span>
              <span>12ms</span>
              <span>•</span>
              <span>TLS 1.3</span>
            </div>
          </div>

          {/* Body Content Area */}
          <div className="p-4 sm:p-6 space-y-6">
            
            {activeTab === "telemetry" ? (
              /* ================= MODE 1: SRE TELEMETRY GRID ================= */
              <div className="space-y-6 animate-fadeIn">
                {/* 1. SRE Metric Strip */}
                <div className="grid grid-cols-2 lg:grid-cols-4 border border-zinc-850 bg-zinc-950/70">
                  {/* Metric 1 */}
                  <div
                    onClick={() => setActiveTab("warroom")}
                    className="p-4 sm:p-5 space-y-1 hover:bg-zinc-900/60 transition-colors border-r border-b lg:border-b-0 border-zinc-850 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-medium">
                        Active Alerts
                      </p>
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse group-hover:scale-125 transition-transform" />
                    </div>
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-mono tracking-tighter text-red-500 font-bold flex items-center gap-2">
                      1 OPEN
                    </div>
                    <p className="text-[11px] font-mono text-red-400/80 underline group-hover:text-red-300">
                      Click to enter War Room &rarr;
                    </p>
                  </div>

                  {/* Metric 2 */}
                  <div className="p-4 sm:p-5 space-y-1 hover:bg-zinc-900/40 transition-colors lg:border-r border-b lg:border-b-0 border-zinc-850">
                    <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-medium">
                      Resolved Incidents
                    </p>
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-mono tracking-tighter text-white font-bold">
                      38
                    </div>
                    <p className="text-[11px] font-mono text-zinc-500">
                      100% PR sign-off rate
                    </p>
                  </div>

                  {/* Metric 3 */}
                  <div className="p-4 sm:p-5 space-y-1 hover:bg-zinc-900/40 transition-colors border-r border-zinc-850">
                    <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-medium">
                      Telemetry (24h)
                    </p>
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-mono tracking-tighter text-white font-bold">
                      142,890
                    </div>
                    <p className="text-[11px] font-mono text-zinc-500">
                      Sub-2ms Redis deduplication
                    </p>
                  </div>

                  {/* Metric 4 */}
                  <div className="p-4 sm:p-5 space-y-2 hover:bg-zinc-900/40 transition-colors flex flex-col justify-center items-start">
                    <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-medium">
                      Cluster Status
                    </p>
                    <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider bg-emerald-950/30 border border-emerald-900/60 px-3 py-1.5 font-semibold">
                      <Radio className="h-3.5 w-3.5 animate-pulse text-emerald-400" />
                      CLUSTER HEALTHY
                    </div>
                  </div>
                </div>

                {/* 2. Main Grid: Event Density Chart (Left) & Incident Stream (Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Interactive 6-Hour Event Density Chart */}
                  <div className="lg:col-span-2 space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                      <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-white">
                        <Terminal className="h-4 w-4 text-zinc-400" />
                        <span>Telemetry Event Density (6H Live Buffer)</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500">
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 bg-red-500 rounded-none inline-block" /> Errors
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 bg-yellow-500 rounded-none inline-block" /> Warnings
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 bg-zinc-600 rounded-none inline-block" /> Info
                        </span>
                      </div>
                    </div>

                    <div className="h-[260px] w-full border border-zinc-850 bg-black/60 p-4 relative flex flex-col justify-between">
                      {/* Interactive Bar Chart Visualization */}
                      <div className="flex-1 flex items-end justify-around gap-2 sm:gap-4 pt-4 pb-2 border-b border-zinc-850/80">
                        {SAMPLE_BUCKETS.map((bucket, bIdx) => {
                          const total = bucket.errors + bucket.warnings + bucket.info;
                          const errorPct = (bucket.errors / total) * 100;
                          const warnPct = (bucket.warnings / total) * 100;
                          const infoPct = (bucket.info / total) * 100;
                          const isSpike = bucket.errors > 30;

                          return (
                            <div
                              key={bIdx}
                              onMouseEnter={() => setHoveredBucket(bucket)}
                              onMouseLeave={() => setHoveredBucket(null)}
                              className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                            >
                              {/* Stacked bar */}
                              <div className="w-full max-w-[48px] rounded-none overflow-hidden flex flex-col justify-end transition-all group-hover:brightness-125">
                                {isSpike && (
                                  <div className="text-[10px] font-mono text-red-400 text-center font-bold mb-1 animate-bounce">
                                    !
                                  </div>
                                )}
                                <div
                                  style={{ height: `${Math.max(errorPct * 2.5, 6)}px` }}
                                  className="w-full bg-red-500/90 transition-all"
                                />
                                <div
                                  style={{ height: `${Math.max(warnPct * 1.5, 4)}px` }}
                                  className="w-full bg-yellow-500/70 transition-all"
                                />
                                <div
                                  style={{ height: `${Math.max(infoPct * 0.5, 10)}px` }}
                                  className="w-full bg-zinc-700/60 transition-all"
                                />
                              </div>
                              <span className="text-[10px] font-mono text-zinc-500 mt-2">
                                {bucket.time}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Tooltip Overlay */}
                      <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pt-2">
                        <span>
                          {hoveredBucket ? (
                            <span className="text-zinc-200">
                              Window {hoveredBucket.time}:{" "}
                              <strong className="text-red-400">{hoveredBucket.errors} Errors</strong>,{" "}
                              <strong className="text-yellow-400">{hoveredBucket.warnings} Warns</strong>,{" "}
                              <strong className="text-zinc-400">{hoveredBucket.info} Info</strong>
                            </span>
                          ) : (
                            <span className="text-zinc-500">
                              Hover over any telemetry time slice to inspect packet distribution
                            </span>
                          )}
                        </span>
                        <span className="text-emerald-400 font-semibold hidden sm:inline">
                          INGESTION: 100% OK
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Live Incident Stream */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                      <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-white">
                        <ShieldAlert className="h-4 w-4 text-red-400" />
                        <span>Incident Stream</span>
                      </div>
                      <span className="text-[11px] font-mono text-red-400 animate-pulse font-medium">
                        1 ACTIVE
                      </span>
                    </div>

                    {/* Active Incident Card */}
                    <div
                      onClick={() => setActiveTab("warroom")}
                      className="border border-red-900/50 bg-red-950/20 p-4 space-y-3 cursor-pointer hover:bg-red-950/30 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <span className="h-2.5 w-2.5 rounded-none bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)] animate-pulse shrink-0 mt-1" />
                        <div className="space-y-1 min-w-0">
                          <h4 className="text-sm font-mono font-semibold text-white group-hover:text-red-300 transition-colors">
                            Redis Connection Pool Exhaustion
                          </h4>
                          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 flex-wrap">
                            <span className="text-zinc-300">checkout-service</span>
                            <span className="text-zinc-600">/</span>
                            <span className="text-red-400 font-bold">CRITICAL</span>
                            <span className="text-zinc-600">/</span>
                            <span className="text-zinc-500">3m ago</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                        Automatic anomaly threshold exceeded: 128 ECONNREFUSED socket errors detected in 90 seconds.
                      </p>

                      <div className="pt-2 border-t border-red-900/40 flex items-center justify-between">
                        <span className="text-[11px] font-mono text-red-400 font-medium">
                          SRE AGENT ACTIVE
                        </span>
                        <div className="inline-flex items-center gap-1 text-xs font-mono font-bold text-white bg-red-600 hover:bg-red-500 px-3 py-1 transition-colors">
                          <span>OPEN WAR ROOM</span>
                          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* ================= MODE 2: AUTONOMOUS SRE WAR ROOM ================= */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 animate-fadeIn">
                {/* Left Column: Diagnostics (4 cols) */}
                <div className="lg:col-span-4 border border-zinc-850 bg-black/60 p-4 space-y-4 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-zinc-850 pb-2.5 text-zinc-300 font-medium">
                    <div className="flex items-center gap-2">
                      <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                      <span className="uppercase tracking-wider">Incident Diagnostics</span>
                    </div>
                    <span className="text-zinc-500 font-bold">LIVE TELEMETRY</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest block font-medium">
                      Incident Summary
                    </label>
                    <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                      Redis client pool saturated in checkout workers. Automated anomaly threshold triggered.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest block font-medium">
                      Error Signature
                    </label>
                    <div className="p-2.5 bg-zinc-950 border border-zinc-850 text-zinc-300 text-xs font-mono select-all">
                      SIG_REDIS_MAX_CONN_503
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 font-medium">
                      <Code2 className="h-3.5 w-3.5 text-zinc-400" /> Error Payload
                    </label>
                    <div className="p-2.5 bg-zinc-950 border border-zinc-850 text-xs text-red-400 font-mono overflow-x-auto max-h-36 scrollbar-thin">
                      <pre>{`{
  "code": "ECONNREFUSED",
  "pool": { "max": 50, "acquired": 50, "pending": 128 },
  "service": "checkout-service",
  "file": "src/services/redisPool.ts"
}`}</pre>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 font-medium">
                      <FileText className="h-3.5 w-3.5 text-emerald-400" /> Root Cause Analysis
                    </label>
                    <p className="text-xs text-zinc-300 font-sans bg-zinc-950 border border-zinc-850 p-2.5 leading-relaxed">
                      Unreleased connections in checkout batch pipelines caused worker starvation under high load.
                    </p>
                  </div>
                </div>

                {/* Right Column: AI Agent War Room Chat & Live Diff Card (8 cols) */}
                <div className="lg:col-span-8 border border-zinc-850 bg-black flex flex-col justify-between">
                  {/* Terminal Header */}
                  <div className="h-10 px-4 border-b border-zinc-850 bg-zinc-950 flex items-center justify-between font-mono text-xs">
                    <div className="flex items-center gap-2 text-zinc-300 font-medium">
                      <Terminal className="h-3.5 w-3.5 text-emerald-400" />
                      <span>SRE AGENT // INCIDENT #89491</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>ONLINE & REASONING</span>
                    </div>
                  </div>

                  {/* Message Stream */}
                  <div className="p-4 sm:p-5 space-y-4 text-xs font-sans overflow-y-auto max-h-[380px]">
                    {/* User Prompt */}
                    <div className="flex gap-3 justify-end leading-relaxed">
                      <div className="max-w-[85%] p-3.5 bg-zinc-900 border border-zinc-800 text-white font-mono text-xs">
                        Investigate the checkout-service Redis crash and propose an actionable hotfix.
                      </div>
                      <div className="h-6 w-6 rounded-none bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                        <User className="h-3.5 w-3.5 text-zinc-300" />
                      </div>
                    </div>

                    {/* Agent Response */}
                    <div className="flex gap-3 justify-start leading-relaxed">
                      <div className="h-6 w-6 rounded-none bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="h-3.5 w-3.5 text-zinc-300" />
                      </div>
                      <div className="max-w-[90%] p-3.5 sm:p-4 bg-zinc-950 border border-zinc-850 text-zinc-200 space-y-3">
                        <p className="text-xs sm:text-sm leading-relaxed">
                          I analyzed telemetry logs and discovered 128 socket rejections. In{" "}
                          <code className="text-zinc-100 bg-zinc-900 px-1 py-0.5 font-mono text-xs">
                            src/services/redisPool.ts
                          </code>
                          , the acquire method lacked timeout guards and automatic client reclamation.
                        </p>

                        {/* Tool Execution Badges */}
                        <div className="space-y-1.5 font-mono text-xs">
                          <div className="flex items-center gap-2 px-2.5 py-1 bg-black border border-zinc-850 text-zinc-300">
                            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                            <span>QUERY TELEMETRY (128 ERRORS IN 90s)</span>
                            <span className="text-emerald-400 font-bold ml-auto">✓ DONE</span>
                          </div>
                          <div className="flex items-center gap-2 px-2.5 py-1 bg-black border border-zinc-850 text-zinc-300">
                            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                            <span>FETCH REPO FILE (src/services/redisPool.ts)</span>
                            <span className="text-emerald-400 font-bold ml-auto">✓ DONE</span>
                          </div>
                        </div>

                        {/* Live Diff Approval Card */}
                        <div className="mt-3 border border-zinc-800 bg-black p-3.5 font-mono text-xs space-y-3 rounded-none">
                          <div className="flex items-center justify-between border-b border-zinc-850 pb-2 text-xs">
                            <div className="flex items-center gap-2 text-zinc-200 font-semibold">
                              <GitPullRequest className="h-4 w-4 text-emerald-400" />
                              <span className="uppercase tracking-wider">Hotfix Patch Proposal</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-300 bg-zinc-900 px-2 py-0.5 border border-zinc-800 text-xs">
                                src/services/redisPool.ts
                              </span>
                              <button
                                onClick={handleCopyDiff}
                                className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                                title="Copy Diff"
                              >
                                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          </div>

                          <div className="bg-zinc-950 p-2.5 border border-zinc-850 font-mono text-xs text-zinc-300 overflow-x-auto">
                            <div className="text-red-400">- const client = pool.acquire();</div>
                            <div className="text-emerald-400">+ const client = await pool.acquireWithTimeout(5000);</div>
                            <div className="text-emerald-400">+ try {"{ ... }"} finally {"{ pool.release(client); }"}</div>
                          </div>

                          {/* Action Button */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                            <span className="text-zinc-500 text-[11px] uppercase tracking-wider">
                              HUMAN-IN-THE-LOOP APPROVAL REQUIRED
                            </span>

                            {prStatus === "idle" && (
                              <button
                                type="button"
                                onClick={handleApprove}
                                className="px-4 py-2 bg-white text-black hover:bg-zinc-200 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 active:scale-95 shadow-md"
                              >
                                <GitPullRequest className="h-3.5 w-3.5" />
                                <span>APPROVE & OPEN PR ↗</span>
                              </button>
                            )}

                            {prStatus === "drafting" && (
                              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-mono">
                                <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                                <span>DISPATCHING PR TO GITHUB...</span>
                              </div>
                            )}

                            {prStatus === "created" && (
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-mono font-bold uppercase">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  PR #284 CREATED
                                </span>
                                <button
                                  type="button"
                                  onClick={handleResetPr}
                                  className="text-[11px] font-mono text-zinc-500 hover:text-zinc-300 underline cursor-pointer"
                                >
                                  Reset Demo
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input Footer Strip */}
                  <div className="p-3 bg-zinc-950 border-t border-zinc-850 flex items-center justify-between font-mono text-xs text-zinc-500">
                    <span className="flex items-center gap-2">
                      <Terminal className="h-3.5 w-3.5 text-zinc-600" />
                      <span>Ready for engineer command...</span>
                    </span>
                    <span className="text-zinc-600 text-[11px]">DEMO MODE // SANDBOX READY</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

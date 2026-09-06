"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Radio,
  Copy,
  Check,
  Send,
  Loader2,
  Terminal,
  ShieldCheck,
  Key,
  Code2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { generateApiKey } from "@/app/api/action/settings";

interface Props {
  organization: {
    id: string;
    name: string;
    slug: string;
    apiKeyDisplay?: string | null;
  };
  role: string;
}

type TabType = "curl" | "nextjs" | "express" | "python" | "vercel";

export function IngestionView({ organization, role }: Props) {
  const [origin, setOrigin] = useState("https://pulseguard-app-navy.vercel.app");
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("curl");

  // Live test states
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    status?: number;
    latencyMs?: number;
    message?: string;
  } | null>(null);

  // Secret API key generation state
  const [displayKey, setDisplayKey] = useState(organization.apiKeyDisplay || "");
  const [revealedRawKey, setRevealedRawKey] = useState<string | null>(null);
  const [keyLoading, setKeyLoading] = useState(false);
  const [copiedSecretKey, setCopiedSecretKey] = useState(false);

  const canManage = role === "OWNER" || role === "ADMIN";

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.origin) {
      setOrigin(window.location.origin);
    }
  }, []);

  const endpointUrl = `${origin}/api/telemetry/ingest`;
  const primaryAuthKey = revealedRawKey || organization.id;

  const handleCopy = (text: string, type: "endpoint" | "key" | "snippet" | "secret") => {
    navigator.clipboard.writeText(text);
    if (type === "endpoint") {
      setCopiedEndpoint(true);
      setTimeout(() => setCopiedEndpoint(false), 2000);
    } else if (type === "key") {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else if (type === "snippet") {
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    } else if (type === "secret") {
      setCopiedSecretKey(true);
      setTimeout(() => setCopiedSecretKey(false), 2000);
    }
  };

  const handleGenerateKey = async () => {
    if (
      displayKey &&
      !confirm("Rotating your key will immediately invalidate existing log forwarders using the previous secret key. Continue?")
    ) {
      return;
    }

    setKeyLoading(true);
    try {
      const res = await generateApiKey(organization.id);
      setDisplayKey(res.rawKey.slice(0, 12) + "..." + res.rawKey.slice(-4));
      setRevealedRawKey(res.rawKey);
    } catch (err) {
      console.error("Failed to generate key:", err);
    } finally {
      setKeyLoading(false);
    }
  };

  const handleSendTestEvent = async () => {
    setTesting(true);
    setTestResult(null);
    const startTime = performance.now();

    try {
      const payload = {
        service: "test-verifier",
        level: "ERROR",
        message: `PulseGuard Verification: Ingestion endpoint online for ${organization.name}`,
        metadata: {
          timestamp: new Date().toISOString(),
          environment: "production-check",
          triggeredBy: "IngestionDashboard",
          orgSlug: organization.slug,
        },
      };

      const res = await fetch("/api/telemetry/ingest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${primaryAuthKey}`,
        },
        body: JSON.stringify(payload),
      });

      const elapsed = Math.round(performance.now() - startTime);
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setTestResult({
          success: true,
          status: res.status,
          latencyMs: elapsed,
          message: `Ingested successfully in ${elapsed}ms! Response: ${JSON.stringify(data)}`,
        });
      } else {
        setTestResult({
          success: false,
          status: res.status,
          latencyMs: elapsed,
          message: data.error || `HTTP ${res.status}: Failed to ingest telemetry`,
        });
      }
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - startTime);
      setTestResult({
        success: false,
        latencyMs: elapsed,
        message: err.message || "Network error connecting to ingestion endpoint",
      });
    } finally {
      setTesting(false);
    }
  };

  // Integration snippets
  const snippets: Record<TabType, { title: string; filename: string; code: string }> = {
    curl: {
      title: "cURL / Terminal",
      filename: "terminal.sh",
      code: `curl -X POST ${endpointUrl} \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${primaryAuthKey}" \\
  -d '{
    "service": "api-gateway",
    "level": "ERROR",
    "message": "DatabaseConnectionTimeout: Connection pool exhausted after 5000ms",
    "metadata": {
      "route": "/v1/orders/checkout",
      "userId": "usr_88291",
      "attempt": 3
    }
  }'`,
    },
    nextjs: {
      title: "Next.js / React",
      filename: "lib/pulseguard.ts",
      code: `// lib/pulseguard.ts - Utility to forward client & server errors
export async function sendTelemetryError(error: Error, metadata?: Record<string, any>) {
  try {
    await fetch("${endpointUrl}", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer ${primaryAuthKey}",
      },
      body: JSON.stringify({
        service: "web-frontend",
        level: "ERROR",
        message: error.message || String(error),
        metadata: {
          stack: error.stack,
          url: typeof window !== "undefined" ? window.location.href : undefined,
          ...metadata,
        },
      }),
    });
  } catch (err) {
    // Non-blocking logger fallback
    console.error("Telemetry forward failed:", err);
  }
}`,
    },
    express: {
      title: "Node.js / Express",
      filename: "middleware/pulseguard.js",
      code: `// Error middleware for Express / Fastify / Node
const PULSEGUARD_URL = "${endpointUrl}";
const PULSEGUARD_KEY = "${primaryAuthKey}";

function pulseguardErrorHandler(err, req, res, next) {
  // Asynchronously dispatch error telemetry to PulseGuard
  fetch(PULSEGUARD_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": \`Bearer \${PULSEGUARD_KEY}\`,
    },
    body: JSON.stringify({
      service: process.env.SERVICE_NAME || "backend-api",
      level: "ERROR",
      message: err.message || "Unhandled server exception",
      metadata: {
        method: req.method,
        path: req.originalUrl,
        stack: err.stack,
        ip: req.ip,
      },
    }),
  }).catch((e) => console.error("PulseGuard logger error:", e));

  // Continue standard Express error response
  next(err);
}

module.exports = { pulseguardErrorHandler };`,
    },
    python: {
      title: "Python / FastAPI",
      filename: "telemetry.py",
      code: `import httpx
import traceback

PULSEGUARD_URL = "${endpointUrl}"
PULSEGUARD_KEY = "${primaryAuthKey}"

def report_exception(exception: Exception, service_name: str = "backend-service", metadata: dict = None):
    """Dispatches exception stack trace to PulseGuard ingestion pipeline."""
    payload = {
        "service": service_name,
        "level": "ERROR",
        "message": str(exception),
        "metadata": {
            "traceback": traceback.format_exc(),
            **(metadata or {})
        }
    }
    try:
        with httpx.Client(timeout=2.0) as client:
            client.post(
                PULSEGUARD_URL,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {PULSEGUARD_KEY}"
                },
                json=payload
            )
    except Exception as e:
        print(f"Failed to stream telemetry to PulseGuard: {e}")`,
    },
    vercel: {
      title: "Vercel Log Drain",
      filename: "vercel-drain.json",
      code: `// Vercel Log Drain Configuration:
// 1. In your Vercel Dashboard, navigate to Project Settings -> Log Drains.
// 2. Click "Add Log Drain" -> choose "JSON" format.
// 3. Configure the destination:
//    - URL: ${endpointUrl}
//    - Custom Headers:
//         x-api-key: ${primaryAuthKey}
//         Content-Type: application/json
// 4. Click Save. Every deployment exception and runtime error will flow into PulseGuard automatically!`,
    },
  };

  return (
    <div className="space-y-10">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-zinc-900">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <Radio className="h-6 w-6 text-emerald-400" />
            <h1 className="text-3xl font-mono tracking-tighter text-white uppercase">
              Ingestion Endpoint
            </h1>
          </div>
          <p className="text-[11px] font-mono text-zinc-500 tracking-widest uppercase">
            Cluster Telemetry / HTTP Ingestion / Platform Integration
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-950/30 border border-emerald-800/60 text-emerald-400 font-mono text-xs uppercase tracking-wider">
            <span className="h-2 w-2 bg-emerald-400 animate-pulse" />
            <span>ENGINE: SUB-2MS READY</span>
          </div>
        </div>
      </div>

      {/* Primary Ingestion Endpoint Card */}
      <Card className="border-border/60 bg-black/60 backdrop-blur rounded-none">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-emerald-400" />
              <CardTitle className="text-sm font-mono uppercase tracking-wider text-white">
                Live HTTP Ingestion Endpoint
              </CardTitle>
            </div>
            <Badge variant="outline" className="font-mono text-[10px] bg-zinc-900 text-zinc-300 border-zinc-800 uppercase">
              METHOD: POST
            </Badge>
          </div>
          <CardDescription className="text-xs text-zinc-400 font-sans">
            Point your application log forwarders, server error handlers, or webhooks to this endpoint to stream logs directly into PulseGuard.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex-1 flex items-center bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 font-mono text-xs text-emerald-400 overflow-x-auto selection:bg-emerald-500 selection:text-black">
              <span className="text-zinc-600 mr-2 shrink-0 select-none">POST</span>
              <span className="truncate">{endpointUrl}</span>
            </div>

            <Button
              onClick={() => handleCopy(endpointUrl, "endpoint")}
              className="bg-white hover:bg-zinc-200 text-black font-mono text-xs font-bold uppercase tracking-wider rounded-none h-11 px-5 shrink-0 gap-2 transition-all active:scale-[0.98] cursor-pointer"
            >
              {copiedEndpoint ? (
                <>
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>COPIED!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>COPY ENDPOINT</span>
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-[11px] font-mono text-zinc-400">
            <div className="p-3 bg-zinc-950/80 border border-zinc-900 flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-white font-semibold">Content-Type</span>
                <p className="text-zinc-500 text-[10px]">Must be application/json</p>
              </div>
            </div>
            <div className="p-3 bg-zinc-950/80 border border-zinc-900 flex items-start gap-2.5">
              <Key className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-white font-semibold">Authentication</span>
                <p className="text-zinc-500 text-[10px]">Bearer token or x-api-key</p>
              </div>
            </div>
            <div className="p-3 bg-zinc-950/80 border border-zinc-900 flex items-start gap-2.5">
              <Code2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-white font-semibold">Batch Ingest</span>
                <p className="text-zinc-500 text-[10px]">Accepts single log or array []</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Authentication & API Credentials Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organization ID / Ingestion Key */}
        <Card className="border-border/60 bg-black/60 backdrop-blur rounded-none flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-emerald-400" />
              <CardTitle className="text-sm font-mono uppercase tracking-wider text-white">
                Workspace Ingestion Key
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-zinc-400 font-sans">
              Use this key in the <code className="text-zinc-200">Authorization: Bearer</code> header or <code className="text-zinc-200">x-api-key</code> header.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                Primary Organization Key
              </label>
              <div className="flex items-center gap-2">
                <Input
                  value={organization.id}
                  readOnly
                  className="font-mono text-xs bg-zinc-950 border-zinc-800 text-zinc-200 h-10 rounded-none select-all"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(organization.id, "key")}
                  className="border-zinc-800 hover:bg-zinc-900 text-zinc-300 font-mono text-xs rounded-none h-10 px-3 shrink-0 gap-1.5 cursor-pointer"
                >
                  {copiedKey ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copiedKey ? "COPIED" : "COPY"}
                </Button>
              </div>
            </div>

            {/* Rotatable Secret Key option */}
            {revealedRawKey && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span>Newly Generated Secret Key:</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={revealedRawKey}
                    readOnly
                    className="font-mono text-xs bg-black text-amber-200 border-amber-500/40 h-9 rounded-none select-all"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleCopy(revealedRawKey, "secret")}
                    className="bg-amber-400 text-black hover:bg-amber-300 font-mono text-xs h-9 rounded-none shrink-0 gap-1 cursor-pointer"
                  >
                    {copiedSecretKey ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedSecretKey ? "COPIED" : "COPY"}
                  </Button>
                </div>
                <p className="text-[10px] text-amber-400/80">
                  Save this key now. It will not be shown in plain text again.
                </p>
              </div>
            )}

            <div className="pt-2 border-t border-zinc-900 flex items-center justify-between">
              <div className="text-[11px] font-mono text-zinc-500">
                Rotatable Key: <span className="text-zinc-300">{displayKey || "None configured"}</span>
              </div>
              {canManage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateKey}
                  disabled={keyLoading}
                  className="gap-1.5 text-xs font-mono border-zinc-800 text-zinc-300 hover:text-white rounded-none cursor-pointer"
                >
                  <RefreshCw className={`h-3 w-3 ${keyLoading ? "animate-spin" : ""}`} />
                  {displayKey ? "Rotate Secret Key" : "Generate Secret Key"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Live Ingestion Verifier Card */}
        <Card className="border-border/60 bg-black/60 backdrop-blur rounded-none flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4 text-emerald-400" />
              <CardTitle className="text-sm font-mono uppercase tracking-wider text-white">
                Live Ingestion Verifier
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-zinc-400 font-sans">
              Test your organization&apos;s connection by dispatching an authentic error ping right now.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Click below to send a sample test error log to <code className="text-zinc-200">/api/telemetry/ingest</code>. If successful, you can verify it in real-time in your Telemetry Stream.
            </p>

            {testResult && (
              <div
                className={`p-3 border font-mono text-xs space-y-1.5 ${
                  testResult.success
                    ? "bg-emerald-950/20 border-emerald-800/60 text-emerald-300"
                    : "bg-red-950/20 border-red-800/60 text-red-300"
                }`}
              >
                <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
                  {testResult.success ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  )}
                  <span>
                    {testResult.success ? "Ingestion Successful" : "Ingestion Failed"}
                  </span>
                  {testResult.latencyMs && (
                    <span className="text-zinc-500 font-normal">({testResult.latencyMs}ms)</span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 break-all">{testResult.message}</p>
                {testResult.success && (
                  <div className="pt-2">
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="border-emerald-700/60 text-emerald-300 hover:bg-emerald-950/40 text-[11px] font-mono rounded-none h-8"
                    >
                      <Link href={`/${organization.slug}/telemetry`}>
                        View in Telemetry Stream &rarr;
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            )}

            <Button
              onClick={handleSendTestEvent}
              disabled={testing}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-xs font-bold uppercase tracking-wider rounded-none h-11 transition-all cursor-pointer"
            >
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  DISPATCHING TELEMETRY EVENT...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  SEND TEST TELEMETRY LOG
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Code Integration Guide & Snippets */}
      <Card className="border-border/60 bg-black/60 backdrop-blur rounded-none">
        <CardHeader className="border-b border-zinc-900 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-emerald-400" />
                <CardTitle className="text-sm font-mono uppercase tracking-wider text-white">
                  Integration Guide & Platform Snippets
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-zinc-400 font-sans mt-1">
                Copy and drop these production-ready snippets directly into your deployed application.
              </CardDescription>
            </div>

            {/* Language / Stack Tabs */}
            <div className="flex items-center flex-wrap gap-1 bg-zinc-950 p-1 border border-zinc-800">
              {(["curl", "nextjs", "express", "python", "vercel"] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === tab
                      ? "bg-zinc-800 text-white font-bold"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {tab === "curl"
                    ? "cURL"
                    : tab === "nextjs"
                    ? "Next.js"
                    : tab === "express"
                    ? "Express"
                    : tab === "python"
                    ? "Python"
                    : "Vercel Drain"}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="bg-black text-zinc-100 font-mono text-xs">
            {/* Snippet Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-950/80 border-b border-zinc-900 text-[11px] text-zinc-500">
              <span className="flex items-center gap-2 text-zinc-400">
                <Terminal className="h-3.5 w-3.5 text-emerald-400" />
                {snippets[activeTab].filename}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleCopy(snippets[activeTab].code, "snippet")}
                className="text-zinc-400 hover:text-white hover:bg-zinc-900 font-mono text-[10px] uppercase tracking-wider h-7 px-2.5 gap-1.5 cursor-pointer"
              >
                {copiedSnippet ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>COPY CODE</span>
                  </>
                )}
              </Button>
            </div>

            {/* Snippet Code block */}
            <pre className="p-5 overflow-x-auto leading-relaxed text-zinc-300 selection:bg-emerald-500 selection:text-black">
              <code>{snippets[activeTab].code}</code>
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Payload Schema Reference */}
      <Card className="border-border/60 bg-black/60 backdrop-blur rounded-none">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <CardTitle className="text-sm font-mono uppercase tracking-wider text-white">
              Telemetry JSON Payload Specification
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-zinc-400 font-sans">
            Every telemetry object sent to <code className="text-zinc-200">/api/telemetry/ingest</code> conforms to the following schema:
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto border border-zinc-900">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-zinc-950 border-b border-zinc-900 text-zinc-500 text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="p-3">Field</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Required</th>
                  <th className="p-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-zinc-300">
                <tr>
                  <td className="p-3 text-emerald-400">service</td>
                  <td className="p-3 text-zinc-500">string</td>
                  <td className="p-3 text-zinc-400">Optional</td>
                  <td className="p-3 text-zinc-400">
                    Identifier for the calling microservice or app (defaults to <code className="text-zinc-300">default-service</code>).
                  </td>
                </tr>
                <tr>
                  <td className="p-3 text-emerald-400">level</td>
                  <td className="p-3 text-zinc-500">&quot;INFO&quot; | &quot;WARN&quot; | &quot;ERROR&quot; | &quot;FATAL&quot;</td>
                  <td className="p-3 text-zinc-400">Optional</td>
                  <td className="p-3 text-zinc-400">
                    Severity level. PulseGuard automatically triggers AI War Rooms on <code className="text-amber-400">ERROR</code> and <code className="text-red-400">FATAL</code> anomaly spikes.
                  </td>
                </tr>
                <tr>
                  <td className="p-3 text-emerald-400">message</td>
                  <td className="p-3 text-zinc-500">string</td>
                  <td className="p-3 text-emerald-400 font-bold">Recommended</td>
                  <td className="p-3 text-zinc-400">
                    Human-readable error description, stack trace summary, or event log message.
                  </td>
                </tr>
                <tr>
                  <td className="p-3 text-emerald-400">metadata</td>
                  <td className="p-3 text-zinc-500">Record&lt;string, any&gt;</td>
                  <td className="p-3 text-zinc-400">Optional</td>
                  <td className="p-3 text-zinc-400">
                    Arbitrary context object (e.g. stack trace, route, user ID, request payload, environment).
                  </td>
                </tr>
                <tr>
                  <td className="p-3 text-emerald-400">timestamp</td>
                  <td className="p-3 text-zinc-500">ISO string | number</td>
                  <td className="p-3 text-zinc-400">Optional</td>
                  <td className="p-3 text-zinc-400">
                    Event occurrence time (defaults to server ingestion timestamp if omitted).
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

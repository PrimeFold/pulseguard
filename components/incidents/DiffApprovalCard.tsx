"use client";

import { useState } from "react";
import {
  GitPullRequest,
  CheckCircle2,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DiffApprovalCardProps {
  organizationId: string;
  incidentId?: string;
  filePath: string;
  patch: string;
  explanation: string;
}

export function DiffApprovalCard({
  organizationId,
  incidentId,
  filePath,
  patch,
  explanation,
}: DiffApprovalCardProps) {
  const [status, setStatus] = useState<
    "idle" | "submitting" | "approved" | "error"
  >("idle");
  const [prUrl, setPrUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleApprove() {
    try {
      setStatus("submitting");
      setErrorMessage(null);

      const res = await fetch("/api/github/pr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          incidentId,
          filePath,
          patch,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create PR");
      }

      setPrUrl(data.prUrl);
      setStatus("approved");
    } catch (err: any) {
      setErrorMessage(err.message);
      setStatus("error");
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(patch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-2.5 border border-zinc-800 bg-zinc-950 p-3 font-mono text-xs space-y-2.5 rounded-none">
      {/* Header Strip */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 text-[10px]">
        <div className="flex items-center gap-1.5 text-zinc-300">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span className="font-semibold uppercase tracking-wider">
            Remediation Patch
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-zinc-400 bg-zinc-900 px-1.5 py-0.5 border border-zinc-800">
            {filePath}
          </span>
          <button
            onClick={handleCopy}
            className="p-1 hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors cursor-pointer"
            title="Copy Diff"
          >
            {copied ? (
              <Check className="h-3 w-3 text-emerald-400" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
        </div>
      </div>

      {/* Explanation */}
      <p className="text-zinc-400 text-[11px] font-sans leading-relaxed">
        {explanation}
      </p>

      {/* Code / Diff Preview */}
      <div className="relative bg-black p-2.5 font-mono text-[10px] text-emerald-400 border border-zinc-900 overflow-x-auto max-h-48 scrollbar-thin">
        <pre className="whitespace-pre">{patch}</pre>
      </div>

      {/* Error state */}
      {status === "error" && (
        <p className="text-red-400 text-[10px] bg-red-950/20 border border-red-900/40 p-2">
          Error: {errorMessage}
        </p>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[9px] text-zinc-600 uppercase tracking-widest">
          Sign-off required for git merge
        </span>

        {status === "approved" && prUrl ? (
          <a
            href={prUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-mono font-bold tracking-wider uppercase transition-colors"
          >
            <CheckCircle2 className="h-3 w-3" />
            PR CREATED <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
          </a>
        ) : (
          <Button
            size="sm"
            onClick={handleApprove}
            disabled={status === "submitting"}
            className="h-7 text-[10px] px-3 gap-1.5 bg-white hover:bg-zinc-200 text-black font-mono font-bold tracking-wider uppercase rounded-none transition-all active:scale-[0.98] cursor-pointer"
          >
            {status === "submitting" ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                DRAFTING PR...
              </>
            ) : (
              <>
                <GitPullRequest className="h-3 w-3" />
                APPROVE & OPEN PR
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

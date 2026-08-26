'use client';

import { useState } from 'react';
import { GitPullRequest, CheckCircle2, Loader2, ExternalLink, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    
  const [status, setStatus] = useState<'idle' | 'submitting' | 'approved' | 'error'>('idle');
  const [prUrl, setPrUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleApprove() {
    try {
      setStatus('submitting');
      setErrorMessage(null);

      const res = await fetch('/api/github/pr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          incidentId,
          filePath,
          patch,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create PR');
      }

      setPrUrl(data.prUrl);
      setStatus('approved');
    } catch (err: any) {
      setErrorMessage(err.message);
      setStatus('error');
    }
  }

  return (
    <div className="mt-3 rounded-lg border border-border/80 bg-zinc-950/80 p-4 font-sans text-xs space-y-3 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-purple-400" />
          <span className="font-semibold text-zinc-100">Proposed Remediation Patch</span>
        </div>
        <span className="font-mono text-[11px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
          {filePath}
        </span>
      </div>

      {/* Explanation */}
      <p className="text-zinc-300 leading-relaxed">{explanation}</p>

      {/* Code / Diff Preview */}
      <div className="relative rounded bg-black/70 p-3 font-mono text-[11px] text-emerald-400 border border-zinc-800 overflow-x-auto max-h-60">
        <pre className="whitespace-pre">{patch}</pre>
      </div>

      {/* Error state if PR failed */}
      {status === 'error' && (
        <p className="text-red-400 text-[11px] font-mono">Error: {errorMessage}</p>
      )}

      {/* Action Area */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-zinc-400">
          Requires engineer approval to create GitHub PR
        </span>

        {status === 'approved' && prUrl ? (
          <a
            href={prUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            View PR on GitHub <ExternalLink className="h-3 w-3 ml-0.5" />
          </a>
        ) : (
          <Button
            size="sm"
            onClick={handleApprove}
            disabled={status === 'submitting'}
            className="gap-1.5 bg-purple-600 hover:bg-purple-500 text-white"
          >
            {status === 'submitting' ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Opening PR...
              </>
            ) : (
              <>
                <GitPullRequest className="h-3.5 w-3.5" />
                Approve & Open PR
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
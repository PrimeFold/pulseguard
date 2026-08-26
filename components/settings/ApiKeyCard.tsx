'use client';

import { useState } from 'react';
import { Copy, Check, RefreshCw, Key, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateApiKey } from '@/app/api/action/settings';


interface Props {
  organizationId: string;
  initialDisplayKey: string | null;
  canManage: boolean;
}

export function ApiKeyCard({ organizationId, initialDisplayKey, canManage }: Props) {
  const [displayKey, setDisplayKey] = useState(initialDisplayKey || '');
  const [revealedRawKey, setRevealedRawKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = async () => {
    if (
      displayKey &&
      !confirm('Rotating your key will immediately invalidate existing log drains and ingestion scripts. Continue?')
    ) {
      return;
    }

    setLoading(true);
    try {
      const res = await generateApiKey(organizationId);
      setDisplayKey(res.rawKey.slice(0,12)+"..."+res.rawKey.slice(-4));
      setRevealedRawKey(res.rawKey);
    } catch (err) {
      console.error('Failed to generate key:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/60 bg-card/40 backdrop-blur">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-foreground" />
          <CardTitle className="text-base">Telemetry Ingestion Key</CardTitle>
        </div>
        <CardDescription>
          Authenticate log forwarders (e.g. Vercel Log Drains) sending errors to <code>/api/telemetry/ingest</code>.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {revealedRawKey && (
          <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold">
              <AlertTriangle className="h-4 w-4" /> Copy your new secret key now:
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={revealedRawKey}
                readOnly
                className="font-mono text-xs bg-background/80 text-foreground"
              />
              <Button size="sm" onClick={() => handleCopy(revealedRawKey)} className="gap-1">
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                Copy
              </Button>
            </div>
            <p className="text-[11px] text-amber-400/80">
              For security, this raw key will never be shown again once refreshed.
            </p>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Input
            value={displayKey || 'No key generated yet'}
            readOnly
            className="font-mono text-xs bg-muted/30 text-muted-foreground"
          />
          {canManage && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerate}
              disabled={loading}
              className="gap-1.5 text-xs whitespace-nowrap"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              {displayKey ? 'Rotate Key' : 'Generate Key'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
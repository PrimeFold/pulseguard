"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaGithub } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";
import { ExternalLink, ShieldAlert, Link as LinkIcon, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { linkGithubInstallation } from "@/app/api/action/organization";

interface Props {
  organizationId: string;
  isGithubConnected: boolean;
  githubRepo: string | null;
  canManage: boolean;
}

export function GitHubIntegrationCard({
  organizationId,
  isGithubConnected,
  githubRepo,
  canManage,
}: Props) {
  const router = useRouter();
  const [manualId, setManualId] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linkSuccess, setLinkSuccess] = useState<string | null>(null);

  const appSlug = process.env.NEXT_PUBLIC_GITHUB_APP_SLUG || "pulseguard-app";
  const installUrl = `https://github.com/apps/${appSlug}/installations/new?state=${organizationId}`;

  const handleManualLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(manualId.trim(), 10);
    if (isNaN(id) || id <= 0) {
      setLinkError("Please enter a valid numeric GitHub Installation ID (e.g. 159566367).");
      return;
    }

    setIsLinking(true);
    setLinkError(null);
    setLinkSuccess(null);

    try {
      const res = await linkGithubInstallation({
        organizationId,
        installationId: id,
      });

      if (res.success) {
        setLinkSuccess(`Successfully connected to ${res.repoName || "repository"}!`);
        router.refresh();
      }
    } catch (err: any) {
      setLinkError(err.message || "Failed to link installation ID. Make sure the app has access to your repo.");
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <Card className="border-border/60 bg-card/40 backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaGithub className="h-5 w-5 text-foreground" />
            <CardTitle className="text-base">GitHub App Integration</CardTitle>
          </div>
          {isGithubConnected ? (
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 gap-1"
            >
              <FaCheckCircle className="h-3 w-3" /> Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              Not Connected
            </Badge>
          )}
        </div>
        <CardDescription>
          Grants repository access to read source code, analyze traces, and
          draft hotfix pull requests.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {isGithubConnected ? (
          <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20">
            <div>
              <p className="text-xs text-muted-foreground">Target Repository</p>
              <p className="text-sm font-medium text-foreground font-mono">
                {githubRepo}
              </p>
            </div>
            {canManage && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={installUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="gap-1.5 text-xs"
                >
                  Reconfigure <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
              <p className="text-xs text-muted-foreground">
                No repository connected. The agent cannot inspect code or create PRs.
              </p>
              {canManage ? (
                <Button size="sm" asChild className="gap-1.5 shrink-0">
                  <a href={installUrl}>
                    <FaGithub className="h-4 w-4" /> Connect GitHub
                  </a>
                </Button>
              ) : (
                <div className="flex items-center gap-1 text-xs text-amber-400">
                  <ShieldAlert className="h-3.5 w-3.5" /> Admin permissions required
                </div>
              )}
            </div>

            {/* Direct / Manual Installation Linking (e.g. when GitHub leaves user at settings/installations/<id>) */}
            {canManage && (
              <div className="pt-3 border-t border-border/40 space-y-2.5">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-zinc-300">
                    Already installed or navigated to github.com/settings/installations/&lt;ID&gt;?
                  </p>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    If GitHub redirected you to your installation page instead of the callback, paste the numeric ID from that URL (e.g. <code className="text-zinc-300">159566367</code>) below:
                  </p>
                </div>

                <form onSubmit={handleManualLink} className="flex flex-col sm:flex-row gap-2 max-w-md">
                  <Input
                    placeholder="Enter Installation ID (e.g. 159566367)"
                    value={manualId}
                    onChange={(e) => setManualId(e.target.value)}
                    disabled={isLinking}
                    className="h-9 text-xs font-mono"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isLinking || !manualId.trim()}
                    className="h-9 text-xs font-mono shrink-0 gap-1.5"
                  >
                    {isLinking ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Linking...
                      </>
                    ) : (
                      <>
                        <LinkIcon className="h-3.5 w-3.5" /> Link Installation
                      </>
                    )}
                  </Button>
                </form>

                {linkError && (
                  <p className="text-xs text-red-400 bg-red-950/20 border border-red-900/40 p-2 rounded">
                    {linkError}
                  </p>
                )}

                {linkSuccess && (
                  <p className="text-xs text-emerald-400 bg-emerald-950/20 border border-emerald-900/40 p-2 rounded flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> {linkSuccess}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

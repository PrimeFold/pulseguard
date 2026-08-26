'use client';
import { FaGithub } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";
import { ExternalLink, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Props{
    organizationId:string;
    isGithubConnected:boolean;
    githubRepo: string | null;
    canManage : boolean;
}

export function GitHubIntegrationCard({
organizationId,
isGithubConnected,
githubRepo,
canManage
}:Props){
    const appSlug = process.env.NEXT_PUBLIC_GITHUB_APP_SLUG;
    const installUrl = `https://github.com/apps/${appSlug}/installations/new?state=${organizationId}`;
    return (
    <Card className="border-border/60 bg-card/40 backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaGithub className="h-5 w-5 text-foreground" />
            <CardTitle className="text-base">GitHub App Integration</CardTitle>
          </div>
          {isGithubConnected ? (
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 gap-1">
              <FaCheckCircle className="h-3 w-3" /> Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              Not Connected
            </Badge>
          )}
        </div>
        <CardDescription>
          Grants repository access to read source code, analyze traces, and draft hotfix pull requests.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {isGithubConnected ? 
        
        (
          <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20">
            <div>
              <p className="text-xs text-muted-foreground">Target Repository</p>
              <p className="text-sm font-medium text-foreground font-mono">{githubRepo}</p>
            </div>
            {canManage && (
              <Button variant="outline" size="sm" asChild>
                <a href={installUrl} target="_blank" rel="noreferrer" className="gap-1.5 text-xs">
                  Reconfigure <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-muted-foreground">
              No repository connected. The agent cannot inspect code or create PRs.
            </p>
            {canManage ? (
              <Button size="sm" asChild className="gap-1.5">
                <a href={installUrl}>Connect GitHub</a>
              </Button>
            ) : (
              <div className="flex items-center gap-1 text-xs text-amber-400">
                <ShieldAlert className="h-3.5 w-3.5" /> Admin permissions required
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}



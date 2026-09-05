"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FaGithub } from "react-icons/fa6";
import {
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  Settings,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  organizationId: string;
  orgSlug: string;
  isGithubConnected: boolean;
  githubRepo: string | null;
  userRole: string; // "OWNER" | "ADMIN" | "MEMBER" | ...
}

export function GitHubConnectionReminder({
  organizationId,
  orgSlug,
  isGithubConnected,
  githubRepo,
  userRole,
}: Props) {
  const searchParams = useSearchParams();
  const justConnected = searchParams.get("github") === "connected";

  // Only Owners and Admins are responsible for managing repo integrations
  const canManage = userRole === "OWNER" || userRole === "ADMIN";

  // If just connected via redirect callback, render a celebratory confirmation banner
  if (justConnected && isGithubConnected) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 font-mono text-xs">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <div>
            <span className="font-bold uppercase tracking-wider block text-emerald-200">
              GitHub App Connected
            </span>
            <span className="text-[11px] text-emerald-400/80">
              Successfully linked to repository: <span className="font-bold underline">{githubRepo || "Target Repo"}</span>. Autonomous hotfix tools are active.
            </span>
          </div>
        </div>
        <Link
          href={`/${orgSlug}/settings`}
          className="text-[10px] uppercase tracking-widest text-emerald-400 hover:text-white underline shrink-0"
        >
          View Settings →
        </Link>
      </div>
    );
  }

  // If already connected, or if the user is a non-admin member, don't show the reminder
  if (isGithubConnected || !canManage) {
    return null;
  }

  const appSlug = process.env.NEXT_PUBLIC_GITHUB_APP_SLUG || "pulseguard-app";
  const installUrl = `https://github.com/apps/${appSlug}/installations/new?state=${organizationId}`;

  return (
    <div className="relative overflow-hidden border border-amber-900/60 bg-gradient-to-r from-amber-950/20 via-black to-zinc-950 p-4 sm:p-5">
      {/* Subtle indicator accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500/80 via-amber-400 to-transparent" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="h-9 w-9 rounded-none bg-amber-950/40 border border-amber-800/60 flex items-center justify-center shrink-0 mt-0.5">
            <FaGithub className="h-5 w-5 text-amber-400" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                Setup Required: GitHub Repository Disconnected
              </span>
              <span className="hidden sm:inline px-1.5 py-0.5 bg-amber-950/60 border border-amber-800/50 text-amber-400 text-[9px] font-mono font-bold uppercase">
                {userRole} Action Needed
              </span>
            </div>

            <p className="text-[11px] font-sans text-zinc-400 max-w-2xl leading-relaxed">
              You skipped repository attachment during setup. PulseGuard SRE Agents cannot inspect source files or generate automated hotfix PRs until the GitHub App is authorized.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
          <Button
            asChild
            size="sm"
            className="bg-amber-400 hover:bg-amber-300 text-black border border-transparent font-mono text-[10px] font-bold uppercase tracking-wider rounded-none h-8 px-3.5 cursor-pointer active:scale-95 transition-transform"
          >
            <a href={installUrl} target="_self">
              <FaGithub className="mr-1.5 h-3.5 w-3.5" />
              Authorize & Connect Repo
              <ExternalLink className="ml-1.5 h-3 w-3" />
            </a>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white font-mono text-[10px] uppercase tracking-wider rounded-none h-8 px-3 cursor-pointer"
          >
            <Link href={`/${orgSlug}/settings`}>
              <Settings className="mr-1.5 h-3 w-3 text-zinc-500" />
              Settings
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrganization } from "@/app/api/action/organization";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Plus,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  GitFork,
} from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { Input } from "@/components/ui/input";

export function CreateWorkspaceForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 2 state
  const [createdOrg, setCreatedOrg] = useState<{ id: string; slug: string; name: string } | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    // Auto-generate slug if it hasn't been manually heavily edited
    if (
      !slug ||
      slug ===
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
    ) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, ""),
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;

    setLoading(true);
    setError(null);
    try {
      const res = await createOrganization({ name, slug });
      if (res.success && res.org) {
        // Transition to Step 2: GitHub Repository Attachment
        setCreatedOrg({
          id: res.org.id,
          slug: res.org.slug,
          name: res.org.name,
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to create workspace.");
    } finally {
      setLoading(false);
    }
  };

  const appSlug = process.env.NEXT_PUBLIC_GITHUB_APP_SLUG || "pulseguard-app";
  const githubInstallUrl = createdOrg
    ? `https://github.com/apps/${appSlug}/installations/new?state=${createdOrg.id}`
    : "#";

  // If organization has been provisioned, render Step 2: GitHub Attachment
  if (createdOrg) {
    return (
      <div className="space-y-6">
        {/* Step progress bar */}
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-zinc-500 pb-3 border-b border-zinc-900">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" /> Step 1: Workspace Created
          </span>
          <span className="text-zinc-400 font-bold">
            Step 2: Attach GitHub Repo
          </span>
        </div>

        {/* GitHub Attachment Card */}
        <div className="p-6 bg-black border border-zinc-900 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <FaGithub className="h-6 w-6 text-white" />
                <h3 className="text-lg font-mono font-bold text-white uppercase tracking-tight">
                  Connect GitHub Repository
                </h3>
              </div>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed max-w-md">
                Authorize the PulseGuard GitHub App so the AI SRE Agent can inspect source code, correlate stack traces, and draft autonomous hotfix Pull Requests.
              </p>
            </div>
            <span className="px-2 py-1 bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 font-mono text-[9px] font-bold uppercase tracking-wider shrink-0">
              RECOMMENDED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-[11px] font-mono text-zinc-400">
            <div className="flex items-center gap-2 p-2.5 bg-zinc-950/80 border border-zinc-900">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Least-privilege app scoped to target repos</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-zinc-950/80 border border-zinc-900">
              <GitFork className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Automatic patch and PR branch creation</span>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-zinc-900">
            {/* Primary Action: Install GitHub App */}
            <Button
              asChild
              className="w-full bg-white hover:bg-zinc-200 text-black border border-transparent font-mono text-xs font-bold tracking-widest uppercase rounded-none h-12 transition-all duration-300 active:scale-[0.98] cursor-pointer"
            >
              <a href={githubInstallUrl} target="_self">
                <FaGithub className="mr-2 h-4 w-4" />
                Authorize & Install GitHub App
                <ExternalLink className="ml-2 h-3.5 w-3.5" />
              </a>
            </Button>

            {/* Secondary Action: Skip for now */}
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/${createdOrg.slug}`)}
              className="w-full bg-transparent hover:bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800 font-mono text-xs uppercase tracking-wider rounded-none h-10 transition-colors cursor-pointer"
            >
              Skip for now & go to dashboard
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Button>

            <p className="text-[10px] font-mono text-zinc-600 text-center pt-1">
              Skipping? Organization Owners and Admins can connect or manage repositories at any time from Dashboard & Settings.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-950/20 border border-red-900/50 text-[10px] font-mono text-red-400 uppercase tracking-widest">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
            Workspace Name
          </label>
          <Input
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Acme Corp Production"
            className="bg-black border-zinc-900 text-white font-mono text-xs h-12 rounded-none placeholder:text-zinc-700 focus-visible:ring-1 focus-visible:ring-zinc-700"
            disabled={loading}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 flex items-center justify-between">
            <span>URL Slug</span>
            <span className="text-zinc-600">pulseguard.com/</span>
          </label>
          <Input
            value={slug}
            onChange={(e) =>
              setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ""))
            }
            placeholder="e.g. acme-corp"
            className="bg-black border-zinc-900 text-white font-mono text-xs h-12 rounded-none placeholder:text-zinc-700 focus-visible:ring-1 focus-visible:ring-zinc-700"
            disabled={loading}
            required
            pattern="[a-z0-9-]+"
            title="Only lowercase letters, numbers, and hyphens"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-900">
        <Button
          type="submit"
          disabled={loading || !name || !slug}
          className="w-full bg-white hover:bg-zinc-200 text-black border border-transparent font-mono text-xs font-bold tracking-widest uppercase rounded-none h-12 transition-all duration-300 active:scale-[0.98] cursor-pointer"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          PROVISION WORKSPACE
        </Button>
      </div>
    </form>
  );
}

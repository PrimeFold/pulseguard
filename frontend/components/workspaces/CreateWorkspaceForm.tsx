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
  Radio,
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
      <div className="space-y-8">
        {/* Step progress bar */}
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-zinc-400 pb-4 border-b border-zinc-900">
          <span className="flex items-center gap-2 text-emerald-400 font-bold">
            <CheckCircle2 className="h-4 w-4" /> Step 1: Workspace Created
          </span>
          <span className="text-zinc-200 font-bold">
            Step 2: Attach GitHub Repo
          </span>
        </div>

        {/* GitHub Attachment Card */}
        <div className="p-8 bg-black border border-zinc-800 space-y-8 shadow-xl">
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <FaGithub className="h-7 w-7 text-white" />
                <h3 className="text-xl font-mono font-bold text-white uppercase tracking-tight">
                  Connect GitHub Repository
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed max-w-lg">
                Authorize the PulseGuard GitHub App so the AI SRE Agent can inspect source code, correlate stack traces, and draft autonomous hotfix Pull Requests.
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider shrink-0">
              RECOMMENDED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs sm:text-sm font-mono text-zinc-300">
            <div className="flex items-center gap-3 p-3.5 bg-zinc-950 border border-zinc-800">
              <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>Least-privilege app scoped to target repos</span>
            </div>
            <div className="flex items-center gap-3 p-3.5 bg-zinc-950 border border-zinc-800">
              <GitFork className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>Automatic patch and PR branch creation</span>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-zinc-900">
            {/* Primary Action: Install GitHub App */}
            <Button
              asChild
              className="w-full bg-white hover:bg-zinc-200 text-black border border-transparent font-mono text-xs sm:text-sm font-bold tracking-widest uppercase rounded-none h-14 transition-all duration-300 active:scale-[0.98] cursor-pointer"
            >
              <a href={githubInstallUrl} target="_self">
                <FaGithub className="mr-2.5 h-5 w-5" />
                Authorize & Install GitHub App
                <ExternalLink className="ml-2.5 h-4 w-4" />
              </a>
            </Button>

            {/* Option 2: Go directly to Log Ingestion & Endpoint setup */}
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/${createdOrg.slug}/ingestion`)}
              className="w-full bg-zinc-950 hover:bg-zinc-900 text-emerald-400 hover:text-emerald-300 border-emerald-900/60 font-mono text-xs sm:text-sm font-semibold uppercase tracking-wider rounded-none h-12 transition-colors cursor-pointer flex items-center justify-center gap-2.5"
            >
              <Radio className="h-4 w-4" />
              Configure Log Ingestion Endpoint
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>

            {/* Option 3: Skip to overview dashboard */}
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push(`/${createdOrg.slug}`)}
              className="w-full bg-transparent hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 font-mono text-xs uppercase tracking-wider rounded-none h-10 transition-colors cursor-pointer"
            >
              Skip to Overview Dashboard
            </Button>

            <p className="text-xs font-mono text-zinc-500 text-center pt-2">
              Skipping? Organization Owners and Admins can connect or manage repositories at any time from Dashboard & Settings.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-950/30 border border-red-800/60 text-xs sm:text-sm font-mono text-red-400 uppercase tracking-wider">
          <AlertCircle className="h-5 w-5 shrink-0" /> {error}
        </div>
      )}

      <div className="space-y-6">
        <div className="space-y-2.5">
          <label className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-300">
            Workspace Name
          </label>
          <Input
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Acme Corp Production"
            className="bg-black border-zinc-800 text-white font-mono text-sm sm:text-base h-14 rounded-none placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-600 px-4"
            disabled={loading}
            required
          />
        </div>

        <div className="space-y-2.5">
          <label className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-300 flex items-center justify-between">
            <span>URL Slug</span>
            <span className="text-zinc-500 font-normal">pulseguard.com/</span>
          </label>
          <Input
            value={slug}
            onChange={(e) =>
              setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ""))
            }
            placeholder="e.g. acme-corp"
            className="bg-black border-zinc-800 text-white font-mono text-sm sm:text-base h-14 rounded-none placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-600 px-4"
            disabled={loading}
            required
            pattern="[a-z0-9-]+"
            title="Only lowercase letters, numbers, and hyphens"
          />
        </div>
      </div>

      <div className="pt-6 border-t border-zinc-900">
        <Button
          type="submit"
          disabled={loading || !name || !slug}
          className="w-full bg-white hover:bg-zinc-200 text-black border border-transparent font-mono text-xs sm:text-sm font-bold tracking-widest uppercase rounded-none h-14 transition-all duration-300 active:scale-[0.98] cursor-pointer"
        >
          {loading ? (
            <Loader2 className="mr-2.5 h-5 w-5 animate-spin" />
          ) : (
            <Plus className="mr-2.5 h-5 w-5" />
          )}
          PROVISION WORKSPACE
        </Button>
      </div>
    </form>
  );
}

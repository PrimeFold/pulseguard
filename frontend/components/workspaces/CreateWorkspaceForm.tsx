"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrganization } from "@/app/api/action/organization";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

export function CreateWorkspaceForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      if (res.success) {
        router.push(`/${res.org.slug}`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to create workspace.");
      setLoading(false);
    }
  };

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

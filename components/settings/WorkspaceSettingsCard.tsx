"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  updateOrganization,
  deleteOrganization,
} from "@/app/api/action/organization";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Save, Trash2, Loader2, AlertTriangle } from "lucide-react";

interface Props {
  organizationId: string;
  initialName: string;
  initialSlug: string;
  canManage: boolean;
  isOwner: boolean;
}

export function WorkspaceSettingsCard({
  organizationId,
  initialName,
  initialSlug,
  canManage,
  isOwner,
}: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || name === initialName) return;

    setLoading(true);
    try {
      await updateOrganization({ id: organizationId, name });
    } catch (err: any) {
      alert(err.message || "Failed to update workspace.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isOwner) return;
    const confirmName = prompt(
      `To delete this workspace, please type its slug: ${initialSlug}`,
    );
    if (confirmName !== initialSlug) {
      if (confirmName !== null) alert("Incorrect slug. Deletion cancelled.");
      return;
    }

    setDeleting(true);
    try {
      await deleteOrganization({ id: organizationId });
      router.push("/workspaces");
    } catch (err: any) {
      alert(err.message || "Failed to delete workspace.");
      setDeleting(false);
    }
  };

  return (
    <div className="border border-zinc-900 bg-black overflow-hidden relative">
      <div className="p-6 border-b border-zinc-900 bg-zinc-950/50">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="h-5 w-5 text-purple-500" />
          <h2 className="text-sm font-mono font-semibold tracking-widest text-white uppercase">
            Workspace Configuration
          </h2>
        </div>
        <p className="text-[11px] font-mono text-zinc-500 leading-relaxed">
          Manage workspace identity and lifecycle settings.
        </p>
      </div>

      <div className="divide-y divide-zinc-900/50">
        <form onSubmit={handleUpdate} className="p-6 space-y-4">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="space-y-2 flex-1">
                <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                  Workspace Name
                </label>
                <div className="flex gap-2">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!canManage || loading}
                    className="bg-black border-zinc-900 text-white font-mono text-xs h-10 rounded-none placeholder:text-zinc-700 focus-visible:ring-1 focus-visible:ring-zinc-700"
                  />
                  {canManage && (
                    <Button
                      type="submit"
                      disabled={loading || name === initialName || !name}
                      className="bg-white hover:bg-zinc-200 text-black border border-transparent font-mono text-[10px] font-bold tracking-widest uppercase rounded-none h-10 px-4 transition-all duration-300 active:scale-[0.98]"
                    >
                      {loading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Save className="h-3.5 w-3.5 mr-2" />
                      )}
                      Save
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-2 flex-1">
                <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                  URL Slug
                </label>
                <Input
                  value={initialSlug}
                  disabled
                  className="bg-zinc-950 border-zinc-900/50 text-zinc-500 font-mono text-xs h-10 rounded-none opacity-80 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Danger Zone */}
        {isOwner && (
          <div className="p-6 space-y-4 bg-red-950/10">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <h3 className="text-xs font-mono font-bold tracking-widest text-red-500 uppercase">
                Danger Zone
              </h3>
            </div>
            <p className="text-[11px] font-mono text-zinc-500 max-w-2xl">
              Permanently delete this workspace and all of its associated
              telemetry, incidents, and team data. This action cannot be undone.
            </p>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="bg-transparent hover:bg-red-950/30 text-red-500 hover:text-red-400 border border-red-900 hover:border-red-500/50 rounded-none h-10 font-mono text-[10px] uppercase tracking-widest px-4 transition-all active:scale-[0.98]"
            >
              {deleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-3.5 w-3.5 mr-2" />
              )}
              DELETE WORKSPACE
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrganization } from "@/app/api/action/organization";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Save, Trash2, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { DeleteWorkspaceModal } from "@/components/workspaces/DeleteWorkspaceModal";

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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [updateFeedback, setUpdateFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || name === initialName) return;

    setLoading(true);
    setUpdateFeedback(null);
    try {
      const res = await updateOrganization({ id: organizationId, name });
      if (res && (res as any).error) {
        setUpdateFeedback({ type: "error", message: (res as any).error });
      } else {
        setUpdateFeedback({ type: "success", message: "Workspace name updated successfully." });
        router.refresh();
      }
    } catch (err: any) {
      setUpdateFeedback({ type: "error", message: err.message || "Failed to update workspace." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="border border-zinc-800 bg-black overflow-hidden relative shadow-md">
        <div className="p-6 sm:p-8 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-6 w-6 text-purple-400" />
            <h2 className="text-base sm:text-lg font-mono font-bold tracking-wider text-white uppercase">
              Workspace Configuration
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-sans text-zinc-400 leading-relaxed">
            Manage workspace identity and lifecycle settings.
          </p>
        </div>

        <div className="divide-y divide-zinc-900">
          <form onSubmit={handleUpdate} className="p-6 sm:p-8 space-y-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">
                    Workspace Name
                  </label>
                  <div className="flex gap-3">
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={!canManage || loading}
                      className="bg-black border-zinc-800 text-white font-mono text-xs sm:text-sm h-12 rounded-none placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-600 px-4"
                    />
                    {canManage && (
                      <Button
                        type="submit"
                        disabled={loading || name === initialName || !name}
                        className="bg-white hover:bg-zinc-200 text-black border border-transparent font-mono text-xs font-bold tracking-wider uppercase rounded-none h-12 px-5 transition-all duration-300 active:scale-[0.98] cursor-pointer shrink-0"
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">
                    URL Slug
                  </label>
                  <Input
                    value={initialSlug}
                    disabled
                    className="bg-zinc-950 border-zinc-900 text-zinc-400 font-mono text-xs sm:text-sm h-12 rounded-none cursor-not-allowed px-4"
                  />
                </div>
              </div>

              {updateFeedback && (
                <div
                  className={`p-3.5 border font-mono text-xs uppercase rounded-none flex items-center gap-2 ${
                    updateFeedback.type === "success"
                      ? "bg-emerald-950/30 border-emerald-800/60 text-emerald-400"
                      : "bg-red-950/30 border-red-800/60 text-red-400"
                  }`}
                >
                  {updateFeedback.type === "success" && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                  {updateFeedback.message}
                </div>
              )}
            </div>
          </form>

          {/* Danger Zone */}
          {isOwner && (
            <div className="p-6 sm:p-8 space-y-5 bg-red-950/10">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h3 className="text-sm font-mono font-bold tracking-widest text-red-500 uppercase">
                  Danger Zone
                </h3>
              </div>
              <p className="text-xs sm:text-sm font-sans text-zinc-300 max-w-2xl leading-relaxed">
                Permanently delete this workspace and all of its associated
                telemetry logs, war room incidents, and team data. This action cannot be undone.
              </p>
              <Button
                type="button"
                variant="destructive"
                onClick={() => setIsDeleteModalOpen(true)}
                className="bg-transparent hover:bg-red-950/40 text-red-500 hover:text-red-400 border border-red-900 hover:border-red-600 rounded-none h-11 font-mono text-xs font-bold uppercase tracking-wider px-5 transition-all active:scale-[0.98] cursor-pointer"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                DELETE WORKSPACE
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* High-End Confirmation Dialog Modal */}
      <DeleteWorkspaceModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        organizationId={organizationId}
        organizationName={initialName}
        organizationSlug={initialSlug}
      />
    </>
  );
}

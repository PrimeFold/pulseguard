"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteOrganization } from "@/app/api/action/organization";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Loader2, X, Trash2, CheckCircle2 } from "lucide-react";

interface DeleteWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
}

export function DeleteWorkspaceModal({
  isOpen,
  onClose,
  organizationId,
  organizationName,
  organizationSlug,
}: DeleteWorkspaceModalProps) {
  const router = useRouter();
  const [typedSlug, setTypedSlug] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isMatched = typedSlug.trim() === organizationSlug;

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMatched || deleting) return;

    setDeleting(true);
    setError(null);

    try {
      const res = await deleteOrganization({ id: organizationId });
      if (res && (res as any).error) {
        setError((res as any).error);
        setDeleting(false);
        return;
      }
      onClose();
      router.push("/workspaces");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while deleting the workspace.");
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in-0 duration-200">
      <div 
        className="relative w-full max-w-lg bg-black border border-red-950/80 shadow-[0_0_50px_rgba(239,68,68,0.15)] rounded-none overflow-hidden space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Danger Banner */}
        <div className="bg-red-950/40 border-b border-red-900/60 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-red-950/80 border border-red-800/80 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                Delete Workspace
              </h2>
              <p className="text-xs font-mono text-red-400">
                Action requires owner authorization
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={deleting}
            className="text-zinc-500 hover:text-white transition-colors p-1.5 cursor-pointer rounded-none disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleDelete} className="p-6 pt-0 space-y-6">
          <div className="space-y-3">
            <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
              You are about to permanently delete <strong className="text-white font-mono bg-zinc-900 px-2 py-0.5 border border-zinc-800">{organizationName}</strong> (`/{organizationSlug}`).
            </p>
            <div className="p-3.5 bg-red-950/20 border border-red-900/40 text-xs font-mono text-zinc-400 space-y-1">
              <p className="text-red-400 font-bold uppercase tracking-wider">⚠️ Warning:</p>
              <p>This action will destroy all telemetry logs, war room incidents, AI settings, and member access. <strong>This cannot be undone.</strong></p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-950/40 border border-red-800 text-xs font-mono text-red-400">
              {error}
            </div>
          )}

          {/* Input Verification */}
          <div className="space-y-2.5">
            <label className="text-xs font-mono text-zinc-300 uppercase tracking-wider block">
              To confirm, type <span className="text-white font-bold bg-zinc-900 px-2 py-0.5 border border-zinc-800 select-all font-mono">{organizationSlug}</span> below:
            </label>
            <Input
              value={typedSlug}
              onChange={(e) => setTypedSlug(e.target.value)}
              placeholder={`Type "${organizationSlug}" to confirm`}
              disabled={deleting}
              autoFocus
              className="bg-zinc-950 border-zinc-800 text-white font-mono text-sm h-12 rounded-none placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-red-600 px-4"
            />
            <div className="flex items-center justify-between text-xs font-mono">
              {isMatched ? (
                <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Slug match confirmed
                </span>
              ) : (
                <span className="text-zinc-500">
                  Slug matching required to unlock deletion button
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-900">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={deleting}
              className="bg-transparent hover:bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800 font-mono text-xs font-bold uppercase tracking-wider h-11 px-5 rounded-none cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isMatched || deleting}
              className="bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold uppercase tracking-wider h-11 px-6 rounded-none transition-all duration-200 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-red-950/50"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  DELETING WORKSPACE...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  DELETE WORKSPACE
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

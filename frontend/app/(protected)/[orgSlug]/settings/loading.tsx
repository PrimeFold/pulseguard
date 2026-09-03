import { Settings } from "lucide-react";

export default function SettingsLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-900">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-zinc-400 animate-pulse" />
            <h1 className="text-3xl font-mono tracking-tighter text-white uppercase">
              Settings & Configuration
            </h1>
          </div>
          <p className="text-[11px] font-mono text-zinc-500 tracking-widest uppercase">
            Workspace Configuration
          </p>
        </div>
      </div>

      {/* Settings Card Skeleton */}
      <div className="border border-zinc-900 bg-black p-6 space-y-6">
        <div className="h-5 w-48 bg-zinc-900 animate-pulse" />
        <div className="space-y-4">
          <div className="h-10 w-full bg-zinc-950 border border-zinc-900 animate-pulse" />
          <div className="h-10 w-full bg-zinc-950 border border-zinc-900 animate-pulse" />
        </div>
        <div className="h-9 w-32 bg-zinc-900" />
      </div>
    </div>
  );
}

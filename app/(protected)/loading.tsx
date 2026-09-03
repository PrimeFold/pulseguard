import { Building2 } from "lucide-react";

export default function WorkspacesLoading() {
  return (
    <div className="max-w-5xl mx-auto py-12 px-6 space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-900">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-zinc-400" />
            <h1 className="text-xl font-mono font-bold tracking-tight text-white uppercase">
              Organizations & Workspaces
            </h1>
          </div>
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
            Select or provision an SRE cluster workspace
          </p>
        </div>

        <div className="h-9 w-36 bg-zinc-900 border border-zinc-800 animate-pulse" />
      </div>

      {/* Grid of Workspace Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-5 bg-black border border-zinc-900 space-y-4 relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-4 w-3/4 bg-zinc-900 border border-zinc-800 animate-pulse" />
                <div className="h-3 w-1/2 bg-zinc-900/60 animate-pulse" />
              </div>
              <div className="h-4 w-12 bg-zinc-900" />
            </div>
            <div className="pt-2 border-t border-zinc-900/60 flex items-center justify-between">
              <div className="h-3 w-20 bg-zinc-900/40" />
              <div className="h-3 w-16 bg-zinc-900/40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

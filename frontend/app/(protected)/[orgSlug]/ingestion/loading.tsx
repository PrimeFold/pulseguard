import { Radio } from "lucide-react";

export default function IngestionLoading() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-zinc-900">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <Radio className="h-6 w-6 text-emerald-500/50 animate-pulse" />
            <h1 className="text-3xl font-mono tracking-tighter text-white uppercase">
              Ingestion Endpoint
            </h1>
          </div>
          <p className="text-[11px] font-mono text-zinc-500 tracking-widest uppercase">
            Cluster Telemetry / HTTP Ingestion / Platform Integration
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-8 w-40 bg-zinc-950 border border-zinc-900 animate-pulse" />
        </div>
      </div>

      {/* Main Endpoint Card Skeleton */}
      <div className="border border-zinc-900 bg-black/60 p-6 space-y-4">
        <div className="h-5 w-56 bg-zinc-900 animate-pulse" />
        <div className="h-11 w-full bg-zinc-950 border border-zinc-900 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="h-16 bg-zinc-950/80 border border-zinc-900 animate-pulse" />
          <div className="h-16 bg-zinc-950/80 border border-zinc-900 animate-pulse" />
          <div className="h-16 bg-zinc-950/80 border border-zinc-900 animate-pulse" />
        </div>
      </div>

      {/* Split Cards Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-zinc-900 bg-black/60 p-6 space-y-4">
          <div className="h-5 w-44 bg-zinc-900 animate-pulse" />
          <div className="h-10 w-full bg-zinc-950 border border-zinc-900 animate-pulse" />
        </div>
        <div className="border border-zinc-900 bg-black/60 p-6 space-y-4">
          <div className="h-5 w-44 bg-zinc-900 animate-pulse" />
          <div className="h-11 w-full bg-zinc-950 border border-zinc-900 animate-pulse" />
        </div>
      </div>

      {/* Code Snippets Skeleton */}
      <div className="border border-zinc-900 bg-black/60 p-6 space-y-4">
        <div className="h-5 w-60 bg-zinc-900 animate-pulse" />
        <div className="h-48 w-full bg-zinc-950 border border-zinc-900 animate-pulse" />
      </div>
    </div>
  );
}

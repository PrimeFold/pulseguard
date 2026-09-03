import { Activity, Terminal, Search } from "lucide-react";

export default function TelemetryLoading() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-zinc-900">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-purple-500 animate-pulse" />
            <h1 className="text-3xl font-mono tracking-tighter text-white uppercase">
              Telemetry Stream
            </h1>
          </div>
          <p className="text-[11px] font-mono text-zinc-500 tracking-widest uppercase">
            Cluster Logs / Health Metrics / Live Tail
          </p>
        </div>

        <div className="flex items-center gap-3 px-4 py-2.5 bg-zinc-950 border border-zinc-900 text-zinc-400 font-mono text-xs uppercase tracking-widest">
          <span className="h-2 w-2 bg-purple-500 animate-pulse" />
          <span>CONNECTING TO LOG INGESTION...</span>
        </div>
      </div>

      {/* Filter Controls Bar Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80 bg-black border border-zinc-800 h-10 px-3 flex items-center gap-2 text-zinc-600 font-mono text-xs">
          <Search className="h-4 w-4" />
          <span>SEARCH LOG TRACES...</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-32 bg-zinc-950 border border-zinc-900 animate-pulse" />
          <div className="h-10 w-28 bg-zinc-950 border border-zinc-900 animate-pulse" />
        </div>
      </div>

      {/* Terminal Log Stream Table Skeleton */}
      <div className="border border-zinc-900 bg-black divide-y divide-zinc-900 font-mono">
        <div className="p-3 bg-zinc-950 flex items-center justify-between text-[10px] text-zinc-500 uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <Terminal className="h-3.5 w-3.5" />
            <span>RAW LOG STREAM</span>
          </div>
          <span>LIVE BUFFER</span>
        </div>

        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-3.5 flex items-center justify-between gap-4 font-mono text-xs"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="h-4 w-14 bg-zinc-900 animate-pulse" />
              <div className="h-4 w-20 bg-zinc-900/60 animate-pulse" />
              <div className="h-4 w-1/2 bg-zinc-900/80 animate-pulse" />
            </div>
            <div className="h-4 w-16 bg-zinc-900/40" />
          </div>
        ))}
      </div>
    </div>
  );
}

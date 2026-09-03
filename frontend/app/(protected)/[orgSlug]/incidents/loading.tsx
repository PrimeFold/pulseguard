import { Flame, ShieldAlert, Search } from "lucide-react";

export default function IncidentsLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-zinc-900">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <Flame className="h-6 w-6 text-red-500 animate-pulse" />
            <h1 className="text-3xl font-mono tracking-tighter text-white uppercase">
              Incident Response
            </h1>
          </div>
          <p className="text-[11px] font-mono text-zinc-500 tracking-widest uppercase">
            War Rooms / Anomaly Detection
          </p>
        </div>

        <div className="flex items-center gap-3 px-4 py-2.5 bg-zinc-950 border border-zinc-900 text-zinc-400 font-mono text-xs uppercase tracking-widest">
          <span className="h-2 w-2 bg-emerald-500 animate-pulse" />
          <span>QUERYING SIGNALS...</span>
        </div>
      </div>

      {/* Filter bar placeholder */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-72 bg-black border border-zinc-800 h-10 px-3 flex items-center gap-2 text-zinc-600 font-mono text-xs">
          <Search className="h-4 w-4" />
          <span>FILTER TRACES...</span>
        </div>
        <div className="flex items-center gap-1 p-1 bg-black border border-zinc-900">
          {["ALL", "OPEN", "INVESTIGATING", "RESOLVED"].map((tab) => (
            <div
              key={tab}
              className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-zinc-600 bg-zinc-950"
            >
              {tab}
            </div>
          ))}
        </div>
      </div>

      {/* Skeleton List Items */}
      <div className="grid grid-cols-1 border border-zinc-900 divide-y divide-zinc-900 bg-black">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-3 flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <div className="h-5 w-16 bg-zinc-900 border border-zinc-800 animate-pulse" />
                <div className="h-5 w-24 bg-zinc-900 border border-zinc-800 animate-pulse" />
              </div>
              <div className="h-4 w-2/3 bg-zinc-900/80 animate-pulse" />
            </div>
            <div className="h-8 w-24 bg-zinc-950 border border-zinc-900 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

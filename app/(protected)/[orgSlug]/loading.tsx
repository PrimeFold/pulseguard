import { Activity, Terminal, ShieldAlert } from "lucide-react";

export default function OrgDashboardLoading() {
  return (
    <div className="space-y-12">
      {/* Top Banner / Status Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-zinc-900">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-mono tracking-tighter text-white uppercase flex items-center gap-3">
            <Activity className="h-6 w-6 text-emerald-500 animate-pulse" /> SRE
            Telemetry Grid
          </h1>
          <p className="text-[11px] font-mono text-zinc-500 tracking-widest uppercase">
            Cluster metrics / Live Monitoring
          </p>
        </div>

        <div className="flex items-center gap-3 px-4 py-2.5 bg-zinc-950 border border-zinc-900 text-zinc-400 font-mono text-xs uppercase tracking-widest">
          <span className="h-2 w-2 bg-emerald-500 animate-pulse" />
          <span>SYNCHRONIZING FEED...</span>
        </div>
      </div>

      {/* 1. Metric Strip Structure */}
      <div className="grid grid-cols-1 md:grid-cols-4 border-t border-b border-zinc-900 divide-y md:divide-y-0 md:divide-x divide-zinc-900 bg-zinc-950/40">
        {[
          { label: "Active Alerts" },
          { label: "Resolved Incidents" },
          { label: "Telemetry Events (24h)" },
          { label: "Cluster Status" },
        ].map((item, idx) => (
          <div key={idx} className="p-5 space-y-2">
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              {item.label}
            </p>
            <div className="h-7 w-20 bg-zinc-900/60 border border-zinc-800/60 animate-pulse" />
          </div>
        ))}
      </div>

      {/* 2. Main Content Grid Structural Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Telemetry Chart Container Skeleton */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-zinc-900 pb-2.5">
            <Terminal className="h-4 w-4 text-zinc-400" />
            <h2 className="text-xs font-mono font-semibold tracking-widest uppercase text-white">
              Event Density (6H)
            </h2>
          </div>
          <div className="h-[280px] w-full border border-zinc-900 bg-zinc-950/40 p-4 relative flex flex-col justify-between">
            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-600">
              <span className="animate-pulse">
                STREAMING TELEMETRY BUFFER...
              </span>
              <span className="text-emerald-500">LIVE</span>
            </div>
            {/* Grid Lines */}
            <div className="space-y-8 w-full opacity-20">
              <div className="border-b border-dashed border-zinc-700 w-full" />
              <div className="border-b border-dashed border-zinc-700 w-full" />
              <div className="border-b border-dashed border-zinc-700 w-full" />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-zinc-600">
              <span>-6H</span>
              <span>-4H</span>
              <span>-2H</span>
              <span>NOW</span>
            </div>
          </div>
        </div>

        {/* Incidents Feed Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="h-4 w-4 text-zinc-400" />
              <h2 className="text-xs font-mono font-semibold tracking-widest uppercase text-white">
                Incident Stream
              </h2>
            </div>
            <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
              POLLING...
            </span>
          </div>

          <div className="divide-y divide-zinc-900 border border-zinc-900 bg-zinc-950/20">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3.5 space-y-2">
                <div className="h-3.5 w-3/4 bg-zinc-900 border border-zinc-800/40 animate-pulse" />
                <div className="h-2.5 w-1/2 bg-zinc-900/60 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

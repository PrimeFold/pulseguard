import { Cpu } from "lucide-react";

export default function AiSettingsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-900">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Cpu className="h-6 w-6 text-purple-500 animate-pulse" />
            <h1 className="text-3xl font-mono tracking-tighter text-white uppercase">
              AI Config
            </h1>
          </div>
          <p className="text-[11px] font-mono text-zinc-500 tracking-widest uppercase">
            SRE Engine / Inference Models
          </p>
        </div>
      </div>

      {/* AI Provider Card Skeleton */}
      <div className="border border-zinc-900 bg-black p-4 space-y-4">
        <div className="h-4 w-36 bg-zinc-900 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-10 bg-zinc-950 border border-zinc-900 animate-pulse"
            />
          ))}
        </div>
        <div className="h-8 w-full bg-zinc-950 border border-zinc-900 animate-pulse" />
      </div>
    </div>
  );
}

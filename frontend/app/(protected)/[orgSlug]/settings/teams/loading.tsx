import { Users, UserPlus } from "lucide-react";

export default function TeamsLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-900">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-blue-500 animate-pulse" />
            <h1 className="text-3xl font-mono tracking-tighter text-white uppercase">
              Team & Access
            </h1>
          </div>
          <p className="text-[11px] font-mono text-zinc-500 tracking-widest uppercase">
            Access Control / RBAC
          </p>
        </div>

        <div className="h-9 w-32 bg-zinc-900 border border-zinc-800 animate-pulse" />
      </div>

      {/* Team Member Table Skeleton */}
      <div className="border border-zinc-900 bg-black divide-y divide-zinc-900">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-zinc-900 rounded-none animate-pulse" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-32 bg-zinc-900 animate-pulse" />
                <div className="h-2.5 w-44 bg-zinc-900/60" />
              </div>
            </div>
            <div className="h-6 w-20 bg-zinc-950 border border-zinc-900" />
          </div>
        ))}
      </div>
    </div>
  );
}

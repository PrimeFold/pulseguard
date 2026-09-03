import { Terminal, Activity } from "lucide-react";

interface GlobalLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export function GlobalLoader({
  message = "INITIALIZING...",
  fullScreen = false,
}: GlobalLoaderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center space-y-6 ${
        fullScreen ? "fixed inset-0 bg-black z-50" : "min-h-[50vh] w-full"
      }`}
    >
      <div className="relative flex items-center justify-center h-14 w-14 border border-zinc-800 bg-zinc-950">
        {/* Radar/Pulse effect */}
        <div className="absolute inset-0 border border-emerald-500/20 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />

        {/* Inner static border */}
        <div className="absolute inset-2 border border-zinc-900" />

        <Activity className="h-5 w-5 text-emerald-500 animate-pulse relative z-10" />
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="text-[10px] font-mono font-bold tracking-[0.25em] text-emerald-500 uppercase">
          {message}
        </div>

        {/* Loading blocks */}
        <div className="flex gap-1">
          <span
            className="w-2 h-1 bg-zinc-800 animate-pulse"
            style={{ animationDelay: "0ms", animationDuration: "1s" }}
          />
          <span
            className="w-2 h-1 bg-zinc-700 animate-pulse"
            style={{ animationDelay: "200ms", animationDuration: "1s" }}
          />
          <span
            className="w-2 h-1 bg-zinc-600 animate-pulse"
            style={{ animationDelay: "400ms", animationDuration: "1s" }}
          />
        </div>
      </div>
    </div>
  );
}

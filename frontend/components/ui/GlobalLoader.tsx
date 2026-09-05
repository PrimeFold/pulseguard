"use client";

import { Activity, Shield, Terminal, Radio } from "lucide-react";

interface GlobalLoaderProps {
  message?: string;
  subMessage?: string;
  fullScreen?: boolean;
}

export function GlobalLoader({
  message = "ESTABLISHING TELEMETRY UPLINK...",
  subMessage = "SYNCHRONIZING CLUSTER STATE • VERIFYING MUTUAL TLS",
  fullScreen = false,
}: GlobalLoaderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center select-none ${
        fullScreen
          ? "fixed inset-0 bg-[#09090b]/95 backdrop-blur-md z-50 p-6"
          : "min-h-[60vh] w-full p-8"
      }`}
    >
      {/* Outer ambient glow */}
      <div className="relative flex flex-col items-center max-w-md w-full">
        {/* Glow backdrop */}
        <div className="absolute -top-10 h-48 w-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Central Aerospace Reticle */}
        <div className="relative flex items-center justify-center h-24 w-24 mb-8">
          {/* Outer dashed spinning ring */}
          <div className="absolute inset-0 rounded-full border border-dashed border-emerald-500/30 animate-[spin_12s_linear_infinite]" />

          {/* Middle counter-rotating accented ring */}
          <div className="absolute inset-2 rounded-full border-t-2 border-b border-transparent border-t-emerald-400 border-b-zinc-800 animate-[spin_3s_linear_infinite_reverse]" />

          {/* Inner radar pulse circle */}
          <div className="absolute inset-5 rounded-full bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.25)]">
            <Activity className="h-6 w-6 text-emerald-400 animate-pulse" />
          </div>

          {/* Corner HUD crosshair accents */}
          <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-zinc-600" />
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-zinc-600" />
          <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-zinc-600" />
          <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-zinc-600" />
        </div>

        {/* Status Typography */}
        <div className="space-y-3 text-center w-full">
          <div className="flex items-center justify-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <h3 className="text-xs sm:text-sm font-mono font-bold tracking-[0.2em] text-white uppercase">
              {message}
            </h3>
          </div>

          <p className="text-[11px] font-mono text-zinc-500 tracking-wider uppercase max-w-sm mx-auto">
            {subMessage}
          </p>

          {/* Futuristic Scanline Progress Bar */}
          <div className="relative w-full max-w-xs mx-auto h-1.5 bg-zinc-900 border border-zinc-800 overflow-hidden mt-4">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent via-emerald-400 to-transparent w-1/3 animate-[scan_1.6s_ease-in-out_infinite]"
              style={{
                animationTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </div>

          {/* Telemetry Micro-Readouts */}
          <div className="pt-3 flex items-center justify-center gap-4 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
            <span className="flex items-center gap-1">
              <Radio className="h-3 w-3 text-emerald-500 animate-pulse" />
              LIVE FEED
            </span>
            <span>•</span>
            <span>AES-256 GCM</span>
            <span>•</span>
            <span className="text-zinc-500 font-bold">RAG ENGINE OK</span>
          </div>
        </div>
      </div>
    </div>
  );
}
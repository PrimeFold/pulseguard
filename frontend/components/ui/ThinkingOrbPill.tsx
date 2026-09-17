"use client";

import React from "react";
import { ThinkingOrb } from "thinking-orbs";

export type OrbActivityState =
 | "searching"
 | "connecting"
 | "solving"
 | "working"
 | "listening"
 | "composing"
 | "shaping"
 | "breathing";

interface ThinkingOrbPillProps {
 state: OrbActivityState;
 label?: string;
 detail?: string;
 size?: 20 | 64;
 className?: string;
 compact?: boolean;
}

export function ThinkingOrbPill({
 state,
 label,
 detail,
 size = 20,
 className = "",
 compact = false,
}: ThinkingOrbPillProps) {
 if (compact) {
 return (
 <div
 className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-300 shadow-sm transition-all duration-200 ${className}`}
 >
 <ThinkingOrb state={state} size={20} theme="dark" />
 <span className="text-[11px] font-mono font-medium tracking-wide uppercase text-zinc-300">
 {label || state.toUpperCase()}
 </span>
 </div>
 );
 }

 return (
 <div
 className={`inline-flex items-center gap-3 px-3.5 py-2 rounded-full bg-zinc-950/90 border border-zinc-800 text-zinc-200 shadow-lg backdrop-blur-sm select-none transition-all duration-300 ${className}`}
 >
 <div className="flex items-center justify-center shrink-0">
 <ThinkingOrb state={state} size={size} theme="dark" />
 </div>
 <div className="flex flex-col min-w-0 pr-1.5 font-mono">
 <div className="flex items-center gap-2">
 <span className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
 {label || state.toUpperCase()}
 </span>
 <span className="flex h-1.5 w-1.5 relative">
 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white-400 opacity-75" />
 <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white text-black" />
 </span>
 </div>
 {detail && (
 <span className="text-[11px] text-zinc-400 truncate max-w-xs sm:max-w-md font-sans">
 {detail}
 </span>
 )}
 </div>
 </div>
 );
}

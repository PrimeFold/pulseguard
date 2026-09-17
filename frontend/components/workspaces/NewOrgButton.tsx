"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { MetalFx, useMetalBend } from "metal-fx";
import { useRef } from "react";

export function NewOrgButton() {
    const metalRef = useRef<HTMLDivElement>(null);
    useMetalBend(metalRef);

    return (
        <div className="shrink-0">
            <MetalFx ref={metalRef} preset="chromatic" innerShadow strength={0.90}>
                <Link
                    href="/workspaces/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-black border border-zinc-800 text-white hover:bg-zinc-900 font-mono text-xs font-bold tracking-wider transition-all duration-300 active:scale-[0.98] cursor-pointer shadow-sm rounded-xl"
                >
                    <Plus className="h-3.5 w-3.5" /> NEW ORG
                </Link>
            </MetalFx>
        </div>
    );
}

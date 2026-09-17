import { Loader2 } from "lucide-react";

export function PageLoader() {
    return (
        <div className="flex flex-col items-center justify-center flex-1 h-full w-full min-h-[80dvh] gap-4 text-white">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
            <p className="font-mono text-xs text-zinc-400 uppercase tracking-widest animate-pulse">Loading</p>
        </div>
    );
}

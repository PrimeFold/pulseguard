"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from "lucide-react";

export function JoinWorkspaceCard({
  token,
  orgName,
}: {
  token: string;
  orgName: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleJoin() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/invites/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to join workspace");

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-2.5 rounded-none bg-red-950/40 border border-red-900/40 text-[11px] text-red-400 font-mono">
          {error}
        </div>
      )}

      <Button
        onClick={handleJoin}
        disabled={loading}
        className="w-full bg-white hover:bg-zinc-200 text-black gap-2 font-mono text-xs font-semibold rounded-none"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Joining {orgName}...
          </>
        ) : (
          <>
            Join Workspace <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}

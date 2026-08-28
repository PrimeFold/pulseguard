"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, User } from "lucide-react";

export function UserProfileForm({
  user,
}: {
  user: { id: string; name: string; email: string };
}) {
  const [name, setName] = useState(user.name || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await authClient.updateUser({
        name: name,
      });

      if (error) {
        setMessage({
          type: "error",
          text: error.message || "Failed to update profile.",
        });
      } else {
        setMessage({ type: "success", text: "Profile updated successfully." });
      }
    } catch {
      setMessage({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-zinc-950/60 border border-zinc-800 rounded-none shadow-none">
      <CardHeader className="pb-4 px-6 pt-6">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-zinc-400" />
          <CardTitle className="text-sm font-semibold font-mono uppercase tracking-wider text-white">
            User Settings
          </CardTitle>
        </div>
        <CardDescription className="text-xs text-zinc-500 font-sans">
          Manage your personal console credentials and profile name.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <CardContent className="px-6 pb-4 space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              Email Address
            </label>
            <Input
              value={user.email}
              disabled
              className="bg-zinc-900 border-zinc-800 text-zinc-500 cursor-not-allowed text-xs rounded-none h-8 font-sans"
            />
            <p className="text-[10px] text-zinc-600 font-sans leading-relaxed">
              Email changes are locked under tenant security rules.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              Display Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="bg-zinc-900 border-zinc-800 text-zinc-100 text-xs rounded-none h-8 font-sans focus-visible:ring-1 focus-visible:ring-zinc-700"
              required
            />
          </div>

          {message && (
            <div
              className={`p-2 border font-mono text-[10px] uppercase rounded-none ${
                message.type === "success"
                  ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-400"
                  : "bg-red-950/20 border-red-900/40 text-red-400"
              }`}
            >
              {message.text}
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t border-zinc-900 px-6 py-4 bg-zinc-950/40 flex items-center justify-between">
          <Button
            type="submit"
            disabled={loading || name === user.name}
            className="bg-white hover:bg-zinc-200 text-black border border-transparent font-mono text-[10px] font-semibold tracking-wider rounded-none h-8 px-4 transition-all duration-300 active:scale-[0.98] cursor-pointer"
          >
            {loading && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
            SAVE CHANGES
          </Button>

          <Button
            type="button"
            onClick={async () => {
              await authClient.signOut();
              window.location.href = "/login";
            }}
            className="bg-transparent hover:bg-red-950/30 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-900/50 font-mono text-[10px] font-semibold tracking-wider rounded-none h-8 px-3 transition-all duration-300 active:scale-[0.98] cursor-pointer"
          >
            SIGN OUT
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

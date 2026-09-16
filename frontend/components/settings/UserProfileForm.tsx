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
    <Card className="bg-zinc-950/80 border border-zinc-800 rounded-none shadow-md">
      <CardHeader className="pb-5 px-6 pt-6">
        <div className="flex items-center gap-2.5">
          <User className="h-5 w-5 text-zinc-300" />
          <CardTitle className="text-base font-bold font-mono uppercase tracking-wider text-white">
            User Settings
          </CardTitle>
        </div>
        <CardDescription className="text-xs sm:text-sm text-zinc-400 font-sans mt-1">
          Manage your personal console credentials and profile name.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} className="space-y-5">
        <CardContent className="px-6 pb-4 space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
              Email Address
            </label>
            <Input
              value={user.email}
              disabled
              className="bg-zinc-900/90 border-zinc-800 text-zinc-400 cursor-not-allowed text-xs sm:text-sm rounded-none h-11 font-sans"
            />
            <p className="text-xs text-zinc-500 font-sans leading-relaxed">
              Email changes are locked under tenant security rules.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
              Display Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="bg-zinc-900 border-zinc-800 text-zinc-100 text-xs sm:text-sm rounded-none h-11 font-sans focus-visible:ring-1 focus-visible:ring-zinc-700"
              required
            />
          </div>

          {message && (
            <div
              className={`p-3 border font-mono text-xs uppercase rounded-none ${
                message.type === "success"
                  ? "bg-emerald-950/30 border-emerald-800/50 text-emerald-400"
                  : "bg-red-950/30 border-red-800/50 text-red-400"
              }`}
            >
              {message.text}
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t border-zinc-900 px-6 py-4 bg-zinc-950/60 flex items-center justify-between gap-3">
          <Button
            type="submit"
            disabled={loading || name === user.name}
            className="bg-white hover:bg-zinc-200 text-black border border-transparent font-mono text-xs font-bold tracking-wider rounded-none h-10 px-5 transition-all duration-300 active:scale-[0.98] cursor-pointer"
          >
            {loading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            SAVE CHANGES
          </Button>

          <Button
            type="button"
            onClick={async () => {
              await authClient.signOut();
              window.location.href = "/login";
            }}
            className="bg-transparent hover:bg-red-950/30 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-900/50 font-mono text-xs font-bold tracking-wider rounded-none h-10 px-4 transition-all duration-300 active:scale-[0.98] cursor-pointer"
          >
            SIGN OUT
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

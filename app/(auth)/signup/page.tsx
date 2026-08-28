"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowRight, ShieldCheck, UserPlus, Terminal, AlertTriangle } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const formBoxRef = useRef<HTMLDivElement>(null);
  const asideBoxRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  // Minimal, high-end GSAP entrance animation
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    tl.fromTo(
      formBoxRef.current,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.45 }
    ).fromTo(
      asideBoxRef.current,
      { opacity: 0, x: 12 },
      { opacity: 1, x: 0, duration: 0.45 },
      "-=0.3"
    );
  }, { scope: containerRef });

  // Smooth error reveal
  useGSAP(() => {
    if (error && errorRef.current) {
      gsap.fromTo(
        errorRef.current,
        { opacity: 0, height: 0, y: -4 },
        { opacity: 1, height: "auto", y: 0, duration: 0.25, ease: "power2.out" }
      );
    }
  }, [error]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: signUpError } = await authClient.signUp.email({
      email,
      password,
      name,
    });

    if (signUpError) {
      setError(signUpError.message || "Failed to initialize operator profile.");
      setLoading(false);
    } else {
      router.push("/workspaces");
    }
  };

  return (
    <div ref={containerRef} className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-0 border border-zinc-800 bg-black shadow-2xl">
      
      {/* Left Form Box (7 Cols) */}
      <div ref={formBoxRef} className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-8 bg-zinc-950/60">
        <div className="space-y-6">
          <div className="space-y-1.5 border-b border-zinc-900 pb-4">
            <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px] uppercase tracking-widest">
              <UserPlus className="h-3.5 w-3.5 text-zinc-400" />
              <span>Operator Enrollment</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-mono font-semibold tracking-tight text-white uppercase">
              Create Operator ID
            </h1>
            <p className="text-xs text-zinc-400 font-sans">
              Initialize your developer credentials to manage incident war rooms.
            </p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                Full Legal / Operator Name
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Mercer"
                required
                className="bg-zinc-900 border-zinc-800 text-zinc-100 text-xs rounded-none h-9 font-sans placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                Work Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@company.com"
                required
                className="bg-zinc-900 border-zinc-800 text-zinc-100 text-xs rounded-none h-9 font-mono placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-700"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                  Password
                </label>
                <span className="text-[10px] font-mono text-zinc-600">MIN 8 CHARS</span>
              </div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                minLength={8}
                className="bg-zinc-900 border-zinc-800 text-zinc-100 text-xs rounded-none h-9 font-mono placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-700"
              />
            </div>

            {error && (
              <div ref={errorRef} className="p-3 bg-red-950/30 border border-red-900/40 text-red-400 text-xs font-mono flex items-start gap-2 rounded-none">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-zinc-200 text-black border border-transparent font-mono text-xs font-bold tracking-wider rounded-none h-9 transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  PROVISION OPERATOR ACCOUNT <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </form>
        </div>

        <div className="pt-4 border-t border-zinc-900 flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-500">Already registered?</span>
          <Link
            href="/login"
            className="text-white hover:underline underline-offset-4 decoration-zinc-700 transition-colors flex items-center gap-1"
          >
            SIGN IN TO CONSOLE <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Right Telemetry / Terminal Context Box (5 Cols) */}
      <div ref={asideBoxRef} className="md:col-span-5 p-6 sm:p-8 bg-zinc-950 border-t md:border-t-0 md:border-l border-zinc-900 flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
              <Terminal className="h-3 w-3 text-emerald-500" /> PROVISIONING
            </span>
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900/40 px-1.5 py-0.5 rounded-none font-semibold">
              READY
            </span>
          </div>

          <div className="space-y-3 font-mono text-[11px] text-zinc-400">
            <div className="p-3 bg-black border border-zinc-900 space-y-1.5">
              <p className="text-zinc-500 text-[10px]">// ZERO TELEMETRY LEAK</p>
              <p className="text-zinc-300">All logs, embeddings, and stack traces remain isolated to your organizations.</p>
            </div>

            <div className="p-3 bg-black border border-zinc-900 space-y-1.5">
              <p className="text-zinc-500 text-[10px]">// BRING YOUR OWN KEYS</p>
              <p className="text-zinc-300">Optionally connect your personal Google, OpenAI, or Anthropic provider keys.</p>
            </div>
          </div>
        </div>

        <div className="p-3 bg-black/60 border border-zinc-900 space-y-2">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="text-[11px] font-medium text-zinc-300">Security Commitment</span>
          </div>
          <p className="text-[10px] text-zinc-500 font-sans leading-relaxed">
            PulseGuard never executes non-approved git patches. PRs require explicit Human-in-the-Loop review.
          </p>
        </div>
      </div>

    </div>
  );
}

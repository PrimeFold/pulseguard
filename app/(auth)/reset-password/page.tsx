"use client";

import { useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  AlertTriangle,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const formBoxRef = useRef<HTMLDivElement>(null);
  const asideBoxRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      tl.fromTo(
        formBoxRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.45 },
      ).fromTo(
        asideBoxRef.current,
        { opacity: 0, x: 12 },
        { opacity: 1, x: 0, duration: 0.45 },
        "-=0.3",
      );
    },
    { scope: containerRef },
  );

  useGSAP(() => {
    if ((error || success) && messageRef.current) {
      gsap.fromTo(
        messageRef.current,
        { opacity: 0, height: 0, y: -4 },
        {
          opacity: 1,
          height: "auto",
          y: 0,
          duration: 0.25,
          ease: "power2.out",
        },
      );
    }
  }, [error, success]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!password.trim() || !confirmPassword.trim()) {
      setError("Please enter and confirm your new password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    if (!token) {
      setError(
        "Missing security reset token. Please use the full recovery link.",
      );
      return;
    }

    setLoading(true);

    try {
      // Using better-auth reset logic.
      const { error: resetError } = await authClient.resetPassword({
        newPassword: password,
        token: token,
      });

      if (resetError) {
        setError(
          resetError.message ||
            "Failed to reset password. Link may be invalid or expired.",
        );
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-0 border border-zinc-800 bg-black shadow-2xl"
    >
      {/* Left Form Box (7 Cols) */}
      <div
        ref={formBoxRef}
        className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-8 bg-zinc-950/60"
      >
        <div className="space-y-6">
          <div className="space-y-1.5 border-b border-zinc-900 pb-4">
            <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px] uppercase tracking-widest">
              <KeyRound className="h-3.5 w-3.5 text-zinc-400" />
              <span>Identity Update</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-mono font-semibold tracking-tight text-white uppercase">
              Set New Password
            </h1>
            <p className="text-xs text-zinc-400 font-sans">
              Enter and confirm your new access credentials.
            </p>
          </div>

          {!success ? (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                    New Password
                  </label>
                  <div className="relative flex items-center">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="bg-zinc-900 border-zinc-800 text-zinc-100 text-xs rounded-none h-9 font-mono placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-700 pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 text-zinc-500 hover:text-zinc-200 transition-colors p-1 cursor-pointer"
                      tabIndex={-1}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                    Confirm Password
                  </label>
                  <div className="relative flex items-center">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="bg-zinc-900 border-zinc-800 text-zinc-100 text-xs rounded-none h-9 font-mono placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-700 pr-9"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-2 text-zinc-500 hover:text-zinc-200 transition-colors p-1 cursor-pointer"
                      tabIndex={-1}
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div
                  ref={messageRef}
                  className="flex items-start gap-2 p-3 bg-red-950/20 border border-red-900/50 overflow-hidden"
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] font-mono text-red-400 uppercase tracking-widest leading-relaxed">
                    {error}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-white hover:bg-zinc-200 text-black border border-transparent font-mono text-xs font-bold tracking-widest uppercase rounded-none h-9 mt-2 transition-all duration-300 active:scale-[0.98] cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ArrowRight className="mr-2 h-3.5 w-3.5" />
                )}
                UPDATE CREDENTIALS
              </Button>
            </form>
          ) : (
            <div ref={messageRef} className="space-y-4">
              <div className="flex items-start gap-2 p-4 bg-emerald-950/20 border border-emerald-900/50">
                <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest leading-relaxed">
                  Identity updated successfully. Redirecting to terminal
                  authentication...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Decor Box (5 Cols) */}
      <div
        ref={asideBoxRef}
        className="hidden md:flex md:col-span-5 bg-black border-l border-zinc-800 relative overflow-hidden flex-col justify-end p-8"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)] opacity-20 pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="h-10 w-10 bg-zinc-900 flex items-center justify-center rounded-none border border-zinc-800">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-mono font-bold tracking-widest text-white uppercase">
              Strict Policy
            </h3>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider leading-relaxed">
              Require at least 8 alphanumeric characters. Avoid reused
              credentials across multiple networks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="font-mono text-zinc-500 text-xs">
          Authenticating token...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}

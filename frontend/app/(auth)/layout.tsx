import Link from "next/link";
import { ShieldAlert, Terminal, Activity, Lock, Cpu } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] bg-[#09090b] text-zinc-100 flex flex-col justify-between selection:bg-white selection:text-black font-sans antialiased relative overflow-hidden">
      {/* Background Subtle Grid & Technical Vignette */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-15 pointer-events-none" />

      {/* Top Header Strip */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-b border-zinc-900">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-6 w-6 bg-white flex items-center justify-center rounded-none transition-transform group-hover:rotate-90 duration-300">
            <ShieldAlert className="h-3.5 w-3.5 text-black" />
          </div>
          <span className="font-mono text-xs font-semibold tracking-wider text-white uppercase">
            PulseGuard<span className="text-zinc-500">/auth</span>
          </span>
        </Link>

        <div className="flex items-center gap-4 font-mono text-[10px] text-zinc-400">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-950 border border-zinc-800/80 rounded-none">
            <span className="h-1.5 w-1.5 rounded-none bg-emerald-500 animate-pulse" />
            <span className="text-zinc-300">CLUSTER: PG-CORE-01</span>
          </div>
          <Link href="/docs" className="hover:text-white transition-colors duration-150 hidden sm:inline">
            DOCS
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 py-8 sm:py-12 flex items-center justify-center">
        {children}
      </main>

      {/* Footer System Status Strip */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-900 font-mono text-[10px] text-zinc-600">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Lock className="h-3 w-3 text-zinc-500" /> AES-256 SESSION GATES
          </span>
          <span className="text-zinc-800">|</span>
          <span className="flex items-center gap-1">
            <Cpu className="h-3 w-3 text-zinc-500" /> SRE AUTONOMOUS ENGINE
          </span>
        </div>
        <div>
          <span>PULSEGUARD CONSOLE v1.0.4</span>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Flame,
  Terminal,
  Users,
  Sparkles,
  ArrowLeftRight,
  Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationPanel } from "@/components/notifications/NotificationPanel";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface OrgSidebarProps {
  org: any;
  userRole: string;
  user?: any;
  isMobile?: boolean;
  onClose?: () => void;
}

export function OrgSidebar({
  org,
  userRole,
  isMobile = false,
  onClose,
}: OrgSidebarProps) {
  const pathname = usePathname();
  const base = `/${org.slug}`;
  const sidebarRef = useRef<HTMLElement>(null);

  const navItems = [
    { label: "Overview", href: base, icon: Activity, exact: true },
    { label: "War Rooms", href: `${base}/incidents`, icon: Flame },
    { label: "Telemetry Logs", href: `${base}/telemetry`, icon: Terminal },
    { label: "AI & Models", href: `${base}/settings/ai`, icon: Sparkles },
    { label: "Team & Access", href: `${base}/settings/teams`, icon: Users },
  ];

  useGSAP(
    () => {
      // Staggered entrance for sidebar navigation items
      gsap.fromTo(
        ".nav-item",
        { opacity: 0, x: -8 },
        {
          opacity: 1,
          x: 0,
          duration: 0.3,
          stagger: 0.04,
          ease: "power2.out",
          delay: 0.05,
        },
      );
    },
    { scope: sidebarRef },
  );

  return (
    <aside
      ref={sidebarRef}
      className={cn(
        "bg-black flex flex-col justify-between font-sans relative overflow-hidden",
        isMobile
          ? "w-full h-full p-6"
          : "hidden lg:flex w-72 border-r border-zinc-900 shrink-0 h-screen sticky top-0"
      )}
    >
      {/* Subtle grid background for the sidebar */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-[0.03] pointer-events-none" />

      <div className={cn("space-y-8 relative z-10", !isMobile && "p-6")}>
        {/* Workspace Switcher Header */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/workspaces"
            onClick={onClose}
            className="flex-1 flex items-center justify-between p-3 rounded-none bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 transition-all active:scale-[0.98] group"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate font-mono uppercase tracking-wider">
                {org.name}
              </p>
              <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider truncate">
                /{org.slug}
              </p>
            </div>
            <ArrowLeftRight className="h-3.5 w-3.5 text-zinc-500 group-hover:text-white shrink-0 transition-colors" />
          </Link>
          <div className="shrink-0 bg-zinc-950 border border-zinc-800 flex items-center justify-center">
            <NotificationPanel align="left" />
          </div>
        </div>

        {/* Navigation Links */}
        <div className="space-y-4">
          <div className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest px-1">
            Core Modules
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  onClick={onClose}
                  className={cn(
                    "nav-item flex items-center gap-3.5 px-3.5 py-2.5 rounded-none text-sm transition-all duration-200 active:scale-[0.98] border border-transparent cursor-pointer",
                    isActive
                      ? "bg-zinc-900 border-zinc-800 text-white font-medium"
                      : "text-zinc-400 hover:bg-zinc-950 hover:text-zinc-100 hover:border-zinc-900",
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isActive ? "text-emerald-400" : "text-zinc-500",
                    )}
                  />
                  <span className="font-mono tracking-wide">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className={cn("p-5 border-t border-zinc-900 bg-zinc-950/50 relative z-10 flex flex-col gap-3", isMobile && "mt-auto")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-mono text-zinc-300 font-bold uppercase tracking-wider">
              Autopilot SRE
            </span>
          </div>
          <div className="h-2 w-2 rounded-none bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
        </div>
        <div className="text-[11px] font-mono text-zinc-500 leading-relaxed">
          Agent monitoring telemetry & error streams in real-time.
        </div>
      </div>
    </aside>
  );
}
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

export function OrgSidebar({
  org,
  userRole,
}: {
  org: any;
  userRole: string;
  user: any;
}) {
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
        { opacity: 0, x: -10 },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          stagger: 0.05,
          ease: "power2.out",
          delay: 0.1,
        },
      );
    },
    { scope: sidebarRef },
  );

  return (
    <aside
      ref={sidebarRef}
      className="w-64 border-r border-zinc-900 bg-black flex flex-col justify-between shrink-0 font-sans relative overflow-hidden"
    >
      {/* Subtle grid background for the sidebar */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-[0.03] pointer-events-none" />

      <div className="p-5 space-y-8 relative z-10">
        {/* Workspace Switcher Header */}
        <div className="flex items-center gap-2">
          <Link
            href="/workspaces"
            className="flex-1 flex items-center justify-between p-2.5 rounded-none bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 transition-all active:scale-[0.98] group"
          >
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate font-mono uppercase tracking-wider">
                {org.name}
              </p>
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest truncate">
                /{org.slug}
              </p>
            </div>
            <ArrowLeftRight className="h-3 w-3 text-zinc-600 group-hover:text-white shrink-0 transition-colors" />
          </Link>
          <div className="shrink-0 bg-zinc-950 border border-zinc-800 flex items-center justify-center">
            <NotificationPanel align="left" />
          </div>
        </div>

        {/* Navigation Links */}
        <div className="space-y-4">
          <div className="text-[10px] font-mono font-semibold text-zinc-600 uppercase tracking-widest px-1">
            Core Modules
          </div>
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className={cn(
                    "nav-item flex items-center gap-3 px-3 py-2 rounded-none text-xs transition-all duration-200 active:scale-[0.98] border border-transparent",
                    isActive
                      ? "bg-zinc-900 border-zinc-800 text-white font-medium"
                      : "text-zinc-400 hover:bg-zinc-950 hover:text-zinc-200 hover:border-zinc-900",
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-3.5 w-3.5",
                      isActive ? "text-white" : "text-zinc-500",
                    )}
                  />
                  <span className="font-mono tracking-wide">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="p-4 border-t border-zinc-900 bg-zinc-950/50 relative z-10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="h-3.5 w-3.5 text-zinc-500" />
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
              Autopilot
            </span>
          </div>
          <div className="h-1.5 w-1.5 rounded-none bg-emerald-500 animate-pulse" />
        </div>
        <div className="text-[9px] font-mono text-zinc-600 leading-tight">
          SRE Agent is monitoring telemetry streams in real-time.
        </div>
      </div>
    </aside>
  );
}

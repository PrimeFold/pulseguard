"use client";

import { useRef } from "react";
import Link from "next/link";
import { TelemetryChart } from "@/components/dashboard/TelemetryChart";
import {
  ShieldAlert,
  Clock,
  GitBranch,
  Flame,
  ArrowRight,
  CheckCircle2,
  Terminal,
  AlertTriangle,
  Radio,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface DashboardOverviewClientProps {
  org: any;
  openIncidents: any[];
  totalResolved: number;
  recentLogs: any[];
  recentIncidents: any[];
  buckets: any[];
}

export function DashboardOverviewClient({
  org,
  openIncidents,
  totalResolved,
  recentLogs,
  recentIncidents,
  buckets,
}: DashboardOverviewClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".grid-section",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power3.out" },
      );
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef} className="space-y-12">
      {/* 1. Metric Strip (Dense, Border-driven, No Cards) */}
      <div className="grid-section grid grid-cols-1 md:grid-cols-4 border-t border-b border-zinc-900 divide-y md:divide-y-0 md:divide-x divide-zinc-900">
        <div className="p-6 space-y-2 hover:bg-zinc-950 transition-colors">
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            Active Alerts
          </p>
          <div className="text-4xl font-mono tracking-tighter text-red-500">
            {openIncidents.length}
          </div>
        </div>
        <div className="p-6 space-y-2 hover:bg-zinc-950 transition-colors">
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            Resolved
          </p>
          <div className="text-4xl font-mono tracking-tighter text-white">
            {totalResolved}
          </div>
        </div>
        <div className="p-6 space-y-2 hover:bg-zinc-950 transition-colors">
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            Recent Logs (24h)
          </p>
          <div className="text-4xl font-mono tracking-tighter text-white">
            {recentLogs.length}
          </div>
        </div>
        <div className="p-6 space-y-2 hover:bg-zinc-950 transition-colors flex flex-col justify-center items-start">
          <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-500 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2 py-1">
            <Radio className="h-3 w-3 animate-pulse" /> SYSTEM ONLINE
          </div>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Telemetry Chart - Span 2 */}
        <div className="grid-section lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-900 pb-3">
            <Terminal className="h-4 w-4 text-zinc-400" />
            <h2 className="text-xs font-mono font-semibold tracking-widest uppercase text-white">
              Event Density (6H)
            </h2>
          </div>
          <div className="h-[300px] w-full border border-zinc-900 bg-black p-4 relative group">
            {/* Liquid Glass Overlay Effect */}
            <div className="absolute inset-0 pointer-events-none border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <TelemetryChart data={buckets} />
          </div>
        </div>

        {/* Incidents Feed */}
        <div className="grid-section space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-4 w-4 text-zinc-400" />
              <h2 className="text-xs font-mono font-semibold tracking-widest uppercase text-white">
                Incident Stream
              </h2>
            </div>
            <Link
              href={`/${org.slug}/incidents`}
              className="text-[10px] font-mono text-zinc-500 hover:text-white uppercase tracking-widest"
            >
              View All
            </Link>
          </div>

          <div className="divide-y divide-zinc-900 border border-zinc-900">
            {recentIncidents.length === 0 ? (
              <div className="p-6 text-center">
                <CheckCircle2 className="h-6 w-6 text-zinc-700 mx-auto mb-3" />
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                  No recent incidents
                </p>
              </div>
            ) : (
              recentIncidents.map((incident: any) => (
                <Link
                  key={incident.id}
                  href={`/${org.slug}/incidents/${incident.id}`}
                  className="block p-4 bg-black hover:bg-zinc-950 transition-colors group cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`mt-1 h-2 w-2 rounded-none border ${
                        incident.status === "OPEN"
                          ? "bg-red-500/20 border-red-500 text-red-500"
                          : "bg-emerald-500/20 border-emerald-500 text-emerald-500"
                      }`}
                    />
                    <div className="space-y-2 flex-1">
                      <p className="text-xs text-white font-sans font-medium line-clamp-1">
                        {incident.title}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500 uppercase">
                        <span>{incident.service}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />{" "}
                          {new Date(incident.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TelemetryChart } from "@/components/dashboard/TelemetryChart";
import {
  ShieldAlert,
  Clock,
  Radio,
  Terminal,
  CheckCircle2,
  ArrowRight,
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
  const router = useRouter();

  useGSAP(
    () => {
      gsap.from(".grid-section", {
        opacity: 0,
        y: 10,
        duration: 0.35,
        stagger: 0.05,
        ease: "power2.out",
        clearProps: "all",
      });
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef} className="space-y-10">
      {/* 1. Metric Strip (Dense, Border-driven, 2x2 on mobile, 4-col on desktop) */}
      <div className="grid-section grid grid-cols-2 lg:grid-cols-4 border border-zinc-900 bg-zinc-950/40">
        <div className="p-4 sm:p-5 space-y-1 hover:bg-zinc-950/60 transition-colors border-r border-b lg:border-b-0 border-zinc-900">
          <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest font-medium">
            Active Alerts
          </p>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-mono tracking-tighter text-red-500 font-bold">
            {openIncidents.length}
          </div>
        </div>
        <div className="p-4 sm:p-5 space-y-1 hover:bg-zinc-950/60 transition-colors lg:border-r border-b lg:border-b-0 border-zinc-900">
          <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest font-medium">
            Resolved Incidents
          </p>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-mono tracking-tighter text-white font-bold">
            {totalResolved}
          </div>
        </div>
        <div className="p-4 sm:p-5 space-y-1 hover:bg-zinc-950/60 transition-colors border-r border-zinc-900">
          <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest font-medium">
            Telemetry Events (24h)
          </p>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-mono tracking-tighter text-white font-bold">
            {recentLogs.length}
          </div>
        </div>
        <div className="p-4 sm:p-5 space-y-1 hover:bg-zinc-950/60 transition-colors flex flex-col justify-center items-start">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-widest bg-emerald-950/30 border border-emerald-900/60 px-2.5 py-1.5 font-medium">
            <Radio className="h-3.5 w-3.5 animate-pulse text-emerald-400" /> CLUSTER
            HEALTHY
          </div>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Telemetry Chart - Span 2 */}
        <div className="grid-section lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-zinc-900 pb-2.5">
            <Terminal className="h-4 w-4 text-zinc-400" />
            <h2 className="text-sm font-mono font-semibold tracking-widest uppercase text-white">
              Event Density (6H)
            </h2>
          </div>
          <div className="h-[300px] sm:h-[340px] w-full border border-zinc-900 bg-zinc-950/40 p-4 relative">
            <TelemetryChart data={buckets} />
          </div>
        </div>

        {/* Incidents Feed */}
        <div className="grid-section space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="h-4 w-4 text-zinc-400" />
              <h2 className="text-sm font-mono font-semibold tracking-widest uppercase text-white">
                Incident Stream
              </h2>
            </div>
            <Link
              href={`/${org.slug}/incidents`}
              prefetch={true}
              onMouseEnter={() => router.prefetch(`/${org.slug}/incidents`)}
              className="text-xs font-mono text-zinc-400 hover:text-white uppercase tracking-widest flex items-center gap-1.5 transition-colors"
            >
              VIEW ALL <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-zinc-900 border border-zinc-900 bg-zinc-950/20">
            {recentIncidents.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="h-6 w-6 text-zinc-700 mx-auto mb-2" />
                <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                  No active incidents
                </p>
              </div>
            ) : (
              recentIncidents.map((incident: any) => (
                <Link
                  key={incident.id}
                  href={`/${org.slug}/incidents/${incident.id}`}
                  prefetch={true}
                  onMouseEnter={() =>
                    router.prefetch(`/${org.slug}/incidents/${incident.id}`)
                  }
                  className="block p-4 hover:bg-zinc-900/40 transition-colors group cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-1 h-2 w-2 rounded-none shrink-0 ${
                        incident.status === "OPEN"
                          ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"
                          : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                      }`}
                    />
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <p className="text-sm text-white font-mono font-medium truncate group-hover:text-zinc-200 transition-colors">
                        {incident.title}
                      </p>
                      <div className="flex items-center gap-2.5 text-xs font-mono text-zinc-400 uppercase flex-wrap">
                        <span className="text-zinc-300">
                          {incident.service}
                        </span>
                        <span className="text-zinc-600">/</span>
                        <span className={incident.status === "OPEN" ? "text-red-400 font-semibold" : "text-emerald-400"}>
                          {incident.status}
                        </span>
                        <span className="text-zinc-600">/</span>
                        <span
                          className="flex items-center gap-1 text-zinc-500"
                          suppressHydrationWarning
                        >
                          <Clock className="h-3 w-3" />{" "}
                          {new Date(incident.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
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

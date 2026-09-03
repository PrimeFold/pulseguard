import Link from "next/link";
import { getOrganizationAndMembership } from "@/lib/tenant";
import { DashboardOverviewClient } from "@/components/dashboard/DashboardOverviewClient";
import { Activity, Flame, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/auth";
import { redis } from "@/lib/redis";

interface OverviewPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function OrgOverviewPage({ params }: OverviewPageProps) {
  const { orgSlug } = await params;
  const { org } = await getOrganizationAndMembership(orgSlug);

  const cacheKey = `dashboard:v2:${org.id}`;
  let dashboardData: any = null;

  try {
    const dashboardDataStr = await redis.get(cacheKey);
    if (dashboardDataStr) {
      dashboardData = JSON.parse(dashboardDataStr);
    }
  } catch (err) {
    // Non-blocking Redis fallback
  }

  if (!dashboardData) {
    const [openIncidents, totalResolved, recentLogs, recentIncidents] =
      await Promise.all([
        prisma.incident.findMany({
          where: { organizationId: org.id, status: "OPEN" },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            title: true,
            service: true,
            status: true,
            createdAt: true,
          },
        }),
        prisma.incident.count({
          where: { organizationId: org.id, status: "RESOLVED" },
        }),
        prisma.telemetryLog.findMany({
          where: { organizationId: org.id },
          orderBy: { timestamp: "desc" },
          take: 100,
          select: {
            timestamp: true,
            level: true,
          },
        }),
        prisma.incident.findMany({
          where: { organizationId: org.id },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            title: true,
            service: true,
            status: true,
            createdAt: true,
          },
        }),
      ]);

    const now = Date.now();
    const buckets = [5, 4, 3, 2, 1, 0].map((hoursAgo) => {
      const bucketTime = new Date(now - hoursAgo * 60 * 60 * 1000);
      const timeLabel = bucketTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const windowStart = now - (hoursAgo + 1) * 60 * 60 * 1000;
      const windowEnd = now - hoursAgo * 60 * 60 * 1000;

      const logsInBucket = recentLogs.filter((l: any) => {
        const t = new Date(l.timestamp).getTime();
        return t >= windowStart && t < windowEnd;
      });

      return {
        time: timeLabel,
        errors: logsInBucket.filter(
          (l: any) => l.level === "ERROR" || l.level === "FATAL",
        ).length,
        warnings: logsInBucket.filter((l: any) => l.level === "WARN").length,
        info: logsInBucket.filter(
          (l: any) => l.level === "INFO" || l.level === "DEBUG",
        ).length,
      };
    });

    dashboardData = {
      openIncidents,
      totalResolved,
      totalLogsCount: recentLogs.length,
      recentIncidents,
      buckets,
    };

    try {
      await redis.setex(cacheKey, 60, JSON.stringify(dashboardData));
    } catch (err) {
      // Non-blocking Redis write fallback
    }
  }

  const {
    openIncidents,
    totalResolved,
    totalLogsCount,
    recentIncidents,
    buckets,
  } = dashboardData;

  return (
    <div className="space-y-12">
      {/* Top Banner / Status Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-zinc-900">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-mono tracking-tighter text-white uppercase flex items-center gap-3">
            <Activity className="h-6 w-6 text-emerald-500" /> SRE Telemetry Grid
          </h1>
          <p className="text-[11px] font-mono text-zinc-500 tracking-widest uppercase">
            Cluster metrics / {org.name} / Live Monitoring
          </p>
        </div>

        {openIncidents.length > 0 && (
          <Link
            href={`/${org.slug}/incidents/${openIncidents[0].id}`}
            prefetch={true}
            className="group flex items-center justify-between gap-4 px-4 py-3 bg-red-950/20 border border-red-900/50 hover:bg-red-900/30 transition-all rounded-none active:scale-[0.98]"
          >
            <div className="flex items-center gap-3 text-red-500 font-mono text-xs font-bold uppercase tracking-widest">
              <Flame className="h-4 w-4 animate-pulse" />
              <span>Talk to AI Agent</span>
            </div>
            <ArrowRight className="h-4 w-4 text-red-500 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>

      {/* Delegate remaining interactive dense layout to Client Component for GSAP */}
      <DashboardOverviewClient
        org={org}
        openIncidents={openIncidents}
        totalResolved={totalResolved}
        recentLogs={{ length: totalLogsCount } as any}
        recentIncidents={recentIncidents}
        buckets={buckets}
      />
    </div>
  );
}

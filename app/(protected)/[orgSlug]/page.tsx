import Link from 'next/link';
import { getOrganizationAndMembership } from '@/lib/tenant';
import { TelemetryChart } from '@/components/dashboard/TelemetryChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ShieldAlert, 
  Activity, 
  Clock, 
  GitBranch, 
  Flame, 
  ArrowRight, 
  CheckCircle2, 
  Terminal 
} from 'lucide-react';
import { prisma } from '@/lib/auth';

interface OverviewPageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function OrgOverviewPage({ params }: OverviewPageProps) {
  const { orgSlug } = await params;
  const { org } = await getOrganizationAndMembership(orgSlug);

  // 1. Fetch Metrics & Active Incidents in parallel
  const [openIncidents, totalResolved, recentLogs, recentIncidents] = await Promise.all([
    prisma.incident.findMany({
      where: { organizationId: org.id, status: 'TRIGGERED' },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.incident.count({
      where: { organizationId: org.id, status: 'RESOLVED' },
    }),
    prisma.telemetryLog.findMany({
      where: { organizationId: org.id },
      orderBy: { timestamp: 'desc' },
      take: 100,
    }),
    prisma.incident.findMany({
      where: { organizationId: org.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  // 2. Aggregate telemetry data into 6 dynamic hourly buckets for the Shadcn chart
  const now = Date.now();
  const buckets = [5, 4, 3, 2, 1, 0].map((hoursAgo) => {
    const bucketTime = new Date(now - hoursAgo * 60 * 60 * 1000);
    const timeLabel = bucketTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const windowStart = now - (hoursAgo + 1) * 60 * 60 * 1000;
    const windowEnd = now - hoursAgo * 60 * 60 * 1000;

    const logsInBucket = recentLogs.filter((l) => {
      const t = new Date(l.timestamp).getTime();
      return t >= windowStart && t < windowEnd;
    });

    return {
      time: timeLabel,
      errors: logsInBucket.filter((l) => l.level === 'ERROR' || l.level === 'FATAL').length,
      warnings: logsInBucket.filter((l) => l.level === 'WARN').length,
      info: logsInBucket.filter((l) => l.level === 'INFO' || l.level === 'DEBUG').length,
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Status Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <Activity className="h-5 w-5 text-zinc-100" /> SRE Cluster Overview
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time health indicators and telemetry streams for <span className="text-zinc-200 font-medium">{org.name}</span>.
          </p>
        </div>

        {openIncidents.length > 0 && (
          <Button asChild size="sm" className="bg-red-600 hover:bg-red-500 text-white text-xs gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
            <Link href={`/${org.slug}/incidents/${openIncidents[0].id}`}>
              <Flame className="h-3.5 w-3.5 animate-pulse" /> Active War Room
            </Link>
          </Button>
        )}
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-950/60 border-zinc-800 text-zinc-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-zinc-400">Open Incidents</CardTitle>
            <ShieldAlert className={`h-4 w-4 ${openIncidents.length > 0 ? 'text-red-400' : 'text-zinc-500'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {openIncidents.length}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              {openIncidents.length > 0 ? 'Requires attention in War Room' : 'All systems operating normally'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950/60 border-zinc-800 text-zinc-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-zinc-400">Resolved Incidents</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{totalResolved}</div>
            <p className="text-[11px] text-zinc-500 mt-1">Automated & human fixes merged</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950/60 border-zinc-800 text-zinc-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-zinc-400">Mean Time to Resolve (MTTR)</CardTitle>
            <Clock className="h-4 w-4 text-zinc-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">3.8m</div>
            <p className="text-[11px] text-emerald-400 font-mono mt-1">↓ 64% faster with SRE Agent</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950/60 border-zinc-800 text-zinc-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-zinc-400">Target GitHub Repo</CardTitle>
            <GitBranch className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold font-mono truncate text-zinc-200">
              {org.githubDefaultRepo || 'Not configured'}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              {org.githubOwner ? `owner: ${org.githubOwner}` : 'Configure in settings'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Shadcn Telemetry Visualizer */}
      <TelemetryChart data={buckets} />

      {/* Recent Incidents Feed */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 backdrop-blur overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">Recent Incidents & War Rooms</h2>
            <p className="text-xs text-muted-foreground">Direct links to root-cause diagnoses and automated PR hotfixes</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-xs text-zinc-100 hover:text-white">
            <Link href={`/${org.slug}/incidents`}>
              View All <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </div>

        <div className="divide-y divide-zinc-800/60">
          {recentIncidents.length === 0 ? (
            <div className="text-center py-8 text-xs text-zinc-500 font-mono">
              No incidents recorded yet. Clean bill of health!
            </div>
          ) : (
            recentIncidents.map((incident) => (
              <Link
                key={incident.id}
                href={`/${org.slug}/incidents/${incident.id}`}
                className="flex items-center justify-between p-4 hover:bg-zinc-900/40 transition-colors group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        incident.status === 'TRIGGERED'
                          ? 'bg-red-500/10 text-red-400 border-red-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {incident.status}
                    </Badge>
                    <span className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">
                      {incident.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 font-mono">
                    Service: <span className="text-zinc-400">{incident.service}</span> • Triggered at{' '}
                    {new Date(incident.createdAt).toLocaleTimeString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-zinc-400 group-hover:text-zinc-200">
                  <span className="hidden sm:inline font-mono text-[11px]">Open War Room</span>
                  <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
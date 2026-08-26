import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, ShieldAlert, ArrowRight, ShieldCheck } from 'lucide-react';
import { getUser } from '@/lib/session';
import { prisma } from '@/lib/auth';

export default async function WorkspacesHubPage() {
  const user = await getUser();
  if (!user) redirect('/login');

  // Fetch all memberships with incident counters
  const memberships = await prisma.organizationMember.findMany({
    where: { userId: user.id },
    include: {
      organization: {
        include: {
          _count: {
            select: {
              incidents: { where: { status: 'TRIGGERED' } },
              members: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Select a Workspace</h1>
            <p className="text-xs text-zinc-400 mt-1">
              Choose an organization to view active telemetry and SRE war rooms.
            </p>
          </div>
          <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-500 text-white gap-2">
            <Link href="/workspaces/new">
              <Plus className="h-4 w-4" /> New Organization
            </Link>
          </Button>
        </div>

        {/* Organizations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {memberships.map(({ organization: org, role }) => {
            const openIncidents = org._count.incidents;

            return (
              <Link key={org.id} href={`/${org.slug}`} className="group">
                <Card className="h-full bg-zinc-950 border-zinc-800/80 hover:border-purple-500/50 transition-all duration-200 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] flex flex-col justify-between">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-purple-500/40">
                          <Building2 className="h-4 w-4 text-purple-400" />
                        </div>
                        <div>
                          <CardTitle className="text-sm font-semibold text-zinc-100 group-hover:text-purple-300 transition-colors">
                            {org.name}
                          </CardTitle>
                          <span className="text-[11px] font-mono text-zinc-500">/{org.slug}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] bg-zinc-900/60 border-zinc-800 text-zinc-400">
                        {role}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 space-y-4">
                    <div className="flex items-center justify-between text-xs pt-3 border-t border-zinc-900">
                      <span className="text-zinc-500">Active Incidents</span>
                      {openIncidents > 0 ? (
                        <span className="inline-flex items-center gap-1 font-mono text-amber-400 text-xs font-semibold">
                          <ShieldAlert className="h-3.5 w-3.5" /> {openIncidents} open
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-mono text-emerald-400 text-xs">
                          <ShieldCheck className="h-3.5 w-3.5" /> Healthy
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-zinc-400 group-hover:text-zinc-200">
                      <span>{org._count.members} team members</span>
                      <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
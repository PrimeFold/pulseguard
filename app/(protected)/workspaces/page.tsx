import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FadeIn } from '@/components/fade-in';

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
    <div className="min-h-screen bg-black text-foreground p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-border pb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Select a Workspace</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Choose an organization to view active telemetry and SRE war rooms.
            </p>
          </div>
          <Button asChild size="sm" className="bg-white hover:bg-zinc-200 text-black border border-transparent font-medium gap-2 transition-colors">
            <Link href="/workspaces/new">
              <Plus className="h-4 w-4" /> New Organization
            </Link>
          </Button>
        </div>

        {/* Organizations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {memberships.map(({ organization: org, role }, i) => {
            const openIncidents = org._count.incidents;

            return (
              <FadeIn key={org.id} delay={i * 0.1}>
                <Link href={`/${org.slug}`} className="group block h-full">
                  <Card className="h-full bg-black border-border hover:border-zinc-500 transition-all duration-300 flex flex-col justify-between shadow-none rounded-lg overflow-hidden">
                    <CardHeader className="pb-3 px-5 pt-5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-zinc-900 border border-border flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-zinc-100" />
                          </div>
                          <div>
                            <CardTitle className="text-sm font-medium text-zinc-100 group-hover:text-white transition-colors">
                              {org.name}
                            </CardTitle>
                            <span className="text-[11px] text-muted-foreground">/{org.slug}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] bg-zinc-950 border-border text-muted-foreground uppercase font-mono tracking-wider">
                          {role}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="px-5 pb-5 pt-0 space-y-4">
                      <div className="flex items-center justify-between text-xs pt-4 border-t border-border mt-2">
                        <span className="text-muted-foreground">Active Incidents</span>
                        {openIncidents > 0 ? (
                          <span className="inline-flex items-center gap-1.5 font-mono text-red-500 text-[11px] font-medium">
                            <ShieldAlert className="h-3.5 w-3.5" /> {openIncidents} open
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 font-mono text-emerald-500 text-[11px]">
                            <ShieldCheck className="h-3.5 w-3.5" /> Healthy
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground group-hover:text-zinc-300 transition-colors">
                        <span>{org._count.members} members</span>
                        <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </div>
  );
}
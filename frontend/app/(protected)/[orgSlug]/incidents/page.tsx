import Link from "next/link";
import { getIncidentsList } from "@/app/api/action/incident";
import { IncidentListClient } from "@/components/incidents/IncidentClientList";
import { AlertOctagon } from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { getOrganizationAndMembership } from "@/lib/tenant";

export default async function IncidentsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const { org } = await getOrganizationAndMembership(orgSlug);
  const currentOrgId = org.id;

  const isGithubConnected = Boolean(org.githubInstallationId || org.githubDefaultRepo);

  if (!isGithubConnected) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between pb-6 border-b border-zinc-900">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <AlertOctagon className="h-6 w-6 text-red-500" />
              <h1 className="text-3xl font-mono tracking-tighter text-white uppercase font-bold">
                War Rooms
              </h1>
            </div>
            <p className="text-xs font-mono text-zinc-400 tracking-widest uppercase font-medium">
              Active Outages / Agent Analysis / Resolution Workflows
            </p>
          </div>
        </div>

        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8 bg-black border border-zinc-900 rounded-none space-y-6 shadow-xl">
          <div className="h-16 w-16 bg-zinc-950 border border-zinc-800 flex items-center justify-center text-white shrink-0">
            <FaGithub className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-2 max-w-lg">
            <h2 className="text-xl sm:text-2xl font-mono font-bold text-white uppercase tracking-wider">
              GitHub Repository Required
            </h2>
            <p className="text-xs sm:text-sm font-sans text-zinc-400 leading-relaxed">
              War Room investigation and autonomous AI agent features require a connected GitHub repository.
            </p>
          </div>
          <Button
            asChild
            className="bg-white hover:bg-zinc-200 text-black border border-transparent font-mono text-xs sm:text-sm font-bold tracking-widest uppercase rounded-none h-12 px-6 transition-all duration-300 active:scale-[0.98] cursor-pointer"
          >
            <Link href={`/${orgSlug}/settings`}>
              <FaGithub className="mr-2.5 h-4.5 w-4.5" />
              Connect GitHub Repository in Settings
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const { incidents, counts } = await getIncidentsList({
    organizationId: currentOrgId,
  });

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between pb-6 border-b border-zinc-900">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <AlertOctagon className="h-6 w-6 text-red-500" />
            <h1 className="text-3xl font-mono tracking-tighter text-white uppercase font-bold">
              War Rooms
            </h1>
          </div>
          <p className="text-xs font-mono text-zinc-400 tracking-widest uppercase font-medium">
            Active Outages / Agent Analysis / Resolution Workflows
          </p>
        </div>
      </div>

      <IncidentListClient
        organizationId={currentOrgId}
        orgSlug={org.slug}
        initialIncidents={incidents}
        initialCounts={counts}
      />
    </div>
  );
}

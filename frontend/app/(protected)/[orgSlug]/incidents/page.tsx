import { getIncidentsList } from "@/app/api/action/incident";
import { IncidentListClient } from "@/components/incidents/IncidentClientList";
import { AlertOctagon } from "lucide-react";

import { getOrganizationAndMembership } from "@/lib/tenant";

export default async function IncidentsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const { org } = await getOrganizationAndMembership(orgSlug);
  const currentOrgId = org.id;
  const { incidents, counts } = await getIncidentsList({
    organizationId: currentOrgId,
  });

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between pb-6 border-b border-zinc-900">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <AlertOctagon className="h-6 w-6 text-red-500" />
            <h1 className="text-3xl font-mono tracking-tighter text-white uppercase">
              War Rooms
            </h1>
          </div>
          <p className="text-[11px] font-mono text-zinc-500 tracking-widest uppercase">
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

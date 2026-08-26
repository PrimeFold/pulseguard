import { getIncidentsList } from '@/app/api/action/incident';
import { IncidentListClient } from '@/components/incidents/IncidentClientList';
import { AlertOctagon } from 'lucide-react';

export default async function IncidentsPage() {
  const currentOrgId = 'org_clyexample123'; // Resolved from your session
  const { incidents, counts } = await getIncidentsList({ organizationId: currentOrgId });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <AlertOctagon className="h-5 w-5 text-red-400" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Incidents & Outages
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor real-time crash reports, assess error velocity, and enter agent-driven War Rooms.
          </p>
        </div>
      </div>

      <IncidentListClient
        organizationId={currentOrgId}
        initialIncidents={incidents}
        initialCounts={counts}
      />
    </div>
  );
}
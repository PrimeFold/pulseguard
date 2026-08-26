import { getTelemetryLogs } from '@/app/api/action/telemetry';
import { TelemetryExplorerClient } from '@/components/telemetry/TelemetryExplorerClient';
import { Activity } from 'lucide-react';

export default async function TelemetryPage() {
  const currentOrgId = 'org_clyexample123'; // Replace with session org ID
  const { logs, services } = await getTelemetryLogs({ organizationId: currentOrgId });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-400" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Telemetry & Logs</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Query structured logs, monitor service health, and trigger SRE incident workflows.
          </p>
        </div>
      </div>

      <TelemetryExplorerClient
        organizationId={currentOrgId}
        initialLogs={logs}
        availableServices={services}
      />
    </div>
  );
}
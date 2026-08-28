import { getTelemetryLogs } from '@/app/api/action/telemetry';
import { TelemetryExplorerClient } from '@/components/telemetry/TelemetryExplorerClient';
import { Activity } from 'lucide-react';

import { getOrganizationAndMembership } from '@/lib/tenant';

export default async function TelemetryPage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;
  const { org } = await getOrganizationAndMembership(orgSlug);
  const currentOrgId = org.id;

  const { logs, services } = await getTelemetryLogs({ organizationId: currentOrgId });

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between pb-6 border-b border-zinc-900">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-purple-500" />
            <h1 className="text-3xl font-mono tracking-tighter text-white uppercase">
              Telemetry Stream
            </h1>
          </div>
          <p className="text-[11px] font-mono text-zinc-500 tracking-widest uppercase">
            Cluster Logs / Health Metrics / Live Tail
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
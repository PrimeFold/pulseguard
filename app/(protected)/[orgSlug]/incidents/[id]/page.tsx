import { notFound } from "next/navigation";
import { prisma } from "@/lib/auth";
import { WarRoomChat } from "@/components/incidents/WarRoomChat";
import { getOrganizationAndMembership } from "@/lib/tenant";

interface Props {
  params: Promise<{ orgSlug: string; id: string }>;
}

export default async function IncidentPage({ params }: Props) {
  const { orgSlug, id: incidentId } = await params;
  const { org } = await getOrganizationAndMembership(orgSlug);

  const incident = await prisma.incident.findUnique({
    where: { id: incidentId, organizationId: org.id },
  });

  if (!incident) {
    notFound();
  }

  const initialPrompt = `Investigate the incident for service "${incident.service}". Signature: ${incident.fingerprint}. Analyze the logs and propose a fix.`;

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-zinc-900 shrink-0">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className={`h-2 w-2 rounded-none ${incident.status === 'OPEN' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse' : 'bg-emerald-500'}`} />
            <h1 className="text-3xl font-mono tracking-tighter text-white uppercase truncate">
              {incident.title}
            </h1>
          </div>
          <p className="text-[11px] font-mono text-zinc-500 tracking-widest uppercase">
            War Room ID: {incident.id} / Status: {incident.status}
          </p>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 min-h-[600px] border border-zinc-900 bg-black relative">
        <WarRoomChat
          organizationId={org.id}
          incidentId={incidentId}
          initialPrompt={initialPrompt}
        />
      </div>
    </div>
  );
}

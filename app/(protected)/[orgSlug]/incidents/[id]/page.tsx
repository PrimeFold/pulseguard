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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{incident.title}</h1>
        <p className="text-sm text-muted-foreground">{incident.description}</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <WarRoomChat
          organizationId={org.id}
          incidentId={incidentId}
          initialPrompt={initialPrompt}
        />
      </div>
    </div>
  );
}

import { notFound } from "next/navigation";
import { prisma } from "@/lib/auth";
import { getOrganizationAndMembership } from "@/lib/tenant";
import { WarRoomClientContainer } from "@/components/incidents/WarRoomClientContainer";

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

  const initialPrompt = `Investigate the incident for service "${incident.service}". Signature: ${incident.fingerprint || "None"}. Analyze the logs and propose a fix.`;

  return (
    <WarRoomClientContainer
      orgSlug={orgSlug}
      orgId={org.id}
      hasAiKey={!!org.aiApiKeyEncrypted}
      incident={incident}
      initialPrompt={initialPrompt}
    />
  );
}

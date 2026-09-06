import { getOrganizationAndMembership } from "@/lib/tenant";
import { IngestionView } from "@/components/ingestion/IngestionView";

interface Props {
  params: Promise<{ orgSlug: string }>;
}

export default async function IngestionPage({ params }: Props) {
  const { orgSlug } = await params;
  const { org: organization, membership } = await getOrganizationAndMembership(orgSlug);

  return (
    <IngestionView
      organization={{
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        apiKeyDisplay: organization.apiKeyDisplay,
      }}
      role={membership.role}
    />
  );
}

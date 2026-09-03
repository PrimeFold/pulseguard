import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { getOrganizationAndMembership } from '@/lib/tenant';


interface OrgLayoutProps {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}

export default async function OrgLayout({ children, params }: OrgLayoutProps) {
  const { orgSlug } = await params;
  
  // 1. Verify user & fetch org context from DB
  const { org, membership, user } = await getOrganizationAndMembership(orgSlug);

  // 2. Wrap all child pages with your existing Dashboard Shell
  return (
    <DashboardShell org={org} user={user} role={membership.role}>
      {children}
    </DashboardShell>
  );
}
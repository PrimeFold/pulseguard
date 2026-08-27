import { Badge } from '@/components/ui/badge';
import { getOrganizationAndMembership } from '@/lib/tenant';
import { GitHubIntegrationCard } from '@/components/settings/GithubIntegrationCard';
import { ApiKeyCard } from '@/components/settings/ApiKeyCard';
import { UserProfileForm } from '@/components/settings/UserProfileForm';

interface Props {
  params: Promise<{ orgSlug: string }>;
}

export default async function SettingsPage({ params }: Props) {
  const { orgSlug } = await params;
  const { org: organization, membership, user } = await getOrganizationAndMembership(orgSlug);

  const role = membership.role;
  const canManageIntegrations = role === 'OWNER' || role === 'ADMIN';

  const githubRepo =
    organization.githubOwner && organization.githubDefaultRepo
      ? `${organization.githubOwner}/${organization.githubDefaultRepo}`
      : null;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure workspace integrations and your personal profile.
          </p>
        </div>
        <Badge variant="outline" className="font-mono text-xs uppercase bg-zinc-950 text-muted-foreground border-border tracking-wider">
          Role: {role}
        </Badge>
      </div>

      <div className="grid gap-6">
        <UserProfileForm user={{ id: user.id, name: user.name || "", email: user.email }} />

        <GitHubIntegrationCard
          organizationId={organization.id}
          isGitHubConnected={Boolean(organization.githubInstallationId)}
          githubRepo={githubRepo}
          canManage={canManageIntegrations}
        />

        <ApiKeyCard
          organizationId={organization.id}
          initialDisplayKey={organization.apiKeyDisplay}
          canManage={canManageIntegrations}
        />
      </div>
    </div>
  );
}
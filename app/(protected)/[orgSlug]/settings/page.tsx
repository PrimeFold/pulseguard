
import { Badge } from '@/components/ui/badge';

export default async function SettingsPage() {
  // Pass current active org ID (resolved from your session / context)
  const currentOrgId = 'org_clyexample123'; 
  const { organization, role, canManageIntegrations } = await getSettingsData(currentOrgId);

  const githubRepo =
    organization.githubOwner && organization.githubDefaultRepo
      ? `${organization.githubOwner}/${organization.githubDefaultRepo}`
      : null;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border/40">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Organization Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure repository access, API keys, and workspace integrations.
          </p>
        </div>
        <Badge variant="secondary" className="font-mono text-xs uppercase">
          Role: {role}
        </Badge>
      </div>

      <div className="grid gap-6">
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
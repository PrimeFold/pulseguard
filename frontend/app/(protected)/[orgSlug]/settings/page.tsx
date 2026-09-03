import { Badge } from '@/components/ui/badge';
import { getOrganizationAndMembership } from '@/lib/tenant';
import { GitHubIntegrationCard } from '@/components/settings/GithubIntegrationCard';
import { ApiKeyCard } from '@/components/settings/ApiKeyCard';
import { UserProfileForm } from '@/components/settings/UserProfileForm';
import { AiProviderCard } from '@/components/settings/AiProviderCard';
import { WorkspaceSettingsCard } from '@/components/settings/WorkspaceSettingsCard';
import { Settings } from 'lucide-react';

interface Props {
  params: Promise<{ orgSlug: string }>;
}

export default async function SettingsPage({ params }: Props) {
  const { orgSlug } = await params;
  const { org: organization, membership, user } = await getOrganizationAndMembership(orgSlug);

  const role = membership.role;
  const canManage = role === 'OWNER' || role === 'ADMIN';
  const isOwner = role === 'OWNER';

  const githubRepo =
    organization.githubOwner && organization.githubDefaultRepo
      ? `${organization.githubOwner}/${organization.githubDefaultRepo}`
      : null;

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-zinc-900">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-purple-500" />
            <h1 className="text-3xl font-mono tracking-tighter text-white uppercase">
              Global Settings
            </h1>
          </div>
          <p className="text-[11px] font-mono text-zinc-500 tracking-widest uppercase">
            Workspace Configuration / Integrations / Security
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-950 border border-zinc-900 text-zinc-500 font-mono text-[10px] uppercase tracking-widest">
          Permission Level: <span className="text-white font-semibold">{role}</span>
        </div>
      </div>

      <div className="grid gap-6">
        <WorkspaceSettingsCard
          organizationId={organization.id}
          initialName={organization.name}
          initialSlug={organization.slug}
          canManage={canManage}
          isOwner={isOwner}
        />

        <UserProfileForm user={{ id: user.id, name: user.name || "", email: user.email }} />

        <AiProviderCard
          organizationId={organization.id}
          initialProvider={(organization as any).aiProvider || 'google'}
          initialModel={(organization as any).aiModel || 'gemini-1.5-flash'}
          initialEmbeddingModel={(organization as any).aiEmbeddingModel || 'text-embedding-004'}
          initialApiKeyDisplay={(organization as any).aiApiKeyDisplay || null}
          canManage={canManage}
        />

        <GitHubIntegrationCard
          organizationId={organization.id}
          isGithubConnected={Boolean(organization.githubInstallationId)}
          githubRepo={githubRepo}
          canManage={canManage}
        />

        <ApiKeyCard
          organizationId={organization.id}
          initialDisplayKey={organization.apiKeyDisplay}
          canManage={canManage}
        />
      </div>
    </div>
  );
}
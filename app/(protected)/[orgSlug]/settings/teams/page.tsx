import { Suspense } from 'react';
import Link from 'next/link';
import { getOrganizationAndMembership } from '@/lib/tenant';
import type { Role } from '@/lib/generated/prisma/enums';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Users, ChevronLeft, ChevronRight, ShieldCheck, UserCheck, Eye } from 'lucide-react';
import { getTeamMembers } from '@/app/api/action/team';
import { TeamFilterBar } from '@/components/teams/TeamFilterBar';
import { InviteMemberDialog } from '@/components/invites/InviteMemberModal';

interface PageProps {
  params: Promise<{ orgSlug: string }>;
  searchParams: Promise<{
    q?: string;
    role?: Role;
    page?: string;
  }>;
}

export default async function TeamSettingsPage({ params, searchParams }: PageProps) {
  const { orgSlug } = await params;
  const { q, role, page: rawPage } = await searchParams;
  const currentPage = Number(rawPage) || 1;

  // Resolve organization and verify membership via URL slug
  const { org, membership } = await getOrganizationAndMembership(orgSlug);

  // Fetch paginated members matching search criteria
  const { data: members, metadata } = await getTeamMembers({
    organizationId: org.id,
    page: currentPage,
    limit: 8,
    role,
    searchQuery: q,
  });

  const isAdmin = membership.role === 'ADMIN';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-400" /> Team & Workspace Access
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage engineers, role assignments, and invite new members to{' '}
            <span className="text-zinc-200 font-medium">{org.name}</span>.
          </p>
        </div>

        {isAdmin && <InviteMemberDialog organizationId={org.id} />}
      </div>

      {/* Filter & Search Bar */}
      <Suspense fallback={<div className="h-9 bg-zinc-900/40 animate-pulse rounded-md" />}>
        <TeamFilterBar orgSlug={org.slug} />
      </Suspense>

      {/* Members Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 backdrop-blur overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/40 text-zinc-400 font-medium">
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-10 text-zinc-500">
                    No team members found matching your search.
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 rounded-full border border-zinc-800">
                          <AvatarImage src={member.user.image || ''} />
                          <AvatarFallback className="text-[11px] font-semibold bg-purple-600/20 text-purple-300">
                            {member.user.name?.slice(0, 2).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-zinc-100">{member.user.name || 'Anonymous User'}</p>
                          <p className="text-[11px] text-zinc-500 font-mono">{member.user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {member.role === 'ADMIN' && (
                        <Badge variant="outline" className="gap-1 bg-purple-500/10 text-purple-400 border-purple-500/30 text-[10px]">
                          <ShieldCheck className="h-3 w-3" /> Admin
                        </Badge>
                      )}
                      {member.role === 'MEMBER' && (
                        <Badge variant="outline" className="gap-1 bg-blue-500/10 text-blue-400 border-blue-500/30 text-[10px]">
                          <UserCheck className="h-3 w-3" /> Member
                        </Badge>
                      )}
                      {member.role === 'VIEWER' && (
                        <Badge variant="outline" className="gap-1 bg-zinc-500/10 text-zinc-400 border-zinc-500/30 text-[10px]">
                          <Eye className="h-3 w-3" /> Viewer
                        </Badge>
                      )}
                    </td>

                    <td className="py-3 px-4 text-zinc-400 font-mono text-[11px]">
                      {new Date(member.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800 bg-zinc-900/20 text-xs text-zinc-400">
          <span>
            Showing <span className="text-zinc-200 font-medium">{members.length}</span> of{' '}
            <span className="text-zinc-200 font-medium">{metadata.total}</span> members
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!metadata.hasPreviousPage}
              asChild={metadata.hasPreviousPage}
              className="h-7 text-xs border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800"
            >
              {metadata.hasPreviousPage ? (
                <Link href={`/${orgSlug}/settings/team?page=${currentPage - 1}${q ? `&q=${q}` : ''}${role ? `&role=${role}` : ''}`}>
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
                </Link>
              ) : (
                <span className="flex items-center text-zinc-600"><ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous</span>
              )}
            </Button>

            <span className="font-mono text-[11px] px-1">
              {currentPage} / {metadata.totalPages || 1}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={!metadata.hasNextPage}
              asChild={metadata.hasNextPage}
              className="h-7 text-xs border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800"
            >
              {metadata.hasNextPage ? (
                <Link href={`/${orgSlug}/settings/team?page=${currentPage + 1}${q ? `&q=${q}` : ''}${role ? `&role=${role}` : ''}`}>
                  Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              ) : (
                <span className="flex items-center text-zinc-600">Next <ChevronRight className="h-3.5 w-3.5 ml-1" /></span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
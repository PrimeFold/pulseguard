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

  const isAdmin = membership.role === 'ADMIN' || membership.role === 'OWNER';

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-zinc-900">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-purple-500" />
            <h1 className="text-3xl font-mono tracking-tighter text-white uppercase">
              Operator Network
            </h1>
          </div>
          <p className="text-[11px] font-mono text-zinc-500 tracking-widest uppercase">
            Access Control / RBAC / {org.name}
          </p>
        </div>

        {isAdmin && <InviteMemberDialog organizationId={org.id} />}
      </div>

      <div className="space-y-6">
        {/* Filter & Search Bar */}
        <Suspense fallback={<div className="h-10 bg-zinc-950 border border-zinc-900 animate-pulse rounded-none" />}>
          <TeamFilterBar orgSlug={org.slug} />
        </Suspense>

        {/* Members Table */}
        <div className="border border-zinc-900 bg-black overflow-hidden relative">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-900 bg-zinc-950/50">
                  <th className="py-3 px-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Operator Identity</th>
                  <th className="py-3 px-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">RBAC Role</th>
                  <th className="py-3 px-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest text-right">Provision Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/50">
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-16 text-zinc-600 font-mono text-xs uppercase tracking-widest">
                      No matching operators found.
                    </td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr key={member.id} className="hover:bg-zinc-950 transition-colors group">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10 rounded-none border border-zinc-800 bg-zinc-900">
                            <AvatarImage src={member.user.image || ''} className="rounded-none" />
                            <AvatarFallback className="rounded-none text-[10px] font-mono font-bold bg-zinc-900 text-purple-400 uppercase">
                              {member.user.name?.slice(0, 2) || 'OP'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">
                              {member.user.name || 'ANONYMOUS OPERATOR'}
                            </p>
                            <p className="text-[10px] text-zinc-500 font-mono tracking-wide">{member.user.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        {member.role === 'ADMIN' && (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-[9px] uppercase tracking-widest">
                            <ShieldCheck className="h-3 w-3" /> Root Admin
                          </div>
                        )}
                        {member.role === 'OWNER' && (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 font-mono text-[9px] uppercase tracking-widest">
                            <ShieldCheck className="h-3 w-3" /> Owner
                          </div>
                        )}
                        {member.role === 'MEMBER' && (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-zinc-500/10 border border-zinc-500/20 text-zinc-400 font-mono text-[9px] uppercase tracking-widest">
                            <UserCheck className="h-3 w-3" /> Analyst
                          </div>
                        )}
                        {member.role === 'VIEWER' && (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-zinc-800/40 border border-zinc-800/50 text-zinc-500 font-mono text-[9px] uppercase tracking-widest">
                            <Eye className="h-3 w-3" /> Read Only
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <span className="text-[10px] font-mono text-zinc-500 tracking-wide">
                          {new Date(member.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {metadata.totalPages > 1 && (
            <div className="p-3 border-t border-zinc-900 bg-zinc-950/30 flex items-center justify-between">
              <span className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase">
                Page {currentPage} of {metadata.totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  disabled={!metadata.hasPreviousPage}
                  className={`rounded-none border-zinc-800 h-8 font-mono text-[10px] uppercase tracking-widest active:scale-[0.98] ${!metadata.hasPreviousPage ? 'opacity-50 cursor-not-allowed bg-black' : 'bg-black hover:bg-zinc-900 text-zinc-300'}`}
                >
                  <Link href={`/${org.slug}/settings/teams?page=${currentPage - 1}&q=${q || ''}&role=${role || ''}`}>
                    <ChevronLeft className="h-3 w-3 mr-1" /> Prev
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  disabled={!metadata.hasNextPage}
                  className={`rounded-none border-zinc-800 h-8 font-mono text-[10px] uppercase tracking-widest active:scale-[0.98] ${!metadata.hasNextPage ? 'opacity-50 cursor-not-allowed bg-black' : 'bg-black hover:bg-zinc-900 text-zinc-300'}`}
                >
                  <Link href={`/${org.slug}/settings/teams?page=${currentPage + 1}&q=${q || ''}&role=${role || ''}`}>
                    Next <ChevronRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
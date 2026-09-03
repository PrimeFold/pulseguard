import { JoinWorkspaceCard } from '@/components/invites/JoinWorkspaceCard';
import { prisma } from '@/lib/auth';
import { getUser } from '@/lib/session';
import { Building2 } from 'lucide-react';
import { notFound, redirect } from 'next/navigation';


interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  const user = await getUser();

  // Redirect to sign in if not logged in, keeping return callback
  if (!user) {
    redirect(`/login?callbackUrl=/invite/${token}`);
  }

  const invite = await prisma.organizationInvite.findUnique({
    where: { token },
    include: {
      organization: {
        select: { id: true, name: true },
      },
    },
  });

  if (!invite || invite.status !== 'PENDING' || invite.expiresAt < new Date()) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="max-w-md w-full p-6 text-center rounded-xl border border-red-500/20 bg-card/40 backdrop-blur">
          <h1 className="text-lg font-bold text-foreground">Invalid or Expired Invite</h1>
          <p className="text-xs text-muted-foreground mt-2">
            This workspace invitation is no longer active. Request a new invite link from your team admin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-md w-full p-6 rounded-2xl border border-border/60 bg-card/40 backdrop-blur shadow-2xl space-y-6 text-center">
        <div className="mx-auto h-12 w-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
          <Building2 className="h-6 w-6 text-purple-400" />
        </div>

        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Join {invite.organization.name}
          </h1>
          <p className="text-xs text-muted-foreground">
            You've been invited to join this workspace as a{' '}
            <span className="text-foreground font-medium font-mono lowercase">{invite.role}</span>.
          </p>
        </div>

        <JoinWorkspaceCard token={token} orgName={invite.organization.name} />
      </div>
    </div>
  );
}
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { getUser } from '@/lib/session';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Authorize user on the server before rendering anything...
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  return <>{children}</>;
}
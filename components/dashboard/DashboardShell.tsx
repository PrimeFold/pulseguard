'use client'

import { OrgSidebar } from "../layout/OrgSidebar";

interface DashboardShellProps {
  children: React.ReactNode;
  org: { id: string; name: string; slug: string };
  user: { id: string; name?: string | null; email?: string | null; image?: string | null };
  role: string;
}

export function DashboardShell({ children, org, user, role }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-black text-zinc-100">
      <OrgSidebar org={org} user={user} userRole={role} />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
"use client";

import { OrgSidebar } from "../layout/OrgSidebar";

interface DashboardShellProps {
  children: React.ReactNode;
  org: { id: string; name: string; slug: string };
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  role: string;
}

export function DashboardShell({
  children,
  org,
  user,
  role,
}: DashboardShellProps) {
  return (
    <div className="flex min-h-[100dvh] bg-[#09090b] text-zinc-100 relative overflow-hidden font-sans antialiased selection:bg-white selection:text-black">
      {/* Global Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-10 pointer-events-none" />

      <OrgSidebar org={org} user={user} userRole={role} />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <main className="flex-1 p-6 md:p-12 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

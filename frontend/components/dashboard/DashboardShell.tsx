"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { OrgSidebar } from "../layout/OrgSidebar";
import { Menu, X, Activity } from "lucide-react";
import { NotificationPanel } from "@/components/notifications/NotificationPanel";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Auto-close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  return (
    <div className="flex min-h-[100dvh] bg-[#09090b] text-zinc-100 relative font-sans antialiased selection:bg-white selection:text-black">
      {/* Global Background Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-10 pointer-events-none" />

      {/* Desktop Docked Sidebar (Hidden on Mobile/Tablet) */}
      <OrgSidebar org={org} user={user} userRole={role} isMobile={false} />

      {/* Mobile & Tablet Header (Visible on < lg) */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-black/90 backdrop-blur border-b border-zinc-900 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open mobile menu"
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800 transition-colors cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link href={`/${org.slug}`} className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              <span className="font-mono text-xs font-bold text-white uppercase tracking-wider truncate max-w-[150px] sm:max-w-xs">
                {org.name}
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <NotificationPanel align="right" />
          </div>
        </header>

        {/* Slide-out Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Dark Backdrop overlay */}
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Slide-in sidebar drawer */}
            <div className="fixed inset-y-0 left-0 w-4/5 max-w-xs bg-black border-r border-zinc-800 z-50 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between p-4 border-b border-zinc-900">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-400" />
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-white">
                    PULSEGUARD
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="p-1.5 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <OrgSidebar
                  org={org}
                  user={user}
                  userRole={role}
                  isMobile={true}
                  onClose={() => setMobileMenuOpen(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
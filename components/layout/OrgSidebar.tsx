'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Activity, 
  Flame, 
  Terminal, 
  Users, 
  Sparkles,
  ArrowLeftRight} from 'lucide-react';
import { cn } from '@/lib/utils';

export function OrgSidebar({ org, userRole }: { org: any; userRole: string; user: any }) {
  const pathname = usePathname();
  const base = `/${org.slug}`;

  const navItems = [
    { label: 'Overview', href: base, icon: Activity, exact: true },
    { label: 'War Rooms', href: `${base}/incidents`, icon: Flame },
    { label: 'Telemetry Logs', href: `${base}/telemetry`, icon: Terminal },
    { label: 'AI & Models', href: `${base}/settings/ai`, icon: Sparkles },
    { label: 'Team & Access', href: `${base}/settings/team`, icon: Users },
  ];

  return (
    <aside className="w-64 border-r border-border bg-[#0a0a0a] flex flex-col justify-between shrink-0">
      <div className="p-4 space-y-6">
        {/* Workspace Switcher Header */}
        <div className="space-y-1">
          <Link
            href="/workspaces"
            className="flex items-center justify-between p-2 rounded-lg bg-black border border-border hover:bg-zinc-950 transition-colors group"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{org.name}</p>
              <p className="text-xs text-muted-foreground">/{org.slug}</p>
            </div>
            <ArrowLeftRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-white shrink-0 transition-colors" />
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.exact 
              ? pathname === item.href 
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
                  isActive
                    ? 'bg-zinc-900 text-white font-medium'
                    : 'text-muted-foreground hover:bg-zinc-950 hover:text-white'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>SRE Agent Running</span>
        </div>
      </div>
    </aside>
  );
}
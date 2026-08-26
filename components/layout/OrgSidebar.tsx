'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Activity, 
  Flame, 
  Terminal, 
  Users, 
  ArrowLeftRight} from 'lucide-react';
import { cn } from '@/lib/utils';

export function OrgSidebar({ org, userRole }: { org: any; userRole: string; user: any }) {
  const pathname = usePathname();
  const base = `/${org.slug}`;

  const navItems = [
    { label: 'Overview', href: base, icon: Activity, exact: true },
    { label: 'War Rooms', href: `${base}/incidents`, icon: Flame },
    { label: 'Telemetry Logs', href: `${base}/telemetry`, icon: Terminal },
    { label: 'Team & Access', href: `${base}/settings/team`, icon: Users },
  ];

  return (
    <aside className="w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col justify-between shrink-0">
      <div className="p-4 space-y-6">
        {/* Workspace Switcher Header */}
        <div className="space-y-1">
          <Link
            href="/workspaces"
            className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-colors group"
          >
            <div className="min-w-0">
              <p className="text-xs font-semibold text-zinc-100 truncate">{org.name}</p>
              <p className="text-[10px] font-mono text-zinc-500">/{org.slug}</p>
            </div>
            <ArrowLeftRight className="h-3.5 w-3.5 text-zinc-500 group-hover:text-purple-400 shrink-0" />
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
                  'flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-zinc-900">
        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>SRE Agent Running</span>
        </div>
      </div>
    </aside>
  );
}
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Plus, 
  ArrowRight, 
  User, 
  Key, 
  ShieldAlert,
  ShieldCheck,
  Check,
  X,
  BookOpen
} from "lucide-react";
import { getUser } from "@/lib/session";
import { prisma } from "@/lib/auth";
import { UserProfileForm } from "@/components/settings/UserProfileForm";
import { NotificationPanel } from "@/components/notifications/NotificationPanel";

export default async function WorkspacesHubPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  // Fetch all memberships with organization details and active states
  const memberships = await (prisma.organizationMember as any).findMany({
    where: { userId: user.id },
    include: {
      organization: {
        include: {
          _count: {
            select: {
              members: true,
            }
          }
        }
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-[100dvh] bg-[#09090b] text-zinc-100 selection:bg-white selection:text-black font-sans antialiased relative">
      {/* Background Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_75%,transparent_100%)] opacity-10 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        
        {/* Navigation Header */}
        <header className="flex items-center justify-between border-b border-zinc-800/80 pb-5">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 bg-white flex items-center justify-center rounded-none transition-transform hover:rotate-90 duration-300">
              <ShieldAlert className="h-3.5 w-3.5 text-black" />
            </div>
            <span className="font-mono text-xs font-semibold tracking-wider text-white uppercase">
              PulseGuard<span className="text-zinc-500">/hub</span>
            </span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[10px] text-zinc-400">
            <Link href="/" className="hover:text-white transition-colors duration-150">HOME</Link>
            <Link href="/docs" className="hover:text-white transition-colors duration-150">DOCS</Link>
            <span className="text-zinc-800">|</span>
            <span className="text-zinc-300 font-medium">{user.email}</span>
            <NotificationPanel />
          </div>
        </header>

        {/* Dashboard Columns (Asymmetric 12-Column Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Workspaces & API Key Audit (Col Span 7) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* 1. Workspaces Selection Section */}
            <div className="space-y-4">
              <div className="flex items-end justify-between border-b border-zinc-800/60 pb-3">
                <div className="space-y-1">
                  <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-white">
                    Workspaces
                  </h2>
                  <p className="text-[11px] text-zinc-500 font-sans">
                    Select a logged environment console.
                  </p>
                </div>
                <Link
                  href="/workspaces/new"
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-zinc-200 text-black font-mono text-[9px] font-bold tracking-wider transition-all duration-300 hover:-translate-y-[1px] active:scale-[0.98] rounded-none cursor-pointer"
                >
                  <Plus className="h-3 w-3" /> NEW ORG
                </Link>
              </div>

              {memberships.length === 0 ? (
                <div className="p-10 text-center border border-dashed border-zinc-800/80 bg-zinc-950/20 rounded-none">
                  <Building2 className="h-5 w-5 text-zinc-700 mx-auto mb-2.5" />
                  <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">No active workspaces</p>
                  <p className="text-xs text-zinc-500 font-sans mt-1 max-w-xs mx-auto leading-relaxed">
                    Get started by creating a new logging organization.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-900 border border-zinc-800 bg-zinc-950/40 rounded-none overflow-hidden">
                  {memberships.map(({ organization: org, role }: any) => (
                    <Link
                      key={org.id}
                      href={`/${org.slug}`}
                      className="group flex items-center justify-between p-4 hover:bg-zinc-900/20 transition-all duration-300 active:scale-[0.995]"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="h-8 w-8 bg-zinc-900 border border-zinc-800 flex items-center justify-center rounded-none group-hover:border-zinc-700 transition-colors duration-300">
                          <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                        </div>
                        <div>
                          <h3 className="text-xs font-semibold font-mono text-zinc-200 group-hover:text-white transition-colors duration-300">
                            {org.name}
                          </h3>
                          <span className="text-[9px] font-mono text-zinc-500 block">/{org.slug}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="text-[9px] bg-zinc-950 border-zinc-800 text-zinc-400 uppercase font-mono tracking-wider rounded-none py-0.5 px-2">
                          {role}
                        </Badge>
                        <ArrowRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all duration-300" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Custom API Keys Audit Section */}
            <div className="space-y-4">
              <div className="border-b border-zinc-800/60 pb-3 space-y-1">
                <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-white">
                  API Key Audit Report
                </h2>
                <p className="text-[11px] text-zinc-500 font-sans">
                  Status overview of custom Bring-Your-Own-Model keys configured across consoles.
                </p>
              </div>

              {memberships.length === 0 ? (
                <p className="text-[10px] font-mono text-zinc-600">Audit logs unavailable.</p>
              ) : (
                <div className="border border-zinc-800 bg-zinc-950/40 overflow-hidden font-mono text-[11px] rounded-none">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-900 bg-zinc-950/80 text-zinc-500 text-[10px]">
                        <th className="p-3 font-semibold tracking-wider">WORKSPACE</th>
                        <th className="p-3 font-semibold tracking-wider">AI PROVIDER</th>
                        <th className="p-3 font-semibold tracking-wider text-right">KEY CONFIG</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900 bg-black/20">
                      {memberships.map(({ organization: org }: any) => {
                        const hasKey = !!org.aiApiKeyDisplay;
                        return (
                          <tr key={org.id} className="hover:bg-zinc-900/10 transition-colors duration-150">
                            <td className="p-3 font-semibold text-zinc-300">{org.name}</td>
                            <td className="p-3 text-zinc-400 capitalize">{org.aiProvider || "None"}</td>
                            <td className="p-3 text-right">
                              {hasKey ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-950/30 border border-emerald-900/30 px-2 py-0.5 rounded-none">
                                  <Check className="h-2.5 w-2.5" /> ACTIVE
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-zinc-500 bg-zinc-900/60 border border-zinc-800 px-2 py-0.5 rounded-none">
                                  <X className="h-2.5 w-2.5" /> INACTIVE
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: User Settings Form (Col Span 5) */}
          <div className="lg:col-span-5 border-l border-zinc-800/80 lg:pl-8 pt-8 lg:pt-0">
            <UserProfileForm user={{ id: user.id, name: user.name || "", email: user.email }} />
          </div>

        </div>

      </div>
    </div>
  );
}
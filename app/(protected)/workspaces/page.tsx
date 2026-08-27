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
  X
} from "lucide-react";
import { getUser } from "@/lib/session";
import { prisma } from "@/lib/auth";
import { UserProfileForm } from "@/components/settings/UserProfileForm";

export default async function WorkspacesHubPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  // Fetch all memberships with organization and API key details
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
    <div className="min-h-screen bg-black text-zinc-100 selection:bg-white selection:text-black font-sans antialiased">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-15 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        
        {/* Navigation Header */}
        <header className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-white flex items-center justify-center rounded-none">
              <ShieldAlert className="h-3.5 w-3.5 text-black" />
            </div>
            <span className="font-mono text-xs font-semibold tracking-wider text-white uppercase">
              PulseGuard<span className="text-zinc-600">/hub</span>
            </span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[10px] text-zinc-400">
            <Link href="/" className="hover:text-white transition-colors">HOME</Link>
            <Link href="/docs" className="hover:text-white transition-colors">DOCS</Link>
            <span className="text-zinc-800">|</span>
            <span className="text-zinc-300">{user.email}</span>
          </div>
        </header>

        {/* Dashboard Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left / Middle: Workspace Selector & API Keys Summary */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 1. Workspaces Selection Section */}
            <div className="border border-zinc-800 bg-[#050505] p-5 space-y-4 rounded-none">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <div className="space-y-0.5">
                  <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-white">
                    Available Workspaces
                  </h2>
                  <p className="text-[11px] text-zinc-500 font-sans">
                    Select an organization console to review telemetry and incident rooms.
                  </p>
                </div>
                <Link
                  href="/workspaces/new"
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-black font-mono text-[10px] font-semibold tracking-wide hover:bg-zinc-200 transition-colors rounded-none"
                >
                  <Plus className="h-3.5 w-3.5" /> CREATE
                </Link>
              </div>

              {memberships.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-zinc-900 bg-black">
                  <Building2 className="h-5 w-5 text-zinc-700 mx-auto mb-2" />
                  <p className="text-[11px] font-mono text-zinc-400 uppercase">No active workspaces</p>
                  <p className="text-[11px] text-zinc-500 font-sans mt-0.5">
                    Click CREATE to initialize your first logging workspace.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-900 border border-zinc-900">
                  {memberships.map(({ organization: org, role }) => (
                    <Link
                      key={org.id}
                      href={`/${org.slug}`}
                      className="group flex items-center justify-between p-3.5 hover:bg-zinc-950/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-zinc-900 border border-zinc-800 flex items-center justify-center rounded-none group-hover:border-zinc-700 transition-colors">
                          <Building2 className="h-4 w-4 text-zinc-300" />
                        </div>
                        <div>
                          <h3 className="text-xs font-semibold font-mono text-zinc-200 group-hover:text-white transition-colors">
                            {org.name}
                          </h3>
                          <span className="text-[10px] font-mono text-zinc-500 block">/{org.slug}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="text-[9px] bg-black border-zinc-800 text-zinc-400 uppercase font-mono tracking-wider rounded-none py-0.5 px-1.5">
                          {role}
                        </Badge>
                        <ArrowRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Custom API Keys Audit Section */}
            <div className="border border-zinc-800 bg-[#050505] p-5 space-y-4 rounded-none">
              <div className="border-b border-zinc-900 pb-3 space-y-0.5">
                <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-white">
                  Workspace API Credentials Audit
                </h2>
                <p className="text-[11px] text-zinc-500 font-sans">
                  Status report of your custom Bring-Your-Own-Model (BYOM) keys configured across workspaces.
                </p>
              </div>

              {memberships.length === 0 ? (
                <p className="text-[11px] font-mono text-zinc-500">No organizations to audit.</p>
              ) : (
                <div className="border border-zinc-900 bg-black overflow-hidden font-mono text-[11px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-900 bg-zinc-950 text-zinc-500 text-[10px]">
                        <th className="p-2.5 font-semibold">WORKSPACE</th>
                        <th className="p-2.5 font-semibold">AI PROVIDER</th>
                        <th className="p-2.5 font-semibold text-right">BYOM KEY STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {memberships.map(({ organization: org }) => {
                        const hasKey = !!org.aiApiKeyDisplay;
                        return (
                          <tr key={org.id} className="hover:bg-zinc-950/20">
                            <td className="p-2.5 font-semibold text-zinc-300">{org.name}</td>
                            <td className="p-2.5 text-zinc-400 capitalize">{org.aiProvider || "Not configured"}</td>
                            <td className="p-2.5 text-right">
                              {hasKey ? (
                                <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-950/20 border border-emerald-900/40 px-1.5 py-0.5 text-[10px]">
                                  <Check className="h-3 w-3" /> CONFIGURED
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-zinc-500 bg-zinc-900/60 border border-zinc-800 px-1.5 py-0.5 text-[10px]">
                                  <X className="h-3 w-3" /> NONE ADDED
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

          {/* Right Column: User Settings Form */}
          <div className="lg:col-span-4 space-y-4">
            <UserProfileForm user={{ id: user.id, name: user.name || "", email: user.email }} />
          </div>

        </div>

      </div>
    </div>
  );
}
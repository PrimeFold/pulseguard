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
 BookOpen,
} from "lucide-react";
import { getUser } from "@/lib/session";
import { prisma } from "@/lib/auth";
import { UserProfileForm } from "@/components/settings/UserProfileForm";
import { NotificationPanel } from "@/components/notifications/NotificationPanel";
import { NewOrgButton } from "@/components/workspaces/NewOrgButton";

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
 },
 },
 },
 },
 },
 orderBy: { createdAt: "desc" },
 });

 return (
 <div className="min-h-[100dvh] bg-[#09090b] text-zinc-100 selection:bg-white selection:text-black font-sans antialiased relative">
 {/* Background Subtle Grid Pattern */}
 <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_75%,transparent_100%)] opacity-10 pointer-events-none" />

 <div className="relative max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-16 space-y-12">
 {/* Navigation Header */}
 <header className="flex items-center justify-between border-b border-zinc-800/80 pb-6">
 <div className="flex items-center gap-3">
 <div className="h-8 w-8 bg-white flex items-center justify-center rounded-xl transition-transform hover:rotate-90 duration-300 shadow-sm">
 <ShieldAlert className="h-4 w-4 text-black" />
 </div>
 <span className="font-mono text-sm sm:text-base font-bold tracking-wider text-white uppercase">
 PulseGuard<span className="text-zinc-500">/hub</span>
 </span>
 </div>
 <div className="flex items-center gap-5 font-mono text-xs sm:text-sm text-zinc-400">
 <Link
 href="/"
 className="hover:text-white transition-colors duration-150 font-medium"
 >
 HOME
 </Link>
 <Link
 href="/docs"
 className="hover:text-white transition-colors duration-150 font-medium"
 >
 DOCS
 </Link>
 <span className="text-zinc-800">|</span>
 <span className="text-zinc-200 font-semibold">{user.email}</span>
 <NotificationPanel />
 </div>
 </header>

 {/* Dashboard Columns (Asymmetric 12-Column Grid) */}
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
 {/* Left Column: Workspaces & API Key Audit (Col Span 7) */}
 <div className="lg:col-span-7 space-y-10">
 {/* 1. Workspaces Selection Section */}
 <div className="space-y-5">
 <div className="flex items-end justify-between border-b border-zinc-800/60 pb-4">
 <div className="space-y-1">
 <h2 className="text-sm sm:text-base font-mono font-bold uppercase tracking-wider text-white">
 Workspaces
 </h2>
 <p className="text-xs sm:text-sm text-zinc-400 font-sans">
 Select a logged environment console or workspace.
 </p>
 </div>
 <NewOrgButton />
 </div>

 {memberships.length === 0 ? (
 <div className="p-12 text-center border border-dashed border-zinc-800 bg-zinc-950/30 rounded-xl">
 <Building2 className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
 <p className="text-xs font-mono text-zinc-300 uppercase tracking-widest font-semibold">
 No active workspaces
 </p>
 <p className="text-xs sm:text-sm text-zinc-400 font-sans mt-1.5 max-w-sm mx-auto leading-relaxed">
 Get started by creating a new logging organization.
 </p>
 </div>
 ) : (
 <div className="divide-y divide-zinc-900 border border-zinc-800 bg-zinc-950/50 rounded-xl overflow-hidden shadow-lg">
 {memberships.map(({ organization: org, role }: any) => (
 <Link
 key={org.id}
 href={`/${org.slug}`}
 prefetch={true}
 className="group flex items-center justify-between p-5 sm:p-6 hover:bg-zinc-900/30 transition-all duration-300 active:scale-[0.995]"
 >
 <div className="flex items-center gap-4 sm:gap-5">
 <div className="h-11 w-11 bg-zinc-900/90 border border-zinc-800 flex items-center justify-center rounded-xl group-hover:border-zinc-600 group-hover:bg-zinc-800/80 transition-all duration-300 shrink-0">
 <Building2 className="h-5 w-5 text-zinc-300 group-hover:text-white" />
 </div>
 <div>
 <h3 className="text-sm sm:text-base font-bold font-mono text-zinc-100 group-hover:text-white transition-colors duration-300">
 {org.name}
 </h3>
 <span className="text-xs font-mono text-zinc-400 block mt-0.5">
 /{org.slug}
 </span>
 </div>
 </div>

 <div className="flex items-center gap-4 sm:gap-6">
 <Badge
 variant="outline"
 className="text-xs bg-zinc-900/80 border-zinc-700/80 text-zinc-300 uppercase font-mono tracking-wider rounded-xl py-1 px-3"
 >
 {role}
 </Badge>
 <ArrowRight className="h-5 w-5 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
 </div>
 </Link>
 ))}
 </div>
 )}
 </div>

 {/* 2. Custom API Keys Audit Section */}
 <div className="space-y-5">
 <div className="border-b border-zinc-800/60 pb-4 space-y-1">
 <h2 className="text-sm sm:text-base font-mono font-bold uppercase tracking-wider text-white">
 API Key Audit Report
 </h2>
 <p className="text-xs sm:text-sm text-zinc-400 font-sans">
 Status overview of custom Bring-Your-Own-Model keys configured
 across consoles.
 </p>
 </div>

 {memberships.length === 0 ? (
 <p className="text-xs font-mono text-zinc-500">
 Audit logs unavailable.
 </p>
 ) : (
 <div className="border border-zinc-800 bg-zinc-950/50 overflow-hidden font-mono text-xs sm:text-sm rounded-xl shadow-md">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="border-b border-zinc-900 bg-zinc-950 text-zinc-400 text-xs">
 <th className="p-4 font-bold tracking-wider">
 WORKSPACE
 </th>
 <th className="p-4 font-bold tracking-wider">
 AI PROVIDER
 </th>
 <th className="p-4 font-bold tracking-wider text-right">
 KEY CONFIG
 </th>
 </tr>
 </thead>
 <tbody className="divide-y divide-zinc-900 bg-black/30">
 {memberships.map(({ organization: org }: any) => {
 const hasKey = !!org.aiApiKeyDisplay;
 return (
 <tr
 key={org.id}
 className="hover:bg-zinc-900/20 transition-colors duration-150"
 >
 <td className="p-4 font-semibold text-zinc-200">
 {org.name}
 </td>
 <td className="p-4 text-zinc-400 capitalize">
 {org.aiProvider || "None"}
 </td>
 <td className="p-4 text-right">
 {hasKey ? (
 <span className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-200 bg-white-950/40 border border-white-800/50 px-2.5 py-1 rounded-xl">
 <Check className="h-3.5 w-3.5" /> ACTIVE
 </span>
 ) : (
 <span className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-400 bg-zinc-900/80 border border-zinc-800 px-2.5 py-1 rounded-xl">
 <X className="h-3.5 w-3.5" /> INACTIVE
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
 <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-zinc-800/80 lg:pl-10 pt-10 lg:pt-0">
 <UserProfileForm
 user={{ id: user.id, name: user.name || "", email: user.email }}
 />
 </div>
 </div>
 </div>
 </div>
 );
}

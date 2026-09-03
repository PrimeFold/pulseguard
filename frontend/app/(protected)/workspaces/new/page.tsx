import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/session";
import { Building2, ArrowLeft } from "lucide-react";
import { CreateWorkspaceForm } from "@/components/workspaces/CreateWorkspaceForm";

export default async function NewWorkspacePage() {
  const user = await getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-[100dvh] bg-[#09090b] text-zinc-100 font-sans antialiased relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_75%,transparent_100%)] opacity-10 pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 py-20 space-y-12">
        <Link 
          href="/workspaces" 
          className="inline-flex items-center text-[10px] font-mono uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
        >
          <ArrowLeft className="mr-2 h-3 w-3" /> Back to Hub
        </Link>

        <div className="space-y-6">
          <div className="space-y-2 pb-6 border-b border-zinc-900">
            <div className="flex items-center gap-3">
              <Building2 className="h-6 w-6 text-purple-500" />
              <h1 className="text-3xl font-mono tracking-tighter text-white uppercase">
                Initialize Workspace
              </h1>
            </div>
            <p className="text-[11px] font-mono text-zinc-500 tracking-widest uppercase">
              Provision a new isolated SRE environment
            </p>
          </div>

          <CreateWorkspaceForm />
        </div>
      </div>
    </div>
  );
}

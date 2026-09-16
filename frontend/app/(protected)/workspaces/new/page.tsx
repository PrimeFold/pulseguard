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

      <div className="relative max-w-3xl mx-auto px-4 sm:px-8 py-16 sm:py-24 space-y-10">
        <Link 
          href="/workspaces" 
          className="inline-flex items-center text-xs font-mono uppercase tracking-widest text-zinc-400 hover:text-white transition-colors font-semibold"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Hub
        </Link>

        <div className="space-y-8">
          <div className="space-y-3 pb-8 border-b border-zinc-900">
            <div className="flex items-center gap-3.5">
              <Building2 className="h-8 w-8 text-purple-400" />
              <h1 className="text-3xl sm:text-4xl font-mono tracking-tight text-white uppercase font-bold">
                Initialize Workspace
              </h1>
            </div>
            <p className="text-xs sm:text-sm font-mono text-zinc-400 tracking-wider uppercase font-medium">
              Provision a new isolated SRE environment console
            </p>
          </div>

          <CreateWorkspaceForm />
        </div>
      </div>
    </div>
  );
}

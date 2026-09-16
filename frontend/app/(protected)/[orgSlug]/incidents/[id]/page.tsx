import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/auth";
import { getOrganizationAndMembership } from "@/lib/tenant";
import { WarRoomClientContainer } from "@/components/incidents/WarRoomClientContainer";
import { FaGithub } from "react-icons/fa6";
import { Button } from "@/components/ui/button";

interface Props {
  params: Promise<{ orgSlug: string; id: string }>;
}

export default async function IncidentPage({ params }: Props) {
  const { orgSlug, id: incidentId } = await params;
  const { org } = await getOrganizationAndMembership(orgSlug);

  const incident = await prisma.incident.findUnique({
    where: { id: incidentId, organizationId: org.id },
  });

  if (!incident) {
    notFound();
  }

  const isGithubConnected = Boolean(org.githubInstallationId || org.githubDefaultRepo);

  if (!isGithubConnected) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8 bg-black border border-zinc-900 rounded-none space-y-6 my-6 shadow-2xl">
        <div className="h-16 w-16 bg-zinc-950 border border-zinc-800 flex items-center justify-center text-white shrink-0">
          <FaGithub className="h-8 w-8 text-white" />
        </div>
        <div className="space-y-2 max-w-lg">
          <h2 className="text-xl sm:text-2xl font-mono font-bold text-white uppercase tracking-wider">
            GitHub Repository Required
          </h2>
          <p className="text-xs sm:text-sm font-sans text-zinc-400 leading-relaxed">
            The SRE War Room requires a connected GitHub repository to inspect source files, correlate stack traces, and generate autonomous hotfix Pull Requests.
          </p>
        </div>
        <Button
          asChild
          className="bg-white hover:bg-zinc-200 text-black border border-transparent font-mono text-xs sm:text-sm font-bold tracking-widest uppercase rounded-none h-12 px-6 transition-all duration-300 active:scale-[0.98] cursor-pointer"
        >
          <Link href={`/${orgSlug}/settings`}>
            <FaGithub className="mr-2.5 h-4.5 w-4.5" />
            Connect GitHub Repository in Settings
          </Link>
        </Button>
      </div>
    );
  }

  const initialPrompt = `Investigate the incident for service "${incident.service}". Signature: ${incident.fingerprint || "None"}. Analyze the logs and propose a fix.`;

  return (
    <WarRoomClientContainer
      orgSlug={orgSlug}
      orgId={org.id}
      hasAiKey={!!org.aiApiKeyEncrypted}
      incident={incident}
      initialPrompt={initialPrompt}
    />
  );
}

import { getOrganizationAndMembership } from "@/lib/tenant";
import { AiProviderCard } from "@/components/settings/AiProviderCard";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  params: Promise<{ orgSlug: string }>;
}

export default async function AiSettingsPage({ params }: Props) {
  const { orgSlug } = await params;
  const { org, membership } = await getOrganizationAndMembership(orgSlug);

  const canManage = membership.role === "OWNER" || membership.role === "ADMIN";

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="h-7 px-2 -ml-2 text-xs text-muted-foreground hover:text-white">
              <Link href={`/${orgSlug}/settings`}>
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Settings
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">AI Models & API Keys</h1>
          <p className="text-sm text-muted-foreground">
            Configure custom LLM providers and API keys for incident diagnosis, agent execution, and RAG embeddings.
          </p>
        </div>
        <Badge variant="outline" className="font-mono text-xs uppercase bg-zinc-950 text-muted-foreground border-border tracking-wider">
          Role: {membership.role}
        </Badge>
      </div>

      <AiProviderCard
        organizationId={org.id}
        initialProvider={org.aiProvider || "google"}
        initialModel={org.aiModel || "gemini-1.5-flash"}
        initialEmbeddingModel={org.aiEmbeddingModel || "text-embedding-004"}
        initialApiKeyDisplay={org.aiApiKeyDisplay || null}
        canManage={canManage}
      />
    </div>
  );
}

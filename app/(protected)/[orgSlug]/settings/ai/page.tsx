import { getOrganizationAndMembership } from "@/lib/tenant";
import { AiProviderCard } from "@/components/settings/AiProviderCard";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Sparkles, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  params: Promise<{ orgSlug: string }>;
}

export default async function AiSettingsPage({ params }: Props) {
  const { orgSlug } = await params;
  const { org, membership } = await getOrganizationAndMembership(orgSlug);

  const canManage = membership.role === "OWNER" || membership.role === "ADMIN";

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-zinc-900">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <Cpu className="h-6 w-6 text-purple-500" />
            <h1 className="text-3xl font-mono tracking-tighter text-white uppercase">
              AI Config
            </h1>
          </div>
          <p className="text-[11px] font-mono text-zinc-500 tracking-widest uppercase">
            SRE Engine / Providers / {org.name}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-950 border border-zinc-900 text-zinc-500 font-mono text-[10px] uppercase tracking-widest">
          Permission Level: <span className="text-white font-semibold">{membership.role}</span>
        </div>
      </div>

      <AiProviderCard
        organizationId={org.id}
        initialProvider={(org as any).aiProvider || "google"}
        initialModel={(org as any).aiModel || "gemini-1.5-flash"}
        initialEmbeddingModel={(org as any).aiEmbeddingModel || "text-embedding-004"}
        initialApiKeyDisplay={(org as any).aiApiKeyDisplay || null}
        canManage={canManage}
      />
    </div>
  );
}

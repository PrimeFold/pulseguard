"use server";

import { prisma } from "@/lib/auth";
import { requireOrganizationRole } from "@/lib/authorization";
import { encryptApiKey, maskApiKey } from "@/lib/ai/provider";
import { revalidatePath } from "next/cache";

export interface UpdateAiSettingsParams {
  organizationId: string;
  provider: string;
  model: string;
  embeddingModel: string;
  apiKey?: string;
}

export async function getAiSettings(organizationId: string) {
  await requireOrganizationRole(organizationId, ["OWNER", "ADMIN", "MEMBER"]);

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      aiProvider: true,
      aiModel: true,
      aiEmbeddingModel: true,
      aiApiKeyDisplay: true,
    },
  });

  return {
    provider: org?.aiProvider || "google",
    model: org?.aiModel || "gemini-1.5-flash",
    embeddingModel: org?.aiEmbeddingModel || "text-embedding-004",
    apiKeyDisplay: org?.aiApiKeyDisplay || null,
    hasCustomKey: Boolean(org?.aiApiKeyDisplay),
  };
}

export async function updateAiSettings(params: UpdateAiSettingsParams) {
  await requireOrganizationRole(params.organizationId, ["OWNER", "ADMIN"]);

  const dataToUpdate: any = {
    aiProvider: params.provider,
    aiModel: params.model,
    aiEmbeddingModel: params.embeddingModel,
  };

  if (params.apiKey && params.apiKey.trim() && !params.apiKey.includes("...")) {
    dataToUpdate.aiApiKeyEncrypted = encryptApiKey(params.apiKey.trim());
    dataToUpdate.aiApiKeyDisplay = maskApiKey(params.apiKey.trim());
  }

  const updatedOrg = await prisma.organization.update({
    where: { id: params.organizationId },
    data: dataToUpdate,
    select: {
      aiProvider: true,
      aiModel: true,
      aiEmbeddingModel: true,
      aiApiKeyDisplay: true,
      slug: true,
    },
  });

  revalidatePath(`/${updatedOrg.slug}/settings/ai`);
  revalidatePath(`/${updatedOrg.slug}/settings`);

  return {
    success: true,
    provider: updatedOrg.aiProvider,
    model: updatedOrg.aiModel,
    embeddingModel: updatedOrg.aiEmbeddingModel,
    apiKeyDisplay: updatedOrg.aiApiKeyDisplay,
  };
}

export async function removeCustomAiKey(organizationId: string) {
  await requireOrganizationRole(organizationId, ["OWNER", "ADMIN"]);

  const updatedOrg = await prisma.organization.update({
    where: { id: organizationId },
    data: {
      aiApiKeyEncrypted: null,
      aiApiKeyDisplay: null,
    },
    select: { slug: true },
  });

  revalidatePath(`/${updatedOrg.slug}/settings/ai`);
  return { success: true };
}

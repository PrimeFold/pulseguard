"use server";

import { prisma } from "@/lib/auth";
import { requireOrganizationRole } from "@/lib/authorization";
import { encryptApiKey, maskApiKey } from "@/lib/ai/provider";
import { redis } from "@/lib/redis";
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

  const org: any = await (prisma.organization as any).findUnique({
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

  const updatedOrg: any = await (prisma.organization as any).update({
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

  const updatedOrg: any = await (prisma.organization as any).update({
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

/**
 * Fetches the live, up-to-date list of models directly from the provider's API.
 */
export async function fetchLiveProviderModels(params: {
  provider: string;
  apiKey?: string;
  organizationId?: string;
}): Promise<{ textModels: string[]; embeddingModels: string[]; source: "live_api" | "fallback" }> {
  const { provider, organizationId } = params;
  let resolvedKey = params.apiKey?.trim();

  // If no key passed directly, attempt to read the organization's stored key
  if ((!resolvedKey || resolvedKey.includes("...")) && organizationId) {
    const org: any = await (prisma.organization as any).findUnique({
      where: { id: organizationId },
      select: { aiApiKeyEncrypted: true },
    });
    if (org?.aiApiKeyEncrypted) {
      const { decryptApiKey } = await import("@/lib/ai/provider");
      resolvedKey = decryptApiKey(org.aiApiKeyEncrypted);
    }
  }

  const p = provider.toLowerCase();

  try {
    // 1. Google Gemini Live API
    if (p === "google") {
      const key = resolvedKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
      if (key) {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`, {
          next: { revalidate: 3600 },
        });
        if (res.ok) {
          const data = await res.json();
          const models: any[] = data.models || [];
          const textModels = models
            .filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
            .map((m) => m.name.replace("models/", ""))
            .filter((name) => !name.includes("vision") && !name.includes("aqa"))
            .sort((a, b) => b.localeCompare(a));

          const embeddingModels = models
            .filter((m) => m.supportedGenerationMethods?.includes("embedContent") || m.name.includes("embedding"))
            .map((m) => m.name.replace("models/", ""));

          if (textModels.length > 0) {
            return {
              textModels,
              embeddingModels: embeddingModels.length > 0 ? embeddingModels : ["text-embedding-004", "embedding-001"],
              source: "live_api",
            };
          }
        }
      }
    }

    // 2. OpenAI Live API
    if (p === "openai") {
      const key = resolvedKey || process.env.OPENAI_API_KEY;
      if (key) {
        const res = await fetch("https://api.openai.com/v1/models", {
          headers: { Authorization: `Bearer ${key}` },
          next: { revalidate: 3600 },
        });
        if (res.ok) {
          const data = await res.json();
          const models: any[] = data.data || [];
          const textModels = models
            .map((m) => m.id)
            .filter((id) => (id.startsWith("gpt-") || id.startsWith("o1") || id.startsWith("o3") || id.startsWith("chatgpt")) && !id.includes("audio") && !id.includes("realtime"))
            .sort((a, b) => b.localeCompare(a));

          const embeddingModels = models
            .map((m) => m.id)
            .filter((id) => id.includes("embedding"))
            .sort();

          if (textModels.length > 0) {
            return {
              textModels,
              embeddingModels: embeddingModels.length > 0 ? embeddingModels : ["text-embedding-3-small", "text-embedding-3-large"],
              source: "live_api",
            };
          }
        }
      }
    }

    // 3. Anthropic Live API
    if (p === "anthropic") {
      const key = resolvedKey || process.env.ANTHROPIC_API_KEY;
      if (key) {
        const res = await fetch("https://api.anthropic.com/v1/models", {
          headers: {
            "x-api-key": key,
            "anthropic-version": "2023-06-01",
          },
          next: { revalidate: 3600 },
        });
        if (res.ok) {
          const data = await res.json();
          const models: any[] = data.data || [];
          const textModels = models.map((m) => m.id).sort((a, b) => b.localeCompare(a));
          if (textModels.length > 0) {
            return {
              textModels,
              embeddingModels: ["text-embedding-004"],
              source: "live_api",
            };
          }
        }
      }
    }

    // 4. Groq Live API
    if (p === "groq") {
      const key = resolvedKey || process.env.GROQ_API_KEY;
      if (key) {
        const res = await fetch("https://api.groq.com/openai/v1/models", {
          headers: { Authorization: `Bearer ${key}` },
          next: { revalidate: 3600 },
        });
        if (res.ok) {
          const data = await res.json();
          const models: any[] = data.data || [];
          const textModels = models.map((m) => m.id).sort((a, b) => b.localeCompare(a));
          if (textModels.length > 0) {
            return {
              textModels,
              embeddingModels: ["text-embedding-004"],
              source: "live_api",
            };
          }
        }
      }
    }

    // 5. OpenRouter Public Models Directory (No API Key Required)
    if (p === "openrouter") {
      const res = await fetch("https://openrouter.ai/api/v1/models", {
        next: { revalidate: 3600 },
      });
      if (res.ok) {
        const data = await res.json();
        const models: any[] = data.data || [];
        const textModels = models.map((m) => m.id).slice(0, 50);
        return {
          textModels,
          embeddingModels: ["text-embedding-004"],
          source: "live_api",
        };
      }
    }
  } catch (error) {
    console.error("Error fetching live models from provider API:", error);
  }

  // Fallback defaults if API key is not yet set or offline
  const fallbacks: Record<string, { text: string[]; embed: string[] }> = {
    google: {
      text: ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash", "gemini-1.0-pro"],
      embed: ["text-embedding-004", "embedding-001"],
    },
    openai: {
      text: ["gpt-4o", "gpt-4o-mini", "o1-mini", "o1-preview", "gpt-4-turbo", "gpt-3.5-turbo"],
      embed: ["text-embedding-3-small", "text-embedding-3-large", "text-embedding-ada-002"],
    },
    anthropic: {
      text: ["claude-3-5-sonnet-latest", "claude-3-5-haiku-latest", "claude-3-opus-latest"],
      embed: ["text-embedding-004"],
    },
    groq: {
      text: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768", "gemma2-9b-it"],
      embed: ["text-embedding-004"],
    },
    openrouter: {
      text: ["anthropic/claude-3.5-sonnet", "openai/gpt-4o", "meta-llama/llama-3.3-70b-instruct", "deepseek/deepseek-r1"],
      embed: ["text-embedding-004"],
    },
  };

  const selected = fallbacks[p] || fallbacks.google;
  return {
    textModels: selected.text,
    embeddingModels: selected.embed,
    source: "fallback",
  };
}


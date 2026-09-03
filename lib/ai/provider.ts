import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  createHash,
} from "crypto";
import { google, createGoogleGenerativeAI } from "@ai-sdk/google";
import { prisma } from "@/lib/auth";

// Encryption setup
const ALGORITHM = "aes-256-cbc";
const ENCRYPTION_SECRET =
  process.env.ENCRYPTION_KEY ||
  process.env.BETTER_AUTH_SECRET ||
  "pulseguard_default_super_secret_key_32b";
const KEY = createHash("sha256").update(ENCRYPTION_SECRET).digest();

export function maskApiKey(key: string): string {
  if (!key || key.length <= 8) return "••••••••";
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

export function encryptApiKey(text: string): string {
  if (!text) return "";
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

export function decryptApiKey(cipherText: string): string {
  if (!cipherText || !cipherText.includes(":")) return "";
  try {
    const [ivHex, encrypted] = cipherText.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = createDecipheriv(ALGORITHM, KEY, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    return "";
  }
}

/**
 * Dynamically resolves the configured AI model for an organization.
 * Supports custom API keys and provider selection with graceful fallback.
 */
export async function getOrgLanguageModel(organizationId: string) {
  const DEFAULT_TEXT_MODEL = "gemini-1.5-flash";
  try {
    const org: any = await (prisma.organization as any).findUnique({
      where: { id: organizationId },
      select: {
        aiProvider: true,
        aiModel: true,
        aiApiKeyEncrypted: true,
      },
    });

    if (!org) {
      return google(DEFAULT_TEXT_MODEL);
    }

    const decryptedKey = org.aiApiKeyEncrypted
      ? decryptApiKey(org.aiApiKeyEncrypted)
      : null;
    const provider = org.aiProvider?.toLowerCase() || "google";
    const modelName = org.aiModel || DEFAULT_TEXT_MODEL;

    if (provider === "google") {
      if (decryptedKey) {
        const customGoogle = createGoogleGenerativeAI({ apiKey: decryptedKey });
        return customGoogle(modelName);
      }
      return google(modelName);
    }

    // Fallback if custom provider client isn't installed yet or default
    return google(modelName);
  } catch {
    return google(DEFAULT_TEXT_MODEL);
  }
}

/**
 * Dynamically resolves the embedding model for an organization.
 */
export async function getOrgEmbeddingModel(organizationId: string) {
  const DEFAULT_EMBEDDING_MODEL = "gemini-embedding-001";
  try {
    const org: any = await (prisma.organization as any).findUnique({
      where: { id: organizationId },
      select: {
        aiProvider: true,
        aiEmbeddingModel: true,
        aiApiKeyEncrypted: true,
      },
    });

    const decryptedKey = org?.aiApiKeyEncrypted
      ? decryptApiKey(org.aiApiKeyEncrypted)
      : null;
    let embeddingModel = org?.aiEmbeddingModel || DEFAULT_EMBEDDING_MODEL;

    // Migrate deprecated text-embedding-004 to gemini-embedding-001
    if (embeddingModel === "text-embedding-004") {
      embeddingModel = "gemini-embedding-001";
    }

    if (decryptedKey) {
      const customGoogle = createGoogleGenerativeAI({ apiKey: decryptedKey });
      return customGoogle.textEmbeddingModel(embeddingModel);
    }

    return google.textEmbeddingModel(embeddingModel);
  } catch {
    return google.textEmbeddingModel(DEFAULT_EMBEDDING_MODEL);
  }
}

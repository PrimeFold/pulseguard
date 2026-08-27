import { describe, it, expect, vi } from "vitest";
import { maskApiKey, encryptApiKey, decryptApiKey, getOrgLanguageModel, getOrgEmbeddingModel } from "@/lib/ai/provider";
import { prisma } from "@/lib/auth";

// Mock Prisma
vi.mock("@/lib/auth", () => ({
  prisma: {
    organization: {
      findUnique: vi.fn(),
    },
  },
}));

describe("AI Credentials & Dynamic Model Provider", () => {
  describe("API Key Masking & AES-256 Encryption", () => {
    it("should mask key keeping only first and last 4 chars", () => {
      expect(maskApiKey("AIzaSyD-abc123xyz789")).toBe("AIza...z789");
      expect(maskApiKey("")).toBe("••••••••");
    });

    it("should symmetrically encrypt and decrypt API keys correctly", () => {
      const rawKey = "AIzaSyTestApiKey12345";
      const encrypted = encryptApiKey(rawKey);

      expect(encrypted).not.toBe(rawKey);
      expect(encrypted).toContain(":");

      const decrypted = decryptApiKey(encrypted);
      expect(decrypted).toBe(rawKey);
    });

    it("should return empty string if decryption fails or cipher is invalid", () => {
      expect(decryptApiKey("invalid_cipher_format")).toBe("");
      expect(decryptApiKey("")).toBe("");
    });
  });

  describe("Dynamic Language Model Resolution", () => {
    it("should resolve to default gemini model if organization does not exist", async () => {
      vi.mocked(prisma.organization.findUnique as any).mockResolvedValue(null);

      const model = await getOrgLanguageModel("non-existent-org");
      expect(model).toBeDefined();
      expect(model.modelId).toBe("gemini-1.5-flash");
    });

    it("should resolve to custom configured model if organization defines it", async () => {
      vi.mocked(prisma.organization.findUnique as any).mockResolvedValue({
        aiProvider: "google",
        aiModel: "gemini-1.5-pro",
        aiApiKeyEncrypted: null,
      });

      const model = await getOrgLanguageModel("custom-org");
      expect(model).toBeDefined();
      expect(model.modelId).toBe("gemini-1.5-pro");
    });

    it("should initialize client with custom decrypted API key if configured", async () => {
      const rawKey = "AIzaSyCustomKey999";
      const encrypted = encryptApiKey(rawKey);

      vi.mocked(prisma.organization.findUnique as any).mockResolvedValue({
        aiProvider: "google",
        aiModel: "gemini-1.5-flash",
        aiApiKeyEncrypted: encrypted,
      });

      const model = await getOrgLanguageModel("custom-key-org");
      expect(model).toBeDefined();
      expect(model.modelId).toBe("gemini-1.5-flash");
    });
  });

  describe("Dynamic Embedding Model Resolution", () => {
    it("should resolve to default text-embedding-004 model", async () => {
      vi.mocked(prisma.organization.findUnique as any).mockResolvedValue(null);

      const model = await getOrgEmbeddingModel("non-existent-org");
      expect(model).toBeDefined();
      expect(model.modelId).toBe("text-embedding-004");
    });

    it("should resolve to custom embedding model name", async () => {
      vi.mocked(prisma.organization.findUnique as any).mockResolvedValue({
        aiProvider: "google",
        aiEmbeddingModel: "custom-embedding-v1",
        aiApiKeyEncrypted: null,
      });

      const model = await getOrgEmbeddingModel("custom-embedding-org");
      expect(model).toBeDefined();
      expect(model.modelId).toBe("custom-embedding-v1");
    });
  });
});

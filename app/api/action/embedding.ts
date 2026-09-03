import { getOrgEmbeddingModel } from "@/lib/ai/provider";
import { embed } from "ai";

export async function getEmbeddingVectorString(
  text: string,
  organizationId?: string,
): Promise<string> {
  try {
    const model = organizationId
      ? await getOrgEmbeddingModel(organizationId)
      : (await import("@ai-sdk/google")).google.textEmbeddingModel(
          "gemini-embedding-001",
        );

    const { embedding } = await embed({
      model: model as any,
      value: text,
    });

    return `[${embedding.join(",")}]`;
  } catch (error) {
    throw new Error((error as Error).message);
  }
}

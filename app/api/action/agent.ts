"use server";
import { prisma } from "@/lib/auth";
import { getEmbeddingVectorString } from "./embedding";
import { queryResult } from "@/app/types/searchResult";

export async function searchKnowledgeBase(
  query: string,
): Promise<queryResult[]> {
  if (!query.trim()) return [];

  const queryVectorString = await getEmbeddingVectorString(query);
  await prisma.$executeRawUnsafe(`SET hnsw.ef_search = 40;`);

  const results = await prisma.$queryRaw<queryResult[]>
  `
    SELECT 
    id, 
    content, 
    1 - (embedding <=> ${queryVectorString}::vector) AS similarity
    FROM "DocumentChunk"
    WHERE 1 - (embedding <=> ${queryVectorString}::vector) > 0.60
    ORDER BY embedding <=> ${queryVectorString}::vector ASC
    LIMIT 3;
  `;

  return results;
}


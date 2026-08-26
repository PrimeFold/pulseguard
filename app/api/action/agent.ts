"use server";
import { prisma } from "@/lib/auth";
import { getEmbeddingVectorString } from "./embedding";
import { queryResult } from "@/app/types/searchResult";
import { requireOrganizationMembership } from '@/lib/authorization';

export async function searchKnowledgeBase(
  query: string,
  organizationId: string,
): Promise<queryResult[]> {
  if (!query.trim()) return [];

  await requireOrganizationMembership(organizationId);

  const queryVectorString = await getEmbeddingVectorString(query);
  await prisma.$executeRawUnsafe(`SET hnsw.ef_search = 40;`);

  const results = await prisma.$queryRaw<queryResult[]>
  `
    SELECT 
    chunk.id,
    chunk.content,
    1 - (chunk.embedding <=> ${queryVectorString}::vector) AS similarity
    FROM "DocumentChunk" AS chunk
    INNER JOIN "Document" AS document ON document.id = chunk."documentId"
    WHERE document."organizationId" = ${organizationId}
      AND 1 - (chunk.embedding <=> ${queryVectorString}::vector) > 0.60
    ORDER BY chunk.embedding <=> ${queryVectorString}::vector ASC
    LIMIT 3;
  `;

  return results;
}

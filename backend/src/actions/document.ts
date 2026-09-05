"use server";
import { IngestDocumentParams } from "@/app/types/docment";
import { prisma } from "@/lib/auth";
import { DocumentType } from "@/lib/generated/prisma/enums";
import { parseFileToText } from "@/lib/parse-file";
import { getOrgEmbeddingModel } from "@/lib/ai/provider";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { embedMany } from "ai";
import { revalidatePath } from "next/cache";
import { requireOrganizationMembership } from '@/lib/authorization';
import { redis } from "@/lib/redis";

export async function IngestDocument({
    organizationId,
    title,
    type,
    rawContent,
    sourceUrl
}:IngestDocumentParams){
    try {
        await requireOrganizationMembership(organizationId);
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize:600,
            chunkOverlap:60,
            separators:['\n## ', '\n### ', '\n#### ', '\n\n', '\n', ' '],
        })

        const rawChunks = await splitter.splitText(rawContent);

        if(rawChunks.length===0){
            throw new Error("Document is empty , no content to be found.")
        }        

        const embeddingModel = await getOrgEmbeddingModel(organizationId);

        const {embeddings} = await embedMany({
            model: embeddingModel as any,
            values:rawChunks
        })
        
        return await prisma.$transaction(async(tx: any)=>{
            const document = await tx.document.create({
                data:{
                    title,
                    organizationId,
                    type,
                    content:rawContent,
                    sourceUrl
                }
            })
            for(let i = 0 ; i<rawChunks.length ; i++){
                const chunkText = rawChunks[i];
                // Slice embedding to match schema dimensionality (736) - mathematically valid for Matryoshka representation learning models like text-embedding-004
                const slicedEmbedding = embeddings[i].slice(0, 736);
                const chunkVector = JSON.stringify(slicedEmbedding);
                await tx.$executeRaw
                `
                    INSERT INTO "DocumentChunk" ("id", "documentId", "chunkIndex", "content", "embedding", "createdAt")
                    VALUES (
                      gen_random_uuid(),
                      ${document.id},
                      ${i},
                      ${chunkText},
                      ${chunkVector}::vector,
                      NOW()
                    );
                `
            }

            revalidatePath('/dashboard/knowledge');
            return {
                success:true,
                documentId:document.id,
                totalChunks:rawChunks.length
            }
        })
    } catch (error) {
        throw new Error((error as Error).message)
    }
    
}


//This function takes the file and puts it through parsing , then it takes the raw text and feeds it to ingestion function..
export async function uploadDocumentAction(formData: FormData) {
  try {
    const file = formData.get('file');

    if (!(file instanceof File)) {
      throw new Error('No file uploaded');
    }

    const title = (formData.get('title') as string) || file.name;
    const rawType = formData.get('type');
    const type =
      typeof rawType === 'string' && rawType in DocumentType
        ? (rawType as DocumentType)
        : DocumentType.RUNBOOK;
    const organizationId = formData.get('organizationId') as string;

    const rawText = await parseFileToText(file);

    if (!rawText.trim()) {
      throw new Error('Extracted document content is empty');
    }

    return await IngestDocument({
      organizationId,
      title,
      type,
      rawContent: rawText,
    });
  } catch (error: any) {
    console.error("UPLOAD ERROR:", error);
    return { error: error.message || error.toString() };
  }
}

export async function getRecentDocuments(organizationId: string) {
  try {
    await requireOrganizationMembership(organizationId);
    const cacheKey = `org:${organizationId}:recent_docs`;
    
    // Try cache first
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.warn("[Redis] Failed to get cached recent docs", e);
    }
    
    // Fetch from DB
    const docs = await prisma.document.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        type: true,
        createdAt: true,
        sourceUrl: true,
      }
    });
    
    // Set cache
    try {
      await redis.setex(cacheKey, 60, JSON.stringify(docs)); // 60s cache
    } catch (e) {
      console.warn("[Redis] Failed to set cached recent docs", e);
    }
    
    return docs;
  } catch (error) {
    console.error("[getRecentDocuments]", error);
    throw new Error("Failed to fetch recent documents");
  }
}

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
                const chunkVector = JSON.stringify(embeddings[i]); //Gets the vector of the current chunk from the embeddings array and converts them into json-formatted strings.
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
}

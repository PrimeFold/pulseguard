import { DocumentType } from "@/lib/generated/prisma/enums";

export interface IngestDocumentParams {
  organizationId: string;
  title: string;
  type: DocumentType;
  rawContent: string;
  sourceUrl?: string;
}

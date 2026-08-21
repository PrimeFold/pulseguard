"use server"
import { extractText, getDocumentProxy } from 'unpdf';
import { DocumentType } from './generated/prisma/enums';
export async function parseFileToText(file:File):Promise<string>{
    const extension = file.name.split('.').pop()?.toLocaleLowerCase();
    switch(extension){
        case 'md':
        case 'txt':
            return await file.text();
        case 'pdf':
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer));
            const { text } = await extractText(pdf , { mergePages : true});
            return Array.isArray(text) ? text.join('\n\n') : text;    
        default:
            throw new Error(`Unsupported file type: .${extension}. Please upload .md, .txt, or .pdf`);
    }
}



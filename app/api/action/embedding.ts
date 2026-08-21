import { google } from "@ai-sdk/google";
import { embed } from "ai";


export async function getVectorEmbeddingString(text:string):Promise<string>{
    try {
        const { embedding } = await embed({
            model: google.embeddingModel("gemini-embedding-001"),
            value:text,
            providerOptions:{
                google:{
                    outputDimensionality:1536
                }
            }
        })

        return `[${embedding.join(",")}]`;
    } catch (error) {
        throw new Error((error as Error).message);
    }
}






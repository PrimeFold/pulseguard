import { google } from "@ai-sdk/google";
import { embed } from "ai";


export async function getEmbeddingVectorString(text:string):Promise<string>{
    try {
        const embeddingModel = process.env.EMBEDDING_MODEL;
        if(!embeddingModel){
            throw new Error("Embedding model not defined..")
        }
        const { embedding } = await embed({
            model: google.embeddingModel(embeddingModel),
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





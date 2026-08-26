import { PrismaPg } from "@prisma/adapter-pg";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "./generated/prisma/client";
import { getUser } from "./session";


const adapter = new PrismaPg({connectionString:process.env.DATABASE_URL!});
export const prisma = new PrismaClient({adapter});
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", 
    }),
    emailAndPassword:{
        enabled:true,
        maxPasswordLength:30,
        minPasswordLength:6
    }
});


export async function getOrganizationIdBySlug(slug:string){
    try {
        const user = await getUser();
        if(!user) throw new Error("Unauthorized")
        
        const org = await prisma.organization.findUnique({
            where:{
                slug
            },
            include:{
                members:{
                    where:{
                        userId:user.id
                    }
                }
            }
        })

        if(!org || org.members.length===0){
            throw new Error("Forbidden : Workspace not found or access denied..")
        }
        return org;
    } catch (error:any) {
        throw new Error(error.message);
    }
}


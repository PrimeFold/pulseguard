import { PrismaPg } from "@prisma/adapter-pg";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "./generated/prisma/client";


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
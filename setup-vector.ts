import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./lib/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS vector;');
  console.log("Vector extension created!");
}

main().catch(console.error).finally(() => process.exit(0));

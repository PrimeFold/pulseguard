import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./lib/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hash = "$2b$10$FiKFpRQ6Czaw/nDVZCNjL.CblK/4.r6rA5CN5rCgoWYq0gZRqVJny";
  
  await prisma.account.upsert({
    where: {
      issuer_accountId: {
        issuer: "better-auth",
        accountId: "usr_alex123",
      }
    },
    update: {
      password: hash,
    },
    create: {
      id: "acc_alex123",
      issuer: "better-auth",
      accountId: "usr_alex123",
      providerId: "credential",
      userId: "usr_alex123",
      password: hash,
    }
  });
  console.log("Account and password setup for Alex Mercer (me123@gmail.com) complete.");
}

main().catch(console.error).finally(() => process.exit(0));

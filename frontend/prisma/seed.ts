import fs from "fs";
import path from "path";

function loadEnvFile(envPath: string) {
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnvFile(path.resolve(process.cwd(), ".env.local"));
loadEnvFile(path.resolve(process.cwd(), ".env"));
loadEnvFile(path.resolve(process.cwd(), "frontend/.env.local"));
loadEnvFile(path.resolve(process.cwd(), "frontend/.env"));

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../backend/src/lib/generated/prisma/client";

if (!process.env.DATABASE_URL) {
  console.error("❌ Error: DATABASE_URL environment variable is not defined.");
  console.error("Please ensure DATABASE_URL is set in your environment or in frontend/.env.local");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // 1. Create Alex Mercer
  const alex = await prisma.user.upsert({
    where: { email: "me123@gmail.com" },
    update: {},
    create: {
      id: "usr_alex123",
      name: "Alex Mercer",
      email: "me123@gmail.com",
      emailVerified: true,
    },
  });

  // 2. Create Alex's Organization
  const org = await prisma.organization.upsert({
    where: { slug: "mercer-innovations" },
    update: {},
    create: {
      id: "org_mercer123",
      name: "Mercer Innovations",
      slug: "mercer-innovations",
      members: {
        create: {
          userId: alex.id,
          role: "OWNER",
        },
      },
    },
  });

  // 3. Create 6 more users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "sam.fisher@gmail.com" },
      update: {},
      create: { id: "usr_sam123", name: "Sam Fisher", email: "sam.fisher@gmail.com", emailVerified: true },
    }),
    prisma.user.upsert({
      where: { email: "sarah.connor@gmail.com" },
      update: {},
      create: { id: "usr_sarah123", name: "Sarah Connor", email: "sarah.connor@gmail.com", emailVerified: true },
    }),
    prisma.user.upsert({
      where: { email: "john.wick@gmail.com" },
      update: {},
      create: { id: "usr_john123", name: "John Wick", email: "john.wick@gmail.com", emailVerified: true },
    }),
    prisma.user.upsert({
      where: { email: "ellen.ripley@gmail.com" },
      update: {},
      create: { id: "usr_ellen123", name: "Ellen Ripley", email: "ellen.ripley@gmail.com", emailVerified: true },
    }),
    prisma.user.upsert({
      where: { email: "neo.anderson@gmail.com" },
      update: {},
      create: { id: "usr_neo123", name: "Thomas Anderson", email: "neo.anderson@gmail.com", emailVerified: true },
    }),
    prisma.user.upsert({
      where: { email: "trinity@gmail.com" },
      update: {},
      create: { id: "usr_trinity123", name: "Trinity", email: "trinity@gmail.com", emailVerified: true },
    }),
  ]);

  // 4. Add 3 users as members to the organization
  const membersToAdd = users.slice(0, 3);
  for (const user of membersToAdd) {
    await prisma.organizationMember.upsert({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: org.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        organizationId: org.id,
        role: "MEMBER",
      },
    });
  }

  // 5. Add 3 pending invites from Alex for the remaining 3 users
  const invitesToAdd = users.slice(3);
  for (const user of invitesToAdd) {
    await prisma.organizationInvite.create({
      data: {
        organizationId: org.id,
        invitedEmail: user.email,
        role: "MEMBER",
        status: "PENDING",
        token: `invite_token_${user.id}`,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
      }
    });
  }

  // 6. Seed artificial telemetry logs
  await prisma.telemetryLog.createMany({
    data: [
      {
        organizationId: org.id,
        service: "payment-gateway",
        level: "ERROR",
        message: "Failed to connect to Stripe API",
        metadata: { endpoint: "/charge", retryCount: 3 },
        fingerprint: "stripe_conn_error",
      },
      {
        organizationId: org.id,
        service: "user-auth",
        level: "WARN",
        message: "High rate of failed logins detected",
        metadata: { ip: "192.168.1.100" },
        fingerprint: "auth_rate_limit",
      },
      {
        organizationId: org.id,
        service: "database-cluster",
        level: "FATAL",
        message: "Connection pool exhausted",
        metadata: { activeConnections: 100, maxConnections: 100 },
        fingerprint: "db_pool_exhausted",
      },
      {
        organizationId: org.id,
        service: "frontend-app",
        level: "INFO",
        message: "Application started successfully",
        metadata: { version: "1.0.4" },
        fingerprint: "app_start",
      }
    ]
  });

  // 7. Seed some incidents
  await prisma.incident.create({
    data: {
      organizationId: org.id,
      title: "Database connection pool exhaustion",
      service: "database-cluster",
      severity: "CRITICAL",
      status: "OPEN",
      description: "Multiple services are failing to acquire database connections.",
      fingerprint: "db_pool_exhausted",
      errorPayload: { activeConnections: 100, maxConnections: 100 },
      rootCauseAnalysis: "A recent deployment introduced a connection leak in the reporting microservice.",
    }
  });

  await prisma.incident.create({
    data: {
      organizationId: org.id,
      title: "Stripe API Connection Failures",
      service: "payment-gateway",
      severity: "HIGH",
      status: "INVESTIGATING",
      description: "Payment gateway is unable to reach Stripe endpoints.",
      fingerprint: "stripe_conn_error",
      errorPayload: { endpoint: "/charge", retryCount: 3 },
    }
  });

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

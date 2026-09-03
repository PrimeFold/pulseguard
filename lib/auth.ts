import { PrismaPg } from "@prisma/adapter-pg";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "./generated/prisma/client";
import { customSession } from "better-auth/plugins";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
export const prisma = new PrismaClient({ adapter });
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes cookie cache (0 DB queries on navigation)
    },
  },
  plugins: [
    customSession(async (sessionData: any) => {
      if (!sessionData || !sessionData.user) {
        return sessionData;
      }
      try {
        const membership = await prisma.organizationMember.findFirst({
          where: { userId: sessionData.user.id },
          include: {
            organization: {
              select: { id: true, slug: true, name: true },
            },
          },
        });

        return {
          ...sessionData,
          activeOrg: membership?.organization ?? null,
          role: membership?.role ?? null,
        };
      } catch (err) {
        return sessionData;
      }
    }),
  ],
  emailAndPassword: {
    enabled: true,
    maxPasswordLength: 30,
    minPasswordLength: 6,
    sendResetPassword: async ({ user, url, token }, request) => {
      console.log(
        "\n\n=======================================================",
      );
      console.log("🔒 SECURE PASSWORD RESET INITIATED");
      console.log("Target Operator Email: ", user.email);
      console.log("Recovery Link: ", url);
      console.log(
        "=======================================================\n\n",
      );
    },
  },
});

export async function getOrganizationIdBySlug(slug: string) {
  try {
    const { getUser } = await import("./session");
    const user = await getUser();
    if (!user) throw new Error("Unauthorized");

    const org = await prisma.organization.findUnique({
      where: {
        slug,
      },
      include: {
        members: {
          where: {
            userId: user.id,
          },
        },
      },
    });

    if (!org || org.members.length === 0) {
      throw new Error("Forbidden : Workspace not found or access denied..");
    }
    return org;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

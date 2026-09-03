import { PrismaPg } from "@prisma/adapter-pg";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "./generated/prisma/client";
import { customSession } from "better-auth/plugins";
import nodemailer from "nodemailer";

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
      try {
        console.log("🚀 INITIATING MOCK PASSWORD RESET VIA ETHEREAL...");
        const testAccount = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });

        const info = await transporter.sendMail({
          from: '"PulseGuard Auth" <auth@pulseguard.test>',
          to: user.email,
          subject: "Reset your PulseGuard Password",
          text: `Please reset your password by clicking the following link: ${url}`,
          html: `<div style="font-family: monospace; padding: 20px; background: #000; color: #fff;">
                  <h2>PulseGuard Password Reset</h2>
                  <p>Click the link below to securely reset your password.</p>
                  <a href="${url}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; margin-top: 10px;">Reset Password</a>
                 </div>`,
        });

        console.log("=======================================================");
        console.log("📧 PASSWORD RESET INTERCEPTED BY ETHEREAL MOCK SERVER");
        console.log("Target Email: ", user.email);
        console.log("Preview URL: ", nodemailer.getTestMessageUrl(info));
        console.log("=======================================================\n");
      } catch (err) {
        console.error("Failed to send password reset email:", err);
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      try {
        console.log("🚀 INITIATING MOCK EMAIL VERIFICATION VIA ETHEREAL...");
        const testAccount = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
          },
        });

        const info = await transporter.sendMail({
          from: '"PulseGuard Auth" <auth@pulseguard.test>',
          to: user.email,
          subject: "Verify your PulseGuard Account",
          text: `Please verify your email by clicking the following link: ${url}`,
          html: `<div style="font-family: monospace; padding: 20px; background: #000; color: #fff;">
                  <h2>PulseGuard Verification</h2>
                  <p>Click the link below to verify your account.</p>
                  <a href="${url}" style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; margin-top: 10px;">Verify Account</a>
                 </div>`,
        });

        console.log("=======================================================");
        console.log("📧 EMAIL INTERCEPTED BY ETHEREAL MOCK SERVER");
        console.log("Target Email: ", user.email);
        console.log("Preview URL: ", nodemailer.getTestMessageUrl(info));
        console.log("=======================================================\n");
      } catch (err) {
        console.error("Failed to send verification email:", err);
      }
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

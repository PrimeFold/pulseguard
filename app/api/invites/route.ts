import { prisma } from "@/lib/auth";
import { getUser } from "@/lib/session";
import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";

enum Role {
  MEMBER,
  ADMIN,
  VIEWER,
  ASSISTANT,
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { organizationId, role, invitedEmail } = await req.json();

    if (!(role in Role)) {
      return NextResponse.json(
        { error: "Invalid role selected" },
        { status: 404 },
      );
    }

    const member = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId,
        },
      },
    });

    if (!member || member.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden : Only admins can invite other members" },
        { status: 403 },
      );
    }
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

    const invite = await prisma.organizationInvite.create({
      data: {
        organizationId,
        token,
        expiresAt,
        role,
        invitedEmail: invitedEmail || null,
      },
      include: {
        organization: {
          select: {
            name: true,
          },
        },
      },
    });

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}`;
    return NextResponse.json({ inviteUrl, expiresAt: invite.expiresAt });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}

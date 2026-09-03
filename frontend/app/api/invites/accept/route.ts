import { prisma } from "@/lib/auth";
import { getUser } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token } = await req.json();

    const invite = await prisma.organizationInvite.findUnique({
      where: { token },
      include: { organization: true },
    });

    if (
      !invite ||
      invite.status !== "PENDING" ||
      invite.expiresAt < new Date()
    ) {
      return NextResponse.json(
        { error: "Invite is invalid or has expired" },
        { status: 400 },
      );
    }

    // If restricted to a specific email, verify the user's email matches
    if (invite.invitedEmail && invite.invitedEmail !== user.email) {
      return NextResponse.json(
        {
          error: `This invite wasn't meant for You. Refer to The Admin for an invite link`,
        },
        { status: 403 },
      );
    }

    // Add user as member to the organization
    await prisma.$transaction([
      prisma.organizationMember.upsert({
        where: {
          userId_organizationId: {
            userId: user.id,
            organizationId: invite.organizationId,
          },
        },
        create: {
          userId: user.id,
          organizationId: invite.organizationId,
          role: invite.role,
        },
        update: {
          role: invite.role, // upgrade role if already exists
        },
      }),
      prisma.organizationInvite.update({
        where: { id: invite.id },
        data: { status: "ACCEPTED" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      organizationId: invite.organizationId,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

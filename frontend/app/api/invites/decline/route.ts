import { prisma } from "@/lib/auth";
import { getUser } from "@/lib/session";
import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const invite = await prisma.organizationInvite.findUnique({
      where: { token },
    });

    if (!invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    // Mark invite as expired/declined so it no longer appears in pending lists
    await prisma.organizationInvite.update({
      where: { id: invite.id },
      data: { status: "EXPIRED" },
    });

    // Invalidate the user's notification cache immediately
    await redis.del(`notifications:user:${user.id}`);

    return NextResponse.json({
      success: true,
      message: "Invite declined successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { dismissNotification } from "@/lib/notifications";
import { requireAuthenticatedUser } from "@/lib/authorization";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, type } = await req.json();
    if (!id || !type) {
      return NextResponse.json({ error: "Missing notification id or type" }, { status: 400 });
    }

    await dismissNotification(user.id, id, type);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error in /api/notifications/dismiss:", err);
    return NextResponse.json({ error: err.message || "Failed to dismiss notification" }, { status: 500 });
  }
}

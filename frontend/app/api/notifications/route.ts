import { NextRequest, NextResponse } from "next/server";
import { getUserNotifications } from "@/lib/notifications";
import { requireAuthenticatedUser } from "@/lib/authorization";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const forceRefresh = searchParams.get("refresh") === "true";

    const notifications = await getUserNotifications(
      { id: user.id, email: user.email },
      forceRefresh
    );

    return NextResponse.json(notifications, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

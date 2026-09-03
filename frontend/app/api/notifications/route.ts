import { NextResponse } from "next/server";
import { getUserNotifications } from "@/lib/notifications";
import { requireAuthenticatedUser } from "@/lib/authorization";

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await getUserNotifications({ id: user.id, email: user.email });
    return NextResponse.json(notifications);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

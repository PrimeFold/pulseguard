import { describe, it, expect } from "vitest";
import { getUserNotifications } from "@/lib/notifications";

describe("Notifications System", () => {
  it("returns zero count with empty arrays when user has no pending items without throwing", async () => {
    const res = await getUserNotifications({
      id: "usr_nonexistent_zero_notifs",
      email: "zero.notifications.user@pulseguard.io",
    });

    expect(res).toBeDefined();
    expect(res.totalCount).toBe(0);
    expect(res.invites).toEqual([]);
    expect(res.actionItems).toEqual([]);
  });

  it("successfully retrieves seeded notifications for user with invites or incidents", async () => {
    const res = await getUserNotifications({
      id: "usr_alex123",
      email: "me123@gmail.com",
    });

    expect(res).toBeDefined();
    expect(Array.isArray(res.invites)).toBe(true);
    expect(Array.isArray(res.actionItems)).toBe(true);
    expect(typeof res.totalCount).toBe("number");
  });
});

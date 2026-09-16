import { prisma } from "@/lib/auth";
import { redis } from "@/lib/redis";

const NOTIFICATION_CACHE_TTL_SECONDS = 30; // 30 seconds for live freshness

export interface NotificationPayload {
  invites: Array<{
    id: string;
    type: "INVITE";
    title: string;
    token: string;
    role: string;
    createdAt: Date;
  }>;
  actionItems: Array<{
    id: string;
    type: "INCIDENT_APPROVAL";
    title: string;
    incidentId: string;
    orgSlug?: string;
    createdAt: Date;
  }>;
  totalCount: number;
}

export async function getUserNotifications(
  user: { id: string; email: string },
  forceRefresh = false
): Promise<NotificationPayload> {
  const cacheKey = `notifications:user:${user.id}`;
  const dismissedKey = `notifications:dismissed:${user.id}`;

  // 1. Try Redis Cache first unless forceRefresh is requested
  if (!forceRefresh) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached as string);
      }
    } catch (err) {
      console.warn("Redis notification cache read failed, falling back to DB compute:", err);
    }
  }

  try {
    // Fetch dismissed notification IDs for this user
    let dismissedIds: string[] = [];
    try {
      dismissedIds = await redis.smembers(dismissedKey);
    } catch (err) {
      console.warn("Failed to fetch dismissed notifications from Redis:", err);
    }
    const dismissedSet = new Set(dismissedIds);

    // 2. Cache Miss / Force Refresh: Compute Pending Invites
    const rawInvites = await prisma.organizationInvite.findMany({
      where: {
        invitedEmail: user.email,
        status: "PENDING",
        expiresAt: { gt: new Date() },
      },
      include: {
        organization: { select: { id: true, name: true, slug: true } },
      },
    });

    const pendingInvites = rawInvites.filter((inv) => !dismissedSet.has(inv.id));

    // 3. Find Orgs where user is ADMIN or OWNER
    const adminMemberships = await prisma.organizationMember.findMany({
      where: {
        userId: user.id,
        role: { in: ["ADMIN", "OWNER"] },
      },
      select: { organizationId: true },
    });

    const adminOrgIds = adminMemberships.map((m) => m.organizationId);

    // 4. Compute Pending Incidents awaiting hotfix approval
    const rawHotfixes = adminOrgIds.length > 0
      ? await prisma.incident.findMany({
          where: {
            organizationId: { in: adminOrgIds },
            status: "OPEN",
          },
          select: {
            id: true,
            title: true,
            organizationId: true,
            createdAt: true,
            organization: { select: { slug: true } },
          },
        })
      : [];

    const pendingHotfixes = rawHotfixes.filter((inc) => !dismissedSet.has(inc.id));

    // 5. Structure into a clean unified notification payload
    const notifications: NotificationPayload = {
      invites: pendingInvites.map((inv) => ({
        id: inv.id,
        type: "INVITE",
        title: `Invited to ${inv.organization.name}`,
        token: inv.token,
        role: inv.role,
        createdAt: inv.createdAt,
      })),
      actionItems: pendingHotfixes.map((inc) => ({
        id: inc.id,
        type: "INCIDENT_APPROVAL",
        title: `Open Incident: ${inc.title}`,
        incidentId: inc.id,
        orgSlug: inc.organization?.slug,
        createdAt: inc.createdAt,
      })),
      totalCount: pendingInvites.length + pendingHotfixes.length,
    };

    // 6. Cache in Redis with 30s TTL
    try {
      await redis.set(cacheKey, JSON.stringify(notifications), "EX", NOTIFICATION_CACHE_TTL_SECONDS);
    } catch (err) {
      console.warn("Redis notification cache write failed:", err);
    }

    return notifications;
  } catch (err) {
    console.error("Error computing notifications:", err);
    return {
      invites: [],
      actionItems: [],
      totalCount: 0,
    };
  }
}

export async function dismissNotification(
  userId: string,
  notificationId: string,
  type: "INVITE" | "INCIDENT_APPROVAL"
): Promise<void> {
  const dismissedKey = `notifications:dismissed:${userId}`;

  try {
    // 1. Store dismissed notification ID in Redis set
    await redis.sadd(dismissedKey, notificationId);

    // 2. If it's an invite, update DB status to EXPIRED to persist removal
    if (type === "INVITE") {
      try {
        await prisma.organizationInvite.updateMany({
          where: { id: notificationId },
          data: { status: "EXPIRED" },
        });
      } catch (err) {
        console.warn("Failed to update invite status in DB on dismiss:", err);
      }
    }

    // 3. Clear user's notification cache so UI receives updated list instantly
    await invalidateUserNotificationCache(userId);
  } catch (err) {
    console.error("Error dismissing notification:", err);
  }
}

export async function invalidateUserNotificationCache(userId: string): Promise<void> {
  try {
    await redis.del(`notifications:user:${userId}`);
  } catch (err) {
    console.warn("Redis cache invalidation failed:", err);
  }
}

export async function invalidateOrgNotificationCache(organizationId: string): Promise<void> {
  try {
    const adminMembers = await prisma.organizationMember.findMany({
      where: {
        organizationId,
        role: { in: ["ADMIN", "OWNER"] },
      },
      select: { userId: true },
    });

    if (adminMembers.length > 0) {
      const keys = adminMembers.map((m) => `notifications:user:${m.userId}`);
      await redis.del(...keys);
    }
  } catch (err) {
    console.warn("Failed to invalidate org notification cache:", err);
  }
}

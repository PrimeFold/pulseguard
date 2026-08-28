import { prisma } from "@/lib/auth";
import { redis } from "@/lib/redis";

const NOTIFICATION_CACHE_TTL_SECONDS = 7 * 60 * 60; // 7 Hours

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
    createdAt: Date;
  }>;
  totalCount: number;
}

export async function getUserNotifications(user: { id: string; email: string }): Promise<NotificationPayload> {
  const cacheKey = `notifications:user:${user.id}`;

  // 1. Try Redis Cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached as string);
  }

  // 2. Cache Miss: Compute Pending Invites
  const pendingInvites = await prisma.organizationInvite.findMany({
    where: {
      email: user.email,
      expiresAt: { gt: new Date() },
    },
    include: {
      organization: { select: { id: true, name: true, slug: true } },
    },
  });

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
  const pendingHotfixes = adminOrgIds.length > 0
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
        },
      })
    : [];

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
      createdAt: inc.createdAt,
    })),
    totalCount: pendingInvites.length + pendingHotfixes.length,
  };

  // 6. Cache in Redis for 7 hours
  await redis.set(cacheKey, JSON.stringify(notifications), "EX", NOTIFICATION_CACHE_TTL_SECONDS);

  return notifications;
}

export async function invalidateUserNotificationCache(userId: string) {
  await redis.del(`notifications:user:${userId}`);
}

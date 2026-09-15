import { redis } from "@/lib/redis";
import { revalidatePath } from "next/cache";

/**
 * Safely delete multiple Redis keys matching a glob pattern.
 */
export async function deleteKeysByPattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys && keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    console.error(`[Redis] Failed to delete keys for pattern "${pattern}":`, err);
  }
}

/**
 * Safely revalidate multiple Next.js cache paths.
 */
export function safeRevalidatePaths(paths: string[]): void {
  for (const path of paths) {
    try {
      revalidatePath(path);
    } catch (err) {
      console.warn(`[Next Cache] Failed to revalidate path "${path}":`, err);
    }
  }
}

/**
 * Resolves organization slug if not provided, for accurate path revalidation.
 */
async function resolveOrgSlug(organizationId: string, slug?: string): Promise<string | null> {
  if (slug) return slug;
  try {
    const { prisma } = await import("@/lib/auth");
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { slug: true },
    });
    return org?.slug || null;
  } catch (err) {
    console.warn(`[Cache Invalidation] Failed to resolve slug for org ${organizationId}:`, err);
    return null;
  }
}

/**
 * Invalidate Tenant Cache (`tenant:${slug}:*`).
 * Affects organization name, settings, sidebar, navbar, and RBAC permissions.
 */
export async function invalidateTenantCache(slug: string, userId?: string): Promise<void> {
  if (userId) {
    try {
      await redis.del(`tenant:${slug}:${userId}`);
    } catch (err) {
      console.error(`[Redis] Failed to delete tenant cache for user ${userId}:`, err);
    }
  } else {
    await deleteKeysByPattern(`tenant:${slug}:*`);
  }

  safeRevalidatePaths([
    `/${slug}`,
    `/${slug}/settings`,
    `/${slug}/settings/ai`,
    `/${slug}/settings/teams`,
    `/${slug}/ingestion`,
    `/${slug}/telemetry`,
    `/${slug}/incidents`,
    "/workspaces",
  ]);
}

/**
 * Invalidate Telemetry Cache (`telemetry:logs:${orgId}:*` and `dashboard:v2:${orgId}`).
 * Triggered on batch ingest and log creation.
 */
export async function invalidateTelemetryCache(organizationId: string, slug?: string): Promise<void> {
  await Promise.all([
    deleteKeysByPattern(`telemetry:logs:${organizationId}:*`),
    redis.del(`dashboard:v2:${organizationId}`).catch((err) =>
      console.error(`[Redis] Failed to delete dashboard cache for org ${organizationId}:`, err)
    ),
  ]);

  const resolvedSlug = await resolveOrgSlug(organizationId, slug);
  const paths = ["/[orgSlug]/telemetry", "/[orgSlug]"];
  if (resolvedSlug) {
    paths.push(`/${resolvedSlug}/telemetry`);
    paths.push(`/${resolvedSlug}`);
  }

  safeRevalidatePaths(paths);
}

/**
 * Invalidate Incidents Cache (`incidents:list:${orgId}:*` and `dashboard:v2:${orgId}`).
 * Triggered on incident creation, status updates, and resolutions.
 */
export async function invalidateIncidentsCache(organizationId: string, slug?: string): Promise<void> {
  await Promise.all([
    deleteKeysByPattern(`incidents:list:${organizationId}:*`),
    redis.del(`dashboard:v2:${organizationId}`).catch((err) =>
      console.error(`[Redis] Failed to delete dashboard cache for org ${organizationId}:`, err)
    ),
  ]);

  const resolvedSlug = await resolveOrgSlug(organizationId, slug);
  const paths = ["/[orgSlug]/incidents", "/[orgSlug]"];
  if (resolvedSlug) {
    paths.push(`/${resolvedSlug}/incidents`);
    paths.push(`/${resolvedSlug}`);
  }

  safeRevalidatePaths(paths);
}

/**
 * Invalidate Team Members Cache (`team:members:${orgId}:*` and target user tenant cache).
 * Triggered on role updates, member removals, and invite acceptances.
 */
export async function invalidateTeamCache(
  organizationId: string,
  slug?: string,
  targetUserId?: string
): Promise<void> {
  const tasks: Promise<any>[] = [deleteKeysByPattern(`team:members:${organizationId}:*`)];

  const resolvedSlug = await resolveOrgSlug(organizationId, slug);

  if (targetUserId) {
    tasks.push(
      redis.del(`notifications:user:${targetUserId}`).catch((err) =>
        console.error(`[Redis] Failed to delete notification cache for ${targetUserId}:`, err)
      )
    );
    if (resolvedSlug) {
      tasks.push(
        redis.del(`tenant:${resolvedSlug}:${targetUserId}`).catch((err) =>
          console.error(`[Redis] Failed to delete tenant cache for user ${targetUserId}:`, err)
        )
      );
    }
  } else if (resolvedSlug) {
    tasks.push(deleteKeysByPattern(`tenant:${resolvedSlug}:*`));
  }

  await Promise.all(tasks);

  const paths = ["/[orgSlug]/settings/teams"];
  if (resolvedSlug) {
    paths.push(`/${resolvedSlug}/settings/teams`);
    paths.push(`/${resolvedSlug}/settings`);
    paths.push(`/${resolvedSlug}`);
  }

  safeRevalidatePaths(paths);
}

/**
 * Invalidate AI Models Cache (`models:cache:${orgId}:*` and `tenant:${slug}:*`).
 * Triggered on AI provider / model / API key updates.
 */
export async function invalidateAiModelsCache(organizationId: string, slug?: string): Promise<void> {
  const resolvedSlug = await resolveOrgSlug(organizationId, slug);

  const tasks: Promise<any>[] = [deleteKeysByPattern(`models:cache:${organizationId}:*`)];

  if (resolvedSlug) {
    tasks.push(deleteKeysByPattern(`tenant:${resolvedSlug}:*`));
  }

  await Promise.all(tasks);

  const paths = ["/[orgSlug]/settings/ai", "/[orgSlug]/settings"];
  if (resolvedSlug) {
    paths.push(`/${resolvedSlug}/settings/ai`);
    paths.push(`/${resolvedSlug}/settings`);
  }

  safeRevalidatePaths(paths);
}

/**
 * Invalidate Runbook Documents Cache (`org:${orgId}:recent_docs`).
 * Triggered on document upload or post-mortem RCA ingestion.
 */
export async function invalidateDocumentsCache(organizationId: string, slug?: string): Promise<void> {
  try {
    await redis.del(`org:${organizationId}:recent_docs`);
  } catch (err) {
    console.error(`[Redis] Failed to delete recent docs cache for org ${organizationId}:`, err);
  }

  const resolvedSlug = await resolveOrgSlug(organizationId, slug);
  const paths = ["/[orgSlug]/incidents"];
  if (resolvedSlug) {
    paths.push(`/${resolvedSlug}/incidents`);
  }

  safeRevalidatePaths(paths);
}

/**
 * Invalidate API Key Cache (`tenant:${slug}:*`).
 * Triggered on API key generation/rotation.
 */
export async function invalidateApiKeyCache(organizationId: string, slug?: string): Promise<void> {
  const resolvedSlug = await resolveOrgSlug(organizationId, slug);
  if (resolvedSlug) {
    await invalidateTenantCache(resolvedSlug);
  } else {
    await deleteKeysByPattern(`tenant:*`);
  }

  const paths = ["/[orgSlug]/settings", "/[orgSlug]/ingestion"];
  if (resolvedSlug) {
    paths.push(`/${resolvedSlug}/settings`);
    paths.push(`/${resolvedSlug}/ingestion`);
  }

  safeRevalidatePaths(paths);
}

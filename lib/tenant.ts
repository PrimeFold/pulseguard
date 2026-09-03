import { notFound, redirect } from "next/navigation";
import { getUser } from "./session";
import { prisma } from "./auth";
import { redis } from "./redis";
import { cache } from "react";

export const getOrganizationAndMembership = cache(async (slug: string) => {
  const user = await getUser();
  if (!user) redirect("/login");

  const cacheKey = `tenant:${slug}:${user.id}`;

  // 1. Try Redis cache for instant sub-millisecond retrieval
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (err) {
    // Non-blocking Redis fallback
  }

  // 2. Cache miss: Fetch from PostgreSQL
  const org = await prisma.organization.findUnique({
    where: { slug },
    include: {
      members: {
        where: { userId: user.id },
      },
    },
  });

  if (!org) notFound();

  // User is not part of this organization
  if (org.members.length === 0) {
    redirect("/workspaces?error=unauthorized");
  }

  const result = {
    org,
    membership: org.members[0],
    user,
  };

  // 3. Populate Redis cache (5-minute TTL)
  try {
    await redis.setex(cacheKey, 300, JSON.stringify(result));
  } catch (err) {
    // Non-blocking Redis write fallback
  }

  return result;
});

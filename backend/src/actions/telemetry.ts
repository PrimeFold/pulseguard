"use server";

import { PaginationResponse } from "@/app/types/pagination";
import { GetTelemetryParams, telemetryLog } from "@/app/types/telemetry";
import { prisma } from "@/lib/auth";
import { Prisma, TelemetryLog } from "@/lib/generated/prisma/client";
import type { Level } from "@/lib/generated/prisma/enums";
import { revalidatePath } from "next/cache";
import { requireOrganizationMembership } from "@/lib/authorization";

export async function logTelemetry(data: telemetryLog) {
  const sanitizedMetadata = JSON.stringify(data.metadata);
  try {
    await requireOrganizationMembership(data.organizationId);
    const telemetry = await prisma.telemetryLog.create({
      data: {
        organizationId: data.organizationId,
        service: data.service,
        level: data.level,
        message: data.message,
        metadata: sanitizedMetadata,
        timestamp: new Date(),
      },
    });

    revalidatePath("/dashboard/telemetry");

    return {
      success: true,
      telemetry,
      message: "Telemetry successfully created !",
    };
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message,
    };
  }
}

export async function getTelemetryById(telemetryId: string) {
  try {
    const telemetry = await prisma.telemetryLog.findUnique({
      where: {
        id: telemetryId,
      },
    });
    if (!telemetry) {
      return { success: false, message: "Telemetry log not found" };
    }

    await requireOrganizationMembership(telemetry.organizationId);
    return {
      success: true,
      telemetry,
      message: `Fetched specific telemetry for id ${telemetryId}`,
    };
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message,
    };
  }
}

export async function getTelemetry({
  organizationId,
  searchQuery,
  service,
  level,
  fromDate,
  toDate,
  page = 1,
  limit = 8,
}: GetTelemetryParams): Promise<PaginationResponse<TelemetryLog>> {
  try {
    await requireOrganizationMembership(organizationId);
    const skip = (page - 1) * limit;
    const where: Prisma.TelemetryLogWhereInput = {
      organizationId,
      ...(service && { service }),
      ...(level && { level }),
      ...(fromDate || toDate
        ? {
            timestamp: {
              ...(fromDate && { gte: fromDate }),
              ...(toDate && { lte: toDate }),
            },
          }
        : {}),
      ...(searchQuery && {
        OR: [
          { message: { contains: searchQuery, mode: "insensitive" } },
          { service: { contains: searchQuery, mode: "insensitive" } },
        ],
      }),
    };

    const [total, data] = await prisma.$transaction([
      prisma.telemetryLog.count({ where }),
      prisma.telemetryLog.findMany({
        where,
        orderBy: { timestamp: "desc" },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  } catch (error) {
    console.error("Failed to fetch telemetry logs:", error);
    throw new Error("Could not retrieve telemetry logs");
  }
}

export interface TelemetryFilterParams {
  organizationId: string;
  service?: string;
  level?: string;
  search?: string;
  limit?: number;
}

export async function getTelemetryLogs({
  organizationId,
  service,
  level,
  search,
  limit = 50,
}: TelemetryFilterParams) {
  await requireOrganizationMembership(organizationId);

  const cacheKey = `telemetry:logs:${organizationId}:${service || "ALL"}:${level || "ALL"}:${search?.trim() || "EMPTY"}:${limit}`;

  // 1. Try Redis cache first
  try {
    const { redis } = await import("@/lib/redis");
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (err) {
    // Non-blocking Redis fallback
  }

  const whereClause: Prisma.TelemetryLogWhereInput = {
    organizationId,
  };

  if (service && service !== "ALL") {
    whereClause.service = service;
  }

  if (level && level !== "ALL") {
    whereClause.level = level as Level;
  }

  if (search && search.trim() !== "") {
    whereClause.message = {
      contains: search.trim(),
      mode: "insensitive",
    };
  }

  const [logs, availableServices] = await Promise.all([
    prisma.telemetryLog.findMany({
      where: whereClause,
      orderBy: { timestamp: "desc" },
      take: limit,
    }),
    prisma.telemetryLog.findMany({
      where: { organizationId },
      distinct: ["service"],
      select: { service: true },
    }),
  ]);

  const result = {
    logs,
    services: availableServices.map((s: any) => s.service),
  };

  // 2. Cache in Redis (30s TTL for real-time logs)
  try {
    const { redis } = await import("@/lib/redis");
    await redis.setex(cacheKey, 30, JSON.stringify(result));
  } catch (err) {
    // Non-blocking Redis write fallback
  }

  return result;
}

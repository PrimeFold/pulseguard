"use server";

import { prisma } from "@/lib/auth";
import { IngestDocument } from "./document";
import { revalidatePath } from "next/cache";
import { IncidentStatus } from "@/lib/generated/prisma/enums";
import { Prisma } from "@/lib/generated/prisma/client";
import { IncidentParams, ResolveIncidentParams } from "@/app/types/incident";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import {
  requireIncidentAccess,
  requireOrganizationMembership,
} from "@/lib/authorization";
import { getOrgLanguageModel } from "@/lib/ai/provider";

export async function resolveIncidentAndEmbedRCA({
  incidentId,
  rootCauseAnalysis,
  organizationId,
}: ResolveIncidentParams) {
  try {
    const incidentToResolve = await requireIncidentAccess(
      incidentId,
      organizationId,
    );
    const incident = await prisma.incident.update({
      where: {
        id: incidentId,
      },
      data: {
        status: "RESOLVED",
        rootCauseAnalysis,
        resolvedAt: new Date(),
      },
    }); //Kinda confused , how do I handle an error that happens fromt he db side lets say..

    await IngestDocument({
      organizationId,
      title: `Post-Mortem : ${incidentToResolve.title} ${incidentToResolve.service}`,
      type: `PAST_INCIDENT_RCA`,
      rawContent: rootCauseAnalysis,
      sourceUrl: `/dashboard/incidents/${incident.id}`,
    });

    revalidatePath("/dashboard/incidents");
    revalidatePath("/dashboard/knowledge");

    return {
      success: true,
      incidentId: incident.id,
      message: "Successfully resolved Incident and embedded RCA",
    };
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message,
    };
  }
}

export async function createIncidentAction(data: IncidentParams) {
  //As for now we can store these but with time we can poll the 'period' and delete the incidents
  // to free storage..
  try {
    await requireOrganizationMembership(data.organizationId);
    const {
      title,
      service,
      severity,
      errorPayload,
      organizationId,
      status,
      id,
    } = await prisma.incident.create({
      data: {
        title: data.title,
        service: data.service,
        severity: data.severity,
        errorPayload: data.errorPayload,
        organizationId: data.organizationId,
        status: IncidentStatus.OPEN,
      },
    });

    const rcaResponse = await generateRca({
      title,
      service,
      severity,
      errorPayload,
      organizationId,
      incidentId: id,
    });

    if (!rcaResponse.success) {
      throw new Error("RCA couldn't be generated..");
    }

    revalidatePath("/dashboard/incidents");
    return {
      title,
      service,
      severity,
      status,
      errorPayload,
      organizationId,
    };
  } catch (error) {
    throw new Error((error as Error).message);
  }
}

//Ai agent's toolcall for generation the RCA..
async function generateRca({
  title,
  service,
  severity,
  errorPayload,
  organizationId,
  incidentId,
}: {
  title: string;
  service: string;
  severity: IncidentParams["severity"];
  errorPayload: Prisma.JsonValue;
  organizationId: string;
  incidentId: string;
}) {
  try {
    const resolvedModel = await getOrgLanguageModel(organizationId);

    const { output } = await generateText({
      model: resolvedModel as any,
      prompt: `
            You're an expert at analysing errors , issues , exceptions on frontend & backend systems of a web-application.
            Given this context, identify the core root cause of this incident and explain it clearly in a succinct 2-4 sentences summary:

            Incident Message: ${incident.message}
            Stack Trace: ${incident.stackTrace || 'None'}
            Trigger Context: ${incident.triggerContext || 'None'}
            Component/Service: ${incident.service || 'Unknown'}
            Level: ${incident.level}
        `,
      maxRetries: 2,
    });

    if (!text.trim()) {
      throw new Error("failed to generate RCA");
    }

    const resolveResponse = await resolveIncidentAndEmbedRCA({
      incidentId,
      rootCauseAnalysis: text,
      organizationId,
    });
    if (!resolveResponse.success || !resolveResponse.incidentId?.trim()) {
      throw new Error(resolveResponse.message);
    }
    return {
      success: true,
      output: text,
      message: resolveResponse.message,
    };
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message,
    };
  }
}

//Updating the incident status
export async function updateIncidentStatus(
  organizationId: string,
  incidentId: string,
  status: IncidentStatus,
) {
  try {
    await requireIncidentAccess(incidentId, organizationId);
    const incident = await prisma.incident.update({
      where: {
        id: incidentId,
      },
      data: {
        status,
      },
    });
    revalidatePath("/dashboard/incidents");
    return incident;
  } catch (error) {
    throw new Error((error as Error).message);
  }
}

export async function getIncidents(organizationId: string) {
  try {
    await requireOrganizationMembership(organizationId);
    const incidents = await prisma.incident.findMany({
      where: { organizationId },
      take: 10,
    });
    return incidents;
  } catch (error) {
    throw new Error((error as Error).message);
  }
}

export interface IncidentFilterParams {
  organizationId: string;
  status?: string;
}

export async function getIncidentsList({
  organizationId,
  status,
}: IncidentFilterParams) {
  await requireOrganizationMembership(organizationId);

  const cacheKey = `incidents:list:${organizationId}:${status || "ALL"}`;

  // 1. Try Redis Cache first
  try {
    const { redis } = await import("@/lib/redis");
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (err) {
    // Non-blocking Redis fallback
  }

  const whereClause: Prisma.IncidentWhereInput = { organizationId };

  if (status && status !== "ALL") {
    whereClause.status = status as IncidentStatus;
  }

  const [incidents, stats] = await Promise.all([
    prisma.incident.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        service: true,
        severity: true,
        status: true,
        createdAt: true,
        fingerprint: true,
        description: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.incident.groupBy({
      by: ["status"],
      where: { organizationId },
      _count: { id: true },
    }),
  ]);

  const openCount = stats.find((s: any) => s.status === "OPEN")?._count.id || 0;
  const investigatingCount =
    stats.find((s: any) => s.status === "INVESTIGATING")?._count.id || 0;
  const resolvedCount =
    stats.find((s: any) => s.status === "RESOLVED")?._count.id || 0;
  const totalCount = stats.reduce(
    (acc: number, curr: any) => acc + curr._count.id,
    0,
  );

  const counts = {
    ALL: totalCount,
    OPEN: openCount,
    INVESTIGATING: investigatingCount,
    RESOLVED: resolvedCount,
  };

  const result = { incidents, counts };

  // 2. Cache in Redis (60s TTL)
  try {
    const { redis } = await import("@/lib/redis");
    await redis.setex(cacheKey, 60, JSON.stringify(result));
  } catch (err) {
    // Non-blocking Redis write fallback
  }

  return result;
}

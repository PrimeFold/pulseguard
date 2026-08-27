import { prisma } from "@/lib/auth";
import { generateErrorFingerprint } from "@/lib/telemetry";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { redis } from "@/lib/redis";
import { z } from "zod";

const ANOMALY_WINDOW_MINUTES = 3;
const ERROR_THRESHOLD = 3;

const logSchema = z.object({
  level: z.string().optional(),
  severity: z.string().optional(),
  message: z.string().optional(),
  msg: z.string().optional(),
  service: z.string().optional(),
  source: z.string().optional(),
  timestamp: z.string().or(z.date()).or(z.number()).optional(),
  metadata: z.record(z.string(), z.any()).optional().default({}),
});

const payloadSchema = z.union([logSchema, z.array(logSchema)]);

export async function POST(req: NextRequest) {
  try {
    const rateLimit = await checkRateLimit(req);
    if (!rateLimit.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const authHeader = req.headers.get("authorization");
    const xApiKey = req.headers.get("x-api-key");
    const searchParams = req.nextUrl.searchParams;
    const apiKey =
      (authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null) ||
      xApiKey ||
      searchParams.get("apiKey");

    if (!apiKey) {
      return NextResponse.json({ error: "Missing API Key" }, { status: 401 });
    }

    //Verifying the organization against the API KEY..
    const org = await prisma.organization.findFirst({
      where: { id: apiKey },
    });

    if (!org) {
      return NextResponse.json({ error: "Invalid API Key" }, { status: 403 });
    }

    const rawBody = await req.json();
    const body = payloadSchema.parse(rawBody);
    const rawLogs = Array.isArray(body) ? body : [body];

    const processedLogs = rawLogs.map((log: any) => {
      const level = (log.level || log.severity || "INFO").toUpperCase();
      const message = String(log.message || log.msg || "");
      const service = log.service || log.source || "default-service";

      let fingerprint: string | null = null;
      let cleanPattern = message;

      if (level === "ERROR" || level === "FATAL") {
        const res = generateErrorFingerprint(service, message);
        fingerprint = res.fingerprint;
        cleanPattern = res.cleanPattern;
      }

      return {
        organizationId: org.id,
        service,
        level,
        message,
        fingerprint,
        cleanPattern,
        timestamp: log.timestamp ? new Date(log.timestamp) : new Date(),
        metadata: log.metadata || {},
      };
    });

    // 1. Group incoming error logs by fingerprint
    const errorGroups = new Map<string, typeof processedLogs>();

    for (const log of processedLogs) {
      if (log.fingerprint) {
        if (!errorGroups.has(log.fingerprint)) {
          errorGroups.set(log.fingerprint, []);
        }
        errorGroups.get(log.fingerprint)!.push(log);
      }
    }

    // 2. Classify against existing Incidents or create new ones
    const windowStart = new Date(
      Date.now() - ANOMALY_WINDOW_MINUTES * 60 * 1000,
    );

    for (const [fingerprint, logs] of errorGroups.entries()) {
      const sample = logs[0];
      const cacheKey = `incident:${org.id}:${fingerprint}`;

      // Check if an open incident already tracks this specific error signature
      let incidentId = await redis.get(cacheKey);
      let incident = incidentId ? { id: incidentId } : null;

      if (!incident) {
        incident = await prisma.incident.findFirst({
          where: {
            organizationId: org.id,
            fingerprint,
            status: "TRIGGERED",
          },
          select: { id: true }
        });

        if (incident) {
          await redis.setex(cacheKey, 300, incident.id); // Cache for 5 mins
        }
      }

      if (!incident) {
        // Count previous occurrences of this fingerprint within the window
        const pastCount = await prisma.telemetryLog.count({
          where: {
            organizationId: org.id,
            fingerprint,
            timestamp: { gte: windowStart },
          },
        });

        if (pastCount + logs.length >= ERROR_THRESHOLD) {
          // Open a new, cleanly classified incident..
          incident = await prisma.incident.create({
            data: {
              organizationId: org.id,
              service: sample.service,
              fingerprint,
              title: `${sample.service}: ${sample.cleanPattern.slice(0, 75)}...`,
              description: `Automated incident triggered by error cluster.\nSignature: \`${sample.cleanPattern}\``,
              severity: "HIGH",
              status: "TRIGGERED",
              errorPayload: sample.metadata || { message: sample.message },
            },
            select: { id: true }
          });
          await redis.setex(cacheKey, 300, incident.id);
        }
      }

      // Link logs to the incident if one exists
      if (incident && incident.id) {
        const incidentIdToLink = incident.id;
        logs.forEach((l) => {
          (l as any).incidentId = incidentIdToLink;
        });
      }
    }

    // 3. Batch insert the classified logs
    await prisma.telemetryLog.createMany({
      data: processedLogs.map(({ cleanPattern, ...log }) => log),
    });

    return NextResponse.json({
      success: true,
      ingested: processedLogs.length,
      classifiedErrors: errorGroups.size,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

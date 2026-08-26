import { Prisma } from "@/lib/generated/prisma/client";
import type { Level } from "@/lib/generated/prisma/client";

export interface telemetryLog {
    organizationId:string;
    service:string;
    level:Level;
    message:string;
    metadata?:Prisma.InputJsonValue;
    timestamp:Date;
}

export interface GetTelemetryParams {
  organizationId: string;
  searchQuery?: string;
  service?: string;
  level?: Level;
  fromDate?: Date;
  toDate?: Date;
  page?: number;
  limit?: number;
}

export interface NormalizedLog {
  level: 'ERROR' | 'FATAL' | 'WARN' | 'INFO' | 'DEBUG';
  message: string;
  service: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
}
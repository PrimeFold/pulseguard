import { Prisma } from "@/lib/generated/prisma/client";

export interface telemetryLog {
    organizationId:string;
    service:string;
    level:string;
    message:string;
    metadata?:Prisma.InputJsonValue;
    timestamp:Date;
}

export interface GetTelemetryParams {
  organizationId: string;
  searchQuery?: string;
  service?: string;
  level?: "ERROR" | "WARN" | "INFO";
  fromDate?: Date;
  toDate?: Date;
  page?: number;
  limit?: number;
}

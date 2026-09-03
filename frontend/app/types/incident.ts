import { Prisma } from "@/lib/generated/prisma/client";
import { Severity } from "@/lib/generated/prisma/enums";

export interface ResolveIncidentParams {
  incidentId: string;
  rootCauseAnalysis: string;
  organizationId: string;
}

export interface IncidentParams {
  title: string;
  service: string;
  severity: Severity;
  errorPayload: Prisma.InputJsonValue;
  organizationId: string;
}

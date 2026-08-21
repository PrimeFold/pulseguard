import { Severity } from "@/lib/generated/prisma/enums";

export interface ResolveIncidentParams {
  incidentId: string;
  rootCauseAnalysis: string;
  organizationId: string;
}

export interface createIncidentParams{
    title:string; 
    service:string;
    severity:Severity;
    errorPayload:Record<string,any>;
    organizationId:string
}
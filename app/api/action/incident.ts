import { prisma } from "@/lib/auth";
import { IngestDocument } from "./document";
import { revalidatePath } from "next/cache";
import { IncidentStatus, Severity } from "@/lib/generated/prisma/enums";
import { createIncidentParams, ResolveIncidentParams } from "@/app/types/incident";


export async function resolveIncidentAndEmbedRCA({incidentId,rootCauseAnalysis,organizationId}:ResolveIncidentParams){
    try {
        const incident = await prisma.incident.update({
            where:{
                id:incidentId,
            },
            data:{
                rootCauseAnalysis,
                organizationId,
                resolvedAt: new Date()
            }
        })

        await IngestDocument({
            organizationId,
            title:`Post-Mortem : ${incident.title} ${incident.service}`,
            type:`PAST_INCIDENT_RCA`,
            rawContent:rootCauseAnalysis,
            sourceUrl:`/dashboard/incidents/${incident.id}`
        });

        revalidatePath('/dashboard/incidents');
        revalidatePath('/dashboard/knowledge');

        return {
            success:true,
            incidentId:incident.id
        }

    } catch (error) {
        throw new Error((error as Error).message);
    }

}

export async  function createIncidentAction(data:createIncidentParams){
    try {
        const incident = await prisma.incident.create({
            data:{
                title:data.title,
                service: data.service,
                severity: data.severity,
                errorPayload: data.errorPayload,
                organizationId: data.organizationId,
                status: IncidentStatus.TRIGGERED
            }
        })


        revalidatePath('/dashboard/incidents')
        return incident;
    } catch (error) {
        throw new Error((error as Error).message)
    }
}

export async function updateIncidentStatus(incidentId:string,status:string){

}

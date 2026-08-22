import { prisma } from "@/lib/auth";
import { IngestDocument } from "./document";
import { revalidatePath } from "next/cache";
import { IncidentStatus } from "@/lib/generated/prisma/enums";
import { Prisma } from "@/lib/generated/prisma/client";
import { IncidentParams, ResolveIncidentParams } from "@/app/types/incident";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function resolveIncidentAndEmbedRCA({
  incidentId,
  rootCauseAnalysis,
  organizationId,
}: ResolveIncidentParams) {
  try {
    const incident = await prisma.incident.update({
      where: {
        id: incidentId,
      },
      data: {
        status: "RESOLVED",
        rootCauseAnalysis,
        organizationId,
        resolvedAt: new Date(),
      },
    }); //Kinda confused , how do I handle an error that happens fromt he db side lets say..

    await IngestDocument({
      organizationId,
      title: `Post-Mortem : ${incident.title} ${incident.service}`,
      type: `PAST_INCIDENT_RCA`,
      rawContent: rootCauseAnalysis,
      sourceUrl: `/dashboard/incidents/${incident.id}`,
    });

    revalidatePath("/dashboard/incidents");
    revalidatePath("/dashboard/knowledge");

    return {
      success: true,
      incidentId: incident.id,
      message:"Successfully resolved Incident and embedded RCA"
    };
  } catch (error) {
    return {
      success:false,
      message:(error as Error).message
    }
  }
}

export async function createIncidentAction(data: IncidentParams) {
  //As for now we can store these but with time we can poll the 'period' and delete the incidents
  // to free storage..
  try {
    const { title, service, severity, errorPayload, organizationId, status, id } =
      await prisma.incident.create({
        data: {
          title: data.title,
          service: data.service,
          severity: data.severity,
          errorPayload: data.errorPayload,
          organizationId: data.organizationId,
          status: IncidentStatus.TRIGGERED,
        },
      });

    const rcaResponse = await generateRca({
      title,
      service,
      severity,
      errorPayload,
      organizationId,
      incidentId:id
    });

    if(!rcaResponse.success){
      throw new Error("RCA couldn't be generated..")
    }



    revalidatePath("/dashboard/incidents");
    return {
      title,
      service,
      severity,
      status,
      errorPayload,
      organizationId
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
  incidentId
}: {
  title: string;
  service: string;
  severity: IncidentParams["severity"];
  errorPayload: Prisma.JsonValue;
  organizationId: string;
  incidentId:string;
}) {
  try {
    const googleTextModel = process.env.TEXT_MODEL;
    if (!googleTextModel) {
      throw new Error("Model not found");
    }

    const { output } = await generateText({
      model: google(googleTextModel),
      prompt: `
            You're an expert at analysing errors , issues , exceptions on frontend & backend systems of a web-application.
            An 'incident' is the information about the issues that happened in the application in a particular organistion ( team ).
            Your Job is to prepare a Neat , Accurate and working solution for the incident , Titled 'Root cause analysis' aka RCA.
            The incident information goes like this : 

            ------------------
            The ${title}
            ------------------
            Organisation-id : ${organizationId}
            Incident-id:${incidentId}
            Service : ${service}
            Severity : ${severity}
            Error-payload : ${JSON.stringify(errorPayload,null,2)}

            ---------------------------------------
            Also mention important nuances , caveats and trade-offs for this solution. - (IF EXISTS)

        `,
      maxRetries: 2,
    });

    if (!output.trim()) {
      throw new Error("failed to generate RCA");
    }

    const resolveResponse = await resolveIncidentAndEmbedRCA({incidentId,rootCauseAnalysis:output,organizationId})
    if(!resolveResponse.success || !resolveResponse.incidentId?.trim()){
      throw new Error(`${resolveResponse.message}`)
    }
    return {
      success: true,
      output,
      message:resolveResponse.message,
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
  incidentId: string,
  status: IncidentStatus,
) {
  try {
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

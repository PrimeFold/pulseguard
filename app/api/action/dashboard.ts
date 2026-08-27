'use server';

import { prisma } from "@/lib/auth";
import { requireIncidentAccess, requireOrganizationMembership } from '@/lib/authorization';


//Overall data fetching for the dashboard..
export async function getDashboardOverview(organizationId:string){
    await requireOrganizationMembership(organizationId);
    const DAYms = 24*60*60*1000;
    const [activeIncidents, errorCount24h , totalLogs , org] = await Promise.all([
        prisma.incident.findMany({
            where:{
                organizationId , 
                status:{
                    in : ['TRIGGERED','INVESTIGATING']
                }
            },
            orderBy:{createdAt:'asc'},
            take:5
        }),
        prisma.telemetryLog.count({
            where:{
                organizationId,
                level:{in : ['ERROR','FATAL']},
                timestamp:{gte : new Date(Date.now() - DAYms)},
            }
        }),
        prisma.telemetryLog.count({
            where:{
                organizationId,
                timestamp:{lte: new Date(Date.now()- DAYms)}
            }
        }),
        prisma.organization.findUnique({
            where:{
                id:organizationId,
            },
            select:{
                githubDefaultRepo:true,
                githubInstallationId:true,
                githubOwner:true,
                apiKeyDisplay:true
            }
        })
    ])
    return{
        activeIncidents,
        errorCount24h,
        totalLogs,
        isGithubConnected: Boolean(org?.githubInstallationId),
        githubRepo:org?.githubDefaultRepo,
        apiKey:org?.apiKeyDisplay || null,
    };
}

//fetches an incident by its id and organisation's id..
export async function getIncidentById(incidentId:string , organizationId:string){
    return requireIncidentAccess(incidentId, organizationId);
}

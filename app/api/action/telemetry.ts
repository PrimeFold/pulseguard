import { PaginationResponse } from "@/app/types/pagination";
import { GetTelemetryParams, telemetryLog } from "@/app/types/telemetry";
import { prisma } from "@/lib/auth";
import { Prisma, TelemetryLog } from "@/lib/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { useParams } from "next/navigation";

export async function logTelemetry(data:telemetryLog){
    const sanitizedMetadata = JSON.stringify(data.metadata);
    try {
        const telemetry = await prisma.telemetryLog.create({
            data:{
                organizationId:data.organizationId,
                service:data.service,
                level:data.level,
                message:data.message,
                metadata:sanitizedMetadata,
                timestamp:new Date()
            }
        })

        revalidatePath("/dashboard/telemetry")

        return {
            success:true,
            telemetry,
            message:"Telemetry successfully created !"
        }
    } catch (error) {
        return {
            success:false,
            message:(error as Error).message
        }
    }
}

export async function getTelemetryById(telemetryId:string){
    const id = useParams();
    try {
        const telemetry = await prisma.telemetryLog.findUnique({
            where:{
                id:telemetryId
            }
        })
        return {
            success:true,
            telemetry,
            message:`Fetched specific telemetry for id ${telemetryId}`
        }
    } catch (error) {
        return{
            success:false,
            message:(error as Error).message
        }
    }
}

export async function getTelemetry(
    {
        organizationId,
        searchQuery,
        service,
        level,
        fromDate,
        toDate,
        page = 1,
        limit = 8,
    }:GetTelemetryParams
):Promise<PaginationResponse<TelemetryLog>>{
    try {
        const skip = (page - 1)*limit;
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
          { message: { contains: searchQuery, mode: 'insensitive' } },
          { service: { contains: searchQuery, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, data] = await prisma.$transaction([
      prisma.telemetryLog.count({ where }),
      prisma.telemetryLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
        data,
        pagination:{
            total,
            page,
            limit,
            totalPages:Math.ceil(total/limit)
        }
    }


    } catch (error) {
        console.error('Failed to fetch telemetry logs:', error);
        throw new Error('Could not retrieve telemetry logs');
    }
}



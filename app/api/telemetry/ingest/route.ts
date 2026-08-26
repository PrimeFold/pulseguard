import { prisma } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

async function sha256(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(req:NextRequest){
    const rawKey = req.headers.get('x-api-key');
    if(!rawKey || !rawKey.startsWith('sk_live')){
        return NextResponse.json({error:"Missing or invalid API Key"}, { status:401});
    }

    //1.Hash incoming raw key using SHA-256
    const incomingHash = await sha256(rawKey);

    // 2. Direct lookup by unique hash in Postgres
    const org = await prisma.organization.findUnique({
        where:{apiKeyHash:incomingHash},
        select:{id:true}
    })

    if(!org){
        return NextResponse.json({error:'Unauthorized key'},{status:401});
    }

    return NextResponse.json({status:'ok',organizationId:org.id})
}




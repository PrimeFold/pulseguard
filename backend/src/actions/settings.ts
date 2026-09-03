'use server';

import { prisma } from "@/lib/auth";
import {
  requireOrganizationMembership,
  requireOrganizationRole,
} from '@/lib/authorization';

// Helper: Generates secure hex strings using modern standard Web Crypto
async function sha256(str:string):Promise<string>{
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256',data);
    const hashArray= Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b)=> b.toString(16).padStart(2,'0')).join('');
}

// Helper: Secure random string..
function generateRandomHex(byteCount: number): string {
  const bytes = new Uint8Array(byteCount);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function getSettingsData(organizationId:string){
    try {
        const { membership } = await requireOrganizationMembership(organizationId);
        const organization = await prisma.organization.findUnique({
            where:{
                id: organizationId,
            },
            select:{
                id:true,
                name:true,
                apiKeyDisplay:true,
                githubDefaultRepo:true,
                githubInstallationId:true,
                githubOwner:true
            }
        })
        if (!organization) throw new Error('Organization not found.');

        const role = membership.role;
        const canManageIntegrations = ['OWNER','ADMIN'].includes(role);

        return{
            organization,
            role,
            canManageIntegrations
        }
    } catch (error) {
        throw new Error((error as Error).message)
    }
}




export async function generateApiKey(organizationId:string){
    try {
        await requireOrganizationRole(organizationId, ['OWNER', 'ADMIN']);

        const rawKey = `sk_live_${generateRandomHex(24)}`;
        const keyHash = await sha256(rawKey);
        const display = `${rawKey.slice(0,12)}...${rawKey.slice(-4)}`;

        await prisma.organization.update({
            where:{
                id:organizationId
            },
            data:{
                apiKeyDisplay:display,
                apiKeyHash:keyHash
            }
        })

        return{
            rawKey,
            keyHash
        }

    } catch (error) {
        throw new Error((error as Error).message)
    }
}

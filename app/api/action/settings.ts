import { prisma } from "@/lib/auth";
import { getUser } from "@/lib/session";



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
    const user = await getUser();
    if(!user){
        throw new Error("Unauthorized user");
    }
    try {
        //Verify membership and fetch role..
        const membership = await prisma.organizationMember.findFirst({
            where:{
                userId:user.id,
                organizationId,
            },
            include:{
                organization:{
                    select:{
                        id:true,
                        name:true,
                        apiKey:true,
                        githubDefaultRepo:true,
                        githubInstallationId:true,
                        githubOwner:true
                    }
                }
            }
        })
        if(!membership) throw new Error('You do not belong to this organisation..');
        const role = membership.role || "MEMBER";
        const canManageIntegrations = ['OWNER','ADMIN'].includes(role);

        return{
            organization:membership.organization,
            role,
            canManageIntegrations
        }
    } catch (error) {
        throw new Error((error as Error).message)
    }
}




export async function generateApiKey(organizationId:string){
    const user = await getUser();
    if(!user) throw new Error('Unauthorized..');
    try {
        const membership = await prisma.organizationMember.findFirst({
            where:{
                userId:user.id,
                organizationId
            }
        })

        if(!membership) throw new Error("You do not belong to this organisation..")

        const role = (membership as any).role || 'MEMBER';

        if(!['OWNER','ADMIN'].includes(role)){
            throw new Error("Only admins and owners can regenerate API keys..")
        }

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


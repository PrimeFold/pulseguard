import {
  PaginationResponse,
  TeamPaginationResponse,
} from "@/app/types/pagination";
import { TeamParams } from "@/app/types/team";
import { prisma } from "@/lib/auth";
import { requireOrganizationMembership } from "@/lib/authorization";
import { OrganizationMember, Prisma } from "@/lib/generated/prisma/client";


export type OrganizationMemberWithUser = Prisma.OrganizationMemberGetPayload<{
  include:{
    user:{
      select:{
        id:true,
        name:true,
        email:true,
        image:true
      }
    }
  }
}>



export async function getTeamMembers({
  organizationId,
  page = 1,
  limit = 10,
  role,
  searchQuery,
}: TeamParams): Promise<TeamPaginationResponse<OrganizationMemberWithUser>> {
  try {
    const membership = await requireOrganizationMembership(organizationId);
    if (!membership) {
      throw new Error("You are not a part of this organisation");
    }
    const skip = (page - 1) * limit;

    const where: Prisma.OrganizationMemberWhereInput = {
      organizationId,
      ...(role && { role }),
      ...(searchQuery && {
        user: {
          OR: [
            { name: { contains: searchQuery, mode: "insensitive" } },
            { email: { contains: searchQuery, mode: "insensitive" } },
          ],
        },
      }),
    };

    const [total, data] = await prisma.$transaction([
      prisma.organizationMember.count({
        where: {
          organizationId,
        },
      }),
      prisma.organizationMember.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return {
      data,
      metadata: {
        page,
        total,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch team members..");
  }
}

/**
 * Updates a member's role within an organization (OWNER or ADMIN required).
 */
export async function updateMemberRole(params: {
  organizationId: string;
  targetUserId: string;
  newRole: "ADMIN" | "MEMBER" | "VIEWER";
}) {
  const { requireOrganizationRole } = await import("@/lib/authorization");
  await requireOrganizationRole(params.organizationId, ["OWNER", "ADMIN"]);

  const updated = await prisma.organizationMember.update({
    where: {
      userId_organizationId: {
        userId: params.targetUserId,
        organizationId: params.organizationId,
      },
    },
    data: {
      role: params.newRole as any,
    },
  });

  return { success: true, member: updated };
}

/**
 * Removes a member from an organization (OWNER or ADMIN required).
 */
export async function removeMemberFromOrg(params: {
  organizationId: string;
  targetUserId: string;
}) {
  const { requireOrganizationRole } = await import("@/lib/authorization");
  const callerAccess = await requireOrganizationRole(params.organizationId, ["OWNER", "ADMIN"]);

  // Prevent removing oneself if they are the only owner
  if (callerAccess.user.id === params.targetUserId && callerAccess.membership.role === "OWNER") {
    const ownerCount = await prisma.organizationMember.count({
      where: { organizationId: params.organizationId, role: "OWNER" },
    });
    if (ownerCount <= 1) {
      throw new Error("Cannot remove the last owner of the workspace.");
    }
  }

  await prisma.organizationMember.delete({
    where: {
      userId_organizationId: {
        userId: params.targetUserId,
        organizationId: params.organizationId,
      },
    },
  });

  return { success: true };
}


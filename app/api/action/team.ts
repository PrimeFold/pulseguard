import {
  PaginationResponse,
  TeamPaginationResponse,
} from "@/app/types/pagination";
import { TeamParams } from "@/app/types/team";
import { prisma } from "@/lib/auth";
import { requireOrganizationMembership } from "@/lib/authorization";
import { OrganizationMember, Prisma } from "@/lib/generated/prisma/client";

export async function getTeamMembers({
  organizationId,
  page = 1,
  limit = 10,
  role,
  searchQuery,
}: TeamParams): Promise<TeamPaginationResponse<OrganizationMember>> {
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

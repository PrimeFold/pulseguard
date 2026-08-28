"use server";

import { prisma } from "@/lib/auth";
import { getUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function createOrganization(data: { name: string; slug: string }) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(data.slug)) {
    throw new Error("Slug must only contain lowercase letters, numbers, and hyphens.");
  }

  // Check if slug is taken
  const existing = await prisma.organization.findUnique({
    where: { slug: data.slug }
  });
  if (existing) throw new Error("Workspace slug is already taken.");

  const org = await prisma.organization.create({
    data: {
      name: data.name,
      slug: data.slug,
      members: {
        create: {
          userId: user.id,
          role: "OWNER",
        }
      }
    }
  });

  revalidatePath("/workspaces");
  return { success: true, org };
}

export async function updateOrganization(data: { id: string; name: string }) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  // Verify membership & permissions
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: data.id,
        userId: user.id,
      }
    }
  });

  if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
    throw new Error("Unauthorized to update this workspace.");
  }

  const org = await prisma.organization.update({
    where: { id: data.id },
    data: { name: data.name },
  });

  revalidatePath(`/${org.slug}/settings`);
  revalidatePath("/workspaces");
  return { success: true, org };
}

export async function deleteOrganization(data: { id: string }) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: data.id,
        userId: user.id,
      }
    },
    include: { organization: true }
  });

  if (!membership || membership.role !== "OWNER") {
    throw new Error("Only the workspace owner can delete it.");
  }

  await prisma.organization.delete({
    where: { id: data.id }
  });

  revalidatePath("/workspaces");
  return { success: true };
}

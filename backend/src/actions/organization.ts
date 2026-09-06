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
      userId_organizationId: {
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
      userId_organizationId: {
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

export async function linkGithubInstallation(data: { organizationId: string; installationId: number }) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized. Please sign in to link GitHub." };
    }

    const membership = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          organizationId: data.organizationId,
          userId: user.id,
        }
      },
      include: { organization: true }
    });

    if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
      return { success: false, error: "Unauthorized. Only Organization Owners and Admins can configure GitHub integrations." };
    }

    let defaultRepoName: string | null = null;
    let defaultRepoOwner: string | null = null;

    try {
      const { getInstallationOctokit } = await import("@/lib/github");
      const octokit = getInstallationOctokit(data.installationId);
      const { data: reposData } = await octokit.rest.apps.listReposAccessibleToInstallation();
      const defaultRepo = reposData.repositories?.[0];
      if (defaultRepo) {
        defaultRepoName = defaultRepo.name;
        defaultRepoOwner = defaultRepo.owner?.login || null;
      }
    } catch (octokitErr: any) {
      console.error("Octokit error linking GitHub installation:", octokitErr);
      const statusMsg = octokitErr.status ? ` (Status ${octokitErr.status})` : "";
      return {
        success: false,
        error: `GitHub App Authentication failed${statusMsg}: ${octokitErr.message || "Integration not found"}. Please verify that GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY on Vercel match your GitHub App settings.`,
      };
    }

    const updatedOrg = await prisma.organization.update({
      where: { id: data.organizationId },
      data: {
        githubInstallationId: data.installationId,
        githubDefaultRepo: defaultRepoName,
        githubOwner: defaultRepoOwner,
      }
    });

    revalidatePath(`/${updatedOrg.slug}/settings`);
    revalidatePath(`/${updatedOrg.slug}`);
    revalidatePath("/workspaces");

    return {
      success: true,
      org: updatedOrg,
      repoName: defaultRepoName && defaultRepoOwner ? `${defaultRepoOwner}/${defaultRepoName}` : defaultRepoName,
    };
  } catch (err: any) {
    console.error("linkGithubInstallation server error:", err);
    return {
      success: false,
      error: err.message || "An unexpected error occurred while linking GitHub installation.",
    };
  }
}

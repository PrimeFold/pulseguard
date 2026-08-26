import { notFound, redirect } from "next/navigation";
import { getUser } from "./session";
import { prisma } from "./auth";


export async function getOrganizationAndMembership(slug: string) {
  const user = await getUser();
  if (!user) redirect('/login');

  const org = await prisma.organization.findUnique({
    where: { slug },
    include: {
      members: {
        where: { userId: user.id },
      },
    },
  });

  if (!org) notFound();

  // User is not part of this organization
  if (org.members.length === 0) {
    redirect('/workspaces?error=unauthorized');
  }

  return {
    org,
    membership: org.members[0],
    user,
  };
}
import { headers } from 'next/headers';
import type { Role } from '@/lib/generated/prisma/enums';
import { auth, prisma } from '@/lib/auth';

type RequestHeaders = Headers | undefined;

async function getRequestHeaders(requestHeaders?: RequestHeaders) {
  return requestHeaders ?? (await headers());
}

export async function requireAuthenticatedUser(requestHeaders?: RequestHeaders) {
  const session = await auth.api.getSession({
    headers: await getRequestHeaders(requestHeaders),
  });

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  return session.user;
}

export async function requireOrganizationMembership(
  organizationId: string,
  requestHeaders?: RequestHeaders,
) {
  const user = await requireAuthenticatedUser(requestHeaders);
  const membership = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId,
      },
    },
  });

  if (!membership) {
    throw new Error('You do not have access to this organization.');
  }

  return { user, membership };
}

export async function requireOrganizationRole(
  organizationId: string,
  allowedRoles: Role[],
  requestHeaders?: RequestHeaders,
) {
  const access = await requireOrganizationMembership(organizationId, requestHeaders);

  if (!allowedRoles.includes(access.membership.role)) {
    throw new Error('You do not have permission to perform this action.');
  }

  return access;
}

export async function requireIncidentAccess(
  incidentId: string,
  organizationId: string,
  requestHeaders?: RequestHeaders,
) {
  await requireOrganizationMembership(organizationId, requestHeaders);
  const incident = await prisma.incident.findFirst({
    where: { id: incidentId, organizationId },
  });

  if (!incident) {
    throw new Error('Incident not found.');
  }

  return incident;
}

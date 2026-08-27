import { describe, it, expect, vi, beforeEach } from "vitest";
import { 
  requireAuthenticatedUser, 
  requireOrganizationMembership, 
  requireOrganizationRole, 
  requireIncidentAccess 
} from "@/lib/authorization";
import { auth, prisma } from "@/lib/auth";

// Mock Auth API & Prisma
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
  prisma: {
    organizationMember: {
      findUnique: vi.fn(),
    },
    incident: {
      findFirst: vi.fn(),
    },
  },
}));

// Mock Next.js headers helper
vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

describe("Authentication & Authorization Gates (RBAC)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("requireAuthenticatedUser", () => {
    it("should successfully return user if session exists", async () => {
      const mockUser = { id: "user_123", email: "user@example.com", name: "SRE Dev" };
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: mockUser,
        session: { id: "session_1" },
      } as any);

      const user = await requireAuthenticatedUser(new Headers());
      expect(user).toEqual(mockUser);
    });

    it("should throw 'Unauthorized' if no active session is retrieved", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      await expect(
        requireAuthenticatedUser(new Headers())
      ).rejects.toThrow("Unauthorized");
    });
  });

  describe("requireOrganizationMembership (Multi-Tenant Isolation)", () => {
    it("should allow membership access if user belongs to organization", async () => {
      const mockUser = { id: "user_123", email: "user@example.com" };
      const mockMembership = { userId: "user_123", organizationId: "org_abc", role: "MEMBER" };

      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockUser } as any);
      vi.mocked(prisma.organizationMember.findUnique).mockResolvedValue(mockMembership as any);

      const access = await requireOrganizationMembership("org_abc", new Headers());
      expect(access.user).toEqual(mockUser);
      expect(access.membership).toEqual(mockMembership);
    });

    it("should throw error if user is logged in but doesn't belong to the workspace", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "user_123" } } as any);
      vi.mocked(prisma.organizationMember.findUnique).mockResolvedValue(null); // No membership

      await expect(
        requireOrganizationMembership("org_abc", new Headers())
      ).rejects.toThrow("You do not have access to this organization.");
    });
  });

  describe("requireOrganizationRole (Role-Based Access Control)", () => {
    const mockUser = { id: "user_123", email: "admin@example.com" };

    it("should ALLOW access to actions permitted for specified roles (e.g. ADMIN/OWNER)", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockUser } as any);
      vi.mocked(prisma.organizationMember.findUnique).mockResolvedValue({
        userId: "user_123",
        organizationId: "org_abc",
        role: "ADMIN",
      } as any);

      // Require ADMIN or OWNER role
      const access = await requireOrganizationRole("org_abc", ["ADMIN", "OWNER" as any], new Headers());
      expect(access.membership.role).toBe("ADMIN");
    });

    it("should BLOCK and throw if a regular MEMBER attempts to perform an ADMIN-only task", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockUser } as any);
      vi.mocked(prisma.organizationMember.findUnique).mockResolvedValue({
        userId: "user_123",
        organizationId: "org_abc",
        role: "MEMBER", // Lower privilege role
      } as any);

      // Attempt an ADMIN-only gate check
      await expect(
        requireOrganizationRole("org_abc", ["ADMIN", "OWNER" as any], new Headers())
      ).rejects.toThrow("You do not have permission to perform this action.");
    });
  });

  describe("requireIncidentAccess (Incident-Level Security)", () => {
    it("should allow accessing incident if it belongs to the active organization", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "user_123" } } as any);
      vi.mocked(prisma.organizationMember.findUnique).mockResolvedValue({
        userId: "user_123",
        organizationId: "org_abc",
      } as any);
      vi.mocked(prisma.incident.findFirst).mockResolvedValue({
        id: "inc_999",
        organizationId: "org_abc",
        title: "Server OOM Outage",
      } as any);

      const incident = await requireIncidentAccess("inc_999", "org_abc", new Headers());
      expect(incident.id).toBe("inc_999");
    });

    it("should block access and throw if incident doesn't exist or is mapped to another organization", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: "user_123" } } as any);
      vi.mocked(prisma.organizationMember.findUnique).mockResolvedValue({
        userId: "user_123",
        organizationId: "org_abc",
      } as any);
      vi.mocked(prisma.incident.findFirst).mockResolvedValue(null); // Incident not found in org_abc

      await expect(
        requireIncidentAccess("inc_999", "org_abc", new Headers())
      ).rejects.toThrow("Incident not found.");
    });
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST as createInvite } from "@/app/api/invites/route";
import { POST as acceptInvite } from "@/app/api/invites/accept/route";
import { prisma } from "@/lib/auth";
import { getUser } from "@/lib/session";
import { NextRequest } from "next/server";

// Mock Session & Prisma
vi.mock("@/lib/session", () => ({
  getUser: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  prisma: {
    organization: {
      findFirst: vi.fn(),
    },
    organizationMember: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    organizationInvite: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn((actions) => Promise.all(actions)),
  },
}));

describe("Workspace Invite & Accept Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/invites (Create Invite)", () => {
    it("should return 401 if user is not authenticated", async () => {
      vi.mocked(getUser).mockResolvedValue(null as any);

      const request = new NextRequest("http://localhost:3000/api/invites", {
        method: "POST",
        body: JSON.stringify({
          organizationId: "org_1",
          role: "MEMBER",
          invitedEmail: "guest@example.com",
        }),
      });

      const response = await createInvite(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 403 if user is not an OWNER or ADMIN in the organization", async () => {
      vi.mocked(getUser).mockResolvedValue({ id: "user_1", email: "test@example.com" } as any);
      vi.mocked(prisma.organizationMember.findUnique).mockResolvedValue({
        userId: "user_1",
        organizationId: "org_1",
        role: "MEMBER", // Non-admin/owner role
      } as any);

      const request = new NextRequest("http://localhost:3000/api/invites", {
        method: "POST",
        body: JSON.stringify({
          organizationId: "org_1",
          role: "MEMBER",
          invitedEmail: "guest@example.com",
        }),
      });

      const response = await createInvite(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain("Only owners and admins can invite members");
    });

    it("should generate a random token and return invitation url for owner/admin", async () => {
      vi.mocked(getUser).mockResolvedValue({ id: "user_1", email: "test@example.com" } as any);
      vi.mocked(prisma.organizationMember.findUnique).mockResolvedValue({
        userId: "user_1",
        organizationId: "org_1",
        role: "OWNER",
      } as any);
      vi.mocked(prisma.organizationInvite.create).mockResolvedValue({
        id: "invite_123",
        token: "mocked_random_token",
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      } as any);

      const request = new NextRequest("http://localhost:3000/api/invites", {
        method: "POST",
        body: JSON.stringify({
          organizationId: "org_1",
          role: "MEMBER",
          invitedEmail: "guest@example.com",
        }),
      });

      const response = await createInvite(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.inviteUrl).toBeDefined();
      expect(prisma.organizationInvite.create).toHaveBeenCalled();
    });
  });

  describe("POST /api/invites/accept (Accept Invite)", () => {
    it("should block accept if token is invalid, expired, or already accepted", async () => {
      vi.mocked(getUser).mockResolvedValue({ id: "user_2", email: "guest@example.com" } as any);
      vi.mocked(prisma.organizationInvite.findUnique).mockResolvedValue({
        id: "invite_123",
        status: "ACCEPTED", // already accepted
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      } as any);

      const request = new NextRequest("http://localhost:3000/api/invites/accept", {
        method: "POST",
        body: JSON.stringify({ token: "expired_or_invalid_token" }),
      });

      const response = await acceptInvite(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Invite is invalid or has expired");
    });

    it("should restrict acceptance to matching invitedEmail if defined", async () => {
      vi.mocked(getUser).mockResolvedValue({ id: "user_2", email: "wrong-email@example.com" } as any);
      vi.mocked(prisma.organizationInvite.findUnique).mockResolvedValue({
        id: "invite_123",
        status: "PENDING",
        invitedEmail: "guest@example.com", // targeted email
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      } as any);

      const request = new NextRequest("http://localhost:3000/api/invites/accept", {
        method: "POST",
        body: JSON.stringify({ token: "token_123" }),
      });

      const response = await acceptInvite(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain("This invite wasn't meant for You");
    });

    it("should accept invite, create/update membership, and update status to ACCEPTED", async () => {
      vi.mocked(getUser).mockResolvedValue({ id: "user_2", email: "guest@example.com" } as any);
      vi.mocked(prisma.organizationInvite.findUnique).mockResolvedValue({
        id: "invite_123",
        status: "PENDING",
        invitedEmail: "guest@example.com",
        organizationId: "org_1",
        role: "MEMBER",
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      } as any);

      const request = new NextRequest("http://localhost:3000/api/invites/accept", {
        method: "POST",
        body: JSON.stringify({ token: "token_123" }),
      });

      const response = await acceptInvite(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.organizationId).toBe("org_1");
      expect(prisma.organizationMember.upsert).toHaveBeenCalled();
      expect(prisma.organizationInvite.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "invite_123" },
          data: { status: "ACCEPTED" },
        })
      );
    });
  });
});

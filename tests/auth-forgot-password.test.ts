import { describe, it, expect, vi } from "vitest";
import { auth } from "@/lib/auth";

describe("Forgot / Reset Password Flow", () => {
  it("successfully triggers request-password-reset via auth handler", async () => {
    const request = new Request("http://localhost:3000/api/auth/request-password-reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "me123@gmail.com",
        redirectTo: "/reset-password",
      }),
    });

    const response = await auth.handler(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.status).toBe(true);
    expect(data.message).toBeDefined();
  });

  it("handles password reset initiation for non-existent email gracefully without leaking user enumeration", async () => {
    const request = new Request("http://localhost:3000/api/auth/request-password-reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "nonexistent.user.12399@pulseguard.io",
        redirectTo: "/reset-password",
      }),
    });

    const response = await auth.handler(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.status).toBe(true);
  });

  it("rejects reset-password attempt when token is invalid or missing", async () => {
    const request = new Request("http://localhost:3000/api/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        newPassword: "NewSecurePassword123!",
        token: "invalid-token-abc-123",
      }),
    });

    const response = await auth.handler(request);
    expect(response.status).toBeGreaterThanOrEqual(400);
  });
});

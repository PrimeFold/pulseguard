import { describe, it, expect } from "vitest";
import { generateErrorFingerprint } from "@/lib/telemetry";

describe("Telemetry Ingestion & Fingerprinting Logic", () => {
  it("should normalize UUIDs to <UUID> wildcard", () => {
    const error1 = "Failed to fetch user session for user 123e4567-e89b-12d3-a456-426614174000";
    const error2 = "Failed to fetch user session for user 987f6543-e21b-32d1-b654-123456789abc";

    const res1 = generateErrorFingerprint("user-service", error1);
    const res2 = generateErrorFingerprint("user-service", error2);

    expect(res1.cleanPattern).toBe("Failed to fetch user session for user <UUID>");
    expect(res2.cleanPattern).toBe("Failed to fetch user session for user <UUID>");
    expect(res1.fingerprint).toBe(res2.fingerprint);
  });

  it("should normalize IP addresses and ports to <IP>", () => {
    const error = "Connection timeout trying to reach 192.168.1.100:5432";
    const res = generateErrorFingerprint("db-service", error);

    expect(res.cleanPattern).toBe("Connection timeout trying to reach <IP>");
  });

  it("should normalize ISO Timestamps to <TIMESTAMP>", () => {
    const error = "Operation failed at 2026-08-27T10:00:00.123Z due to timeout";
    const res = generateErrorFingerprint("worker-service", error);

    expect(res.cleanPattern).toBe("Operation failed at <TIMESTAMP> due to timeout");
  });

  it("should normalize numbers to <NUM>", () => {
    const error = "Query batch size of 500 exceeded database maximum of 200";
    const res = generateErrorFingerprint("api-service", error);

    expect(res.cleanPattern).toBe("Query batch size of <NUM> exceeded database maximum of <NUM>");
  });

  it("should generate deterministic fingerprints regardless of casing in service names", () => {
    const error = "Fatal out of memory error";
    const res1 = generateErrorFingerprint("App-Service", error);
    const res2 = generateErrorFingerprint("App-Service", error);

    expect(res1.fingerprint).toBe(res2.fingerprint);
  });
});

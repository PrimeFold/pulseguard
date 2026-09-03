import { createHash } from "crypto";

/**
 * Strips dynamic variables (UUIDs, IDs, IP addresses, timestamps, hashes)
 * to group identical root cause patterns together...
 */


export function generateErrorFingerprint(
  service: string,
  message: string,
): { fingerprint: string; cleanPattern: string } {
  const cleanPattern = message
    // Replace UUIDs
    .replace(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
      "<UUID>",
    )
    // Replace hex hashes/tokens
    .replace(/\b[0-9a-f]{24,64}\b/gi, "<HEX>")
    // Replace IP addresses & ports
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?\b/g, "<IP>")
    // Replace ISO timestamps
    .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?/g, "<TIMESTAMP>")
    // Replace numeric IDs (e.g. user_12345 or id=4992)
    .replace(/\b\d+\b/g, "<NUM>")
    .trim();

  // Create deterministic hash
  const hash = createHash("sha256")
    .update(`${service}:${cleanPattern}`)
    .digest("hex")
    .substring(0, 16); // 16-char clean hash

  return { fingerprint: hash, cleanPattern };
}

import Redis from "ioredis";

const globalForRedis = global as unknown as { redis: Redis };

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const redis =
  globalForRedis.redis ||
  new Redis(redisUrl, {
    connectTimeout: 10000,
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
    retryStrategy(times) {
      const delay = Math.min(times * 100, 3000);
      return delay;
    },
    // If using rediss:// (TLS), ensure proper TLS settings
    ...(redisUrl.startsWith("rediss://")
      ? {
          tls: {
            rejectUnauthorized: false,
          },
        }
      : {}),
  });

// Attach error listener to prevent Node.js unhandled error event warnings on transient socket reconnects
redis.on("error", (err) => {
  if (process.env.NODE_ENV === "development") {
    // Gracefully capture transient socket reconnects
    // (e.g. idle timeout disconnects from cloud Redis/Upstash)
  }
});

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

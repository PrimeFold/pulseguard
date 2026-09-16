try {
  require("dotenv/config");
} catch {
  // Ignore missing dotenv in root
}
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    alias: {
      '@/lib/ai': path.resolve(__dirname, './backend/src/lib/ai'),
      '@/lib/auth': path.resolve(__dirname, './backend/src/lib/auth'),
      '@/lib/redis': path.resolve(__dirname, './backend/src/lib/redis'),
      '@/lib/telemetry': path.resolve(__dirname, './frontend/lib/telemetry'),
      '@/lib/authorization': path.resolve(__dirname, './backend/src/lib/authorization'),
      '@/lib/github': path.resolve(__dirname, './backend/src/lib/github'),
      '@/app/api/action': path.resolve(__dirname, './backend/src/actions'),
      '@': path.resolve(__dirname, './frontend'),
    },
    setupFiles: [],
  },
});

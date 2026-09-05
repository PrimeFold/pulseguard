# PulseGuard

PulseGuard is a self-hosted, multi-tenant incident response platform. It acts as an automated SRE console that ingests raw telemetry logs, clusters related errors, consults organizational runbooks via semantic search, and deploys sandboxed AI agents to diagnose outages and submit Pull Request hotfixes.

---

## ⚡ System Architecture

```
                                  +-----------------------------+
                                  |   Microservice Log Stream   |
                                  +--------------+--------------+
                                                 |
                                                 | HTTP POST
                                                 v
                                  +--------------+--------------+
                                  |   Ingest API & Rate Limit   |
                                  +--------------+--------------+
                                                 |
                                                 | SHA-256 Fingerprint
                                                 v
                                  +--------------+--------------+
                                  |    Redis Slide-Window Cache |
                                  +--------------+--------------+
                                                 |
                                                 | Trigger (>= 3 errors / 3 mins)
                                                 v
                                  +--------------+--------------+
                                  |   Incident War Room Active  |
                                  +--------------+--------------+
                                                 |
                   +-----------------------------+-----------------------------+
                   |                             |                             |
                   v                             v                             v
     +-------------+-------------+ +-------------+-------------+ +-------------+-------------+
     |      pgvector RAG         | |       GitHub Context      | |     Multi-Provider AI     |
     |  (Semantic Chunk Search)  | |  (Repo File Inspection)   | |  (Dynamic model resolver) |
     +---------------------------+ +-------------+-------------+ +-------------+-------------+
                                                 |
                                                 | Propose Hotfix
                                                 v
                                  +--------------+--------------+
                                  |   Human-in-the-Loop Gate    |
                                  +--------------+--------------+
                                                 |
                                                 | Approve & Commit
                                                 v
                                  +--------------+--------------+
                                  |    Automated Pull Request   |
                                  +-----------------------------+
```

---

## 🛠️ Feature Modules & Core Subsystems

### 1. Ingestion Engine & Log Fingerprinting

- **Signature Extraction:** Converts high-frequency, dynamic stack traces into static signatures using regex parsing (scrubbing UUIDs, IPv4/IPv6 addresses, hex tokens, timestamps, and numbers) and hashing them using SHA-256.
- **Sliding-Window Clustering:** Aggregates identical log signatures inside Redis. An incident War Room is triggered only when the error count passes the threshold of 3 errors in 3 minutes, shielding engineers from alert fatigue.
- **Auto-Pruning TTL:** Automatically runs an asynchronous, non-blocking PostgreSQL clean up routine to remove logs older than 7 days, maintaining a lean database footprint.

### 2. Multi-Provider AI Engine (BYOM)

- **Dynamic Decryption:** Organizations supply their own API keys for AI providers (Google, Anthropic, OpenAI, Groq, OpenRouter). Keys are encrypted at rest via symmetric AES-256-CBC and decrypted in memory.
- **Model Discovery:** Resolves active models directly from provider endpoints, caching the options in Redis for 24 hours.

### 3. Runbook Knowledge Base (RAG)

- **pgvector Indexing:** Chunks PDF and Markdown runbooks into 600-character blocks (with 60-character overlaps) and generates text embeddings.
- **Semantic Retrieval:** Queries PostgreSQL using cosine similarity (`<=>`) to fetch runbook instructions and injects them as active context into the SRE agent's system prompt.

### 4. Git Automation & Approvals

- **Octokit Branch Dispatch:** Automates the creation of fix branches and commits updated files using base64 encoding.
- **Human-in-the-Loop Security:** The AI agent operates in a read-only context. Code modifications are presented as diff cards inside the War Room chat; write operations to repository branches are blocked until an `OWNER` or `ADMIN` clicks "Approve & Open PR".

---

## 📁 Repository Directory Map

```
├── app/
│   ├── (auth)/                # Public Signup and Login
│   ├── (protected)/           # Multi-Tenant Workspace Shell
│   │   ├── workspaces/        # Workspace Hub (Select/Create Org & User profile settings)
│   │   └── [orgSlug]/         # Dynamic Organization console
│   │       ├── incidents/     # Active incident war rooms
│   │       ├── telemetry/     # Live log explorer
│   │       └── settings/      # Workspace members (RBAC) and AI BYOM setups
│   └── api/                   # Telemetry ingest, agent stream, invites, and webhooks
│
├── components/                # Reusable React components (Vercel flat theme)
├── lib/                       # Core utilities (AES encryption, RAG, auth, github)
├── prisma/                    # Database models and pgvector schemas
└── tests/                     # Unit and integration test coverage (Vitest)
```

---

## 🚀 Setup & Local Deployment

### 1. Environment Configuration

Create a `.env` file at the root. Follow the schema defined below:

```env
# Database Connection (pgvector enabled)
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<db_name>?schema=public"

# Redis Cache URI
REDIS_URL="redis://<host>:<port>"

# Better Auth Configuration
BETTER_AUTH_SECRET="<your_auth_secret_key>"
BETTER_AUTH_URL="http://localhost:3000"

# GitHub App Integration Credentials
GITHUB_APP_ID="<your_github_app_id>"
GITHUB_APP_PRIVATE_KEY="<your_github_app_private_key>"
NEXT_PUBLIC_GITHUB_APP_SLUG="<your_github_app_slug>"
```

### 2. Initialization & Boot

Install packages, synchronize database models, and start the local compiler:

```bash
# 1. Install dependencies
bun install

# 2. Sync database schemas and generate Prisma client
bunx prisma db push
bunx prisma generate

# 3. Launch Next.js development server
bun run dev
```

### 3. Run the Test Suites

Validate key normalization, encryption logic, RBAC scopes, and GitHub mocking configurations using the Vitest runner:

```bash
bun run test
```

---

## 🔒 Access Control Matrix (RBAC)

Tenant boundaries and privileges are strictly isolated on the server level:

| Action                        | Allowed Roles                        | Verification Security Check                          |
| :---------------------------- | :----------------------------------- | :--------------------------------------------------- |
| **Ingest Logs**               | API Client                           | Matches `x-api-key` header to active organization    |
| **War Room Access**           | `OWNER`, `ADMIN`, `MEMBER`, `VIEWER` | `requireOrganizationMembership(orgId)`               |
| **Manage AI Provider Keys**   | `OWNER`, `ADMIN`                     | `requireOrganizationRole(orgId, ['OWNER', 'ADMIN'])` |
| **Team Management / Invites** | `OWNER`, `ADMIN`                     | `requireOrganizationRole(orgId, ['OWNER', 'ADMIN'])` |
| **Approve Git PR Dispatch**   | `OWNER`, `ADMIN`                     | `requireOrganizationRole(orgId, ['OWNER', 'ADMIN'])` |

---

## 🛠️ Troubleshooting & Technical Notes

### 1. AI Tool Schema Validation (`Date` vs. ISO-8601 String)

- **Issue:** Vercel AI SDK throws `[ZodError]: Invalid input: expected string, received Date at path: ["timestamp"]` when the agent executes `query_telemetry_logs`.
- **Cause:** The AI SDK strictly validates tool outputs against JSON-serializable primitives. Prisma queries return native JavaScript `Date` objects for `DateTime` fields.
- **Solution:** All tool executions in `lib/ai/tools.ts` explicitly sanitize timestamps using `toISOString()`:
  ```ts
  timestamp: log.timestamp instanceof Date
    ? log.timestamp.toISOString()
    : String(log.timestamp);
  ```

### 2. Google Gemini Embedding Model Migration

- **Issue:** `models/text-embedding-004 is not found for API version v1beta, or is not supported for embedContent`.
- **Cause:** Google's v1beta Gemini endpoint deprecated the `text-embedding-004` model identifier and replaced it with `gemini-embedding-001`.
- **Solution:** `lib/ai/provider.ts` and `app/api/action/embedding.ts` normalize embedding model resolution to `gemini-embedding-001`.

### 3. War Room Multi-Turn Chat Locking

- **Issue:** Chat input and quick action chips become disabled after a single turn.
- **Cause:** UI input states checked `disabled={status !== "ready"}`. Any stream transition or error status left the input permanently locked.
- **Solution:** Switched to `isBusy = status === "submitted" || status === "streaming"` in `components/incidents/WarRoomChat.tsx`, allowing continuous conversation and providing an interactive `RETRY LAST` button on error.

### 4. Cloud Redis Idle Socket Disconnects

- **Issue:** `[ioredis] Unhandled error event: AggregateError` in terminal logs.
- **Cause:** Managed Redis services (e.g. Upstash) automatically terminate idle sockets after 30–60s. Node's EventEmitter flags this if no error listener is attached.
- **Solution:** Attached a non-blocking `redis.on("error", ...)` handler in `lib/redis.ts` to allow automatic background reconnection without dumping unhandled event stacks.

### 5. Elimination of Notification Polling Overhead

- **Issue:** Continuous `setInterval` short-polling hammered `/api/notifications` every 60s, spamming terminal/Vercel logs with `GET /api/notifications 200`, wasting database connections on idle tabs, and throwing `net::ERR_CONNECTION_REFUSED` / `Failed to fetch` when the server was stopped.
- **Cause:** High-frequency timer polling for low-frequency events (organization invites and incident approvals).
- **Solution:** Replaced blind background polling in `components/notifications/NotificationPanel.tsx` with an On-Demand Event-Driven pattern:
  1. Single fetch on initial mount to establish the badge count.
  2. Background `setInterval` completely removed (zero idle server traffic).
  3. Lazy re-fetch triggered when the user actually clicks the Bell icon to toggle the panel.
  4. Single revalidation triggered when returning to the browser tab (`visibilitychange`).

### 6. AI SDK Monorepo Model Specification Incompatibilities

- **Issue:** `AI_UnsupportedModelVersionError: Unsupported model version v1 for provider "google.generative-ai". AI SDK 5 only supports specification version "v2"`.
- **Cause:** After monorepo segregation into `frontend` and `backend`, `frontend` ran `ai@7.x` (expecting v2/v3 model specifications) while `backend` instantiated models using `@ai-sdk/google@1.x` and `ai@3.x` (producing v1 model shapes).
- **Solution:** Synchronized all AI SDK dependencies across workspaces. Upgraded tool definitions in `backend/src/lib/ai/tools.ts` from deprecated `parameters` to the standard `inputSchema` property.

### 7. Vector Database Dimensionality Inconsistencies (`pgvector`)

- **Issue:** `Raw query failed. Code: 22000. Message: expected 736 dimensions, not 3072`.
- **Cause:** PostgreSQL schema defined `DocumentChunk.embedding` with a fixed column width of `vector(736)`, while modern embedding providers output larger matrices (such as 3072 from large models).
- **Solution:** Applied Matryoshka Representation Learning (MRL) truncation (`.slice(0, 736)`) across document ingestion and semantic search queries, eliminating destructive database schema migrations while maintaining semantic clustering accuracy.

### 8. Client Auth Origin Resolution in Production (Vercel)

- **Issue:** `POST http://localhost:3000/api/auth/sign-in/email net::ERR_CONNECTION_REFUSED` in live Vercel deployments.
- **Cause:** `auth-client.ts` had a hardcoded `|| "http://localhost:3000"` fallback which the browser used when server environment variables were not exposed with `NEXT_PUBLIC_`.
- **Solution:** Initialized `createAuthClient()` with no hardcoded fallback, allowing Better Auth to infer and use `window.location.origin` natively in the client.

### 9. Workspace Monorepo `.env` Discovery

- **Issue:** `PrismaClientKnownRequestError: ECONNREFUSED` on database queries during local development.
- **Cause:** In an npm workspaces layout, Next.js starts from the `frontend/` directory and only reads environment files in its own directory, ignoring the root `.env`.
- **Solution:** Mirrored the environment configuration into `frontend/.env` with explicit `NEXT_PUBLIC_` prefixes for client-facing variables (such as `NEXT_PUBLIC_GITHUB_APP_SLUG`).

### 10. Mobile Viewport 980px Emulation & Responsive Typography Scaling

- **Issue:** On mobile and tablet viewports, the interface appeared miniature, zoomed out, and horizontally clipped. The desktop sidebar occupied ~70% of phone screens, and incident diagnostics/payloads were cut off.
- **Cause:** In Next.js 14+ App Router, omitting `export const viewport: Viewport` in `layout.tsx` causes mobile WebKit/Blink browsers to simulate a 980px desktop screen, scaling the page down to fit. Additionally, primary labels used micro-utilities (`text-[9px]`, `text-[10px]`), and two-column SRE war rooms had no mobile tab/drawer strategy.
- **Solution:** Exported `width: "device-width", initialScale: 1` in `frontend/app/layout.tsx`, implemented a responsive slide-out mobile drawer in `DashboardShell.tsx`, converted metric strips into responsive 2x2 to 4x1 grids, added segmented mobile controls for SRE War Room (`WarRoomClientContainer`), scaled typography to crisp `text-xs`/`text-sm` baselines, and built an aerospace-grade cybernetic HUD loader (`GlobalLoader.tsx`).


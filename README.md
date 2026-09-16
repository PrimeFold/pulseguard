<div align="center">

# ⚡ PulseGuard

### *Autonomous Site Reliability Engineering & Multi-Tenant Incident Response Platform*

[![Next.js](https://img.shields.io/badge/Next.js-16.3-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-1.4-000000?style=for-the-badge&logo=bun&logoColor=F9F1E1)](https://bun.sh/)
[![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/pgvector-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://github.com/pgvector/pgvector)
[![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Vercel AI SDK](https://img.shields.io/badge/Vercel_AI_SDK-5.0-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://sdk.vercel.ai/)

<br />

PulseGuard is a self-hosted, multi-tenant incident response platform. It acts as an automated SRE console that ingests raw telemetry logs, clusters related errors, consults organizational runbooks via semantic vector search, and deploys sandboxed AI agents to diagnose production outages and submit Pull Request hotfixes.

</div>

---

## 📽️ System Demo Video

<!-- 16:9 Aspect Ratio 1080p Video Placeholder -->
<div align="center">
  <a href="#-system-demo-video">
    <img src="https://placehold.co/1920x1080/09090b/10b981?text=%E2%96%B6+PULSEGUARD+DEMO+VIDEO+(16%3A9+1080p)+%7C+Organization+Console+%E2%9E%94+SRE+AI+War+Room+%E2%9E%94+Telemetry+Retrieval" alt="PulseGuard SRE AI War Room 1080p Video Demo" width="100%" style="border-radius: 8px; border: 1px solid #27272a; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);" />
  </a>
  <p align="center">
    <sub><strong>🎥 Demo Walkthrough (16:9 1080p):</strong> Navigating through the Organization console to the SRE AI War Room, querying live error telemetry, inspecting runbook matches, and generating automated hotfix patches.</sub>
  </p>
</div>

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
- **Auto-Pruning TTL:** Automatically runs an asynchronous, non-blocking PostgreSQL cleanup routine to remove logs older than 7 days, maintaining a lean database footprint.

### 2. Multi-Provider AI Engine (BYOM)
- **Dynamic Decryption:** Organizations supply their own API keys for AI providers (Google, Anthropic, OpenAI, Groq, OpenRouter). Keys are encrypted at rest via symmetric AES-256-CBC and decrypted in memory.
- **Model Discovery:** Resolves active models directly from provider endpoints, caching options in Redis for 24 hours.

### 3. Runbook Knowledge Base (RAG)
- **pgvector Indexing:** Chunks PDF and Markdown runbooks into 600-character blocks (with 60-character overlaps) and generates text embeddings.
- **Semantic Retrieval:** Queries PostgreSQL using cosine similarity (`<=>`) to fetch runbook instructions and injects them as active context into the SRE agent's system prompt.

### 4. Git Automation & Approvals
- **Octokit Branch Dispatch:** Automates the creation of fix branches and commits updated files using base64 encoding.
- **Human-in-the-Loop Security:** The AI agent operates in a read-only context. Code modifications are presented as diff cards inside the War Room chat; write operations to repository branches are blocked until an `OWNER` or `ADMIN` approves.

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
│   │       ├── ingestion/     # Endpoint credentials & multi-platform integration snippets
│   │       └── settings/      # Workspace members (RBAC) and AI BYOM setups
│   └── api/                   # Telemetry ingest, agent stream, invites, and webhooks
│
├── components/                # Reusable React components (Vercel flat cybernetic theme)
├── lib/                       # Core utilities (AES encryption, RAG, auth, github)
├── prisma/                    # Database models and pgvector schemas
└── tests/                     # Unit and integration test coverage (Vitest)
```

---

## 🚀 Setup & Local Deployment

### 1. Environment Configuration

Create a `.env` file at the repository root and in `frontend/.env`:

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

Install packages, synchronize database models, and start the development server:

```bash
# 1. Install dependencies using Bun
bun install

# 2. Sync database schemas and generate Prisma client
bunx prisma db push
bunx prisma generate

# 3. Launch Next.js development server
bun run dev
```

### 3. Run Test Suites

Validate key normalization, encryption logic, RBAC scopes, and GitHub mocking configurations:

```bash
bun run test
```

---

## 🔒 Access Control Matrix (RBAC)

Tenant boundaries and privileges are strictly isolated on the server level:

| Action | Allowed Roles | Verification Security Check |
| :--- | :--- | :--- |
| **Ingest Logs** | API Client | Matches `x-api-key` header to active organization |
| **War Room Access** | `OWNER`, `ADMIN`, `MEMBER`, `VIEWER` | `requireOrganizationMembership(orgId)` |
| **Manage AI Provider Keys** | `OWNER`, `ADMIN` | `requireOrganizationRole(orgId, ['OWNER', 'ADMIN'])` |
| **Team Management / Invites** | `OWNER`, `ADMIN` | `requireOrganizationRole(orgId, ['OWNER', 'ADMIN'])` |
| **Approve Git PR Dispatch** | `OWNER`, `ADMIN` | `requireOrganizationRole(orgId, ['OWNER', 'ADMIN'])` |

---

## 🛠️ Troubleshooting & Technical Notes

### 1. AI Tool Schema Validation (`Date` vs. ISO-8601 String)
- **Issue:** Vercel AI SDK throws `[ZodError]: Invalid input: expected string, received Date at path: ["timestamp"]` when the agent executes `query_telemetry_logs`.
- **Cause:** The AI SDK strictly validates tool outputs against JSON-serializable primitives. Prisma queries return native JavaScript `Date` objects for `DateTime` fields.
- **Solution:** All tool executions in `lib/ai/tools.ts` explicitly sanitize timestamps using `toISOString()`.

### 2. Google Gemini Embedding Model Migration
- **Issue:** `models/text-embedding-004 is not found for API version v1beta`.
- **Cause:** Google's v1beta Gemini endpoint deprecated `text-embedding-004` and replaced it with `gemini-embedding-001`.
- **Solution:** `lib/ai/provider.ts` normalizes embedding model resolution to `gemini-embedding-001`.

### 3. War Room Multi-Turn Chat Locking
- **Issue:** Chat input and quick action chips become disabled after a single turn.
- **Cause:** UI input states checked `disabled={status !== "ready"}`. Any stream transition left the input locked.
- **Solution:** Switched to `isBusy = status === "submitted" || status === "streaming"` in `components/incidents/WarRoomChat.tsx`.

### 4. Cloud Redis Idle Socket Disconnects
- **Issue:** `[ioredis] Unhandled error event: AggregateError` in terminal logs.
- **Cause:** Managed Redis services (Upstash) terminate idle sockets after 30–60s.
- **Solution:** Attached a non-blocking `redis.on("error", ...)` handler in `lib/redis.ts` for background reconnection.

### 5. Elimination of Notification Polling Overhead
- **Issue:** Continuous `setInterval` short-polling hammered `/api/notifications` every 60s.
- **Cause:** High-frequency timer polling for low-frequency events.
- **Solution:** Replaced background polling in `components/notifications/NotificationPanel.tsx` with an On-Demand Event-Driven pattern.

### 6. AI SDK Monorepo Model Specification Incompatibilities
- **Issue:** `AI_UnsupportedModelVersionError: Unsupported model version v1 for provider "google.generative-ai"`.
- **Cause:** `frontend` ran `ai@7.x` while `backend` instantiated models using `@ai-sdk/google@1.x` and `ai@3.x`.
- **Solution:** Synchronized all AI SDK dependencies across workspaces and upgraded tool definitions to use `inputSchema`.

### 7. Vector Database Dimensionality Inconsistencies (`pgvector`)
- **Issue:** `Raw query failed. Code: 22000. Message: expected 736 dimensions, not 3072`.
- **Cause:** PostgreSQL schema defined `DocumentChunk.embedding` with a fixed column width of `vector(736)`.
- **Solution:** Applied Matryoshka Representation Learning (MRL) truncation (`.slice(0, 736)`) across document ingestion and search queries.

### 8. Client Auth Origin Resolution in Production (Vercel)
- **Issue:** `POST http://localhost:3000/api/auth/sign-in/email net::ERR_CONNECTION_REFUSED` in live Vercel deployments.
- **Cause:** `auth-client.ts` had a hardcoded `|| "http://localhost:3000"` fallback.
- **Solution:** Initialized `createAuthClient()` with no hardcoded fallback, letting Better Auth infer `window.location.origin`.

### 9. Workspace Monorepo `.env` Discovery
- **Issue:** `PrismaClientKnownRequestError: ECONNREFUSED` on database queries during local development.
- **Cause:** Next.js starts from `frontend/` and only reads environment files in its own directory.
- **Solution:** Mirrored configuration into `frontend/.env` with explicit `NEXT_PUBLIC_` prefixes.

### 10. Mobile Viewport 980px Emulation & Responsive Typography
- **Issue:** Interface appeared miniature and horizontally clipped on mobile viewports.
- **Cause:** Omitting `export const viewport: Viewport` in Next.js 14+ App Router causes mobile WebKit/Blink browsers to simulate a 980px desktop screen.
- **Solution:** Exported `width: "device-width", initialScale: 1` in `frontend/app/layout.tsx` and implemented responsive drawers.

### 11. GitHub App Installation Redirect & Reconfiguration Callback Flow
- **Issue:** Repository configuration redirects navigated away to GitHub instead of returning to the PulseGuard dashboard.
- **Cause:** Re-selecting repositories on an existing installation defaults to GitHub settings pages.
- **Solution:** Built a direct "Link Installation ID" tool in `GitHubIntegrationCard.tsx` powered by `linkGithubInstallation` server action.

### 12. Direct Telemetry Ingestion Endpoint & Multi-Platform Integration
- **Issue:** Workspace secret API keys were not easily discoverable for microservices and log forwarders.
- **Solution:** Built dedicated workspace route `/[orgSlug]/ingestion` with copy-paste snippets for cURL, Next.js, Express, Python, and Vercel Log Drains.

### 13. Public Landing Roaming & Active Session Auth Guards
- **Issue:** Users with active sessions visiting `/login` or `/signup` saw credential forms.
- **Solution:** Added server-side session checks in `frontend/app/(auth)/layout.tsx` redirecting active sessions to `/workspaces`.

### 14. Server Action Error Masking & GitHub Integration Resilience
- **Issue:** Uncaught server action exceptions triggered generic HTTP 500 errors and React boundary crashes.
- **Solution:** Wrapped `linkGithubInstallation` in defensive try/catch blocks returning structured `{ success: false, error: ... }` responses.

### 15. SRE Agent Data Stream Protocol & Empty Tool Output Handling
- **Issue:** SRE agent executed tools but suppressed text when tool output was empty.
- **Solution:** Updated `route.ts` to return `result.toDataStreamResponse()` with `maxSteps: 5` and enforced clear Markdown summaries in system prompts.

### 16. AI SDK 5/7 Stream Chunk Schema Validation & Thought Signature Persistence
- **Issue:** Client console logged `AI_TypeValidationError` during stream errors and text generation stopped when log levels were mismatched.
- **Cause:** Emitting raw `{ type: "text" }` violated `UIMessageStream` Zod schemas, Zod schema forced `level: "ERROR"` (excluding `"FATAL"` logs), and stripping `thoughtSignature` suppressed Gemini 3 text.
- **Solution:** Formatted error stream chunks into `text-start`/`text-delta`/`text-end`, made `level` optional in `query_telemetry_logs` with org-wide fallback, and preserved native `thoughtSignature` context.

### 17. Automated Hotfix Tool Invocation & Diff Approval Card Rendering
- **Issue:** Clicking "Draft Hotfix Patch" invoked runbook queries instead of outputting a code patch or rendering the interactive Diff Approval Card.
- **Cause:** The agent system prompt lacked explicit tool execution rules for `propose_hotfix` when processing patch/fix prompts.
- **Solution:** Configured `route.ts` system prompt to mandate `propose_hotfix` tool execution on hotfix/patch prompts, inferring realistic target service paths (e.g. `src/lib/db.ts`) to render the interactive `<DiffApprovalCard />` in the UI.

### 18. Elimination of Synthetic Stream Fallback Contamination
- **Issue:** Multi-turn conversation state became contaminated, causing the model to stop generating hotfix proposals or skip GitHub PR tool calls.
- **Cause:** `onFinish` in `route.ts` injected synthetic fallback text into assistant messages when text length was 0. When saved to the database and replayed in message history, this misled the LLM into assuming the diagnosis and hotfix had already been completed.
- **Solution:** Removed synthetic text injection from `onFinish` in `route.ts`. The conversation history now remains 100% authentic, allowing multi-turn prompts ("Draft Hotfix Patch") to execute `propose_hotfix` and present the interactive `<DiffApprovalCard />` with its "Approve & Open PR" button.

### 19. AI SDK Multi-Step Tool Chaining (`stopWhen: isStepCount(n)`) & Premature Termination Resolution
- **Issue:** Clicking "Draft Hotfix Patch" executed a single tool (`query_telemetry_logs`) and immediately finished with `Emitted text length: 0` without calling `propose_hotfix` or generating Markdown diagnostic output.
- **Cause:** In modern `ai@7.x` (`streamText`), tool looping defaults to `stopWhen = isStepCount(1)`. The legacy `maxSteps: 5` property was ignored, causing `streamText` to terminate execution immediately after the first tool result.
- **Solution:** Configured `stopWhen: isStepCount(10)` in `frontend/app/api/agent/route.ts` and updated the SRE agent workflow instructions to sequentially execute context gathering (`query_telemetry_logs`), hotfix proposal (`propose_hotfix`), and comprehensive Markdown diagnosis.

### 20. Organization-Scoped Agent Tool Execution & Auth Cookie Decoupling
- **Issue:** Agent tool executions failed with `{ error: "Unauthorized" }` when executing telemetry or runbook searches during background streaming.
- **Cause:** Tools invoked user-facing Server Actions (`getTelemetry`, `searchKnowledgeBase`) which enforce client HTTP cookie session checks (`requireOrganizationMembership`), failing in decoupled API stream contexts.
- **Solution:** Refactored `backend/src/lib/ai/tools.ts` to execute queries directly via Prisma within the verified `organizationId` multi-tenant boundary, ensuring 100% reliability for all autonomous tool calls.



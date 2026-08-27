# 🚨 PulseGuard: Autonomous SRE Incident Response Engine

PulseGuard is an AI-assisted, multi-tenant incident response workspace. It unites microservice telemetry logs, operational runbooks, and GitHub codebases into real-time collaborative War Rooms. When production breaks, autonomous agents isolate the root cause and draft PR hotfixes for instant engineer approval.

---

## ⚡ Core Functions & Architecture

```
[Microservice Logs] ────> [Telemetry Ingest API] ────> [SHA-256 Fingerprinting]
                                                             │
                                                             ▼ (Accumulate in Redis)
[GitHub PR Created] <─── [Approve Diff] <─── [SRE Agent] <─── [Incident Cluster Triggered]
```

### 1. High-Throughput Log Ingestion
- **Sanitized Fingerprinting:** Sanitizes dynamic logs (stripping UUIDs, timestamps, hex keys, and IPs) to compute reproducible SHA-256 signatures in under 2ms.
- **Sliding-Window Clustering:** If an error signature triggers $\ge 3$ times within a 3-minute window, an automated SRE War Room is provisioned.
- **Auto-Pruning TTL:** Automatically prunes telemetry logs older than 7 days asynchronously in the background to prevent database bloat.

### 2. Multi-Provider AI Engine (BYOM)
- **Bring-Your-Own-Model:** Organizations can configure custom API keys for **Google Gemini**, **OpenAI**, **Anthropic**, **Groq**, and **OpenRouter**.
- **Symmetric Encryption (AES-256-CBC):** API keys are encrypted at rest with random IVs and masked for UI display (`AIza...4F10`).
- **Dynamic Model Discovery:** Models are fetched dynamically from official provider APIs and cached in Redis for 24 hours.

### 3. pgvector Retrieval-Augmented Generation (RAG)
- **Document Chunking:** Parses PDF and Markdown runbooks into 600-character semantic chunks with 60-character overlap.
- **Similarity Search:** Indexes chunks using pgvector embeddings inside PostgreSQL, allowing SRE agents to retrieve diagnostic runbook context instantly.

### 4. Human-in-the-Loop Git Hotfixes
- **Sandboxed Agent:** SRE agents operate in a read-only environment to inspect code and stack traces.
- **One-Click Pull Requests:** When a fix is generated, the agent proposes a patch. Clicking "Approve & Open PR" triggers an automated branch creation and Pull Request commit via the Octokit GitHub App integration.

---

## 🛠️ Technology Stack

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS (Strict `rounded-none` Vercel theme), GSAP
- **Database:** PostgreSQL 16 (with pgvector), Prisma ORM
- **Caching & Rate Limiting:** Redis (`ioredis` client)
- **Auth:** Better Auth (handling organizations, RBAC, and workspace invitations)
- **AI Tooling:** Vercel AI SDK (`streamText`)

---

## 🚀 Local Infrastructure Setup

### 1. Spin up Containers
Ensure you have Docker installed, then boot the database and caching layers:
```bash
docker-compose up -d
```

### 2. Configure Environment Variables
Create a `.env` file at the root:
```env
# Database & Caching
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pulseguard?schema=public"
REDIS_URL="redis://localhost:6379"

# Better Auth & Core Secrets
BETTER_AUTH_SECRET="your-better-auth-secret-32-chars-long"
BETTER_AUTH_URL="http://localhost:3000"

# GitHub App Integration
GITHUB_APP_ID="your-github-app-id"
GITHUB_APP_PRIVATE_KEY="your-github-app-private-key-with-\n-for-newlines"
NEXT_PUBLIC_GITHUB_APP_SLUG="your-github-app-slug"
```

### 3. Initialize Schema & Run App
Install client libraries, generate Prisma structures, and boot the Next.js development server:
```bash
# Install dependencies
bun install

# Run database migrations
bunx prisma db push
bunx prisma generate

# Start Next.js Turbopack
bun run dev
```

### 4. Run the Test Suite
We use **Vitest** for running backend unit and integration test coverage (including log fingerprinting, BYOM providers, invite flows, RBAC checks, and mocked Octokit git operations):
```bash
# Run test suite
bun run test
```

---

## 🔒 Security & Multi-Tenant Isolation (RBAC)

All operations enforce strict tenant boundary gates on the server side:

| Request Route | Required Role | Guard Verification |
| :--- | :--- | :--- |
| **Telemetry Ingestion** | Valid API Key | Match `x-api-key` header to active organization |
| **Manage AI Provider Keys** | `OWNER` / `ADMIN` | `requireOrganizationRole(orgId, ['OWNER', 'ADMIN'])` |
| **GitHub PR Dispatch** | `OWNER` / `ADMIN` | `requireOrganizationRole(orgId, ['OWNER', 'ADMIN'])` |
| **Workspace Invites** | `OWNER` / `ADMIN` | Checked in `POST /api/invites` |
| **Incident War Room Chat** | `MEMBER` (and above) | `requireOrganizationMembership(orgId)` |

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

| Action | Allowed Roles | Verification Security Check |
| :--- | :--- | :--- |
| **Ingest Logs** | API Client | Matches `x-api-key` header to active organization |
| **War Room Access** | `OWNER`, `ADMIN`, `MEMBER`, `VIEWER` | `requireOrganizationMembership(orgId)` |
| **Manage AI Provider Keys** | `OWNER`, `ADMIN` | `requireOrganizationRole(orgId, ['OWNER', 'ADMIN'])` |
| **Team Management / Invites** | `OWNER`, `ADMIN` | `requireOrganizationRole(orgId, ['OWNER', 'ADMIN'])` |
| **Approve Git PR Dispatch** | `OWNER`, `ADMIN` | `requireOrganizationRole(orgId, ['OWNER', 'ADMIN'])` |

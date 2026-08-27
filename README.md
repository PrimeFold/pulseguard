# PulseGuard 🚨

**PulseGuard** is an AI-assisted incident-response workspace designed for modern engineering teams. It unites your telemetry, runbooks, and codebase into a single AI-powered War Room, allowing autonomous agents to help you investigate and resolve production incidents at lightning speed.

---

## ⚡ What It Does (For Users)

When production breaks, you shouldn't have to scramble between 5 different tools. PulseGuard brings it all together:
- **Centralized Telemetry:** Automatically groups repetitive error logs into actionable "Incidents".
- **AI War Rooms:** Chat with an autonomous SRE agent (powered by Gemini) that can query your error logs for you.
- **Repository Context:** The AI reads your GitHub repository code to understand *why* the stack trace failed.
- **Hotfix Proposals:** The AI drafts a PR to fix the issue. You (the human) click "Approve", and it's sent to GitHub.
- **Secure Workspaces:** Everything is scoped to your Organization, meaning strict Role-Based Access Control (RBAC).

---

## 🛠️ How It Works (For Developers)

PulseGuard is built on a modern, high-performance stack:

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS (Vercel-style Dark Mode)
- **Backend:** Node.js, Next.js Server Actions
- **Database:** PostgreSQL with `pgvector` for semantic search, accessed via Prisma ORM 7
- **Authentication:** Better Auth (handling organizations and invites)
- **AI Integration:** Vercel AI SDK + Google Gemini 3.5 Flash
- **GitHub Integration:** Octokit & GitHub Apps for reading repos and pushing patches

### The AI & RAG Pipeline
```text
Document -> Chunking (600 chars) -> Gemini Embeddings -> pgvector -> Semantic Search
```
When an incident occurs, the agent is provided tools (`query_telemetry_logs`, `fetch_repo_file`, `propose_hotfix`). It uses a React Server Component stream (`useChat` from Vercel AI SDK) to execute these tools in real-time, streaming the intermediate steps to the client. 

### Telemetry Ingestion Flow
Error logs are sent to the `/api/telemetry/ingest` endpoint.
1. **Validation:** Zod validates the incoming payload.
2. **Rate Limiting:** Protects the database from log spam.
3. **Fingerprinting:** Groups identical stack traces.
4. **Threshold Trigger:** If an error occurs > 3 times in 3 minutes, it creates an `Incident`.

---

## 🚀 Local Setup

### 1. Prerequisites
- [Bun](https://bun.sh/) (Package Manager)
- A running PostgreSQL database (with `vector` extension installed)

### 2. Environment Variables
Create a `.env.local` file at the root:

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/pulseguard"
BETTER_AUTH_URL="http://localhost:3000"
TEXT_MODEL="gemini-3.5-flash"
EMBEDDING_MODEL="text-embedding-004"
GITHUB_APP_ID="your_app_id"
GITHUB_APP_PRIVATE_KEY="your_private_key"
NEXT_PUBLIC_GITHUB_APP_SLUG="your_app_slug"
```

### 3. Install & Start
```bash
bun install
bunx prisma db push
bun run dev
```

### 4. Running the Tests
*Test suite commands pending implementation.*

---

## 🔒 Security & Safeguards
- **Human-in-the-Loop:** The AI **cannot** execute write operations (like creating PRs) without an explicit `OWNER` or `ADMIN` approval.
- **Strict Authorization:** Server actions verify session boundaries before exposing telemetry.
- **Rate Limiting:** Core AI routes and ingestion points are protected by memory-based rate limiters (easily swappable for Redis).

---

## 🗺️ Roadmap (V2)
- **Custom AI Models:** Bring-your-own API keys for Claude 3.5 Sonnet or GPT-4o.
- **Vercel Drain Integration:** First-party Vercel log ingestion.
- **Automated Root-Cause Post-mortems:** Generate and save a markdown summary of every resolved incident.

# 🧠 PulseGuard: Architecture & Full-Stack Deep Dive

> **Purpose of this Document:**  
> This is a zero-to-hero engineering breakdown of **PulseGuard**. Written as a reference manual for building complex AI-native, multi-tenant, autonomous developer tools from scratch. It explains **what** each piece does, **why** it was designed this way, **how** the data flows, and **where bugs / runtime traps happen**.

---

## 🗺️ Table of Contents
1. [[#1. Authentication & Multi-Tenancy (RBAC)]]
2. [[#2. Document Ingestion, Chunking & pgvector RAG]]
3. [[#3. Telemetry Ingestion, Fingerprinting & Incident Detection]]
4. [[#4. Autonomous SRE Agent & Tool Calling Architecture]]
5. [[#5. GitHub App Integration & Human-in-the-Loop Hotfixes]]
6. [[#6. Performance Caching & Rate Limiting with Redis]]
7. [[#7. Frontend System (Next.js 16 App Router & Design)]]
8. [[#8. Full System Rebuild Checklist (From Scratch)]]

---

# 1. Authentication & Multi-Tenancy (RBAC)

## 📌 The "Why"
In modern SaaS, authentication is never just "is this user logged in?". You need **Multi-Tenancy**:
- A User belongs to multiple **Organizations** (e.g. Workspaces).
- In Org A, the user might be an `ADMIN`. In Org B, they might only be a `VIEWER`.
- **Data Isolation:** Organization A must NEVER see incidents, logs, or GitHub repositories belonging to Organization B.

```
[User] ──(1:N)──> [OrganizationMember] <──(N:1)── [Organization]
                        │ (role: OWNER | ADMIN | MEMBER | VIEWER)
                        ▼
                [Scoped Resources]
          (Incidents, Logs, Documents, GitHub App)
```

## ⚙️ How It Works in Code

### Better Auth Configuration (`lib/auth.ts`)
We use `better-auth` paired with Prisma’s PostgreSQL adapter:
```typescript
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
export const prisma = new PrismaClient({ adapter });

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true, minPasswordLength: 6 },
});
```

### Authorization Gates (`lib/authorization.ts` & `lib/tenant.ts`)
Every Server Action and protected route executes an authorization assertion before running database operations:
```typescript
export async function requireOrganizationMembership(organizationId: string) {
  const user = await requireAuthenticatedUser();
  const membership = await prisma.organizationMember.findUnique({
    where: { userId_organizationId: { userId: user.id, organizationId } },
  });

  if (!membership) {
    throw new Error('You do not have access to this organization.');
  }
  return { user, membership };
}
```

## ⚠️ Where Things Can Go Wrong & Errors Faced
| Failure Mode | Root Cause | Fix / Defense |
| :--- | :--- | :--- |
| **IDOR Vulnerability** (Insecure Direct Object Reference) | Querying `prisma.incident.findUnique({ where: { id } })` without checking `organizationId`. An attacker from Org B can view Org A's incidents by guessing the ID. | Always query with compound conditions: `where: { id, organizationId: org.id }`. |
| **Session Hydration Mismatch** | Reading headers on the server in Next.js App Router without `await headers()`. | Next.js 15+ / 16 requires `await headers()` before reading session cookies. |
| **Compound Unique Constraint Failures** | Prisma throws error when a user joins the same org twice. | Ensure schema has `@@unique([userId, organizationId])` on `OrganizationMember`. |

---

# 2. Document Ingestion, Chunking & pgvector RAG

## 📌 The "Why"
When an SRE investigates an incident, they need the system runbooks and architecture docs. Large Language Models have a finite context window and hallucinate on internal architecture. **RAG (Retrieval-Augmented Generation)** injects relevant chunks into the prompt dynamically.

```
[Uploaded File (.pdf, .md, .txt)]
         │
         ▼ (parseFileToText via unpdf)
   [Raw String]
         │
         ▼ (RecursiveCharacterTextSplitter: 600 chars, 60 overlap)
   [Array of Text Chunks]
         │
         ▼ (ai/embedMany + Gemini embedding model)
   [Float Vectors (1536/768 dim)]
         │
         ▼ ($executeRaw SQL with ::vector)
   [PostgreSQL pgvector Table: DocumentChunk]
```

## ⚙️ How It Works in Code

### 1. Multi-Format File Parsing (`lib/parse-file.ts`)
Handles `.md`, `.txt`, and `.pdf` without needing an external microservice:
```typescript
export async function parseFileToText(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension === 'pdf') {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer));
    const { text } = await extractText(pdf, { mergePages: true });
    return Array.isArray(text) ? text.join('\n\n') : text;
  }
  return await file.text();
}
```

### 2. Chunking & pgvector Transaction (`app/api/action/document.ts`)
Documents are split preserving Markdown headers so semantic meaning is not cut abruptly:
```typescript
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 600,
  chunkOverlap: 60,
  separators: ['\n## ', '\n### ', '\n#### ', '\n\n', '\n', ' '],
});
const rawChunks = await splitter.splitText(rawContent);

const { embeddings } = await embedMany({
  model: google.embeddingModel("gemini-embedding-2"),
  values: rawChunks,
});

await prisma.$transaction(async (tx) => {
  const document = await tx.document.create({ ... });
  for (let i = 0; i < rawChunks.length; i++) {
    const chunkVector = JSON.stringify(embeddings[i]);
    await tx.$executeRaw`
      INSERT INTO "DocumentChunk" ("id", "documentId", "chunkIndex", "content", "embedding", "createdAt")
      VALUES (gen_random_uuid(), ${document.id}, ${i}, ${rawChunks[i]}, ${chunkVector}::vector, NOW());
    `;
  }
});
```

## ⚠️ Where Things Can Go Wrong & Errors Faced
| Failure Mode | Root Cause | Fix / Defense |
| :--- | :--- | :--- |
| **Vector Dimension Mismatch** | DB column is `vector(1536)` but model outputs `768` dimensions. Postgres rejects insert with `different vector dimensions`. | Lock both the embedding model and DB schema dimension in environment configs. |
| **PDF Stream Buffer Exhaustion** | Ingesting 50MB PDFs directly into memory causes Node.js V8 heap out of memory (`OOM`). | Cap file uploads in Next.js Server Actions (e.g. 5MB max). |
| **Prisma Driver Limitations** | Prisma ORM does not support native `pgvector` inserts directly through `prisma.documentChunk.create({ data: { embedding: ... } })`. | Must use raw SQL (`tx.$executeRaw`) and explicitly cast the JSON array using `::vector`. |

---

# 3. Telemetry Ingestion, Fingerprinting & Incident Detection

## 📌 The "Why"
External servers crash and emit 10,000 duplicate error logs in seconds. If every log created an incident, your database would crash and developers would suffer alert fatigue.
PulseGuard implements **Log Sanitization, Fingerprinting, Sliding-Window Clustering, and Anomaly Thresholds**.

```
[Raw Log: "Error: User 9283 failed at 192.168.1.1:5432 with token 0x9f8a..."]
                             │
                             ▼ (Regex Sanitization)
[Clean Pattern: "Error: User <NUM> failed at <IP> with token <HEX>"]
                             │
                             ▼ (SHA-256 Hash of service + pattern)
[Fingerprint: "a9f8b7c6d5e4f3a2"]
                             │
                             ▼ (Redis Lookup / Postgres Check)
[Did this error occur >= 3 times in 3 minutes?]
         ├── YES ──> [Create/Trigger Incident War Room]
         └── NO  ──> [Log to TelemetryLog table]
```

## ⚙️ How It Works in Code

### Deterministic Error Fingerprinting (`lib/telemetry.ts`)
```typescript
export function generateErrorFingerprint(service: string, message: string) {
  const cleanPattern = message
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, "<UUID>")
    .replace(/\b[0-9a-f]{24,64}\b/gi, "<HEX>")
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?\b/g, "<IP>")
    .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?/g, "<TIMESTAMP>")
    .replace(/\b\d+\b/g, "<NUM>")
    .trim();

  const hash = createHash("sha256")
    .update(`${service}:${cleanPattern}`)
    .digest("hex")
    .substring(0, 16);

  return { fingerprint: hash, cleanPattern };
}
```

### Ingestion Route with Zod & Redis (`app/api/telemetry/ingest/route.ts`)
1. **API Key & Rate Limiting:** Verifies organization API key and checks rate limits via Redis.
2. **Payload Parsing:** Validates with Zod schema (supports single log or batched arrays).
3. **Redis-Cached Incident Mapping:** Checks if an open incident already tracks this fingerprint in Redis (expires in 300s) to avoid expensive DB queries.

## ⚠️ Where Things Can Go Wrong & Errors Faced
| Failure Mode | Root Cause | Fix / Defense |
| :--- | :--- | :--- |
| **Log Bombing / Denial of Service** | A rogue microservice in an infinite loop sends 50,000 logs/sec. | Redis atomic `INCR` rate limiting at the API boundary rejecting with `429 Too Many Requests`. |
| **Over-aggressive Fingerprinting** | Regex strips too much information (e.g. replacing status code `404` with `<NUM>` and `500` with `<NUM>`, merging two different bugs into one incident). | Keep error type/service names distinct and test regex against diverse stack traces. |

---

# 4. Autonomous SRE Agent & Tool Calling Architecture

## 📌 The "Why"
Instead of a generic chatbot that only gives suggestions, an **Agentic AI** has "hands". It can query real logs, fetch actual code from GitHub, and assemble a proposed patch.

```
[User / Incident Trigger]
         │
         ▼
[Vercel AI SDK streamText()] ───> Gemini 3.5 Flash
         │
         ├── Needs logs? ────────> Tool: `query_telemetry_logs`
         ├── Needs source code? ──> Tool: `fetch_repo_file`
         └── Has solution? ───────> Tool: `propose_hotfix`
                                           │
                                           ▼ (status: requires_approval)
                              [Renders DiffApprovalCard on Client]
```

## ⚙️ How It Works in Code

### Tool Definitions (`lib/ai/tools.ts`)
Tools use Zod schemas so the model produces strictly typed JSON parameters:
```typescript
export function createIncidentTools(organizationId: string) {
  return {
    query_telemetry_logs: tool({
      description: "Query structured error logs and telemetry around an incident timeframe.",
      inputSchema: z.object({
        service: z.string().optional(),
        level: z.enum(["INFO", "WARN", "ERROR", "FATAL"]).default("ERROR"),
        limit: z.number().default(10),
      }),
      execute: async ({ service, level, limit }) => { ... },
    }),

    fetch_repo_file: tool({
      description: "Fetch source code of a file from the connected GitHub repository.",
      inputSchema: z.object({
        filePath: z.string(),
        ref: z.string().default("main"),
      }),
      execute: async ({ filePath, ref }) => { ... },
    }),

    propose_hotfix: tool({
      description: "Propose a code fix and PR structure for human review.",
      inputSchema: z.object({
        filePath: z.string(),
        patch: z.string(),
        explanation: z.string(),
      }),
      execute: async (proposal) => ({
        status: "requires_approval",
        ...proposal,
      }),
    }),
  };
}
```

### Streaming API Route (`app/api/agent/route.ts`)
Uses `streamText` and `toUIMessageStream` to stream markdown text and tool execution status simultaneously to the client:
```typescript
const result = streamText({
  model: google("gemini-3.5-flash"),
  messages: [{ role: "system", content: SRE_SYSTEM_PROMPT }, ...modelMessages],
  tools: createIncidentTools(org.id),
  stopWhen: isStepCount(5), // Prevents infinite tool-calling loops
});
return createUIMessageStreamResponse({ ... });
```

---

# 5. GitHub App Integration & Human-in-the-Loop Hotfixes

## 📌 The "Why"
AI should **never** commit directly to `main` without human oversight. PulseGuard uses a GitHub App with fine-grained permissions:
1. **Read-only access** to inspect files during investigation.
2. **Write-on-approval** to create a branch, commit the patch, and open a Pull Request **only** after an authorized human clicks "Approve".

```
[AI propose_hotfix output]
         │
         ▼
[DiffApprovalCard UI]
         │
  (Engineer clicks "Approve & Open PR")
         │
         ▼
[POST /api/github/pr] ───> Checks User Role (OWNER or ADMIN)
                                │
                                ▼
                       [Octokit Git Database API]
                       1. getRef('heads/main') -> latestCommitSha
                       2. createRef('refs/heads/hotfix/xyz', latestCommitSha)
                       3. createOrUpdateFileContents(filePath, base64Patch)
                       4. pulls.create(title, body, head, base)
                                │
                                ▼
                       [PR Link Returned & Displayed]
```

## ⚙️ How It Works in Code (`lib/github.ts`)
```typescript
export function getInstallationOctokit(installationId: number): Octokit {
  return new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: process.env.GITHUB_APP_ID!,
      privateKey: process.env.GITHUB_APP_PRIVATE_KEY!,
      installationId,
    },
  });
}
```

## ⚠️ Where Things Can Go Wrong & Errors Faced
| Failure Mode | Root Cause | Fix / Defense |
| :--- | :--- | :--- |
| **GitHub App Private Key Formatting** | PEM private keys in `.env` contain literal `\n` newlines which get corrupted when read as a string. | Replace `\n` with actual newlines when initializing Octokit: `privateKey.replace(/\\n/g, '\n')`. |
| **Git Merge Conflicts / SHA Mismatch** | Modifying an existing file without supplying the current blob `sha` causes GitHub API `409 Conflict`. | Always call `octokit.rest.repos.getContent` on the target branch first to retrieve the current file `sha`. |

---

# 6. Performance Caching & Rate Limiting with Redis

## 📌 The "Why"
PostgreSQL is optimized for complex relational queries and transactions, not for high-frequency counters or repeated dashboard queries.
We use **Redis** (via `ioredis`) for two critical layers:
1. **Distributed Rate Limiting:** Tracking requests per IP in memory resets whenever serverless functions scale down. Redis maintains a global counter.
2. **Dashboard Query Caching:** When engineers refresh the SRE dashboard, 4 heavy queries (aggregating 100+ logs and incident counts) are fetched from Redis in < 2ms instead of hitting Postgres.

```
Incoming Request ──> Redis INCR key ──> Count > 50? ──(YES)──> 429 Too Many Requests
                                            │
                                           (NO)
                                            ▼
                                   Route Handler Execution
```

## ⚙️ How It Works in Code

### Rate Limiter (`lib/rate-limit.ts`)
```typescript
export async function checkRateLimit(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "global";
  const key = `rate_limit:${ip}`;

  const current = await redis.incr(key);
  if (current === 1) {
    await redis.pexpire(key, 60000); // 1 minute window
  }

  if (current > 50) {
    const ttl = await redis.pttl(key);
    return { success: false, remaining: 0, resetTime: Date.now() + ttl };
  }
  return { success: true, remaining: 50 - current };
}
```

---

# 7. Frontend System (Next.js 16 App Router & Design)

## 📌 The "Why"
Modern developer tooling needs a crisp, non-distracting UI. We implemented a **Vercel-inspired monochrome dark mode**:
- Pure pitch black (`#000000`) canvas.
- Subtle zinc borders (`#27272a` / `oklch(0.269 0 0)`).
- Semantic colors ONLY for status indicators (Red = Triggered, Green = Healthy, Yellow = Running).
- Smooth entry animations using `motion/react` (Framer Motion).

```
app/
├── (auth)/                  # Public Auth Route Group
│   ├── login/page.tsx       # Sign in with Better Auth
│   └── signup/page.tsx      # Sign up with Better Auth
│
├── (protected)/             # Authenticated Layout Group
│   ├── (workspaces)/        # Organization Hub (/workspaces)
│   └── [orgSlug]/           # Dynamic Multi-Tenant Workspace
│       ├── page.tsx         # SRE Overview & Telemetry Chart
│       ├── incidents/       # Incident List & War Rooms
│       │   └── [id]/        # AI Chat & Diff Approval Card
│       ├── telemetry/       # Live Log Streaming Feed
│       └── settings/        # Profile CRUD, API Keys & GitHub
```

---

# 8. Full System Rebuild Checklist (From Scratch)

If you ever need to rebuild this exact application from a blank folder, follow these steps in order:

1. **Initialize Project:**
   ```bash
   bun create next-app pulseguard --typescript --tailwind --eslint --app
   bun add better-auth @prisma/client @prisma/adapter-pg pg ioredis
   bun add ai @ai-sdk/google @ai-sdk/react @langchain/textsplitters unpdf
   bun add octokit @octokit/auth-app zod lucide-react motion clsx tailwind-merge
   bun add -D prisma @types/pg
   ```
2. **Spin Up Docker Infrastructure:**
   - Add PostgreSQL with `pgvector/pgvector:pg16` on port `5432`.
   - Add Redis with `redis:alpine` on port `6379`.
3. **Database Schema & Prisma:**
   - Define User, Session, Organization, OrganizationMember, Document, DocumentChunk (`vector`), Incident, TelemetryLog, AgentExecution.
   - Run `bunx prisma db push`.
4. **Build Security & Ingestion Layer:**
   - Create `lib/telemetry.ts` (sanitization regex + SHA-256).
   - Create `app/api/telemetry/ingest/route.ts` with Zod validation + Redis fingerprint caching.
5. **Build Document & RAG Pipeline:**
   - Create `lib/parse-file.ts` (PDF/text extraction).
   - Create `app/api/action/document.ts` (Langchain chunker + Gemini `embedMany` + raw vector SQL).
6. **Build Agentic Tools & War Room:**
   - Create `lib/ai/tools.ts` with `query_telemetry_logs`, `fetch_repo_file`, and `propose_hotfix`.
   - Create `app/api/agent/route.ts` with Vercel AI SDK `streamText`.
7. **Integrate GitHub App & Approval Workflow:**
   - Create `lib/github.ts` with Octokit App Auth and Git commit/pull-request helpers.
   - Create `DiffApprovalCard.tsx` client component.
8. **Polish UI & Auth:**
   - Build `/login`, `/signup`, `/workspaces`, and dynamic `/[orgSlug]` layouts.
   - Apply Vercel dark theme in `app/globals.css`.

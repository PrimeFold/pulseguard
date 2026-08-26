# PulseGuard

PulseGuard is an AI-assisted incident-response workspace for small engineering teams. It brings incident records, structured telemetry, internal runbooks, and repository context into one place so an operator can investigate an issue and review a proposed fix.

> This project is actively being built. The goal is a secure, understandable V1 before adding more agent capabilities.

## What It Does

- Authenticates users and scopes data to an organization.
- Stores incidents and telemetry logs in PostgreSQL.
- Ingests documents, splits them into chunks, embeds them, and supports semantic knowledge-base search with pgvector.
- Generates a root-cause analysis for a newly created incident and stores it as a searchable post-mortem.
- Connects a GitHub App installation to an organization, allowing the agent to read repository files and propose a hotfix.
- Streams a tool-calling SRE chat experience using the AI SDK and Gemini.
- Requires a human `OWNER` or `ADMIN` before a proposed GitHub pull request can be created.

## Architecture

```text
Browser
  -> Next.js app and server actions
  -> Better Auth session + organization membership check
  -> PostgreSQL / Prisma
       -> incidents and telemetry
       -> documents and pgvector embeddings
  -> AI SDK + Gemini
       -> SRE tools: query logs, read repository file, propose hotfix
  -> GitHub App installation
       -> repository reads and approved pull requests
```

Every browser-initiated operation must be both authenticated and authorized for the target organization. Machine-to-machine telemetry ingestion uses a per-organization API key instead of a browser session.

## Stack

- Next.js 16, React 19, TypeScript, Tailwind CSS
- PostgreSQL, Prisma 7, pgvector
- Better Auth
- Vercel AI SDK and Google Gemini
- LangChain text splitters
- GitHub App, Octokit
- Zod

## Local Setup

1. Install dependencies with your chosen package manager. The repository uses Bun, although an npm lockfile is also present.
2. Create a PostgreSQL database with the `vector` extension available.
3. Create `.env.local` with the required values:

```bash
DATABASE_URL=
BETTER_AUTH_URL=http://localhost:3000
TEXT_MODEL=
EMBEDDING_MODEL=
GITHUB_APP_ID=
GITHUB_APP_PRIVATE_KEY=
NEXT_PUBLIC_GITHUB_APP_SLUG=
```

4. Apply the Prisma migrations and generate the client.
5. Start the development server:

```bash
bun run dev
```

## AI And Retrieval Flow

```text
Document
  -> text extraction
  -> chunking (600 characters, 60-character overlap)
  -> Gemini embeddings
  -> pgvector storage

Question
  -> query embedding
  -> organization-scoped similarity search
  -> relevant chunks supplied as context to an AI workflow
```

The embedding model and database vector dimension are an important contract: they must stay aligned before production use.

## GitHub App Flow

1. An `OWNER` or `ADMIN` starts a GitHub App installation for their organization.
2. PulseGuard stores the installation ID and selected repository metadata on that organization.
3. An incident agent can use the installation token to inspect repository files.
4. The agent proposes a fix first.
5. An `OWNER` or `ADMIN` explicitly approves creation of a pull request.

## Current Scope And Roadmap

### V1

- Complete organization selection rather than using placeholder organization IDs in dashboard pages.
- Persist and validate telemetry event payloads at the API-key ingestion endpoint.
- Finish incident detail and chat UI.
- Add automated authorization, retrieval, and GitHub approval tests.
- Add operational safeguards: rate limits, audit records, error handling, and a consistent embedding configuration.

### V2

- Let organizations choose and configure their own AI model providers.
- Add Vercel Drain as an optional telemetry source for Vercel-hosted applications.
- Add additional collectors or OpenTelemetry-compatible ingestion for applications hosted outside Vercel.
- Add richer retrieval evaluation and incident timelines.

## Telemetry Sources

Vercel Drain should be an optional V2 integration, not the foundation of telemetry. It only covers workloads whose logs are available through Vercel. A general API-key-protected ingestion endpoint can accept logs from any hosting provider, container platform, or custom service, making it the right V1 path.

## Security Model

- Server actions verify a session and organization membership before reading or changing organization data.
- GitHub connection and pull-request creation require `OWNER` or `ADMIN` membership.
- Semantic search joins document chunks back to their organization before returning results.
- Telemetry API keys are stored as hashes; only a display-safe fragment is retained after generation.

## License

No license has been selected yet.

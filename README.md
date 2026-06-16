# OpenSplit

A free, open-source, self-hosted expense-splitting platform. Track shared expenses, split bills, and settle debts with friends and groups.

OpenSplit provides a REST API backend that you host yourself, a web frontend, a TypeScript SDK for building client applications, an MCP server for AI agent integration, and an AI-powered expense creation assistant.

> **Note:** The web UI is not production-ready — it is a quick demo of how to use the backend, MCP server, and AI agent. The primary interface is the REST API and SDK.

## Screenshots

| Home Page | Friends Page |
|-----------|-------------|
| ![Home page showing per-currency balances and the add expense form](screenshots/home-page.png) | ![Friends page with expanded accordion showing shared expenses](screenshots/friends-page.png) |

| AI Agent Chat | Swagger API Docs |
|---------------|-----------------|
| ![AI chat popover creating an expense from natural language](screenshots/agent-chat.png) | ![Auto-generated Swagger documentation for the REST API](screenshots/swagger-docs.png) |

- **Home Page** — per-currency balance summary for each friend (left) and the add expense form with "Create with AI" button (right)
- **Friends Page** — accordion list of friends with multi-currency balances on each header, expandable to see individual shared expenses
- **AI Agent Chat** — floating chat popover that creates expenses from natural language (e.g., "I paid 50 euros and Sam paid 20 euros for a car trip")
- **Swagger API Docs** — auto-generated interactive API documentation at `/api`

## Architecture

```
opensplit/
├── apps/
│   └── web/          # Next.js web frontend
├── packages/
│   ├── api/          # NestJS backend (REST API)
│   ├── sdk/          # TypeScript SDK for consuming the API
│   ├── mcp/          # MCP server for AI agent integration
│   └── ai/           # AI agent for natural language expense creation
├── docker-compose.yml
└── package.json
```

**Monorepo** managed with [pnpm workspaces](https://pnpm.io/workspaces).

| Package | Description | Stack |
|---------|-------------|-------|
| `@opensplit/web` | Web frontend | Next.js 15, shadcn/ui, Tailwind CSS |
| `@opensplit/api` | Self-hosted REST API server | NestJS, Prisma, SQLite (configurable) |
| `@opensplit/sdk` | Typed client SDK (zero dependencies) | TypeScript, native `fetch` |
| `@opensplit/mcp` | MCP server for AI agent integration | MCP SDK, `@opensplit/sdk` |
| `@opensplit/ai` | AI agent for natural language expense creation | Vercel AI SDK, OpenAI, `@ai-sdk/mcp` |

## Features

- **Users** — registration, profiles, API key authentication
- **Groups** — create groups for home, trips, couples, etc.
- **Friends** — add friends, track balances between any two users
- **Expenses** — create, split equally or by custom shares, with full validation
- **AI expense creation** — create expenses from natural language via a chat interface powered by OpenAI
- **Comments** — comment on any expense
- **Notifications** — activity feed for expense/group changes
- **Categories** — pre-seeded category hierarchy (Food, Transportation, Utilities, etc.)
- **Multi-currency** — 37 pre-seeded currencies with per-currency balance tracking (each currency shows its own "owes you" / "you owe" direction independently)
- **Soft-delete** — expenses and groups are soft-deleted and can be restored
- **Rate limiting** — per-IP throttling (5 req/min on auth, 100 req/min globally)
- **Swagger** — auto-generated API documentation at `/api`

## Database Support

OpenSplit uses [Prisma](https://www.prisma.io/) as its ORM, which means **you choose your database**. The schema ships with **SQLite** as the default — zero setup, no external services, just works. For production or larger deployments, you can switch to any Prisma-supported provider:

| Provider | `provider` value | `DATABASE_URL` example | Best for |
|----------|-----------------|----------------------|----------|
| **SQLite** (default) | `"sqlite"` | `file:./opensplit.db` | Getting started, small teams, single-server deployments |
| **PostgreSQL** | `"postgresql"` | `postgresql://user:pass@localhost:5432/opensplit` | Production, high concurrency |
| **MySQL** | `"mysql"` | `mysql://user:pass@localhost:3306/opensplit` | Production, existing MySQL infrastructure |
| **SQL Server** | `"sqlserver"` | `sqlserver://localhost:1433;database=opensplit;...` | Enterprise environments |

### Switching Databases

1. Change the `provider` in [`packages/api/prisma/schema.prisma`](packages/api/prisma/schema.prisma):

```prisma
datasource db {
  provider = "postgresql"  // change from "sqlite" to your choice
  url      = env("DATABASE_URL")
}
```

2. Update `DATABASE_URL` in your `.env` file
3. Re-generate and migrate:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

A [`docker-compose.postgres.yml`](docker-compose.postgres.yml) override is included for PostgreSQL deployments.

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) >= 20
- [pnpm](https://pnpm.io/) >= 9
- An [OpenAI API key](https://platform.openai.com/api-keys) (only needed for the AI chat feature)

No database installation needed — SQLite is the default and requires no setup.

### 1. Clone and install

```bash
git clone https://github.com/your-username/opensplit.git
cd opensplit
pnpm install
```

### 2. Configure environment

```bash
# API server
cp packages/api/.env.example packages/api/.env

# MCP server
cp packages/mcp/.env.example packages/mcp/.env

# Web frontend
cp apps/web/.env.example apps/web/.env
```

Edit the `.env` files as needed. Here are all the environment variables across packages:

**`packages/api/.env`**

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | `file:./opensplit.db` | Database connection string |
| `API_PORT` | No | `3000` | Port the API server listens on |

**`packages/mcp/.env`**

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENSPLIT_BASE_URL` | No | `http://localhost:3000` | URL of the OpenSplit API |
| `OPENSPLIT_MCP_PORT` | No | `3001` | Port for the MCP HTTP server |
| `OPENSPLIT_API_KEY` | Stdio only | — | API key for stdio mode |

**`apps/web/.env`**

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_BRAND_NAME` | No | `OpenSplit` | Brand name displayed in the UI |
| `OPENSPLIT_API_URL` | No | `http://localhost:3000` | URL of the OpenSplit API |
| `OPENSPLIT_MCP_URL` | No | `http://localhost:3001` | URL of the MCP server (for AI chat) |
| `OPENAI_API_KEY` | For AI chat | — | OpenAI API key for the AI expense creation feature |

### 3. Set up the database

```bash
# Generate the Prisma client
pnpm db:generate

# Create tables (run migrations)
pnpm db:migrate

# Seed currencies, categories, and a demo user
pnpm db:seed
```

The seed script will print a demo API key — save it for testing.

### 4. Start the services

You need three processes running:

```bash
# Terminal 1: API server
pnpm dev

# Terminal 2: MCP server (HTTP mode)
pnpm --filter @opensplit/mcp build
node packages/mcp/dist/index.js --http

# Terminal 3: Web frontend
pnpm --filter @opensplit/web dev
```

- **API** starts on `http://localhost:3000` (or your configured `API_PORT`). Swagger docs at `/api`.
- **MCP server** starts on `http://localhost:3001` (or your configured `OPENSPLIT_MCP_PORT`).
- **Web app** starts on `http://localhost:3100`.

Make sure the ports in your `.env` files are consistent — `OPENSPLIT_API_URL` and `OPENSPLIT_MCP_URL` in the web app must match the actual API and MCP server ports.

## Docker

Run OpenSplit with Docker (SQLite, no database service needed):

1. Set the host ports in `docker-compose.yml` — replace `<host-api-port>`, `<host-web-port>`, and `<host-mcp-port>` with your desired ports (e.g. `3000`, `3100`, and `3001`)
2. Set `OPENAI_API_KEY` for the AI chat feature (optional)
3. Start the services:

```bash
OPENAI_API_KEY=sk-... docker compose up
```

This starts:
- **OpenSplit API** on your chosen API port — SQLite, migrations and seeding run automatically
- **Web frontend** on your chosen web port — connects to the API and MCP server internally
- **MCP server** on your chosen MCP port — HTTP mode, connects to the API internally

You can customize the brand name via the `BRAND_NAME` env var: `BRAND_NAME=MyApp docker compose up`

To run in the background:

```bash
docker compose up -d
```

To rebuild after code changes:

```bash
docker compose up --build
```

### Docker with PostgreSQL

For production deployments with PostgreSQL:

1. Change `provider` to `"postgresql"` in `packages/api/prisma/schema.prisma`
2. Run with the PostgreSQL override:

```bash
docker compose -f docker-compose.yml -f docker-compose.postgres.yml up
```

## Authentication

OpenSplit uses **API key authentication**. Register or log in to get your API key, then include it as a `Bearer` token in every request:

```
Authorization: Bearer <your-api-key>
```

### Register

Create a new account. Returns the user profile and an API key.

```bash
curl -X POST http://localhost:3000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email": "alice@example.com", "password": "securepassword", "firstName": "Alice"}'
```

### Login

Authenticate with an existing account. Returns the user profile and API key.

```bash
curl -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email": "alice@example.com", "password": "securepassword"}'
```

### Rotate API Key

Generate a new API key (invalidates the old one). Requires authentication.

```bash
curl -X POST http://localhost:3000/auth/rotate-key \
  -H 'Authorization: Bearer <your-api-key>'
```

### Demo User

When you run `pnpm db:seed`, a demo user is created (`demo@opensplit.dev` / `demo-password`) and its API key is printed to the console.

### Rate Limiting

All endpoints are rate-limited per IP address to prevent abuse:

| Endpoints | Limit | Window |
|-----------|-------|--------|
| Auth (`/auth/*`) | 5 requests | 60 seconds |
| All other routes | 100 requests | 60 seconds |

Exceeding the limit returns `429 Too Many Requests`. Each IP has its own independent counter — one user hitting the limit does not affect others.

## API Reference

Once the server is running, full interactive API docs are available at:

```
http://localhost:3000/api
```

### Endpoints Overview

#### Auth
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/auth/register` | Register a new account |
| `POST` | `/auth/login` | Log in to an existing account |
| `POST` | `/auth/rotate-key` | Generate a new API key (authenticated) |

#### Users
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/users/me` | Get current authenticated user |
| `GET` | `/users/:id` | Get user by ID |
| `PATCH` | `/users/:id` | Update user profile |

#### Groups
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/groups` | List your groups |
| `GET` | `/groups/:id` | Get group with members and balances |
| `POST` | `/groups` | Create a group |
| `DELETE` | `/groups/:id` | Delete a group (soft-delete) |
| `POST` | `/groups/:id/restore` | Restore a deleted group |
| `POST` | `/groups/:id/members` | Add a member to a group |
| `DELETE` | `/groups/:id/members/:userId` | Remove a member from a group |

#### Friends
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/friends` | List your friends with balances |
| `GET` | `/friends/:id` | Get friend details with balance |
| `POST` | `/friends` | Add a friend (by userId or email) |
| `DELETE` | `/friends/:id` | Remove a friend |

#### Expenses
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/expenses` | List expenses (with filters) |
| `GET` | `/expenses/:id` | Get expense with shares and comments |
| `POST` | `/expenses` | Create an expense |
| `PATCH` | `/expenses/:id` | Update an expense |
| `DELETE` | `/expenses/:id` | Delete an expense (soft-delete) |
| `POST` | `/expenses/:id/restore` | Restore a deleted expense |

**Query parameters for `GET /expenses`:**
- `group_id` — filter by group
- `friend_id` — filter by friend
- `dated_after` / `dated_before` — filter by expense date
- `updated_after` / `updated_before` — filter by last update
- `limit` (default: 20, max: 100) / `offset`

#### Comments
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/expenses/:expenseId/comments` | List comments on an expense |
| `POST` | `/expenses/:expenseId/comments` | Add a comment |
| `DELETE` | `/comments/:id` | Delete a comment |

#### Notifications
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/notifications` | List your notifications |

**Query parameters:** `updated_after`, `limit`

#### Reference Data
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/currencies` | List all supported currencies |
| `GET` | `/categories` | List all categories with subcategories |

## SDK Usage

Install the SDK in your React, Next.js, or any TypeScript project:

```bash
npm install @opensplit/sdk
```

### Initialize the client

```typescript
import { OpenSplitClient } from '@opensplit/sdk';

// With an existing API key
const openSplit = new OpenSplitClient({
  baseUrl: 'http://localhost:3000',
  apiKey: 'your-api-key-here',
});

// Or without a key — register/login first, then set it
const client = new OpenSplitClient({ baseUrl: 'http://localhost:3000' });
const { user, apiKey } = await client.auth.register({
  email: 'alice@example.com',
  password: 'securepassword',
  firstName: 'Alice',
});
client.setApiKey(apiKey);
```

### Examples

```typescript
// Get current user
const me = await openSplit.users.me();
console.log(`Hello, ${me.firstName}!`);

// List your groups
const groups = await openSplit.groups.list();

// Create a group
const group = await openSplit.groups.create({
  name: 'Weekend Trip',
  groupType: 'TRIP',
  members: ['user-id-1', 'user-id-2'],
});

// Create an expense split equally
const expense = await openSplit.expenses.create({
  groupId: group.id,
  description: 'Dinner',
  cost: 120,
  currencyCode: 'USD',
  splitEqually: true,
});

// Create an expense with custom shares
const customExpense = await openSplit.expenses.create({
  description: 'Groceries',
  cost: 50,
  currencyCode: 'USD',
  shares: [
    { userId: 'user-1', paidShare: 50, owedShare: 25 },
    { userId: 'user-2', paidShare: 0, owedShare: 25 },
  ],
});

// List expenses with filters
const expenses = await openSplit.expenses.list({
  group_id: group.id,
  dated_after: '2026-01-01',
  limit: 50,
});

// Add a comment
const comment = await openSplit.comments.create(expense.id, {
  content: 'Including tip',
});

// Get friends with balances
const friends = await openSplit.friends.list();

// Get all currencies
const currencies = await openSplit.currencies.list();

// Get all categories
const categories = await openSplit.categories.list();
```

### Error Handling

```typescript
import { OpenSplitClient, OpenSplitError } from '@opensplit/sdk';

try {
  const expense = await openSplit.expenses.get('non-existent-id');
} catch (error) {
  if (error instanceof OpenSplitError) {
    console.error(`API error ${error.statusCode}: ${error.message}`);
  }
}
```

### Available Resources

| Resource | Methods |
|----------|---------|
| `openSplit.auth` | `register(data)`, `login(data)`, `rotateKey()` |
| `openSplit.users` | `me()`, `get(id)`, `update(id, data)` |
| `openSplit.groups` | `list()`, `get(id)`, `create(data)`, `delete(id)`, `restore(id)`, `addMember(groupId, data)`, `removeMember(groupId, userId)` |
| `openSplit.friends` | `list()`, `get(id)`, `create(data)`, `delete(id)` |
| `openSplit.expenses` | `list(params?)`, `get(id)`, `create(data)`, `update(id, data)`, `delete(id)`, `restore(id)` |
| `openSplit.comments` | `list(expenseId)`, `create(expenseId, data)`, `delete(commentId)` |
| `openSplit.notifications` | `list(params?)` |
| `openSplit.currencies` | `list()` |
| `openSplit.categories` | `list()` |

## MCP Server (AI Agent Integration)

OpenSplit includes an [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) server that lets AI agents interact with your expenses through natural language. For example:

> "Sam and Charlie paid for a birthday gift. Sam paid 19 euros and Charlie paid 37 euros. Split the expense among them."

The AI agent calls `create_expense` with the right shares — no manual API calls needed.

### Prerequisites

- OpenSplit API running (locally or hosted)
- An API key (from `POST /auth/register` or `POST /auth/login`)

### Mode 1: Stdio (for Claude Desktop, Claude Code, Cursor)

This mode is for **individual developers** using an MCP-compatible AI client on their machine. The client spawns the MCP server as a child process.

Add this to your MCP client config:

**Claude Desktop** (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "opensplit": {
      "command": "npx",
      "args": ["-y", "@opensplit/mcp"],
      "env": {
        "OPENSPLIT_API_KEY": "your-api-key",
        "OPENSPLIT_BASE_URL": "http://localhost:3000"
      }
    }
  }
}
```

**Claude Code** (`.claude/settings.json`):

```json
{
  "mcpServers": {
    "opensplit": {
      "command": "npx",
      "args": ["-y", "@opensplit/mcp"],
      "env": {
        "OPENSPLIT_API_KEY": "your-api-key",
        "OPENSPLIT_BASE_URL": "http://localhost:3000"
      }
    }
  }
}
```

### Mode 2: HTTP (for production / multi-user deployments)

This mode runs the MCP server as a **standalone HTTP service**. Use this when building a product where your AI agent backend connects to the MCP server over HTTP. Each request is authenticated individually — pass the user's API key in the `Authorization` header.

```bash
OPENSPLIT_BASE_URL=http://localhost:3000 npx @opensplit/mcp --http
```

The server starts on `http://localhost:3001/mcp`. Your AI agent sends JSON-RPC requests via `POST /mcp` with the user's API key:

```bash
curl -X POST http://localhost:3001/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -H 'Authorization: Bearer <user-api-key>' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

```
┌──────────┐     ┌──────────────┐     ┌────────────────┐     ┌──────────────┐
│  User    │────>│  Your AI     │────>│  OpenSplit MCP  │────>│  OpenSplit   │
│  Browser │     │  Agent       │     │  :3001/mcp      │     │  API :3000   │
└──────────┘     └──────────────┘     └────────────────┘     └──────────────┘
                  (passes user's           (forwards
                   API key via              API key to
                   Authorization            OpenSplit API)
                   header)
```

When using Docker Compose, the MCP server starts automatically in HTTP mode and connects to the API container internally.

#### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENSPLIT_API_KEY` | Stdio only | — | API key for stdio mode (set in MCP client config) |
| `OPENSPLIT_BASE_URL` | No | `http://localhost:3000` | URL of the OpenSplit API |
| `OPENSPLIT_MCP_TRANSPORT` | No | `stdio` | Set to `http` for HTTP mode (alternative to `--http` flag) |
| `OPENSPLIT_MCP_PORT` | No | `3001` | Port for HTTP mode |

### Available Tools

The MCP server exposes 15 tools that AI agents can call:

| Tool | Description |
|------|-------------|
| **Expenses** | |
| `create_expense` | Create an expense with equal or custom splits |
| `list_expenses` | List expenses with filters (group, friend, date range) |
| `get_expense` | Get expense details with shares and comments |
| `update_expense` | Update an existing expense |
| `delete_expense` | Soft-delete an expense |
| **Groups** | |
| `list_groups` | List your groups |
| `get_group` | Get group with members and balances |
| `create_group` | Create a new group |
| `add_group_member` | Add a user to a group |
| **Friends** | |
| `list_friends` | List friends with balances |
| `get_friend` | Get friend details |
| `add_friend` | Add a friend by user ID or email |
| **Reference** | |
| `list_currencies` | List supported currencies |
| `list_categories` | List expense categories |
| `get_current_user` | Get your profile and user ID |

### Example Flow

When a user says: *"I paid $60 for dinner with Alex. Split it equally."*

The AI agent:
1. Calls `get_current_user` to get your user ID
2. Calls `list_friends` to find Alex's user ID
3. Calls `create_expense` with `{ description: "Dinner", cost: 60, currencyCode: "USD", splitEqually: true, shares: [...] }`

## AI Agent (`@opensplit/ai`)

The AI agent package enables natural language expense creation in the web frontend. It connects to the MCP server using [Vercel AI SDK](https://ai-sdk.dev/) and streams responses from OpenAI.

```
User: "I paid 50 euros and Sam paid 20 euros for a car trip"
  → Chat UI (useChat) → /api/chat route
    → @opensplit/ai (streamText + OpenAI)
      → MCP server (tools: get_current_user, list_friends, create_expense)
        → OpenSplit API
```

### How It Works

1. The web app's `/api/chat` route receives the user message
2. `@opensplit/ai` connects to the MCP server over HTTP using `@ai-sdk/mcp`, authenticated with the logged-in user's API key
3. OpenAI (via Vercel AI SDK) receives the message + system prompt + available MCP tools
4. The model calls MCP tools as needed (lookup friends, categories, then create the expense)
5. Responses stream back to the chat UI in real-time

### System Prompt

The agent is instructed to:
- Resolve friend names to IDs by calling `list_friends`
- Pick appropriate expense categories automatically
- Default to equal splits, today's date, and the user's default currency
- Confirm with the user before creating any expense
- Handle custom paid amounts (e.g., "I paid 15, Sam paid 20")

### Key Dependencies

| Package | Purpose |
|---------|---------|
| `ai` | Vercel AI SDK core — `streamText`, `convertToModelMessages`, `stepCountIs` |
| `@ai-sdk/mcp` | MCP client — connects to the OpenSplit MCP server over HTTP |
| `@ai-sdk/openai` | OpenAI provider for Vercel AI SDK |

## Web Frontend

The web frontend (`apps/web`) is a Next.js 15 app using shadcn/ui components and Tailwind CSS. It communicates with the API exclusively through server-side SDK calls — the API key is stored in an HTTP-only cookie and never exposed to client-side JavaScript.

> **Note:** The web UI is a demo application to showcase the backend, MCP server, and AI agent capabilities. It is not intended as a production-ready frontend.

### Pages

| Path | Description |
|------|-------------|
| `/login` | Sign in with email and password |
| `/register` | Create a new account — displays the API key as a "Secret" to save |
| `/` | Home — per-currency balance summary for each friend (left), add expense form (right) |
| `/friends` | Friends list — accordion with per-currency balances on each header, expandable to see individual expenses |
| `/profile` | Update name, rotate API key |

### Key Design Decisions

- **Server components by default** — data fetching happens on the server via the SDK. Client components are used only for forms and interactive elements.
- **Suspense streaming** — the friends list and expense form load inside `<Suspense>` boundaries with skeleton fallbacks, so the page shell renders instantly.
- **Auth via HTTP-only cookie** — the API key is set as an HTTP-only cookie after login/register. Middleware redirects unauthenticated users to `/login`. All API calls go through Next.js server actions or server components.
- **i18n ready** — all UI strings are externalized via [next-intl](https://next-intl.dev/), with English as the default locale. Add new locales by creating translation files in `apps/web/src/messages/`.
- **AI chat** — a floating chat popover (bottom-right) powered by `@opensplit/ai`. Click the chat bubble or the "Create with AI" button on the expense form to open it.
- **Invited users** — when you add a friend by email who hasn't registered yet, a placeholder account is created with `INVITED` status. They can register later with the same email to claim their account and see all shared expenses.
- **Brand name from env** — set `NEXT_PUBLIC_BRAND_NAME` in `apps/web/.env` to customize the app name shown in the navbar and auth pages.

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_BRAND_NAME` | No | `OpenSplit` | Brand name displayed in the UI |
| `OPENSPLIT_API_URL` | No | `http://localhost:3000` | URL of the OpenSplit API (server-side only) |
| `OPENSPLIT_MCP_URL` | No | `http://localhost:3001` | URL of the MCP server (for AI chat feature) |
| `OPENAI_API_KEY` | For AI chat | — | OpenAI API key for the AI expense creation feature |

## Data Model

```
User ──┬── GroupMember ──── Group
       │
       ├── Friendship
       │
       ├── ExpenseShare ──── Expense ──── Category
       │
       ├── Comment
       │
       └── Notification

Currency (reference data)
Category (hierarchical, self-referencing)
```

### Key Concepts

- **Expense shares**: Every expense has shares defining who paid and who owes. The sum of `paidShare` values must equal the expense cost, and so must the sum of `owedShare` values.
- **Balances**: Computed dynamically from expense shares. The net balance between two users is `sum(paidShare) - sum(owedShare)` across all their shared expenses, grouped by currency.
- **Soft-delete**: Groups and expenses use `deletedAt` timestamps. Deleted records can be restored.
- **Friendships**: Bidirectional — stored once, queried in both directions.

## Development

### Project Scripts

```bash
pnpm dev            # Start the API in watch mode
pnpm build          # Build all packages
pnpm lint           # Lint all packages
pnpm test           # Run all tests

pnpm db:generate    # Generate Prisma client
pnpm db:migrate     # Run database migrations
pnpm db:seed        # Seed currencies, categories, and demo user
pnpm db:studio      # Open Prisma Studio (database GUI)
```

### Project Structure

```
apps/web/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── (auth)/             # Auth pages (no navbar)
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (app)/              # Authenticated pages (with navbar)
│   │   │   ├── page.tsx        # Home (friends + expenses)
│   │   │   └── profile/page.tsx
│   │   └── api/chat/route.ts   # AI chat API endpoint
│   ├── components/
│   │   ├── shadcn/             # shadcn/ui components
│   │   ├── chat-popover.tsx    # AI chat floating panel
│   │   └── *.tsx               # App components (navbar, forms, lists)
│   ├── lib/
│   │   ├── api.ts              # SDK client factory
│   │   ├── auth.ts             # Cookie management
│   │   └── actions/            # Server actions (auth, expenses, friends, profile)
│   └── middleware.ts           # Auth redirect middleware
├── .env.example
└── components.json             # shadcn config

packages/api/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed data (currencies, categories)
├── src/
│   ├── main.ts             # App bootstrap, Swagger setup
│   ├── app.module.ts       # Root module
│   ├── prisma/             # Database connection (global)
│   ├── auth/               # Auth endpoints (register, login, rotate key)
│   ├── common/             # Guards, decorators, filters
│   │   ├── guards/         # API key auth guard
│   │   ├── decorators/     # @CurrentUser(), @Public()
│   │   └── filters/        # Global exception filter
│   ├── users/              # User endpoints
│   ├── groups/             # Group endpoints
│   ├── friends/            # Friend endpoints
│   ├── expenses/           # Expense endpoints (most complex)
│   ├── comments/           # Comment endpoints
│   ├── notifications/      # Notification endpoints
│   ├── currencies/         # Currency list endpoint
│   └── categories/         # Category list endpoint
└── Dockerfile

packages/sdk/
├── src/
│   ├── index.ts            # Main export
│   ├── client.ts           # OpenSplitClient base class
│   ├── types.ts            # All TypeScript interfaces
│   └── resources/          # One file per API resource
└── tsup.config.ts          # Build config (CJS + ESM + types)

packages/mcp/
├── src/
│   ├── index.ts            # Entry point (stdio + HTTP transports)
│   ├── errors.ts           # Error formatting for MCP responses
│   └── tools/              # Tool definitions by domain
│       ├── expenses.ts     # Expense tools (create, list, get, update, delete)
│       ├── groups.ts       # Group tools (list, get, create, add member)
│       ├── friends.ts      # Friend tools (list, get, add)
│       └── reference.ts    # Currencies, categories, current user
├── .env.example
├── Dockerfile              # Multi-stage Docker build
└── tsup.config.ts          # Build config

packages/ai/
├── src/
│   ├── index.ts            # Public exports
│   ├── prompt.ts           # System prompt for the AI agent
│   └── handler.ts          # Chat handler factory (streamText + MCP client)
└── tsup.config.ts          # Build config (CJS + ESM + types)
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

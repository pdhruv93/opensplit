# OpenSplit

A free, open-source, self-hosted expense-splitting platform. Track shared expenses, split bills, and settle debts with friends and groups.

OpenSplit provides a REST API backend that you host yourself, and a TypeScript SDK for building client applications in React, Next.js, or any JavaScript/TypeScript framework.

## Architecture

```
opensplit/
├── packages/
│   ├── api/          # NestJS backend (REST API)
│   └── sdk/          # TypeScript SDK for consuming the API
├── docker-compose.yml
└── package.json
```

**Monorepo** managed with [pnpm workspaces](https://pnpm.io/workspaces).

| Package | Description | Stack |
|---------|-------------|-------|
| `@opensplit/api` | Self-hosted REST API server | NestJS, Prisma, SQLite (configurable) |
| `@opensplit/sdk` | Typed client SDK (zero dependencies) | TypeScript, native `fetch` |

## Features

- **Users** — registration, profiles, API key authentication
- **Groups** — create groups for home, trips, couples, etc.
- **Friends** — add friends, track balances between any two users
- **Expenses** — create, split equally or by custom shares, with full validation
- **Comments** — comment on any expense
- **Notifications** — activity feed for expense/group changes
- **Categories** — pre-seeded category hierarchy (Food, Transportation, Utilities, etc.)
- **Multi-currency** — 37 pre-seeded currencies with full multi-currency balance tracking
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

No database installation needed — SQLite is the default and requires no setup.

### 1. Clone and install

```bash
git clone https://github.com/your-username/opensplit.git
cd opensplit
pnpm install
```

### 2. Configure environment

```bash
cp packages/api/.env.example packages/api/.env
```

The default `.env` uses SQLite (`file:./opensplit.db`) — no changes needed to get started.

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

### 4. Start the server

```bash
pnpm dev
```

The API starts on `http://localhost:3000`. Swagger docs are at `http://localhost:3000/api`.

## Docker

Run OpenSplit in a single container with SQLite (no database service needed):

```bash
docker compose up
```

This starts the **OpenSplit API** on port 3000 with SQLite persisted in a Docker volume. Migrations and seeding run automatically on startup.

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

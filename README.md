# IVECO ACADEMY

Prototype for IVECO ACADEMY — a training management platform for IVECO's dealer network.

> **DISCLAIMER**: This is a presale prototype (v0.1.0-demo). Not for production use.

## What's Here

### Reusable (carries forward)

- **Data model** (`db/prisma/schema.prisma`) — full entity schema for courses, enrollments, evaluations, attendance
- **SQL views** (`db/views/`) — analytics layer: rankings, KPIs, at-risk detection
- **Zod schemas** (`schemas/`) — domain validation: status transitions, evaluation scoring
- **Seed data** (`db/seed/`) — deterministic test data for demos

### Disposable (prototype only)

- **API** (`api/`) — read-only Hono server, 4 endpoints
- **Frontend** (`app/`) — React + Recharts dashboards (student + director)

## Prerequisites

- Node.js 22 (see `.nvmrc`)
- pnpm 11+
- Docker + Docker Compose

## Quick Start

```bash
# Install dependencies
pnpm install

# Start MSSQL
pnpm db:up

# Run migrations + seed
pnpm db:migrate
pnpm db:seed

# Start API
pnpm --filter api dev

# Start frontend
pnpm --filter app dev
```

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm db:up` | Start MSSQL container |
| `pnpm db:down` | Stop MSSQL container |
| `pnpm db:reset` | Full reset: drop, recreate, migrate, seed |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:seed` | Seed database |

## Tech Stack

- **Database**: SQL Server 2022 (Docker) + Prisma ORM
- **API**: Hono (TypeScript)
- **Frontend**: React + Vite + Recharts
- **Validation**: Zod
- **Testing**: Vitest

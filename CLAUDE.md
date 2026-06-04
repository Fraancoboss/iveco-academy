# CLAUDE.md — Session Context

## Project

IVECO ACADEMY presale prototype. Training management platform for IVECO dealer network.

## Architecture

- **Monorepo**: pnpm workspaces (db, schemas, api, app)
- **DB**: SQL Server 2022 via Docker, Prisma ORM (MSSQL provider)
- **API**: Hono on port 3000, read-only endpoints querying SQL views
- **Frontend**: React + Vite on port 5173, Recharts for charts
- **Validation**: Hand-written Zod schemas (no drizzle-zod)

## Key Decisions

- MSSQL (not Postgres) — client/Quetzy requirement
- Prisma (not Drizzle) — better MSSQL support
- Recharts (not D3/Victory) — lighter, React-idiomatic
- No axios — native fetch only
- CSS modules — minimal dependencies
- `make` not available — use npm scripts

## DB Conventions

- UUIDs via `UNIQUEIDENTIFIER` + `NEWID()`
- No JSONB — child tables instead (e.g., `EvaluationModuleItem`)
- Views in `db/views/` applied via `prisma db execute`
- T-SQL syntax (CROSS APPLY, STRING_AGG, etc.)

## Branching

- `main` — tagged releases only
- `develop` — integration branch
- `feature/*` — all work happens here, merged to develop

## Seed Data

- Deterministic: faker seed 42
- 2 dealers, 1 school, 1 course, 2 editions
- Edition A: 12 enrolled + 3 queued apps, Edition B: 6 enrolled
- At least 1 student with avg < 5.0

## Security

- `.npmrc`: minimum-release-age=7d, ignore-scripts=true, save-exact=true
- No axios, no node-ipc in dependency tree
- CORS locked to localhost:5173
- DB port bound to 127.0.0.1 only

# Demo Script — IVECO ACADEMY v0.1.0-demo

## Prerequisites

1. Docker running
2. Node.js 22+, pnpm 11+

## Setup

```bash
pnpm install
pnpm db:up          # Start MSSQL (first time: ~1.5GB image download)
pnpm db:create      # Create iveco_academy database
pnpm db:migrate     # Apply Prisma migrations
pnpm db:views       # Apply SQL views
pnpm db:seed        # Seed deterministic demo data
```

## Running

In two terminals:

```bash
# Terminal 1 — API
pnpm dev:api

# Terminal 2 — Frontend
pnpm dev:app
```

Open http://localhost:5173

## Demo Flow

### 1. Director Dashboard (2 min)

Open http://localhost:5173/director

**Show:**
- Edition KPI cards — 12/12 enrolled in Ed. A, 6/12 in Ed. B
- Average score (~6.85), attendance (~85%)
- At-risk count: 2 students in Ed. A
- Ranking table — click student names to navigate
- At-risk students table (red highlight, avg < 5.0)
- Pending evaluations — weeks 9-10 of Ed. A missing evaluations
- Trend chart showing average across editions

### 2. Student Dashboard — Top Student (2 min)

Click the highest-ranked student from the ranking table.

**Show:**
- Overall average (high, ~8.5+)
- Ranking badge (#1 of 12)
- Attendance percentage (~90%+)
- Behavior radar — balanced high scores across all 6 axes
- Weekly line chart — student consistently above course mean
- Training breakdown bar chart — stable scores

### 3. Student Dashboard — At-Risk Student (2 min)

Navigate via nav dropdown to an at-risk student.

**Show:**
- Overall average in red (< 5.0)
- Low ranking position
- Attendance possibly lower
- Radar chart — visible weaknesses in some areas
- Weekly line chart — student below course mean
- Contrast with top student

### 4. Data Model Discussion (3 min)

Open `db/prisma/schema.prisma` to walk through:
- 12 models covering full domain
- Enrollment, evaluation, attendance tracking
- Application workflow with status history

Open `db/views/` — 7 SQL views powering the analytics:
- Rankings, attendance %, at-risk detection, pending evaluations
- All computed server-side in T-SQL, no client-side aggregation

### 5. Functional Unknowns (1 min)

Open `db/README.md` — discuss items needing client input:
1. Final exam structure/weight
2. Workshop lead assignment criteria
3. Classification tier thresholds (notable/apto/no apto)
4. Module evaluation item labels
5. Waitlist notification flow

---

## Key Points for Client

- **Qlik not needed** — SQL views + lightweight charts achieve same analytics
- **Data model is reusable** — schema and views carry forward to production
- **Dashboards are disposable** — will be rebuilt with proper design system
- **MSSQL compatible** — running on SQL Server 2022 per requirement
- **Deterministic seed** — demo data is reproducible (faker seed 42)

# Demo Script — IVECO ACADEMY v0.2.0-demo

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

**Note:** If `pnpm db:create` fails with password issues in Git Bash, run manually:
```bash
MSYS_NO_PATHCONV=1 docker exec iveco-academy-mssql bash -c \
  '/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -Q "CREATE DATABASE iveco_academy"'
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

## Demo Flow (10 min)

### 1. General Landing (1 min)

Open http://localhost:5173/

**Show:**
- Dark theme marketing page — "Plataforma de Formación IVECO"
- Features grid: dashboards, evaluación continua, detección riesgo, inscripciones, ranking, seguridad
- Role panels: Alumno, Formador, Director — each with demo link
- "Ver Escuela" and "Demo Director" CTAs

### 2. School Landing (1 min)

Navigate to http://localhost:5173/school

**Show:**
- Hero with school name and description
- Stats bar: 18 alumnos, 2 ediciones, 5 módulos, 95% asistencia
- Course cards for MEC26-01 and MEC26-02 with dates and capacity
- "Solicitar plaza" buttons linking to inscription form

### 3. Inscription Form (1 min)

Click "Solicitar plaza" on MEC26-01.

**Show:**
- Pre-selected edition from URL param
- Fill form: name, email, phone, dealer selector, edition selector
- Submit → "Solicitud en Cola" response (MEC26-01 is full: 12/12)
- Queue position displayed

### 4. Director Dashboard (2 min)

Navigate to http://localhost:5173/director

**Show:**
- Sidebar navigation with edition badges (12/12, 6/12)
- 4 KPIs: 18 alumnos, ~6.6 promedio, 2 en riesgo, 24 pendientes
- Donut distribution: 8 notable, 8 regular, 2 en riesgo
- Weekly performance line chart (both editions overlaid)
- Full ranking table with progress bars and status badges
- At-risk students panel (David Ortega ~3.1, Isabel Torres ~3.9)
- Activity feed (mock estático)

### 5. Student Dashboard — Ascending Student (2 min)

From students list, navigate to Alejandro Ruiz:
http://localhost:5173/student/{alejandro-id}

**Show:**
- Gradient header with student name + edition badge
- 4 KPIs: promedio ~6.7, ranking #7, asistencia 100%, nota taller
- **Ascending curve** in weekly line chart (starts ~4.5, ends ~8+)
- Module radar chart (5 axes) — student vs course average overlay
- Weekly gradient bars (color-coded: red→yellow→blue→teal)
- Horizontal module comparison bars with course average markers
- Right column: próximo reto, trainer feedback (mock), upcoming classes
- Achievements row: asistencia perfecta, mejora continua (+pts), mejor módulo

### 6. Student Dashboard — At-Risk Student (1 min)

Navigate to David Ortega from director's at-risk panel.

**Show:**
- Low average in red (~3.1)
- Low ranking (#12 de 12)
- Weekly line chart below course mean
- Radar with visible deficiencies
- Contrast with Alejandro's ascending trajectory

### 7. Trainer Dashboard (1 min)

Navigate to http://localhost:5173/trainer/{trainer-id}

**Show:**
- Trainer-specific sidebar with edition badges
- 4 KPIs: 18 alumnos, 90 evaluaciones, 24 pendientes, media general
- Group evolution line chart per edition
- Student table with avatars, progress bars, status badges (Notable/Apto/En riesgo)
- Top 5 students panel
- Pending evaluations list with days overdue

### 8. Data Model Discussion (1 min)

Briefly show:
- `db/prisma/schema.prisma` — 12 models, MSSQL-compatible
- `db/views/` — 7 SQL views powering all analytics
- `db/README.md` — 7 functional unknowns for client discussion

---

## Key Points for Client

- **Qlik not needed** — SQL views + Recharts achieve same analytics with less complexity
- **Data model is reusable** — schema and views carry forward to production
- **Dark design system** — professional look with design tokens for easy theming
- **6 pages demonstrating full user journeys** — landing → inscription → dashboards
- **Working POST endpoint** — inscription form creates real applications with queue logic
- **MSSQL compatible** — running on SQL Server 2022 per requirement
- **Spanish localization** — all UI and seed data in Spanish
- **Deterministic seed** — demo data is reproducible (faker seed 42)
- **"PROTOTIPO — QUETZY" watermark** visible on all pages

## Demo Student IDs

After seeding, find IDs with:
```bash
pnpm dev:api  # start API first
curl http://localhost:3000/api/students | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{JSON.parse(d).forEach(s=>console.log(s.name,s.id))})"
```

## Functional Unknowns (from db/README.md)

1. Final theoretical-practical exam: structure/weight undefined
2. Student grouping by workshop lead: assignment criteria unclear
3. Classification tiers (notable/apto/no apto): threshold values not defined
4. Module evaluation item labels: generic or pre-defined per module?
5. Waitlist notification flow: auto-notify when slot opens?
6. Attendance justification process: who approves?
7. Multi-edition student transfers: allowed?

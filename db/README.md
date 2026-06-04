# @iveco-academy/db

Database layer for IVECO Academy prototype.

## Structure

- `prisma/schema.prisma` — Prisma schema (MSSQL provider)
- `prisma/migrations/` — Prisma managed migrations
- `views/` — T-SQL view definitions (applied via `pnpm db:views`)
- `seed/index.ts` — Deterministic seed (faker seed 42)

## Views

| View | Description |
|------|-------------|
| `v_student_overall_avg` | AVG of behavior/skill criteria per enrollment |
| `v_student_weekly_breakdown` | Per-week averages + course-wide mean |
| `v_course_ranking` | RANK() by edition, ordered by overall avg |
| `v_attendance_pct` | Attendance percentage per enrollment |
| `v_students_at_risk` | Students with overall avg < 5.0 |
| `v_pending_evaluations` | Weeks overdue ≥5 days without evaluation |
| `v_edition_kpis` | Aggregate metrics per edition |

## Functional Unknowns

These items are not yet defined by the client and need clarification:

1. **Final theoretical-practical exam**: Structure and weight in final grade undefined. Is it a single score or breakdown? How does it factor into overall avg?

2. **Student grouping by workshop lead**: What criteria determine which workshop lead gets which students? Is it fixed for the edition or rotates weekly?

3. **Classification tiers**: Threshold values for "notable", "apto", and "no apto" are not defined. Current prototype flags < 5.0 as at-risk.

4. **Module evaluation item labels**: Are they generic ("Conocimiento teórico", "Aplicación práctica") or pre-defined per module? Current seed uses generic labels.

5. **Waitlist notification flow**: When a slot opens (e.g., student drops), should the system auto-notify the next waitlisted candidate? What's the priority order?

6. **Evaluation periodicity enforcement**: Can a trainer submit evaluations for past weeks? Is there a hard deadline?

7. **Multi-evaluator scenarios**: Can multiple trainers evaluate the same student for the same week?

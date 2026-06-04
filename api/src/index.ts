import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { prisma } from "./db.js";
import { rateLimit } from "./rate-limit.js";

const app = new Hono();

// Middleware
app.use("*", secureHeaders());
app.use("*", cors({ origin: "http://localhost:5173" }));
app.use("*", rateLimit);

// Helper to convert Decimal/BigInt to plain numbers
function toNumber(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  return Number(val);
}

// ─── GET /api/students/:id/dashboard ─────────────────────

app.get("/api/students/:id/dashboard", async (c) => {
  const userId = c.req.param("id");

  // Get enrollments for this user
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: { edition: true },
  });

  if (enrollments.length === 0) {
    return c.json({ error: "Student not found or has no enrollments" }, 404);
  }

  // Use first enrollment for dashboard (can be extended with query param)
  const enrollment = enrollments[0];
  const editionId = enrollment.editionId;

  // Overall average
  const overallRows: any[] = await prisma.$queryRaw`
    SELECT * FROM v_student_overall_avg
    WHERE user_id = ${userId} AND edition_id = ${editionId}
  `;
  const overall = overallRows[0] ?? null;

  // Ranking
  const rankingRows: any[] = await prisma.$queryRaw`
    SELECT * FROM v_course_ranking
    WHERE edition_id = ${editionId}
    ORDER BY ranking
  `;
  const studentRanking = rankingRows.find((r: any) => r.user_id === userId);
  const totalStudents = rankingRows.length;

  // Attendance
  const attendanceRows: any[] = await prisma.$queryRaw`
    SELECT * FROM v_attendance_pct
    WHERE user_id = ${userId} AND edition_id = ${editionId}
  `;
  const attendance = attendanceRows[0] ?? null;

  // Weekly breakdown
  const weeklyRows: any[] = await prisma.$queryRaw`
    SELECT * FROM v_student_weekly_breakdown
    WHERE user_id = ${userId} AND edition_id = ${editionId}
    ORDER BY week_number
  `;

  return c.json({
    studentId: userId,
    studentName: overall?.student_name ?? "Unknown",
    editionId,
    editionName: enrollment.edition.name,
    overallAvg: toNumber(overall?.overall_avg),
    ranking: toNumber(studentRanking?.ranking),
    totalStudents,
    attendancePct: toNumber(attendance?.attendance_pct),
    weeklyData: weeklyRows.map((w: any) => ({
      weekNumber: w.week_number,
      weekType: w.week_type,
      evalType: w.eval_type,
      weekAvg: toNumber(w.week_avg),
      courseWeekAvg: toNumber(w.course_week_avg),
      punctuality: toNumber(w.punctuality),
      attention: toNumber(w.attention),
      participation: toNumber(w.participation),
      documentation: toNumber(w.documentation),
      dexterity: toNumber(w.dexterity),
      problemSolving: toNumber(w.problem_solving),
      workshopGrade: toNumber(w.workshop_grade),
    })),
    behaviorAvgs: {
      punctuality: toNumber(overall?.avg_punctuality),
      attention: toNumber(overall?.avg_attention),
      participation: toNumber(overall?.avg_participation),
      documentation: toNumber(overall?.avg_documentation),
      dexterity: toNumber(overall?.avg_dexterity),
      problemSolving: toNumber(overall?.avg_problem_solving),
    },
  });
});

// ─── GET /api/director/kpis ──────────────────────────────

app.get("/api/director/kpis", async (c) => {
  const editionKpis: any[] = await prisma.$queryRaw`
    SELECT * FROM v_edition_kpis
  `;

  const atRisk: any[] = await prisma.$queryRaw`
    SELECT * FROM v_students_at_risk
  `;

  const pending: any[] = await prisma.$queryRaw`
    SELECT * FROM v_pending_evaluations
  `;

  return c.json({
    editions: editionKpis.map((e: any) => ({
      editionId: e.edition_id,
      editionName: e.edition_name,
      courseName: e.course_name,
      capacity: e.capacity,
      enrolledCount: e.enrolled_count,
      avgScore: toNumber(e.avg_score),
      atRiskCount: e.at_risk_count,
      avgAttendancePct: toNumber(e.avg_attendance_pct),
      totalWeeks: e.total_weeks,
      weeksWithEvaluations: e.weeks_with_evaluations,
    })),
    atRiskStudents: atRisk.map((s: any) => ({
      enrollmentId: s.enrollment_id,
      userId: s.user_id,
      editionId: s.edition_id,
      studentName: s.student_name,
      overallAvg: toNumber(s.overall_avg),
      attendancePct: toNumber(s.attendance_pct),
    })),
    pendingEvaluations: pending.map((p: any) => ({
      weekId: p.week_id,
      editionId: p.edition_id,
      editionName: p.edition_name,
      weekNumber: p.week_number,
      weekType: p.week_type,
      daysOverdue: p.days_overdue,
      studentName: p.student_name,
    })),
  });
});

// ─── GET /api/editions/:id/ranking ───────────────────────

app.get("/api/editions/:id/ranking", async (c) => {
  const editionId = c.req.param("id");

  const rankings: any[] = await prisma.$queryRaw`
    SELECT * FROM v_course_ranking
    WHERE edition_id = ${editionId}
    ORDER BY ranking
  `;

  return c.json({
    editionId,
    rankings: rankings.map((r: any) => ({
      enrollmentId: r.enrollment_id,
      userId: r.user_id,
      studentName: r.student_name,
      overallAvg: toNumber(r.overall_avg),
      ranking: toNumber(r.ranking),
    })),
  });
});

// ─── GET /api/evaluations/pending ────────────────────────

app.get("/api/evaluations/pending", async (c) => {
  const pending: any[] = await prisma.$queryRaw`
    SELECT * FROM v_pending_evaluations
    ORDER BY days_overdue DESC
  `;

  return c.json(
    pending.map((p: any) => ({
      weekId: p.week_id,
      editionId: p.edition_id,
      editionName: p.edition_name,
      weekNumber: p.week_number,
      weekType: p.week_type,
      daysOverdue: p.days_overdue,
      studentName: p.student_name,
    }))
  );
});

// ─── Meta endpoints ──────────────────────────────────────

app.get("/api/editions", async (c) => {
  const editions = await prisma.edition.findMany({
    include: { course: true },
    orderBy: { startDate: "asc" },
  });
  return c.json(editions);
});

app.get("/api/students", async (c) => {
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: {
      enrollments: {
        include: { edition: true },
      },
    },
    orderBy: { name: "asc" },
  });
  return c.json(students);
});

// ─── Start server ────────────────────────────────────────

const port = 3000;
console.log(`API running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });

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

function toNumber(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  return Number(val);
}

// ─── GET /api/students/:id/dashboard ─────────────────────

app.get("/api/students/:id/dashboard", async (c) => {
  const userId = c.req.param("id");
  const editionIdParam = c.req.query("editionId");

  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: { edition: { include: { course: true } } },
  });

  if (enrollments.length === 0) {
    return c.json({ error: "Student not found or has no enrollments" }, 404);
  }

  const enrollment = editionIdParam
    ? enrollments.find((e) => e.editionId === editionIdParam) ?? enrollments[0]
    : enrollments[0];
  const editionId = enrollment.editionId;

  const overallRows: any[] = await prisma.$queryRaw`
    SELECT * FROM v_student_overall_avg
    WHERE user_id = ${userId} AND edition_id = ${editionId}
  `;
  const overall = overallRows[0] ?? null;

  const rankingRows: any[] = await prisma.$queryRaw`
    SELECT * FROM v_course_ranking WHERE edition_id = ${editionId} ORDER BY ranking
  `;
  const studentRanking = rankingRows.find((r: any) => r.user_id === userId);
  const totalStudents = rankingRows.length;

  const attendanceRows: any[] = await prisma.$queryRaw`
    SELECT * FROM v_attendance_pct WHERE user_id = ${userId} AND edition_id = ${editionId}
  `;
  const attendance = attendanceRows[0] ?? null;

  const weeklyRows: any[] = await prisma.$queryRaw`
    SELECT * FROM v_student_weekly_breakdown
    WHERE user_id = ${userId} AND edition_id = ${editionId}
    ORDER BY week_number
  `;

  // Module averages for radar chart (average score per module via module items)
  const moduleAvgs: any[] = await prisma.$queryRaw`
    SELECT m.name AS module_name, AVG(emi.score) AS avg_score
    FROM evaluation_module_items emi
    INNER JOIN evaluations ev ON ev.id = emi.evaluationId
    INNER JOIN enrollments en ON en.id = ev.enrollmentId
    INNER JOIN weeks w ON w.id = ev.weekId
    INNER JOIN modules m ON m.id = w.moduleId
    WHERE en.userId = ${userId} AND en.editionId = ${editionId}
    GROUP BY m.name, m.[order]
    ORDER BY m.[order]
  `;

  // Course-wide module averages for radar comparison
  const courseModuleAvgs: any[] = await prisma.$queryRaw`
    SELECT m.name AS module_name, AVG(emi.score) AS avg_score
    FROM evaluation_module_items emi
    INNER JOIN evaluations ev ON ev.id = emi.evaluationId
    INNER JOIN enrollments en ON en.id = ev.enrollmentId
    INNER JOIN weeks w ON w.id = ev.weekId
    INNER JOIN modules m ON m.id = w.moduleId
    WHERE en.editionId = ${editionId}
    GROUP BY m.name, m.[order]
    ORDER BY m.[order]
  `;

  // Future weeks for upcoming classes
  const futureWeeks = await prisma.week.findMany({
    where: {
      editionId,
      startDate: { gte: new Date() },
    },
    include: { module: true },
    orderBy: { weekNumber: "asc" },
    take: 3,
  });

  // Available editions for selector
  const availableEditions = enrollments.map((e) => ({
    editionId: e.editionId,
    editionName: e.edition.name,
  }));

  return c.json({
    studentId: userId,
    studentName: overall?.student_name ?? "Unknown",
    editionId,
    editionName: enrollment.edition.name,
    courseName: enrollment.edition.course?.name ?? "",
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
    moduleAvgs: moduleAvgs.map((m: any) => ({
      moduleName: m.module_name,
      studentAvg: toNumber(m.avg_score),
    })),
    courseModuleAvgs: courseModuleAvgs.map((m: any) => ({
      moduleName: m.module_name,
      courseAvg: toNumber(m.avg_score),
    })),
    upcomingClasses: futureWeeks.map((w) => ({
      weekId: w.id,
      weekNumber: w.weekNumber,
      weekType: w.weekType,
      moduleName: w.module?.name ?? null,
      startDate: w.startDate.toISOString(),
      endDate: w.endDate.toISOString(),
    })),
    availableEditions,
  });
});

// ─── GET /api/trainer/:id/dashboard ──────────────────────

app.get("/api/trainer/:id/dashboard", async (c) => {
  const trainerId = c.req.param("id");

  const trainer = await prisma.user.findUnique({ where: { id: trainerId } });
  if (!trainer) return c.json({ error: "Trainer not found" }, 404);

  // Get all editions (trainer sees all)
  const editions = await prisma.edition.findMany({
    include: { course: true },
    orderBy: { startDate: "asc" },
  });

  const editionKpis: any[] = await prisma.$queryRaw`SELECT * FROM v_edition_kpis`;

  // Evaluations done by this trainer
  const evalCount = await prisma.evaluation.count({
    where: { evaluatorId: trainerId },
  });

  // Pending evaluations
  const pending: any[] = await prisma.$queryRaw`SELECT * FROM v_pending_evaluations`;

  // Top students across editions
  const topStudents: any[] = await prisma.$queryRaw`
    SELECT TOP 5 * FROM v_course_ranking ORDER BY overall_avg DESC
  `;

  // Group evolution - weekly averages per edition
  const weeklyAvgs: any[] = await prisma.$queryRaw`
    SELECT
      w.editionId AS edition_id,
      w.weekNumber AS week_number,
      AVG(
        (ISNULL(ev.punctuality,0)+ISNULL(ev.attention,0)+ISNULL(ev.participation,0)+
         ISNULL(ev.documentation,0)+ISNULL(ev.dexterity,0)+ISNULL(ev.problemSolving,0)+
         ISNULL(ev.workshopGrade,0)) /
        NULLIF(
          CASE WHEN ev.punctuality IS NOT NULL THEN 1 ELSE 0 END+
          CASE WHEN ev.attention IS NOT NULL THEN 1 ELSE 0 END+
          CASE WHEN ev.participation IS NOT NULL THEN 1 ELSE 0 END+
          CASE WHEN ev.documentation IS NOT NULL THEN 1 ELSE 0 END+
          CASE WHEN ev.dexterity IS NOT NULL THEN 1 ELSE 0 END+
          CASE WHEN ev.problemSolving IS NOT NULL THEN 1 ELSE 0 END+
          CASE WHEN ev.workshopGrade IS NOT NULL THEN 1 ELSE 0 END, 0)
      ) AS week_avg
    FROM evaluations ev
    INNER JOIN weeks w ON w.id = ev.weekId
    GROUP BY w.editionId, w.weekNumber
    ORDER BY w.editionId, w.weekNumber
  `;

  // All student rankings for student list
  const allRankings: any[] = await prisma.$queryRaw`
    SELECT * FROM v_course_ranking ORDER BY edition_id, ranking
  `;

  return c.json({
    trainer: { id: trainer.id, name: trainer.name, role: trainer.role },
    editions: editionKpis.map((e: any) => ({
      editionId: e.edition_id,
      editionName: e.edition_name,
      courseName: e.course_name,
      capacity: e.capacity,
      enrolledCount: e.enrolled_count,
      avgScore: toNumber(e.avg_score),
      avgAttendancePct: toNumber(e.avg_attendance_pct),
      totalWeeks: e.total_weeks,
      weeksWithEvaluations: e.weeks_with_evaluations,
    })),
    totalStudents: allRankings.length,
    evaluationCount: evalCount,
    pendingEvaluations: pending.map((p: any) => ({
      weekId: p.week_id,
      editionId: p.edition_id,
      editionName: p.edition_name,
      weekNumber: p.week_number,
      weekType: p.week_type,
      daysOverdue: p.days_overdue,
      studentName: p.student_name,
      userId: p.user_id,
    })),
    topStudents: topStudents.map((s: any) => ({
      userId: s.user_id,
      studentName: s.student_name,
      overallAvg: toNumber(s.overall_avg),
      editionId: s.edition_id,
      ranking: toNumber(s.ranking),
    })),
    weeklyAvgs: weeklyAvgs.map((w: any) => ({
      editionId: w.edition_id,
      weekNumber: w.week_number,
      weekAvg: toNumber(w.week_avg),
    })),
    allStudents: allRankings.map((r: any) => ({
      userId: r.user_id,
      studentName: r.student_name,
      overallAvg: toNumber(r.overall_avg),
      editionId: r.edition_id,
      ranking: toNumber(r.ranking),
    })),
  });
});

// ─── GET /api/director/kpis ──────────────────────────────

app.get("/api/director/kpis", async (c) => {
  const editionKpis: any[] = await prisma.$queryRaw`SELECT * FROM v_edition_kpis`;
  const atRisk: any[] = await prisma.$queryRaw`SELECT * FROM v_students_at_risk`;
  const pending: any[] = await prisma.$queryRaw`SELECT * FROM v_pending_evaluations`;

  // All student scores for distribution donut
  const allScores: any[] = await prisma.$queryRaw`
    SELECT overall_avg FROM v_student_overall_avg WHERE evaluation_count > 0
  `;

  // Weekly averages for trend chart
  const weeklyAvgs: any[] = await prisma.$queryRaw`
    SELECT
      w.editionId AS edition_id,
      w.weekNumber AS week_number,
      AVG(
        (ISNULL(ev.punctuality,0)+ISNULL(ev.attention,0)+ISNULL(ev.participation,0)+
         ISNULL(ev.documentation,0)+ISNULL(ev.dexterity,0)+ISNULL(ev.problemSolving,0)+
         ISNULL(ev.workshopGrade,0)) /
        NULLIF(
          CASE WHEN ev.punctuality IS NOT NULL THEN 1 ELSE 0 END+
          CASE WHEN ev.attention IS NOT NULL THEN 1 ELSE 0 END+
          CASE WHEN ev.participation IS NOT NULL THEN 1 ELSE 0 END+
          CASE WHEN ev.documentation IS NOT NULL THEN 1 ELSE 0 END+
          CASE WHEN ev.dexterity IS NOT NULL THEN 1 ELSE 0 END+
          CASE WHEN ev.problemSolving IS NOT NULL THEN 1 ELSE 0 END+
          CASE WHEN ev.workshopGrade IS NOT NULL THEN 1 ELSE 0 END, 0)
      ) AS week_avg
    FROM evaluations ev
    INNER JOIN weeks w ON w.id = ev.weekId
    GROUP BY w.editionId, w.weekNumber
    ORDER BY w.editionId, w.weekNumber
  `;

  // Distribution buckets (scale 0-10 → percentage ×10)
  const scores = allScores.map((s: any) => toNumber(s.overall_avg) ?? 0);
  const distribution = {
    excellent: scores.filter((s) => s * 10 >= 85).length,
    good: scores.filter((s) => s * 10 >= 70 && s * 10 < 85).length,
    regular: scores.filter((s) => s * 10 >= 50 && s * 10 < 70).length,
    atRisk: scores.filter((s) => s * 10 < 50).length,
    total: scores.length,
  };

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
      approvedCount: e.approved_count,
      pendingCount: e.pending_count,
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
    distribution,
    weeklyAvgs: weeklyAvgs.map((w: any) => ({
      editionId: w.edition_id,
      weekNumber: w.week_number,
      weekAvg: toNumber(w.week_avg),
    })),
  });
});

// ─── GET /api/editions/:id/ranking ───────────────────────

app.get("/api/editions/:id/ranking", async (c) => {
  const editionId = c.req.param("id");
  const rankings: any[] = await prisma.$queryRaw`
    SELECT * FROM v_course_ranking WHERE edition_id = ${editionId} ORDER BY ranking
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
    SELECT * FROM v_pending_evaluations ORDER BY days_overdue DESC
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

// ─── POST /api/applications ──────────────────────────────

app.post("/api/applications", async (c) => {
  const body = await c.req.json();

  // Validate required fields
  const { candidateName, candidateEmail, candidatePhone, dealerId, editionId } = body;
  if (!candidateName || !candidateEmail || !dealerId || !editionId) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  // Check edition exists and get capacity
  const edition = await prisma.edition.findUnique({ where: { id: editionId } });
  if (!edition) return c.json({ error: "Edition not found" }, 404);

  // Count approved applications
  const approvedCount = await prisma.application.count({
    where: { editionId, status: "APPROVED" },
  });

  const app_ = await prisma.application.create({
    data: {
      candidateName,
      candidateEmail,
      candidatePhone: candidatePhone ?? null,
      dealerId,
      editionId,
      status: "RECEIVED",
    },
  });

  // Count total RECEIVED ahead of this one (queue position)
  const queuePosition = await prisma.application.count({
    where: { editionId, status: "RECEIVED" },
  });

  const isFull = approvedCount >= edition.capacity;

  return c.json({
    id: app_.id,
    status: "RECEIVED",
    editionFull: isFull,
    queuePosition: isFull ? queuePosition : null,
    capacity: edition.capacity,
    enrolledCount: approvedCount,
    message: isFull
      ? `La edición está completa (${approvedCount}/${edition.capacity}). Tu solicitud está en cola (posición ${queuePosition}).`
      : `Solicitud recibida. La edición tiene ${edition.capacity - approvedCount} plazas disponibles.`,
  });
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
    include: { enrollments: { include: { edition: true } } },
    orderBy: { name: "asc" },
  });
  return c.json(students);
});

app.get("/api/trainers", async (c) => {
  const trainers = await prisma.user.findMany({
    where: { role: { in: ["TRAINER", "WORKSHOP_LEAD"] } },
    orderBy: { name: "asc" },
  });
  return c.json(trainers);
});

app.get("/api/dealers", async (c) => {
  const dealers = await prisma.dealer.findMany({ orderBy: { name: "asc" } });
  return c.json(dealers);
});

// ─── Start server ────────────────────────────────────────

const port = 3000;
console.log(`API running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });

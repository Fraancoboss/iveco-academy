import { z } from "zod";

// ─── Student Dashboard DTO ──────────────────────────────

export const StudentWeeklyDataSchema = z.object({
  weekNumber: z.number(),
  weekType: z.string(),
  evalType: z.string().nullable(),
  weekAvg: z.number().nullable(),
  courseWeekAvg: z.number().nullable(),
  punctuality: z.number().nullable(),
  attention: z.number().nullable(),
  participation: z.number().nullable(),
  documentation: z.number().nullable(),
  dexterity: z.number().nullable(),
  problemSolving: z.number().nullable(),
  workshopGrade: z.number().nullable(),
});

export const StudentDashboardDTO = z.object({
  studentId: z.string(),
  studentName: z.string(),
  editionId: z.string(),
  editionName: z.string(),
  overallAvg: z.number().nullable(),
  ranking: z.number().nullable(),
  totalStudents: z.number(),
  attendancePct: z.number().nullable(),
  weeklyData: z.array(StudentWeeklyDataSchema),
  behaviorAvgs: z.object({
    punctuality: z.number().nullable(),
    attention: z.number().nullable(),
    participation: z.number().nullable(),
    documentation: z.number().nullable(),
    dexterity: z.number().nullable(),
    problemSolving: z.number().nullable(),
  }),
});
export type StudentDashboard = z.infer<typeof StudentDashboardDTO>;

// ─── Director KPIs DTO ──────────────────────────────────

export const EditionKpiSchema = z.object({
  editionId: z.string(),
  editionName: z.string(),
  courseName: z.string(),
  capacity: z.number(),
  enrolledCount: z.number(),
  avgScore: z.number().nullable(),
  atRiskCount: z.number(),
  avgAttendancePct: z.number().nullable(),
  totalWeeks: z.number(),
  weeksWithEvaluations: z.number(),
});

export const AtRiskStudentSchema = z.object({
  enrollmentId: z.string(),
  userId: z.string(),
  editionId: z.string(),
  studentName: z.string(),
  overallAvg: z.number(),
  attendancePct: z.number().nullable(),
});

export const PendingEvaluationSchema = z.object({
  weekId: z.string(),
  editionId: z.string(),
  editionName: z.string(),
  weekNumber: z.number(),
  weekType: z.string(),
  daysOverdue: z.number(),
  studentName: z.string(),
});

export const DirectorKpisDTO = z.object({
  editions: z.array(EditionKpiSchema),
  atRiskStudents: z.array(AtRiskStudentSchema),
  pendingEvaluations: z.array(PendingEvaluationSchema),
});
export type DirectorKpis = z.infer<typeof DirectorKpisDTO>;

// ─── Ranking DTO ────────────────────────────────────────

export const RankingEntrySchema = z.object({
  enrollmentId: z.string(),
  userId: z.string(),
  studentName: z.string(),
  overallAvg: z.number().nullable(),
  ranking: z.number(),
});

export const EditionRankingDTO = z.object({
  editionId: z.string(),
  rankings: z.array(RankingEntrySchema),
});
export type EditionRanking = z.infer<typeof EditionRankingDTO>;

import { z } from "zod";
import { UserRole, ApplicationStatus, WeekType, EvalType } from "./enums.js";

const score = z.number().min(0).max(10);
const optionalScore = score.nullable().optional();

export const DealerSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  code: z.string().min(1).max(50),
  city: z.string().min(1).max(100),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Dealer = z.infer<typeof DealerSchema>;

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().max(255),
  name: z.string().min(1).max(200),
  phone: z.string().max(50).nullable().optional(),
  role: UserRole,
  dealerId: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type User = z.infer<typeof UserSchema>;

export const SchoolSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  location: z.string().min(1).max(200),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type School = z.infer<typeof SchoolSchema>;

export const CourseSchema = z.object({
  id: z.string().uuid(),
  schoolId: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Course = z.infer<typeof CourseSchema>;

export const EditionSchema = z.object({
  id: z.string().uuid(),
  courseId: z.string().uuid(),
  name: z.string().min(1).max(200),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  capacity: z.number().int().min(1).default(12),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Edition = z.infer<typeof EditionSchema>;

export const ModuleSchema = z.object({
  id: z.string().uuid(),
  courseId: z.string().uuid(),
  name: z.string().min(1).max(200),
  order: z.number().int().min(1),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Module = z.infer<typeof ModuleSchema>;

export const ApplicationSchema = z.object({
  id: z.string().uuid(),
  candidateName: z.string().min(1).max(200),
  candidateEmail: z.string().email().max(255),
  candidatePhone: z.string().max(50).nullable().optional(),
  dealerId: z.string().uuid(),
  editionId: z.string().uuid(),
  status: ApplicationStatus,
  submittedAt: z.coerce.date(),
  reviewedBy: z.string().uuid().nullable().optional(),
  reviewedAt: z.coerce.date().nullable().optional(),
});
export type Application = z.infer<typeof ApplicationSchema>;

export const EnrollmentSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  editionId: z.string().uuid(),
  applicationId: z.string().uuid(),
  enrolledAt: z.coerce.date(),
});
export type Enrollment = z.infer<typeof EnrollmentSchema>;

export const WeekSchema = z.object({
  id: z.string().uuid(),
  editionId: z.string().uuid(),
  weekNumber: z.number().int().min(1),
  weekType: WeekType,
  moduleId: z.string().uuid().nullable().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});
export type Week = z.infer<typeof WeekSchema>;

export const EvaluationSchema = z.object({
  id: z.string().uuid(),
  enrollmentId: z.string().uuid(),
  weekId: z.string().uuid(),
  evaluatorId: z.string().uuid(),
  evalType: EvalType,
  punctuality: optionalScore,
  attention: optionalScore,
  participation: optionalScore,
  documentation: optionalScore,
  dexterity: optionalScore,
  problemSolving: optionalScore,
  workshopGrade: optionalScore,
  comments: z.string().nullable().optional(),
  evaluatedAt: z.coerce.date(),
});
export type Evaluation = z.infer<typeof EvaluationSchema>;

export const EvaluationModuleItemSchema = z.object({
  id: z.string().uuid(),
  evaluationId: z.string().uuid(),
  itemName: z.string().min(1).max(200),
  score: score,
});
export type EvaluationModuleItem = z.infer<typeof EvaluationModuleItemSchema>;

export const AttendanceSchema = z.object({
  id: z.string().uuid(),
  enrollmentId: z.string().uuid(),
  weekId: z.string().uuid(),
  present: z.boolean(),
  notes: z.string().nullable().optional(),
});
export type Attendance = z.infer<typeof AttendanceSchema>;

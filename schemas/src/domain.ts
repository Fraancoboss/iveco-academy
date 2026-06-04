import { z } from "zod";
import { ApplicationStatus } from "./enums.js";

// ─── Application ────────────────────────────────────────

export const ApplicationCreateSchema = z.object({
  candidateName: z.string().min(1).max(200),
  candidateEmail: z.string().email().max(255),
  candidatePhone: z.string().max(50).optional(),
  dealerId: z.string().uuid(),
  editionId: z.string().uuid(),
});
export type ApplicationCreate = z.infer<typeof ApplicationCreateSchema>;

// Legal status transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  RECEIVED: ["IN_REVIEW"],
  IN_REVIEW: ["APPROVED", "REJECTED", "WAITLISTED"],
  WAITLISTED: ["IN_REVIEW", "APPROVED"],
};

export const ApplicationStatusTransitionSchema = z
  .object({
    fromStatus: ApplicationStatus,
    toStatus: ApplicationStatus,
    changedBy: z.string().uuid(),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      const allowed = VALID_TRANSITIONS[data.fromStatus];
      return allowed !== undefined && allowed.includes(data.toStatus);
    },
    {
      message: "Invalid status transition",
      path: ["toStatus"],
    }
  );
export type ApplicationStatusTransition = z.infer<typeof ApplicationStatusTransitionSchema>;

// ─── Evaluation ─────────────────────────────────────────

const score0to10 = z.number().min(0).max(10);

const moduleItemSchema = z.object({
  itemName: z.string().min(1).max(200),
  score: score0to10,
});

export const TrainingEvaluationSchema = z.object({
  enrollmentId: z.string().uuid(),
  weekId: z.string().uuid(),
  evaluatorId: z.string().uuid(),
  punctuality: score0to10,
  attention: score0to10,
  participation: score0to10,
  documentation: score0to10,
  dexterity: score0to10,
  problemSolving: score0to10,
  moduleItems: z.array(moduleItemSchema).max(6),
  comments: z.string().optional(),
});
export type TrainingEvaluation = z.infer<typeof TrainingEvaluationSchema>;

export const WorkshopEvaluationSchema = z.object({
  enrollmentId: z.string().uuid(),
  weekId: z.string().uuid(),
  evaluatorId: z.string().uuid(),
  workshopGrade: score0to10,
  comments: z.string().optional(),
});
export type WorkshopEvaluation = z.infer<typeof WorkshopEvaluationSchema>;

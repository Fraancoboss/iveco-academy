import { z } from "zod";

export const UserRole = z.enum([
  "STUDENT",
  "TRAINER",
  "WORKSHOP_LEAD",
  "DEALER_MANAGER",
  "IVECO_ADMIN",
]);
export type UserRole = z.infer<typeof UserRole>;

export const ApplicationStatus = z.enum([
  "RECEIVED",
  "IN_REVIEW",
  "APPROVED",
  "REJECTED",
  "WAITLISTED",
]);
export type ApplicationStatus = z.infer<typeof ApplicationStatus>;

export const WeekType = z.enum(["TRAINING", "WORKSHOP"]);
export type WeekType = z.infer<typeof WeekType>;

export const EvalType = z.enum(["TRAINING", "WORKSHOP"]);
export type EvalType = z.infer<typeof EvalType>;

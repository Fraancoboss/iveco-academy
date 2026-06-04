import { describe, it, expect } from "vitest";
import {
  ApplicationStatusTransitionSchema,
  TrainingEvaluationSchema,
  WorkshopEvaluationSchema,
} from "../src/domain.js";

const uuid = "00000000-0000-0000-0000-000000000001";

describe("ApplicationStatusTransitionSchema", () => {
  it("accepts RECEIVED → IN_REVIEW", () => {
    const result = ApplicationStatusTransitionSchema.safeParse({
      fromStatus: "RECEIVED",
      toStatus: "IN_REVIEW",
      changedBy: uuid,
    });
    expect(result.success).toBe(true);
  });

  it("accepts IN_REVIEW → APPROVED", () => {
    const result = ApplicationStatusTransitionSchema.safeParse({
      fromStatus: "IN_REVIEW",
      toStatus: "APPROVED",
      changedBy: uuid,
    });
    expect(result.success).toBe(true);
  });

  it("accepts IN_REVIEW → REJECTED", () => {
    const result = ApplicationStatusTransitionSchema.safeParse({
      fromStatus: "IN_REVIEW",
      toStatus: "REJECTED",
      changedBy: uuid,
    });
    expect(result.success).toBe(true);
  });

  it("rejects RECEIVED → APPROVED (must go through IN_REVIEW)", () => {
    const result = ApplicationStatusTransitionSchema.safeParse({
      fromStatus: "RECEIVED",
      toStatus: "APPROVED",
      changedBy: uuid,
    });
    expect(result.success).toBe(false);
  });

  it("rejects APPROVED → RECEIVED (no backwards)", () => {
    const result = ApplicationStatusTransitionSchema.safeParse({
      fromStatus: "APPROVED",
      toStatus: "RECEIVED",
      changedBy: uuid,
    });
    expect(result.success).toBe(false);
  });

  it("rejects REJECTED → APPROVED", () => {
    const result = ApplicationStatusTransitionSchema.safeParse({
      fromStatus: "REJECTED",
      toStatus: "APPROVED",
      changedBy: uuid,
    });
    expect(result.success).toBe(false);
  });
});

describe("TrainingEvaluationSchema", () => {
  const validTrainingEval = {
    enrollmentId: uuid,
    weekId: uuid,
    evaluatorId: uuid,
    punctuality: 7.5,
    attention: 8.0,
    participation: 6.5,
    documentation: 7.0,
    dexterity: 8.5,
    problemSolving: 7.0,
    moduleItems: [
      { itemName: "Teoría", score: 8.0 },
      { itemName: "Práctica", score: 7.5 },
    ],
  };

  it("accepts valid training evaluation", () => {
    const result = TrainingEvaluationSchema.safeParse(validTrainingEval);
    expect(result.success).toBe(true);
  });

  it("rejects score of 11 (above max 10)", () => {
    const result = TrainingEvaluationSchema.safeParse({
      ...validTrainingEval,
      punctuality: 11,
    });
    expect(result.success).toBe(false);
  });

  it("rejects score of -1 (below min 0)", () => {
    const result = TrainingEvaluationSchema.safeParse({
      ...validTrainingEval,
      attention: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects 7 module items (max 6)", () => {
    const result = TrainingEvaluationSchema.safeParse({
      ...validTrainingEval,
      moduleItems: Array.from({ length: 7 }, (_, i) => ({
        itemName: `Item ${i}`,
        score: 5.0,
      })),
    });
    expect(result.success).toBe(false);
  });

  it("accepts 6 module items (at max)", () => {
    const result = TrainingEvaluationSchema.safeParse({
      ...validTrainingEval,
      moduleItems: Array.from({ length: 6 }, (_, i) => ({
        itemName: `Item ${i}`,
        score: 5.0,
      })),
    });
    expect(result.success).toBe(true);
  });

  it("accepts 0 module items", () => {
    const result = TrainingEvaluationSchema.safeParse({
      ...validTrainingEval,
      moduleItems: [],
    });
    expect(result.success).toBe(true);
  });

  it("rejects module item with score 11", () => {
    const result = TrainingEvaluationSchema.safeParse({
      ...validTrainingEval,
      moduleItems: [{ itemName: "Test", score: 11 }],
    });
    expect(result.success).toBe(false);
  });
});

describe("WorkshopEvaluationSchema", () => {
  it("accepts valid workshop evaluation", () => {
    const result = WorkshopEvaluationSchema.safeParse({
      enrollmentId: uuid,
      weekId: uuid,
      evaluatorId: uuid,
      workshopGrade: 8.5,
    });
    expect(result.success).toBe(true);
  });

  it("rejects workshopGrade of 11", () => {
    const result = WorkshopEvaluationSchema.safeParse({
      enrollmentId: uuid,
      weekId: uuid,
      evaluatorId: uuid,
      workshopGrade: 11,
    });
    expect(result.success).toBe(false);
  });

  it("rejects workshopGrade of -1", () => {
    const result = WorkshopEvaluationSchema.safeParse({
      enrollmentId: uuid,
      weekId: uuid,
      evaluatorId: uuid,
      workshopGrade: -1,
    });
    expect(result.success).toBe(false);
  });
});

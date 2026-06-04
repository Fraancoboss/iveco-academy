import { PrismaClient, Prisma } from "@prisma/client";
import { faker } from "@faker-js/faker";

faker.seed(42);

const prisma = new PrismaClient();

// Helper to generate a deterministic UUID-like string using faker
function genId(): string {
  return faker.string.uuid();
}

// Generate a score with some variance around a center
function score(center: number, variance: number = 1.5): Prisma.Decimal {
  const val = Math.min(10, Math.max(0, center + faker.number.float({ min: -variance, max: variance })));
  return new Prisma.Decimal(val.toFixed(2));
}

async function main() {
  console.log("Seeding database...");

  // ─── Dealers ─────────────────────────────────────────
  const dealer1Id = genId();
  const dealer2Id = genId();

  await prisma.dealer.createMany({
    data: [
      { id: dealer1Id, name: "Concesionario Norte S.A.", code: "DLR-NORTE-001", city: "Madrid" },
      { id: dealer2Id, name: "Concesionario Sur S.L.", code: "DLR-SUR-002", city: "Sevilla" },
    ],
  });

  // ─── School ──────────────────────────────────────────
  const schoolId = genId();
  await prisma.school.create({
    data: { id: schoolId, name: "IVECO Academy Madrid", location: "Madrid, Spain" },
  });

  // ─── Course ──────────────────────────────────────────
  const courseId = genId();
  await prisma.course.create({
    data: {
      id: courseId,
      schoolId,
      name: "Técnico de Servicio IVECO S-Way",
      description: "Programa de formación técnica especializada para la gama IVECO S-Way. Cubre diagnóstico electrónico, sistemas de freno, motor y transmisión.",
    },
  });

  // ─── Modules ─────────────────────────────────────────
  const moduleNames = [
    "Sistemas Electrónicos y Diagnóstico",
    "Motor y Gestión de Combustible",
    "Transmisión y Embrague",
    "Sistema de Frenos ABS/EBS",
    "Suspensión Neumática",
    "Climatización y Confort",
  ];

  const moduleIds: string[] = [];
  for (let i = 0; i < moduleNames.length; i++) {
    const id = genId();
    moduleIds.push(id);
    await prisma.module.create({
      data: { id, courseId, name: moduleNames[i], order: i + 1 },
    });
  }

  // ─── Editions ────────────────────────────────────────
  const editionAId = genId();
  const editionBId = genId();

  await prisma.edition.createMany({
    data: [
      {
        id: editionAId,
        courseId,
        name: "Edición 2026-A (Enero-Abril)",
        startDate: new Date("2026-01-12"),
        endDate: new Date("2026-04-03"),
        capacity: 12,
      },
      {
        id: editionBId,
        courseId,
        name: "Edición 2026-B (Mayo-Julio)",
        startDate: new Date("2026-05-04"),
        endDate: new Date("2026-07-24"),
        capacity: 12,
      },
    ],
  });

  // ─── Admin / Trainers ────────────────────────────────
  const adminId = genId();
  await prisma.user.create({
    data: {
      id: adminId,
      email: "admin@iveco-academy.es",
      name: "Carlos Martínez",
      phone: "+34 600 000 001",
      role: "IVECO_ADMIN",
      dealerId: dealer1Id,
    },
  });

  const trainerId = genId();
  await prisma.user.create({
    data: {
      id: trainerId,
      email: "trainer@iveco-academy.es",
      name: "Ana López García",
      phone: "+34 600 000 002",
      role: "TRAINER",
      dealerId: dealer1Id,
    },
  });

  const workshopLeadId = genId();
  await prisma.user.create({
    data: {
      id: workshopLeadId,
      email: "workshop.lead@iveco-academy.es",
      name: "Roberto Fernández",
      phone: "+34 600 000 003",
      role: "WORKSHOP_LEAD",
      dealerId: dealer1Id,
    },
  });

  // ─── Students (Edition A: 12 enrolled + Edition B: 6 enrolled) ──
  interface StudentData {
    id: string;
    name: string;
    email: string;
    dealerId: string;
    targetAvg: number; // used to generate realistic evaluations
  }

  const studentsEditionA: StudentData[] = [];
  for (let i = 0; i < 12; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const dealerId = i < 7 ? dealer1Id : dealer2Id;
    // Students 10,11 will be at-risk (low scores)
    const targetAvg = i >= 10 ? faker.number.float({ min: 3.0, max: 4.5 }) : faker.number.float({ min: 5.5, max: 9.0 });
    studentsEditionA.push({
      id: genId(),
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      dealerId,
      targetAvg,
    });
  }

  const studentsEditionB: StudentData[] = [];
  for (let i = 0; i < 6; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const dealerId = i < 3 ? dealer1Id : dealer2Id;
    studentsEditionB.push({
      id: genId(),
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      dealerId,
      targetAvg: faker.number.float({ min: 5.0, max: 9.0 }),
    });
  }

  // Create all student users
  const allStudents = [...studentsEditionA, ...studentsEditionB];
  for (const s of allStudents) {
    await prisma.user.create({
      data: {
        id: s.id,
        email: s.email,
        name: s.name,
        phone: faker.phone.number({ style: "international" }),
        role: "STUDENT",
        dealerId: s.dealerId,
      },
    });
  }

  // ─── Applications (Edition A) ─────────────────────────
  // 12 approved → enrolled, 3 received (queued), 1 rejected
  const applicationIdsA: string[] = [];

  // 12 approved applications
  for (let i = 0; i < 12; i++) {
    const s = studentsEditionA[i];
    const appId = genId();
    applicationIdsA.push(appId);

    await prisma.application.create({
      data: {
        id: appId,
        candidateName: s.name,
        candidateEmail: s.email,
        candidatePhone: faker.phone.number({ style: "international" }),
        dealerId: s.dealerId,
        editionId: editionAId,
        status: "APPROVED",
        submittedAt: new Date("2025-11-15"),
        reviewedBy: adminId,
        reviewedAt: new Date("2025-12-01"),
      },
    });

    // Status history: RECEIVED → IN_REVIEW → APPROVED
    const histIds = [genId(), genId()];
    await prisma.applicationStatusHistory.createMany({
      data: [
        {
          id: histIds[0],
          applicationId: appId,
          fromStatus: "RECEIVED",
          toStatus: "IN_REVIEW",
          changedBy: adminId,
          changedAt: new Date("2025-11-20"),
        },
        {
          id: histIds[1],
          applicationId: appId,
          fromStatus: "IN_REVIEW",
          toStatus: "APPROVED",
          changedBy: adminId,
          changedAt: new Date("2025-12-01"),
        },
      ],
    });
  }

  // 3 queued (RECEIVED status)
  for (let i = 0; i < 3; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    await prisma.application.create({
      data: {
        id: genId(),
        candidateName: `${firstName} ${lastName}`,
        candidateEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.queue@example.com`,
        candidatePhone: faker.phone.number({ style: "international" }),
        dealerId: i < 2 ? dealer1Id : dealer2Id,
        editionId: editionAId,
        status: "RECEIVED",
        submittedAt: new Date("2025-12-10"),
      },
    });
  }

  // 1 rejected
  const rejAppId = genId();
  await prisma.application.create({
    data: {
      id: rejAppId,
      candidateName: faker.person.fullName(),
      candidateEmail: "rejected@example.com",
      dealerId: dealer2Id,
      editionId: editionAId,
      status: "REJECTED",
      submittedAt: new Date("2025-11-15"),
      reviewedBy: adminId,
      reviewedAt: new Date("2025-12-01"),
    },
  });
  await prisma.applicationStatusHistory.createMany({
    data: [
      {
        id: genId(),
        applicationId: rejAppId,
        fromStatus: "RECEIVED",
        toStatus: "IN_REVIEW",
        changedBy: adminId,
        changedAt: new Date("2025-11-20"),
      },
      {
        id: genId(),
        applicationId: rejAppId,
        fromStatus: "IN_REVIEW",
        toStatus: "REJECTED",
        changedBy: adminId,
        changedAt: new Date("2025-12-01"),
        notes: "No cumple requisitos mínimos de experiencia",
      },
    ],
  });

  // ─── Enrollments (Edition A: 12) ──────────────────────
  const enrollmentIdsA: string[] = [];
  for (let i = 0; i < 12; i++) {
    const enrollId = genId();
    enrollmentIdsA.push(enrollId);
    await prisma.enrollment.create({
      data: {
        id: enrollId,
        userId: studentsEditionA[i].id,
        editionId: editionAId,
        applicationId: applicationIdsA[i],
        enrolledAt: new Date("2026-01-05"),
      },
    });
  }

  // Applications + Enrollments for Edition B
  const enrollmentIdsB: string[] = [];
  for (let i = 0; i < 6; i++) {
    const s = studentsEditionB[i];
    const appId = genId();
    await prisma.application.create({
      data: {
        id: appId,
        candidateName: s.name,
        candidateEmail: s.email,
        dealerId: s.dealerId,
        editionId: editionBId,
        status: "APPROVED",
        submittedAt: new Date("2026-03-01"),
        reviewedBy: adminId,
        reviewedAt: new Date("2026-03-15"),
      },
    });

    const enrollId = genId();
    enrollmentIdsB.push(enrollId);
    await prisma.enrollment.create({
      data: {
        id: enrollId,
        userId: s.id,
        editionId: editionBId,
        applicationId: appId,
        enrolledAt: new Date("2026-04-28"),
      },
    });
  }

  // ─── Weeks ───────────────────────────────────────────
  // Edition A: 10 weeks alternating TRAINING/WORKSHOP
  const weeksA: { id: string; weekNumber: number; weekType: string; moduleId: string | null }[] = [];
  const edAStart = new Date("2026-01-12");
  for (let w = 1; w <= 10; w++) {
    const weekStart = new Date(edAStart);
    weekStart.setDate(edAStart.getDate() + (w - 1) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 4); // Mon-Fri

    const weekType = w % 3 === 0 ? "WORKSHOP" : "TRAINING";
    const moduleIdx = weekType === "TRAINING" ? Math.min(Math.floor((w - 1) / 2), moduleIds.length - 1) : null;
    const weekId = genId();
    weeksA.push({ id: weekId, weekNumber: w, weekType, moduleId: moduleIdx !== null ? moduleIds[moduleIdx] : null });

    await prisma.week.create({
      data: {
        id: weekId,
        editionId: editionAId,
        weekNumber: w,
        weekType,
        moduleId: moduleIdx !== null ? moduleIds[moduleIdx] : null,
        startDate: weekStart,
        endDate: weekEnd,
      },
    });
  }

  // Edition B: 8 weeks
  const weeksB: { id: string; weekNumber: number; weekType: string }[] = [];
  const edBStart = new Date("2026-05-04");
  for (let w = 1; w <= 8; w++) {
    const weekStart = new Date(edBStart);
    weekStart.setDate(edBStart.getDate() + (w - 1) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 4);

    const weekType = w % 3 === 0 ? "WORKSHOP" : "TRAINING";
    const moduleIdx = weekType === "TRAINING" ? Math.min(Math.floor((w - 1) / 2), moduleIds.length - 1) : null;
    const weekId = genId();
    weeksB.push({ id: weekId, weekNumber: w, weekType });

    await prisma.week.create({
      data: {
        id: weekId,
        editionId: editionBId,
        weekNumber: w,
        weekType,
        moduleId: moduleIdx !== null ? moduleIds[moduleIdx] : null,
        startDate: weekStart,
        endDate: weekEnd,
      },
    });
  }

  // ─── Evaluations (Edition A, first 8 weeks evaluated) ─
  for (let wi = 0; wi < 8; wi++) {
    const week = weeksA[wi];
    for (let si = 0; si < 12; si++) {
      const student = studentsEditionA[si];
      const enrollmentId = enrollmentIdsA[si];
      const evalId = genId();

      const isWorkshop = week.weekType === "WORKSHOP";
      const evalType = isWorkshop ? "WORKSHOP" : "TRAINING";
      const evaluatorId = isWorkshop ? workshopLeadId : trainerId;

      await prisma.evaluation.create({
        data: {
          id: evalId,
          enrollmentId,
          weekId: week.id,
          evaluatorId,
          evalType,
          punctuality: isWorkshop ? null : score(student.targetAvg),
          attention: isWorkshop ? null : score(student.targetAvg),
          participation: isWorkshop ? null : score(student.targetAvg),
          documentation: isWorkshop ? null : score(student.targetAvg, 2),
          dexterity: isWorkshop ? null : score(student.targetAvg),
          problemSolving: isWorkshop ? null : score(student.targetAvg, 2),
          workshopGrade: isWorkshop ? score(student.targetAvg) : null,
          comments: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }) ?? null,
          evaluatedAt: new Date(
            new Date(weeksA[wi].id ? "2026-01-12" : "2026-01-12").getTime() +
            wi * 7 * 24 * 60 * 60 * 1000 + 5 * 24 * 60 * 60 * 1000
          ),
        },
      });

      // Module items for training evaluations
      if (!isWorkshop && week.moduleId) {
        const itemNames = ["Conocimiento teórico", "Aplicación práctica", "Uso de herramientas", "Seguridad"];
        for (const itemName of itemNames) {
          await prisma.evaluationModuleItem.create({
            data: {
              id: genId(),
              evaluationId: evalId,
              itemName,
              score: score(student.targetAvg, 1.5),
            },
          });
        }
      }
    }
  }

  // Edition B: 4 weeks evaluated (edition is in progress)
  for (let wi = 0; wi < 4; wi++) {
    const week = weeksB[wi];
    for (let si = 0; si < 6; si++) {
      const student = studentsEditionB[si];
      const enrollmentId = enrollmentIdsB[si];
      const isWorkshop = week.weekType === "WORKSHOP";
      const evalType = isWorkshop ? "WORKSHOP" : "TRAINING";

      await prisma.evaluation.create({
        data: {
          id: genId(),
          enrollmentId,
          weekId: week.id,
          evaluatorId: isWorkshop ? workshopLeadId : trainerId,
          evalType,
          punctuality: isWorkshop ? null : score(student.targetAvg),
          attention: isWorkshop ? null : score(student.targetAvg),
          participation: isWorkshop ? null : score(student.targetAvg),
          documentation: isWorkshop ? null : score(student.targetAvg, 2),
          dexterity: isWorkshop ? null : score(student.targetAvg),
          problemSolving: isWorkshop ? null : score(student.targetAvg, 2),
          workshopGrade: isWorkshop ? score(student.targetAvg) : null,
          comments: null,
        },
      });
    }
  }

  // ─── Attendance ──────────────────────────────────────
  // Edition A: all 10 weeks
  for (let wi = 0; wi < weeksA.length; wi++) {
    for (let si = 0; si < 12; si++) {
      // Most students: 85-100% attendance. Students 10,11 (at-risk): ~70%
      const attendanceProb = si >= 10 ? 0.7 : 0.92;
      const present = faker.datatype.boolean({ probability: attendanceProb });
      await prisma.attendance.create({
        data: {
          id: genId(),
          enrollmentId: enrollmentIdsA[si],
          weekId: weeksA[wi].id,
          present,
          notes: !present ? faker.helpers.arrayElement(["Ausencia justificada", "Sin justificación", "Baja médica"]) : null,
        },
      });
    }
  }

  // Edition B: 8 weeks
  for (let wi = 0; wi < weeksB.length; wi++) {
    for (let si = 0; si < 6; si++) {
      const present = faker.datatype.boolean({ probability: 0.9 });
      await prisma.attendance.create({
        data: {
          id: genId(),
          enrollmentId: enrollmentIdsB[si],
          weekId: weeksB[wi].id,
          present,
          notes: !present ? "Ausencia justificada" : null,
        },
      });
    }
  }

  console.log("Seed completed successfully.");
  console.log("Edition A: 12 enrolled, 3 queued, 1 rejected");
  console.log("Edition B: 6 enrolled");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

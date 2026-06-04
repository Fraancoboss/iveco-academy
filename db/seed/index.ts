import { PrismaClient, Prisma } from "@prisma/client";
import { faker } from "@faker-js/faker";

faker.seed(42);

const prisma = new PrismaClient();

function genId(): string {
  return faker.string.uuid();
}

function score(center: number, variance: number = 1.5): Prisma.Decimal {
  const val = Math.min(10, Math.max(0, center + faker.number.float({ min: -variance, max: variance })));
  return new Prisma.Decimal(val.toFixed(2));
}

// Ascending score for demo student: starts low, increases per week
function ascendingScore(weekIndex: number, totalWeeks: number): Prisma.Decimal {
  const base = 5.0 + (weekIndex / (totalWeeks - 1)) * 3.5; // 5.0 → 8.5
  const val = Math.min(10, Math.max(0, base + faker.number.float({ min: -0.5, max: 0.5 })));
  return new Prisma.Decimal(val.toFixed(2));
}

const SPANISH_STUDENTS_A = [
  "Alejandro Ruiz", "María García", "Pablo Hernández", "Laura Martín",
  "Javier López", "Carmen Sánchez", "Daniel Moreno", "Sofía Navarro",
  "Hugo Jiménez", "Lucía Romero",
  "David Ortega", "Isabel Torres",
];

const SPANISH_STUDENTS_B = [
  "Andrés Vega", "Elena Molina", "Marcos Gil", "Patricia Díaz",
  "Álvaro Reyes", "Natalia Castro",
];

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
    data: { id: schoolId, name: "Escuela de Mecánicos IVECO", location: "Madrid, España" },
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
        name: "MEC26-01",
        startDate: new Date("2026-01-12"),
        endDate: new Date("2026-04-03"),
        capacity: 12,
      },
      {
        id: editionBId,
        courseId,
        name: "MEC26-02",
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
      phone: "+34 600 100 001",
      role: "IVECO_ADMIN",
      dealerId: dealer1Id,
    },
  });

  const trainerId = genId();
  await prisma.user.create({
    data: {
      id: trainerId,
      email: "ana.lopez@iveco-academy.es",
      name: "Ana López García",
      phone: "+34 600 100 002",
      role: "TRAINER",
      dealerId: dealer1Id,
    },
  });

  const workshopLeadId = genId();
  await prisma.user.create({
    data: {
      id: workshopLeadId,
      email: "roberto.fernandez@iveco-academy.es",
      name: "Roberto Fernández",
      phone: "+34 600 100 003",
      role: "WORKSHOP_LEAD",
      dealerId: dealer1Id,
    },
  });

  const dealerManagerId = genId();
  await prisma.user.create({
    data: {
      id: dealerManagerId,
      email: "manager@concesionario-norte.es",
      name: "Fernando Ruiz",
      phone: "+34 600 100 004",
      role: "DEALER_MANAGER",
      dealerId: dealer1Id,
    },
  });

  // ─── Students ────────────────────────────────────────
  interface StudentData {
    id: string;
    name: string;
    email: string;
    dealerId: string;
    targetAvg: number;
    ascending?: boolean; // demo student with ascending curve
  }

  const studentsEditionA: StudentData[] = SPANISH_STUDENTS_A.map((name, i) => {
    const [first, last] = name.split(" ");
    const dealerId = i < 7 ? dealer1Id : dealer2Id;
    // Index 0 (Alejandro) = ascending demo student
    // Index 10,11 (David, Isabel) = at-risk students
    let targetAvg: number;
    let ascending = false;
    if (i === 0) {
      targetAvg = 7.0; // average will come from ascending function
      ascending = true;
    } else if (i >= 10) {
      targetAvg = faker.number.float({ min: 3.0, max: 4.5 });
    } else {
      targetAvg = faker.number.float({ min: 5.5, max: 9.0 });
    }
    return {
      id: genId(),
      name,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@concesionario.es`,
      dealerId,
      targetAvg,
      ascending,
    };
  });

  const studentsEditionB: StudentData[] = SPANISH_STUDENTS_B.map((name, i) => {
    const [first, last] = name.split(" ");
    return {
      id: genId(),
      name,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@concesionario.es`,
      dealerId: i < 3 ? dealer1Id : dealer2Id,
      targetAvg: faker.number.float({ min: 5.0, max: 9.0 }),
    };
  });

  // Create all student users
  for (const s of [...studentsEditionA, ...studentsEditionB]) {
    await prisma.user.create({
      data: {
        id: s.id,
        email: s.email,
        name: s.name,
        phone: `+34 6${faker.string.numeric(8)}`,
        role: "STUDENT",
        dealerId: s.dealerId,
      },
    });
  }

  // ─── Applications (Edition A) ─────────────────────────
  const applicationIdsA: string[] = [];

  for (let i = 0; i < 12; i++) {
    const s = studentsEditionA[i];
    const appId = genId();
    applicationIdsA.push(appId);

    await prisma.application.create({
      data: {
        id: appId,
        candidateName: s.name,
        candidateEmail: s.email,
        candidatePhone: `+34 6${faker.string.numeric(8)}`,
        dealerId: s.dealerId,
        editionId: editionAId,
        status: "APPROVED",
        submittedAt: new Date("2025-11-15"),
        reviewedBy: adminId,
        reviewedAt: new Date("2025-12-01"),
      },
    });

    await prisma.applicationStatusHistory.createMany({
      data: [
        {
          id: genId(),
          applicationId: appId,
          fromStatus: "RECEIVED",
          toStatus: "IN_REVIEW",
          changedBy: adminId,
          changedAt: new Date("2025-11-20"),
        },
        {
          id: genId(),
          applicationId: appId,
          fromStatus: "IN_REVIEW",
          toStatus: "APPROVED",
          changedBy: adminId,
          changedAt: new Date("2025-12-01"),
        },
      ],
    });
  }

  // 3 queued (RECEIVED)
  const queuedNames = ["Miguel Ángel Torres", "Rosa Delgado", "Francisco Ruiz"];
  for (let i = 0; i < 3; i++) {
    await prisma.application.create({
      data: {
        id: genId(),
        candidateName: queuedNames[i],
        candidateEmail: `cola${i + 1}@concesionario.es`,
        candidatePhone: `+34 6${faker.string.numeric(8)}`,
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
      candidateName: "Pedro Muñoz",
      candidateEmail: "pedro.munoz@concesionario.es",
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
      { id: genId(), applicationId: rejAppId, fromStatus: "RECEIVED", toStatus: "IN_REVIEW", changedBy: adminId, changedAt: new Date("2025-11-20") },
      { id: genId(), applicationId: rejAppId, fromStatus: "IN_REVIEW", toStatus: "REJECTED", changedBy: adminId, changedAt: new Date("2025-12-01"), notes: "No cumple requisitos mínimos de experiencia" },
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

  // Edition B
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
  const weeksA: { id: string; weekNumber: number; weekType: string; moduleId: string | null }[] = [];
  const edAStart = new Date("2026-01-12");
  for (let w = 1; w <= 10; w++) {
    const weekStart = new Date(edAStart);
    weekStart.setDate(edAStart.getDate() + (w - 1) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 4);

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

  // ─── Evaluations ─────────────────────────────────────
  for (let wi = 0; wi < 8; wi++) {
    const week = weeksA[wi];
    for (let si = 0; si < 12; si++) {
      const student = studentsEditionA[si];
      const enrollmentId = enrollmentIdsA[si];
      const evalId = genId();
      const isWorkshop = week.weekType === "WORKSHOP";
      const evaluatorId = isWorkshop ? workshopLeadId : trainerId;

      // Use ascending scores for demo student (index 0)
      const getScore = student.ascending
        ? () => ascendingScore(wi, 8)
        : () => score(student.targetAvg);

      const evalDate = new Date(edAStart);
      evalDate.setDate(edAStart.getDate() + wi * 7 + 5);

      await prisma.evaluation.create({
        data: {
          id: evalId,
          enrollmentId,
          weekId: week.id,
          evaluatorId,
          evalType: isWorkshop ? "WORKSHOP" : "TRAINING",
          punctuality: isWorkshop ? null : getScore(),
          attention: isWorkshop ? null : getScore(),
          participation: isWorkshop ? null : getScore(),
          documentation: isWorkshop ? null : score(student.ascending ? 5 + (wi / 7) * 3 : student.targetAvg, 2),
          dexterity: isWorkshop ? null : getScore(),
          problemSolving: isWorkshop ? null : score(student.ascending ? 5 + (wi / 7) * 3.5 : student.targetAvg, 2),
          workshopGrade: isWorkshop ? getScore() : null,
          comments: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }) ?? null,
          evaluatedAt: evalDate,
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
              score: student.ascending ? ascendingScore(wi, 8) : score(student.targetAvg, 1.5),
            },
          });
        }
      }
    }
  }

  // Edition B: 4 weeks evaluated
  for (let wi = 0; wi < 4; wi++) {
    const week = weeksB[wi];
    for (let si = 0; si < 6; si++) {
      const student = studentsEditionB[si];
      const isWorkshop = week.weekType === "WORKSHOP";

      await prisma.evaluation.create({
        data: {
          id: genId(),
          enrollmentId: enrollmentIdsB[si],
          weekId: week.id,
          evaluatorId: isWorkshop ? workshopLeadId : trainerId,
          evalType: isWorkshop ? "WORKSHOP" : "TRAINING",
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
  for (let wi = 0; wi < weeksA.length; wi++) {
    for (let si = 0; si < 12; si++) {
      const attendanceProb = si >= 10 ? 0.7 : (si === 0 ? 0.98 : 0.92);
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
  console.log("Edition A (MEC26-01): 12 enrolled, 3 queued, 1 rejected");
  console.log("Edition B (MEC26-02): 6 enrolled");
  console.log("Demo student (ascending): Alejandro Ruiz");
  console.log(`Trainer ID: ${trainerId}`);
  console.log(`Admin ID: ${adminId}`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from "@prisma/client";
import { execSync } from "node:child_process";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) throw new Error("DATABASE_URL is not set");

// Step 1: Create iveco_academy database via master connection
const masterUrl = dbUrl.replace(/database=[^;]+/i, "database=master");
const master = new PrismaClient({ datasources: { db: { url: masterUrl } } });
try {
  await master.$executeRawUnsafe(
    "IF DB_ID('iveco_academy') IS NULL CREATE DATABASE iveco_academy"
  );
  console.log("[db-setup] ✓ Database ready");
} finally {
  await master.$disconnect();
}

// Step 2: Run migrations
console.log("[db-setup] Running migrations...");
execSync("pnpm --filter db exec prisma migrate deploy", { stdio: "inherit" });
console.log("[db-setup] ✓ Migrations applied");

// Step 3: Apply SQL views
console.log("[db-setup] Applying views...");
execSync("pnpm --filter db run views:apply", { stdio: "inherit" });
console.log("[db-setup] ✓ Views applied");

// Step 4: Seed only on first run
const app = new PrismaClient();
const dealerCount = await app.dealer.count().catch(() => 0);
if (dealerCount === 0) {
  console.log("[db-setup] Seeding database...");
  execSync("pnpm --filter db exec prisma db seed", { stdio: "inherit" });
  console.log("[db-setup] ✓ Seeded");
} else {
  console.log(`[db-setup] ✓ Already seeded (${dealerCount} dealers), skipping`);
}
await app.$disconnect();

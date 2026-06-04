import { PrismaClient } from "@prisma/client";
import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const viewsDir = join(__dirname, "..", "views");

async function applyViews() {
  const prisma = new PrismaClient();

  try {
    const files = readdirSync(viewsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const file of files) {
      let sql = readFileSync(join(viewsDir, file), "utf-8").trim();

      // Remove trailing semicolon if present
      if (sql.endsWith(";")) {
        sql = sql.slice(0, -1).trim();
      }

      // Extract view name from CREATE OR ALTER VIEW <name>
      const match = sql.match(/CREATE\s+OR\s+ALTER\s+VIEW\s+(\w+)/i);
      if (match) {
        const viewName = match[1];
        // Drop the view if exists
        await prisma.$executeRawUnsafe(
          `IF OBJECT_ID('${viewName}', 'V') IS NOT NULL DROP VIEW [${viewName}]`
        );
        // Replace CREATE OR ALTER with CREATE and wrap in EXEC
        const createSql = sql.replace(/CREATE\s+OR\s+ALTER\s+VIEW/i, "CREATE VIEW");
        const escaped = createSql.replace(/'/g, "''");
        await prisma.$executeRawUnsafe(`EXEC('${escaped}')`);
      } else {
        await prisma.$executeRawUnsafe(sql);
      }

      console.log(`Applied: ${file}`);
    }

    console.log("All views applied successfully.");
  } catch (error) {
    console.error("Error applying views:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

applyViews();

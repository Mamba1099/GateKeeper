import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

function validateEnv() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set in environment");
  }
}

interface EmployeeSeed {
  email: string;
  full_name: string;
  department_code: string;
  position: string;
}

async function seedEmployees() {
  try {
    validateEnv();

    console.log("Creating employees...\n");

    const existingEmployees = await prisma.user.count({
      where: { role: "EMPLOYEE" },
    });

    if (existingEmployees > 0) {
      console.log(`Found ${existingEmployees} existing employees. Skipping.`);
      return;
    }

    const departments = await prisma.department.findMany({
      where: { is_active: true },
    });

    if (departments.length === 0) {
      console.error("No active departments found.");
      console.log("Please run main seed first.");
      process.exit(1);
    }

    console.log(`Found ${departments.length} active departments:\n`);

    const defaultPassword =
      process.env.DEFAULT_EMPLOYEE_PASSWORD || "Password123!";

    const employees: EmployeeSeed[] = [
      {
        email: "alice.johnson@gatekeeper.com",
        full_name: "Alice Johnson",
        department_code: "ENG",
        position: "Senior Software Engineer",
      },
      {
        email: "bob.smith@gatekeeper.com",
        full_name: "Bob Smith",
        department_code: "ENG",
        position: "Junior Developer",
      },
      {
        email: "carol.williams@gatekeeper.com",
        full_name: "Carol Williams",
        department_code: "FIN",
        position: "Financial Analyst",
      },
      {
        email: "david.brown@gatekeeper.com",
        full_name: "David Brown",
        department_code: "CORP",
        position: "Marketing Manager",
      },
      {
        email: "emma.davis@gatekeeper.com",
        full_name: "Emma Davis",
        department_code: "OPS",
        position: "Operations Lead",
      },
      {
        email: "frank.miller@gatekeeper.com",
        full_name: "Frank Miller",
        department_code: "HRAD",
        position: "HR Coordinator",
      },
      {
        email: "grace.wilson@gatekeeper.com",
        full_name: "Grace Wilson",
        department_code: "LEGAL",
        position: "Legal Assistant",
      },
      {
        email: "henry.moore@gatekeeper.com",
        full_name: "Henry Moore",
        department_code: "INFRA",
        position: "IT Support Specialist",
      },
      {
        email: "irene.taylor@gatekeeper.com",
        full_name: "Irene Taylor",
        department_code: "FIN",
        position: "Accountant",
      },
      {
        email: "jack.anderson@gatekeeper.com",
        full_name: "Jack Anderson",
        department_code: "MARINE",
        position: "Marine Operations Coordinator",
      },
      {
        email: "karen.thomas@gatekeeper.com",
        full_name: "Karen Thomas",
        department_code: "FERRY",
        position: "Ferry Operations Manager",
      },
      {
        email: "leo.martin@gatekeeper.com",
        full_name: "Leo Martin",
        department_code: "CONTAINER",
        position: "Terminal Operations Supervisor",
      },
      {
        email: "mia.jackson@gatekeeper.com",
        full_name: "Mia Jackson",
        department_code: "CARGO",
        position: "Cargo Documentation Specialist",
      },
      {
        email: "noah.white@gatekeeper.com",
        full_name: "Noah White",
        department_code: "ICD",
        position: "Inland Depot Coordinator",
      },
      {
        email: "olivia.harris@gatekeeper.com",
        full_name: "Olivia Harris",
        department_code: "OPS",
        position: "Operations Analyst",
      },
    ];

    let created = 0;
    let skipped = 0;
    let failed = 0;

    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    const departmentMap = new Map(departments.map((d) => [d.code, d]));

    for (const emp of employees) {
      try {
        const existing = await prisma.user.findUnique({
          where: { email: emp.email },
        });

        if (existing) {
          console.log(`Skipping ${emp.full_name} - already exists`);
          skipped++;
          continue;
        }

        const department = departmentMap.get(emp.department_code);

        if (!department) {
          console.log(`Skipping ${emp.full_name} - department not found`);
          skipped++;
          continue;
        }

        await prisma.user.create({
          data: {
            email: emp.email.toLowerCase(),
            password_hash: passwordHash,
            full_name: emp.full_name,
            role: "EMPLOYEE",
            department_id: department.id,
            position: emp.position,
            is_active: true,
          },
        });

        console.log(`Created: ${emp.full_name} - ${emp.position}`);
        created++;
      } catch (error) {
        console.error(
          `Failed to create ${emp.full_name}:`,
          error instanceof Error ? error.message : error,
        );
        failed++;
      }
    }

    console.log(`\nSummary:`);
    console.log(`   Created: ${created} employees`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Default password: ${defaultPassword}`);

    if (created > 0) {
      console.log(`\nLogin credentials:`);
      console.log(`   Password: ${defaultPassword}`);
    }

    console.log("\nEmployee seeding completed!");
  } catch (error) {
    console.error(
      "Seeding failed:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
  process.exit(1);
});

seedEmployees();

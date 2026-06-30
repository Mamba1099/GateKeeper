import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

const ADMIN_EMAIL = getEnvVar("ADMIN_EMAIL");
const ADMIN_PASSWORD = getEnvVar("ADMIN_PASSWORD");
const ADMIN_FULL_NAME = getEnvVar("ADMIN_FULL_NAME");

const HR_EMAIL = getEnvVar("HR_EMAIL");
const HR_PASSWORD = getEnvVar("HR_PASSWORD");
const HR_FULL_NAME = getEnvVar("HR_FULL_NAME");

async function main() {
  console.log("🌱 Seeding database...");
  console.log(`📧 ADMIN: ${ADMIN_EMAIL}`);
  console.log(`📧 HR: ${HR_EMAIL}`);

  const departments = [
    {
      name: "Operations Division",
      code: "OPS",
      standard_check_in: "08:00",
      standard_check_out: "15:00",
      description: "Day-to-day operations, supply chain, logistics",
    },
    {
      name: "Engineering",
      code: "ENG",
      standard_check_in: "08:00",
      standard_check_out: "15:00",
      description: "Design, development, technical operations",
    },
    {
      name: "Finance",
      code: "FIN",
      standard_check_in: "08:00",
      standard_check_out: "15:00",
      description: "Financial management, accounting, budgeting",
    },
    {
      name: "Human Resource & Administration Division",
      code: "HRAD",
      standard_check_in: "08:00",
      standard_check_out: "15:00",
      description: "HR, recruitment, admin, facility management",
    },
    {
      name: "Corporate Services",
      code: "CORP",
      standard_check_in: "08:00",
      standard_check_out: "15:00",
      description: "Strategy, business planning, corporate affairs",
    },
    {
      name: "Legal Services",
      code: "LEGAL",
      standard_check_in: "08:00",
      standard_check_out: "15:00",
      description: "Legal advice, compliance, contracts",
    },
    {
      name: "Infrastructure Services",
      code: "INFRA",
      standard_check_in: "08:00",
      standard_check_out: "15:00",
      description: "IT, facilities, security, maintenance",
    },
    {
      name: "Marine Operations",
      code: "MARINE",
      standard_check_in: "07:30",
      standard_check_out: "16:00",
      description: "Marine vessel operations and coordination",
    },
    {
      name: "Ferry Services",
      code: "FERRY",
      standard_check_in: "06:00",
      standard_check_out: "18:00",
      description: "Ferry operations and passenger services",
    },
    {
      name: "Container Terminal Department",
      code: "CONTAINER",
      standard_check_in: "07:00",
      standard_check_out: "16:00",
      description: "Container handling and terminal operations",
    },
    {
      name: "Conventional Cargo Department",
      code: "CARGO",
      standard_check_in: "07:00",
      standard_check_out: "16:00",
      description: "General cargo handling and documentation",
    },
    {
      name: "Inland Container Depots",
      code: "ICD",
      standard_check_in: "08:00",
      standard_check_out: "15:00",
      description: "Inland container depot operations",
    },
  ];

  console.log("📁 Creating departments...");

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { code: dept.code },
      update: {
        name: dept.name,
        description: dept.description,
        standard_check_in: dept.standard_check_in,
        standard_check_out: dept.standard_check_out,
      },
      create: dept,
    });
  }

  console.log(`✅ ${departments.length} departments created`);

  console.log("⚙️ Creating check-in settings...");

  const allDepartments = await prisma.department.findMany();

  for (const dept of allDepartments) {
    await prisma.checkInSetting.upsert({
      where: { department_id: dept.id },
      update: {
        standard_time: dept.standard_check_in,
        grace_minutes: 15,
        late_threshold_minutes: 30,
      },
      create: {
        department_id: dept.id,
        standard_time: dept.standard_check_in,
        grace_minutes: 15,
        late_threshold_minutes: 30,
      },
    });
  }

  console.log(`✅ ${allDepartments.length} check-in settings created`);

  console.log("👤 Creating admin user...");

  const adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const adminDept = await prisma.department.findUnique({
    where: { code: "HRAD" },
  });

  if (!adminDept) throw new Error("HRAD department not found");

  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      password_hash: adminPasswordHash,
      full_name: ADMIN_FULL_NAME,
      role: "ADMIN",
      department_id: adminDept.id,
      position: "System Administrator",
      is_active: true,
    },
    create: {
      email: ADMIN_EMAIL,
      password_hash: adminPasswordHash,
      full_name: ADMIN_FULL_NAME,
      role: "ADMIN",
      department_id: adminDept.id,
      position: "System Administrator",
      is_active: true,
    },
  });

  console.log(`✅ Admin user created: ${ADMIN_EMAIL}`);

  console.log("👤 Creating HR user...");

  const hrPasswordHash = await bcrypt.hash(HR_PASSWORD, 10);
  const hrDept = await prisma.department.findUnique({
    where: { code: "HRAD" },
  });

  if (!hrDept) throw new Error("HRAD department not found");

  await prisma.user.upsert({
    where: { email: HR_EMAIL },
    update: {
      password_hash: hrPasswordHash,
      full_name: HR_FULL_NAME,
      role: "HR",
      department_id: hrDept.id,
      position: "Human Resources Manager",
      is_active: true,
    },
    create: {
      email: HR_EMAIL,
      password_hash: hrPasswordHash,
      full_name: HR_FULL_NAME,
      role: "HR",
      department_id: hrDept.id,
      position: "Human Resources Manager",
      is_active: true,
    },
  });

  console.log(`✅ HR user created: ${HR_EMAIL}`);

  const deptList = await prisma.department.findMany({
    orderBy: { name: "asc" },
  });

  console.log("\n✅✅✅ SEEDING COMPLETE!\n");
  console.log("SYSTEM USERS:");
  console.log(`  ADMIN: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`  HR: ${HR_EMAIL} / ${HR_PASSWORD}\n`);
  console.log("DEPARTMENTS:");
  deptList.forEach((dept, i) => {
    console.log(
      `  ${i + 1}. ${dept.name} (${dept.code}) - ${dept.standard_check_in} to ${dept.standard_check_out}`,
    );
  });
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

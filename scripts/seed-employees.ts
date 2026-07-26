import { prisma } from "../lib/prisma";

async function seedEmployees() {
  console.log("👥 Creating employees...\n");

  const departments = await prisma.department.findMany({
    where: { is_active: true },
  });

  if (departments.length === 0) {
    console.error("❌ No departments found. Please create departments first.");
    process.exit(1);
  }

  console.log(`📋 Found ${departments.length} departments:`);
  departments.forEach((d) => console.log(`   - ${d.name} (${d.code})`));
  console.log("");

  const employees = [
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
      department_code: "MKT",
      position: "Marketing Manager",
    },
    {
      email: "emma.davis@gatekeeper.com",
      full_name: "Emma Davis",
      department_code: "OPS",
      position: "Operations Lead",
    },
  ];

  let created = 0;
  let skipped = 0;

  for (const emp of employees) {
    const department = departments.find((d) => d.code === emp.department_code);

    if (!department) {
      console.log(
        `   ⚠️ Skipping ${emp.full_name} - department ${emp.department_code} not found`,
      );
      skipped++;
      continue;
    }

    const existing = await prisma.user.findUnique({
      where: { email: emp.email },
    });

    if (existing) {
      console.log(`   ⏭️ ${emp.full_name} already exists (${emp.email})`);
      skipped++;
      continue;
    }

    await prisma.user.create({
      data: {
        email: emp.email,
        password_hash: "$2b$10$dummyhash12345678901234567890",
        full_name: emp.full_name,
        role: "EMPLOYEE",
        department_id: department.id,
        position: emp.position,
        is_active: true,
      },
    });

    console.log(
      `   ✅ ${emp.full_name} - ${emp.position} (${department.name})`,
    );
    created++;
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Created: ${created} employees`);
  console.log(`   ⏭️ Skipped: ${skipped}`);
  console.log("\n✅ Employee seeding completed!");
}

seedEmployees()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("❌ Failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

import { prisma } from "../lib/prisma";
import { subDays, format } from "date-fns";

async function generateDummyCheckIns() {
  console.log("🌱 Generating dummy check-in data...");

  // ✅ Find the first EMPLOYEE user
  const user = await prisma.user.findFirst({
    where: {
      role: "EMPLOYEE",
      is_active: true,
    },
    include: { department: true },
  });

  if (!user) {
    console.error("❌ No active EMPLOYEE user found in the database");
    console.log("💡 Please create an employee first or run the seed script.");
    process.exit(1);
  }

  console.log(`👤 Employee found: ${user.full_name} (${user.email})`);
  console.log(`📋 Department: ${user.department?.name || "N/A"}`);

  const standardCheckIn = user.department?.standard_check_in || "08:00";
  const standardCheckOut = user.department?.standard_check_out || "15:00";
  const [inHour, inMinute] = standardCheckIn.split(":").map(Number);
  const [outHour, outMinute] = standardCheckOut.split(":").map(Number);

  console.log(
    `⏰ Standard Check-in: ${standardCheckIn}, Check-out: ${standardCheckOut}`,
  );

  const today = new Date();
  let createdCount = 0;
  let skippedCount = 0;
  for (let i = 10; i >= 0; i--) {
    const date = subDays(today, i);
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      console.log(`   ⏭️ Skipping weekend: ${format(date, "EEE, MMM dd")}`);
      continue;
    }

    const existing = await prisma.checkIn.findFirst({
      where: {
        user_id: user.id,
        date: {
          gte: new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            0,
            0,
            0,
          ),
          lt: new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate() + 1,
            0,
            0,
            0,
          ),
        },
      },
    });

    if (existing) {
      console.log(`   ⏭️ Already exists: ${format(date, "EEE, MMM dd")}`);
      skippedCount++;
      continue;
    }

    // Generate random arrival time (-15 to +45 minutes from standard)
    const arrivalVariance = Math.floor(Math.random() * 60) - 15; // -15 to +45
    const arrivalHour = inHour + Math.floor((inMinute + arrivalVariance) / 60);
    const arrivalMinute = (inMinute + arrivalVariance) % 60;

    const checkInTime = new Date(date);
    checkInTime.setHours(arrivalHour, arrivalMinute, 0, 0);

    // Generate random departure time (-30 to +30 minutes from standard)
    const departureVariance = Math.floor(Math.random() * 60) - 30; // -30 to +30
    const departureHour =
      outHour + Math.floor((outMinute + departureVariance) / 60);
    const departureMinute = (outMinute + departureVariance) % 60;

    const checkOutTime = new Date(date);
    checkOutTime.setHours(departureHour, departureMinute, 0, 0);

    // Calculate late/early
    const standardDateTime = new Date(date);
    standardDateTime.setHours(inHour, inMinute, 0, 0);

    const isLate = checkInTime > standardDateTime;
    const lateMinutes = isLate
      ? Math.floor(
          (checkInTime.getTime() - standardDateTime.getTime()) / (1000 * 60),
        )
      : 0;

    const isEarly = checkInTime < standardDateTime;
    const earlyMinutes = isEarly
      ? Math.floor(
          (standardDateTime.getTime() - checkInTime.getTime()) / (1000 * 60),
        )
      : 0;

    // Calculate hours worked
    const hoursWorked =
      (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

    // Check early departure
    const standardDepartureTime = new Date(date);
    standardDepartureTime.setHours(outHour, outMinute, 0, 0);

    const isEarlyDeparture = checkOutTime < standardDepartureTime;
    const earlyDepartureMinutes = isEarlyDeparture
      ? Math.floor(
          (standardDepartureTime.getTime() - checkOutTime.getTime()) /
            (1000 * 60),
        )
      : 0;

    // Create check-in record
    await prisma.checkIn.create({
      data: {
        user_id: user.id,
        check_in_time: checkInTime,
        check_out_time: checkOutTime,
        date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        is_late: isLate,
        late_minutes: lateMinutes,
        is_early: isEarly,
        early_minutes: earlyMinutes,
        is_early_departure: isEarlyDeparture,
        early_departure_minutes: earlyDepartureMinutes,
        hours_worked: hoursWorked,
        status: isLate ? "LATE" : "CHECKED_IN",
      },
    });

    // Create daily arrival data
    await prisma.dailyArrivalData.create({
      data: {
        user_id: user.id,
        date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        arrival_minutes: arrivalVariance,
        departure_minutes: departureVariance,
        is_late: isLate,
        is_early: isEarly,
        is_early_departure: isEarlyDeparture,
      },
    });

    createdCount++;
    console.log(
      `   ✅ Created: ${format(date, "EEE, MMM dd")} | Check-in: ${format(checkInTime, "hh:mm a")} | Check-out: ${format(checkOutTime, "hh:mm a")} | Hours: ${hoursWorked.toFixed(1)}h${isLate ? " ⚠️ Late" : ""}`,
    );
  }

  // Update employee metrics
  console.log("\n📊 Updating employee metrics...");
  await updateMetrics(user.id);

  console.log("\n📊 Summary:");
  console.log(`   ✅ Created: ${createdCount} check-ins`);
  console.log(`   ⏭️ Skipped: ${skippedCount} (already exist)`);
  console.log(`   👤 Employee: ${user.full_name} (${user.email})`);
  console.log("\n✅ Done!");
}

async function updateMetrics(userId: string) {
  const checkIns = await prisma.checkIn.findMany({
    where: { user_id: userId },
  });

  const totalCheckIns = checkIns.length;
  const onTimeCheckIns = checkIns.filter((c) => !c.is_late).length;
  const lateCheckIns = checkIns.filter((c) => c.is_late).length;
  const earlyDepartures = checkIns.filter((c) => c.is_early_departure).length;
  const totalHours = checkIns.reduce(
    (sum, c) => sum + (c.hours_worked || 0),
    0,
  );

  // Calculate streak
  const sortedCheckIns = checkIns.sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );
  let currentStreak = 0;
  let bestStreak = 0;
  let streak = 0;

  for (const checkIn of sortedCheckIns) {
    if (!checkIn.is_late) {
      streak++;
      bestStreak = Math.max(bestStreak, streak);
      currentStreak = streak;
    } else {
      streak = 0;
      currentStreak = 0;
    }
  }

  // Calculate average arrival/departure
  const dailyData = await prisma.dailyArrivalData.findMany({
    where: { user_id: userId },
  });

  const avgArrival =
    dailyData.length > 0
      ? dailyData.reduce((sum, d) => sum + d.arrival_minutes, 0) /
        dailyData.length
      : 0;

  const avgDeparture =
    dailyData.length > 0
      ? dailyData.reduce((sum, d) => sum + d.departure_minutes, 0) /
        dailyData.length
      : 0;

  // Calculate working days (approximately)
  const workingDays = 22;
  const presentDays = checkIns.length;
  const attendancePercentage = (presentDays / workingDays) * 100;

  await prisma.employeeMetrics.upsert({
    where: { user_id: userId },
    update: {
      total_check_ins: totalCheckIns,
      on_time_check_ins: onTimeCheckIns,
      late_check_ins: lateCheckIns,
      early_departures: earlyDepartures,
      total_hours_worked: totalHours,
      current_streak: currentStreak,
      best_streak: bestStreak,
      attendance_percentage: Math.round(attendancePercentage),
      average_arrival_minutes: Math.round(avgArrival),
      average_departure_minutes: Math.round(avgDeparture),
    },
    create: {
      user_id: userId,
      total_check_ins: totalCheckIns,
      on_time_check_ins: onTimeCheckIns,
      late_check_ins: lateCheckIns,
      early_departures: earlyDepartures,
      total_hours_worked: totalHours,
      current_streak: currentStreak,
      best_streak: bestStreak,
      attendance_percentage: Math.round(attendancePercentage),
      average_arrival_minutes: Math.round(avgArrival),
      average_departure_minutes: Math.round(avgDeparture),
    },
  });
}

// Run the script
generateDummyCheckIns()
  .then(() => {
    console.log("\n✅ Script completed successfully!");
    process.exit(0);
  })
  .catch((e) => {
    console.error("❌ Script failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

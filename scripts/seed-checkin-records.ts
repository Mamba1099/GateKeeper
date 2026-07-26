import { prisma } from "../lib/prisma";
import {
  subDays,
  format,
  eachDayOfInterval,
  startOfDay,
  addDays,
} from "date-fns";

async function seedCheckInRecords() {
  console.log("📊 Generating 3 months of check-in records...\n");
  const employees = await prisma.user.findMany({
    where: {
      role: "EMPLOYEE",
      is_active: true,
    },
    include: {
      department: true,
    },
  });

  if (employees.length === 0) {
    console.error("❌ No employees found. Run seed-employees.ts first.");
    process.exit(1);
  }

  console.log(`👥 Found ${employees.length} employees\n`);
  const attendanceStyles: Record<
    string,
    "excellent" | "good" | "mixed" | "poor"
  > = {
    "alice.johnson@gatekeeper.com": "good",
    "bob.smith@gatekeeper.com": "mixed",
    "carol.williams@gatekeeper.com": "excellent",
    "david.brown@gatekeeper.com": "poor",
    "emma.davis@gatekeeper.com": "good",
  };

  const today = new Date();
  const threeMonthsAgo = subDays(today, 90);
  const days = eachDayOfInterval({ start: threeMonthsAgo, end: today });

  let totalCreated = 0;
  let totalSkipped = 0;

  for (const employee of employees) {
    const style = attendanceStyles[employee.email] || "good";
    console.log(`   👤 ${employee.full_name} (${style} attendance)...`);

    let userCreated = 0;
    let userSkipped = 0;

    for (const date of days) {
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      const existing = await prisma.checkIn.findFirst({
        where: {
          user_id: employee.id,
          date: {
            gte: startOfDay(date),
            lt: startOfDay(addDays(date, 1)),
          },
        },
      });

      if (existing) {
        userSkipped++;
        continue;
      }

      const absenceRates = {
        excellent: 0.03,
        good: 0.07,
        mixed: 0.12,
        poor: 0.18,
      };

      if (Math.random() < absenceRates[style]) {
        await createAbsentRecord(employee.id, date);
        userCreated++;
        continue;
      }

      const [stdHour, stdMin] = employee.department.standard_check_in
        .split(":")
        .map(Number);
      const [outHour, outMin] = employee.department.standard_check_out
        .split(":")
        .map(Number);

      let arrivalVariance: number;
      switch (style) {
        case "excellent":
          arrivalVariance = Math.floor(Math.random() * 20) - 15; // -15 to +5 min
          break;
        case "good":
          arrivalVariance = Math.floor(Math.random() * 35) - 10; // -10 to +25 min
          break;
        case "mixed":
          arrivalVariance = Math.floor(Math.random() * 55) - 15; // -15 to +40 min
          break;
        case "poor":
          arrivalVariance = Math.floor(Math.random() * 70) - 10; // -10 to +60 min
          break;
        default:
          arrivalVariance = Math.floor(Math.random() * 30) - 10;
      }

      const departureVariance = Math.floor(Math.random() * 40) - 20; // -20 to +20 min

      await createCheckInRecord(
        employee.id,
        date,
        stdHour,
        stdMin,
        outHour,
        outMin,
        arrivalVariance,
        departureVariance,
      );

      userCreated++;
    }

    await updateEmployeeMetrics(employee.id);
    await updateMonthlySummaries(employee.id);

    console.log(`      ✅ Created: ${userCreated}, ⏭️ Skipped: ${userSkipped}`);
    totalCreated += userCreated;
    totalSkipped += userSkipped;
  }

  console.log("\n📊 Summary:");
  console.log(`   ✅ Total created: ${totalCreated} records`);
  console.log(`   ⏭️ Total skipped: ${totalSkipped} (already existed)`);
  console.log(`   👥 Employees processed: ${employees.length}`);
  console.log(
    `   📅 Period: ${format(threeMonthsAgo, "MMM dd, yyyy")} - ${format(today, "MMM dd, yyyy")}`,
  );
  console.log("\n✅ Check-in records seeding completed!");
}

async function createAbsentRecord(userId: string, date: Date) {
  await prisma.checkIn.create({
    data: {
      user_id: userId,
      check_in_time: date,
      date: startOfDay(date),
      is_late: false,
      late_minutes: 0,
      is_early: false,
      early_minutes: 0,
      is_early_departure: false,
      early_departure_minutes: 0,
      hours_worked: 0,
      status: "ABSENT",
    },
  });

  await prisma.dailyArrivalData.create({
    data: {
      user_id: userId,
      date: startOfDay(date),
      arrival_minutes: 0,
      departure_minutes: 0,
      is_late: false,
      is_early: false,
      is_early_departure: false,
    },
  });
}

async function createCheckInRecord(
  userId: string,
  date: Date,
  stdHour: number,
  stdMin: number,
  outHour: number,
  outMin: number,
  arrivalVariance: number,
  departureVariance: number,
) {
  const totalMinutes = stdHour * 60 + stdMin + arrivalVariance;
  const arrivalHour = Math.floor(totalMinutes / 60);
  const arrivalMinute = ((totalMinutes % 60) + 60) % 60;

  const checkInTime = new Date(date);
  checkInTime.setHours(arrivalHour, arrivalMinute, 0, 0);
  const outTotalMinutes = outHour * 60 + outMin + departureVariance;
  const departureHour = Math.floor(outTotalMinutes / 60);
  const departureMinute = ((outTotalMinutes % 60) + 60) % 60;

  const checkOutTime = new Date(date);
  checkOutTime.setHours(departureHour, departureMinute, 0, 0);
  if (checkOutTime <= checkInTime) {
    checkOutTime.setHours(checkInTime.getHours() + 8);
  }
  const standardDateTime = new Date(date);
  standardDateTime.setHours(stdHour, stdMin, 0, 0);

  const isLate = arrivalVariance > 0;
  const lateMinutes = isLate ? arrivalVariance : 0;
  const isEarly = arrivalVariance < 0;
  const earlyMinutes = isEarly ? Math.abs(arrivalVariance) : 0;

  const hoursWorked =
    (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

  const standardDepartureTime = new Date(date);
  standardDepartureTime.setHours(outHour, outMin, 0, 0);
  const isEarlyDeparture = departureVariance < 0;
  const earlyDepartureMinutes = isEarlyDeparture
    ? Math.abs(departureVariance)
    : 0;

  const status = isLate ? "LATE" : "CHECKED_IN";
  await prisma.checkIn.create({
    data: {
      user_id: userId,
      check_in_time: checkInTime,
      check_out_time: checkOutTime,
      date: startOfDay(date),
      is_late: isLate,
      late_minutes: lateMinutes,
      is_early: isEarly,
      early_minutes: earlyMinutes,
      is_early_departure: isEarlyDeparture,
      early_departure_minutes: earlyDepartureMinutes,
      hours_worked: Math.round(hoursWorked * 10) / 10,
      status,
    },
  });

  await prisma.dailyArrivalData.create({
    data: {
      user_id: userId,
      date: startOfDay(date),
      arrival_minutes: arrivalVariance,
      departure_minutes: departureVariance,
      is_late: isLate,
      is_early: isEarly,
      is_early_departure: isEarlyDeparture,
    },
  });
}

async function updateEmployeeMetrics(userId: string) {
  const allCheckIns = await prisma.checkIn.findMany({
    where: { user_id: userId },
  });

  const presentCheckIns = allCheckIns.filter((c) => c.status !== "ABSENT");
  const onTimeCheckIns = presentCheckIns.filter((c) => !c.is_late).length;
  const lateCheckIns = presentCheckIns.filter((c) => c.is_late).length;
  const earlyDeps = presentCheckIns.filter((c) => c.is_early_departure).length;
  const totalHours = presentCheckIns.reduce(
    (sum, c) => sum + (c.hours_worked || 0),
    0,
  );

  const sorted = allCheckIns.sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );
  let currentStreak = 0;
  let bestStreak = 0;
  let streak = 0;

  for (const ci of sorted) {
    if (ci.status !== "ABSENT" && !ci.is_late) {
      streak++;
      bestStreak = Math.max(bestStreak, streak);
    } else {
      streak = 0;
    }
  }
  currentStreak = streak;

  const dailyData = await prisma.dailyArrivalData.findMany({
    where: { user_id: userId },
  });

  const avgArrival =
    dailyData.length > 0
      ? Math.round(
          dailyData.reduce((sum, d) => sum + d.arrival_minutes, 0) /
            dailyData.length,
        )
      : 0;

  const avgDeparture =
    dailyData.length > 0
      ? Math.round(
          dailyData.reduce((sum, d) => sum + d.departure_minutes, 0) /
            dailyData.length,
        )
      : 0;

  const workingDays = 66;
  const attendancePct = Math.min(
    100,
    Math.round((presentCheckIns.length / workingDays) * 100),
  );

  const lateRate =
    presentCheckIns.length > 0 ? lateCheckIns / presentCheckIns.length : 0;
  let rating: "POOR" | "FAIR" | "GOOD" | "EXCELLENT" = "POOR";
  if (attendancePct >= 90 && lateRate < 0.1) rating = "EXCELLENT";
  else if (attendancePct >= 80 && lateRate < 0.2) rating = "GOOD";
  else if (attendancePct >= 65) rating = "FAIR";

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const punctualityPct =
    presentCheckIns.length > 0
      ? Math.round((onTimeCheckIns / presentCheckIns.length) * 100)
      : 0;

  await prisma.employeeMetrics.upsert({
    where: { user_id: userId },
    update: {
      total_check_ins: allCheckIns.length,
      on_time_check_ins: onTimeCheckIns,
      late_check_ins: lateCheckIns,
      early_check_ins: presentCheckIns.filter((c) => c.is_early).length,
      early_departures: earlyDeps,
      total_hours_worked: Math.round(totalHours * 10) / 10,
      current_streak: currentStreak,
      best_streak: bestStreak,
      attendance_percentage: attendancePct,
      attendance_rating: rating,
      average_arrival_minutes: avgArrival,
      average_departure_minutes: avgDeparture,
    },
    create: {
      user_id: userId,
      total_check_ins: allCheckIns.length,
      on_time_check_ins: onTimeCheckIns,
      late_check_ins: lateCheckIns,
      early_check_ins: presentCheckIns.filter((c) => c.is_early).length,
      early_departures: earlyDeps,
      total_hours_worked: Math.round(totalHours * 10) / 10,
      current_streak: currentStreak,
      best_streak: bestStreak,
      attendance_percentage: attendancePct,
      attendance_rating: rating,
      average_arrival_minutes: avgArrival,
      average_departure_minutes: avgDeparture,
    },
  });
}

async function updateMonthlySummaries(userId: string) {
  const allCheckIns = await prisma.checkIn.findMany({
    where: { user_id: userId },
  });

  const now = new Date();

  for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
    const monthDate = new Date(
      now.getFullYear(),
      now.getMonth() - monthOffset,
      1,
    );
    const month = monthDate.getMonth() + 1;
    const year = monthDate.getFullYear();

    const monthRecords = allCheckIns.filter((ci) => {
      const ciDate = new Date(ci.date);
      return ciDate.getMonth() + 1 === month && ciDate.getFullYear() === year;
    });

    if (monthRecords.length === 0) continue;

    const present = monthRecords.filter((c) => c.status !== "ABSENT");
    const absent = monthRecords.filter((c) => c.status === "ABSENT").length;
    const late = present.filter((c) => c.is_late).length;
    const onTime = present.length - late;
    const earlyDeps = present.filter((c) => c.is_early_departure).length;
    const monthHours = present.reduce(
      (sum, c) => sum + (c.hours_worked || 0),
      0,
    );

    const totalDays = monthRecords.length;
    const attPct = Math.round((present.length / totalDays) * 100);
    const punctPct =
      present.length > 0 ? Math.round((onTime / present.length) * 100) : 0;

    let mRating: "POOR" | "FAIR" | "GOOD" | "EXCELLENT" = "POOR";
    if (attPct >= 90 && punctPct >= 85) mRating = "EXCELLENT";
    else if (attPct >= 80 && punctPct >= 75) mRating = "GOOD";
    else if (attPct >= 65) mRating = "FAIR";

    await prisma.attendanceSummary.upsert({
      where: {
        user_id_month_year: { user_id: userId, month, year },
      },
      update: {
        total_days: totalDays,
        present_days: present.length,
        absent_days: absent,
        late_days: late,
        on_time_days: onTime,
        early_days: present.filter((c) => c.is_early).length,
        early_departure_days: earlyDeps,
        total_hours_worked: Math.round(monthHours * 10) / 10,
        attendance_percentage: attPct,
        punctuality_percentage: punctPct,
        attendance_rating: mRating,
      },
      create: {
        user_id: userId,
        month,
        year,
        total_days: totalDays,
        present_days: present.length,
        absent_days: absent,
        late_days: late,
        on_time_days: onTime,
        early_days: present.filter((c) => c.is_early).length,
        early_departure_days: earlyDeps,
        total_hours_worked: Math.round(monthHours * 10) / 10,
        attendance_percentage: attPct,
        punctuality_percentage: punctPct,
        attendance_rating: mRating,
      },
    });
  }
}

seedCheckInRecords()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("❌ Failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

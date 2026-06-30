import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/prisma";
import {
  createSecureResponse,
  createSecureErrorResponse,
} from "@/lib/security/request-validator";

async function updateEmployeeMetrics(userId: string) {
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
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "EMPLOYEE") {
      return createSecureErrorResponse("Unauthorized", 401, request);
    }

    const userId = session.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkIn = await prisma.checkIn.findFirst({
      where: {
        user_id: userId,
        date: today,
        check_out_time: null,
      },
    });

    if (!checkIn) {
      return createSecureErrorResponse(
        "You haven't checked in today",
        400,
        request,
      );
    }

    const now = new Date();

    const hoursWorked =
      (now.getTime() - checkIn.check_in_time.getTime()) / (1000 * 60 * 60);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        department: true,
      },
    });

    const standardDeparture = user?.department?.standard_check_out || "15:00";
    const [depHour, depMinute] = standardDeparture.split(":").map(Number);

    const standardDepartureTime = new Date(now);
    standardDepartureTime.setHours(depHour, depMinute, 0, 0);

    const isEarlyDeparture = now < standardDepartureTime;
    let earlyDepartureMinutes = 0;
    if (isEarlyDeparture) {
      const diffMs = standardDepartureTime.getTime() - now.getTime();
      earlyDepartureMinutes = Math.floor(diffMs / (1000 * 60));
    }

    const updated = await prisma.checkIn.update({
      where: { id: checkIn.id },
      data: {
        check_out_time: now,
        hours_worked: hoursWorked,
        is_early_departure: isEarlyDeparture,
        early_departure_minutes: earlyDepartureMinutes,
        status: "CHECKED_OUT",
      },
    });

    await prisma.dailyArrivalData.update({
      where: {
        user_id_date: {
          user_id: userId,
          date: today,
        },
      },
      data: {
        departure_minutes: (now.getHours() - 15) * 60 + now.getMinutes(),
        is_early_departure: isEarlyDeparture,
      },
    });

    await updateEmployeeMetrics(userId);

    return createSecureResponse(
      {
        success: true,
        message: "Checked out successfully",
        data: updated,
      },
      { status: 200 },
      request,
    );
  } catch (error) {
    console.error("Error checking out:", error);
    return createSecureErrorResponse("Failed to check out", 500, request);
  }
}

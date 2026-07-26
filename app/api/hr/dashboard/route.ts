import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  subDays,
  subMonths,
  format,
  eachDayOfInterval,
} from "date-fns";

export async function GET() {
  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const monthStart = startOfMonth(now);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const monthEnd = endOfMonth(now);

    const [
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      totalDepartments,
      activeDepartments,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      todayCheckIns,
      todayLateCheckIns,
      todayOnTimeCheckIns,
      todayCheckedInCount,
      monthlyAttendanceSummaries,
      employeeMetrics,
      recentLateCheckIns,
      recentEarlyDeps,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { is_active: true } }),
      prisma.user.count({ where: { is_active: false } }),
      prisma.department.count(),
      prisma.department.count({ where: { is_active: true } }),
      prisma.checkIn.findMany({
        where: { date: { gte: todayStart, lte: todayEnd } },
        select: {
          id: true,
          is_late: true,
          late_minutes: true,
          check_in_time: true,
        },
      }),
      prisma.checkIn.count({
        where: { date: { gte: todayStart, lte: todayEnd }, is_late: true },
      }),
      prisma.checkIn.count({
        where: { date: { gte: todayStart, lte: todayEnd }, is_late: false },
      }),
      prisma.checkIn.count({
        where: { date: { gte: todayStart, lte: todayEnd } },
      }),
      prisma.attendanceSummary.findMany({
        where: { month: now.getMonth() + 1, year: now.getFullYear() },
        select: { attendance_percentage: true, punctuality_percentage: true },
      }),
      prisma.employeeMetrics.findMany({
        select: { attendance_rating: true, current_streak: true },
      }),
      prisma.checkIn.findMany({
        where: { date: { gte: todayStart, lte: todayEnd }, is_late: true },
        orderBy: { late_minutes: "desc" },
        take: 5,
        include: { user: { select: { full_name: true } } },
      }),
      prisma.checkIn.findMany({
        where: {
          date: { gte: todayStart, lte: todayEnd },
          is_early_departure: true,
        },
        orderBy: { early_departure_minutes: "desc" },
        take: 5,
        include: { user: { select: { full_name: true } } },
      }),
    ]);

    const fourteenDaysAgo = subDays(now, 13);
    const dailyTrendRaw = await prisma.checkIn.groupBy({
      by: ["date"],
      where: { date: { gte: startOfDay(fourteenDaysAgo), lte: todayEnd } },
      _count: { id: true },
      _sum: { late_minutes: true },
    });
      
    const lateCountsByDay = await prisma.checkIn.groupBy({
      by: ["date"],
      where: {
        date: { gte: startOfDay(fourteenDaysAgo), lte: todayEnd },
        is_late: true,
      },
      _count: { id: true },
    });

    const lateCountsMap = new Map(
      lateCountsByDay.map((d) => [
        d.date.toISOString().split("T")[0],
        d._count.id,
      ]),
    );

    const days = eachDayOfInterval({ start: fourteenDaysAgo, end: now });
    const dailyTrend = days.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      const checkIns =
        dailyTrendRaw.find((d) => d.date.toISOString().split("T")[0] === dayStr)
          ?._count.id ?? 0;
      const late = lateCountsMap.get(dayStr) ?? 0;
      return { date: dayStr, checkIns, late };
    });

    const monthlyRatesRaw = await prisma.attendanceSummary.findMany({
      where: {
        year: now.getFullYear(),
        month: { gte: now.getMonth() + 1 - 5 }, // last 6 months inclusive
      },
      orderBy: [{ year: "asc" }, { month: "asc" }],
      select: {
        month: true,
        year: true,
        attendance_percentage: true,
        punctuality_percentage: true,
      },
    });

    const monthlyRates = Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(now, 5 - i);
      const month = d.getMonth() + 1;
      const year = d.getFullYear();
      const found = monthlyRatesRaw.find(
        (m) => m.month === month && m.year === year,
      );
      return {
        month: format(d, "MMM yyyy"),
        attendanceRate: found ? found.attendance_percentage : 0,
        punctualityRate: found ? found.punctuality_percentage : 0,
      };
    });

    const thirtyDaysAgo = subDays(now, 29);
    const hoursData = await prisma.checkIn.findMany({
      where: {
        date: { gte: startOfDay(thirtyDaysAgo), lte: todayEnd },
        hours_worked: { not: null },
      },
      select: { hours_worked: true },
    });

    const buckets = {
      "<4h": 0,
      "4-6h": 0,
      "6-8h": 0,
      "8-10h": 0,
      ">10h": 0,
    };

    hoursData.forEach(({ hours_worked }) => {
      const h = hours_worked ?? 0;
      if (h < 4) buckets["<4h"]++;
      else if (h < 6) buckets["4-6h"]++;
      else if (h < 8) buckets["6-8h"]++;
      else if (h < 10) buckets["8-10h"]++;
      else buckets[">10h"]++;
    });

    const hoursDistribution = Object.entries(buckets).map(([range, count]) => ({
      range,
      count,
    }));

    const response = {
      success: true,
      data: {
        employees: {
          total: totalEmployees,
          active: activeEmployees,
          inactive: inactiveEmployees,
        },
        departments: {
          total: totalDepartments,
          active: activeDepartments,
        },
        today: {
          checkedIn: todayCheckedInCount,
          onTime: todayOnTimeCheckIns,
          late: todayLateCheckIns,
          attendanceRate:
            activeEmployees > 0
              ? parseFloat(
                  ((todayCheckedInCount / activeEmployees) * 100).toFixed(1),
                )
              : 0,
          avgArrivalTime: "—",
        },
        monthly: {
          avgAttendanceRate:
            monthlyAttendanceSummaries.length > 0
              ? parseFloat(
                  (
                    monthlyAttendanceSummaries.reduce(
                      (acc, s) => acc + s.attendance_percentage,
                      0,
                    ) / monthlyAttendanceSummaries.length
                  ).toFixed(1),
                )
              : 0,
          avgPunctuality:
            monthlyAttendanceSummaries.length > 0
              ? parseFloat(
                  (
                    monthlyAttendanceSummaries.reduce(
                      (acc, s) => acc + s.punctuality_percentage,
                      0,
                    ) / monthlyAttendanceSummaries.length
                  ).toFixed(1),
                )
              : 0,
        },
        performance: {
          topPerformersCount: employeeMetrics.filter(
            (m) =>
              m.attendance_rating === "EXCELLENT" ||
              m.attendance_rating === "GOOD",
          ).length,
          bestStreak: employeeMetrics.reduce(
            (max, m) => Math.max(max, m.current_streak),
            0,
          ),
        },
        recentLate: recentLateCheckIns.map((ci) => ({
          employeeName: ci.user.full_name,
          lateMinutes: ci.late_minutes ?? 0,
          checkInTime: ci.check_in_time.toISOString(),
        })),
        recentEarlyDepartures: recentEarlyDeps.map((ci) => ({
          employeeName: ci.user.full_name,
          earlyMinutes: ci.early_departure_minutes ?? 0,
          checkInTime: ci.check_in_time.toISOString(),
        })),
        dailyTrend,
        monthlyRates,
        hoursDistribution,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load dashboard data" },
      { status: 500 },
    );
  }
}

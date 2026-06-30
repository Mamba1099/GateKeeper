import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/prisma";
import {
  createSecureResponse,
  createSecureErrorResponse,
} from "@/lib/security/request-validator";
import { getWeekdaysInMonth, formatDateKey } from "@/lib/utils/date-utils";
import { format } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "EMPLOYEE") {
      return createSecureErrorResponse("Unauthorized", 401, request);
    }

    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get("period") || "month";

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const allWeekdays = getWeekdaysInMonth(currentMonth, currentYear);
    const checkIns = await prisma.checkIn.findMany({
      where: {
        user_id: userId,
        date: {
          gte: new Date(currentYear, currentMonth - 1, 1),
          lt: new Date(currentYear, currentMonth, 1),
        },
      },
      orderBy: { date: "asc" },
    });

    const monthlyData = allWeekdays.map((date) => {
      const checkIn = checkIns.find(
        (c) => formatDateKey(c.date) === formatDateKey(date),
      );

      let status = "ABSENT";
      let hours = 0;
      let isLate = false;
      let lateMinutes = 0;
      let checkInTime = null;
      let checkOutTime = null;

      if (checkIn) {
        if (checkIn.check_out_time) {
          status = "PRESENT";
        } else if (checkIn.check_in_time) {
          status = "CHECKED_IN";
        }
        hours = checkIn.hours_worked || 0;
        isLate = checkIn.is_late || false;
        lateMinutes = checkIn.late_minutes || 0;
        checkInTime = checkIn.check_in_time;
        checkOutTime = checkIn.check_out_time;
      }

      return {
        date: formatDateKey(date),
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        dayOfWeek: date.getDay(),
        dayName: format(date, "EEE"),
        status,
        hours,
        isLate,
        lateMinutes,
        checkInTime,
        checkOutTime,
        hasRecord: !!checkIn,
      };
    });

    const metrics = await prisma.employeeMetrics.findUnique({
      where: { user_id: userId },
    });

    const presentDays = monthlyData.filter(
      (d) => d.status === "PRESENT" || d.status === "CHECKED_IN",
    ).length;
    const absentDays = monthlyData.filter((d) => d.status === "ABSENT").length;
    const lateDays = monthlyData.filter(
      (d) => d.isLate && d.status !== "ABSENT",
    ).length;
    const onTimeDays = presentDays - lateDays;
    const totalDays = monthlyData.length;
    const totalHours = monthlyData.reduce((sum, d) => sum + d.hours, 0);

    const recentActivity = await prisma.checkIn.findMany({
      where: { user_id: userId },
      orderBy: { date: "desc" },
      take: 10,
    });

    const formattedActivity = recentActivity.map((record) => ({
      id: record.id,
      date: format(record.date, "MMM dd, yyyy"),
      checkInTime: record.check_in_time
        ? format(record.check_in_time, "hh:mm a")
        : "--:--",
      checkOutTime: record.check_out_time
        ? format(record.check_out_time, "hh:mm a")
        : "--:--",
      status: record.is_late
        ? "late"
        : record.status === "CHECKED_OUT"
          ? "on-time"
          : "absent",
      hoursWorked: record.hours_worked || 0,
    }));

    return createSecureResponse(
      {
        success: true,
        data: {
          stats: {
            attendance_percentage:
              totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0,
            punctuality_percentage:
              presentDays > 0
                ? Math.round((onTimeDays / presentDays) * 100)
                : 0,
            current_streak: metrics?.current_streak || 0,
            best_streak: metrics?.best_streak || 0,
            late_days: lateDays,
            on_time_days: onTimeDays,
            total_days: totalDays,
            present_days: presentDays,
            absent_days: absentDays,
            total_hours_worked: totalHours,
            average_hours_worked:
              presentDays > 0 ? totalHours / presentDays : 0,
          },
          monthlyData,
          recentActivity: formattedActivity,
          metadata: {
            month: currentMonth,
            year: currentYear,
            monthName: format(
              new Date(currentYear, currentMonth - 1, 1),
              "MMMM",
            ),
            totalWorkingDays: totalDays,
          },
        },
      },
      { status: 200 },
      request,
    );
  } catch (error) {
    console.error("Error fetching check-in stats:", error);
    return createSecureErrorResponse("Failed to fetch stats", 500, request);
  }
}

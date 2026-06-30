import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/prisma";
import {
  createSecureResponse,
  createSecureErrorResponse,
} from "@/lib/security/request-validator";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "EMPLOYEE") {
      return createSecureErrorResponse("Unauthorized", 401, request);
    }

    const userId = session.user.id;
    const now = new Date();
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(now.getMonth() - 6);

    // Get user's monthly summaries
    const summaries = await prisma.attendanceSummary.findMany({
      where: {
        user_id: userId,
        year: { gte: sixMonthsAgo.getFullYear() },
        OR: [
          { month: { gte: sixMonthsAgo.getMonth() + 1 } },
          { year: { gt: sixMonthsAgo.getFullYear() } },
        ],
      },
      orderBy: [{ year: "asc" }, { month: "asc" }],
    });

    // Get department average for same period
    const department = await prisma.user.findUnique({
      where: { id: userId },
      select: { department_id: true },
    });

    let departmentAvg = undefined;
    if (department) {
      const deptSummaries = await prisma.attendanceSummary.groupBy({
        by: ["month", "year"],
        where: {
          user: { department_id: department.department_id },
        },
        _avg: {
          attendance_percentage: true,
        },
      });
      // Calculate average attendance per month
      departmentAvg =
        deptSummaries.reduce(
          (acc, s) => acc + (s._avg.attendance_percentage || 0),
          0,
        ) / (deptSummaries.length || 1);
    }

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const attendanceData = summaries.map((s) => ({
      month: `${monthNames[s.month - 1]} ${s.year}`,
      attendance: Math.round(s.attendance_percentage || 0),
      punctuality: Math.round(s.punctuality_percentage || 0),
    }));

    return createSecureResponse(
      {
        success: true,
        data: {
          attendance: attendanceData,
          department_avg: departmentAvg ? Math.round(departmentAvg) : undefined,
        },
      },
      { status: 200 },
      request,
    );
  } catch (error) {
    console.error("Error fetching attendance trend:", error);
    return createSecureErrorResponse(
      "Failed to fetch attendance trend",
      500,
      request,
    );
  }
}

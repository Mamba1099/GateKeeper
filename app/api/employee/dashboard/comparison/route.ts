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
    const userSummaries = await prisma.attendanceSummary.findMany({
      where: {
        user_id: userId,
        year: { gte: sixMonthsAgo.getFullYear() },
      },
      orderBy: [{ year: "asc" }, { month: "asc" }],
    });

    // Get department average
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { department_id: true },
    });

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

    const data = [];

    for (const summary of userSummaries) {
      // Get department average for the same month
      const deptAvg = await prisma.attendanceSummary.aggregate({
        where: {
          user: { department_id: user?.department_id },
          month: summary.month,
          year: summary.year,
        },
        _avg: { attendance_percentage: true },
      });

      data.push({
        month: `${monthNames[summary.month - 1]} ${summary.year}`,
        you: Math.round(summary.attendance_percentage || 0),
        department: Math.round(deptAvg._avg.attendance_percentage || 0),
      });
    }

    return createSecureResponse(
      {
        success: true,
        data,
      },
      { status: 200 },
      request,
    );
  } catch (error) {
    console.error("Error fetching comparison data:", error);
    return createSecureErrorResponse(
      "Failed to fetch comparison data",
      500,
      request,
    );
  }
}

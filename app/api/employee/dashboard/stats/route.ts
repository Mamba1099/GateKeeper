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
    const metrics = await prisma.employeeMetrics.findUnique({
      where: { user_id: userId },
    });

    const summary = await prisma.attendanceSummary.findFirst({
      where: {
        user_id: userId,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
    });

    return createSecureResponse(
      {
        success: true,
        data: {
          attendance_percentage: summary?.attendance_percentage || 0,
          punctuality_percentage: summary?.punctuality_percentage || 0,
          current_streak: metrics?.current_streak || 0,
          late_days: summary?.late_days || 0,
          total_hours: metrics?.total_hours_worked || 0,
          total_days: summary?.total_days || 0,
          present_days: summary?.present_days || 0,
          early_departures: metrics?.early_departures || 0,
        },
      },
      { status: 200 },
      request,
    );
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return createSecureErrorResponse("Failed to fetch stats", 500, request);
  }
}

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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkIn = await prisma.checkIn.findFirst({
      where: {
        user_id: userId,
        date: today,
      },
    });

    if (!checkIn) {
      return createSecureResponse(
        {
          success: true,
          data: {
            is_checked_in: false,
          },
        },
        { status: 200 },
        request,
      );
    }

    return createSecureResponse(
      {
        success: true,
        data: {
          is_checked_in: true,
          check_in_time: checkIn.check_in_time,
          check_out_time: checkIn.check_out_time,
          is_late: checkIn.is_late,
          late_minutes: checkIn.late_minutes,
          hours_worked: checkIn.hours_worked,
          is_early_departure: checkIn.is_early_departure,
        },
      },
      { status: 200 },
      request,
    );
  } catch (error) {
    console.error("Error fetching today status:", error);
    return createSecureErrorResponse(
      "Failed to fetch today status",
      500,
      request,
    );
  }
}

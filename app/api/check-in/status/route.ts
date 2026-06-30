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
            isCheckedIn: false,
            canCheckOut: false,
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
          isCheckedIn: true,
          checkInTime: checkIn.check_in_time,
          checkOutTime: checkIn.check_out_time,
          isLate: checkIn.is_late,
          lateMinutes: checkIn.late_minutes,
          canCheckOut: !checkIn.check_out_time,
          status: checkIn.status,
        },
      },
      { status: 200 },
      request,
    );
  } catch (error) {
    console.error("Error fetching check-in status:", error);
    return createSecureErrorResponse(
      "Failed to fetch check-in status",
      500,
      request,
    );
  }
}

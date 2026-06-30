import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/prisma";
import {
  createSecureResponse,
  createSecureErrorResponse,
} from "@/lib/security/request-validator";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "EMPLOYEE") {
      return createSecureErrorResponse("Unauthorized", 401, request);
    }

    const userId = session.user.id;
    const body = await request.json();
    const { checkInTime } = body;

    if (!checkInTime) {
      return createSecureErrorResponse(
        "Check-in time is required",
        400,
        request,
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.checkIn.findFirst({
      where: {
        user_id: userId,
        date: today,
      },
    });

    if (existing && !existing.check_out_time) {
      return createSecureErrorResponse(
        "You have already checked in today",
        400,
        request,
      );
    }

    if (existing && existing.check_out_time) {
      return createSecureErrorResponse(
        "You have already completed your shift today",
        400,
        request,
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        department: {
          include: {
            check_in_settings: true,
          },
        },
      },
    });

    const checkInDateTime = new Date(checkInTime);
    const settings = user?.department?.check_in_settings;
    const standardTime = settings?.standard_time || "08:00";
    const [stdHour, stdMinute] = standardTime.split(":").map(Number);

    const standardDateTime = new Date(checkInDateTime);
    standardDateTime.setHours(stdHour, stdMinute, 0, 0);

    const isLate = checkInDateTime > standardDateTime;
    let lateMinutes = 0;
    if (isLate) {
      const diffMs = checkInDateTime.getTime() - standardDateTime.getTime();
      lateMinutes = Math.floor(diffMs / (1000 * 60));
    }

    // Check if early
    let isEarly = false;
    let earlyMinutes = 0;
    if (checkInDateTime < standardDateTime) {
      const diffMs = standardDateTime.getTime() - checkInDateTime.getTime();
      earlyMinutes = Math.floor(diffMs / (1000 * 60));
      if (earlyMinutes <= 30) {
        isEarly = true;
      }
    }

    const checkIn = await prisma.checkIn.create({
      data: {
        user_id: userId,
        check_in_time: checkInDateTime,
        date: today,
        is_late: isLate,
        late_minutes: lateMinutes,
        is_early: isEarly,
        early_minutes: earlyMinutes,
        status: isLate ? "LATE" : "CHECKED_IN",
      },
    });

    await prisma.dailyArrivalData.upsert({
      where: {
        user_id_date: {
          user_id: userId,
          date: today,
        },
      },
      update: {
        arrival_minutes:
          (checkInDateTime.getHours() - 8) * 60 + checkInDateTime.getMinutes(),
        is_late: isLate,
        is_early: isEarly,
      },
      create: {
        user_id: userId,
        date: today,
        arrival_minutes:
          (checkInDateTime.getHours() - 8) * 60 + checkInDateTime.getMinutes(),
        departure_minutes: 0,
        is_late: isLate,
        is_early: isEarly,
        is_early_departure: false,
      },
    });

    return createSecureResponse(
      {
        success: true,
        message: isLate ? "Checked in late" : "Checked in successfully",
        data: checkIn,
      },
      { status: 201 },
      request,
    );
  } catch (error) {
    console.error("Error checking in:", error);
    return createSecureErrorResponse("Failed to check in", 500, request);
  }
}

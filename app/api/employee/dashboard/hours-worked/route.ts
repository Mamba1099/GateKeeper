import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/prisma";
import {
  createSecureResponse,
  createSecureErrorResponse,
} from "@/lib/security/request-validator";
import { subDays, format } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "EMPLOYEE") {
      return createSecureErrorResponse("Unauthorized", 401, request);
    }

    const userId = session.user.id;
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);

    const checkIns = await prisma.checkIn.findMany({
      where: {
        user_id: userId,
        date: { gte: thirtyDaysAgo, lte: now },
      },
      orderBy: { date: "asc" },
    });

    const data = checkIns.map((c) => ({
      day: new Date(c.date).getDate(),
      hours: c.hours_worked || 0,
      date: format(c.date, "yyyy-MM-dd"),
    }));

    return createSecureResponse(
      {
        success: true,
        data,
      },
      { status: 200 },
      request,
    );
  } catch (error) {
    console.error("Error fetching hours worked:", error);
    return createSecureErrorResponse(
      "Failed to fetch hours worked",
      500,
      request,
    );
  }
}

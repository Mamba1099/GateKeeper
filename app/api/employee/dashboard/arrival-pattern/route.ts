import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/prisma";
import {
  createSecureResponse,
  createSecureErrorResponse,
} from "@/lib/security/request-validator";
import {subDays, format } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "EMPLOYEE") {
      return createSecureErrorResponse("Unauthorized", 401, request);
    }

    const userId = session.user.id;
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);

    const dailyData = await prisma.dailyArrivalData.findMany({
      where: {
        user_id: userId,
        date: { gte: thirtyDaysAgo, lte: now },
      },
      orderBy: { date: "asc" },
    });

    const data = dailyData.map((d) => ({
      day: new Date(d.date).getDate(),
      arrival: d.arrival_minutes,
      departure: d.departure_minutes,
      date: format(d.date, "yyyy-MM-dd"),
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
    console.error("Error fetching arrival pattern:", error);
    return createSecureErrorResponse(
      "Failed to fetch arrival pattern",
      500,
      request,
    );
  }
}

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/prisma";
import {
  createSecureResponse,
  createSecureErrorResponse,
} from "@/lib/security/request-validator";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "EMPLOYEE") {
      return createSecureErrorResponse("Unauthorized", 401, request);
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");
    const status = searchParams.get("status");

    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { user_id: session.user.id };

    if (startDate) {
      where.date = { ...where.date, gte: startOfDay(new Date(startDate)) };
    }
    if (endDate) {
      where.date = { ...where.date, lte: endOfDay(new Date(endDate)) };
    }
    if (status) {
      where.status = status;
    }

    const [records, total] = await Promise.all([
      prisma.checkIn.findMany({
        where,
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      prisma.checkIn.count({ where }),
    ]);

    return createSecureResponse(
      {
        success: true,
        data: {
          records,
          pagination: {
            page,
            limit,
            total,
            total_pages: Math.ceil(total / limit),
          },
        },
      },
      { status: 200 },
      request,
    );
  } catch (error) {
    console.error("Error fetching history:", error);
    return createSecureErrorResponse("Failed to fetch history", 500, request);
  }
}

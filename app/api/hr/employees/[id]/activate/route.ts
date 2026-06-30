import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import {
  createSecureResponse,
  createSecureErrorResponse,
} from "@/lib/security/request-validator";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session?.user ||
      (session.user.role !== "HR" && session.user.role !== "ADMIN")
    ) {
      return createSecureErrorResponse("Unauthorized", 401, request);
    }

    const { id } = await params;

    const employee = await prisma.user.update({
      where: { id },
      data: { is_active: true },
    });

    return createSecureResponse(
      {
        success: true,
        message: "Employee activated successfully",
        data: { id: employee.id },
      },
      { status: 200 },
      request,
    );
  } catch (error) {
    console.error("Error activating employee:", error);
    return createSecureErrorResponse(
      "Failed to activate employee",
      500,
      request,
    );
  }
}

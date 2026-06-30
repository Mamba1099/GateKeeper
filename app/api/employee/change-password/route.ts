import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/prisma";
import {
  createSecureResponse,
  createSecureErrorResponse,
} from "@/lib/security/request-validator";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "EMPLOYEE") {
      return createSecureErrorResponse("Unauthorized", 401, request);
    }

    const body = await request.json();
    const { current_password, new_password } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !user.password_hash) {
      return createSecureErrorResponse("User not found", 404, request);
    }

    const isValid = await bcrypt.compare(current_password, user.password_hash);
    if (!isValid) {
      return createSecureErrorResponse(
        "Current password is incorrect",
        400,
        request,
      );
    }

    const newPasswordHash = await bcrypt.hash(new_password, 10);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password_hash: newPasswordHash },
    });

    return createSecureResponse(
      {
        success: true,
        message: "Password changed successfully",
      },
      { status: 200 },
      request,
    );
  } catch (error) {
    console.error("Error changing password:", error);
    return createSecureErrorResponse("Failed to change password", 500, request);
  }
}

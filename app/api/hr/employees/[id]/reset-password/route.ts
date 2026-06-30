import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import {
  createSecureResponse,
  createSecureErrorResponse,
} from "@/lib/security/request-validator";
import bcrypt from "bcryptjs";

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
    const body = await request.json();
    const { password } = body;

    // Validate password
    if (!password || password.length < 8) {
      return createSecureErrorResponse(
        "Password must be at least 8 characters",
        400,
        request,
      );
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update user's password
    await prisma.user.update({
      where: { id },
      data: { password_hash: passwordHash },
    });

    return createSecureResponse(
      {
        success: true,
        message: "Password reset successfully",
      },
      { status: 200 },
      request,
    );
  } catch (error) {
    console.error("Error resetting password:", error);
    return createSecureErrorResponse("Failed to reset password", 500, request);
  }
}

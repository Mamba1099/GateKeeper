import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createSecureResponse,
  createSecureErrorResponse,
} from "@/lib/security/request-validator";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword, confirmPassword } = body;

    if (!token || !newPassword || !confirmPassword) {
      return createSecureErrorResponse("All fields are required", 400, request);
    }

    if (newPassword !== confirmPassword) {
      return createSecureErrorResponse("Passwords do not match", 400, request);
    }

    if (newPassword.length < 8) {
      return createSecureErrorResponse(
        "Password must be at least 8 characters",
        400,
        request,
      );
    }

    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        token,
        used: false,
        expires_at: {
          gt: new Date(),
        },
      },
    });

    if (!resetToken) {
      return createSecureErrorResponse(
        "Invalid or expired reset token",
        400,
        request,
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.user_id },
        data: { password_hash: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
      prisma.passwordResetToken.updateMany({
        where: {
          user_id: resetToken.user_id,
          used: false,
        },
        data: { used: true },
      }),
    ]);

    return createSecureResponse(
      {
        success: true,
        message: "Password reset successfully",
      },
      { status: 200 },
      request,
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return createSecureErrorResponse("Failed to reset password", 500, request);
  }
}

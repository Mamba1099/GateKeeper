import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createSecureResponse,
  createSecureErrorResponse,
} from "@/lib/security/request-validator";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return createSecureErrorResponse("Email is required", 400, request);
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, is_active: true },
    });

    if (!user) {
      return createSecureResponse(
        {
          success: true,
          message: "If an account exists, you can reset your password",
        },
        { status: 200 },
        request,
      );
    }

    if (!user.is_active) {
      return createSecureErrorResponse(
        "Your account has been deactivated. Please contact HR.",
        400,
        request,
      );
    }

    await prisma.passwordResetToken.updateMany({
      where: {
        user_id: user.id,
        used: false,
      },
      data: { used: true },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await prisma.passwordResetToken.create({
      data: {
        user_id: user.id,
        token,
        expires_at: expiresAt,
      },
    });

    return createSecureResponse(
      {
        success: true,
        token: token,
        message: "Password reset token generated",
      },
      { status: 200 },
      request,
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return createSecureErrorResponse("Failed to process request", 500, request);
  }
}

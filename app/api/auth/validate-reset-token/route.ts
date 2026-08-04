import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createSecureResponse,
  createSecureErrorResponse,
} from "@/lib/security/request-validator";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return createSecureErrorResponse("Token is required", 400, request);
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
        "Invalid or expired token",
        400,
        request,
      );
    }

    return createSecureResponse(
      {
        success: true,
        valid: true,
        user_id: resetToken.user_id,
      },
      { status: 200 },
      request,
    );
  } catch (error) {
    console.error("Validate token error:", error);
    return createSecureErrorResponse("Failed to validate token", 500, request);
  }
}

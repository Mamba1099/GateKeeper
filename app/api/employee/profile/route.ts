import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { prisma } from "@/lib/prisma";
import {
  createSecureResponse,
  createSecureErrorResponse,
} from "@/lib/security/request-validator";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "EMPLOYEE") {
      return createSecureErrorResponse("Unauthorized", 401, request);
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { department: true },
    });

    if (!user) {
      return createSecureErrorResponse("User not found", 404, request);
    }

    return createSecureResponse(
      {
        success: true,
        data: {
          full_name: user.full_name,
          email: user.email,
          position: user.position,
          department_name: user.department.name,
        },
      },
      { status: 200 },
      request,
    );
  } catch (error) {
    console.error("Error fetching profile:", error);
    return createSecureErrorResponse("Failed to fetch profile", 500, request);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "EMPLOYEE") {
      return createSecureErrorResponse("Unauthorized", 401, request);
    }

    const body = await request.json();
    const { full_name, position } = body;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        full_name: full_name || undefined,
        position: position || undefined,
      },
    });

    return createSecureResponse(
      {
        success: true,
        message: "Profile updated successfully",
        data: {
          full_name: user.full_name,
          position: user.position,
        },
      },
      { status: 200 },
      request,
    );
  } catch (error) {
    console.error("Error updating profile:", error);
    return createSecureErrorResponse("Failed to update profile", 500, request);
  }
}

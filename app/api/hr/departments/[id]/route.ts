import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import {
  createSecureResponse,
  createSecureErrorResponse,
} from "@/lib/security/request-validator";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session?.user ||
      (session.user.role !== "HR" && session.user.role !== "ADMIN")
    ) {
      return createSecureErrorResponse("Unauthorized", 401, request);
    }

    const department = await prisma.department.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { users: true },
        },
        users: {
          select: {
            id: true,
            full_name: true,
            email: true,
            position: true,
            is_active: true,
          },
        },
      },
    });

    if (!department) {
      return createSecureErrorResponse("Department not found", 404, request);
    }

    return createSecureResponse(
      {
        success: true,
        data: department,
      },
      { status: 200 },
      request,
    );
  } catch (error) {
    console.error("Error fetching department:", error);
    return createSecureErrorResponse(
      "Failed to fetch department",
      500,
      request,
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session?.user ||
      (session.user.role !== "HR" && session.user.role !== "ADMIN")
    ) {
      return createSecureErrorResponse("Unauthorized", 401, request);
    }

    const body = await request.json();
    const { name, code, description, is_active } = body;

    const department = await prisma.department.update({
      where: { id: params.id },
      data: {
        name: name || undefined,
        code: code || undefined,
        description: description !== undefined ? description : undefined,
        is_active: is_active !== undefined ? is_active : undefined,
      },
    });

    return createSecureResponse(
      {
        success: true,
        message: "Department updated successfully",
        data: department,
      },
      { status: 200 },
      request,
    );
  } catch (error) {
    console.error("Error updating department:", error);
    return createSecureErrorResponse(
      "Failed to update department",
      500,
      request,
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session?.user ||
      (session.user.role !== "HR" && session.user.role !== "ADMIN")
    ) {
      return createSecureErrorResponse("Unauthorized", 401, request);
    }

    // Soft delete - just deactivate
    const department = await prisma.department.update({
      where: { id: params.id },
      data: { is_active: false },
    });

    return createSecureResponse(
      {
        success: true,
        message: "Department deactivated successfully",
        data: department,
      },
      { status: 200 },
      request,
    );
  } catch (error) {
    console.error("Error deactivating department:", error);
    return createSecureErrorResponse(
      "Failed to deactivate department",
      500,
      request,
    );
  }
}

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

    const employee = await prisma.user.findUnique({
      where: { id },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        check_ins: {
          orderBy: { date: "desc" },
          take: 30,
        },
        employeeMetrics: true,
      },
    });

    if (!employee) {
      return createSecureErrorResponse("Employee not found", 404, request);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...sanitizedEmployee } = employee;

    return createSecureResponse(
      {
        success: true,
        data: sanitizedEmployee,
      },
      { status: 200 },
      request,
    );
  } catch (error) {
    console.error("Error fetching employee:", error);
    return createSecureErrorResponse("Failed to fetch employee", 500, request);
  }
}

export async function PUT(
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
    const { full_name, position, department_id, is_active } = body;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (full_name !== undefined) updateData.full_name = full_name;
    if (position !== undefined) updateData.position = position;
    if (department_id !== undefined) updateData.department_id = department_id;
    if (is_active !== undefined) updateData.is_active = is_active;

    const employee = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...sanitizedEmployee } = employee;

    return createSecureResponse(
      {
        success: true,
        message: "Employee updated successfully",
        data: sanitizedEmployee,
      },
      { status: 200 },
      request,
    );
  } catch (error) {
    console.error("Error updating employee:", error);
    return createSecureErrorResponse("Failed to update employee", 500, request);
  }
}

export async function DELETE(
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
    const existing = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        full_name: true,
        email: true,
      },
    });

    if (!existing) {
      return createSecureErrorResponse("Employee not found", 404, request);
    }


    await prisma.user.delete({
      where: { id },
    });

    return createSecureResponse(
      {
        success: true,
        message: `Employee ${existing.full_name} permanently deleted`,
        data: {
          id,
          deleted: true,
        },
      },
      { status: 200 },
      request,
    );
  } catch (error) {
    console.error("Error deleting employee:", error);
    return createSecureErrorResponse("Failed to delete employee", 500, request);
  }
}


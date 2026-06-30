import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import {
  createSecureResponse,
  createSecureErrorResponse,
} from "@/lib/security/request-validator";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session?.user ||
      (session.user.role !== "HR" && session.user.role !== "ADMIN")
    ) {
      return createSecureErrorResponse("Unauthorized", 401, request);
    }

    const departments = await prisma.department.findMany({
      where: { is_active: true },
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return createSecureResponse(
      {
        success: true,
        data: departments,
      },
      { status: 200 },
      request,
    );
  } catch (error) {
    console.error("Error fetching departments:", error);
    return createSecureErrorResponse(
      "Failed to fetch departments",
      500,
      request,
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session?.user ||
      (session.user.role !== "HR" && session.user.role !== "ADMIN")
    ) {
      return createSecureErrorResponse("Unauthorized", 401, request);
    }

    const body = await request.json();
    const { name, code, description } = body;

    if (!name || !code) {
      return createSecureErrorResponse(
        "Name and code are required",
        400,
        request,
      );
    }

    // Check if department code already exists
    const existing = await prisma.department.findUnique({
      where: { code },
    });

    if (existing) {
      return createSecureErrorResponse(
        "Department code already exists",
        409,
        request,
      );
    }

    const department = await prisma.department.create({
      data: {
        name,
        code,
        description,
        is_active: true,
      },
    });

    return createSecureResponse(
      {
        success: true,
        message: "Department created successfully",
        data: department,
      },
      { status: 201 },
      request,
    );
  } catch (error) {
    console.error("Error creating department:", error);
    return createSecureErrorResponse(
      "Failed to create department",
      500,
      request,
    );
  }
}

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import {
  createSecureResponse,
  createSecureErrorResponse,
} from "@/lib/security/request-validator";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session?.user ||
      (session.user.role !== "HR" && session.user.role !== "ADMIN")
    ) {
      return createSecureErrorResponse("Unauthorized", 401, request);
    }

    const searchParams = request.nextUrl.searchParams;
    const departmentId = searchParams.get("department_id");
    const search = searchParams.get("search");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { role: "EMPLOYEE" };

    if (departmentId) {
      where.department_id = departmentId;
    }

    if (search) {
      where.OR = [
        { full_name: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
      ];
    }

    const employees = await prisma.user.findMany({
      where,
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { full_name: "asc" },
    });

    const sanitizedEmployees = employees.map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ({ password_hash, ...rest }) => rest,
    );

    return createSecureResponse(
      {
        success: true,
        data: sanitizedEmployees,
      },
      { status: 200 },
      request,
    );
  } catch (error) {
    console.error("Error fetching employees:", error);
    return createSecureErrorResponse("Failed to fetch employees", 500, request);
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
    const { email, full_name, position, department_id, password } = body;

    if (!email || !full_name || !department_id) {
      return createSecureErrorResponse("Missing required fields", 400, request);
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return createSecureErrorResponse(
        "User with this email already exists",
        409,
        request,
      );
    }

    const department = await prisma.department.findUnique({
      where: { id: department_id },
    });

    if (!department) {
      return createSecureErrorResponse("Department not found", 404, request);
    }

    // Use provided password or generate one
    const plainPassword =
      password || Math.random().toString(36).slice(-8) + "123";
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const employee = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password_hash: passwordHash,
        full_name,
        role: "EMPLOYEE",
        department_id,
        position,
        is_active: true,
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    await prisma.employeeMetrics.create({
      data: { user_id: employee.id },
    });

    // Remove password_hash from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...sanitizedEmployee } = employee;

    return createSecureResponse(
      {
        success: true,
        message: "Employee created successfully",
        data: {
          ...sanitizedEmployee,
          temporary_password: plainPassword,
        },
      },
      { status: 201 },
      request,
    );
  } catch (error) {
    console.error("Error creating employee:", error);
    return createSecureErrorResponse("Failed to create employee", 500, request);
  }
}

import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/auth-options";

export interface AuthUser {
  id: string;
  email: string;
  role: "EMPLOYEE" | "HR" | "ADMIN";
  department_id: string;
  departmentName: string;
  position?: string | null;
}

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user || null;
}

export type ApiHandler = (
  request: NextRequest,
  user: AuthUser,
) => Promise<NextResponse>;

export function requireAuth(handler: ApiHandler) {
  return async (request: NextRequest) => {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please login." },
        { status: 401 },
      );
    }

    const user: AuthUser = {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role as "EMPLOYEE" | "HR" | "ADMIN",
      department_id: session.user.departmentId,
      departmentName: session.user.departmentName,
      position: session.user.position,
    };

    return handler(request, user);
  };
}

export function requireRole(roles: ("EMPLOYEE" | "HR" | "ADMIN")[]) {
  return (handler: ApiHandler) => {
    return async (request: NextRequest) => {
      const session = await getServerSession(authOptions);

      if (!session?.user) {
        return NextResponse.json(
          { success: false, error: "Unauthorized. Please login." },
          { status: 401 },
        );
      }

      if (!roles.includes(session.user.role as "EMPLOYEE" | "HR" | "ADMIN")) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Forbidden. You don't have permission to access this resource.",
          },
          { status: 403 },
        );
      }

      const user: AuthUser = {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role as "EMPLOYEE" | "HR" | "ADMIN",
        department_id: session.user.departmentId,
        departmentName: session.user.departmentName,
        position: session.user.position,
      };

      return handler(request, user);
    };
  };
}

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (path === "/") {
      if (!token) {
        return NextResponse.next();
      }
      if (token.role === "HR") {
        return NextResponse.redirect(new URL("/hr", req.url));
      }
      if (token.role === "EMPLOYEE") {
        return NextResponse.redirect(new URL("/employee", req.url));
      }
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (path.startsWith("/hr")) {
      if (!token || token.role !== "HR") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    if (path.startsWith("/employee")) {
      if (!token || token.role !== "EMPLOYEE") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    if (path.startsWith("/api/hr")) {
      if (!token || token.role !== "HR") {
        return NextResponse.json(
          { success: false, error: "Forbidden. HR access required." },
          { status: 403 },
        );
      }
    }

    if (path.startsWith("/api/employee")) {
      if (!token || token.role !== "EMPLOYEE") {
        return NextResponse.json(
          { success: false, error: "Forbidden. Employee access required." },
          { status: 403 },
        );
      }
    }

    if (path.startsWith("/api/check-in")) {
      if (!token || (token.role !== "HR" && token.role !== "EMPLOYEE")) {
        return NextResponse.json(
          { success: false, error: "Forbidden. Authentication required." },
          { status: 403 },
        );
      }
    }

    const response = NextResponse.next();
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");

    return response;
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  },
);

export const config = {
  matcher: [
    "/",
    "/hr/:path*",
    "/employee/:path*",
    "/api/hr/:path*",
    "/api/employee/:path*",
    "/api/check-in/:path*",
  ],
};

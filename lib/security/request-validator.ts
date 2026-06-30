import { NextRequest, NextResponse } from "next/server";
import { getAllowedOrigins } from "./origin-validator";

export function validateOrigin(request: NextRequest): NextResponse | null {
  const allowedOrigins = getAllowedOrigins();
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  if (allowedOrigins.length === 0) {
    return null;
  }

  if (origin && !allowedOrigins.includes(origin)) {
    console.warn(`Unauthorized origin attempted: ${origin}`, {
      allowedOrigins,
    });
    return NextResponse.json(
      { success: false, error: "Unauthorized origin" },
      { status: 403 },
    );
  }

  if (!origin && referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      if (!allowedOrigins.includes(refererOrigin)) {
        console.warn(`Unauthorized referer attempted: ${refererOrigin}`, {
          allowedOrigins,
        });
        return NextResponse.json(
          { success: false, error: "Unauthorized origin" },
          { status: 403 },
        );
      }
    } catch {
      console.warn(`Invalid referer URL: ${referer}`);
      return NextResponse.json(
        { success: false, error: "Invalid request origin" },
        { status: 403 },
      );
    }
  }

  return null;
}

export function validateCSRF(request: NextRequest): NextResponse | null {
  const method = request.method;
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    return null;
  }

  const allowedOrigins = getAllowedOrigins();
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  try {
    const requestOrigin = origin || (referer ? new URL(referer).origin : null);

    if (!requestOrigin || !allowedOrigins.includes(requestOrigin)) {
      console.warn(`CSRF protection triggered for origin: ${requestOrigin}`);
      return NextResponse.json(
        { success: false, error: "CSRF protection: Invalid origin" },
        { status: 403 },
      );
    }
  } catch (e) {
    console.warn(`Error validating CSRF: ${e}`);
    return NextResponse.json(
      { success: false, error: "Invalid request origin" },
      { status: 403 },
    );
  }

  return null;
}

export function validateSecurity(request: NextRequest): NextResponse | null {
  const originError = validateOrigin(request);
  if (originError) return originError;

  const csrfError = validateCSRF(request);
  if (csrfError) return csrfError;

  return null;
}

export function setSecurityHeaders(
  response: NextResponse,
  origin?: string | null,
): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains",
  );

  const allowedOrigins = getAllowedOrigins();

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  } else if (allowedOrigins.length > 0) {
    response.headers.set("Access-Control-Allow-Origin", allowedOrigins[0]);
  }

  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With",
  );
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Max-Age", "86400");

  return response;
}

export function createSecureResponse(
  data: unknown,
  options: {
    status?: number;
    statusText?: string;
    headers?: Record<string, string>;
  } = {},
  request?: NextRequest,
): NextResponse {
  const { headers, ...responseOptions } = options;
  const response = NextResponse.json(data, responseOptions);

  if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  const origin = request?.headers.get("origin");
  return setSecurityHeaders(response, origin);
}

export function createSecureErrorResponse(
  error: string,
  status: number = 400,
  request?: NextRequest,
): NextResponse {
  const response = NextResponse.json({ success: false, error }, { status });
  const origin = request?.headers.get("origin");
  return setSecurityHeaders(response, origin);
}

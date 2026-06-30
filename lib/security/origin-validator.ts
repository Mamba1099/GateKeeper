/*
 * Copyright (c) 2025 GateKeeper System
 * All rights reserved.
 */

export function getAllowedOrigins(): string[] {
  const origins: string[] = [];

  const allowedOrigins = process.env.ALLOWED_ORIGINS;

  if (allowedOrigins && allowedOrigins.trim() !== "") {
    origins.push(
      ...allowedOrigins
        .split(",")
        .map((o) => o.trim())
        .filter((o) => {
          try {
            new URL(o);
            return true;
          } catch {
            console.warn(`Invalid origin in ALLOWED_ORIGINS: ${o}`);
            return false;
          }
        }),
    );
  }

  if (process.env.NODE_ENV === "development") {
    origins.push("http://localhost:3000");
  }

  if (process.env.NODE_ENV === "production" && origins.length === 0) {
    const productionUrl = process.env.PRODUCTION_URL;
    if (productionUrl) {
      origins.push(productionUrl);
    } else {
      console.warn("PRODUCTION_URL environment variable not set in production");
    }
  }

  return Array.from(new Set(origins));
}

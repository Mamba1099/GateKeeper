"use client";

import { QueryProvider } from "./query-provider";
import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    <SessionProvider session={session}>
      <QueryProvider>
        {children}
      </QueryProvider>
    </SessionProvider>
  );
}
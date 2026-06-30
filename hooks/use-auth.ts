"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const logout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  };

  return {
    user: session?.user,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    isHR: session?.user?.role === "HR" || session?.user?.role === "ADMIN",
    isEmployee: session?.user?.role === "EMPLOYEE",
    isAdmin: session?.user?.role === "ADMIN",
    logout,
    session,
  };
}

import { getServerSession } from "next-auth";
import { authOptions } from "./auth-options";

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export async function isAuthenticated() {
  const session = await getSession();
  return !!session;
}

export async function hasRole(roles: string | string[]) {
  const user = await getCurrentUser();
  if (!user) return false;

  const roleList = Array.isArray(roles) ? roles : [roles];
  return roleList.includes(user.role as string);
}

export async function isAdmin() {
  return hasRole(["ADMIN", "HR"]);
}

export async function isEmployee() {
  return hasRole("EMPLOYEE");
}

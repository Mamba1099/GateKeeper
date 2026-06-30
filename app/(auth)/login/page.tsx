import { LoginForm } from "@/components/forms/login-form";
import { getSession } from "@/lib/auth/auth.config";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/");
  }

  return <LoginForm />;
}

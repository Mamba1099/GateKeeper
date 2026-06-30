"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "@/lib/validations/auth-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, Mail, Lock, Loader2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    } as LoginInput,
    onSubmit: async ({ value }) => {
      setIsLoading(true);

      try {
        const result = await signIn("credentials", {
          email: value.email,
          password: value.password,
          redirect: false,
        });

        if (result?.error) {
          let errorMessage = "Login failed. Please try again.";

          if (result.error === "CredentialsSignin") {
            errorMessage = "Invalid email or password";
          } else if (result.error.toLowerCase().includes("deactivated")) {
            errorMessage =
              "Your account has been deactivated. Please contact HR.";
          } else if (result.error.toLowerCase().includes("verified")) {
            errorMessage = "Please verify your email before logging in.";
          }

          toast.error(errorMessage);
          return;
        }

        toast.success("Welcome back! You have successfully logged in.");
        router.push("/");
        router.refresh();
      } catch (error) {
        console.error("Login error:", error);
        toast.error("An unexpected error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    validators: {
      onChange: loginSchema,
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getFieldErrors = (field: any) => {
    if (!field?.state?.meta?.errors) return [];
    return field.state.meta.errors;
  };

  return (
    <Card className="w-full shadow-lg border-0">
      <CardHeader className="space-y-3 pb-6 pt-8">
        <div className="flex justify-center">
          <div className="h-14 w-14 rounded-xl bg-blue-600 flex items-center justify-center">
            <Building2 className="h-7 w-7 text-white" />
          </div>
        </div>
        <div className="text-center">
          <CardTitle className="text-2xl font-semibold text-gray-900">
            GateKeeper
          </CardTitle>
          <CardDescription className="text-sm text-gray-500 mt-1">
            Sign in to your account
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 px-8 pb-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="email"
            validators={{
              onChange: loginSchema.shape.email,
            }}
          >
            {(field) => {
              const errors = getFieldErrors(field);
              const hasError = errors.length > 0;

              return (
                <div className="space-y-1.5">
                  <Label
                    htmlFor={field.name}
                    className="text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id={field.name}
                      type="email"
                      placeholder="hr@gatekeeper.com"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled={isLoading}
                      className={`pl-10 h-10 ${
                        hasError
                          ? "border-red-500 focus-visible:ring-red-500"
                          : "border-gray-200 focus-visible:ring-blue-500"
                      }`}
                    />
                  </div>
                  {hasError && (
                    <p className="text-sm text-red-500">
                      {errors[0]?.message || "Invalid input"}
                    </p>
                  )}
                </div>
              );
            }}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: loginSchema.shape.password,
            }}
          >
            {(field) => {
              const errors = getFieldErrors(field);
              const hasError = errors.length > 0;

              return (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor={field.name}
                      className="text-sm font-medium text-gray-700"
                    >
                      Password
                    </Label>
                    <a
                      href="#"
                      className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id={field.name}
                      type="password"
                      placeholder="Enter your password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled={isLoading}
                      className={`pl-10 h-10 ${
                        hasError
                          ? "border-red-500 focus-visible:ring-red-500"
                          : "border-gray-200 focus-visible:ring-blue-500"
                      }`}
                    />
                  </div>
                  {hasError && (
                    <p className="text-sm text-red-500">
                      {errors[0]?.message || "Invalid input"}
                    </p>
                  )}
                </div>
              );
            }}
          </form.Field>

          <form.Subscribe selector={(state) => state.canSubmit}>
            {(canSubmit) => (
              <Button
                type="submit"
                className="w-full h-10 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                disabled={!canSubmit || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <div className="pt-2 text-center">
          <p className="text-xs text-gray-400">Secured by GateKeeper</p>
        </div>
      </CardContent>
    </Card>
  );
}

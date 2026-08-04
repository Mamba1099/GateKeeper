"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useResetPassword } from "@/hooks/mutations/use-forgot-password";
import { useValidateResetToken } from "@/hooks/queries/use-forgot-password-queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2, Eye, EyeOff } from "lucide-react";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { data: tokenValidation, isLoading: validatingToken } =
    useValidateResetToken(token);
  const resetPasswordMutation = useResetPassword();

  const form = useForm({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true);

      try {
        await resetPasswordMutation.mutateAsync({
          token,
          newPassword: value.newPassword,
          confirmPassword: value.confirmPassword,
        });

        toast.success("Password reset successfully! Please login.");
        router.push("/login");
      } catch (error) {
        console.error("Reset password error:", error);
        toast.error("An unexpected error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (validatingToken) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!tokenValidation?.valid) {
    return (
      <div className="text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
          <Lock className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          Invalid or Expired Link
        </h3>
        <p className="text-sm text-gray-500">
          This password reset link is invalid or has expired.
        </p>
        <Button
          onClick={() => router.push("/forgot-password")}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Request New Link
        </Button>
      </div>
    );
  }

return (
  <form
    onSubmit={(e) => {
      e.preventDefault();
      e.stopPropagation();
      form.handleSubmit();
    }}
    className="space-y-4"
  >
    <form.Field
      name="newPassword"
      validators={{
        onChange: ({ value }) => {
          if (!value) return "Password is required";
          if (value.length < 8) return "Password must be at least 8 characters";
          if (!/[A-Z]/.test(value))
            return "Password must contain at least one uppercase letter";
          if (!/[a-z]/.test(value))
            return "Password must contain at least one lowercase letter";
          if (!/[0-9]/.test(value))
            return "Password must contain at least one number";

          return undefined;
        },
      }}
    >
      {(field) => {
        const errors = field.state.meta.errors;
        const hasError = errors.length > 0;

        return (
          <div className="space-y-1.5">
            <Label
              htmlFor={field.name}
              className="text-sm font-medium text-gray-700"
            >
              New Password
            </Label>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

              <Input
                id={field.name}
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                disabled={isLoading}
                className={`pl-10 pr-10 h-10 ${
                  hasError
                    ? "border-red-500 focus-visible:ring-red-500"
                    : "border-gray-200 focus-visible:ring-blue-500"
                }`}
              />

              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {hasError && (
              <p className="text-sm text-red-500">{String(errors[0])}</p>
            )}
          </div>
        );
      }}
    </form.Field>

    <form.Field
      name="confirmPassword"
      validators={{
        onChange: ({ value, fieldApi }) => {
          if (!value) return "Please confirm your password";

          const password = fieldApi.form.getFieldValue("newPassword");

          if (value !== password) {
            return "Passwords do not match";
          }

          return undefined;
        },
      }}
    >
      {(field) => {
        const errors = field.state.meta.errors;
        const hasError = errors.length > 0;

        return (
          <div className="space-y-1.5">
            <Label
              htmlFor={field.name}
              className="text-sm font-medium text-gray-700"
            >
              Confirm Password
            </Label>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

              <Input
                id={field.name}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                disabled={isLoading}
                className={`pl-10 pr-10 h-10 ${
                  hasError
                    ? "border-red-500 focus-visible:ring-red-500"
                    : "border-gray-200 focus-visible:ring-blue-500"
                }`}
              />

              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {hasError && (
              <p className="text-sm text-red-500">{String(errors[0])}</p>
            )}
          </div>
        );
      }}
    </form.Field>

    <form.Subscribe selector={(state) => state.canSubmit}>
      {(canSubmit) => (
        <Button
          type="submit"
          disabled={!canSubmit || isLoading}
          className="w-full h-10 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      )}
    </form.Subscribe>
  </form>
);
}

"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useForgotPassword } from "@/hooks/mutations/use-forgot-password";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Loader2 } from "lucide-react";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const forgotPasswordMutation = useForgotPassword();

  const form = useForm({
    defaultValues: {
      email: "",
    },

    onSubmit: async ({ value }) => {
      setIsLoading(true);

      try {
        const result = await forgotPasswordMutation.mutateAsync(value.email);

        if (result.token) {
          toast.success("Verification successful! Set your new password.");
          router.push(`/reset-password?token=${result.token}`);
        } else {
          toast.success("If an account exists, you can reset your password.");
        }
      } catch (error) {
        console.error("Forgot password error:", error);
        toast.error("An unexpected error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
  });

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
        name="email"
        validators={{
          onChange: ({ value }) => {
            if (!value) {
              return "Email is required";
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              return "Invalid email address";
            }

            return undefined;
          },
        }}
      >
        {(field) => (
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
                  field.state.meta.errors.length
                    ? "border-red-500 focus-visible:ring-red-500"
                    : "border-gray-200 focus-visible:ring-blue-500"
                }`}
              />
            </div>

            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-red-500">
                {String(field.state.meta.errors[0])}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <Button
        type="submit"
        className="w-full h-10 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Validating...
          </>
        ) : (
          "Continue"
        )}
      </Button>
    </form>
  );
}

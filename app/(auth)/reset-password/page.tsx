"use client";

import { ResetPasswordForm } from "@/components/forms/reset-password-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-3 pb-6 pt-8">
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-xl bg-blue-600 flex items-center justify-center">
              <Building2 className="h-7 w-7 text-white" />
            </div>
          </div>
          <div className="text-center">
            <CardTitle className="text-2xl font-semibold text-gray-900">
              Reset Password
            </CardTitle>
            <CardDescription className="text-sm text-gray-500 mt-1">
              Enter your new password
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 px-8 pb-8">
          {token ? (
            <ResetPasswordForm token={token} />
          ) : (
            <div className="text-center">
              <div className="text-red-500 mb-4">
                No token provided. Please request a password reset.
              </div>
              <a
                href="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                Request Password Reset
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

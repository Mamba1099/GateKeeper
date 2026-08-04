import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { PasswordResetService } from "@/lib/services/auth-service";

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => PasswordResetService.forgotPassword(email),
    onError: (error: ApiError) => {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to process request. Please try again.");
      }
    },
  });
}
export function useResetPassword() {
  return useMutation({
    mutationFn: (data: {
      token: string;
      newPassword: string;
      confirmPassword: string;
    }) =>
      PasswordResetService.resetPassword(
        data.token,
        data.newPassword,
        data.confirmPassword,
      ),
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || "Failed to reset password");
    },
  });
}
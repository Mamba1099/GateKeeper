import { useQuery } from "@tanstack/react-query";
import { PasswordResetService } from "@/lib/services/auth-service";

export function useValidateResetToken(token: string | null) {
  return useQuery({
    queryKey: ["validate-reset-token", token],
    queryFn: () => PasswordResetService.validateResetToken(token!),
    enabled: !!token,
    retry: 1,
  });
}

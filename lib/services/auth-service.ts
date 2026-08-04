import { authApi } from "@/lib/api/auth-api";

export class PasswordResetService {
  static async forgotPassword(email: string) {
    const response = await authApi.forgotPassword({ email });
    return response;
  }

  static async validateResetToken(token: string) {
    const response = await authApi.validateResetToken(token);
    return response;
  }

  static async resetPassword(
    token: string,
    newPassword: string,
    confirmPassword: string,
  ) {
    const response = await authApi.resetPassword({
      token,
      newPassword,
      confirmPassword,
    });
    return response;
  }
}

import apiClient from "../api-client";

export const authApi = {
  forgotPassword: async (data: { email: string }) => {
    const response = await apiClient.post("/api/auth/forgot-password", data);
    return response.data;
  },

  validateResetToken: async (token: string) => {
    const response = await apiClient.get(
      `/api/auth/validate-reset-token?token=${token}`,
    );
    return response.data;
  },

  resetPassword: async (data: {
    token: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    const response = await apiClient.post("/api/auth/reset-password", data);
    return response.data;
  },
};

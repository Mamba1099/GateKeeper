import axios from "axios";
import { getSession } from "next-auth/react";

const baseUrl = process.env.NEXTAUTH_URL || "";

export const apiClient = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor to add auth token from NextAuth session
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const session = await getSession();
      if (session?.user) {
      }
      return config;
    } catch  {
      return config;
    }
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const session = await getSession();
        if (session?.user) {
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;

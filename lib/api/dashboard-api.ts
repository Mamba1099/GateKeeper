import { apiClient } from "@/lib/api-client"; 
import { DashboardData } from "@/types/dashboard";

export const dashboardApi = {
  getDashboardSummary: async (): Promise<{
    success: boolean;
    data: DashboardData;
  }> => {
    const response = await apiClient.get("/api/hr/dashboard");
    return response.data;
  },
};

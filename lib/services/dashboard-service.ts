import { dashboardApi } from "@/lib/api/dashboard-api";
import { DashboardData } from "@/types/dashboard";

export class DashboardService {
  static async getSummary(): Promise<DashboardData> {
    const response = await dashboardApi.getDashboardSummary();
    if (!response.success) throw new Error("Failed to fetch dashboard data");
    return response.data;
  }
}

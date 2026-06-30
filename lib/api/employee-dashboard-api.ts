import apiClient from "../api-client";

export const employeeDashboardApi = {
  getStats: async () => {
    const response = await apiClient.get("/api/employee/dashboard/stats");
    return response.data;
  },

  getTodayStatus: async () => {
    const response = await apiClient.get(
      "/api/employee/dashboard/today-status",
    );
    return response.data;
  },

  getAttendanceTrend: async () => {
    const response = await apiClient.get(
      "/api/employee/dashboard/attendance-trend",
    );
    return response.data;
  },

  getArrivalPattern: async () => {
    const response = await apiClient.get(
      "/api/employee/dashboard/arrival-pattern",
    );
    return response.data;
  },

  getHoursWorked: async () => {
    const response = await apiClient.get(
      "/api/employee/dashboard/hours-worked",
    );
    return response.data;
  },

  getComparison: async () => {
    const response = await apiClient.get("/api/employee/dashboard/comparison");
    return response.data;
  },
};

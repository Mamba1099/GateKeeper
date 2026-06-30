import { employeeDashboardApi } from "@/lib/api/employee-dashboard-api";

export class EmployeeDashboardService {
  static async getStats() {
    const response = await employeeDashboardApi.getStats();
    return response;
  }

  static async getTodayStatus() {
    const response = await employeeDashboardApi.getTodayStatus();
    return response;
  }

  static async getAttendanceTrend() {
    const response = await employeeDashboardApi.getAttendanceTrend();
    return response;
  }

  static async getArrivalPattern() {
    const response = await employeeDashboardApi.getArrivalPattern();
    return response;
  }

  static async getHoursWorked() {
    const response = await employeeDashboardApi.getHoursWorked();
    return response;
  }

  static async getComparison() {
    const response = await employeeDashboardApi.getComparison();
    return response;
  }
}

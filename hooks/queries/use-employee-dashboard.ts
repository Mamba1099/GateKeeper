import { useQuery } from "@tanstack/react-query";
import { EmployeeDashboardService } from "../../lib/services/employee-dahsboard-service";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  stats: () => [...dashboardKeys.all, "stats"] as const,
  todayStatus: () => [...dashboardKeys.all, "today-status"] as const,
  attendanceTrend: () => [...dashboardKeys.all, "attendance-trend"] as const,
  arrivalPattern: () => [...dashboardKeys.all, "arrival-pattern"] as const,
  hoursWorked: () => [...dashboardKeys.all, "hours-worked"] as const,
  comparison: () => [...dashboardKeys.all, "comparison"] as const,
};

export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: () => EmployeeDashboardService.getStats(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useTodayStatus() {
  return useQuery({
    queryKey: dashboardKeys.todayStatus(),
    queryFn: () => EmployeeDashboardService.getTodayStatus(),
    staleTime: 60 * 1000,
    retry: 1,
  });
}

export function useAttendanceTrend() {
  return useQuery({
    queryKey: dashboardKeys.attendanceTrend(),
    queryFn: () => EmployeeDashboardService.getAttendanceTrend(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useArrivalPattern() {
  return useQuery({
    queryKey: dashboardKeys.arrivalPattern(),
    queryFn: () => EmployeeDashboardService.getArrivalPattern(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useHoursWorked() {
  return useQuery({
    queryKey: dashboardKeys.hoursWorked(),
    queryFn: () => EmployeeDashboardService.getHoursWorked(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useComparison() {
  return useQuery({
    queryKey: dashboardKeys.comparison(),
    queryFn: () => EmployeeDashboardService.getComparison(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

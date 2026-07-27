import { useQuery } from "@tanstack/react-query";
import { DashboardService } from "@/lib/services/dashboard-service";
import { DashboardData } from "@/types/dashboard";

export const DASHBOARD_QUERY_KEY = "hr-dashboard";

export function useDashboardQuery() {
  return useQuery<DashboardData>({
    queryKey: [DASHBOARD_QUERY_KEY],
    queryFn: () => DashboardService.getSummary(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

import { useQuery } from "@tanstack/react-query";
import { CheckInService } from "@/lib/services/check-in-service";

export const checkInKeys = {
  all: ["check-in"] as const,
  status: () => [...checkInKeys.all, "status"] as const,
  stats: () => [...checkInKeys.all, "stats"] as const,
  history: () => [...checkInKeys.all, "history"] as const,
};

export function useCheckInStatus() {
  return useQuery({
    queryKey: checkInKeys.status(),
    queryFn: () => CheckInService.getStatus(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckInService } from "@/lib/services/check-in-service";
import { checkInKeys } from "@/hooks/queries/use-check-in-queries";
import { employeeKeys } from "@/hooks/queries/use-employee-queries";
import { dashboardKeys } from "@/hooks/queries/use-employee-dashboard";
import { historyKeys } from "@/hooks/queries/use-employee-queries";

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (checkInTime: string) => CheckInService.checkIn(checkInTime),
    onSuccess: (data) => {
      toast.success(data.message || "Checked in successfully!");
      queryClient.invalidateQueries({ queryKey: checkInKeys.status() });
      queryClient.invalidateQueries({ queryKey: checkInKeys.all });
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      queryClient.invalidateQueries({ queryKey: historyKeys.all });
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || "Failed to check in");
    },
  });
}

export function useCheckOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => CheckInService.checkOut(),
    onSuccess: (data) => {
      toast.success(data.message || "Checked out successfully!");
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: checkInKeys.status() });
      queryClient.invalidateQueries({ queryKey: checkInKeys.all });
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      queryClient.invalidateQueries({ queryKey: historyKeys.all });
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || "Failed to check out");
    },
  });
}

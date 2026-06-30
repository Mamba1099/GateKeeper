import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DepartmentService } from "@/lib/services/department-service";
import { departmentKeys } from "@/hooks/queries/use-department-queries";
import {
  CreateDepartmentData,
  UpdateDepartmentData,
} from "@/lib/api/department-api";
import { ApiError } from "@/types/api";

export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDepartmentData) =>
      DepartmentService.createDepartment(data),
    onSuccess: (data) => {
      toast.success(data.message || "Department created successfully!");
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
    },
    onError: (error: ApiError) => {
      toast.error(
        error.response?.data?.message || "Failed to create department",
      );
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDepartmentData }) =>
      DepartmentService.updateDepartment(id, data),
    onSuccess: (data) => {
      toast.success(data.message || "Department updated successfully!");
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: departmentKeys.details() });
    },
    onError: (error: ApiError) => {
      toast.error(
        error.response?.data?.message || "Failed to update department",
      );
    },
  });
}

export function useDeactivateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => DepartmentService.deactivateDepartment(id),
    onSuccess: (data) => {
      toast.success(data.message || "Department deactivated successfully!");
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
    },
    onError: (error: ApiError) => {
      toast.error(
        error.response?.data?.message || "Failed to deactivate department",
      );
    },
  });
}

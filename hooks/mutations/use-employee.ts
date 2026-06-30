import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { EmployeeService } from "@/lib/services/employee-service";
import { employeeKeys } from "@/hooks/queries/use-employee-queries";
import { CreateEmployeeData, UpdateEmployeeData } from "@/lib/api/employee-api";
import { profileKeys } from "@/hooks/queries/use-employee-queries";

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmployeeData) =>
      EmployeeService.createEmployee(data),
    onSuccess: () => {
      toast.success("Employee created successfully!");
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || "Failed to create employee");
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeData }) =>
      EmployeeService.updateEmployee(id, data),
    onSuccess: () => {
      toast.success("Employee updated successfully!");
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.details() });
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || "Failed to update employee");
    },
  });
}

export function useDeactivateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => EmployeeService.deactivateEmployee(id),
    onSuccess: () => {
      toast.success("Employee deactivated successfully!");
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
    onError: (error: ApiError) => {
      toast.error(
        error.response?.data?.message || "Failed to deactivate employee",
      );
    },
  });
}

export function useActivateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => EmployeeService.activateEmployee(id),
    onSuccess: () => {
      toast.success("Employee activated successfully!");
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
    onError: (error: ApiError) => {
      toast.error(
        error.response?.data?.message || "Failed to activate employee",
      );
    },
  });
}

export function useResetPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      EmployeeService.resetPassword(id, password),
    onSuccess: () => {
      toast.success("Password reset successfully!");
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || "Failed to reset password");
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: EmployeeService.updateProfile,
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: profileKeys.detail() });
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || "Failed to update profile");
    },
  });
}

export function useChangePassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: EmployeeService.changePassword,
    onSuccess: () => {
      toast.success("Password changed successfully!");
      queryClient.invalidateQueries({ queryKey: profileKeys.detail() });
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || "Failed to change password");
    },
  });
}

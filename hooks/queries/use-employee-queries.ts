import { HistoryFilters } from "@/types/employee";
import { useQuery } from "@tanstack/react-query";
import { EmployeeService } from "@/lib/services/employee-service";


export const employeeKeys = {
  all: ["employees"] as const,
  lists: () => [...employeeKeys.all, "list"] as const,
  list: (filters?: { department_id?: string; search?: string }) =>
    [...employeeKeys.lists(), filters] as const,
  details: () => [...employeeKeys.all, "detail"] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
};

export function useEmployees(params?: {
  department_id?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: async () => {
      console.log("Fetching employees with params:", params);
      const response = await EmployeeService.getEmployees(params);
      console.log("Employees API Response:", response);
      return response;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => EmployeeService.getEmployee(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export const profileKeys = {
  all: ["employee-profile"] as const,
  detail: () => [...profileKeys.all, "detail"] as const,
};

export function useEmployeeProfile() {
  return useQuery({
    queryKey: profileKeys.detail(),
    queryFn: () => EmployeeService.getProfile(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}


export const historyKeys = {
  all: ["employee-history"] as const,
  list: (filters?: HistoryFilters) => [...historyKeys.all, "list", filters] as const,
};

export function useCheckInHistory(filters: HistoryFilters) {
  return useQuery({
    queryKey: historyKeys.list(filters),
    queryFn: () => EmployeeService.getCheckInHistory(filters),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: true,
  });
}
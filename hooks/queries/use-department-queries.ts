import { useQuery } from "@tanstack/react-query";
import { DepartmentService } from "@/lib/services/department-service";

export const departmentKeys = {
  all: ["departments"] as const,
  lists: () => [...departmentKeys.all, "list"] as const,
  details: () => [...departmentKeys.all, "detail"] as const,
  detail: (id: string) => [...departmentKeys.details(), id] as const,
};

export function useDepartments() {
  return useQuery({
    queryKey: departmentKeys.lists(),
    queryFn: async () => {
      const response = await DepartmentService.getDepartments();
      console.log("API Response:", response);
      return response;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useDepartment(id: string) {
  return useQuery({
    queryKey: departmentKeys.detail(id),
    queryFn: () => DepartmentService.getDepartment(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

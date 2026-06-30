import apiClient from "../api-client";

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  is_active: boolean;
  _count?: {
    users: number;
  };
}

export interface CreateDepartmentData {
  name: string;
  code: string;
  description?: string;
}

export interface UpdateDepartmentData {
  name?: string;
  code?: string;
  description?: string;
  is_active?: boolean;
}

export const departmentApi = {
  // GET all departments
  getDepartments: async () => {
    const response = await apiClient.get("/api/hr/departments");
    return response.data;
  },

  // GET single department
  getDepartment: async (id: string) => {
    const response = await apiClient.get(`/api/hr/departments/${id}`);
    return response.data;
  },

  // POST create department
  createDepartment: async (data: CreateDepartmentData) => {
    const response = await apiClient.post("/api/hr/departments", data);
    return response.data;
  },

  // PUT update department
  updateDepartment: async (id: string, data: UpdateDepartmentData) => {
    const response = await apiClient.put(`/api/hr/departments/${id}`, data);
    return response.data;
  },

  // DELETE deactivate department
  deactivateDepartment: async (id: string) => {
    const response = await apiClient.delete(`/api/hr/departments/${id}`);
    return response.data;
  },
};

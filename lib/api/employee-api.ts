import apiClient from "../api-client";

export interface Employee {
  id: string;
  email: string;
  full_name: string;
  position: string;
  department_id: string;
  department: {
    name: string;
    id: string;
  };
  is_active: boolean;
  role: string;
}

export interface CreateEmployeeData {
  email: string;
  full_name: string;
  position: string;
  department_id: string;
  password?: string;
}

export interface UpdateEmployeeData {
  full_name?: string;
  position?: string;
  department_id?: string;
  is_active?: boolean;
}

export const employeeApi = {
  getEmployees: async (params?: {
    department_id?: string;
    search?: string;
  }) => {
    const response = await apiClient.get("/api/hr/employees", { params });
    return response.data;
  },

  getEmployee: async (id: string) => {
    const response = await apiClient.get(`/api/hr/employees/${id}`);
    return response.data;
  },

  createEmployee: async (data: CreateEmployeeData) => {
    const response = await apiClient.post("/api/hr/employees", data);
    return response.data;
  },

  updateEmployee: async (id: string, data: UpdateEmployeeData) => {
    const response = await apiClient.put(`/api/hr/employees/${id}`, data);
    return response.data;
  },

  deactivateEmployee: async (id: string) => {
    const response = await apiClient.delete(`/api/hr/employees/${id}`);
    return response.data;
  },

  activateEmployee: async (id: string) => {
    const response = await apiClient.post(`/api/hr/employees/${id}/activate`);
    return response.data;
  },

  resetPassword: async (id: string, password: string) => {
    const response = await apiClient.post(
      `/api/hr/employees/${id}/reset-password`,
      {
        password,
      },
    );
    return response.data;
  },

    // Profile
  getProfile: async () => {
    const response = await apiClient.get("/api/employee/profile");
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await apiClient.put("/api/employee/profile", data);
    return response.data;
  },

  changePassword: async (data: any) => {
    const response = await apiClient.post("/api/employee/change-password", data);
    return response.data;
  },

  getCheckInHistory: async (params: {
    start_date?: string;
    end_date?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get("/api/employee/history", { params });
    return response.data;
  },
};

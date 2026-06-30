import {
  employeeApi,
  CreateEmployeeData,
  UpdateEmployeeData,
} from "@/lib/api/employee-api";

export class EmployeeService {
  static async getEmployees(params?: {
    department_id?: string;
    search?: string;
  }) {
    const response = await employeeApi.getEmployees(params);
    return response;
  }

  static async getEmployee(id: string) {
    const response = await employeeApi.getEmployee(id);
    return response;
  }

  static async createEmployee(data: CreateEmployeeData) {
    const response = await employeeApi.createEmployee(data);
    return response;
  }

  static async updateEmployee(id: string, data: UpdateEmployeeData) {
    const response = await employeeApi.updateEmployee(id, data);
    return response;
  }

  static async deactivateEmployee(id: string) {
    const response = await employeeApi.deactivateEmployee(id);
    return response;
  }

  static async activateEmployee(id: string) {
    const response = await employeeApi.activateEmployee(id);
    return response;
  }

  static async resetPassword(id: string, password: string) {
    const response = await employeeApi.resetPassword(id, password);
    return response;
  }
  static async getProfile() {
    const response = await employeeApi.getProfile();
    return response;
  }

  static async updateProfile(data: UpdateProfileData) {
    const response = await employeeApi.updateProfile(data);
    return response;
  }

  static async changePassword(data: ChangePasswordData) {
    const response = await employeeApi.changePassword(data);
    return response;
  }

  static async getCheckInHistory(params: {
    start_date?: string;
    end_date?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await employeeApi.getCheckInHistory(params);
    return response;
  }
}

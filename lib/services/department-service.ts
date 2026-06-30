import {
  departmentApi,
  CreateDepartmentData,
  UpdateDepartmentData,
} from "@/lib/api/department-api";

export class DepartmentService {
  static async getDepartments() {
    const response = await departmentApi.getDepartments();
      console.log("Service response:", response);
    return response;
  }

  static async getDepartment(id: string) {
    const response = await departmentApi.getDepartment(id);
    return response;
  }

  static async createDepartment(data: CreateDepartmentData) {
    const response = await departmentApi.createDepartment(data);
    return response;
  }

  static async updateDepartment(id: string, data: UpdateDepartmentData) {
    const response = await departmentApi.updateDepartment(id, data);
    return response;
  }

  static async deactivateDepartment(id: string) {
    const response = await departmentApi.deactivateDepartment(id);
    return response;
  }
}

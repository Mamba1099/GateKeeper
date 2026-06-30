"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Mail,
  Building2,
  MoreVertical,
  Loader2,
  Filter,
  Download,
  Users,
  Eye,
  Pencil,
  Key,
  Trash2,
  CheckCircle,
  Plus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEmployees } from "@/hooks/queries/use-employee-queries";
import {
  useDeactivateEmployee,
  useActivateEmployee,
} from "@/hooks/mutations/use-employee";
import { Employee } from "@/lib/api/employee-api";
import { EmployeeFormDialog } from "@/components/hr/employee-form-dialog";
import { ResetPasswordDialog } from "@/components/hr/reset-password-dialog";

export default function HRManageEmployees() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetEmployee, setResetEmployee] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data, isLoading, refetch, error, isError } = useEmployees({
    search: searchTerm || undefined,
  });
  const deactivateMutation = useDeactivateEmployee();
  const activateMutation = useActivateEmployee();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
  }, [user, authLoading, router]);

  const handleDeactivate = (id: string) => {
    if (confirm("Are you sure you want to deactivate this employee?")) {
      deactivateMutation.mutate(id);
    }
  };

  const handleActivate = (id: string) => {
    if (confirm("Are you sure you want to activate this employee?")) {
      activateMutation.mutate(id);
    }
  };

  const handleResetPasswordClick = (employee: Employee) => {
    setResetEmployee({ id: employee.id, name: employee.full_name });
    setResetDialogOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditEmployee(employee);
    setEditDialogOpen(true);
  };

  const employees: Employee[] = data?.data || [];

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-600">Error loading employees</p>
          <p className="text-sm text-gray-500">
            {error?.message || "Unknown error"}
          </p>
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== "HR" && user.role !== "ADMIN")) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Employees
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your organization&apos;s workforce
          </p>
        </div>
        <EmployeeFormDialog
          mode="create"
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          trigger={
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          }
        />
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </p>
            <p className="text-xl font-bold text-gray-900">
              {employees.length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Active
            </p>
            <p className="text-xl font-bold text-emerald-600">
              {employees.filter((e) => e.is_active).length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Inactive
            </p>
            <p className="text-xl font-bold text-red-600">
              {employees.filter((e) => !e.is_active).length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Departments
            </p>
            <p className="text-xl font-bold text-purple-600">
              {new Set(employees.map((e) => e.department_id)).size}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Employee Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200 focus:border-blue-400"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-gray-600">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="text-gray-600">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 pt-0">
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="font-semibold text-gray-600">
                    Employee
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600 hidden sm:table-cell">
                    Position
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600 hidden md:table-cell">
                    Department
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-12 text-gray-500"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 text-gray-300" />
                        <p className="font-medium">No employees found</p>
                        <p className="text-sm">
                          Click the &quot;Add Employee&quot; button to get
                          started
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((employee) => (
                    <TableRow
                      key={employee.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center shrink-0">
                            <span className="text-sm font-medium text-blue-600">
                              {employee.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {employee.full_name}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center gap-1 truncate">
                              <Mail className="h-3 w-3 shrink-0" />
                              <span className="truncate">{employee.email}</span>
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="text-sm text-gray-600">
                          {employee.position || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {employee.department?.name || "—"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={employee.is_active ? "default" : "secondary"}
                          className={`${
                            employee.is_active
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                          } border-0`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                              employee.is_active
                                ? "bg-emerald-500"
                                : "bg-gray-400"
                            }`}
                          />
                          {employee.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-48 bg-white border border-gray-200 shadow-lg rounded-md p-1"
                          >
                            <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
                              <Eye className="h-4 w-4" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEdit(employee)}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                            >
                              <Pencil className="h-4 w-4" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleResetPasswordClick(employee)}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
                            >
                              <Key className="h-4 w-4" />
                              Reset Password
                            </DropdownMenuItem>
                            {employee.is_active ? (
                              <DropdownMenuItem
                                onClick={() => handleDeactivate(employee.id)}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                                Deactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleActivate(employee.id)}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50 rounded-md cursor-pointer"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Activate
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500">
              Showing {employees.length} employees
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editEmployee && (
        <EmployeeFormDialog
          mode="edit"
          employee={editEmployee}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}

      {/* Reset Password Dialog */}
      {resetEmployee && (
        <ResetPasswordDialog
          open={resetDialogOpen}
          onOpenChange={setResetDialogOpen}
          employeeId={resetEmployee.id}
          employeeName={resetEmployee.name}
        />
      )}
    </div>
  );
}

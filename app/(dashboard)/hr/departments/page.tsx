"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Loader2 } from "lucide-react";
import { useDepartments } from "@/hooks/queries/use-department-queries";
import { useDeactivateDepartment } from "@/hooks/mutations/use-department";
import { Department } from "@/lib/api/department-api";

export default function HRManageDepartments() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const { data, isLoading, refetch, error } = useDepartments();
  const deactivateMutation = useDeactivateDepartment();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
  }, [user, authLoading, router]);

  const handleDeactivate = (id: string, name: string) => {
    if (confirm(`Are you sure you want to deactivate "${name}" department?`)) {
      deactivateMutation.mutate(id);
    }
  };

  // Log the data to see what's coming back
  console.log("Departments data:", data);
  console.log("Is loading:", isLoading);

  const departments: Department[] = data?.data || [];

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-600">Error loading departments</p>
          <p className="text-sm text-gray-500">{error.message}</p>
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
            Departments
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your organization&apos;s departments and structure
          </p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </p>
            <p className="text-xl font-bold text-gray-900">
              {departments.length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Active
            </p>
            <p className="text-xl font-bold text-emerald-600">
              {departments.filter((d) => d.is_active).length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Employees
            </p>
            <p className="text-xl font-bold text-blue-600">
              {departments.reduce((acc, d) => acc + (d._count?.users || 0), 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Department Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0 sm:p-6">
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="font-semibold text-gray-600">
                    Department
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600 hidden sm:table-cell">
                    Code
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600 hidden md:table-cell">
                    Description
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    Employees
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-12 text-gray-500"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Building2 className="h-8 w-8 text-gray-300" />
                        <p className="font-medium">No departments found</p>
                        <p className="text-sm">
                          Add your first department to get started
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  departments.map((dept) => (
                    <TableRow
                      key={dept.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="font-medium text-gray-900">
                            {dept.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge
                          variant="outline"
                          className="font-mono text-xs border-gray-200 bg-gray-50"
                        >
                          {dept.code}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm text-gray-500">
                          {dept.description || "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <div className="flex -space-x-1.5">
                            {[
                              ...Array(Math.min(dept._count?.users || 0, 3)),
                            ].map((_, i) => (
                              <div
                                key={i}
                                className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center"
                              >
                                <span className="text-[10px] font-medium text-gray-600">
                                  {String.fromCharCode(65 + i)}
                                </span>
                              </div>
                            ))}
                          </div>
                          <span className="text-sm font-medium text-gray-700 ml-1">
                            {dept._count?.users || 0}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={dept.is_active ? "default" : "secondary"}
                            className={`${
                              dept.is_active
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                            } border-0`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                                dept.is_active
                                  ? "bg-emerald-500"
                                  : "bg-gray-400"
                              }`}
                            />
                            {dept.is_active ? "Active" : "Inactive"}
                          </Badge>
                          {dept.is_active && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() =>
                                handleDeactivate(dept.id, dept.name)
                              }
                            >
                              Deactivate
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500">
              Showing {departments.length} departments
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

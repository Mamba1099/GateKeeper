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
import { Building2, Loader2 } from "lucide-react";
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

  if (!user || (user.role !== "HR")) {
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

      {/* Stats Summary – glass cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {departments.length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Active
            </p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {departments.filter((d) => d.is_active).length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Employees
            </p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {departments.reduce((acc, d) => acc + (d._count?.users || 0), 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Department Table – glass card */}
      <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl overflow-hidden">
        <CardContent className="p-0 sm:p-6">
          <div className="rounded-lg border border-gray-200/60 overflow-x-auto bg-white/40 backdrop-blur-sm">
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
                      className="hover:bg-white/60 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-linear-to-br from-blue-100 to-blue-200 flex items-center justify-center shrink-0 border border-white/60">
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
                          className="font-mono text-xs border-gray-200/60 bg-white/60 backdrop-blur-sm"
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
                                ? "bg-emerald-50/80 text-emerald-700 hover:bg-emerald-50"
                                : "bg-gray-100/80 text-gray-600 hover:bg-gray-100"
                            } border-0 backdrop-blur-sm`}
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
                              className="h-7 px-2 text-red-500 hover:text-red-600 hover:bg-red-50/80"
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
              <Button
                variant="outline"
                size="sm"
                className="bg-white/60 backdrop-blur-sm border-gray-200/60"
                onClick={() => refetch()}
              >
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

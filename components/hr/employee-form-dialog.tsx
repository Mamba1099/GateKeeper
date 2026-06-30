"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import {
  useCreateEmployee,
  useUpdateEmployee,
} from "@/hooks/mutations/use-employee";
import { useDepartments } from "@/hooks/queries/use-department-queries";
import { toast } from "sonner";
import { Department } from "@/lib/api/department-api";
import { Employee } from "@/lib/api/employee-api";

const employeeSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    full_name: z.string().min(2, "Full name must be at least 2 characters"),
    position: z.string().optional(),
    department_id: z.string().min(1, "Please select a department"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .optional(),
    confirm_password: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.password || data.confirm_password) {
        return data.password === data.confirm_password;
      }
      return true;
    },
    {
      message: "Passwords do not match",
      path: ["confirm_password"],
    },
  );

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeFormDialogProps {
  mode: "create" | "edit";
  employee?: Employee;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EmployeeFormDialog({
  mode,
  employee,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: EmployeeFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const { data: departmentsData, isLoading: departmentsLoading } =
    useDepartments();

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = controlledOnOpenChange || setInternalOpen;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      email: "",
      full_name: "",
      position: "",
      department_id: "",
      password: "",
      confirm_password: "",
    },
  });

  const departments: Department[] = departmentsData?.data || [];

  useEffect(() => {
    if (mode === "edit" && employee) {
      reset({
        email: employee.email,
        full_name: employee.full_name,
        position: employee.position || "",
        department_id: employee.department_id,
        password: "",
        confirm_password: "",
      });
    }
  }, [mode, employee, reset]);

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      if (mode === "create") {
        await createEmployee.mutateAsync({
          email: data.email,
          full_name: data.full_name,
          position: data.position || "",
          department_id: data.department_id,
          password: data.password || "",
        });
        toast.success("Employee created successfully!");
      } else if (mode === "edit" && employee) {
        await updateEmployee.mutateAsync({
          id: employee.id,
          data: {
            full_name: data.full_name,
            position: data.position || "",
            department_id: data.department_id,
          },
        });
        toast.success("Employee updated successfully!");
      }
      reset();
      setIsOpen(false);
    } catch {
      toast.error(
        mode === "create"
          ? "Failed to create employee"
          : "Failed to update employee",
      );
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset();
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-125 bg-white p-0 overflow-hidden">
        <div className="p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {mode === "create" ? "Add New Employee" : "Edit Employee"}
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              {mode === "create"
                ? "Fill in the details below to add a new employee to the system."
                : "Update the employee's information below."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="John Doe"
                {...register("full_name")}
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
              />
              {errors.full_name && (
                <p className="text-sm text-red-500">
                  {errors.full_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Email Address <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                placeholder="john.doe@company.com"
                {...register("email")}
                disabled={mode === "edit"}
                className={`border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white ${
                  mode === "edit" ? "opacity-60 cursor-not-allowed" : ""
                }`}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
              {mode === "edit" && (
                <p className="text-xs text-gray-400">Email cannot be changed</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Position
              </label>
              <Input
                placeholder="Senior Developer"
                {...register("position")}
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
              />
              {errors.position && (
                <p className="text-sm text-red-500">
                  {errors.position.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Department <span className="text-red-500">*</span>
              </label>
              <Select
                onValueChange={(value) => setValue("department_id", value)}
                defaultValue={employee?.department_id}
              >
                <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white">
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                  {departmentsLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    </div>
                  ) : departments.length === 0 ? (
                    <div className="py-4 text-center text-sm text-gray-500">
                      No departments found
                    </div>
                  ) : (
                    departments.map((dept) => (
                      <SelectItem
                        key={dept.id}
                        value={dept.id}
                        className="hover:bg-gray-50"
                      >
                        {dept.name} ({dept.code})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.department_id && (
                <p className="text-sm text-red-500">
                  {errors.department_id.message}
                </p>
              )}
            </div>

            {/* Password fields - only for create mode */}
            {mode === "create" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter a strong password"
                    {...register("password")}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="password"
                    placeholder="Confirm password"
                    {...register("confirm_password")}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
                  />
                  {errors.confirm_password && (
                    <p className="text-sm text-red-500">
                      {errors.confirm_password.message}
                    </p>
                  )}
                </div>
              </>
            )}

            <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createEmployee.isPending || updateEmployee.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
              >
                {createEmployee.isPending || updateEmployee.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === "create" ? "Creating..." : "Updating..."}
                  </>
                ) : mode === "create" ? (
                  "Create Employee"
                ) : (
                  "Update Employee"
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

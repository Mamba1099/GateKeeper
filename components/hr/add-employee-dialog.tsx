"use client";

import { useState } from "react";
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
import { Plus, Loader2 } from "lucide-react";
import { useCreateEmployee } from "@/hooks/mutations/use-employee";
import { useDepartments } from "@/hooks/queries/use-department-queries";
import { toast } from "sonner";
import { Department } from "@/lib/api/department-api";

const employeeSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  position: z.string().optional(),
  department_id: z.string().min(1, "Please select a department"),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

export function AddEmployeeDialog() {
  const [open, setOpen] = useState(false);
  const createEmployee = useCreateEmployee();
  const { data: departmentsData, isLoading: departmentsLoading } =
    useDepartments();

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
    },
  });

  const departments: Department[] = departmentsData?.data || [];

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      await createEmployee.mutateAsync({
        email: data.email,
        full_name: data.full_name,
        position: data.position || "",
        department_id: data.department_id,
      });
      reset();
      setOpen(false);
      toast.success("Employee created successfully!");
    } catch {
      toast.error("Failed to create employee");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors">
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-125 bg-white p-0 overflow-hidden">
        <div className="p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Add New Employee
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Fill in the details below to add a new employee to the system.
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
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
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

            <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createEmployee.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
              >
                {createEmployee.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Employee"
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { ProfileForm } from "@/components/dashboard/employee/profile-form";
import { useEmployeeProfile } from "@/hooks/queries/use-employee-queries";

export default function EmployeeProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { data, isLoading: profileLoading } = useEmployeeProfile();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
  }, [user, authLoading, router]);

  if (authLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const profile = data?.data || {
    full_name: user.name || "",
    email: user.email || "",
    position: "",
    department_name: user.departmentName || "",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          Profile
        </h2>
        <p className="text-gray-500 mt-1">Manage your personal information</p>
      </div>

      <ProfileForm profile={profile} />
    </div>
  );
}

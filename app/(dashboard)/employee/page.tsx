"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  useDashboardStats,
  useTodayStatus,
  useAttendanceTrend,
  useArrivalPattern,
  useHoursWorked,
  useComparison,
} from "@/hooks/queries/use-employee-dashboard";
import {
  StatsCards,
  TodayStatusCard,
  AttendanceTrendChart,
  ArrivalDepartureChart,
  HoursWorkedChart,
  PerformanceComparisonChart,
} from "@/components/dashboard/employee";

export default function EmployeeDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const { data: statsData, isLoading: statsLoading } = useDashboardStats();
  const { data: statusData, isLoading: statusLoading } = useTodayStatus();
  const { data: trendData, isLoading: trendLoading } = useAttendanceTrend();
  const { data: arrivalData, isLoading: arrivalLoading } = useArrivalPattern();
  const { data: hoursData, isLoading: hoursLoading } = useHoursWorked();
  const { data: comparisonData, isLoading: comparisonLoading } =
    useComparison();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isLoading =
    statsLoading ||
    statusLoading ||
    trendLoading ||
    arrivalLoading ||
    hoursLoading ||
    comparisonLoading;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          Welcome back, {user?.name}!
        </h2>
        <p className="text-gray-500 mt-1">{user?.departmentName} Department</p>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={statsData?.data} isLoading={isLoading} />

      {/* Today's Status */}
      <TodayStatusCard status={statusData?.data} isLoading={isLoading} />

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceTrendChart
          data={trendData?.data?.attendance || []}
          departmentAvg={trendData?.data?.department_avg}
          isLoading={isLoading}
        />
        <ArrivalDepartureChart
          data={arrivalData?.data || []}
          isLoading={isLoading}
        />
      </div>

      {/* Secondary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HoursWorkedChart data={hoursData?.data || []} isLoading={isLoading} />
        <PerformanceComparisonChart
          data={comparisonData?.data || []}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

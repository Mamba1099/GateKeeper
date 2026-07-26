"use client";

import { useAuth } from "@/hooks/use-auth";
import { useDashboardQuery } from "@/hooks/queries/use-dashboard-queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Building2,
  Calendar,
  TrendingUp,
  Clock,
  AlertTriangle,
  Award,
  Loader2,
} from "lucide-react";
import { DailyAttendanceChart } from "@/components/hr/daily-attendance-chart";
import { MonthlyRateChart } from "@/components/hr/monthly-rate-chart";
import { HoursDistributionChart } from "@/components/hr/hours-distribution-chart";

export default function HRDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { data, isLoading, isError, error, refetch } = useDashboardQuery();

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
          <p className="text-red-600">Error loading dashboard</p>
          <p className="text-sm text-gray-500">{(error as Error).message}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">HR Dashboard</h2>
        <p className="text-gray-500">Welcome back, {user?.name}!</p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Employees
            </CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {data.employees.total}
            </div>
            <p className="text-xs text-gray-500">
              {data.employees.active} active, {data.employees.inactive} inactive
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Departments
            </CardTitle>
            <Building2 className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {data.departments.total}
            </div>
            <p className="text-xs text-gray-500">
              {data.departments.active} active
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Today&apos;s Attendance
            </CardTitle>
            <Calendar className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {data.today.attendanceRate}%
            </div>
            <p className="text-xs text-gray-500">
              {data.today.checkedIn}/{data.employees.active} checked in
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Monthly Avg
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {data.monthly.avgAttendanceRate}%
            </div>
            <p className="text-xs text-gray-500">Attendance rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats + Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Attendance Details */}
        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">
              Today&apos;s Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-500">On Time</p>
              <p className="text-xl font-bold text-emerald-600">
                {data.today.onTime}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Late</p>
              <p className="text-xl font-bold text-red-600">
                {data.today.late}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Avg Arrival</p>
              <p className="text-xl font-bold text-gray-900">
                {data.today.avgArrivalTime}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Punctuality</p>
              <p className="text-xl font-bold text-blue-600">
                {data.monthly.avgPunctuality}%
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Performance Highlights */}
        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Performance</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50">
              <Award className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Top Performers
                </p>
                <p className="text-2xl font-bold text-amber-600">
                  {data.performance.topPerformersCount}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Best Streak</p>
                <p className="text-2xl font-bold text-blue-600">
                  {data.performance.bestStreak} days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-gray-900">
              Recent Late Arrivals
            </CardTitle>
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            {data.recentLate.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">
                No late arrivals today 🎉
              </p>
            ) : (
              <ul className="space-y-2">
                {data.recentLate.map((item, idx) => (
                  <li key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.employeeName}</span>
                    <span className="text-red-600 font-medium">
                      {item.lateMinutes} min late
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-gray-900">
              Early Departures
            </CardTitle>
            <Clock className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            {data.recentEarlyDepartures.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">
                No early departures today
              </p>
            ) : (
              <ul className="space-y-2">
                {data.recentEarlyDepartures.map((item, idx) => (
                  <li key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.employeeName}</span>
                    <span className="text-purple-600 font-medium">
                      {item.earlyMinutes} min early
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl p-4">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-lg text-gray-900">
              Daily Attendance Trend (14 days)
            </CardTitle>
          </CardHeader>
          <DailyAttendanceChart data={data.dailyTrend} />
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl p-4">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-lg text-gray-900">
              Monthly Rate (6 months)
            </CardTitle>
          </CardHeader>
          <MonthlyRateChart data={data.monthlyRates} />
        </Card>
      </div>

      <div className="mt-4">
        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl p-4">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-lg text-gray-900">
              Hours Worked Distribution (30 days)
            </CardTitle>
          </CardHeader>
          <HoursDistributionChart data={data.hoursDistribution} />
        </Card>
      </div>
    </div>
  );
}

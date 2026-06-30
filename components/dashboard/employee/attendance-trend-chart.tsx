"use client";

import { useState } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DataPoint {
  date: string;
  day: number;
  dayName: string;
  status: string;
  hours: number;
  isLate: boolean;
  hasRecord: boolean;
}

interface AttendanceTrendChartProps {
  data: DataPoint[];
  isLoading?: boolean;
}

export function AttendanceTrendChart({
  data,
  isLoading,
}: AttendanceTrendChartProps) {
  const [period, setPeriod] = useState<"week" | "month">("month");

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="animate-pulse h-75 bg-gray-200 rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Monthly Attendance
          </CardTitle>
          <CardDescription>No attendance data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-75 flex items-center justify-center text-gray-500">
            No data for this month
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for chart
  const chartData = data.map((d) => ({
    day: `${d.dayName} ${d.day}`,
    hours: d.hours,
    status: d.status,
    isLate: d.isLate,
    hasRecord: d.hasRecord,
    isPresent:
      d.status === "PRESENT" || d.status === "CHECKED_IN" ? d.hours : 0,
    isAbsent: d.status === "ABSENT" ? 1 : 0,
  }));

  const presentDays = data.filter(
    (d) => d.status === "PRESENT" || d.status === "CHECKED_IN",
  ).length;
  const totalDays = data.length;
  const attendanceRate =
    totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Monthly Attendance
          </CardTitle>
          <CardDescription>
            {presentDays} of {totalDays} days present ({attendanceRate}%)
          </CardDescription>
        </div>
        <Tabs
          value={period}
          onValueChange={(v) => setPeriod(v as "week" | "month")}
          className="w-45"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-75 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-gray-200"
              />
              <XAxis
                dataKey="day"
                className="text-xs text-gray-500"
                tick={{ fill: "#6B7280" }}
                interval={1}
              />
              <YAxis
                className="text-xs text-gray-500"
                tick={{ fill: "#6B7280" }}
                domain={[0, 9]}
                tickFormatter={(value) => `${value}h`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "12px",
                }}
                formatter={(value, name) => {
                  if (name === "Hours Worked") return [`${value}h`, name];
                  return [`${value}`, name];
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="isPresent"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.2}
                name="Hours Worked"
                strokeWidth={2}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-emerald-500" />
            <span className="text-gray-600">✅ Present</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <span className="text-gray-600">❌ Absent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="text-gray-600">⚠️ Late</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

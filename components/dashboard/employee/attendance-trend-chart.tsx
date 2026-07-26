/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface MonthlyDataPoint {
  month: string;
  attendance: number;
  punctuality: number;
}

interface AttendanceTrendChartProps {
  data: MonthlyDataPoint[];
  departmentAvg?: number;
  isLoading?: boolean;
}

export function AttendanceTrendChart({
  data,
  departmentAvg,
  isLoading,
}: AttendanceTrendChartProps) {
  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl">
        <CardContent className="p-6">
          <div className="animate-pulse h-72 bg-gray-200 rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Monthly Attendance Trend
          </CardTitle>
          <CardDescription>No attendance data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72 flex items-center justify-center text-gray-500">
            No data for this period
          </div>
        </CardContent>
      </Card>
    );
  }

  const latestMonth = data[data.length - 1];
  const overallAttendance =
    data.length > 0
      ? Math.round(data.reduce((sum, d) => sum + d.attendance, 0) / data.length)
      : 0;

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Monthly Attendance Trend
          </CardTitle>
          <CardDescription>
            {data.length} months • Avg: {overallAttendance}%
            {departmentAvg !== undefined && departmentAvg !== null && (
              <span className="ml-2 text-blue-600">
                | Dept Avg: {departmentAvg}%
              </span>
            )}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient
                  id="colorAttendance"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient
                  id="colorPunctuality"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6B7280" }} />
              <YAxis
                tick={{ fontSize: 12, fill: "#6B7280" }}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(255,255,255,0.9)",
                  border: "1px solid rgba(0,0,0,0.1)",
                  borderRadius: "8px",
                  backdropFilter: "blur(4px)",
                }}
                formatter={(value, name) => [
                  `${value}%`,
                  name === "attendance" ? "Attendance" : "Punctuality",
                ]}
              />
              <Legend />
              {departmentAvg !== undefined && departmentAvg !== null && (
                <ReferenceLine
                  y={departmentAvg}
                  stroke="#3B82F6"
                  strokeDasharray="5 5"
                  strokeWidth={1.5}
                  label={{
                    value: `Dept Avg: ${departmentAvg}%`,
                    position: "insideTopRight",
                    fill: "#3B82F6",
                    fontSize: 11,
                  }}
                />
              )}
              <Area
                type="monotone"
                dataKey="attendance"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorAttendance)"
                strokeWidth={2}
                name="Attendance %"
              />
              <Area
                type="monotone"
                dataKey="punctuality"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorPunctuality)"
                strokeWidth={2}
                name="Punctuality %"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <span className="text-gray-600">Attendance Rate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-emerald-500" />
            <span className="text-gray-600">Punctuality Rate</span>
          </div>
          {departmentAvg !== undefined && departmentAvg !== null && (
            <div className="flex items-center gap-1.5">
              <div className="h-0.5 w-6 bg-blue-500 border-t border-dashed" />
              <span className="text-gray-600">Department Average</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

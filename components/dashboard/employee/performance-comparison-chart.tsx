"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DataPoint {
  month: string;
  you: number;
  department: number;
}

interface PerformanceComparisonChartProps {
  data: DataPoint[];
  isLoading?: boolean;
}

export function PerformanceComparisonChart({
  data,
  isLoading,
}: PerformanceComparisonChartProps) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="animate-pulse h-62.5 bg-gray-200 rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            You vs Department Average
          </CardTitle>
          <CardDescription>Monthly comparison</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-62.5 flex items-center justify-center text-gray-500">
            No comparison data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const latest = data[data.length - 1];
  const isAboveAvg = latest && latest.you > latest.department;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              You vs Department Average
            </CardTitle>
            <CardDescription>Monthly comparison</CardDescription>
          </div>
          {latest && (
            <Badge
              className={
                isAboveAvg
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-yellow-100 text-yellow-700"
              }
            >
              {isAboveAvg ? "✅ Above Average" : "📈 Below Average"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-62.5 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-gray-200"
              />
              <XAxis
                dataKey="month"
                className="text-xs text-gray-500"
                tick={{ fill: "#6B7280" }}
              />
              <YAxis
                className="text-xs text-gray-500"
                tick={{ fill: "#6B7280" }}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "12px",
                }}
                formatter={(value) => [`${value}%`, ""]}
              />
              <Legend />
              <Bar
                dataKey="you"
                fill="#2563EB"
                radius={[4, 4, 0, 0]}
                name="You"
                barSize={30}
              />
              <Bar
                dataKey="department"
                fill="#94A3B8"
                radius={[4, 4, 0, 0]}
                name="Dept Average"
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

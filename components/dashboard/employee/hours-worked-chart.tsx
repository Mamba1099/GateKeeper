"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp } from "lucide-react";

interface DataPoint {
  day: number;
  hours: number;
  date: string;
}

interface HoursWorkedChartProps {
  data: DataPoint[];
  isLoading?: boolean;
}

export function HoursWorkedChart({ data, isLoading }: HoursWorkedChartProps) {
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
            Hours Worked
          </CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-62.5 flex items-center justify-center text-gray-500">
            No hours data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const avg = data.reduce((sum, d) => sum + d.hours, 0) / (data.length || 1);
  const total = data.reduce((sum, d) => sum + d.hours, 0);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Hours Worked
            </CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              Total: {total.toFixed(1)}h
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3" />
              Avg: {avg.toFixed(1)}h/day
            </Badge>
          </div>
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
                dataKey="day"
                className="text-xs text-gray-500"
                tick={{ fill: "#6B7280" }}
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
                formatter={(value) => [`${value} hours`, "Hours Worked"]}
                labelFormatter={(label) => `Day ${label}`}
              />
              <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      entry.hours >= 7
                        ? "#10B981"
                        : entry.hours >= 5
                          ? "#F59E0B"
                          : "#EF4444"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-emerald-500" />
            <span className="text-gray-600">≥ 7h (Good)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <span className="text-gray-600">5-7h (Fair)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span className="text-gray-600">{"<"}5h (Poor)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

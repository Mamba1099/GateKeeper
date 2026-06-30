"use client";

import {
  LineChart,
  Line,
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
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface DataPoint {
  day: number;
  arrival: number;
  departure: number;
  date: string;
}

interface ArrivalDepartureChartProps {
  data: DataPoint[];
  isLoading?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-gray-900">Day {label}</p>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}:{" "}
            {entry.value !== undefined && entry.value > 0 ? "+" : ""}
            {entry.value !== undefined ? Math.round(entry.value) : 0} min
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function ArrivalDepartureChart({
  data,
  isLoading,
}: ArrivalDepartureChartProps) {
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
            Arrival & Departure Pattern
          </CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-70 flex items-center justify-center text-gray-500">
            No arrival data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const avgArrival =
    data.length > 0
      ? data.reduce((sum, d) => sum + d.arrival, 0) / data.length
      : 0;
  const avgDeparture =
    data.length > 0
      ? data.reduce((sum, d) => sum + d.departure, 0) / data.length
      : 0;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Arrival & Departure Pattern
            </CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              Avg Arrival:{" "}
              {avgArrival > 0
                ? `+${Math.round(avgArrival)}`
                : Math.round(avgArrival)}{" "}
              min
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              Avg Departure:{" "}
              {avgDeparture > 0
                ? `+${Math.round(avgDeparture)}`
                : Math.round(avgDeparture)}{" "}
              min
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-70 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
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
                label={{ value: "Day", position: "insideBottom", offset: -5 }}
              />
              <YAxis
                className="text-xs text-gray-500"
                tick={{ fill: "#6B7280" }}
                label={{ value: "Minutes", angle: -90, position: "insideLeft" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <ReferenceLine
                y={0}
                stroke="#94A3B8"
                strokeDasharray="5 5"
                label={{
                  value: "Standard Time",
                  position: "right",
                  fill: "#94A3B8",
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="arrival"
                stroke="#2563EB"
                strokeWidth={2}
                dot={{ fill: "#2563EB", strokeWidth: 2, r: 3 }}
                name="Arrival (min)"
              />
              <Line
                type="monotone"
                dataKey="departure"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 3 }}
                name="Departure (min)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 mt-4 text-sm text-gray-500">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-blue-600" />
            <span>Arrival (8:00 AM)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-purple-500" />
            <span>Departure (3:00 PM)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-0.5 w-6 bg-gray-400 border-t border-dashed" />
            <span>Standard Time</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

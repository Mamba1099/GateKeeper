"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Props {
  data: { month: string; attendanceRate: number; punctualityRate: number }[];
}

export function MonthlyRateChart({ data }: Props) {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPunct" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6b7280" }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#6b7280" }} />
          <Tooltip
            contentStyle={{
              background: "rgba(255,255,255,0.9)",
              border: "1px solid rgba(0,0,0,0.1)",
              borderRadius: "8px",
              backdropFilter: "blur(4px)",
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="attendanceRate"
            stroke="#3b82f6"
            fillOpacity={1}
            fill="url(#colorAtt)"
            strokeWidth={2}
            name="Attendance %"
          />
          <Area
            type="monotone"
            dataKey="punctualityRate"
            stroke="#8b5cf6"
            fillOpacity={1}
            fill="url(#colorPunct)"
            strokeWidth={2}
            name="Punctuality %"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

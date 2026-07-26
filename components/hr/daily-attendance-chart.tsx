"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Props {
  data: { date: string; checkIns: number; late: number }[];
}

export function DailyAttendanceChart({ data }: Props) {
  const formatted = data.map((d) => ({
    ...d,
    day: new Date(d.date).getDate().toString(),
  }));

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={formatted}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
          <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#6b7280" }} />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: "#6b7280" }}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(255,255,255,0.9)",
              border: "1px solid rgba(0,0,0,0.1)",
              borderRadius: "8px",
              backdropFilter: "blur(4px)",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="checkIns"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: "#3b82f6", r: 3 }}
            activeDot={{ r: 5 }}
            name="Check‑ins"
          />
          <Line
            type="monotone"
            dataKey="late"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ fill: "#ef4444", r: 3 }}
            name="Late"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

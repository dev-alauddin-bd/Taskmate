"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "#ef4444",
  MEDIUM: "#f59e0b",
  LOW: "#22c55e",
  NONE: "#94a3b8",
};

interface MemberTaskPieChartProps {
  data: Array<{ priority: string; _count: { _all: number } }>;
}

export default function MemberTaskPieChart({
  data,
}: MemberTaskPieChartProps) {
  const chartData = data.map((item) => ({
    name: item.priority || "NONE",
    value: item._count._all,
    color:
      PRIORITY_COLORS[item.priority || "NONE"] ||
      PRIORITY_COLORS.NONE,
  }));

  if (!chartData.length) {
    return (
      <div className="flex h-[300px] items-center justify-center text-gray-400">
        No tasks to display
      </div>
    );
  }

  return (
  <div className="glass-panel p-6 rounded-2xl border border-[var(--border)]/50 flex flex-col gap-5">
      
       <h3 className="text-lg font-bold text-[var(--foreground)]">
        Tasks by Priority
      </h3>
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            label={({ name, percent }) =>
              `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
            }
          >
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>

          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              border: "1px solid #334155",
              color: "#fff",
            }}
            formatter={(value) => {
              const num = typeof value === "number" ? value : Number(value) || 0;
              return [
                `${num} task${num !== 1 ? "s" : ""}`,
                "Count",
              ];
            }}
          />

          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
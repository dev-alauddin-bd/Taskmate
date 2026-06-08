"use client";

import { useState, useEffect } from "react";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { PieChart } from "lucide-react";

ChartJS.register(ArcElement, Tooltip);

interface Props {
  data: { status: string; _count: { _all: number } }[];
}

export default function TaskStatusChart({ data }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const series = data.map((d) => d._count._all);
  const labels = data.map((d) => d.status);

  const total = series.reduce((a, b) => a + b, 0);

  const colorMap: Record<string, string> = {
    TODO: "rgba(99, 102, 241, 0.9)",        // indigo
    IN_PROGRESS: "rgba(245, 158, 11, 0.9)", // amber
    COMPLETED: "rgba(34, 197, 94, 0.9)",    // green
  };

  const colors = labels.map(
    (l) => colorMap[l.toUpperCase()] || "rgba(156, 163, 175, 0.8)"
  );

  const chartData = {
    labels,
    datasets: [
      {
        data: series,
        backgroundColor: colors,
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    cutout: "72%",
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const value = ctx.parsed;
            const percent = total
              ? ((value / total) * 100).toFixed(1)
              : 0;
            return `${value} tasks (${percent}%)`;
          },
        },
      },
    },
  };

  const legendItems = labels.map((label, i) => ({
    label: label.replaceAll("_", " "),
    value: series[i],
    color: colors[i],
  }));

  return (
    <div className="glass-panel border border-[var(--border)] rounded-xl shadow-sm p-5 flex flex-col h-full min-h-[360px]">

      {/* HEADER */}
      <div className="flex items-center gap-2 mb-4">
        <PieChart className="w-5 h-5 text-[var(--primary)]" />
        <h3 className="text-base font-semibold text-[var(--foreground)]">
          Task Status Distribution
        </h3>
      </div>

      {/* CHART */}
      <div className="relative flex-1 flex items-center justify-center">

        {!mounted ? (
          <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        ) : total > 0 ? (
          <>
            {/* CENTER TEXT */}
            <div className="absolute text-center">
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {total}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Total Tasks
              </p>
            </div>

            <div className="w-[220px] h-[220px]">
              <Doughnut data={chartData} options={options} />
            </div>
          </>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">
            No task status data available
          </p>
        )}
      </div>

      {/* LEGEND */}
      <div className="mt-4 space-y-2">
        {legendItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[var(--text-muted)]">
                {item.label}
              </span>
            </div>

            <span className="font-medium text-[var(--foreground)]">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { PieChart } from "lucide-react";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  data: { status: string; _count: { _all: number } }[]
}

export default function TaskStatusChart({ data }: Props) {
  const [isMounted, setIsMounted] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Ensure DOM is ready before rendering chart
  useEffect(() => {
    if (isMounted) {
      const timer = setTimeout(() => setReady(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isMounted]);

  const series = data.map(d => d._count._all)
  const labels = data.map(d => d.status)

  const colorMap: Record<string, string> = {
    TODO: "var(--primary)",
    IN_PROGRESS: "var(--warning)",
    COMPLETED: "var(--success)",
  };
  const colors = labels.map(l => colorMap[l.toUpperCase()] || "#a1a1aa");

  // Chart.js data and options
  const chartJsData = {
    labels: labels.map(l => l.replace("_", " ")),
    datasets: [
      {
        data: series,
        backgroundColor: colors,
        borderColor: "var(--surface)",
        borderWidth: 2,
      },
    ],
  };

  const chartJsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: "var(--foreground)",
          font: { size: 12, weight: 500 as const },
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "var(--surface)",
        titleColor: "var(--foreground)",
        bodyColor: "var(--foreground)",
        callbacks: {
          label: (ctx: any) => {
            const total = series.reduce((a, b) => a + b, 0);
            const percent = total ? ((ctx.parsed / total) * 100).toFixed(1) : 0;
            return `${ctx.parsed} (${percent}%)`;
          },
        },
      },
    },
    cutout: "65%",
  };

  return (
    <div className="glass-panel p-6 rounded-2xl animate-fade-in flex flex-col justify-between border border-[var(--border)]/50 h-full min-h-[360px]">
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <PieChart className="w-5 h-5 text-[var(--primary)]" />
        <h3 className="text-base font-bold text-[var(--foreground)]">Task Status Distribution</h3>
      </div>
      <div className="flex-1 flex items-center justify-center">
        {!isMounted || !ready ? (
          <div className="flex items-center justify-center h-[260px] w-full">
            <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : series.length > 0 ? (
          <Doughnut
            data={chartJsData}
            options={chartJsOptions}
          />
        ) : (
          <p className="text-sm text-[var(--text-muted)]">No task status data available</p>
        )}
      </div>
    </div>
  );
}

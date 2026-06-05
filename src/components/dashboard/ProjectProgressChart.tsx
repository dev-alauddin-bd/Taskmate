"use client";

import { useEffect, useMemo, useState } from "react";
// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { TrendingUp } from "lucide-react";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface Props {
  data: {
    name: string;
    progress: number;
    updatedAt: Date | string;
  }[];
}

export default function ProjectProgressChart({ data }: Props) {
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Ensure the DOM node is ready before rendering the chart
  useEffect(() => {
    if (mounted) {
      // Small timeout to allow the container to be attached
      const timer = setTimeout(() => setReady(true), 100);
      return () => clearTimeout(timer);
    }
  }, [mounted]);

  const chartData = useMemo(() => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const monthlyProgress = new Array(12).fill(0);
    const monthlyCount = new Array(12).fill(0);

    // Guard against null or undefined data
    if (!Array.isArray(data)) {
      return { months, progress: new Array(12).fill(0) };
    }

    data.forEach((project) => {
      const date = new Date(project.updatedAt);
      const monthIndex = date instanceof Date && !isNaN(date.getTime()) ? date.getMonth() : null;
      if (monthIndex === null) {
        return; // skip invalid date
      }
      const progressVal = typeof project.progress === 'number' ? project.progress : 0;
      monthlyProgress[monthIndex] += progressVal;
      monthlyCount[monthIndex] += 1;
    });

    const averagedProgress = monthlyProgress.map((total, index) =>
      monthlyCount[index] > 0
        ? Math.round(total / monthlyCount[index])
        : 0
    );

    return {
      months,
      progress: averagedProgress,
    };
  }, [data]);

  // Chart.js data and options
  const chartJsData = {
    labels: chartData.months,
    datasets: [
      {
        label: "Progress",
        data: chartData.progress,
        fill: true,
        backgroundColor: "rgba(0, 123, 255, 0.35)", // fallback primary color with opacity
        borderColor: "var(--chart-line)", // theme‑aware line color
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const chartJsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "var(--foreground)", font: { size: 11 } },
      },
      y: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          color: "var(--foreground)",
          font: { size: 11 },
          callback: (value: any) => `${value}%`,
        },
        grid: { color: "var(--border)", borderDash: [4] },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: "var(--surface)",
        titleColor: "var(--foreground)",
        bodyColor: "var(--foreground)",
        callbacks: {
          label: (ctx: any) => `${ctx.parsed.y}%`,
        },
      },
    },
  };

  return (
    <div className="glass-panel p-6 rounded-2xl animate-fade-in flex flex-col border border-[var(--border)]/50 h-full min-h-[360px]">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-[var(--primary)]" />
        <h3 className="text-base font-bold text-[var(--foreground)]">
          Project Progress
        </h3>
      </div>

      <div className="flex-1 flex items-center justify-center w-full">
        {/* Render spinner until component is mounted and chart data is ready */}
        {!mounted || !ready || !chartData || chartData.progress.length === 0 ? (
          <div className="flex items-center justify-center h-[260px] w-full">
            <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <Line
            data={chartJsData}
            options={chartJsOptions}
            width="100%"
            height={260}
          />
        )}
      </div>

    </div>
  );
}
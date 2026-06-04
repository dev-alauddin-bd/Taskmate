"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { BarChart3 } from "lucide-react";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Props {
  data: { action: string; count: number }[];
}

export default function ActivityChart({ data }: Props) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const series = data.map(d => d.count);
  const labels = data.map(d =>
    d.action.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
  );

  // Map actions directly to theme colors for visual coherence
  const colorMap: Record<string, string> = {
    TASK_CREATED: "var(--primary)",
    TASK_COMPLETED: "var(--success)",
    TASK_UPDATED: "var(--warning)",
    TASK_DELETED: "var(--danger)",
    PROJECT_CREATED: "#8b5cf6",
    PROJECT_UPDATED: "#4f46e5",
    PROJECT_DELETED: "#f43f5e",
  };
  const colors = data.map(d => colorMap[d.action.toUpperCase()] || "var(--text-muted)");

  const options: ApexOptions = isMounted
    ? {
        chart: {
          type: "donut",
          foreColor: "var(--text-muted)",
          fontFamily: "Inter, sans-serif",
          toolbar: { show: false },
        },
        stroke: {
          show: true,
          colors: ["var(--surface)"],
          width: 2,
        },
        colors,
        legend: {
          position: "bottom",
          fontSize: "12px",
          fontWeight: 500,
          labels: {
            colors: "var(--foreground)",
          },
          markers: {
            shape: "circle",
            size: 8,
          },
        },
        plotOptions: {
          pie: {
            donut: {
              size: "65%",
              labels: {
                show: true,
                total: {
                  show: true,
                  label: "Actions",
                  color: "var(--text-muted)",
                  fontSize: "12px",
                  fontWeight: 500,
                  formatter: () => String(series.reduce((a, b) => a + b, 0)),
                },
                value: {
                  show: true,
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "var(--foreground)",
                },
              },
            },
          },
        },
        tooltip: { theme: "dark" },
        labels,
      }
    : {};

  return (
    <div className="glass-panel p-6 rounded-2xl animate-fade-in flex flex-col justify-between border border-[var(--border)]/50 h-full min-h-[360px] w-full">
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <BarChart3 className="w-5 h-5 text-[var(--primary)]" />
        <h3 className="text-base font-bold text-[var(--foreground)]">Activity Distribution</h3>
      </div>
      <div className="flex-1 flex items-center justify-center w-full">
        {!isMounted ? (
          <div className="flex items-center justify-center h-[260px] w-full">
            <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : series.length > 0 ? (
          <Chart
            key={`activity-chart-${series.length}`}
            options={options}
            series={series}
            type="donut"
            width="100%"
            height={260}
          />
        ) : (
          <p className="text-sm text-[var(--text-muted)]">No activity data available</p>
        )}
      </div>
    </div>
  );
}

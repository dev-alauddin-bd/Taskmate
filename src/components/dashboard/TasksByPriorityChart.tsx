"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { AlertCircle } from "lucide-react";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Props {
  data: { priority: string; _count: { _all: number } }[];
}

export default function TasksByPriorityChart({ data }: Props) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const series = data.map(d => d._count._all);
  const labels = data.map(d => d.priority);

  const colorMap: Record<string, string> = {
    HIGH: "var(--danger)",
    MEDIUM: "var(--warning)",
    LOW: "var(--success)",
  };
  const colors = labels.map(l => colorMap[l.toUpperCase()] || "var(--primary)");

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
          labels: { colors: "var(--foreground)" },
          markers: { shape: "circle", size: 8 },
        },
        plotOptions: {
          pie: {
            donut: {
              size: "65%",
              labels: {
                show: true,
                total: {
                  show: true,
                  label: "Tasks",
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
    <div className="glass-panel p-6 rounded-2xl animate-fade-in flex flex-col justify-between border border-[var(--border)]/50 h-full min-h-[360px]">
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <AlertCircle className="w-5 h-5 text-[var(--primary)]" />
        <h3 className="text-base font-bold text-[var(--foreground)]">Tasks by Priority</h3>
      </div>
      <div className="flex-1 flex items-center justify-center w-full">
        {!isMounted ? (
          <div className="flex items-center justify-center h-[260px] w-full">
            <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : series.length > 0 ? (
          <Chart
            key={`priority-chart-${series.length}`}
            options={options}
            series={series}
            type="donut"
            width="100%"
            height={260}
          />
        ) : (
          <p className="text-sm text-[var(--text-muted)]">No tasks available</p>
        )}
      </div>
    </div>
  );
}

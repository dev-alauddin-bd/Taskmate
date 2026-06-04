"use client";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Props {
  data: { priority: string; _count: { _all: number } }[];
}

export default function TasksByPriorityChart({ data }: Props) {
  const series = data.map(d => d._count._all);
  const labels = data.map(d => d.priority);
  const options: ApexOptions = {
    chart: { type: "donut", foreColor: "var(--text-muted)" },
    colors: ["#ef4444", "#f59e0b", "#10b981"],
    legend: { position: "bottom" },
    tooltip: { theme: "dark" },
    labels,
  };
  return (
    <div className="glass-panel p-4 rounded-xl animate-fade-in">
      <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">Tasks by Priority</h3>
      <Chart options={options} series={series} type="donut" width="100%" />
    </div>
  );
}

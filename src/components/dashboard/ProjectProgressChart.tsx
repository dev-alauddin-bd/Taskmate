"use client"
import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { ApexOptions } from "apexcharts"
import { TrendingUp } from "lucide-react"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface Props {
  data: { name: string; progress: number; updatedAt: Date | string }[]
}

export default function ProjectProgressChart({ data }: Props) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const series = data.map(d => d.progress)
  const labels = data.map(d => d.name)

  const options: ApexOptions = isMounted
    ? {
        chart: {
          type: "area",
          foreColor: "var(--text-muted)",
          fontFamily: "Inter, sans-serif",
          toolbar: { show: false },
        },
        stroke: { curve: "smooth", width: 3 },
        colors: ["var(--primary)"],
        fill: {
          type: "gradient",
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.35,
            opacityTo: 0.05,
            stops: [0, 90, 100],
          },
        },
        grid: {
          borderColor: "var(--border)",
          strokeDashArray: 4,
          yaxis: { lines: { show: true } },
          xaxis: { lines: { show: false } },
        },
        xaxis: {
          categories: labels,
          axisBorder: { show: false },
          axisTicks: { show: false },
          labels: {
            style: { colors: "var(--text-muted)", fontSize: "11px" },
          },
        },
        yaxis: {
          min: 0,
          max: 100,
          tickAmount: 4,
          labels: {
            formatter: (v) => `${v}%`,
            style: { colors: "var(--text-muted)", fontSize: "11px" },
          },
        },
        markers: {
          size: 4,
          colors: ["var(--primary)"],
          strokeColors: "var(--surface)",
          strokeWidth: 2,
          hover: { size: 6 },
        },
        tooltip: { theme: "dark" },
      }
    : {};

  return (
    <div className="glass-panel p-6 rounded-2xl animate-fade-in flex flex-col justify-between border border-[var(--border)]/50 h-full min-h-[360px]">
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <TrendingUp className="w-5 h-5 text-[var(--primary)]" />
        <h3 className="text-base font-bold text-[var(--foreground)]">Project Progress</h3>
      </div>
      <div className="flex-1 flex items-center justify-center w-full">
        {!isMounted ? (
          <div className="flex items-center justify-center h-[260px] w-full">
            <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : series.length > 0 ? (
          <Chart
            key={`project-progress-chart-${series.length}`}
            options={options}
            series={[{ name: "Progress", data: series }]}
            type="area"
            width="100%"
            height={260}
          />
        ) : (
          <p className="text-sm text-[var(--text-muted)]">No project progress data available</p>
        )}
      </div>
    </div>
  )
}

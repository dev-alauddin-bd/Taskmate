"use client"
import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { ApexOptions } from "apexcharts"
import { Users } from "lucide-react"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface Props {
  data: { name: string; completedTasks: number }[]
}

export default function TeamProductivityChart({ data }: Props) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const series = data.map(d => d.completedTasks)
  const labels = data.map(d => d.name)

  const options: ApexOptions = isMounted
    ? {
        chart: {
          type: "bar",
          foreColor: "var(--text-muted)",
          fontFamily: "Inter, sans-serif",
          toolbar: { show: false },
        },
        plotOptions: {
          bar: {
            borderRadius: 6,
            columnWidth: "35%",
            distributed: true,
          },
        },
        colors: [
          "var(--primary)",
          "var(--success)",
          "var(--warning)",
          "var(--danger)",
          "#8b5cf6",
        ],
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
          tickAmount: 4,
          labels: {
            formatter: (v) => Math.round(v).toString(),
            style: { colors: "var(--text-muted)", fontSize: "11px" },
          },
        },
        tooltip: { theme: "dark" },
        legend: { show: false },
      }
    : {};

  return (
    <div className="glass-panel p-6 rounded-2xl animate-fade-in flex flex-col justify-between border border-[var(--border)]/50 h-full min-h-[360px]">
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <Users className="w-5 h-5 text-[var(--primary)]" />
        <h3 className="text-base font-bold text-[var(--foreground)]">Team Productivity</h3>
      </div>
      <div className="flex-1 flex items-center justify-center w-full">
        {!isMounted ? (
          <div className="flex items-center justify-center h-[260px] w-full">
            <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : series.length > 0 ? (
          <Chart
            key={`team-productivity-chart-${series.length}`}
            options={options}
            series={[{ name: "Completed Tasks", data: series }]}
            type="bar"
            width="100%"
            height={260}
          />
        ) : (
          <p className="text-sm text-[var(--text-muted)]">No team productivity data available</p>
        )}
      </div>
    </div>
  )
}

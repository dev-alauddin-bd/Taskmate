"use client"
import dynamic from "next/dynamic"
import { ApexOptions } from "apexcharts"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface Props {
  data: { status: string; _count: { _all: number } }[]
}

export default function TaskStatusChart({ data }: Props) {
  const series = data.map(d => d._count._all)
  const labels = data.map(d => d.status)
  const options: ApexOptions = {
    chart: { type: "pie", foreColor: "var(--text-muted)" },
    colors: ["#10b981", "#f59e0b", "#ef4444", "#6366f1"],
    legend: { position: "bottom" },
    tooltip: { theme: "dark" },
    labels,
  }
  return (
    <div className="glass-panel p-4 rounded-xl animate-fade-in">
      <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">Task Status Distribution</h3>
      <Chart options={options} series={series} type="pie" width="100%" />
    </div>
  )
}

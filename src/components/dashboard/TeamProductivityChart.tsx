"use client"
import dynamic from "next/dynamic"
import { ApexOptions } from "apexcharts"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface Props {
  data: { name: string; _count: { assignedTasks: number } }[]
}

export default function TeamProductivityChart({ data }: Props) {
  const series = data.map(d => d._count.assignedTasks)
  const labels = data.map(d => d.name)
  const options: ApexOptions = {
    chart: { type: "bar", foreColor: "var(--text-muted)" },
    colors: ["#34d399"],
    xaxis: { categories: labels },
    tooltip: { theme: "dark" },
  }
  return (
    <div className="glass-panel p-4 rounded-xl animate-fade-in">
      <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">Team Productivity</h3>
      <Chart options={options} series={[{ name: "Completed", data: series }]} type="bar" height={200} />
    </div>
  )
}

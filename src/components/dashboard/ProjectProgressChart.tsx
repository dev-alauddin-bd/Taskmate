"use client"
import dynamic from "next/dynamic"
import { ApexOptions } from "apexcharts"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface Props {
  data: { name: string; progress: number; updatedAt: string }[]
}

export default function ProjectProgressChart({ data }: Props) {
  const series = data.map(d => d.progress)
  const labels = data.map(d => d.name)
  const options: ApexOptions = {
    chart: { type: "line", foreColor: "var(--text-muted)" },
    stroke: { curve: "smooth" },
    colors: ["#3b82f6"],
    xaxis: { categories: labels },
    tooltip: { theme: "dark" },
  }
  return (
    <div className="glass-panel p-4 rounded-xl animate-fade-in">
      <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">Project Progress</h3>
      <Chart options={options} series={[{ name: "Progress", data: series }]} type="line" height={200} />
    </div>
  )
}

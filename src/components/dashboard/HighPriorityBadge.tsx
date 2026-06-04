"use client"
import dynamic from "next/dynamic"
import { ApexOptions } from "apexcharts"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface Props {
  count: number
}

export default function HighPriorityBadge({ count }: Props) {
  const series = [count]
  const options: ApexOptions = {
    chart: { type: "radialBar", foreColor: "var(--text-muted)" },
    colors: ["#ef4444"],
    plotOptions: {
      radialBar: {
        dataLabels: { name: { show: false }, value: { fontSize: "24px", fontWeight: "bold" } },
        hollow: { size: "70%" },
      },
    },
    labels: ["High Priority"],
    tooltip: { theme: "dark" },
  }
  return (
    <div className="glass-panel p-4 rounded-xl animate-fade-in flex flex-col items-center">
      <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">High Priority Tasks</h3>
      <Chart options={options} series={series} type="radialBar" height={200} />
    </div>
  )
}

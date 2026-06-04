"use client"
import dynamic from "next/dynamic"
import { ApexOptions } from "apexcharts"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface Props {
  data: { id: string; title: string; dueDate: string }[]
}

export default function UpcomingDeadlinesCard({ data }: Props) {
  return (
    <div className="glass-panel p-4 rounded-xl animate-fade-in">
      <h3 className="text-sm font-medium text-[var(--text-muted)] mb-2">Upcoming Deadlines</h3>
      <ul className="space-y-2">
        {data.map(item => (
          <li key={item.id} className="text-xs text-[var(--foreground)]">
            <span className="font-medium">{item.title}</span> – {new Date(item.dueDate).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  )
}

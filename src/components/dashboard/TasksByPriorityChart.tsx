"use client";

import { AlertTriangle } from "lucide-react";

interface Props {
  data: { priority: string; _count: { _all: number } }[];
}

export default function TasksByPriorityChart({ data }: Props) {
  const total = data.reduce((acc, d) => acc + d._count._all, 0);

  const colorMap: Record<string, string> = {
    HIGH: "#ef4444",
    MEDIUM: "#f59e0b",
    LOW: "#22c55e",
  };

  return (
    <div className="glass-panel rounded-xl shadow-sm p-5 flex flex-col h-full min-h-[360px]">

      {/* HEADER */}
      <div className="flex items-center gap-2 mb-5">
        <AlertTriangle className="w-5 h-5 text-[var(--primary)]" />
        <h3 className="text-base font-semibold text-[var(--foreground)]">
          Tasks by Priority
        </h3>
      </div>

      {/* TOTAL */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 mb-5">
        <p className="text-xs text-[var(--text-muted)]">Total Tasks</p>
        <p className="text-2xl font-bold text-[var(--foreground)]">
          {total}
        </p>
      </div>

      {/* PRIORITY LIST */}
      <div className="space-y-4 flex-1">

        {data.map((item) => {
          const count = item._count._all;
          const percent = total ? Math.round((count / total) * 100) : 0;

          const color =
            colorMap[item.priority.toUpperCase()] || "#6366f1";

          return (
            <div
              key={item.priority}
              className="p-3 glass-panel rounded-lg  "
            >

              {/* TOP ROW */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    {item.priority.replace("_", " ")}
                  </span>
                </div>

                <span className="text-sm font-semibold text-[var(--foreground)]">
                  {count} ({percent}%)
                </span>
              </div>

              {/* PROGRESS BAR */}
              <div className="w-full h-2 bg-[var(--border)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${percent}%`,
                    backgroundColor: color,
                  }}
                />
              </div>

            </div>
          );
        })}

      </div>
    </div>
  );
}
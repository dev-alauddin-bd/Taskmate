"use client";

import { Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Props {
  data: {
    id: string;
    title: string;
    dueDate: Date | string;
    status: string;
    priority: string;
  }[];
}

export default function UpcomingDeadlinesCard({ data }: Props) {
  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-[var(--border)]/50">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-[var(--primary)]" />
        <h3 className="text-base font-bold text-[var(--foreground)]">
          Upcoming Deadlines
        </h3>
      </div>

      {data.length > 0 ? (
        <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-1">
          {data.map((item) => {
            const isOverdue = new Date(item.dueDate) < new Date();

            const timeDistance = formatDistanceToNow(
              new Date(item.dueDate),
              { addSuffix: true }
            );

            let priorityBadge =
              "bg-blue-500/10 text-blue-500 border-blue-500/20";

            if (item.priority === "HIGH") {
              priorityBadge =
                "bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20 animate-pulse";
            } else if (item.priority === "MEDIUM") {
              priorityBadge =
                "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20 animate-pulse";
            } else if (item.priority === "LOW") {
              priorityBadge =
                "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20 animate-pulse";
            }

            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[var(--border)]/40 bg-[var(--surface-hover)]/10 hover:bg-[var(--surface-hover)]/30 transition-all"
              >
                {/* LEFT ICON (removed Clock) */}
                <div className="flex items-center justify-center">
                  <Calendar
                    className={`w-5 h-5 ${
                      isOverdue
                        ? "text-[var(--danger)]"
                        : "text-[var(--text-muted)]"
                    }`}
                  />
                </div>

                {/* CENTER CONTENT */}
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-semibold text-[var(--foreground)] truncate">
                    {item.title}
                  </span>

                  <span className="text-xs text-[var(--text-muted)]">
                    {timeDistance}
                  </span>
                </div>

                {/* RIGHT PRIORITY (BLINK) */}
                <div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase ${priorityBadge}`}
                  >
                    {item.priority}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-[var(--text-muted)] gap-2 flex-1">
          <Calendar className="w-8 h-8 text-[var(--text-muted)]/40" />
          <p className="text-sm">No upcoming deadlines</p>
        </div>
      )}
    </div>
  );
}
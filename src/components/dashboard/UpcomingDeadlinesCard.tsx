"use client"
import { Calendar, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Props {
  data: { 
    id: string; 
    title: string; 
    dueDate: Date | string;
    status: string;
    priority: string;
  }[]
}

export default function UpcomingDeadlinesCard({ data }: Props) {
  return (
    <div className="glass-panel p-6 rounded-2xl animate-fade-in flex flex-col h-full border border-[var(--border)]/50">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-[var(--primary)]" />
        <h3 className="text-base font-bold text-[var(--foreground)]">Upcoming Deadlines</h3>
      </div>
      
      {data.length > 0 ? (
        <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-1">
          {data.map(item => {
            const isOverdue = new Date(item.dueDate) < new Date();
            const timeDistance = formatDistanceToNow(new Date(item.dueDate), { addSuffix: true });
            
            // Priority colors
            let priorityBadge = "bg-blue-500/10 text-blue-500 border-blue-500/20";
            if (item.priority === "HIGH") {
              priorityBadge = "bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20 animate-pulse";
            } else if (item.priority === "MEDIUM") {
              priorityBadge = "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20";
            } else if (item.priority === "LOW") {
              priorityBadge = "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20";
            }

            // Status display
            const statusText = item.status.replace("_", " ").toLowerCase();

            return (
              <div 
                key={item.id} 
                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[var(--border)]/40 bg-[var(--surface-hover)]/10 hover:bg-[var(--surface-hover)]/30 hover:border-[var(--border)] transition-all duration-300 group"
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-sm font-bold text-[var(--foreground)] truncate group-hover:text-[var(--primary)] transition-colors">
                    {item.title}
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--text-muted)]">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase ${priorityBadge}`}>
                      {item.priority}
                    </span>
                    <span className="capitalize px-1.5 py-0.5 rounded-md bg-[var(--surface)] border border-[var(--border)] text-[10px] font-medium text-[var(--text-muted)]">
                      {statusText}
                    </span>
                  </div>
                </div>
                
                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                  <span className={`text-xs font-semibold flex items-center gap-1 ${isOverdue ? "text-[var(--danger)] font-bold" : "text-[var(--text-muted)]"}`}>
                    {isOverdue && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                    {timeDistance}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]/70">
                    {new Date(item.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
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


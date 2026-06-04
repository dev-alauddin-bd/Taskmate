"use client"
import { ShieldAlert, ShieldCheck } from "lucide-react";

interface Props {
  count: number
}

export default function HighPriorityBadge({ count }: Props) {
  const hasUrgent = count > 0;

  return (
    <div className={`glass-panel p-6 rounded-2xl animate-fade-in flex flex-col justify-between h-full border transition-all duration-300 ${
      hasUrgent 
        ? "border-[var(--danger)]/30 shadow-[var(--danger)]/5 shadow-md" 
        : "border-[var(--border)]/50"
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-bold text-[var(--foreground)]">Urgent Attention</h3>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            {hasUrgent 
              ? "High-priority tasks that are currently active and require immediate team action."
              : "No urgent high-priority tasks currently active. Your workspaces are in good shape!"
            }
          </p>
        </div>
        <div className={`p-3 rounded-xl shrink-0 ${
          hasUrgent 
            ? "bg-[var(--danger)]/10 text-[var(--danger)] animate-pulse" 
            : "bg-[var(--success)]/10 text-[var(--success)]"
        }`}>
          {hasUrgent ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
        </div>
      </div>

      <div className="mt-6 flex items-baseline gap-2">
        <span className={`text-4xl font-extrabold tracking-tight ${
          hasUrgent ? "text-[var(--danger)]" : "text-[var(--success)]"
        }`}>
          {count}
        </span>
        <span className="text-sm font-semibold text-[var(--text-muted)]">
          {count === 1 ? "high-priority task pending" : "high-priority tasks pending"}
        </span>
      </div>
      
      {hasUrgent && (
        <div className="mt-4 p-3 rounded-xl bg-[var(--danger)]/5 border border-[var(--danger)]/10 text-xs text-[var(--danger)] font-medium text-center">
          Action required: Check task list and allocate resources
        </div>
      )}
    </div>
  );
}


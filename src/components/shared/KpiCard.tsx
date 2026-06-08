import React from "react";

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color?: string;
  badge?: string;
  progress?: number;
  subtitle?: string;
}

export default function KpiCard({
  title,
  value,
  icon,
  color = "var(--primary)",
  badge,
  progress = 0,
  subtitle,
}: KpiCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm hover:shadow-md transition">

      {/* glow effect */}
      <div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-30"
        style={{ backgroundColor: color }}
      />

      {/* top row */}
      <div className="flex items-start justify-between">

        <div
          className="p-3 rounded-xl"
          style={{
            backgroundColor: `${color}15`,
            color,
          }}
        >
          {icon}
        </div>

        {badge && (
          <span
            className="text-xs font-medium px-2 py-1 rounded-full"
            style={{
              backgroundColor: `${color}15`,
              color,
            }}
          >
            {badge}
          </span>
        )}
      </div>

      {/* title */}
      <h3 className="mt-4 text-sm text-[var(--text-muted)]">
        {title}
      </h3>

      {/* value */}
      <p className="text-3xl font-bold mt-1 text-[var(--foreground)]">
        {value}
      </p>

      {/* subtitle */}
      {subtitle && (
        <p className="text-xs text-[var(--text-muted)] mt-1">
          {subtitle}
        </p>
      )}

      {/* progress bar */}
      {progress > 0 && (
        <div className="mt-4 h-2 w-full rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(progress, 100)}%`,
              backgroundColor: color,
            }}
          />
        </div>
      )}
    </div>
  );
}
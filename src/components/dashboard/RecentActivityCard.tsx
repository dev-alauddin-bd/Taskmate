"use client";

import Link from "next/link";
import { Activity, CheckSquare, FolderKanban, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  action: string;
  details: string;
  createdAt: string | Date;
}

interface Props {
  recentActivities: ActivityItem[];
}

export default function RecentActivityCard({ recentActivities }: Props) {
  return (
    <div className="glass-panel rounded-2xl shadow-sm overflow-hidden flex flex-col border border-[var(--border)]/50">
      
      {/* Header */}
      <div className="p-6 border-b border-[var(--border)]/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[var(--primary)]" />
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            Recent Activity
          </h2>
        </div>
        <span className="text-xs text-[var(--text-muted)] font-medium">
          Real-time updates
        </span>
      </div>

      {/* Body */}
      <div className="p-6 flex-1">
        {recentActivities.length > 0 ? (
          <div className="relative pl-6 border-l-2 border-[var(--border)] ml-3 space-y-6">
            {recentActivities.map((activity) => {
              let icon = <CheckSquare className="w-4 h-4" />;
              let iconBg =
                "bg-blue-500/10 text-blue-500 border-blue-500/20";

              if (activity.action.includes("PROJECT")) {
                icon = <FolderKanban className="w-4 h-4" />;
                iconBg =
                  "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20";
              } else if (activity.action.includes("COMPLETED")) {
                icon = <CheckCircle2 className="w-4 h-4" />;
                iconBg =
                  "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20";
              } else if (activity.action.includes("DELETED")) {
                icon = <AlertTriangle className="w-4 h-4" />;
                iconBg =
                  "bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20";
              }

              return (
                <div key={activity.id} className="relative group">
                  
                  {/* Timeline Dot */}
                  <span
                    className={`absolute -left-[38px] top-1 flex items-center justify-center w-8 h-8 rounded-full border bg-[var(--surface)] ${iconBg} transition-transform duration-300 group-hover:scale-110 shadow-sm`}
                  >
                    {icon}
                  </span>

                  {/* Content */}
                  <div className="flex flex-col gap-0.5">
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-sm font-semibold text-[var(--foreground)]">
                        {activity.action
                          .replace(/_/g, " ")
                          .toLowerCase()
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>

                      <span className="text-xs text-[var(--text-muted)] shrink-0">
                        {formatDistanceToNow(new Date(activity.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>

                    <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                      {activity.details}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-[var(--text-muted)] gap-2">
            <Activity className="w-8 h-8 text-[var(--text-muted)]/50" />
            <p className="text-sm">No recent activity found</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--border)]/50 bg-[var(--surface-hover)]/30 text-center">
        <Link
          href="/activity"
          className="text-sm text-[var(--primary)] hover:text-[var(--primary-hover)] font-semibold inline-flex items-center gap-1.5 hover:underline"
        >
          View all activity <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
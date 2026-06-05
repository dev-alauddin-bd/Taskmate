"use client";

import { FolderKanban, CheckSquare, Clock, AlertTriangle } from "lucide-react";

interface Props {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
}

export default function ProjectSummaryCard({
  totalProjects,
  totalTasks,
  completedTasks,
  pendingTasks,
  overdueTasks,
}: Props) {
  return (
    <div className="glass-panel p-6 rounded-2xl border border-[var(--border)]/50 flex flex-col gap-5">

      <h3 className="text-lg font-bold text-[var(--foreground)]">
        Project Summary
      </h3>

      <div className="grid grid-cols-2 gap-4">

        {/* Projects */}
        <div className="p-3 rounded-xl bg-[var(--surface-hover)]/20">
          <div className="flex items-center gap-2 text-[var(--primary)]">
            <FolderKanban className="w-4 h-4" />
            <span className="text-xs font-semibold">Projects</span>
          </div>
          <p className="text-xl font-bold mt-1">{totalProjects}</p>
        </div>

        {/* Tasks */}
        <div className="p-3 rounded-xl bg-[var(--surface-hover)]/20">
          <div className="flex items-center gap-2 text-blue-500">
            <CheckSquare className="w-4 h-4" />
            <span className="text-xs font-semibold">Tasks</span>
          </div>
          <p className="text-xl font-bold mt-1">{totalTasks}</p>
        </div>

        {/* Completed */}
        <div className="p-3 rounded-xl bg-[var(--surface-hover)]/20">
          <div className="flex items-center gap-2 text-[var(--success)]">
            <CheckSquare className="w-4 h-4" />
            <span className="text-xs font-semibold">Completed</span>
          </div>
          <p className="text-xl font-bold mt-1">{completedTasks}</p>
        </div>

        {/* Pending */}
        <div className="p-3 rounded-xl bg-[var(--surface-hover)]/20">
          <div className="flex items-center gap-2 text-[var(--warning)]">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-semibold">Pending</span>
          </div>
          <p className="text-xl font-bold mt-1">{pendingTasks}</p>
        </div>

        {/* Overdue */}
        <div className="p-3 rounded-xl bg-[var(--surface-hover)]/20 col-span-2">
          <div className="flex items-center gap-2 text-[var(--danger)]">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-semibold">Overdue</span>
          </div>
          <p className="text-xl font-bold mt-1">{overdueTasks}</p>
        </div>

      </div>
    </div>
  );
}
"use client";

import { User, CheckCircle2 } from "lucide-react";

interface Member {
  id: string;
  name: string;
  avatar?: string | null;
  taskCount: number;
  completedCount: number;
}

interface Props {
  members: Member[];
}

export default function TeamMembersWorkedCard({ members }: Props) {
  return (
    <div className="glass-panel p-6 rounded-2xl border border-[var(--border)]/50 flex flex-col">
      <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">
        Team Members Activity
      </h3>

      <div className="space-y-3">
        {members.length > 0 ? (
          members.map((m) => {
            const pending = m.taskCount - m.completedCount;
            const progress =
              m.taskCount === 0
                ? 0
                : Math.round((m.completedCount / m.taskCount) * 100);

            return (
              <div
                key={m.id}
                className="p-4 rounded-xl bg-[var(--surface-hover)]/10 hover:bg-[var(--surface-hover)]/30 transition"
              >
                {/* TOP ROW */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* AVATAR */}
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-bold">
                      {m.avatar ? (
                        <img
                          src={m.avatar}
                          alt={m.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        m.name.charAt(0).toUpperCase()
                      )}
                    </div>

                    {/* NAME */}
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-[var(--foreground)] truncate">
                        {m.name}
                      </span>

                      <span className="text-xs text-[var(--text-muted)]">
                        {m.taskCount} total tasks
                      </span>
                    </div>
                  </div>

                  {/* COMPLETED */}
                  <div className="flex items-center gap-1 text-[var(--success)]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-bold">
                      {m.completedCount}
                    </span>
                  </div>
                </div>

                {/* PROGRESS BAR */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
                    <span>
                      Completed: {m.completedCount} | Pending: {pending}
                    </span>
                    <span>{progress}%</span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-[var(--surface-hover)]/20 overflow-hidden">
                    <div
                      className="h-full bg-[var(--success)] transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-[var(--text-muted)] text-center py-6">
            No team activity yet
          </p>
        )}
      </div>
    </div>
  );
}
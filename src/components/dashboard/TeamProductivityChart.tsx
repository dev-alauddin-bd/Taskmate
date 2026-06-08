"use client";

import { Users, Trophy } from "lucide-react";

interface Props {
  data: { name: string; completedTasks: number }[];
}

export default function TeamProductivityChart({ data }: Props) {
  const total = data.reduce((acc, d) => acc + d.completedTasks, 0);
  const max = Math.max(...data.map(d => d.completedTasks), 1);

  const sorted = [...data].sort((a, b) => b.completedTasks - a.completedTasks);

  const getRankIcon = (index: number) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return "•";
  };

  const getAvatar = (name: string) =>
    name?.charAt(0)?.toUpperCase() || "?";

  return (
    <div className="bg-card border border-[var(--border)] rounded-xl shadow-sm p-5 flex flex-col h-full min-h-[360px]">

      {/* HEADER */}
      <div className="flex items-center gap-2 mb-5">
        <Users className="w-5 h-5 text-[var(--primary)]" />
        <h3 className="text-base font-semibold text-[var(--foreground)]">
          Team Productivity
        </h3>
      </div>

      {/* TOTAL */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 mb-5">
        <p className="text-xs text-[var(--text-muted)]">Total Completed Tasks</p>
        <p className="text-2xl font-bold text-[var(--foreground)]">
          {total}
        </p>
      </div>

      {/* LIST */}
      <div className="space-y-4 flex-1">

        {sorted.map((user, index) => {
          const percent = Math.round((user.completedTasks / max) * 100);

          return (
            <div
              key={user.name}
              className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition"
            >

              {/* TOP ROW */}
              <div className="flex items-center justify-between mb-2">

                {/* LEFT */}
                <div className="flex items-center gap-3">

                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-sm font-bold">
                    {getAvatar(user.name)}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)] flex items-center gap-1">
                      {getRankIcon(index)} {user.name}
                    </p>

                    <p className="text-xs text-[var(--text-muted)]">
                      {percent}% productivity
                    </p>
                  </div>

                </div>

                {/* RIGHT */}
                <span className="text-sm font-semibold text-[var(--foreground)]">
                  {user.completedTasks}
                </span>

              </div>

              {/* PROGRESS */}
              <div className="w-full h-2 bg-[var(--border)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${percent}%`,
                    backgroundColor:
                      index === 0
                        ? "#22c55e"
                        : index === 1
                        ? "#3b82f6"
                        : index === 2
                        ? "#f59e0b"
                        : "var(--primary)",
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
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { format } from "date-fns";
import Link from "next/link";

import TaskComments from "@/components/dashboard/TaskComments";
import TaskAttachments from "@/components/dashboard/TaskAttachments";

import prisma from "@/lib/prisma";

const card =
  "bg-card border border-[var(--border)] rounded-2xl shadow-sm";

const badge =
  "px-3 py-1 rounded-full text-xs font-medium border";

export default async function ManagerTaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  if (!["ADMIN"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  const { id } = await params;

  const task = await prisma.task.findFirst({
    where: { id, deletedAt: null },
    include: {
      project: true,
      assignees: { include: { user: true } },
      comments: { include: { user: true } },
      attachments: { include: { uploadedBy: true } },
    },
  });

  if (!task) notFound();

  return (
    <div className="space-y-6 animate-fade-in">

      {/* HEADER */}
      <div className={`${card} p-6`}>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
          {task.title}
        </h1>

        <p className="mt-2 text-sm text-[var(--text-muted)] max-w-3xl">
          {task.description || "No description provided"}
        </p>

        {/* TAGS */}
        <div className="flex flex-wrap gap-2 mt-4">
          <span className={`${badge} bg-blue-500/10 text-blue-600 border-blue-500/20`}>
            📁 {task.project?.name}
          </span>

          <span className={`${badge} bg-purple-500/10 text-purple-600 border-purple-500/20`}>
            📌 {task.status.replaceAll("_", " ")}
          </span>

          <span className={`${badge} bg-yellow-500/10 text-yellow-600 border-yellow-500/20`}>
            ⚡ {task.priority}
          </span>

          <span className={`${badge} bg-green-500/10 text-green-600 border-green-500/20`}>
            ⏰ {format(new Date(task.dueDate), "MMM d, yyyy")}
          </span>
        </div>
      </div>

      {/* ================= MAIN GRID (ONLY 2 COLS) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ================= LEFT (FULL INFO PANEL) ================= */}
        <div className={`lg:col-span-4 ${card} p-5 space-y-6`}>

          {/* OVERVIEW */}
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase mb-3">
              Overview
            </h2>

            <div className="space-y-3">

              <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex justify-between">
                <span className="text-[var(--text-muted)]">Priority</span>
                <span className="font-medium text-[var(--foreground)]">
                  {task.priority}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex justify-between">
                <span className="text-[var(--text-muted)]">Status</span>
                <span className="font-medium text-[var(--foreground)]">
                  {task.status.replaceAll("_", " ")}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex justify-between">
                <span className="text-[var(--text-muted)]">Due</span>
                <span className="font-medium text-[var(--foreground)]">
                  {format(new Date(task.dueDate), "MMM d, yyyy")}
                </span>
              </div>

            </div>
          </div>

          {/* ASSIGNEES */}
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase mb-3">
              Assignees
            </h2>

            <div className="space-y-2">
              {task.assignees.length > 0 ? (
                task.assignees.map((a) => (
                  <div
                    key={a.id}
                    className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)]"
                  >
                    {a.user?.name || "Unnamed"}
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--text-muted)]">
                  No assignees
                </p>
              )}
            </div>
          </div>

          {/* META */}
          <div className="pt-4 border-t border-[var(--border)] space-y-2 text-xs text-[var(--text-muted)]">

            <div className="flex justify-between">
              <span>ID</span>
              <span className="text-[var(--foreground)]">
                {task.id.slice(0, 8)}...
              </span>
            </div>

            <div className="flex justify-between">
              <span>Created</span>
              <span className="text-[var(--foreground)]">
                {format(new Date(task.createdAt), "MMM d, yyyy")}
              </span>
            </div>

          </div>
        </div>

        {/* ================= CENTER (COMMENTS + ATTACHMENTS) ================= */}
        <div className="lg:col-span-8 space-y-6">

          <div className={`${card} p-6`}>
            <h2 className="text-sm font-semibold text-[var(--text-muted)] mb-4">
              Comments
            </h2>

            <TaskComments
              taskId={task.id}
              initialComments={task.comments}
            />
          </div>

          <div className={`${card} p-6`}>
            <h2 className="text-sm font-semibold text-[var(--text-muted)] mb-4">
              Attachments
            </h2>

            <TaskAttachments
              taskId={task.id}
              initialAttachments={task.attachments ?? []}
            />
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <div className="flex justify-end">
        <Link
          href="/dashboard/manager/tasks"
          className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition"
        >
          ← Back to Tasks
        </Link>
      </div>

    </div>
  );
}
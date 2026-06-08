"use client";

import { useState } from "react";
import DataTable from "@/components/dashboard/DataTable";
import { Pencil, Trash2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Modal } from "@/components/Modal";
import { TaskForm } from "@/components/TaskForm";

/* ================= STATUS ================= */
const getStatusColor = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "bg-green-500/10 text-green-600 border-green-500/20";
    case "ON_HOLD":
      return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
    case "COMPLETED":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    case "OVERDUE":
      return "bg-red-500/10 text-red-600 border-red-500/20";
    default:
      return "bg-gray-500/10 text-gray-600 border-gray-500/20";
  }
};

const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
      status
    )}`}
  >
    {status.replaceAll("_", " ")}
  </span>
);

/* ================= PRIORITY ================= */
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "HIGH":
      return "bg-red-500/10 text-red-600 border-red-500/20";
    case "MEDIUM":
      return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
    case "LOW":
      return "bg-green-500/10 text-green-600 border-green-500/20";
    default:
      return "bg-gray-500/10 text-gray-600 border-gray-500/20";
  }
};

const PriorityBadge = ({ priority }: { priority: string }) => (
  <span
    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
      priority
    )}`}
  >
    {priority}
  </span>
);

export default function TasksClient({
  tasks,
  users,
}: {
  tasks: any[];
  users: { id: string; name: string }[];
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [editingTask, setEditingTask] = useState<any>(null);

  const role = session?.user?.role;

  const isAdmin = role === "ADMIN";
  const isManager = role === "PROJECT_MANAGER";

  const canEdit = isAdmin || isManager;
  const canDelete = isAdmin;

  const baseRoute = isAdmin
    ? "/dashboard/admin/tasks"
    : isManager
    ? "/dashboard/manager/tasks"
    : "/dashboard/member/tasks";

  const isOverdue = (t: any) =>
    new Date(t.dueDate) < new Date() && t.status !== "COMPLETED";

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this task permanently?")) return;

    const res = await fetch(`/api/tasks/${id}`, {
      method: "DELETE",
    });

    if (res.ok) router.refresh();
    else alert("Failed to delete task");
  };

  const columns = [
    {
      header: "Task",
      accessor: (t: any) => (
        <span className="font-medium text-[var(--foreground)]">
          {t.title}
        </span>
      ),
    },

    {
      header: "Project",
      accessor: (t: any) => (
        <span className="text-[var(--text-muted)]">
          {t.project?.name}
        </span>
      ),
    },

    {
      header: "Status",
      accessor: (t: any) => <StatusBadge status={t.status} />,
    },

    {
      header: "Priority",
      accessor: (t: any) => <PriorityBadge priority={t.priority} />,
    },

    {
      header: "Due Date",
      accessor: (t: any) => (
        <span
          className={
            isOverdue(t)
              ? "text-[var(--danger)] font-medium"
              : "text-[var(--text-muted)]"
          }
        >
          {new Date(t.dueDate).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },

    {
      header: "Assignee",
      accessor: (t: any) => {
        const names = t.assignees?.map((a: any) => a.user?.name).filter(Boolean);

        return (
          <div className="flex flex-wrap gap-1 justify-center">
            {names?.length ? (
              names.map((name: string) => (
                <span
                  key={name}
                  className="px-2 py-0.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] text-xs"
                >
                  {name}
                </span>
              ))
            ) : (
              <span className="text-xs text-[var(--text-muted)] italic">
                Unassigned
              </span>
            )}
          </div>
        );
      },
    },

    /* ================= DETAILS CTA ================= */
    {
      header: "Details",
      center: true,
      accessor: (t: any) => (
        <Link
          href={`${baseRoute}/${t.id}`}
          className="
            inline-flex items-center gap-1
            px-3 py-1.5
            rounded-lg text-xs font-medium
            bg-[var(--primary)]/10
            text-[var(--primary)]
            border border-[var(--primary)]/20
            hover:bg-[var(--primary)]
            hover:text-white
            transition
          "
        >
          <Eye size={14} />
          View
        </Link>
      ),
    },

    ...(canEdit || canDelete
      ? [
          {
            header: "Actions",
            center: true,
            accessor: (t: any) => (
              <div className="flex items-center justify-center gap-2">
                {canEdit && (
                  <button
                    onClick={() => setEditingTask(t)}
                    className="p-2 rounded-lg text-[var(--primary)] hover:bg-[var(--surface-hover)] transition"
                  >
                    <Pencil size={18} />
                  </button>
                )}

                {canDelete && (
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-2 rounded-lg text-[var(--danger)] hover:bg-[var(--surface-hover)] transition"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      <DataTable data={tasks} columns={columns} />

      {editingTask && (
        <Modal
          isOpen={true}
          onClose={() => setEditingTask(null)}
          title="Edit Task"
        >
          <TaskForm
            projectId={editingTask.projectId}
            task={editingTask}
            onCancel={() => setEditingTask(null)}
          />
        </Modal>
      )}
    </>
  );
}
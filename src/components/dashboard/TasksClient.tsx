"use client";

import { useState } from "react";
import DataTable from "@/components/dashboard/DataTable";
import { Pencil, Trash2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Modal } from "@/components/Modal";
import { TaskForm } from "@/components/TaskForm";
import toast from "react-hot-toast";

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
  const [deleteId, setDeleteId] = useState<string | null>(null); // ✅ modal state

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

  /* ================= DELETE API ================= */
  const handleDelete = async () => {
    if (!deleteId) return;

    const res = await fetch(`/api/tasks/${deleteId}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (res.ok) {
      toast.success("Task deleted successfully");
      router.refresh();
    } else {
      toast.error(data.message || "Failed to delete task");
    }

    setDeleteId(null);
  };

  const columns = [
    {
      header: "Task",
      className: "min-w-[150px]",
      accessor: (t: any) => (
        <span className="font-medium text-[var(--foreground)]">
          {t.title}
        </span>
      ),
    },

    {
      header: "Project",
      className: "min-w-[120px]",
      accessor: (t: any) => (
        <span className="text-[var(--text-muted)]">
          {t.project?.name}
        </span>
      ),
    },

    {
      header: "Status",
      className: "whitespace-nowrap",
      accessor: (t: any) => <StatusBadge status={t.status} />,
    },

    {
      header: "Priority",
      className: "whitespace-nowrap",
      accessor: (t: any) => <PriorityBadge priority={t.priority} />,
    },

    {
      header: "Due Date",
      className: "whitespace-nowrap",
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
      className: "min-w-[120px]",
      accessor: (t: any) => {
        const names = t.assignees
          ?.map((a: any) => a.user?.name)
          .filter(Boolean);

        return (
          <div className="flex flex-wrap gap-1 justify-center">
            {names?.length ? (
              names.map((name: string) => (
                <span
                  key={name}
                  className="px-2 py-0.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] text-xs whitespace-nowrap"
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

    {
      header: "Details",
      center: true,
      className: "whitespace-nowrap",
      accessor: (t: any) => (
        <Link
          href={`${baseRoute}/${t.id}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 hover:bg-[var(--primary)] hover:text-white transition"
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
            className: "whitespace-nowrap",
            accessor: (t: any) => (
              <div className="flex items-center justify-center gap-2">
                {canEdit && (
                  <button
                    onClick={() => setEditingTask(t)}
                    className="p-2 rounded-lg text-[var(--primary)] hover:bg-[var(--surface-hover)] transition cursor-pointer"
                  >
                    <Pencil size={18} />
                  </button>
                )}

                {canDelete && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteId(t.id); // ✅ open modal
                    }}
                    className="p-2 rounded-lg text-[var(--danger)] hover:bg-[var(--surface-hover)] transition cursor-pointer"
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

      {/* ================= EDIT MODAL ================= */}
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

      {/* ================= DELETE CONFIRM MODAL ================= */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-[340px] shadow-lg">

            <h2 className="text-lg font-semibold mb-2">
              Delete Task?
            </h2>

            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this task?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-lg glass-panel cursor-pointer"
              >
                No
              </button>

              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
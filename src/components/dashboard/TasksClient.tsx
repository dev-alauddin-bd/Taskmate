"use client";

import { useState } from "react";
import DataTable, { getStatusColor } from "@/components/dashboard/DataTable";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function TasksClient({
  tasks,
  users,
}: {
  tasks: any[];
  users: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [editingTask, setEditingTask] = useState<any>(null);

  const { data: session } = useSession();

  const role = session?.user?.role;
  const userId = session?.user?.id;

  // ===============================
  // ROLE CHECK
  // ===============================
  const isAdmin = role === "ADMIN";
  const isManager = role === "PROJECT_MANAGER";
  const isMember = role === "MEMBER";

  // ===============================
  // PERMISSIONS
  // ===============================
  const canEdit = isAdmin || isManager;
  const canDelete = isAdmin;


  // ===============================
  // ROUTE BASE
  // ===============================
  const baseRoute = isAdmin
    ? "/admin/tasks"
    : isManager
      ? "/manager/tasks"
      : "/member/tasks";

  // ===============================
  // HELPERS
  // ===============================
  const isOverdue = (t: any) =>
    new Date(t.dueDate) < new Date() && t.status !== "COMPLETED";

  const openEdit = (task: any) => setEditingTask(task);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this task permanently?")) return;

    const res = await fetch(`/api/tasks/${id}`, {
      method: "DELETE",
    });

    if (res.ok) router.refresh();
    else alert("Failed to delete task");
  };

  // ===============================
  // BASE COLUMNS
  // ===============================
  const baseColumns = [
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
      accessor: (t: any) => (
        <span className={getStatusColor(t.status)}>
          {t.status.replaceAll("_", " ")}
        </span>
      ),
    },
    {
      header: "Priority",
      accessor: (t: any) => <span>{t.priority}</span>,
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
        const names = t.assignees
          ?.map((a: any) => a.user?.name)
          .filter(Boolean);

        return (
          <div className="flex flex-wrap gap-1">
            {names?.length > 0 ? (
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
  ];

  // ===============================
  // DETAILS COLUMN
  // ===============================
  const detailsColumn = {
    header: "Details",
    center: true,
    accessor: (t: any) =>

      <Link
        href={`/dashboard${baseRoute}/${t.id}`}
        className="btn btn-sm btn-ghost cursor-pointer"
      >
        <Eye size={24} color="#21f896" />

      </Link>

  };

  // ===============================
  // ACTIONS COLUMN (ONLY ADMIN/MANAGER)
  // ===============================
  const actionsColumn =
    canEdit || canDelete
      ? {
        header: "Actions",
        center: true,
        accessor: (t: any) => (
          <div className="flex items-center justify-center gap-2">
            {canEdit && (
              <button
                onClick={() => openEdit(t)}
                className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
              >
                <Pencil size={18} />
              </button>
            )}

            {canDelete && (
              <button
                onClick={() => handleDelete(t.id)}
                className="p-2 rounded-lg text-red-600 hover:bg-red-50"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        ),
      }
      : null;

  // ===============================
  // FINAL COLUMNS (SMART BUILD)
  // ===============================
  const columns = [
    ...baseColumns,
    detailsColumn,
    ...(actionsColumn ? [actionsColumn] : []),
  ];

  return (
    <>
      <DataTable data={tasks} columns={columns} />

      {editingTask && <div>{/* edit modal */}</div>}
    </>
  );
}
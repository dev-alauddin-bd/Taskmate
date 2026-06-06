// src/components/dashboard/AdminTasksClient.tsx
"use client";

import { useState } from "react";
import DataTable, { getStatusColor } from "@/components/dashboard/DataTable";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * Client‑side component responsible for rendering the tasks table.
 * It receives data from the Server Component (AdminTasksPage) and
 * provides interactive actions such as edit/delete. The UI follows
 * the premium design guidelines (rounded icons, hover effects).
 */
export default function TasksClient({
  tasks,
  users,
}: {
  tasks: any[];
  users: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [editingTask, setEditingTask] = useState<any>(null);

  const isOverdue = (t: any) => new Date(t.dueDate) < new Date() && t.status !== "COMPLETED";

  const openEdit = (task: any) => setEditingTask(task);
  const closeEdit = () => setEditingTask(null);

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
        <span className="font-medium text-[var(--foreground)]">{t.title}</span>
      ),
    },
    {
      header: "Project",
      accessor: (t: any) => (
        <span className="text-[var(--text-muted)]">{t.project?.name}</span>
      ),
    },
    {
      header: "Status",
      accessor: (t: any) => (
        <span className={getStatusColor(t.status)}>{t.status.replace("_", " ")}</span>
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
            isOverdue(t) ? "text-[var(--danger)] font-medium" : "text-[var(--text-muted)]"
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
        return <span>{names?.length ? names.join(', ') : 'Unassigned'}</span>;
      },
    },
    {
      header: "Actions",
      center: true,
      accessor: (t: any) => (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => openEdit(t)}
            className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition cursor-pointer"
            title="Edit"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => handleDelete(t.id)}
            className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition cursor-pointer"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable data={tasks} columns={columns} />
      {/* Future: render edit modal/form using editingTask state */}
    </>
  );
}

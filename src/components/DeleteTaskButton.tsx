"use client";

import { useRouter } from "next/navigation";

export default function DeleteTaskButton({
  taskId,
}: {
  taskId: string;
}) {
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.push("/dashboard/manager/tasks");
      router.refresh();
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="btn btn-error btn-sm"
    >
      Delete Task
    </button>
  );
}
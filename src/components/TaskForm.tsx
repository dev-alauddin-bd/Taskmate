"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function TaskForm({
  projectId,
  task,
  onCancel,
}: {
  projectId: string;
  task?: any;
  onCancel: () => void;
}) {
  const router = useRouter();

  const today = new Date().toISOString().split("T")[0];

  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""
  );
  const [priority, setPriority] = useState(task?.priority || "");
  const [status, setStatus] = useState(task?.status || "");
  const [userId, setUserId] = useState(
    task?.assignees?.[0]?.userId || task?.userId || ""
  );

  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // USERS
  useEffect(() => {
    fetch("/api/users", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        const usersArray = data?.data ?? data;
        if (Array.isArray(usersArray)) setUsers(usersArray);
      });
  }, []);

  // ================= VALIDATION =================
  const validate = () => {
    if (!title.trim()) return "Task title is required";
    if (!description.trim()) return "Description is required";
    if (!dueDate) return "Due date is required";
    if (dueDate < today) return "Past date is not allowed";
    if (!priority) return "Priority is required";
    if (!status) return "Status is required";
    if (!userId) return "You must assign this task to a user";

    return null;
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const url = task ? `/api/tasks/${task.id}` : "/api/tasks";
      const method = task ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          dueDate,
          priority,
          status,
          projectId,
          userId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to save task");
      }

      router.refresh();
      onCancel();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      {/* ERROR */}
      {error && (
        <div className="p-3 rounded-md bg-red-100 border border-red-400 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* TITLE */}
      <input
        className="input"
        placeholder="Task Title "
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* DESCRIPTION */}
      <textarea
        className="input min-h-[80px]"
        placeholder="Description "
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* DATE */}
      <input
        type="date"
        className="input cursor-pointer"
        value={dueDate}
        min={today}
        onChange={(e) => setDueDate(e.target.value)}
      />

      {/* PRIORITY */}
      <select
        className="input cursor-pointer"
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
      >
        <option value="">Select Priority </option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
      </select>

      {/* STATUS */}
      <select
        className="input cursor-pointer"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="">Select Status </option>
        <option value="TODO">To Do</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="COMPLETED">Completed</option>
      </select>

      {/* ASSIGN USER */}
      <select
        className="input cursor-pointer"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      >
        <option value="">Assign User </option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name} ({user.email})
          </option>
        ))}
      </select>

      {/* ACTIONS */}
      <div className="flex gap-3 justify-end mt-2">

        <button
          type="button"
          className="btn btn-outline cursor-pointer"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="btn btn-primary cursor-pointer"
          disabled={loading}
        >
          {loading ? "Saving..." : task ? "Update Task" : "Create Task"}
        </button>

      </div>
    </form>
  );
}
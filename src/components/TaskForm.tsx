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
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""
  );
  const [priority, setPriority] = useState(task?.priority || "MEDIUM");
  const [status, setStatus] = useState(task?.status || "TODO");
  const [userId, setUserId] = useState(
    task?.assignees?.[0]?.userId || task?.userId || ""
  );
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch users for assignment
    fetch("/api/users", { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          // The users endpoint returns { success, data, pagination }
          // Use the nested data array if present, otherwise fallback to raw array.
          const usersArray = data?.data ?? data;
          if (Array.isArray(usersArray)) setUsers(usersArray);
        })
        .catch((err) => {
          console.warn("Failed to load users – check auth session", err);
        });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Simple client‑side validation
      if (!title.trim()) {
        setError("Task title is required");
        setLoading(false);
        return;
      }
      if (!dueDate) {
        setError("Due date is required");
        setLoading(false);
        return;
      }

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
          userId: userId || undefined 
        }),
      });

      if (!res.ok) {
        const data = await res.json();
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


  console.log("users", users);
  

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="p-3 rounded-md bg-[var(--danger)]/10 border border-[var(--danger)] text-[var(--danger)] text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="label" htmlFor="title">Task Title</label>
        <input
          id="title"
          type="text"
          className="input"
          placeholder="e.g. Design Homepage"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="label" htmlFor="description">Description</label>
        <textarea
          id="description"
          className="input min-h-[80px]"
          placeholder="Brief details..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="dueDate">Due Date</label>
          <input
            id="dueDate"
            type="date"
            className="input"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="userId">Assign To</label>
          <select
            id="userId"
            className="input"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          >
            <option value="">Unassigned</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="priority">Priority</label>
          <select
            id="priority"
            className="input"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        <div>
          <label className="label" htmlFor="status">Status</label>
          <select
            id="status"
            className="input"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 justify-end mt-2">
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
         <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Saving..." : task ? "Update Task" : "Create Task"}
        </button>
      </div>
    </form>
  );
}

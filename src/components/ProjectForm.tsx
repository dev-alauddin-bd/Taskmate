"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function ProjectForm({
  onCancel,
  onSuccess,
  initialData,
}: {
  onCancel?: () => void;
  onSuccess?: () => void;
  initialData?: any;
}) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setStatus(initialData.status || "ACTIVE");

      if (initialData.deadline) {
        setDeadline(
          new Date(initialData.deadline).toISOString().split("T")[0]
        );
      }
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        initialData
          ? `/api/projects/${initialData.id}`
          : "/api/projects",
        {
          method: initialData ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            description,
            deadline,
            status,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed");

      onSuccess?.();
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        className="input"
        placeholder="Project Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <textarea
        className="input"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        type="date"
        className="input"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
      />

      <select
        className="input"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="ACTIVE">Active</option>
        <option value="ON_HOLD">On Hold</option>
        <option value="COMPLETED">Completed</option>
      </select>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-outline"
        >
          Cancel
        </button>

        <button type="submit" className="btn btn-primary">
          {loading
            ? "Saving..."
            : initialData
            ? "Update Project"
            : "Create Project"}
        </button>
      </div>
    </form>
  );
}
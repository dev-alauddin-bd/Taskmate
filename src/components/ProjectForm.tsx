"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Pencil } from "lucide-react";

type Member = {
  userId: string;
};

export function ProjectForm({
  onCancel,
  onSuccess,
  initialData,
}: {
  onCancel?: () => void;
  onSuccess?: () => void;
  initialData?: any; // 👈 edit mode
}) {
  const router = useRouter();

  const isEdit = !!initialData;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("ACTIVE");

  const [members, setMembers] = useState<Member[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // ================= FETCH USERS =================
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data?.data ?? []);
    })();
  }, []);

  // ================= EDIT MODE LOAD =================
  useEffect(() => {
    if (!initialData) return;

    setName(initialData.name || "");
    setDescription(initialData.description || "");
    setStatus(initialData.status || "ACTIVE");

    if (initialData.deadline) {
      setDeadline(
        new Date(initialData.deadline).toISOString().split("T")[0]
      );
    }

    setMembers(
      initialData.members?.map((m: any) => ({
        userId: m.userId,
      })) || []
    );
  }, [initialData]);

  // ================= MEMBERS =================
  const addMember = (userId: string) => {
    if (members.some((m) => m.userId === userId)) return;
    setMembers((prev) => [...prev, { userId }]);
  };

  const removeMember = (userId: string) => {
    setMembers((prev) => prev.filter((m) => m.userId !== userId));
  };

  const isSelected = (userId: string) =>
    members.some((m) => m.userId === userId);

  // ================= SUBMIT =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name,
        description,
        deadline,
        status,
        members: members.filter((m) => m.userId),
      };

      const res = await fetch(
        isEdit ? `/api/projects/${initialData.id}` : "/api/projects",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed");

      await res.json();

      onSuccess?.();
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* TITLE */}
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

      {/* ================= MEMBERS ================= */}
      <div className="space-y-3">

        <div className="flex justify-between items-center">
          <h3 className="font-semibold">
            Team Members {isEdit ? "(Edit Mode)" : "(Create Mode)"}
          </h3>

          <button
            type="button"
            onClick={() => setShowPicker(!showPicker)}
            className="btn btn-outline btn-sm"
          >
            Manage Members
          </button>
        </div>

        {/* PICKER */}
        {showPicker && (
          <div className="border rounded-xl p-3 max-h-60 overflow-y-auto space-y-2">

            {users.map((u) => {
              const selected = isSelected(u.id);

              return (
                <div
                  key={u.id}
                  className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <div>
                    <p className="font-medium">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </div>

                  {!selected ? (
                    <button
                      type="button"
                      onClick={() => addMember(u.id)}
                      className="btn btn-sm btn-primary"
                    >
                      <Check size={16} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => removeMember(u.id)}
                      className="btn btn-sm btn-outline"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* SELECTED MEMBERS */}
        <div className="flex flex-wrap gap-2 mt-2">
          {members.map((m) => {
            const user = users.find((u) => u.id === m.userId);

            return (
              <span
                key={m.userId}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm flex items-center gap-2"
              >
                {user?.name || "Unknown"}

                <button
                  type="button"
                  onClick={() => removeMember(m.userId)}
                >
                  <X size={14} />
                </button>
              </span>
            );
          })}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-outline"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading
            ? "Saving..."
            : isEdit
              ? "Update Project"
              : "Create Project"}
        </button>
      </div>

    </form>
  );
}
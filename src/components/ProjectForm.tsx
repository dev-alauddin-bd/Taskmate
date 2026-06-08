"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Role } from "../../generated/prisma/enums";

type Member = {
  userId: string;
  role: Role;
};

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
  const isEdit = !!initialData;

  const today = new Date().toISOString().split("T")[0];

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("ACTIVE");

  const [members, setMembers] = useState<Member[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  // ================= USERS =================
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data?.data ?? []);
    })();
  }, []);

  // ================= EDIT MODE =================
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
        role: m.role ?? Role.MEMBER,
      })) ?? []
    );
  }, [initialData]);

  // ================= VALIDATION =================
  const validate = () => {
    const err: any = {};

    if (!name.trim()) err.name = "Project name is required";
    if (!description.trim()) err.description = "Description is required";
    if (!deadline) err.deadline = "Deadline is required";

    if (deadline && deadline < today) {
      err.deadline = "Past date is not allowed";
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // ================= MEMBERS =================
  const addMember = (user: any) => {
    if (members.some((m) => m.userId === user.id)) return;

    setMembers((prev) => [
      ...prev,
      {
        userId: user.id,
        role: user.role || Role.MEMBER,
      },
    ]);
  };

  const updateRole = (userId: string, role: Role) => {
    setMembers((prev) =>
      prev.map((m) => (m.userId === userId ? { ...m, role } : m))
    );
  };

  const removeMember = (userId: string) => {
    setMembers((prev) => prev.filter((m) => m.userId !== userId));
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        deadline,
        status,
        members,
      };

      const res = await fetch(
        isEdit ? `/api/projects/${initialData.id}` : "/api/projects",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data?.message || "Failed to create project");
        return;
      }

      onSuccess?.();
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 glass-panel p-6 rounded-2xl shadow-xl "
    >
      {/* NAME */}
      <div>
        <input
          className="input"
          placeholder="Project Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </div>

      {/* DESCRIPTION */}
      <div>
        <textarea
          className="input min-h-[100px]"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {errors.description && (
          <p className="text-red-500 text-sm">{errors.description}</p>
        )}
      </div>

      {/* DATE */}
      <div>
        <input
          type="date"
          className="input cursor-pointer"
          value={deadline}
          min={today}
          onChange={(e) => setDeadline(e.target.value)}
        />
        {errors.deadline && (
          <p className="text-red-500 text-sm">{errors.deadline}</p>
        )}
      </div>

      {/* STATUS */}
      <select
        className="input cursor-pointer"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="ACTIVE">Active</option>
        <option value="ON_HOLD">On Hold</option>
        <option value="COMPLETED">Completed</option>
      </select>

      {/* MEMBERS */}
      <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
        <h3 className="font-semibold mb-3">Team Members</h3>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {users.map((u) => {
            const member = members.find((m) => m.userId === u.id);
            const selected = !!member;

            return (
              <label
                key={u.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-gray-900"
              >
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </div>

                <div className="flex items-center gap-3">
                  {selected && (
                    <select
                      value={member.role}
                      onChange={(e) =>
                        updateRole(u.id, e.target.value as Role)
                      }
                      className="text-xs border rounded px-2 py-1 glass-panel"
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="PROJECT_MANAGER">Manager</option>
                      <option value="MEMBER">Member</option>
                    </select>
                  )}

                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() =>
                      selected ? removeMember(u.id) : addMember(u)
                    }
                    className="w-5 h-5 cursor-pointer accent-[var(--primary)]"
                  />
                </div>
              </label>
            );
          })}
        </div>

        <p className="text-xs text-gray-500 mt-2">
          Selected Members: <b>{members.length}</b>
        </p>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="btn btn-outline">
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? "Saving..." : isEdit ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
}
// src/components/dashboard/TaskFilterBar.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

interface FilterProps {
  search: string;
  status: string;
  priority: string;
  deadlineStatus: string;
  sortBy: string;
  sortOrder: string;
  basePath: string;
}

export default function TaskFilterBar({
  search,
  status,
  priority,
  deadlineStatus,
  sortBy,
  sortOrder,
  basePath,
}: FilterProps) {
  const router = useRouter();
  const [values, setValues] = useState({
    search,
    status,
    priority,
    deadlineStatus,
    sortBy,
    sortOrder,
  });
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Keep internal state in sync when props change (e.g., after a reset)
  useEffect(() => {
    setValues({ search, status, priority, deadlineStatus, sortBy, sortOrder });
  }, [search, status, priority, deadlineStatus, sortBy, sortOrder]);

  const updateQuery = (newVals: typeof values) => {
    const params = new URLSearchParams();
    Object.entries(newVals).forEach(([key, val]) => {
      if (val) params.set(key, val);
    });
    router.replace(`${basePath}?${params.toString()}`);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLFormElement>
  ) => {
    const target = e.target as unknown as HTMLInputElement | HTMLSelectElement;
    const { name, value } = target;
    const updated = { ...values, [name]: value };
    setValues(updated);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateQuery(updated), 300);
  };

  return (
    <form
      className="glass-panel p-4 rounded-xl flex flex-wrap gap-4 items-end shadow-sm"
      onChange={handleChange}
    >
      <div className="flex-1 min-w-[200px]">
        <label htmlFor="search" className="label text-xs">
          Search tasks
        </label>
        <input
          id="search"
          name="search"
          type="text"
          placeholder="Title or description..."
          value={values.search}
          onChange={(e) => setValues({ ...values, search: e.target.value })}
          className="input py-1.5 text-sm mt-1"
        />
      </div>

      <div className="w-full sm:w-40">
        <label htmlFor="status" className="label text-xs">
          Status
        </label>
        <select
          id="status"
          name="status"
          value={values.status}
          onChange={(e) => setValues({ ...values, status: e.target.value })}
          className="input py-1.5 text-sm mt-1"
        >
          <option value="">All Statuses</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      <div className="w-full sm:w-40">
        <label htmlFor="priority" className="label text-xs">
          Priority
        </label>
        <select
          id="priority"
          name="priority"
          value={values.priority}
          onChange={(e) => setValues({ ...values, priority: e.target.value })}
          className="input py-1.5 text-sm mt-1"
        >
          <option value="">All Priorities</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      <div className="w-full sm:w-40">
        <label htmlFor="deadlineStatus" className="label text-xs">
          Deadline
        </label>
        <select
          id="deadlineStatus"
          name="deadlineStatus"
          value={values.deadlineStatus}
          onChange={(e) => setValues({ ...values, deadlineStatus: e.target.value })}
          className="input py-1.5 text-sm mt-1"
        >
          <option value="">All Deadlines</option>
          <option value="UPCOMING">Upcoming</option>
          <option value="OVERDUE">Overdue</option>
        </select>
      </div>

      <div className="w-full sm:w-44">
        <label htmlFor="sortBy" className="label text-xs">
          Sort By
        </label>
        <select
          id="sortBy"
          name="sortBy"
          value={values.sortBy}
          onChange={(e) => setValues({ ...values, sortBy: e.target.value })}
          className="input py-1.5 text-sm mt-1"
        >
          <option value="dueDate">Due Date</option>
          <option value="createdAt">Latest Created</option>
          <option value="priority">Priority</option>
        </select>
      </div>

      <div className="w-full sm:w-32">
        <label htmlFor="sortOrder" className="label text-xs">
          Order
        </label>
        <select
          id="sortOrder"
          name="sortOrder"
          value={values.sortOrder}
          onChange={(e) => setValues({ ...values, sortOrder: e.target.value })}
          className="input py-1.5 text-sm mt-1"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
    </form>
  );
}

"use client";
// src/components/dashboard/TaskComments.tsx
import { useState } from "react";
import { format } from "date-fns";

export interface Comment {
  id: string;
  content: string;
  createdAt: Date | string; // Prisma may return Date object; UI accepts both
  user: { name: string } | null;
}

interface Props {
  taskId: string;
  initialComments: Comment[];
}

export default function TaskComments({ taskId, initialComments }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newContent, setNewContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent }),
      });
      if (res.ok) {
        const created = await res.json();
        // Ensure created.createdAt is a Date or string
        setComments([created, ...comments]);
        setNewContent("");
      } else {
        alert("Failed to add comment");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding comment");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return format(d, "PPP p");
  };

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-2">Comments</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <textarea
          className="p-2 border rounded bg-white/10 backdrop-blur-xl text-[var(--foreground)]"
          placeholder="Write a comment..."
          rows={3}
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
        />
        <button
          type="submit"
          disabled={submitting}
          className="self-end btn btn-primary btn-sm"
        >
          {submitting ? "Posting..." : "Post Comment"}
        </button>
      </form>
      <ul className="space-y-3">
        {comments.map((c) => (
          <li key={c.id} className="p-3 bg-white/5 rounded border border-white/20 backdrop-blur-xl">
            <p className="text-[var(--foreground)] mb-1">{c.content}</p>
            <div className="flex justify-between text-sm text-[var(--text-muted)]">
              <span>{c.user?.name || "Anonymous"}</span>
              <span>{formatDate(c.createdAt)}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

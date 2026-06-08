"use client";

import { useState } from "react";
import { format } from "date-fns";
import { MessageSquare, Send } from "lucide-react";

export interface Comment {
  id: string;
  content: string;
  createdAt: Date | string;
  user?: { name: string } | null;
}

interface Props {
  taskId: string;
  initialComments: Comment[];
}

export default function TaskComments({
  taskId,
  initialComments,
}: Props) {
  const [comments, setComments] =
    useState<Comment[]>(initialComments);

  const [newContent, setNewContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* ================= SUBMIT COMMENT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newContent.trim()) return;

    setSubmitting(true);

    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newContent,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to add comment");
      }

      // 🔥 ensure user exists in response
      setComments((prev) => [
        {
          ...data,
          user: data.user || { name: "System User" },
        },
        ...prev,
      ]);

      setNewContent("");
    } catch (error) {
      console.error(error);
      alert("Error adding comment");
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= FORMAT DATE ================= */
  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return format(d, "MMM d, yyyy • h:mm a");
  };

  return (
    <section className="space-y-5">

      {/* HEADER */}
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-[var(--primary)]" />
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Comments
        </h2>
      </div>

      {/* ADD COMMENT */}
      <form
        onSubmit={handleSubmit}
        className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 space-y-3"
      >
        <textarea
          rows={4}
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Write your comment..."
          className="
            w-full
            rounded-lg
            border border-[var(--border)]
            bg-[var(--background)]
            px-4 py-3
            text-[var(--foreground)]
            placeholder:text-[var(--text-muted)]
            resize-none
            focus:outline-none
            focus:ring-2
            focus:ring-[var(--primary)]
          "
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="
              inline-flex items-center gap-2
              px-4 py-2
              rounded-lg
              bg-[var(--primary)]
              text-white
              hover:opacity-90
              transition
              disabled:opacity-50
            "
          >
            <Send size={16} />
            {submitting ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </form>

      {/* COMMENTS LIST */}
      <div className="space-y-3">

        {comments.length === 0 ? (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 text-center">
            <p className="text-sm text-[var(--text-muted)]">
              No comments yet
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="
                bg-[var(--surface)]
                border border-[var(--border)]
                rounded-xl
                p-4
                shadow-sm
              "
            >
              <p className="text-[var(--foreground)] leading-relaxed">
                {comment.content}
              </p>

              <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--foreground)]">
                  {comment.user?.name ?? "System User"}
                </span>

                <span className="text-xs text-[var(--text-muted)]">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
            </div>
          ))
        )}

      </div>
    </section>
  );
}
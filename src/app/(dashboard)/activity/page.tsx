import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

export default async function ActivityPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Fetch recent activity logs (latest 20)
  const activities = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  // Simple AI‑generated summary placeholder – in a real app you could call an LLM.
  const summary = (() => {
    if (activities.length === 0) return "No recent activity recorded.";
    const recent = activities.slice(0, 5);
    const descriptions = recent.map((a) => a.details).join(", ");
    return `Recent highlights: ${descriptions}…`;
  })();

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4">
      <div className="glass-panel p-6 rounded-xl shadow-sm border-t-4 border-t-[var(--primary)]">
        <h1 className="text-2xl font-bold mb-4 text-[var(--foreground)]">Activity Feed</h1>
        <p className="text-[var(--text-muted)] mb-4">AI‑generated summary of recent actions.</p>
        <blockquote className="border-l-4 border-[var(--primary)] pl-4 italic text-[var(--foreground)] mb-6">
          {summary}
        </blockquote>
        {activities.length === 0 ? (
          <p className="text-[var(--text-muted)]">No activity yet.</p>
        ) : (
          <ul className="space-y-4">
            {activities.map((activity) => (
              <li key={activity.id} className="flex justify-between items-center p-4 bg-[var(--surface-hover)] rounded-lg transition-colors hover:bg-[var(--surface)]">
                <div className="flex-1">
                  <span className="font-medium text-[var(--foreground)]">
                    {activity.action.replace("_", " ")}
                  </span>
                  <p className="text-[var(--text-muted)] text-sm">{activity.details}</p>
                </div>
                <span className="text-xs text-[var(--text-muted)] whitespace-nowrap ml-4">
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

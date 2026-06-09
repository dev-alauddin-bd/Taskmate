/**
 * Calendar helper utilities for the member dashboard.
 * These functions are deliberately lightweight and do not depend on any UI library.
 * They operate using the server's timezone (as per the user's preference).
 */

/**
 * Generate an array of Date objects representing each day of the current month.
 * The array includes only the days that belong to the month (no leading/trailing filler days).
 */
export function generateCalendarDays(): Date[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0‑based month index
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0); // day 0 of next month = last day of current month
  const days: Date[] = [];
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

/**
 * Return true if the supplied date is today (using server timezone).
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

/**
 * Determine whether any task in the provided list has a dueDate that falls on the given day.
 * @param date The calendar day to check.
 * @param tasks Array of task objects – we only look for a `dueDate` field (ISO string or Date).
 */
export function hasTasksOnDay(date: Date, tasks: any[]): boolean {
  return tasks.some((t) => {
    if (!t.dueDate) return false;
    const taskDate = new Date(t.dueDate);
    return (
      taskDate.getFullYear() === date.getFullYear() &&
      taskDate.getMonth() === date.getMonth() &&
      taskDate.getDate() === date.getDate()
    );
  });
}

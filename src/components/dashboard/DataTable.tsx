

import React from "react";

/* ================= STATUS COLOR SYSTEM ================= */
export const getStatusColor = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "bg-green-50 text-green-700 border-green-200";
    case "ON_HOLD":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "COMPLETED":
      return "bg-blue-50 text-blue-700 border-blue-200";
    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
};

interface Column {
  header: string;
  accessor: (row: any) => React.ReactNode;
  center?: boolean;
  className?: string;
}

interface DataTableProps {
  data: any[];
  columns: Column[];
}

export default function DataTable({ data, columns }: DataTableProps) {
  return (
    <div className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm overflow-hidden">

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-max md:min-w-0">

          {/* ================= HEADER ================= */}
          <thead className="sticky top-0 z-10">
            <tr className="bg-[var(--surface-hover)]/80 backdrop-blur border-b border-[var(--border)]">
              {columns.map((col, i) => (
                <th
                  key={i}
                  className={`px-5 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]
                    ${col.center ? "text-center" : "text-left"}
                    ${col.className || ""}
                  `}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          {/* ================= BODY ================= */}
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-12 text-[var(--text-muted)]"
                >
                  No data found
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="
                    border-b border-[var(--border)]
                    bg-transparent
                    hover:bg-[var(--surface-hover)]/50
                    transition
                  "
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-5 py-4 text-[var(--foreground)]
                        ${col.center ? "text-center" : "text-left"}
                        ${col.className || ""}
                      `}
                    >
                      {col.accessor(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
}
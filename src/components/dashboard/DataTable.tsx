import React from "react";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  render?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
}

export default function DataTable<T extends object>({
  columns,
  data,
  loading,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="p-4 text-[var(--text-muted)]">Loading...</div>
    );
  }

  return (
    <div className="glass-panel rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border border-[var(--border)] border-collapse">

          {/* HEADER */}
          <thead className="border-b border-[var(--border)]">
            <tr>
              {columns.map((col, i) => (
                <th
                  key={`${col.header}-${i}`}
                  className="p-4 text-sm font-semibold text-[var(--foreground)] border border-[var(--border)] text-center"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="divide-y divide-[var(--border)]">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-[var(--surface-hover)] transition-colors"
              >
                {columns.map((col, colIndex) => {
                  const value =
                    typeof col.accessor === "function"
                      ? col.accessor(row)
                      : (row as any)[col.accessor];

                  const cellContent = col.render
                    ? col.render(value, row)
                    : value;

                  return (
                    <td key={`${col.header}-${colIndex}`} className="p-4 border border-[var(--border)] text-center">
                      {cellContent}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}
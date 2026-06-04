import Link from "next/link";
import React from "react";

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  basePath: string; // e.g. "/dashboard/projects"
}

export default function Pagination({ page, limit, total, basePath }: PaginationProps) {
  const totalPages = Math.ceil(total / limit);
  const prevPage = page > 1 ? page - 1 : undefined;
  const nextPage = page < totalPages ? page + 1 : undefined;

  const buildHref = (p: number) => `${basePath}?page=${p}&limit=${limit}`;

  return (
    <nav className="flex items-center justify-center space-x-2 py-4" aria-label="Pagination">
      {prevPage && (
        <Link
          href={buildHref(prevPage)}
          className="px-3 py-1 rounded-md bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
        >
          Prev
        </Link>
      )}
      {[...Array(totalPages)].map((_, i) => {
        const p = i + 1;
        const isCurrent = p === page;
        return (
          <Link
            key={p}
            href={buildHref(p)}
            className={`px-3 py-1 rounded-md ${isCurrent ? "bg-[var(--primary)] text-white" : "bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-hover)]"} transition-colors`}
          >
            {p}
          </Link>
        );
      })}
      {nextPage && (
        <Link
          href={buildHref(nextPage)}
          className="px-3 py-1 rounded-md bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
        >
          Next
        </Link>
      )}
    </nav>
  );
}

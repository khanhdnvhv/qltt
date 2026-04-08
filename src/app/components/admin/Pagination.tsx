import { useMemo } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
  /** Current page (1-based) */
  page: number;
  /** Total number of items */
  total: number;
  /** Items per page */
  pageSize: number;
  /** Available page size options */
  pageSizeOptions?: number[];
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Callback when page size changes */
  onPageSizeChange?: (size: number) => void;
  /** Label for "items" e.g. "nguoi dung", "don hang" */
  itemLabel?: string;
}

export function Pagination({
  page,
  total,
  pageSize,
  pageSizeOptions = [10, 20, 50],
  onPageChange,
  onPageSizeChange,
  itemLabel = "muc",
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  // Generate page numbers to show (max 5, with ellipsis logic)
  const pageNumbers = useMemo(() => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [page, totalPages]);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 bg-white dark:bg-card rounded-b-2xl border border-t-0 border-gray-100 dark:border-border mt-[-1px]">
      <div className="flex items-center gap-3">
        <span className="text-[16px] text-muted-foreground">
          {total === 0 ? (
            `0 ${itemLabel}`
          ) : (
            <>
              {startItem}-{endItem} / {total} {itemLabel}
            </>
          )}
        </span>
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="bg-[#f4f5f7] dark:bg-white/5 px-2.5 py-1.5 rounded-lg text-[15px] text-foreground outline-none border border-transparent appearance-none"
            style={{ fontWeight: 500 }}
          >
            {pageSizeOptions.map((s) => (
              <option key={s} value={s}>{s} / trang</option>
            ))}
          </select>
        )}
      </div>

      <div className="flex items-center gap-1">
        {/* First page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={page <= 1}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Trang dau"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>

        {/* Previous */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Trang truoc"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page numbers */}
        {pageNumbers.map((p, i) =>
          p === "..." ? (
            <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center text-muted-foreground/50 text-[16px]">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-lg text-[16px] flex items-center justify-center transition-colors ${
                p === page
                  ? "bg-primary text-white shadow-sm"
                  : "hover:bg-gray-100 dark:hover:bg-white/5 text-muted-foreground"
              }`}
              style={{ fontWeight: p === page ? 600 : 500 }}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Trang sau"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-muted-foreground disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Trang cuoi"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}


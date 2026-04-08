import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router";

interface UseUrlPaginationOptions {
  defaultPage?: number;
  defaultPageSize?: number;
  pageParam?: string;
  pageSizeParam?: string;
}

/**
 * Syncs pagination state (page, pageSize) with URL query parameters.
 * Reads initial values from URL, and updates URL on changes.
 * Falls back to defaults if URL params are missing/invalid.
 */
export function useUrlPagination({
  defaultPage = 1,
  defaultPageSize = 20,
  pageParam = "page",
  pageSizeParam = "size",
}: UseUrlPaginationOptions = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const parseParam = (key: string, fallback: number): number => {
    const val = searchParams.get(key);
    if (!val) return fallback;
    const num = parseInt(val, 10);
    return isNaN(num) || num < 1 ? fallback : num;
  };

  const page = parseParam(pageParam, defaultPage);
  const pageSize = parseParam(pageSizeParam, defaultPageSize);

  const setPage = useCallback(
    (newPage: number) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (newPage <= 1) {
            next.delete(pageParam);
          } else {
            next.set(pageParam, String(newPage));
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams, pageParam]
  );

  const setPageSize = useCallback(
    (newSize: number) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (newSize === defaultPageSize) {
            next.delete(pageSizeParam);
          } else {
            next.set(pageSizeParam, String(newSize));
          }
          // Reset to page 1 when page size changes
          next.delete(pageParam);
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams, pageSizeParam, pageParam, defaultPageSize]
  );

  return { page, pageSize, setPage, setPageSize };
}

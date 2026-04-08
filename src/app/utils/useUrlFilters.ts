import { useCallback } from "react";
import { useSearchParams } from "react-router";

/**
 * Syncs filter values with URL query parameters.
 * Each filter key maps to a URL param. Values equal to the default are removed from URL.
 */
export function useUrlFilters<T extends Record<string, string>>(
  defaults: T
): [T, (key: keyof T, value: string) => void, () => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read current values from URL, falling back to defaults
  const values = {} as T;
  for (const key of Object.keys(defaults) as (keyof T)[]) {
    const urlVal = searchParams.get(key as string);
    (values as Record<string, string>)[key as string] = urlVal ?? defaults[key];
  }

  const setFilter = useCallback(
    (key: keyof T, value: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value === defaults[key]) {
            next.delete(key as string);
          } else {
            next.set(key as string, value);
          }
          // Reset page when filter changes
          next.delete("page");
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams, defaults]
  );

  const resetAll = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const key of Object.keys(defaults)) {
          next.delete(key);
        }
        next.delete("page");
        return next;
      },
      { replace: true }
    );
  }, [setSearchParams, defaults]);

  return [values, setFilter, resetAll];
}

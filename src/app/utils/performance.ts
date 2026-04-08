/**
 * GDNN-GDTX - Performance Utilities (Phase 12)
 * Debounce, throttle, memoization, image optimization helpers
 */

/**
 * Debounce function - delays execution until after wait ms since last call
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), wait);
  };
}

/**
 * Throttle function - limits execution to once per interval
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  interval: number
): (...args: Parameters<T>) => void {
  let lastTime = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();
    const remaining = interval - (now - lastTime);
    if (remaining <= 0) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastTime = now;
      fn.apply(this, args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastTime = Date.now();
        timeoutId = null;
        fn.apply(this, args);
      }, remaining);
    }
  };
}

/**
 * Simple memoize for expensive computations
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyFn?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  return function (this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args);
    if (cache.has(key)) return cache.get(key)!;
    const result = fn.apply(this, args);
    cache.set(key, result);
    // Limit cache size to prevent memory leaks
    if (cache.size > 200) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) cache.delete(firstKey);
    }
    return result;
  } as T;
}

/**
 * Format number with Vietnamese locale
 */
export const formatNumber = memoize((num: number): string => {
  return num.toLocaleString("vi-VN");
});

/**
 * Format currency in VND
 */
export const formatVND = memoize((amount: number): string => {
  return amount.toLocaleString("vi-VN") + "";
});

/**
 * Format compact number (e.g., 1.2K, 5.3M)
 */
export const formatCompactNumber = memoize((num: number): string => {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toString();
});

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate a unique ID
 */
export function uniqueId(prefix = ""): string {
  return prefix + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Intersection Observer for lazy loading (reusable)
 */
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
): IntersectionObserver | null {
  if (typeof IntersectionObserver === "undefined") return null;
  return new IntersectionObserver(callback, {
    rootMargin: "200px",
    threshold: 0.01,
    ...options,
  });
}

/**
 * Copy text to clipboard with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for older browsers
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}

/**
 * Simple class name merge utility
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Pluralize Vietnamese text (simple)
 */
export function pluralize(count: number, singular: string, _plural?: string): string {
  return `${count} ${singular}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trimEnd() + "...";
}

/**
 * Get relative time string in Vietnamese
 */
export function getRelativeTime(date: Date | string | number): string {
  const now = Date.now();
  const target = new Date(date).getTime();
  const diff = now - target;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const weeks = Math.floor(diff / 604800000);
  const months = Math.floor(diff / 2592000000);

  if (minutes < 1) return "Vua xong";
  if (minutes < 60) return `${minutes} phut truoc`;
  if (hours < 24) return `${hours} gio truoc`;
  if (days < 7) return `${days} ngay truoc`;
  if (weeks < 4) return `${weeks} tuan truoc`;
  if (months < 12) return `${months} thang truoc`;
  return `${Math.floor(months / 12)} nam truoc`;
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry async operation with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      const delay = baseDelayMs * Math.pow(2, attempt);
      await sleep(delay + Math.random() * 500);
    }
  }
  throw new Error("Max retries exceeded");
}

/**
 * Schedule a non-critical task to run during browser idle time.
 * Uses requestIdleCallback with a fallback to setTimeout for unsupported browsers.
 * Great for: analytics, prefetching, non-visible UI updates, cache warming.
 *
 * @param task - Function to execute during idle time
 * @param options - Optional timeout (max wait before forced execution, default 5000ms)
 * @returns Cancel function to abort the scheduled task
 */
export function scheduleIdleTask(
  task: () => void,
  options: { timeout?: number } = {}
): () => void {
  const { timeout = 5000 } = options;

  if ("requestIdleCallback" in window) {
    const id = (window as any).requestIdleCallback(
      (deadline: { didTimeout: boolean; timeRemaining: () => number }) => {
        // Execute immediately if timed out, or if enough idle time
        if (deadline.didTimeout || deadline.timeRemaining() > 0) {
          task();
        }
      },
      { timeout }
    );
    return () => (window as any).cancelIdleCallback(id);
  }

  // Fallback for Safari and others: setTimeout with a small delay
  const id = setTimeout(task, 50);
  return () => clearTimeout(id);
}

/**
 * Batch multiple idle tasks to run sequentially during idle periods.
 * Each task gets its own idle callback, so they don't block each other.
 *
 * @param tasks - Array of functions to execute during idle time
 * @param options - Optional timeout per task
 * @returns Cancel function to abort all remaining tasks
 */
export function scheduleIdleBatch(
  tasks: (() => void)[],
  options: { timeout?: number } = {}
): () => void {
  const cancellers: (() => void)[] = [];
  let cancelled = false;

  function scheduleNext(index: number) {
    if (cancelled || index >= tasks.length) return;
    const cancel = scheduleIdleTask(() => {
      tasks[index]();
      scheduleNext(index + 1);
    }, options);
    cancellers.push(cancel);
  }

  scheduleNext(0);

  return () => {
    cancelled = true;
    cancellers.forEach((cancel) => cancel());
  };
}

/**
 * Prefetch a route/page by creating a hidden link[rel=prefetch].
 * Useful for warming the browser cache for likely next navigations.
 *
 * @param url - URL to prefetch
 */
export function prefetchRoute(url: string): void {
  if (typeof document === "undefined") return;

  // Check if already prefetched
  const existing = document.querySelector(`link[rel="prefetch"][href="${url}"]`);
  if (existing) return;

  const link = document.createElement("link");
  link.rel = "prefetch";
  link.href = url;
  link.as = "document";
  document.head.appendChild(link);
}
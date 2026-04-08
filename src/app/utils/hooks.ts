/**
 * GDNN-GDTX - Custom React Hooks
 * Reusable hooks for common patterns
 */

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Reduced motion preference detection (reactive)
 * Returns true when user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return prefersReduced;
}

/**
 * Generic IntersectionObserver hook
 * Tracks when an element enters the viewport
 * Useful for lazy loading, infinite scroll, scroll-triggered animations
 */
export function useIntersectionObserver(
  options: {
    threshold?: number | number[];
    rootMargin?: string;
    triggerOnce?: boolean;
  } = {}
): [React.RefCallback<Element>, boolean] {
  const { threshold = 0, rootMargin = "0px", triggerOnce = true } = options;
  const [isIntersecting, setIsIntersecting] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementRef = useRef<Element | null>(null);

  const setRef = useCallback(
    (node: Element | null) => {
      // Cleanup previous observer
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      if (!node) {
        elementRef.current = null;
        return;
      }

      elementRef.current = node;

      if (!("IntersectionObserver" in window)) {
        setIsIntersecting(true);
        return;
      }

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          const isVisible = entry.isIntersecting;
          setIsIntersecting(isVisible);
          if (isVisible && triggerOnce && observerRef.current) {
            observerRef.current.disconnect();
          }
        },
        { threshold, rootMargin }
      );

      observerRef.current.observe(node);
    },
    [threshold, rootMargin, triggerOnce]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return [setRef, isIntersecting];
}

/**
 * Focus trap for modals, drawers, and dropdown menus
 * Traps keyboard focus within a container while active
 */
export function useFocusTrap<T extends HTMLElement>(
  active: boolean = true
): React.RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!active || !ref.current) return;

    const container = ref.current;
    const focusableSelector =
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const getFocusableElements = () =>
      Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (el) => el.offsetParent !== null
      );

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusable = getFocusableElements();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    // Focus first focusable element
    const focusable = getFocusableElements();
    if (focusable.length > 0) {
      requestAnimationFrame(() => focusable[0].focus());
    }

    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [active]);

  return ref;
}

/**
 * Keyboard escape handler
 * Calls callback when Escape key is pressed
 */
export function useEscapeKey(callback: () => void, active: boolean = true): void {
  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") callback();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [callback, active]);
}

/**
 * Debounced value - delays updating value until after wait ms
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * LocalStorage state with automatic sync
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const nextValue = value instanceof Function ? value(prev) : value;
        try {
          localStorage.setItem(key, JSON.stringify(nextValue));
        } catch {
          // Storage full
        }
        return nextValue;
      });
    },
    [key]
  );

  return [storedValue, setValue];
}

/**
 * Click outside detection
 */
export function useClickOutside<T extends HTMLElement>(
  callback: () => void
): React.RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [callback]);

  return ref;
}

/**
 * Media query hook
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

/**
 * Mobile detection
 */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 768px)");
}

/**
 * Previous value hook
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

/**
 * Toggle hook
 */
export function useToggle(
  initialValue: boolean = false
): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(() => setValue((v) => !v), []);
  return [value, toggle, setValue];
}

/**
 * Countdown timer hook
 */
export function useCountdown(
  initialSeconds: number,
  autoStart: boolean = false
): {
  seconds: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
} {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            setIsRunning(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, seconds]);

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(() => {
    setIsRunning(false);
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  return { seconds, isRunning, start, pause, reset };
}

/**
 * Scroll position hook
 */
export function useScrollPosition(): { x: number; y: number } {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = () => {
      setPosition({ x: window.scrollX, y: window.scrollY });
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return position;
}

/**
 * Document title hook
 */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title + " | GDNN-GDTX";
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
}

/**
 * Copy to clipboard hook
 */
export function useCopyToClipboard(): [boolean, (text: string) => Promise<void>] {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, []);

  return [copied, copy];
}

/**
 * Idle callback hook - runs a callback when the browser is idle.
 * Useful for deferred analytics, prefetching, or cache warming.
 * Automatically cancels on unmount.
 *
 * @param callback - Function to run during idle time
 * @param options - { timeout: max wait in ms (default 5000), enabled: boolean }
 */
export function useIdleCallback(
  callback: () => void,
  options: { timeout?: number; enabled?: boolean } = {}
): void {
  const { timeout = 5000, enabled = true } = options;
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) return;

    if ("requestIdleCallback" in window) {
      const id = (window as any).requestIdleCallback(
        () => callbackRef.current(),
        { timeout }
      );
      return () => (window as any).cancelIdleCallback(id);
    }

    // Fallback
    const id = setTimeout(() => callbackRef.current(), 50);
    return () => clearTimeout(id);
  }, [timeout, enabled]);
}

/**
 * Preload critical assets for a page (fonts, images, stylesheets).
 * Injects <link rel="preload"> elements into <head> on mount.
 * Deduplicates  won't add the same href twice.
 *
 * @param assets - Array of { href, as, type?, crossOrigin? }
 */
export function usePreloadCriticalAssets(
  assets: { href: string; as: string; type?: string; crossOrigin?: string }[]
): void {
  useEffect(() => {
    const links: HTMLLinkElement[] = [];
    for (const asset of assets) {
      // Skip if already preloaded
      const existing = document.querySelector(`link[rel="preload"][href="${asset.href}"]`);
      if (existing) continue;

      const link = document.createElement("link");
      link.rel = "preload";
      link.href = asset.href;
      link.as = asset.as;
      if (asset.type) link.type = asset.type;
      if (asset.crossOrigin) link.crossOrigin = asset.crossOrigin;
      document.head.appendChild(link);
      links.push(link);
    }

    return () => {
      links.forEach((link) => {
        if (link.parentNode) link.parentNode.removeChild(link);
      });
    };
  }, []); // Run once on mount
}
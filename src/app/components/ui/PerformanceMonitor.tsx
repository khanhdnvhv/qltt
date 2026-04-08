import { useState, useEffect, useCallback } from "react";
import { X, Activity, Gauge, BarChart3, Timer, MousePointer } from "lucide-react";

/**
 * PerformanceMonitor - Development overlay for Core Web Vitals
 * Tracks: LCP, CLS, INP, TTFB, FCP
 * Only renders in development mode (import.meta.env.DEV)
 * Toggle with Ctrl+Shift+P keyboard shortcut
 */

interface Metric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  unit: string;
}

const thresholds: Record<string, { good: number; poor: number }> = {
  LCP: { good: 2500, poor: 4000 },
  FCP: { good: 1800, poor: 3000 },
  CLS: { good: 0.1, poor: 0.25 },
  INP: { good: 200, poor: 500 },
  TTFB: { good: 800, poor: 1800 },
};

function getRating(name: string, value: number): "good" | "needs-improvement" | "poor" {
  const t = thresholds[name];
  if (!t) return "good";
  if (value <= t.good) return "good";
  if (value <= t.poor) return "needs-improvement";
  return "poor";
}

const ratingColors = {
  good: { bg: "bg-emerald-500/10", text: "text-emerald-600", dot: "bg-emerald-500" },
  "needs-improvement": { bg: "bg-amber-500/10", text: "text-amber-600", dot: "bg-amber-500" },
  poor: { bg: "bg-red-500/10", text: "text-red-600", dot: "bg-red-500" },
};

const metricIcons: Record<string, typeof Activity> = {
  LCP: Gauge,
  FCP: Timer,
  CLS: BarChart3,
  INP: MousePointer,
  TTFB: Activity,
};

export function PerformanceMonitor() {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState<Map<string, Metric>>(new Map());
  const [memoryInfo, setMemoryInfo] = useState<{ used: number; total: number } | null>(null);

  const updateMetric = useCallback((name: string, value: number, unit: string) => {
    setMetrics((prev) => {
      const next = new Map(prev);
      next.set(name, { name, value, rating: getRating(name, value), unit });
      return next;
    });
  }, []);

  // Core Web Vitals observers
  useEffect(() => {
    // LCP
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) updateMetric("LCP", lastEntry.startTime, "ms");
      });
      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
    } catch {}

    // FCP
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === "first-contentful-paint") {
            updateMetric("FCP", entry.startTime, "ms");
          }
        }
      });
      fcpObserver.observe({ type: "paint", buffered: true });
    } catch {}

    // CLS
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
            updateMetric("CLS", clsValue, "");
          }
        }
      });
      clsObserver.observe({ type: "layout-shift", buffered: true });
    } catch {}

    // INP (approximated via event timing)
    try {
      const inpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const duration = (entry as any).duration;
          if (duration > 0) {
            updateMetric("INP", duration, "ms");
          }
        }
      });
      inpObserver.observe({ type: "event", buffered: true });
    } catch {}

    // TTFB
    try {
      const navEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
      if (navEntries.length > 0) {
        const ttfb = navEntries[0].responseStart - navEntries[0].requestStart;
        updateMetric("TTFB", Math.max(0, ttfb), "ms");
      }
    } catch {}
  }, [updateMetric]);

  // Memory info (Chrome only)
  useEffect(() => {
    if (!isVisible) return;
    const updateMemory = () => {
      const perf = performance as any;
      if (perf.memory) {
        setMemoryInfo({
          used: Math.round(perf.memory.usedJSHeapSize / 1048576),
          total: Math.round(perf.memory.jsHeapSizeLimit / 1048576),
        });
      }
    };
    updateMemory();
    const interval = setInterval(updateMemory, 2000);
    return () => clearInterval(interval);
  }, [isVisible]);

  // Keyboard shortcut: Ctrl+Shift+P
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "P") {
        e.preventDefault();
        setIsVisible((v) => !v);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Don't render in production
  if (!import.meta.env.DEV) return null;

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-[9999] w-9 h-9 bg-[#1a1a2e] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform opacity-40 hover:opacity-100"
        title="Performance Monitor (Ctrl+Shift+P)"
        aria-label="Mo Performance Monitor"
      >
        <Activity className="w-4 h-4" />
      </button>
    );
  }

  const metricsArray = Array.from(metrics.values());
  const orderedNames = ["LCP", "FCP", "CLS", "INP", "TTFB"];
  const sortedMetrics = orderedNames
    .map((name) => metricsArray.find((m) => m.name === name))
    .filter(Boolean) as Metric[];

  return (
    <div className="fixed bottom-4 right-4 z-[9999] w-72 bg-white dark:bg-[#1a1c24] rounded-2xl shadow-2xl shadow-black/20 border border-gray-200/80 dark:border-white/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-primary" />
          <span className="text-[16px] text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 700 }}>
            Web Vitals
          </span>
          <span className="text-[9px] text-muted-foreground bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded" style={{ fontWeight: 600 }}>
            DEV
          </span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Dong Performance Monitor"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Metrics */}
      <div className="p-3 space-y-2">
        {sortedMetrics.length === 0 && (
          <p className="text-[15px] text-muted-foreground text-center py-3">Dang thu thap du lieu...</p>
        )}
        {sortedMetrics.map((metric) => {
          const colors = ratingColors[metric.rating];
          const Icon = metricIcons[metric.name] || Activity;
          return (
            <div
              key={metric.name}
              className={`flex items-center justify-between px-3 py-2 rounded-xl ${colors.bg}`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-3.5 h-3.5 ${colors.text}`} />
                <span className="text-[11.5px] text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 600 }}>
                  {metric.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[16px] ${colors.text}`} style={{ fontWeight: 700 }}>
                  {metric.name === "CLS"
                    ? metric.value.toFixed(3)
                    : Math.round(metric.value)}
                  {metric.unit && <span className="text-[16px] ml-0.5 opacity-70">{metric.unit}</span>}
                </span>
                <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
              </div>
            </div>
          );
        })}

        {/* Memory info */}
        {memoryInfo && (
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-blue-500/10">
            <span className="text-[11.5px] text-blue-600" style={{ fontWeight: 600 }}>
              JS Heap
            </span>
            <span className="text-[16px] text-blue-600" style={{ fontWeight: 700 }}>
              {memoryInfo.used}
              <span className="text-[16px] opacity-70">/{memoryInfo.total} MB</span>
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-100 dark:border-white/5">
        <p className="text-[9px] text-muted-foreground text-center">
          Ctrl+Shift+P to toggle
        </p>
      </div>
    </div>
  );
}


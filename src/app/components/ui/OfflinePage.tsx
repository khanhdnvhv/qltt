import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { WifiOff, RefreshCw, BookOpen, Download, Headphones, FileText } from "lucide-react";

/**
 * OfflinePage - Full-page offline experience
 * Shows when user is offline and trying to navigate to uncached routes
 * Features:
 * - Auto-detect when connection restores
 * - Manual retry button
 * - Offline study tips (educational value even when offline)
 * - Cached content shortcuts
 */

export function OfflinePage() {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    setRetryCount((c) => c + 1);

    try {
      // Try fetching a tiny resource to test connectivity
      await fetch("/", { method: "HEAD", cache: "no-store" });
      // If successful, reload the page
      window.location.reload();
    } catch {
      // Still offline
      setIsRetrying(false);
    }
  }, []);

  // Auto-retry when online event fires
  useEffect(() => {
    const handleOnline = () => {
      window.location.reload();
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  const studyTips = [
    {
      icon: BookOpen,
      title: "On tap tu vung",
      description: "Viet ra 10 tu vung IELTS ban da hoc gan day va dat cau voi chung.",
    },
    {
      icon: Headphones,
      title: "Luyen Speaking",
      description: "Tu noi ve mot chu de IELTS Part 2 trong 2 phut. Ghi am lai de nghe.",
    },
    {
      icon: FileText,
      title: "Luyen Writing",
      description: "Viet mot doan van 150 tu mo ta xu huong tang/giam (Task 1).",
    },
    {
      icon: Download,
      title: "Ghi chu loi sai",
      description: "Liet ke nhung loi thuong gap trong bai thi gan nhat de tranh lap lai.",
    },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full text-center">
        {/* Offline icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-6"
        >
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 rounded-3xl" />
            <div className="absolute inset-0 flex items-center justify-center">
              <WifiOff className="w-9 h-9 text-primary" />
            </div>
            {/* Pulsing ring */}
            <motion.div
              className="absolute inset-0 border-2 border-primary/20 rounded-3xl"
              animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h1
            className="text-[24px] sm:text-[28px] text-[#1a1a2e] dark:text-foreground mb-2 tracking-tight"
            style={{ fontWeight: 800 }}
          >
            Không có kết nối mạng
          </h1>
          <p className="text-muted-foreground text-[16px] max-w-sm mx-auto leading-relaxed">
            Vui lòng kiểm tra lại kết nối internet của bạn.
            Trang se tu dong tai lai khi co ket noi.
          </p>
        </motion.div>

        {/* Retry button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary/90 text-white px-6 py-3 rounded-2xl text-[16px] shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            style={{ fontWeight: 600 }}
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`} />
            {isRetrying ? "Dang thu lai..." : "Thu lai"}
          </button>
          {retryCount > 0 && !isRetrying && (
            <p className="text-[16px] text-muted-foreground mt-2">
              Da thu {retryCount} lan. Ket noi van chua kha dung.
            </p>
          )}
        </motion.div>

        {/* Study tips while offline */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-10"
        >
          <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-5 text-left shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <p className="text-[15px] text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 700 }}>
                Luyen tap offline
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {studyTips.map((tip, i) => (
                <motion.div
                  key={tip.title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-[#f8f9fb] dark:bg-[#0c0e14] border border-gray-50 dark:border-border/50"
                >
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-card flex items-center justify-center shrink-0 border border-gray-100 dark:border-border">
                    <tip.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[16px] text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 600 }}>
                      {tip.title}
                    </p>
                    <p className="text-[11.5px] text-muted-foreground leading-relaxed mt-0.5">
                      {tip.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Connection status indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 flex items-center justify-center gap-2 text-[16px] text-muted-foreground"
        >
          <motion.div
            className="w-2 h-2 rounded-full bg-red-400"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          Dang cho ket noi...
        </motion.div>
      </div>
    </div>
  );
}


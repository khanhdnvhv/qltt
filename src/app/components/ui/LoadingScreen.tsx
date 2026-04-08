import { motion } from "motion/react";

/**
 * Full-page loading screen used as Suspense fallback for lazy-loaded routes
 */
export function LoadingScreen() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-5"
      >
        {/* Logo pulse */}
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-white text-[18px] shadow-lg shadow-primary/20"
          style={{ fontWeight: 800 }}
        >
          IP
        </motion.div>

        {/* Loading bar */}
        <div className="w-48 h-1 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            style={{ width: "40%" }}
          />
        </div>

        <p className="text-[15px] text-muted-foreground" style={{ fontWeight: 500 }}>
          Dang tai...
        </p>
      </motion.div>
    </div>
  );
}

/**
 * Inline loading spinner for smaller areas
 */
export function LoadingSpinner({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizeClasses = {
    sm: "w-4 h-4 border-[1.5px]",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-2",
  };

  return (
    <div
      className={`${sizeClasses[size]} border-primary/20 border-t-primary rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Dang tai"
    />
  );
}

/**
 * Top progress bar for page transitions
 */
export function TopProgressBar({ isLoading }: { isLoading: boolean }) {
  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[2.5px]">
      <motion.div
        className="h-full bg-gradient-to-r from-primary via-accent to-primary rounded-r-full"
        initial={{ width: "0%" }}
        animate={{ width: ["0%", "30%", "60%", "85%"] }}
        transition={{ duration: 2, ease: "easeOut" }}
      />
    </div>
  );
}


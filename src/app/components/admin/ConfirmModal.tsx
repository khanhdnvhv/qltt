import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, Info, X } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "danger" = red confirm button, "warning" = amber, "default" = primary */
  variant?: "danger" | "warning" | "default";
  /** Show loading state on confirm button */
  loading?: boolean;
  /** Optional content rendered between description and buttons */
  children?: React.ReactNode;
}

const variantStyles = {
  danger: {
    icon: AlertTriangle,
    iconBg: "bg-red-50 dark:bg-red-500/10",
    iconColor: "text-red-600 dark:text-red-400",
    btnBg: "bg-red-600 hover:bg-red-700",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-amber-50 dark:bg-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
    btnBg: "bg-amber-600 hover:bg-amber-700",
  },
  default: {
    icon: Info,
    iconBg: "bg-primary/[0.06] dark:bg-primary/10",
    iconColor: "text-primary",
    btnBg: "bg-primary hover:bg-primary/90",
  },
};

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Xac nhan",
  cancelLabel = "Huy",
  variant = "default",
  loading = false,
  children,
}: ConfirmModalProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const vs = variantStyles[variant];

  // Auto-focus confirm button when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => confirmRef.current?.focus(), 80);
    }
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-[70]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 28, stiffness: 400 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-[420px] bg-white dark:bg-card rounded-2xl shadow-2xl border border-gray-100 dark:border-border z-[70] overflow-hidden"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            aria-describedby={description ? "confirm-modal-desc" : undefined}
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${vs.iconBg}`}>
                  <vs.icon className={`w-5 h-5 ${vs.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 id="confirm-modal-title" className="text-[15px] text-[#1a1a2e] dark:text-foreground mb-1" style={{ fontWeight: 700 }}>
                    {title}
                  </h3>
                  {description && (
                    <p id="confirm-modal-desc" className="text-[15px] text-muted-foreground leading-relaxed">
                      {description}
                    </p>
                  )}
                </div>
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 shrink-0" aria-label="Dong">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              {children && (
                <div className="mt-4">{children}</div>
              )}
            </div>
            <div className="flex items-center gap-3 px-6 pb-6">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-[15px] text-muted-foreground bg-[#f4f5f7] dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                style={{ fontWeight: 500 }}
                disabled={loading}
              >
                {cancelLabel}
              </button>
              <button
                ref={confirmRef}
                onClick={onConfirm}
                disabled={loading}
                className={`flex-1 py-2.5 rounded-xl text-[15px] text-white ${vs.btnBg} shadow-sm hover:shadow-md transition-all disabled:opacity-60`}
                style={{ fontWeight: 600 }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Dang xu ly...
                  </span>
                ) : (
                  confirmLabel
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

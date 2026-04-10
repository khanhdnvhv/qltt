import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell, UserPlus, CreditCard, AlertTriangle,
  BookOpen, CheckCircle, X, Check, ExternalLink, FileText,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useAppData, type AppNotifType } from "../../context/AppDataContext";

const typeConfig: Record<AppNotifType, { icon: React.ElementType; color: string; bg: string }> = {
  plan_approved: { icon: CheckCircle, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
  plan_rejected: { icon: AlertTriangle, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-500/10" },
  plan_revision: { icon: FileText, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10" },
  system:        { icon: AlertTriangle, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-500/10" },
  fee:           { icon: CreditCard, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
  student:       { icon: UserPlus, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-500/10" },
};

function formatRelativeTime(isoTime: string): string {
  const diff = Date.now() - new Date(isoTime).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.floor(hours / 24)} ngày trước`;
}

export function NotificationCenter() {
  const { notifications, markNotificationRead, markAllNotificationsRead, removeNotification } = useAppData();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const displayed = filter === "unread"
    ? notifications.filter((n) => !n.read)
    : notifications;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const handleClick = useCallback((notif: { id: string; read: boolean; link?: string }) => {
    markNotificationRead(notif.id);
    if (notif.link) {
      navigate(notif.link);
      setOpen(false);
    }
  }, [markNotificationRead, navigate]);

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell trigger */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        aria-label={`Thông báo${unreadCount > 0 ? ` (${unreadCount} chưa đọc)` : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <motion.span
            key={unreadCount}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[16px] rounded-full flex items-center justify-center"
            style={{ fontWeight: 700 }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: "spring", damping: 28, stiffness: 400 }}
            className="absolute right-0 top-full mt-2 w-[380px] max-w-[calc(100vw-32px)] bg-white dark:bg-card rounded-2xl shadow-2xl border border-gray-100 dark:border-border z-50 overflow-hidden flex flex-col"
            style={{ maxHeight: "70vh" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-border">
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 700 }}>Thông báo</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[16px] rounded-full" style={{ fontWeight: 700 }}>
                    {unreadCount} mới
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllNotificationsRead}
                  className="text-[11.5px] text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                  style={{ fontWeight: 500 }}
                >
                  <CheckCircle className="w-3 h-3" /> Đọc tất cả
                </button>
              )}
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-1 px-5 py-2 border-b border-gray-100 dark:border-border">
              {(["all", "unread"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-[16px] transition-colors ${
                    filter === f
                      ? "bg-primary/[0.08] text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-gray-50 dark:hover:bg-white/5"
                  }`}
                  style={{ fontWeight: filter === f ? 600 : 500 }}
                >
                  {f === "all" ? "Tất cả" : `Chưa đọc (${unreadCount})`}
                </button>
              ))}
            </div>

            {/* Notification list */}
            <div className="overflow-y-auto flex-1" style={{ maxHeight: "50vh" }}>
              {displayed.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 px-5">
                  <Bell className="w-8 h-8 text-muted-foreground/20 mb-3" />
                  <p className="text-[15px] text-muted-foreground">Không có thông báo</p>
                </div>
              )}

              {displayed.map((notif, i) => {
                const tc = typeConfig[notif.type];
                return (
                  <motion.div
                    key={notif.id}
                    initial={i < 3 ? { opacity: 0, x: -10 } : false}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i < 3 ? i * 0.04 : 0 }}
                    className={`flex items-start gap-3 px-5 py-3.5 border-b border-gray-50 dark:border-border/30 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group relative ${!notif.read ? "bg-primary/[0.02] dark:bg-primary/[0.03]" : ""}`}
                    onClick={() => handleClick(notif)}
                  >
                    {/* Unread dot */}
                    {!notif.read && (
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
                    )}

                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${tc.bg}`}>
                      <tc.icon className={`w-4 h-4 ${tc.color}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-[16px] ${!notif.read ? "text-[#1a1a2e] dark:text-foreground" : "text-muted-foreground"}`} style={{ fontWeight: !notif.read ? 600 : 500 }}>
                          {notif.title}
                        </p>
                        <span className="text-[16px] text-muted-foreground/50 shrink-0 mt-0.5">{formatRelativeTime(notif.time)}</span>
                      </div>
                      <p className="text-[11.5px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                      {notif.link && (
                        <span className="inline-flex items-center gap-0.5 text-[16px] text-primary/60 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ExternalLink className="w-2.5 h-2.5" /> Xem chi tiết
                        </span>
                      )}
                    </div>

                    {/* Actions (show on hover) */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      {!notif.read && (
                        <button
                          onClick={(e) => { e.stopPropagation(); markNotificationRead(notif.id); }}
                          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-white/5"
                          title="Đánh dấu đã đọc"
                          aria-label="Đánh dấu đã đọc"
                        >
                          <Check className="w-3 h-3 text-emerald-600" />
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); removeNotification(notif.id); }}
                        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-white/5"
                        title="Xóa"
                        aria-label="Xóa thông báo"
                      >
                        <X className="w-3 h-3 text-muted-foreground" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 dark:border-border px-5 py-3 text-center">
              <button
                onClick={() => { navigate("/admin/notifications"); setOpen(false); }}
                className="text-[16px] text-primary hover:text-primary/80 transition-colors"
                style={{ fontWeight: 600 }}
              >
                Xem tất cả thông báo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell, UserPlus, CreditCard, MessageSquare, AlertTriangle,
  BookOpen, CheckCircle, X, Check, ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router";

type NotifType = "user" | "order" | "review" | "system" | "course";

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
}

const typeConfig: Record<NotifType, { icon: React.ElementType; color: string; bg: string }> = {
  user: { icon: UserPlus, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
  order: { icon: CreditCard, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
  review: { icon: MessageSquare, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10" },
  system: { icon: AlertTriangle, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-500/10" },
  course: { icon: BookOpen, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-500/10" },
};

const initialNotifications: Notification[] = [
  { id: "n1", type: "user", title: "Hoc vien moi dang ky", message: "Nguyen Van Minh vua dang ky tai khoan va ghi danh khoa IELTS Foundation.", time: "2 phut truoc", read: false, link: "/admin/users" },
  { id: "n2", type: "order", title: "Don hang moi", message: "Don #ORD-2026-041 da thanh toan thanh cong (3.500.000).", time: "15 phut truoc", read: false, link: "/admin/orders" },
  { id: "n3", type: "review", title: "Danh gia moi", message: "Tran Thi Lan danh gia 5 sao cho khoa IELTS Writing Intensive.", time: "32 phut truoc", read: false, link: "/admin/reviews" },
  { id: "n4", type: "system", title: "Canh bao he thong", message: "Luu luong truy cap tang 150% trong 1 gio qua. Kiem tra server.", time: "1 gio truoc", read: false },
  { id: "n5", type: "course", title: "Khoa hoc sap het slot", message: "IELTS Master 8.0+ chi con 3 slot trong, can xem xet mo them lop.", time: "2 gio truoc", read: true, link: "/admin/courses" },
  { id: "n6", type: "order", title: "Hoan tien yeu cau", message: "Hoc vien Le Hoang yeu cau hoan tien don #ORD-2026-038.", time: "3 gio truoc", read: true, link: "/admin/orders" },
  { id: "n7", type: "user", title: "Giang vien cap nhat ho so", message: "Giang vien Pham Duc da cap nhat thong tin ca nhan va chung chi.", time: "5 gio truoc", read: true, link: "/admin/users" },
  { id: "n8", type: "review", title: "Danh gia can duyet", message: "3 danh gia moi dang cho duyet trong hang doi.", time: "6 gio truoc", read: true, link: "/admin/reviews" },
];

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
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

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const removeNotif = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const handleClick = useCallback((notif: Notification) => {
    markAsRead(notif.id);
    if (notif.link) {
      navigate(notif.link);
      setOpen(false);
    }
  }, [markAsRead, navigate]);

  // Simulate incoming notification every 45 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      const newNotifs: Notification[] = [
        { id: `live-${Date.now()}`, type: "user", title: "Hoc vien moi", message: "Mot hoc vien moi vua dang ky tai khoan.", time: "Vua xong", read: false, link: "/admin/users" },
        { id: `live-${Date.now()}`, type: "order", title: "Thanh toan moi", message: "Don hang moi da duoc thanh toan thanh cong.", time: "Vua xong", read: false, link: "/admin/orders" },
      ];
      const pick = newNotifs[Math.floor(Math.random() * newNotifs.length)];
      setNotifications((prev) => [{ ...pick, id: `live-${Date.now()}` }, ...prev].slice(0, 20));
    }, 45000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell trigger */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        aria-label={`Thong bao${unreadCount > 0 ? ` (${unreadCount} chua doc)` : ""}`}
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
                <h3 className="text-[15px] text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 700 }}>Thong bao</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[16px] rounded-full" style={{ fontWeight: 700 }}>
                    {unreadCount} moi
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11.5px] text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                  style={{ fontWeight: 500 }}
                >
                  <CheckCircle className="w-3 h-3" /> Doc tat ca
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
                  {f === "all" ? "Tat ca" : `Chua doc (${unreadCount})`}
                </button>
              ))}
            </div>

            {/* Notification list */}
            <div className="overflow-y-auto flex-1" style={{ maxHeight: "50vh" }}>
              {displayed.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 px-5">
                  <Bell className="w-8 h-8 text-muted-foreground/20 mb-3" />
                  <p className="text-[15px] text-muted-foreground">Khong co thong bao</p>
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
                        <span className="text-[16px] text-muted-foreground/50 shrink-0 mt-0.5">{notif.time}</span>
                      </div>
                      <p className="text-[11.5px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                      {notif.link && (
                        <span className="inline-flex items-center gap-0.5 text-[16px] text-primary/60 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ExternalLink className="w-2.5 h-2.5" /> Xem chi tiet
                        </span>
                      )}
                    </div>

                    {/* Actions (show on hover) */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      {!notif.read && (
                        <button
                          onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }}
                          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-white/5"
                          title="Danh dau da doc"
                          aria-label="Danh dau da doc"
                        >
                          <Check className="w-3 h-3 text-emerald-600" />
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); removeNotif(notif.id); }}
                        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-white/5"
                        title="Xoa"
                        aria-label="Xoa thong bao"
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
                Xem tat ca thong bao
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


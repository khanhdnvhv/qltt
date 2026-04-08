import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useClickOutside } from "../utils/hooks";
import { Link } from "react-router";
import {
  Bell, MessageSquare, Heart, Award, BookOpen, Users,
  Zap, AlertCircle, Check, CheckCheck, ChevronRight,
  X, Settings, Volume2, VolumeX,
} from "lucide-react";

interface NotifItem {
  id: number;
  type: "reply" | "like" | "badge" | "course" | "system" | "mention";
  title: string;
  time: string;
  read: boolean;
  link?: string;
}

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  reply: { icon: MessageSquare, color: "#3b82f6", bg: "bg-blue-50 dark:bg-blue-500/10" },
  like: { icon: Heart, color: "#ef4444", bg: "bg-red-50 dark:bg-red-500/10" },
  badge: { icon: Award, color: "#f59e0b", bg: "bg-amber-50 dark:bg-amber-500/10" },
  course: { icon: BookOpen, color: "#10b981", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
  system: { icon: AlertCircle, color: "#6b7280", bg: "bg-gray-50 dark:bg-gray-500/10" },
  mention: { icon: Zap, color: "#f26522", bg: "bg-orange-50 dark:bg-orange-500/10" },
};

const initialNotifs: NotifItem[] = [
  { id: 1, type: "badge", title: "Ban dat huy hieu 7-Day Streak! ðŸ”¥", time: "5p truoc", read: false, link: "/leaderboard" },
  { id: 2, type: "course", title: "Bai hoc moi: Speaking Part 2 da san sang", time: "30p truoc", read: false, link: "/dashboard" },
  { id: 3, type: "reply", title: "Tran Van B da tra loi bai dang cua ban", time: "1g truoc", read: false, link: "/community" },
  { id: 4, type: "like", title: "15 nguoi thich bai dang cua ban", time: "2g truoc", read: true },
  { id: 5, type: "system", title: "He thong cap nhat tinh nang Listening Practice", time: "3g truoc", read: true },
  { id: 6, type: "mention", title: "Pham Thu Ha da nhac den ban trong 1 bai viet", time: "5g truoc", read: true, link: "/community" },
];

export function StudentNotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifs, setNotifs] = useState<NotifItem[]>(initialNotifs);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setIsOpen(false));

  const unreadCount = notifs.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: number) => {
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const removeNotif = (id: number) => {
    setNotifs((prev) => prev.filter((n) => n.id !== id));
  };

  // Simulate new notification every 45s
  useEffect(() => {
    const interval = setInterval(() => {
      const types = ["reply", "like", "badge", "course", "system", "mention"] as const;
      const titles: Record<string, string[]> = {
        reply: ["Nguyen A da tra loi binh luan cua ban", "Le B da binh luan bai viet cua ban"],
        like: ["Bai dang cua ban duoc 5 luot thich moi", "Quiz cua ban duoc 3 luot thich"],
        badge: ["Ban mo khoa huy hieu Reading Master!", "Ban len level moi: Level 5!"],
        course: ["Bai hoc Writing Task 2 da san sang", "Quiz moi: Listening Section 3"],
        system: ["Khuyen mai 20% cho khoa IELTS Advanced", "Cap nhat moi: Vocabulary Builder"],
        mention: ["Hoang C nhac den ban trong bai thao luan", "Vo D tag ban trong nhom hoc"],
      };
      const type = types[Math.floor(Math.random() * types.length)];
      const titleList = titles[type];
      const title = titleList[Math.floor(Math.random() * titleList.length)];
      setNotifs((prev) => [
        { id: Date.now(), type, title, time: "Vua xong", read: false },
        ...prev,
      ].slice(0, 15));
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary text-white text-[9px] flex items-center justify-center"
              style={{ fontWeight: 700 }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-[360px] max-h-[480px] bg-white dark:bg-card border border-gray-200 dark:border-border rounded-2xl shadow-xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 dark:border-border">
              <div className="flex items-center gap-2">
                <h3 className="text-[16px] text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 700 }}>Thong bao</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[16px]" style={{ fontWeight: 700 }}>{unreadCount} moi</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-muted-foreground transition-colors"
                  title={soundEnabled ? "Tat am" : "Bat am"}
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-muted-foreground transition-colors"
                    title="Doc tat ca"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Notification list */}
            <div className="max-h-[350px] overflow-auto">
              {notifs.length === 0 ? (
                <div className="text-center py-10">
                  <Bell className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                  <p className="text-[15px] text-muted-foreground">Khong co thong bao</p>
                </div>
              ) : (
                <div>
                  {notifs.map((n) => {
                    const tc = typeConfig[n.type];
                    const Icon = tc.icon;
                    return (
                      <div
                        key={n.id}
                        className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group cursor-pointer border-b border-gray-50 dark:border-border/30 ${!n.read ? "bg-primary/[0.02] dark:bg-primary/[0.03]" : ""}`}
                        onClick={() => markRead(n.id)}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${tc.bg}`}>
                          <Icon className="w-4 h-4" style={{ color: tc.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[16px] text-[#1a1a2e] dark:text-foreground leading-relaxed ${!n.read ? "" : "opacity-70"}`} style={{ fontWeight: n.read ? 400 : 600 }}>
                            {n.title}
                          </p>
                          <p className="text-[16px] text-muted-foreground mt-0.5">{n.time}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!n.read && <div className="w-2 h-2 rounded-full bg-primary" />}
                          <button
                            onClick={(e) => { e.stopPropagation(); removeNotif(n.id); }}
                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-white/10 text-muted-foreground"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 dark:border-border px-4 py-3">
              <Link
                to="/notifications"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-1.5 text-[16px] text-primary hover:text-primary/80 transition-colors"
                style={{ fontWeight: 600 }}
              >
                Xem tat ca thong bao <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


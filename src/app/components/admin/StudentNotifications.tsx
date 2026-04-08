import { useDocumentTitle } from "../../utils/hooks";
import { useState } from "react";
import { Bell, CheckCheck, Trash2, ChevronRight, BookOpen, Calendar, AlertCircle, Info, Award, Clock, CreditCard } from "lucide-react";

type NotifType = "course" | "exam" | "fee" | "schedule" | "system" | "result";

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  priority: "high" | "normal" | "low";
  actionLabel?: string;
}

const typeCfg: Record<NotifType, { icon: React.ElementType; bg: string; iconColor: string; label: string }> = {
  course:   { icon: BookOpen,    bg: "bg-orange-100 dark:bg-orange-500/20",  iconColor: "text-orange-600",  label: "Khóa học"  },
  exam:     { icon: Award,       bg: "bg-violet-100 dark:bg-violet-500/20",  iconColor: "text-violet-600",  label: "Kỳ thi"    },
  fee:      { icon: CreditCard,  bg: "bg-rose-100 dark:bg-rose-500/20",      iconColor: "text-rose-600",    label: "Học phí"   },
  schedule: { icon: Calendar,    bg: "bg-blue-100 dark:bg-blue-500/20",      iconColor: "text-blue-600",    label: "Lịch học"  },
  system:   { icon: Info,        bg: "bg-gray-100 dark:bg-white/10",         iconColor: "text-gray-500",    label: "Hệ thống"  },
  result:   { icon: AlertCircle, bg: "bg-emerald-100 dark:bg-emerald-500/20",iconColor: "text-emerald-600", label: "Kết quả"   },
};

const mockNotifications: Notification[] = [
  { id: "1",  type: "fee",      priority: "high",   read: false, time: "09:00 hôm nay",       title: "Nhắc nhở học phí tháng 4",                  body: "Học phí tháng 04/2026 đến hạn ngày 15/04. Vui lòng thanh toán đúng hạn để tránh bị tạm dừng học.", actionLabel: "Thanh toán ngay" },
  { id: "2",  type: "exam",     priority: "high",   read: false, time: "07:30 hôm nay",       title: "Kỳ thi VSTEP B1 — 20/04/2026",               body: "Bạn đã đăng ký kỳ thi VSTEP B1 ngày 20/04/2026. Phòng thi A201, ca 07:30. Mang CMND và thẻ học viên." },
  { id: "3",  type: "result",   priority: "high",   read: false, time: "Hôm qua 15:00",       title: "Điểm kiểm tra Unit 6 đã có",                 body: "Bài kiểm tra Unit 6 đã được chấm điểm. Bạn đạt 19/20 điểm — Xuất sắc!" },
  { id: "4",  type: "course",   priority: "normal", read: false, time: "Hôm qua 08:00",       title: "Tài liệu Unit 7 đã được tải lên",            body: "GV. Nguyễn Thị Lan đã đăng tài liệu Unit 7 – Technology & Innovation. Vui lòng tải về trước buổi học." },
  { id: "5",  type: "schedule", priority: "normal", read: true,  time: "04/04/2026",          title: "Thay đổi phòng học ngày 10/04",              body: "Buổi học ngày 10/04/2026 chuyển từ Phòng A101 sang Phòng A102 do bảo trì thiết bị." },
  { id: "6",  type: "exam",     priority: "normal", read: true,  time: "01/04/2026",          title: "Lịch thi thử VSTEP B1 lần 2",                body: "Thi thử VSTEP B1 lần 2 sẽ diễn ra ngày 15/04/2026 tại Phòng B301. Đây là kỳ thi thử miễn phí." },
  { id: "7",  type: "fee",      priority: "low",    read: true,  time: "28/03/2026",          title: "Xác nhận thanh toán học phí tháng 3",        body: "Đã nhận thanh toán 1.500.000 VND học phí tháng 03/2026. Biên lai: TT-2026-0318." },
  { id: "8",  type: "result",   priority: "normal", read: true,  time: "25/03/2026",          title: "Kết quả thi thử VSTEP lần 1",                body: "Điểm thi thử VSTEP B1 lần 1: 6.75/10 — Xếp loại Khá. Tốt lắm! Tiếp tục cố gắng để đạt mục tiêu." },
  { id: "9",  type: "course",   priority: "low",    read: true,  time: "20/03/2026",          title: "Khai giảng khóa luyện phát âm miễn phí",     body: "Trung tâm tổ chức buổi luyện phát âm miễn phí ngày 25/03. Đăng ký tại văn phòng trước 22/03." },
  { id: "10", type: "system",   priority: "low",    read: true,  time: "15/03/2026",          title: "Nâng cấp ứng dụng v2.5",                     body: "App đã được cập nhật. Tính năng mới: xem điểm online, đặt lịch tư vấn với giáo viên." },
];

type Filter = "all" | "unread" | NotifType;

export function StudentNotifications() {
  useDocumentTitle("Thông báo");
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Notification | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const filtered = notifications.filter(n => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    return n.type === filter;
  });

  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const deleteNotif = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (selected?.id === id) setSelected(null);
  };
  const handleOpen = (n: Notification) => { setSelected(n); markRead(n.id); };

  return (
    <div className="pb-10">
      <div className="relative mb-6 p-6 rounded-2xl overflow-hidden bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: "28px 28px" }} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-orange-200 text-[13px] font-semibold mb-1 uppercase">Cổng Học viên</p>
            <h1 className="text-[24px] font-extrabold flex items-center gap-2">
              Thông báo
              {unreadCount > 0 && <span className="text-[14px] font-bold bg-white/20 px-2.5 py-0.5 rounded-full">{unreadCount} mới</span>}
            </h1>
            <p className="text-orange-100/70 text-[14px] mt-1">Cập nhật về lịch học, kỳ thi và học phí</p>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl text-[14px] font-semibold transition-colors">
              <CheckCheck className="w-4 h-4" /> Đánh dấu đã đọc tất cả
            </button>
          )}
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {([["all", "Tất cả"], ["unread", "Chưa đọc"], ["course", "Khóa học"], ["exam", "Kỳ thi"], ["fee", "Học phí"], ["schedule", "Lịch học"], ["result", "Kết quả"]] as [Filter, string][]).map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} className={`px-3 py-1.5 rounded-xl text-[13px] font-semibold transition-all ${filter === v ? "bg-orange-500 text-white" : "bg-white dark:bg-card border border-gray-200 dark:border-border text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/5"}`}>
            {l}
            {v === "unread" && unreadCount > 0 && <span className="ml-1 text-[11px] bg-rose-500 text-white rounded-full px-1.5">{unreadCount}</span>}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* List */}
        <div className="lg:col-span-2 bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Không có thông báo nào</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-white/[0.03]">
              {filtered.map(n => {
                const cfg = typeCfg[n.type];
                const Icon = cfg.icon;
                return (
                  <div key={n.id} onClick={() => handleOpen(n)}
                    className={`flex items-start gap-3 px-4 py-4 cursor-pointer transition-colors hover:bg-gray-50/70 dark:hover:bg-white/[0.03] ${selected?.id === n.id ? "bg-orange-50/50 dark:bg-orange-500/5" : ""}`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg}`}>
                      <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-[14px] leading-snug ${n.read ? "font-medium" : "font-bold"} text-[#1a1a2e] dark:text-foreground`}>
                          {!n.read && <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mr-1.5 mb-0.5" />}
                          {n.title}
                        </p>
                        <button onClick={e => { e.stopPropagation(); deleteNotif(n.id); }} className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors shrink-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[12px] text-muted-foreground mt-0.5 line-clamp-1">{n.body}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-medium ${cfg.bg} ${cfg.iconColor}`}>{cfg.label}</span>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-0.5"><Clock className="w-3 h-3" />{n.time}</span>
                        {n.priority === "high" && <span className="text-[11px] font-semibold text-rose-500">Quan trọng</span>}
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-muted-foreground shrink-0 mt-1 transition-transform ${selected?.id === n.id ? "rotate-90" : ""}`} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail */}
        <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-5">
          {selected ? (
            <>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${typeCfg[selected.type].bg}`}>
                {(() => { const I = typeCfg[selected.type].icon; return <I className={`w-6 h-6 ${typeCfg[selected.type].iconColor}`} />; })()}
              </div>
              <span className={`text-[12px] font-semibold px-2 py-0.5 rounded-md ${typeCfg[selected.type].bg} ${typeCfg[selected.type].iconColor}`}>{typeCfg[selected.type].label}</span>
              <h3 className="text-[16px] font-bold text-[#1a1a2e] dark:text-foreground mt-3 mb-2">{selected.title}</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">{selected.body}</p>
              <p className="text-[12px] text-muted-foreground flex items-center gap-1 mb-4"><Clock className="w-3.5 h-3.5" />{selected.time}</p>
              {selected.actionLabel && (
                <button className="w-full px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold text-[14px] transition-colors">
                  {selected.actionLabel}
                </button>
              )}
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <Bell className="w-10 h-10 text-muted-foreground/20 mb-3" />
              <p className="text-muted-foreground text-[14px]">Chọn một thông báo để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

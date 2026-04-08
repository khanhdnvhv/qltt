import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Users, BookOpen, ClipboardList, Calendar,
  ArrowUpRight, Clock, CheckCircle, AlertCircle,
  FileText, ChevronRight,
} from "lucide-react";
import { useDocumentTitle } from "../../utils/hooks";
import { useAuth } from "../auth/AuthContext";
import { DashboardSkeleton } from "../ui/SkeletonLoaders";

const teacherStats = [
  { icon: Users, label: "Học viên đang dạy", value: "128", change: "+4", up: true, color: "#3b82f6", bg: "from-blue-50 to-indigo-50" },
  { icon: BookOpen, label: "Lớp học phụ trách", value: "5", change: "+1", up: true, color: "#10b981", bg: "from-emerald-50 to-teal-50" },
  { icon: ClipboardList, label: "Bài kiểm tra chờ chấm", value: "12", change: "+3", up: false, color: "#f26522", bg: "from-orange-50 to-amber-50" },
  { icon: Calendar, label: "Tiết dạy tuần này", value: "18", change: "0", up: true, color: "#8b5cf6", bg: "from-purple-50 to-violet-50" },
];

const weekSchedule = [
  { day: "Thứ 2", date: "07/04", slots: [
    { time: "07:30 - 09:30", class: "Lớp Hàn điện 10A", room: "Xưởng A1", status: "done" },
    { time: "13:30 - 15:30", class: "Lớp Tin học CB 03", room: "Phòng máy B2", status: "done" },
  ]},
  { day: "Thứ 3", date: "08/04", slots: [
    { time: "07:30 - 09:30", class: "Lớp Hàn điện 10A", room: "Xưởng A1", status: "today" },
    { time: "09:45 - 11:45", class: "Lớp Điện dân dụng 05", room: "Xưởng A3", status: "today" },
  ]},
  { day: "Thứ 4", date: "09/04", slots: [
    { time: "13:30 - 15:30", class: "Lớp Tin học CB 03", room: "Phòng máy B2", status: "upcoming" },
  ]},
  { day: "Thứ 5", date: "10/04", slots: [
    { time: "07:30 - 09:30", class: "Lớp Điện dân dụng 05", room: "Xưởng A3", status: "upcoming" },
    { time: "13:30 - 15:30", class: "Lớp Hàn điện 10B", room: "Xưởng A2", status: "upcoming" },
  ]},
  { day: "Thứ 6", date: "11/04", slots: [
    { time: "09:45 - 11:45", class: "Lớp Hàn điện 10B", room: "Xưởng A2", status: "upcoming" },
  ]},
];

const pendingTests = [
  { title: "Kiểm tra giữa kỳ - Hàn điện 10A", submissions: 24, total: 28, deadline: "10/04/2026" },
  { title: "Bài tập thực hành - Điện dân dụng 05", submissions: 15, total: 22, deadline: "11/04/2026" },
  { title: "Kiểm tra lý thuyết - Tin học CB 03", submissions: 30, total: 30, deadline: "08/04/2026" },
];

const recentActivities = [
  { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50", text: "Đã điểm danh lớp Hàn điện 10A - buổi sáng", time: "2 giờ trước" },
  { icon: FileText, color: "text-blue-500", bg: "bg-blue-50", text: "Tải lên bài giảng: Kỹ thuật hàn MIG/MAG nâng cao", time: "Hôm qua" },
  { icon: AlertCircle, color: "text-orange-500", bg: "bg-orange-50", text: "3 học viên vắng mặt chưa có lý do - Tin học CB 03", time: "Hôm qua" },
  { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50", text: "Chấm xong bài kiểm tra Điện dân dụng 05 (22/22)", time: "2 ngày trước" },
];

const statusConfig = {
  done: { label: "Đã dạy", cls: "bg-gray-100 text-gray-500" },
  today: { label: "Hôm nay", cls: "bg-primary/10 text-primary" },
  upcoming: { label: "Sắp tới", cls: "bg-blue-50 text-blue-600" },
};

export function TeacherDashboard() {
  useDocumentTitle("Bảng điều khiển Giáo viên");
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  if (isLoading) return <DashboardSkeleton />;

  const todaySchedule = weekSchedule.find(d => d.slots.some(s => s.status === "today"));

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] lg:text-[28px] text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 800 }}>
            Xin chào, {user?.fullName?.split(" ").slice(-2).join(" ")} 👋
          </h1>
          <p className="text-muted-foreground text-[15.5px] mt-0.5">
            Tuần 15 • {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {teacherStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-gradient-to-br ${stat.bg} dark:from-transparent dark:to-transparent dark:bg-muted rounded-2xl p-5 border border-gray-100/50 dark:border-border`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/80 dark:bg-white/10 flex items-center justify-center shadow-sm">
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div className={`flex items-center gap-0.5 text-[13px] px-2 py-1 rounded-full ${stat.up ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-600"}`} style={{ fontWeight: 600 }}>
                <ArrowUpRight className="w-3 h-3" />
                {stat.change}
              </div>
            </div>
            <p className="text-[24px] text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 800 }}>{stat.value}</p>
            <p className="text-[14px] text-muted-foreground mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Weekly schedule */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="lg:col-span-2 bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[16px] text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 700 }}>Lịch giảng dạy tuần này</h2>
            <button className="text-[14px] text-primary hover:underline font-medium flex items-center gap-1">
              Xem đầy đủ <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {weekSchedule.map((day) => (
              <div key={day.day} className={`rounded-xl p-3 ${day.slots.some(s => s.status === "today") ? "bg-primary/5 border border-primary/20" : "bg-gray-50 dark:bg-white/5"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[13px] font-bold text-[#1a1a2e] dark:text-foreground">{day.day}</span>
                  <span className="text-[12px] text-muted-foreground">{day.date}</span>
                  {day.slots.some(s => s.status === "today") && (
                    <span className="text-[11px] bg-primary text-white px-2 py-0.5 rounded-full font-semibold ml-auto">Hôm nay</span>
                  )}
                </div>
                <div className="space-y-1.5">
                  {day.slots.map((slot, j) => {
                    const sc = statusConfig[slot.status as keyof typeof statusConfig];
                    return (
                      <div key={j} className="flex items-center gap-3 text-[13px]">
                        <span className="text-muted-foreground w-28 shrink-0 flex items-center gap-1">
                          <Clock className="w-3 h-3" />{slot.time}
                        </span>
                        <span className="font-medium text-[#1a1a2e] dark:text-foreground flex-1 truncate">{slot.class}</span>
                        <span className="text-muted-foreground hidden sm:block">{slot.room}</span>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${sc.cls}`}>{sc.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Pending tests */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-6"
          >
            <h2 className="text-[16px] text-[#1a1a2e] dark:text-foreground mb-4" style={{ fontWeight: 700 }}>Bài kiểm tra cần chấm</h2>
            <div className="space-y-4">
              {pendingTests.map((test, i) => (
                <div key={i}>
                  <div className="flex items-start justify-between mb-1.5">
                    <p className="text-[13px] font-semibold text-[#1a1a2e] dark:text-foreground leading-tight flex-1 pr-2">{test.title}</p>
                    <span className="text-[12px] text-muted-foreground shrink-0">{test.submissions}/{test.total}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(test.submissions / test.total) * 100}%` }}
                      transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                      className={`h-full rounded-full ${test.submissions === test.total ? "bg-emerald-500" : "bg-primary"}`}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">Hạn: {test.deadline}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent activity */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-6"
          >
            <h2 className="text-[16px] text-[#1a1a2e] dark:text-foreground mb-4" style={{ fontWeight: 700 }}>Hoạt động gần đây</h2>
            <div className="space-y-3">
              {recentActivities.map((act, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg ${act.bg} flex items-center justify-center shrink-0`}>
                    <act.icon className={`w-4 h-4 ${act.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-[#1a1a2e] dark:text-foreground leading-snug">{act.text}</p>
                    <p className="text-[12px] text-muted-foreground mt-0.5">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

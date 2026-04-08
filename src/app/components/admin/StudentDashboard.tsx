import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  BookOpen, Award, Calendar, Clock,
  ArrowUpRight, CheckCircle, ChevronRight,
  FileText, Bell, TrendingUp,
} from "lucide-react";
import { useDocumentTitle } from "../../utils/hooks";
import { useAuth } from "../auth/AuthContext";
import { DashboardSkeleton } from "../ui/SkeletonLoaders";

const studentStats = [
  { icon: BookOpen, label: "Khóa học đang học", value: "3", change: "+1", up: true, color: "#3b82f6", bg: "from-blue-50 to-indigo-50" },
  { icon: CheckCircle, label: "Bài học hoàn thành", value: "47", change: "+5", up: true, color: "#10b981", bg: "from-emerald-50 to-teal-50" },
  { icon: FileText, label: "Bài kiểm tra sắp tới", value: "2", change: "", up: true, color: "#f26522", bg: "from-orange-50 to-amber-50" },
  { icon: Award, label: "Chứng chỉ đã đạt", value: "1", change: "+1", up: true, color: "#8b5cf6", bg: "from-purple-50 to-violet-50" },
];

const myCourses = [
  {
    name: "Kỹ thuật Hàn điện cơ bản",
    teacher: "GV. Nguyễn Văn An",
    progress: 68,
    nextLesson: "Thứ 3, 07:30",
    color: "#3b82f6",
  },
  {
    name: "Tin học Ứng dụng Văn phòng",
    teacher: "GV. Trần Thị Lan",
    progress: 45,
    nextLesson: "Thứ 4, 13:30",
    color: "#10b981",
  },
  {
    name: "Điện dân dụng nâng cao",
    teacher: "GV. Lê Minh Tuấn",
    progress: 22,
    nextLesson: "Thứ 5, 07:30",
    color: "#f26522",
  },
];

const upcomingSchedule = [
  { day: "Thứ 3", date: "08/04", time: "07:30 - 09:30", subject: "Hàn điện cơ bản", room: "Xưởng A1", isToday: true },
  { day: "Thứ 3", date: "08/04", time: "13:30 - 15:30", subject: "Tin học VP", room: "Phòng máy B2", isToday: true },
  { day: "Thứ 4", date: "09/04", time: "13:30 - 15:30", subject: "Tin học VP", room: "Phòng máy B2", isToday: false },
  { day: "Thứ 5", date: "10/04", time: "07:30 - 09:30", subject: "Điện dân dụng", room: "Xưởng A3", isToday: false },
  { day: "Thứ 5", date: "10/04", time: "09:45 - 11:45", subject: "Hàn điện cơ bản", room: "Xưởng A1", isToday: false },
];

const notifications = [
  { icon: Bell, color: "text-blue-500", bg: "bg-blue-50", text: "Lịch kiểm tra giữa kỳ Hàn điện: 15/04/2026", time: "1 giờ trước" },
  { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50", text: "Bài tập thực hành tuần 14 đã được chấm điểm: 8.5/10", time: "Hôm qua" },
  { icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-50", text: "Xếp hạng của bạn trong lớp: Top 5 về chuyên cần", time: "2 ngày trước" },
  { icon: FileText, color: "text-orange-500", bg: "bg-orange-50", text: "Tài liệu mới: Giáo trình Hàn MIG/MAG chương 4", time: "3 ngày trước" },
];

export function StudentDashboard() {
  useDocumentTitle("Bảng điều khiển Học viên");
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] lg:text-[28px] text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 800 }}>
            Chào mừng, {user?.fullName?.split(" ").slice(-2).join(" ")} 🎓
          </h1>
          <p className="text-muted-foreground text-[15.5px] mt-0.5">
            Tuần 15 • {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {studentStats.map((stat, i) => (
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
              {stat.change && (
                <div className="flex items-center gap-0.5 text-[13px] px-2 py-1 rounded-full bg-emerald-100 text-emerald-700" style={{ fontWeight: 600 }}>
                  <ArrowUpRight className="w-3 h-3" />
                  {stat.change}
                </div>
              )}
            </div>
            <p className="text-[24px] text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 800 }}>{stat.value}</p>
            <p className="text-[14px] text-muted-foreground mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* My courses */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="lg:col-span-2 bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[16px] text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 700 }}>Khóa học của tôi</h2>
            <button className="text-[14px] text-primary hover:underline font-medium flex items-center gap-1">
              Xem tất cả <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-5">
            {myCourses.map((course, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.07 }}
                className="p-4 rounded-xl border border-gray-100 dark:border-border hover:border-primary/30 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-[15px] font-semibold text-[#1a1a2e] dark:text-foreground">{course.name}</p>
                    <p className="text-[13px] text-muted-foreground mt-0.5">{course.teacher}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground bg-gray-50 dark:bg-white/5 px-3 py-1.5 rounded-lg">
                    <Clock className="w-3.5 h-3.5" />
                    {course.nextLesson}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${course.progress}%` }}
                      transition={{ delay: 0.3 + i * 0.07, duration: 0.6 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: course.color }}
                    />
                  </div>
                  <span className="text-[13px] font-semibold text-muted-foreground w-10 text-right">{course.progress}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Upcoming schedule */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-6"
          >
            <h2 className="text-[16px] text-[#1a1a2e] dark:text-foreground mb-4" style={{ fontWeight: 700 }}>
              <Calendar className="w-4 h-4 inline mr-2 text-primary" />
              Lịch học sắp tới
            </h2>
            <div className="space-y-2.5">
              {upcomingSchedule.map((item, i) => (
                <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl text-[13px] ${item.isToday ? "bg-primary/5 border border-primary/20" : "bg-gray-50 dark:bg-white/5"}`}>
                  <div className="text-center shrink-0 w-10">
                    <p className="text-[10px] text-muted-foreground">{item.day}</p>
                    <p className="font-bold text-[#1a1a2e] dark:text-foreground text-[15px] leading-tight">{item.date.split("/")[0]}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1a1a2e] dark:text-foreground truncate">{item.subject}</p>
                    <p className="text-muted-foreground text-[12px]">{item.time} • {item.room}</p>
                  </div>
                  {item.isToday && <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded-full font-bold shrink-0">HN</span>}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-6"
          >
            <h2 className="text-[16px] text-[#1a1a2e] dark:text-foreground mb-4" style={{ fontWeight: 700 }}>Thông báo</h2>
            <div className="space-y-3">
              {notifications.map((n, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg ${n.bg} flex items-center justify-center shrink-0`}>
                    <n.icon className={`w-4 h-4 ${n.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-[#1a1a2e] dark:text-foreground leading-snug">{n.text}</p>
                    <p className="text-[12px] text-muted-foreground mt-0.5">{n.time}</p>
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

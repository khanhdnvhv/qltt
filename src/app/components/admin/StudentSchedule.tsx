import { useDocumentTitle } from "../../utils/hooks";
import { useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Clock, BookOpen, Calendar } from "lucide-react";

interface Lesson {
  id: string;
  className: string;
  subject: string;
  room: string;
  teacher: string;
  startTime: string;
  endTime: string;
  dayOfWeek: number;
  color: string;
  week: number;
  status: "upcoming" | "done" | "cancelled";
}

const DAYS_VI = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const DAYS_FULL = ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

const lessons: Lesson[] = [
  { id: "1", className: "Tiếng Anh B1 - Ca Tối T2T4T6", subject: "Tiếng Anh B1", room: "Phòng A101", teacher: "GV. Nguyễn Thị Lan", startTime: "18:00", endTime: "20:30", dayOfWeek: 1, color: "bg-orange-500", week: 15, status: "done" },
  { id: "2", className: "Tiếng Anh B1 - Ca Tối T2T4T6", subject: "Tiếng Anh B1", room: "Phòng A101", teacher: "GV. Nguyễn Thị Lan", startTime: "18:00", endTime: "20:30", dayOfWeek: 3, color: "bg-orange-500", week: 15, status: "done" },
  { id: "3", className: "Tiếng Anh B1 - Ca Tối T2T4T6", subject: "Tiếng Anh B1", room: "Phòng A101", teacher: "GV. Nguyễn Thị Lan", startTime: "18:00", endTime: "20:30", dayOfWeek: 5, color: "bg-orange-500", week: 15, status: "done" },
  { id: "4", className: "Tiếng Anh B1 - Ca Tối T2T4T6", subject: "Tiếng Anh B1", room: "Phòng A101", teacher: "GV. Nguyễn Thị Lan", startTime: "18:00", endTime: "20:30", dayOfWeek: 1, color: "bg-orange-500", week: 16, status: "upcoming" },
  { id: "5", className: "Tiếng Anh B1 - Ca Tối T2T4T6", subject: "Tiếng Anh B1", room: "Phòng A101", teacher: "GV. Nguyễn Thị Lan", startTime: "18:00", endTime: "20:30", dayOfWeek: 3, color: "bg-orange-500", week: 16, status: "upcoming" },
  { id: "6", className: "Tiếng Anh B1 - Ca Tối T2T4T6", subject: "Tiếng Anh B1", room: "Phòng A101", teacher: "GV. Nguyễn Thị Lan", startTime: "18:00", endTime: "20:30", dayOfWeek: 5, color: "bg-orange-500", week: 16, status: "upcoming" },
];

function getWeekDates(week: number, year: number = 2026) {
  const jan1 = new Date(year, 0, 1);
  const dayOfJan1 = jan1.getDay();
  const offset = (dayOfJan1 <= 1 ? 1 - dayOfJan1 : 8 - dayOfJan1);
  const weekStart = new Date(year, 0, 1 + offset + (week - 1) * 7);
  const mon = new Date(weekStart);
  mon.setDate(weekStart.getDate() - (weekStart.getDay() === 0 ? 6 : weekStart.getDay() - 1));
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); return d; });
}

export function StudentSchedule() {
  useDocumentTitle("Lịch học");
  const [currentWeek, setCurrentWeek] = useState(15);
  const [viewMode, setViewMode] = useState<"week" | "list">("week");
  const weekDates = getWeekDates(currentWeek);
  const weekLessons = lessons.filter(l => l.week === currentWeek);
  const today = new Date(2026, 3, 8);

  const completedCount = lessons.filter(l => l.status === "done").length;
  const totalLessons = 25;

  return (
    <div className="pb-10">
      <div className="relative mb-6 p-6 rounded-2xl overflow-hidden bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: "28px 28px" }} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-orange-200 text-[13px] font-semibold mb-1 uppercase">Cổng Học viên</p>
            <h1 className="text-[24px] font-extrabold">Lịch học</h1>
            <p className="text-orange-100/70 text-[14px] mt-1">Theo dõi thời khóa biểu và phòng học của bạn</p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-xl p-1 border border-white/20">
            <button onClick={() => setViewMode("week")} className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all ${viewMode === "week" ? "bg-white text-orange-600" : "text-white/70 hover:text-white"}`}>Tuần</button>
            <button onClick={() => setViewMode("list")} className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all ${viewMode === "list" ? "bg-white text-orange-600" : "text-white/70 hover:text-white"}`}>Danh sách</button>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Buổi học tuần này", value: weekLessons.length },
          { label: "Đã học / Tổng", value: `${completedCount}/${totalLessons}` },
          { label: "Tiến độ khóa học", value: `${Math.round(completedCount / totalLessons * 100)}%` },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-4 text-center">
            <p className="text-[24px] font-extrabold text-orange-500">{s.value}</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Week navigation */}
      <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-border">
          <button onClick={() => setCurrentWeek(w => w - 1)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
          <div className="text-center">
            <h3 className="font-bold text-[16px]">Tuần {currentWeek} — {weekDates[0].toLocaleDateString("vi-VN")} đến {weekDates[6].toLocaleDateString("vi-VN")}</h3>
          </div>
          <button onClick={() => setCurrentWeek(w => w + 1)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"><ChevronRight className="w-4 h-4" /></button>
        </div>

        {viewMode === "week" ? (
          <div className="overflow-x-auto">
          <div className="grid grid-cols-7 divide-x divide-gray-50 dark:divide-white/[0.03] min-w-[480px]">
            {DAYS_VI.map((day, i) => {
              const date = weekDates[i];
              const isToday = date.toDateString() === today.toDateString();
              const dayLessons = weekLessons.filter(l => l.dayOfWeek === (i === 0 ? 0 : i));
              return (
                <div key={i} className={`min-h-[120px] p-2 ${isToday ? "bg-orange-50/50 dark:bg-orange-500/5" : ""}`}>
                  <div className={`text-center mb-2 ${isToday ? "text-orange-500" : "text-muted-foreground"}`}>
                    <p className="text-[11px] font-semibold uppercase">{day}</p>
                    <p className={`text-[18px] font-extrabold ${isToday ? "w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto" : ""}`}>{date.getDate()}</p>
                  </div>
                  {dayLessons.map(l => (
                    <div key={l.id} className={`${l.color} text-white rounded-lg p-1.5 mb-1 text-[10px] font-semibold leading-tight`}>
                      <p className="truncate">{l.subject}</p>
                      <p className="opacity-80">{l.startTime}-{l.endTime}</p>
                      <p className="opacity-80 truncate">{l.room}</p>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-white/[0.03]">
            {weekLessons.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">Không có buổi học nào trong tuần này</p>
            ) : (
              weekLessons.sort((a, b) => a.dayOfWeek - b.dayOfWeek).map(l => (
                <div key={l.id} className="flex items-start gap-3 p-4 hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                  <div className={`w-1 h-10 rounded-full shrink-0 mt-1 ${l.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1a1a2e] dark:text-foreground text-[14px]">{DAYS_FULL[l.dayOfWeek]} — {weekDates[l.dayOfWeek === 0 ? 0 : l.dayOfWeek].toLocaleDateString("vi-VN")}</p>
                    <p className="text-[13px] text-muted-foreground">{l.subject}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[12px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{l.startTime}–{l.endTime}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{l.room}</span>
                      <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{l.teacher}</span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${l.status === "done" ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400" : "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400"}`}>
                        {l.status === "done" ? "Đã học" : "Sắp học"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Upcoming notice */}
      <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-2xl">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-orange-500 shrink-0" />
          <div>
            <p className="font-semibold text-orange-700 dark:text-orange-400 text-[14px]">Buổi học tiếp theo</p>
            <p className="text-orange-600/80 dark:text-orange-300/70 text-[13px]">Thứ Hai, 13/04/2026 — Tiếng Anh B1, 18:00–20:30, Phòng A101 — GV. Nguyễn Thị Lan</p>
          </div>
        </div>
      </div>
    </div>
  );
}

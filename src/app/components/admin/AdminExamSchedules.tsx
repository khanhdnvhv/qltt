import { useState, useMemo } from "react";
import { useDocumentTitle, useEscapeKey } from "../../utils/hooks";
import { AnimatePresence, motion } from "motion/react";
import {
  CalendarDays, Clock, MapPin, Users, Eye, X, ChevronLeft, ChevronRight,
  PlayCircle, CheckSquare, AlertCircle, Plus, List, Calendar
} from "lucide-react";
import { toast } from "sonner";

interface ExamSlot {
  id: string;
  examPlanCode: string;
  examName: string;
  subject: string;
  date: string;
  dateObj: Date;
  shift: "Sáng (7:30-11:30)" | "Chiều (13:00-17:00)" | "Tối (18:00-20:00)";
  room: string;
  candidateCount: number;
  supervisor: string;
  status: "upcoming" | "ongoing" | "done" | "cancelled";
}

const today = new Date(2026, 2, 15); // 15/03/2026

const slots: ExamSlot[] = [
  { id: "1", examPlanCode: "KT-26-001", examName: "Kỳ thi Tiếng Anh B1 VSTEP Q1/2026", subject: "Tiếng Anh", date: "15/03/2026", dateObj: new Date(2026, 2, 15), shift: "Sáng (7:30-11:30)", room: "Phòng A101", candidateCount: 30, supervisor: "Nguyễn Văn Đức", status: "ongoing" },
  { id: "2", examPlanCode: "KT-26-001", examName: "Kỳ thi Tiếng Anh B1 VSTEP Q1/2026", subject: "Tiếng Anh", date: "15/03/2026", dateObj: new Date(2026, 2, 15), shift: "Chiều (13:00-17:00)", room: "Phòng A102", candidateCount: 28, supervisor: "Trần Thị Lan", status: "upcoming" },
  { id: "3", examPlanCode: "KT-26-001", examName: "Kỳ thi Tiếng Anh B1 VSTEP Q1/2026", subject: "Tiếng Anh", date: "15/03/2026", dateObj: new Date(2026, 2, 15), shift: "Chiều (13:00-17:00)", room: "Phòng A103", candidateCount: 27, supervisor: "Lê Minh Hoàng", status: "upcoming" },
  { id: "4", examPlanCode: "KT-26-002", examName: "Kỳ thi Tin học IC3 Tháng 2", subject: "Tin học", date: "20/02/2026", dateObj: new Date(2026, 1, 20), shift: "Sáng (7:30-11:30)", room: "Phòng máy Lab-1", candidateCount: 30, supervisor: "Phạm Xuân Bình", status: "done" },
  { id: "5", examPlanCode: "KT-26-002", examName: "Kỳ thi Tin học IC3 Tháng 2", subject: "Tin học", date: "20/02/2026", dateObj: new Date(2026, 1, 20), shift: "Chiều (13:00-17:00)", room: "Phòng máy Lab-2", candidateCount: 30, supervisor: "Hoàng Thu Hà", status: "done" },
  { id: "6", examPlanCode: "KT-26-004", examName: "Kỳ thi TOEIC 450 Tháng 3", subject: "Tiếng Anh TOEIC", date: "22/03/2026", dateObj: new Date(2026, 2, 22), shift: "Sáng (7:30-11:30)", room: "Phòng B201", candidateCount: 25, supervisor: "Nguyễn Thị Mai", status: "upcoming" },
  { id: "7", examPlanCode: "KT-26-004", examName: "Kỳ thi TOEIC 450 Tháng 3", subject: "Tiếng Anh TOEIC", date: "22/03/2026", dateObj: new Date(2026, 2, 22), shift: "Chiều (13:00-17:00)", room: "Phòng B202", candidateCount: 20, supervisor: "Đỗ Thanh Bình", status: "upcoming" },
  { id: "8", examPlanCode: "KT-26-005", examName: "Thi Kết thúc Nấu ăn Cơ bản", subject: "Kỹ thuật Nấu ăn", date: "10/04/2026", dateObj: new Date(2026, 3, 10), shift: "Sáng (7:30-11:30)", room: "Xưởng thực hành 1", candidateCount: 24, supervisor: "Vũ Ngọc Ánh", status: "upcoming" },
  { id: "9", examPlanCode: "KT-26-003", examName: "Thi Giữa kỳ Hàn Điện Cơ bản", subject: "Hàn Điện", date: "28/02/2026", dateObj: new Date(2026, 1, 28), shift: "Sáng (7:30-11:30)", room: "Xưởng Hàn S01", candidateCount: 20, supervisor: "Trần Văn Khánh", status: "done" },
  { id: "10", examPlanCode: "KT-26-003", examName: "Thi Giữa kỳ Hàn Điện Cơ bản", subject: "Hàn Điện", date: "28/02/2026", dateObj: new Date(2026, 1, 28), shift: "Chiều (13:00-17:00)", room: "Xưởng Hàn S02", candidateCount: 12, supervisor: "Lý Thành Đạt", status: "done" },
];

const statusCfg = {
  upcoming: { label: "Sắp diễn ra", bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500" },
  ongoing: { label: "Đang thi", bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500 animate-pulse" },
  done: { label: "Đã kết thúc", bg: "bg-gray-100 dark:bg-white/5", text: "text-gray-600 dark:text-gray-400", dot: "bg-gray-400" },
  cancelled: { label: "Đã hủy", bg: "bg-rose-50 dark:bg-rose-500/10", text: "text-rose-700 dark:text-rose-400", dot: "bg-rose-500" },
};

const DAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const MONTHS = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];

export function AdminExamSchedules() {
  useDocumentTitle("Lịch Thi");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1));
  const [selectedSlot, setSelectedSlot] = useState<ExamSlot | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  useEscapeKey(() => setSelectedSlot(null), !!selectedSlot);

  const filtered = useMemo(() => filterStatus === "all" ? slots : slots.filter(s => s.status === filterStatus), [filterStatus]);

  // Calendar helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarDays = Array.from({ length: firstDay + daysInMonth }, (_, i) => i < firstDay ? null : i - firstDay + 1);

  const slotsOnDay = (day: number) => slots.filter(s => s.dateObj.getFullYear() === year && s.dateObj.getMonth() === month && s.dateObj.getDate() === day);

  const stats = useMemo(() => ({
    total: slots.length,
    upcoming: slots.filter(s => s.status === "upcoming").length,
    ongoing: slots.filter(s => s.status === "ongoing").length,
    done: slots.filter(s => s.status === "done").length,
  }), []);

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="relative mb-6 p-6 rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: "28px 28px" }} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-blue-200 text-[13px] font-semibold mb-1 tracking-wide uppercase">Module Thi & Kiểm tra</p>
            <h1 className="text-[24px] font-extrabold">Lịch Thi</h1>
            <p className="text-blue-100/70 text-[14px] mt-1">Xem lịch tổ chức thi theo ngày, phòng và ca thi</p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-xl p-1 border border-white/20">
            <button onClick={() => setViewMode("list")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all ${viewMode === "list" ? "bg-white text-blue-700" : "text-white/70 hover:text-white"}`}><List className="w-3.5 h-3.5" /> Danh sách</button>
            <button onClick={() => setViewMode("calendar")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all ${viewMode === "calendar" ? "bg-white text-blue-700" : "text-white/70 hover:text-white"}`}><Calendar className="w-3.5 h-3.5" /> Lịch</button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Tổng ca thi", value: stats.total, color: "text-blue-600", bg: "bg-blue-500/10" },
          { label: "Sắp diễn ra", value: stats.upcoming, color: "text-indigo-600", bg: "bg-indigo-500/10" },
          { label: "Đang thi", value: stats.ongoing, color: "text-emerald-600", bg: "bg-emerald-500/10" },
          { label: "Đã kết thúc", value: stats.done, color: "text-gray-600", bg: "bg-gray-500/10" },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-4 text-center">
            <p className={`text-[28px] font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {viewMode === "list" ? (
        <>
          {/* Filter */}
          <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-4 mb-4 flex gap-2 flex-wrap">
            {["all", "upcoming", "ongoing", "done"].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-full text-[13px] font-semibold transition-all ${filterStatus === s ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-white/5 text-muted-foreground hover:bg-gray-200 dark:hover:bg-white/10"}`}>
                {s === "all" ? "Tất cả" : statusCfg[s as keyof typeof statusCfg].label}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="space-y-3">
            {filtered.map(slot => {
              const st = statusCfg[slot.status];
              return (
                <motion.div key={slot.id} layout className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                        <CalendarDays className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${st.bg} ${st.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{st.label}
                          </span>
                          <span className="text-[11px] font-mono text-muted-foreground">{slot.examPlanCode}</span>
                        </div>
                        <p className="font-semibold text-[#1a1a2e] dark:text-foreground mt-0.5">{slot.examName}</p>
                        <p className="text-[13px] text-muted-foreground">{slot.subject}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap text-[13px] text-muted-foreground ml-13 sm:ml-0">
                      <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" />{slot.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{slot.shift}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{slot.room}</span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{slot.candidateCount} TS</span>
                      <button onClick={() => setSelectedSlot(slot)} className="ml-auto sm:ml-0 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"><Eye className="w-4 h-4" /></button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      ) : (
        /* Calendar View */
        <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl overflow-hidden">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-border">
            <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            <h3 className="font-bold text-[16px] text-[#1a1a2e] dark:text-foreground">{MONTHS[month]} {year}</h3>
            <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"><ChevronRight className="w-4 h-4" /></button>
          </div>
          <div className="overflow-x-auto">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-100 dark:border-border min-w-[360px]">
            {DAYS.map(d => <div key={d} className="py-2 text-center text-[12px] font-semibold text-muted-foreground">{d}</div>)}
          </div>
          {/* Calendar grid */}
          <div className="grid grid-cols-7 min-w-[360px]">
            {calendarDays.map((day, i) => {
              const daySlots = day ? slotsOnDay(day) : [];
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              return (
                <div key={i} className={`min-h-[80px] border-b border-r border-gray-50 dark:border-white/[0.03] p-1.5 ${!day ? "bg-gray-50/50 dark:bg-white/[0.01]" : ""}`}>
                  {day && (
                    <>
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[12px] font-semibold mb-1 ${isToday ? "bg-blue-600 text-white" : "text-[#1a1a2e] dark:text-foreground"}`}>{day}</span>
                      <div className="space-y-0.5">
                        {daySlots.slice(0, 2).map(s => (
                          <button key={s.id} onClick={() => setSelectedSlot(s)} className={`w-full text-left px-1.5 py-0.5 rounded text-[10px] font-semibold truncate ${statusCfg[s.status].bg} ${statusCfg[s.status].text}`}>
                            {s.subject}
                          </button>
                        ))}
                        {daySlots.length > 2 && <p className="text-[10px] text-muted-foreground pl-1">+{daySlots.length - 2} ca</p>}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          </div>{/* /overflow-x-auto */}
        </div>
      )}

      {/* Detail drawer */}
      <AnimatePresence>
        {selectedSlot && (
          <motion.div className="fixed inset-0 z-50 flex" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedSlot(null)} />
            <motion.div className="relative ml-auto w-full max-w-md bg-white dark:bg-card h-full overflow-y-auto shadow-2xl" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 300 }}>
              <div className="p-5 border-b border-gray-100 dark:border-border flex items-start justify-between">
                <div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusCfg[selectedSlot.status].bg} ${statusCfg[selectedSlot.status].text} mb-2`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusCfg[selectedSlot.status].dot}`} />{statusCfg[selectedSlot.status].label}
                  </span>
                  <h3 className="text-[17px] font-bold text-[#1a1a2e] dark:text-foreground">{selectedSlot.examName}</h3>
                </div>
                <button onClick={() => setSelectedSlot(null)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-5 space-y-3">
                {[
                  { label: "Môn thi", value: selectedSlot.subject, icon: <CheckSquare className="w-4 h-4 text-blue-500" /> },
                  { label: "Ngày thi", value: selectedSlot.date, icon: <CalendarDays className="w-4 h-4 text-blue-500" /> },
                  { label: "Ca thi", value: selectedSlot.shift, icon: <Clock className="w-4 h-4 text-blue-500" /> },
                  { label: "Phòng thi", value: selectedSlot.room, icon: <MapPin className="w-4 h-4 text-blue-500" /> },
                  { label: "Số thí sinh", value: `${selectedSlot.candidateCount} người`, icon: <Users className="w-4 h-4 text-blue-500" /> },
                  { label: "Giám thị", value: selectedSlot.supervisor, icon: <Eye className="w-4 h-4 text-blue-500" /> },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/[0.03] rounded-xl">
                    {item.icon}
                    <div>
                      <p className="text-[11px] text-muted-foreground">{item.label}</p>
                      <p className="text-[14px] font-semibold text-[#1a1a2e] dark:text-foreground">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

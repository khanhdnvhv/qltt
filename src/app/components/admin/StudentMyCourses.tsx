import { useDocumentTitle } from "../../utils/hooks";
import { useState } from "react";
import { BookOpen, Users, Clock, Calendar, ChevronRight, CheckCircle, Play, FileText, Download, X } from "lucide-react";

type CourseStatus = "active" | "done" | "reserved";

interface CourseLesson {
  title: string;
  date: string;
  done: boolean;
  hasHandout: boolean;
}

interface MyCourse {
  id: string;
  name: string;
  code: string;
  teacher: string;
  schedule: string;
  room: string;
  startDate: string;
  endDate: string;
  status: CourseStatus;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  attendanceRate: number;
  lessons: CourseLesson[];
}

const statusCfg: Record<CourseStatus, { label: string; bg: string; text: string; dot: string }> = {
  active:   { label: "Đang học",    bg: "bg-orange-100 dark:bg-orange-500/20",  text: "text-orange-700 dark:text-orange-400",  dot: "bg-orange-500 animate-pulse" },
  done:     { label: "Đã hoàn thành",bg: "bg-emerald-100 dark:bg-emerald-500/20",text: "text-emerald-700 dark:text-emerald-400",dot: "bg-emerald-500"             },
  reserved: { label: "Đang bảo lưu",bg: "bg-amber-100 dark:bg-amber-500/20",   text: "text-amber-700 dark:text-amber-400",    dot: "bg-amber-500"                },
};

const mockCourses: MyCourse[] = [
  {
    id: "C01", name: "Tiếng Anh B1 VSTEP Cấp tốc", code: "TAVSTEP-01",
    teacher: "GV. Nguyễn Thị Lan", schedule: "T2T4T6 18:00-20:30", room: "Phòng A101",
    startDate: "06/01/2026", endDate: "30/06/2026", status: "active",
    progress: 68, completedLessons: 17, totalLessons: 25, attendanceRate: 94,
    lessons: [
      { title: "Unit 1 – Greetings & Introductions", date: "06/01/2026", done: true, hasHandout: true },
      { title: "Unit 2 – Family & Daily Life", date: "09/01/2026", done: true, hasHandout: true },
      { title: "Unit 3 – Health & Lifestyle", date: "13/01/2026", done: true, hasHandout: true },
      { title: "Kiểm tra giữa kỳ", date: "01/02/2026", done: true, hasHandout: false },
      { title: "Unit 4 – Work & Career", date: "10/03/2026", done: true, hasHandout: true },
      { title: "Unit 5 – Environment & Nature", date: "24/03/2026", done: true, hasHandout: true },
      { title: "Unit 6 – Travel & Tourism", date: "07/04/2026", done: true, hasHandout: true },
      { title: "Unit 7 – Technology & Innovation", date: "13/04/2026", done: false, hasHandout: false },
      { title: "Unit 8 – Culture & Society", date: "17/04/2026", done: false, hasHandout: false },
    ],
  },
  {
    id: "C02", name: "Giao tiếp Tiếng Anh Cơ bản", code: "EAGTCB-01",
    teacher: "GV. Trần Minh Tuấn", schedule: "T2T4T6 Sáng 8:00-10:00", room: "Phòng A102",
    startDate: "01/07/2025", endDate: "15/12/2025", status: "done",
    progress: 100, completedLessons: 30, totalLessons: 30, attendanceRate: 87,
    lessons: [
      { title: "Toàn bộ 30 buổi đã hoàn thành", date: "15/12/2025", done: true, hasHandout: true },
    ],
  },
];

export function StudentMyCourses() {
  useDocumentTitle("Khóa học của tôi");
  const [selected, setSelected] = useState<MyCourse | null>(null);

  return (
    <div className="pb-10">
      <div className="relative mb-6 p-6 rounded-2xl overflow-hidden bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: "28px 28px" }} />
        <div className="relative z-10">
          <p className="text-orange-200 text-[13px] font-semibold mb-1 uppercase">Cổng Học viên</p>
          <h1 className="text-[24px] font-extrabold">Khóa học của tôi</h1>
          <p className="text-orange-100/70 text-[14px] mt-1">Tài liệu, tiến độ và nội dung giảng dạy</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Đang học", value: mockCourses.filter(c => c.status === "active").length, color: "text-orange-500" },
          { label: "Đã hoàn thành", value: mockCourses.filter(c => c.status === "done").length, color: "text-emerald-600" },
          { label: "Chuyên cần TB", value: `${Math.round(mockCourses.reduce((s, c) => s + c.attendanceRate, 0) / mockCourses.length)}%`, color: "text-blue-600" },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-4 text-center">
            <p className={`text-[26px] font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Course cards */}
      <div className="space-y-4">
        {mockCourses.map(c => {
          const st = statusCfg[c.status];
          return (
            <div key={c.id} className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center shrink-0">
                    <BookOpen className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${st.bg} ${st.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{st.label}
                      </span>
                      <span className="text-[12px] font-mono text-muted-foreground">{c.code}</span>
                    </div>
                    <h3 className="text-[17px] font-bold text-[#1a1a2e] dark:text-foreground">{c.name}</h3>
                    <div className="flex items-center gap-4 mt-1 text-[13px] text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{c.teacher}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{c.schedule}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{c.startDate} – {c.endDate}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelected(c)} className="flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-500/10 hover:bg-orange-100 dark:hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-xl text-[13px] font-semibold shrink-0 transition-colors">
                  Chi tiết <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] text-muted-foreground">Tiến độ học</span>
                  <span className="text-[12px] font-semibold text-orange-500">{c.completedLessons}/{c.totalLessons} buổi ({c.progress}%)</span>
                </div>
                <div className="h-2.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${c.progress === 100 ? "bg-emerald-500" : "bg-orange-500"}`} style={{ width: `${c.progress}%` }} />
                </div>
              </div>

              <div className="flex items-center gap-4 mt-3 text-[13px]">
                <span className="text-muted-foreground">Chuyên cần:</span>
                <span className={`font-bold ${c.attendanceRate >= 80 ? "text-emerald-600" : "text-rose-500"}`}>{c.attendanceRate}%</span>
                {c.attendanceRate < 80 && <span className="text-rose-500 text-[12px]">⚠ Cần cải thiện</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-end" onClick={() => setSelected(null)}>
          <div className="bg-white dark:bg-card h-full w-full max-w-md shadow-2xl overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-border">
              <h3 className="font-bold text-[17px]">Nội dung khóa học</h3>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5">
              <h4 className="font-bold text-[16px] mb-1">{selected.name}</h4>
              <p className="text-[13px] text-muted-foreground mb-4">{selected.teacher} · {selected.room}</p>

              <div className="mb-5">
                <div className="flex justify-between text-[13px] mb-1">
                  <span className="text-muted-foreground">Tiến độ</span>
                  <span className="font-bold text-orange-500">{selected.completedLessons}/{selected.totalLessons} buổi</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-white/10 rounded-full">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: `${selected.progress}%` }} />
                </div>
              </div>

              <h5 className="font-bold text-[14px] mb-3">Nội dung buổi học</h5>
              <div className="space-y-2">
                {selected.lessons.map((l, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${l.done ? "border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5" : "border-gray-200 dark:border-border"}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${l.done ? "bg-emerald-500" : "bg-gray-200 dark:bg-white/10"}`}>
                      {l.done ? <CheckCircle className="w-4 h-4 text-white" /> : <Play className="w-3 h-3 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] font-semibold truncate ${l.done ? "text-[#1a1a2e] dark:text-foreground" : "text-muted-foreground"}`}>{l.title}</p>
                      <p className="text-[11px] text-muted-foreground">{l.date}</p>
                    </div>
                    {l.hasHandout && (
                      <button className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-muted-foreground hover:text-blue-600 transition-colors">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

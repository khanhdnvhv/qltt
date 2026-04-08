import { useDocumentTitle } from "../../utils/hooks";
import { useState } from "react";
import { BookOpen, Users, TrendingUp, Clock, ChevronRight, Calendar, Award, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router";

const courses = [
  { id: "1", name: "Tiếng Anh B1 VSTEP Cấp tốc", code: "TAVSTEP-01", students: 30, progress: 68, nextClass: "Hôm nay 18:00", room: "Phòng A101", schedule: "T2T4T6 18:00-20:30", status: "active", completedLessons: 17, totalLessons: 25, subject: "Tiếng Anh" },
  { id: "2", name: "Luyện thi TOEIC 450+", code: "TOEIC-03", students: 25, progress: 40, nextClass: "Ngày mai 8:00", room: "Phòng B201", schedule: "T3T5T7 8:00-10:30", status: "active", completedLessons: 8, totalLessons: 20, subject: "Tiếng Anh TOEIC" },
  { id: "3", name: "Giao tiếp Tiếng Anh Cơ bản", code: "EAGTCB-02", students: 22, progress: 100, nextClass: "Đã kết thúc", room: "Phòng A102", schedule: "T2T4T6 Sáng", status: "done", completedLessons: 30, totalLessons: 30, subject: "Tiếng Anh" },
];

const statusCfg = {
  active: { label: "Đang dạy", bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500 animate-pulse" },
  done: { label: "Đã kết thúc", bg: "bg-gray-100 dark:bg-white/5", text: "text-gray-500 dark:text-gray-400", dot: "bg-gray-400" },
  upcoming: { label: "Sắp khai giảng", bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500" },
};

export function TeacherCourses() {
  useDocumentTitle("Khóa học Công tác");
  const [filter, setFilter] = useState("all");
  const displayed = filter === "all" ? courses : courses.filter(c => c.status === filter);

  return (
    <div className="pb-10">
      <div className="relative mb-6 p-6 rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: "28px 28px" }} />
        <div className="relative z-10">
          <p className="text-emerald-200 text-[13px] font-semibold mb-1 uppercase">Cổng Giáo viên</p>
          <h1 className="text-[24px] font-extrabold">Khóa học Công tác</h1>
          <p className="text-emerald-100/70 text-[14px] mt-1">Các khóa học bạn đang được phân công giảng dạy</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Đang dạy", value: courses.filter(c => c.status === "active").length, color: "text-emerald-600" },
          { label: "Tổng học viên", value: courses.reduce((s, c) => s + c.students, 0), color: "text-blue-600" },
          { label: "Đã hoàn thành", value: courses.filter(c => c.status === "done").length, color: "text-violet-600" },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-4 text-center">
            <p className={`text-[28px] font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[["all", "Tất cả"], ["active", "Đang dạy"], ["done", "Đã kết thúc"]].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} className={`px-4 py-2 rounded-xl text-[14px] font-semibold transition-all ${filter === v ? "bg-emerald-600 text-white" : "bg-white dark:bg-card border border-gray-200 dark:border-border text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/5"}`}>{l}</button>
        ))}
      </div>

      {/* Course cards */}
      <div className="space-y-4">
        {displayed.map(c => {
          const st = statusCfg[c.status as keyof typeof statusCfg];
          return (
            <div key={c.id} className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <BookOpen className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${st.bg} ${st.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{st.label}
                      </span>
                      <span className="text-[12px] font-mono text-muted-foreground">{c.code}</span>
                    </div>
                    <h3 className="text-[17px] font-bold text-[#1a1a2e] dark:text-foreground">{c.name}</h3>
                    <div className="flex items-center gap-4 mt-1 text-[13px] text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{c.students} học viên</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{c.schedule}</span>
                      {c.status === "active" && <span className="flex items-center gap-1 text-emerald-600 font-semibold"><Clock className="w-3.5 h-3.5" />{c.nextClass}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:shrink-0">
                  <div className="text-center">
                    <p className="text-[22px] font-extrabold text-emerald-600">{c.progress}%</p>
                    <p className="text-[11px] text-muted-foreground">{c.completedLessons}/{c.totalLessons} buổi</p>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] text-muted-foreground">Tiến độ giảng dạy</span>
                  <span className="text-[12px] font-semibold text-emerald-600">{c.progress}%</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${c.progress === 100 ? "bg-violet-500" : "bg-emerald-500"}`} style={{ width: `${c.progress}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

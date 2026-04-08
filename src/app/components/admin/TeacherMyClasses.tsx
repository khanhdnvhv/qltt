import { useDocumentTitle, useEscapeKey } from "../../utils/hooks";
import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Users, CheckSquare, Edit2, X, Search, ChevronDown,
  Check, Minus, Save, BookOpen, TrendingUp, Award
} from "lucide-react";
import { toast } from "sonner";

interface Student { id: string; name: string; code: string; }
interface AttendanceRecord { studentId: string; status: "present" | "absent" | "late"; }
interface ScoreRecord { studentId: string; listening: number | null; speaking: number | null; reading: number | null; writing: number | null; }

const classes = [
  { id: "CL01", name: "Tiếng Anh B1 - Ca Tối T2T4T6", course: "Tiếng Anh B1 VSTEP", students: 30 },
  { id: "CL02", name: "TOEIC 450 - Ca Sáng T3T5T7", course: "TOEIC 450+", students: 25 },
];

const mockStudents: Student[] = [
  { id: "S01", name: "Nguyễn Trung Tín", code: "HV-26-0001" },
  { id: "S02", name: "Trần Mai Anh", code: "HV-26-0002" },
  { id: "S03", name: "Lý Gia Hân", code: "HV-26-0003" },
  { id: "S04", name: "Phạm Bình Minh", code: "HV-26-0004" },
  { id: "S05", name: "Hoàng Thanh Thảo", code: "HV-25-0992" },
  { id: "S06", name: "Lê Minh Trí", code: "HV-26-0012" },
  { id: "S07", name: "Đỗ Xuân Trường", code: "HV-26-0015" },
  { id: "S08", name: "Vũ Ngọc Trâm", code: "HV-25-0811" },
];

const lessons = ["Buổi 18 - 07/04/2026", "Buổi 17 - 04/04/2026", "Buổi 16 - 02/04/2026"];

export function TeacherMyClasses() {
  useDocumentTitle("Lớp học của tôi");
  const [selectedClass, setSelectedClass] = useState(classes[0]);
  const [activeTab, setActiveTab] = useState<"attendance" | "scores">("attendance");
  const [selectedLesson, setSelectedLesson] = useState(lessons[0]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(
    mockStudents.map(s => ({ studentId: s.id, status: "present" as const }))
  );
  const [scores, setScores] = useState<ScoreRecord[]>(
    mockStudents.map(s => ({ studentId: s.id, listening: null, speaking: null, reading: null, writing: null }))
  );
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(false);

  const filteredStudents = useMemo(() =>
    mockStudents.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  const presentCount = attendance.filter(a => a.status === "present").length;
  const absentCount = attendance.filter(a => a.status === "absent").length;

  const setStatus = (studentId: string, status: AttendanceRecord["status"]) => {
    setAttendance(prev => prev.map(a => a.studentId === studentId ? { ...a, status } : a));
  };

  const setScore = (studentId: string, field: keyof Omit<ScoreRecord, "studentId">, val: string) => {
    const num = val === "" ? null : parseFloat(val);
    setScores(prev => prev.map(s => s.studentId === studentId ? { ...s, [field]: num } : s));
  };

  const handleSaveAttendance = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    toast.success(`Đã lưu điểm danh ${selectedLesson} — ${presentCount} có mặt, ${absentCount} vắng`);
  };

  const handleSaveScores = () => {
    toast.success("Đã lưu bảng điểm thành công");
  };

  return (
    <div className="pb-10">
      <div className="relative mb-6 p-6 rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-600 to-green-700 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: "28px 28px" }} />
        <div className="relative z-10">
          <p className="text-emerald-200 text-[13px] font-semibold mb-1 uppercase">Cổng Giáo viên</p>
          <h1 className="text-[24px] font-extrabold">Lớp học của tôi</h1>
          <p className="text-emerald-100/70 text-[14px] mt-1">Điểm danh và nhập điểm trực tiếp trên hệ thống</p>
        </div>
      </div>

      {/* Class selector */}
      <div className="flex gap-3 mb-5 flex-wrap">
        {classes.map(c => (
          <button key={c.id} onClick={() => setSelectedClass(c)} className={`px-4 py-2.5 rounded-xl text-[14px] font-semibold border-2 transition-all ${selectedClass.id === c.id ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "border-gray-200 dark:border-border text-muted-foreground hover:border-emerald-300"}`}>
            {c.name}
            <span className="ml-2 text-[12px] opacity-70">({c.students} HV)</span>
          </button>
        ))}
      </div>

      {/* Tab + lesson select */}
      <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-border gap-4 flex-wrap">
          <div className="flex gap-2">
            {[["attendance", "Điểm danh"], ["scores", "Nhập điểm"]].map(([v, l]) => (
              <button key={v} onClick={() => setActiveTab(v as typeof activeTab)} className={`px-4 py-2 rounded-xl text-[14px] font-semibold transition-all ${activeTab === v ? "bg-emerald-600 text-white" : "bg-gray-100 dark:bg-white/5 text-muted-foreground hover:bg-gray-200 dark:hover:bg-white/10"}`}>{l}</button>
            ))}
          </div>
          {activeTab === "attendance" && (
            <select value={selectedLesson} onChange={e => setSelectedLesson(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none">
              {lessons.map(l => <option key={l}>{l}</option>)}
            </select>
          )}
        </div>

        {/* Search */}
        <div className="px-5 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm học viên..." className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" />
          </div>
        </div>

        {activeTab === "attendance" && (
          <>
            {/* Quick stats */}
            <div className="flex gap-3 px-5 py-3">
              <span className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full text-[13px] font-semibold">Có mặt: {presentCount}</span>
              <span className="px-3 py-1.5 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 rounded-full text-[13px] font-semibold">Vắng: {absentCount}</span>
              <span className="px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-full text-[13px] font-semibold">Trễ: {attendance.filter(a => a.status === "late").length}</span>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-white/[0.03]">
              {filteredStudents.map(s => {
                const att = attendance.find(a => a.studentId === s.id)!;
                return (
                  <div key={s.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-[12px] font-bold">{s.name.charAt(0)}</div>
                      <div>
                        <p className="font-semibold text-[14px] text-[#1a1a2e] dark:text-foreground">{s.name}</p>
                        <p className="text-[11px] font-mono text-muted-foreground">{s.code}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {(["present", "late", "absent"] as const).map(st => (
                        <button key={st} onClick={() => setStatus(s.id, st)} className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all ${att.status === st ? (st === "present" ? "bg-emerald-500 text-white border-emerald-500" : st === "late" ? "bg-amber-500 text-white border-amber-500" : "bg-rose-500 text-white border-rose-500") : "border-gray-200 dark:border-border text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/5"}`}>
                          {st === "present" ? "Có mặt" : st === "late" ? "Trễ" : "Vắng"}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-5 py-4 border-t border-gray-100 dark:border-border">
              <button onClick={handleSaveAttendance} className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-[14px] flex items-center gap-2 transition-colors">
                <Save className="w-4 h-4" />{saved ? "Đã lưu!" : "Lưu điểm danh"}
              </button>
            </div>
          </>
        )}

        {activeTab === "scores" && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-[14px] min-w-[520px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-border bg-gray-50/50 dark:bg-white/[0.02]">
                    <th className="px-5 py-3 text-left font-semibold text-muted-foreground text-[12px] uppercase">Học viên</th>
                    {["Nghe", "Nói", "Đọc", "Viết"].map(s => (
                      <th key={s} className="px-3 py-3 text-center font-semibold text-muted-foreground text-[12px] uppercase">{s}</th>
                    ))}
                    <th className="px-3 py-3 text-center font-semibold text-muted-foreground text-[12px] uppercase">TB</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-white/[0.03]">
                  {filteredStudents.map(s => {
                    const sc = scores.find(sc => sc.studentId === s.id)!;
                    const vals = [sc.listening, sc.speaking, sc.reading, sc.writing].filter(v => v !== null) as number[];
                    const avg = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : "—";
                    return (
                      <tr key={s.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                        <td className="px-5 py-3">
                          <p className="font-semibold text-[#1a1a2e] dark:text-foreground">{s.name}</p>
                          <p className="text-[11px] font-mono text-muted-foreground">{s.code}</p>
                        </td>
                        {(["listening", "speaking", "reading", "writing"] as const).map(field => (
                          <td key={field} className="px-3 py-3 text-center">
                            <input type="number" min={0} max={10} step={0.5} value={sc[field] ?? ""} onChange={e => setScore(s.id, field, e.target.value)} className="w-16 text-center px-2 py-1.5 rounded-lg border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] font-semibold outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20" placeholder="—" />
                          </td>
                        ))}
                        <td className="px-3 py-3 text-center">
                          <span className={`text-[16px] font-extrabold ${parseFloat(avg) >= 5 ? "text-emerald-600" : avg === "—" ? "text-muted-foreground" : "text-rose-500"}`}>{avg}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 dark:border-border">
              <button onClick={handleSaveScores} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-[14px] flex items-center gap-2">
                <Save className="w-4 h-4" />Lưu bảng điểm
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

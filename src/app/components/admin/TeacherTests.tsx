import { useDocumentTitle } from "../../utils/hooks";
import { useState } from "react";
import { Plus, Eye, Edit2, Trash2, Play, Copy, X, CheckCircle, Clock, Users, BookOpen } from "lucide-react";
import { toast } from "sonner";

type TestStatus = "draft" | "active" | "closed";
type TestType = "quiz" | "midterm" | "final" | "practice";

interface Test {
  id: string;
  title: string;
  course: string;
  type: TestType;
  questionCount: number;
  duration: number; // minutes
  maxAttempts: number;
  passScore: number;
  status: TestStatus;
  startDate: string;
  endDate: string;
  submissions: number;
  avgScore: number | null;
}

const statusCfg: Record<TestStatus, { label: string; bg: string; text: string; dot: string }> = {
  draft:  { label: "Nháp",        bg: "bg-gray-100 dark:bg-white/5",            text: "text-gray-500",                       dot: "bg-gray-400"              },
  active: { label: "Đang mở",     bg: "bg-emerald-100 dark:bg-emerald-500/20",  text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500 animate-pulse" },
  closed: { label: "Đã đóng",     bg: "bg-blue-100 dark:bg-blue-500/20",        text: "text-blue-700 dark:text-blue-400",     dot: "bg-blue-500"              },
};

const typeCfg: Record<TestType, { label: string; bg: string; text: string }> = {
  quiz:     { label: "Bài kiểm tra",   bg: "bg-amber-100 dark:bg-amber-500/20",  text: "text-amber-700 dark:text-amber-400"  },
  midterm:  { label: "Giữa kỳ",        bg: "bg-violet-100 dark:bg-violet-500/20",text: "text-violet-700 dark:text-violet-400"},
  final:    { label: "Cuối kỳ",        bg: "bg-rose-100 dark:bg-rose-500/20",    text: "text-rose-700 dark:text-rose-400"    },
  practice: { label: "Luyện tập",      bg: "bg-cyan-100 dark:bg-cyan-500/20",    text: "text-cyan-700 dark:text-cyan-400"    },
};

const mockTests: Test[] = [
  { id: "T01", title: "Kiểm tra cuối Unit 1 – Greetings", course: "Tiếng Anh B1 VSTEP", type: "quiz",     questionCount: 20, duration: 30, maxAttempts: 2, passScore: 60, status: "closed", startDate: "10/01/2026", endDate: "12/01/2026", submissions: 28, avgScore: 74.5 },
  { id: "T02", title: "Kiểm tra giữa kỳ – VSTEP B1",      course: "Tiếng Anh B1 VSTEP", type: "midterm",  questionCount: 40, duration: 60, maxAttempts: 1, passScore: 70, status: "closed", startDate: "01/02/2026", endDate: "03/02/2026", submissions: 30, avgScore: 68.2 },
  { id: "T03", title: "Luyện tập TOEIC Part 5 – Grammar",  course: "TOEIC 450+",         type: "practice", questionCount: 30, duration: 45, maxAttempts: 5, passScore: 50, status: "active", startDate: "01/04/2026", endDate: "30/04/2026", submissions: 18, avgScore: 61.0 },
  { id: "T04", title: "Kiểm tra Unit 3 – Health & Body",    course: "Tiếng Anh B1 VSTEP", type: "quiz",     questionCount: 25, duration: 35, maxAttempts: 2, passScore: 60, status: "active", startDate: "05/04/2026", endDate: "08/04/2026", submissions: 12, avgScore: 77.3 },
  { id: "T05", title: "Luyện tập TOEIC Listening Part 1–2", course: "TOEIC 450+",         type: "practice", questionCount: 20, duration: 25, maxAttempts: 3, passScore: 50, status: "active", startDate: "01/04/2026", endDate: "15/04/2026", submissions: 20, avgScore: 55.5 },
  { id: "T06", title: "Kiểm tra cuối kỳ VSTEP B1 (Mock)",  course: "Tiếng Anh B1 VSTEP", type: "final",    questionCount: 60, duration: 90, maxAttempts: 1, passScore: 70, status: "draft",  startDate: "20/04/2026", endDate: "20/04/2026", submissions: 0, avgScore: null },
  { id: "T07", title: "Kiểm tra TOEIC Full Test #1",        course: "TOEIC 450+",         type: "final",    questionCount: 100, duration: 120, maxAttempts: 1, passScore: 450, status: "draft", startDate: "25/04/2026", endDate: "25/04/2026", submissions: 0, avgScore: null },
];

export function TeacherTests() {
  useDocumentTitle("Bài kiểm tra");
  const [tests, setTests] = useState(mockTests);
  const [filterStatus, setFilterStatus] = useState<TestStatus | "all">("all");
  const [filterCourse, setFilterCourse] = useState<string>("all");
  const [detail, setDetail] = useState<Test | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const courses = [...new Set(mockTests.map(t => t.course))];

  const displayed = tests.filter(t =>
    (filterStatus === "all" || t.status === filterStatus) &&
    (filterCourse === "all" || t.course === filterCourse)
  );

  const activateTest = (id: string) => {
    setTests(prev => prev.map(t => t.id === id ? { ...t, status: "active" as TestStatus } : t));
    toast.success("Bài kiểm tra đã được kích hoạt — học viên có thể làm bài");
  };

  const closeTest = (id: string) => {
    setTests(prev => prev.map(t => t.id === id ? { ...t, status: "closed" as TestStatus } : t));
    toast.success("Đã đóng bài kiểm tra");
  };

  const duplicateTest = (t: Test) => {
    const copy: Test = { ...t, id: `T${Date.now()}`, title: `[Sao chép] ${t.title}`, status: "draft", submissions: 0, avgScore: null };
    setTests(prev => [...prev, copy]);
    toast.success("Đã sao chép bài kiểm tra");
  };

  const totalActive = tests.filter(t => t.status === "active").length;
  const totalSubmissions = tests.reduce((s, t) => s + t.submissions, 0);

  return (
    <div className="pb-10">
      <div className="relative mb-6 p-6 rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-700 to-teal-700 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: "28px 28px" }} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-emerald-200 text-[13px] font-semibold mb-1 uppercase">Cổng Giáo viên</p>
            <h1 className="text-[24px] font-extrabold">Bài kiểm tra</h1>
            <p className="text-emerald-100/70 text-[14px] mt-1">Tạo và quản lý bài kiểm tra trực tuyến cho học viên</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl text-[14px] font-semibold transition-colors">
            <Plus className="w-4 h-4" /> Tạo bài kiểm tra
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Tổng bài kiểm tra", value: tests.length, color: "text-emerald-600" },
          { label: "Đang mở", value: totalActive, color: "text-emerald-500" },
          { label: "Bản nháp", value: tests.filter(t => t.status === "draft").length, color: "text-amber-600" },
          { label: "Lượt nộp bài", value: totalSubmissions, color: "text-violet-600" },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-4 text-center">
            <p className={`text-[26px] font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        {([["all", "Tất cả"], ["active", "Đang mở"], ["draft", "Nháp"], ["closed", "Đã đóng"]] as [TestStatus | "all", string][]).map(([v, l]) => (
          <button key={v} onClick={() => setFilterStatus(v)} className={`px-3 py-2 rounded-xl text-[13px] font-semibold transition-all ${filterStatus === v ? "bg-emerald-600 text-white" : "bg-white dark:bg-card border border-gray-200 dark:border-border text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/5"}`}>{l}</button>
        ))}
        <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)} className="ml-auto px-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-card text-[14px] outline-none">
          <option value="all">Tất cả khóa học</option>
          {courses.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {displayed.map(t => {
          const st = statusCfg[t.status];
          const tp = typeCfg[t.type];
          return (
            <div key={t.id} className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${st.bg} ${st.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{st.label}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${tp.bg} ${tp.text}`}>{tp.label}</span>
                  </div>
                  <h3 className="font-bold text-[16px] text-[#1a1a2e] dark:text-foreground">{t.title}</h3>
                  <div className="flex items-center gap-4 mt-1 text-[13px] text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{t.course}</span>
                    <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" />{t.questionCount} câu</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{t.duration} phút</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{t.submissions} nộp bài</span>
                    {t.avgScore !== null && <span className="font-semibold text-emerald-600">TB: {t.avgScore}đ</span>}
                  </div>
                  <p className="text-[12px] text-muted-foreground mt-1">{t.startDate} → {t.endDate} • Điểm đạt: {t.passScore}{t.type === "final" && t.course.includes("TOEIC") ? "" : "%"}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => setDetail(t)} className="p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-500/10 text-muted-foreground hover:text-blue-600 transition-colors"><Eye className="w-4 h-4" /></button>
                  <button onClick={() => duplicateTest(t)} className="p-2 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-500/10 text-muted-foreground hover:text-amber-600 transition-colors"><Copy className="w-4 h-4" /></button>
                  {t.status === "draft" && (
                    <button onClick={() => activateTest(t.id)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[13px] font-semibold flex items-center gap-1 transition-colors">
                      <Play className="w-3.5 h-3.5" /> Kích hoạt
                    </button>
                  )}
                  {t.status === "active" && (
                    <button onClick={() => closeTest(t.id)} className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[13px] font-semibold transition-colors">Đóng bài</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail panel */}
      {detail && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-end" onClick={() => setDetail(null)}>
          <div className="bg-white dark:bg-card h-full w-full max-w-md shadow-2xl p-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[18px]">Chi tiết bài kiểm tra</h3>
              <button onClick={() => setDetail(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex gap-2 mb-4 flex-wrap">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusCfg[detail.status].bg} ${statusCfg[detail.status].text}`}>{statusCfg[detail.status].label}</span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${typeCfg[detail.type].bg} ${typeCfg[detail.type].text}`}>{typeCfg[detail.type].label}</span>
            </div>
            <h4 className="font-bold text-[17px] mb-4">{detail.title}</h4>
            <div className="space-y-3 text-[14px]">
              {[
                ["Khóa học", detail.course],
                ["Số câu hỏi", `${detail.questionCount} câu`],
                ["Thời gian", `${detail.duration} phút`],
                ["Số lần làm tối đa", `${detail.maxAttempts} lần`],
                ["Điểm đạt", `${detail.passScore}${detail.type === "final" && detail.course.includes("TOEIC") ? " điểm" : "%"}`],
                ["Thời gian mở", `${detail.startDate}`],
                ["Thời gian đóng", `${detail.endDate}`],
                ["Số lượt nộp", `${detail.submissions}`],
                ["Điểm trung bình", detail.avgScore !== null ? `${detail.avgScore}` : "Chưa có"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-gray-50 dark:border-white/[0.03]">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-semibold text-[#1a1a2e] dark:text-foreground">{v}</span>
                </div>
              ))}
            </div>
            {detail.status === "draft" && (
              <button onClick={() => { activateTest(detail.id); setDetail(null); }} className="mt-6 w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2">
                <Play className="w-4 h-4" /> Kích hoạt bài kiểm tra
              </button>
            )}
          </div>
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white dark:bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[18px]">Tạo bài kiểm tra mới</h3>
              <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold mb-1">Tên bài kiểm tra</label>
                <input type="text" className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" placeholder="Nhập tên bài kiểm tra..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-semibold mb-1">Loại</label>
                  <select className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none">
                    {Object.entries(typeCfg).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold mb-1">Khóa học</label>
                  <select className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none">
                    {courses.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold mb-1">Thời gian (phút)</label>
                  <input type="number" defaultValue={45} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold mb-1">Điểm đạt (%)</label>
                  <input type="number" defaultValue={60} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold mb-1">Ngày mở</label>
                  <input type="date" className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold mb-1">Ngày đóng</label>
                  <input type="date" className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-border rounded-xl text-[14px] font-semibold hover:bg-gray-50">Hủy</button>
              <button onClick={() => { setShowCreate(false); toast.success("Đã tạo bài kiểm tra (Nháp) — chọn câu hỏi từ ngân hàng đề"); }} className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[14px] font-semibold">Tạo bài kiểm tra</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

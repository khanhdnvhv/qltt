import { useState, useMemo } from "react";
import { useDocumentTitle, useEscapeKey } from "../../utils/hooks";
import { AnimatePresence, motion } from "motion/react";
import {
  Search, Plus, X, FileText, Eye, Trash2, Upload, Database,
  CheckCircle, Clock, Archive, Edit2, Download, Copy, Shuffle
} from "lucide-react";
import { toast } from "sonner";

interface ExamPaper {
  id: string;
  code: string;
  name: string;
  subject: string;
  totalQuestions: number;
  duration: number;
  maxScore: number;
  passScore: number;
  versions: number;
  source: "upload" | "bank";
  status: "draft" | "approved" | "active" | "archived";
  createdBy: string;
  createdAt: string;
  usedInExams: string[];
}

const papers: ExamPaper[] = [
  { id: "1", code: "DT-2026-001", name: "Đề thi Tiếng Anh B1 VSTEP - Bộ 1", subject: "Tiếng Anh B1", totalQuestions: 60, duration: 120, maxScore: 10, passScore: 5, versions: 4, source: "bank", status: "active", createdBy: "Nguyễn Văn Đức", createdAt: "10/01/2026", usedInExams: ["KT-26-001"] },
  { id: "2", code: "DT-2026-002", name: "Đề thi TOEIC 450 - Bộ A", subject: "Tiếng Anh TOEIC", totalQuestions: 100, duration: 120, maxScore: 990, passScore: 450, versions: 2, source: "upload", status: "approved", createdBy: "Trần Thị Lan", createdAt: "12/01/2026", usedInExams: ["KT-26-004"] },
  { id: "3", code: "DT-2026-003", name: "Đề thi Tin học IC3 - Module Word", subject: "Tin học IC3", totalQuestions: 50, duration: 60, maxScore: 10, passScore: 7, versions: 3, source: "bank", status: "active", createdBy: "Phạm Xuân Bình", createdAt: "08/01/2026", usedInExams: ["KT-26-002"] },
  { id: "4", code: "DT-2026-004", name: "Đề thi Hàn Điện Giữa kỳ", subject: "Kỹ thuật Hàn", totalQuestions: 30, duration: 60, maxScore: 10, passScore: 5, versions: 1, source: "upload", status: "approved", createdBy: "Trần Văn Khánh", createdAt: "20/01/2026", usedInExams: ["KT-26-003"] },
  { id: "5", code: "DT-2026-005", name: "Đề thi Lập trình Web Cuối kỳ", subject: "Lập trình Web", totalQuestions: 5, duration: 150, maxScore: 10, passScore: 5, versions: 1, source: "upload", status: "draft", createdBy: "Lê Minh Hoàng", createdAt: "18/01/2026", usedInExams: [] },
  { id: "6", code: "DT-2025-015", name: "Đề thi Tiếng Nhật N4 - Bộ 1", subject: "Tiếng Nhật N4", totalQuestions: 90, duration: 105, maxScore: 180, passScore: 90, versions: 2, source: "bank", status: "archived", createdBy: "Vũ Ngọc Ánh", createdAt: "15/06/2025", usedInExams: ["KT-25-012", "KT-25-018"] },
  { id: "7", code: "DT-2026-006", name: "Đề thi Nấu ăn Cơ bản - Thực hành", subject: "Kỹ thuật Nấu ăn", totalQuestions: 10, duration: 90, maxScore: 10, passScore: 6, versions: 1, source: "upload", status: "draft", createdBy: "Hoàng Thu Hà", createdAt: "22/01/2026", usedInExams: [] },
  { id: "8", code: "DT-2026-007", name: "Đề thi Tin học IC3 - Module Excel", subject: "Tin học IC3", totalQuestions: 50, duration: 60, maxScore: 10, passScore: 7, versions: 3, source: "bank", status: "approved", createdBy: "Phạm Xuân Bình", createdAt: "22/01/2026", usedInExams: [] },
];

const statusCfg = {
  draft: { label: "Bản nháp", bg: "bg-gray-100 dark:bg-white/5", text: "text-gray-600 dark:text-gray-400", icon: FileText },
  approved: { label: "Đã duyệt", bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-700 dark:text-blue-400", icon: CheckCircle },
  active: { label: "Đang dùng", bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", icon: Clock },
  archived: { label: "Lưu trữ", bg: "bg-gray-100 dark:bg-white/5", text: "text-gray-500 dark:text-gray-500", icon: Archive },
};

export function AdminExamPapers() {
  useDocumentTitle("Quản lý Đề thi");
  const [data, setData] = useState<ExamPaper[]>(papers);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSource, setFilterSource] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", subject: "", totalQuestions: 40, duration: 90, passScore: 5, maxScore: 10, source: "bank" as "bank" | "upload" });

  useEscapeKey(() => { setAddOpen(false); setDetailId(null); }, addOpen || !!detailId);

  const filtered = useMemo(() => data.filter(d => {
    const s = search.toLowerCase();
    const matchSearch = !search || d.name.toLowerCase().includes(s) || d.subject.toLowerCase().includes(s) || d.code.toLowerCase().includes(s);
    const matchStatus = filterStatus === "all" || d.status === filterStatus;
    const matchSource = filterSource === "all" || d.source === filterSource;
    return matchSearch && matchStatus && matchSource;
  }), [data, search, filterStatus, filterSource]);

  const detail = data.find(d => d.id === detailId);

  const stats = {
    total: data.length,
    active: data.filter(d => d.status === "active").length,
    approved: data.filter(d => d.status === "approved").length,
    draft: data.filter(d => d.status === "draft").length,
  };

  const handleAdd = () => {
    if (!form.name || !form.subject) { toast.error("Vui lòng điền đầy đủ thông tin"); return; }
    const newPaper: ExamPaper = {
      id: String(data.length + 1),
      code: `DT-2026-${String(data.length + 1).padStart(3, "0")}`,
      createdBy: "Admin",
      createdAt: new Date().toLocaleDateString("vi-VN"),
      versions: 1,
      status: "draft",
      usedInExams: [],
      maxScore: form.maxScore,
      ...form,
    };
    setData(prev => [newPaper, ...prev]);
    setAddOpen(false);
    toast.success("Đã tạo đề thi mới");
  };

  const handleApprove = (id: string) => {
    setData(prev => prev.map(d => d.id === id ? { ...d, status: "approved" as const } : d));
    toast.success("Đề thi đã được phê duyệt");
  };

  const handleDelete = (id: string) => {
    setData(prev => prev.filter(d => d.id !== id));
    toast.success("Đã xóa đề thi");
  };

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="relative mb-6 p-6 rounded-2xl overflow-hidden bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: "28px 28px" }} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-amber-200 text-[13px] font-semibold mb-1 tracking-wide uppercase">Module Thi & Kiểm tra</p>
            <h1 className="text-[24px] font-extrabold">Quản lý Đề thi</h1>
            <p className="text-amber-100/70 text-[14px] mt-1">Upload đề thi hoặc sinh ngẫu nhiên từ ngân hàng câu hỏi</p>
          </div>
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white px-4 py-2.5 rounded-xl text-[14px] font-semibold transition-all">
            <Plus className="w-4 h-4" /> Tạo đề thi
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Tổng đề thi", value: stats.total },
          { label: "Đang dùng", value: stats.active },
          { label: "Đã duyệt", value: stats.approved },
          { label: "Bản nháp", value: stats.draft },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-4 text-center">
            <p className="text-[28px] font-extrabold text-amber-600">{s.value}</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm đề thi, môn, mã đề..." className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none">
          <option value="all">Tất cả trạng thái</option>
          <option value="draft">Bản nháp</option>
          <option value="approved">Đã duyệt</option>
          <option value="active">Đang dùng</option>
          <option value="archived">Lưu trữ</option>
        </select>
        <select value={filterSource} onChange={e => setFilterSource(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none">
          <option value="all">Tất cả nguồn</option>
          <option value="bank">Từ ngân hàng</option>
          <option value="upload">Upload thủ công</option>
        </select>
      </div>

      {/* Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(paper => {
          const st = statusCfg[paper.status];
          return (
            <div key={paper.id} className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-4 hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  {paper.source === "bank" ? <Database className="w-5 h-5 text-amber-500" /> : <Upload className="w-5 h-5 text-amber-500" />}
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${st.bg} ${st.text}`}>{st.label}</span>
              </div>
              <p className="font-bold text-[#1a1a2e] dark:text-foreground mb-0.5">{paper.name}</p>
              <p className="text-[12px] font-mono text-muted-foreground mb-3">{paper.code} · {paper.subject}</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  { label: "Số câu", value: paper.totalQuestions },
                  { label: "Thời gian", value: `${paper.duration}p` },
                  { label: "Điểm đậu", value: paper.passScore },
                  { label: "Phiên bản", value: `${paper.versions} bộ` },
                ].map(s => (
                  <div key={s.label} className="bg-gray-50 dark:bg-white/[0.03] rounded-lg px-2 py-1.5 text-center">
                    <p className="text-[16px] font-bold text-amber-600">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setDetailId(paper.id)} className="flex-1 py-1.5 text-[12px] font-semibold text-muted-foreground hover:text-[#1a1a2e] dark:hover:text-foreground rounded-lg border border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-1"><Eye className="w-3.5 h-3.5" /> Xem</button>
                {paper.status === "draft" && (
                  <>
                    <button onClick={() => handleApprove(paper.id)} className="flex-1 py-1.5 text-[12px] font-semibold text-blue-600 rounded-lg border border-blue-200 dark:border-blue-500/30 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors flex items-center justify-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Duyệt</button>
                    <button onClick={() => handleDelete(paper.id)} className="py-1.5 px-2.5 text-[12px] text-rose-500 rounded-lg border border-rose-200 dark:border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </>
                )}
                {paper.status === "approved" && (
                  <button onClick={() => { toast.success("Đã tạo bộ đề trộn từ phiên bản này"); }} className="flex-1 py-1.5 text-[12px] font-semibold text-amber-600 rounded-lg border border-amber-200 dark:border-amber-500/30 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors flex items-center justify-center gap-1"><Shuffle className="w-3.5 h-3.5" /> Trộn đề</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {addOpen && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAddOpen(false)} />
            <motion.div className="relative w-full max-w-md bg-white dark:bg-card rounded-2xl shadow-2xl overflow-hidden" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
              <div className="p-5 border-b border-gray-100 dark:border-border flex items-center justify-between">
                <h3 className="text-[17px] font-bold text-[#1a1a2e] dark:text-foreground">Tạo Đề thi mới</h3>
                <button onClick={() => setAddOpen(false)} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-[13px] font-semibold mb-1.5">Tên đề thi *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" placeholder="VD: Đề thi Tiếng Anh B1 - Bộ 2" />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold mb-1.5">Môn thi *</label>
                  <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" placeholder="Tiếng Anh B1, Tin học IC3..." />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold mb-1.5">Nguồn đề thi</label>
                  <div className="flex gap-3">
                    {[{ v: "bank", label: "Từ ngân hàng câu hỏi", icon: <Database className="w-4 h-4" /> }, { v: "upload", label: "Upload file đề", icon: <Upload className="w-4 h-4" /> }].map(o => (
                      <button key={o.v} onClick={() => setForm(f => ({ ...f, source: o.v as "bank" | "upload" }))} className={`flex-1 py-2.5 rounded-xl border text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-all ${form.source === o.v ? "border-amber-400 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400" : "border-gray-200 dark:border-border text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/5"}`}>{o.icon}{o.label}</button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[13px] font-semibold mb-1.5">Số câu hỏi</label>
                    <input type="number" value={form.totalQuestions} onChange={e => setForm(f => ({ ...f, totalQuestions: +e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold mb-1.5">Thời gian (phút)</label>
                    <input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: +e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" />
                  </div>
                </div>
              </div>
              <div className="p-5 border-t border-gray-100 dark:border-border flex gap-3">
                <button onClick={() => setAddOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-border text-[14px] font-semibold hover:bg-gray-50 dark:hover:bg-white/5">Hủy</button>
                <button onClick={handleAdd} className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[14px] font-semibold">Tạo đề thi</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

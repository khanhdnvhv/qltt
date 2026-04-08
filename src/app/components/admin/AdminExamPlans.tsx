import { useState, useMemo } from "react";
import { useDocumentTitle, useEscapeKey } from "../../utils/hooks";
import { useUrlFilters } from "../../utils/useUrlFilters";
import { useUrlPagination } from "../../utils/useUrlPagination";
import { AnimatePresence, motion } from "motion/react";
import {
  Search, Plus, X, FileText, CheckCircle, Clock, PlayCircle,
  CheckSquare, AlertCircle, Eye, Edit2, Trash2, CalendarDays,
  Users, MapPin, BookOpen, ChevronRight, Download, Filter
} from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "./Pagination";

interface ExamPlan {
  id: string;
  code: string;
  name: string;
  course: string;
  centerName: string;
  subject: string;
  examType: "Kết thúc khóa" | "Giữa kỳ" | "Sát hạch cấp chứng chỉ";
  plannedDate: string;
  duration: number;
  totalCandidates: number;
  rooms: number;
  status: "draft" | "approved" | "ongoing" | "done" | "cancelled";
  createdAt: string;
  note: string;
}

const initialPlans: ExamPlan[] = [
  { id: "1", code: "KT-26-001", name: "Kỳ thi Tiếng Anh B1 VSTEP Q1/2026", course: "Tiếng Anh B1 VSTEP Cấp tốc", centerName: "TT Ngoại ngữ VUS", subject: "Tiếng Anh", examType: "Sát hạch cấp chứng chỉ", plannedDate: "15/03/2026", duration: 120, totalCandidates: 85, rooms: 3, status: "approved", createdAt: "05/01/2026", note: "Kỳ thi theo chuẩn VSTEP Bộ GD&ĐT" },
  { id: "2", code: "KT-26-002", name: "Kỳ thi Tin học IC3 Tháng 2", course: "Tin học Văn phòng IC3", centerName: "TT Tin học Hùng Vương", subject: "Tin học", examType: "Sát hạch cấp chứng chỉ", plannedDate: "20/02/2026", duration: 90, totalCandidates: 60, rooms: 2, status: "done", createdAt: "08/01/2026", note: "" },
  { id: "3", code: "KT-26-003", name: "Thi Giữa kỳ Hàn Điện Cơ bản", course: "Kỹ thuật Hàn Điện", centerName: "TT GDNN-GDTX Quận 1", subject: "Hàn Điện", examType: "Giữa kỳ", plannedDate: "28/02/2026", duration: 60, totalCandidates: 32, rooms: 2, status: "done", createdAt: "10/01/2026", note: "" },
  { id: "4", code: "KT-26-004", name: "Kỳ thi TOEIC 450 Tháng 3", course: "Luyện thi TOEIC 450+", centerName: "TT Ngoại ngữ Sakura", subject: "Tiếng Anh TOEIC", examType: "Sát hạch cấp chứng chỉ", plannedDate: "22/03/2026", duration: 120, totalCandidates: 45, rooms: 2, status: "approved", createdAt: "12/01/2026", note: "Phối hợp ETS Vietnam" },
  { id: "5", code: "KT-26-005", name: "Thi Kết thúc Nấu ăn Cơ bản", course: "Kỹ thuật Nấu ăn 3 tháng", centerName: "TT GDNN-GDTX Tân Bình", subject: "Kỹ thuật Nấu ăn", examType: "Kết thúc khóa", plannedDate: "10/04/2026", duration: 90, totalCandidates: 24, rooms: 1, status: "ongoing", createdAt: "14/01/2026", note: "" },
  { id: "6", code: "KT-26-006", name: "Kỳ thi Lập trình Web Frontend", course: "Lập trình Web Frontend Fulltime", centerName: "TT Tin học Hùng Vương", subject: "Lập trình", examType: "Kết thúc khóa", plannedDate: "18/04/2026", duration: 150, totalCandidates: 28, rooms: 2, status: "draft", createdAt: "16/01/2026", note: "Thi thực hành trên máy" },
  { id: "7", code: "KT-26-007", name: "Sát hạch Tiếng Nhật N4", course: "Tiếng Nhật JLPT N4", centerName: "TT Ngoại ngữ Sakura", subject: "Tiếng Nhật", examType: "Sát hạch cấp chứng chỉ", plannedDate: "25/04/2026", duration: 105, totalCandidates: 38, rooms: 2, status: "draft", createdAt: "18/01/2026", note: "" },
  { id: "8", code: "KT-26-008", name: "Thi Phổ cập GDTX Kỳ 1/2026", course: "Bổ túc THPT Kỳ 1", centerName: "TT GDNN-GDTX Quận 1", subject: "Nhiều môn", examType: "Kết thúc khóa", plannedDate: "30/05/2026", duration: 180, totalCandidates: 120, rooms: 5, status: "draft", createdAt: "20/01/2026", note: "Gồm: Toán, Văn, Anh, Lý" },
];

const statusCfg = {
  draft: { label: "Bản nháp", bg: "bg-gray-100 dark:bg-white/5", text: "text-gray-600 dark:text-gray-400", dot: "bg-gray-400", icon: FileText },
  approved: { label: "Đã phê duyệt", bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500", icon: CheckCircle },
  ongoing: { label: "Đang diễn ra", bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500", icon: PlayCircle },
  done: { label: "Đã kết thúc", bg: "bg-violet-50 dark:bg-violet-500/10", text: "text-violet-700 dark:text-violet-400", dot: "bg-violet-500", icon: CheckSquare },
  cancelled: { label: "Đã hủy", bg: "bg-rose-50 dark:bg-rose-500/10", text: "text-rose-700 dark:text-rose-400", dot: "bg-rose-500", icon: X },
};

const examTypes = ["Tất cả", "Kết thúc khóa", "Giữa kỳ", "Sát hạch cấp chứng chỉ"];
const statusList = ["all", "draft", "approved", "ongoing", "done", "cancelled"];

export function AdminExamPlans() {
  useDocumentTitle("Kế hoạch Thi");
  const [plans, setPlans] = useState<ExamPlan[]>(initialPlans);
  const [search, setSearch] = useState("");
  const [filters, setFilter] = useUrlFilters({ status: "all", type: "all" });
  const { page, pageSize, setPage } = useUrlPagination();

  const [detailId, setDetailId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", course: "", subject: "", examType: "Sát hạch cấp chứng chỉ" as ExamPlan["examType"], plannedDate: "", duration: 90, totalCandidates: 0, rooms: 1, note: "" });

  useEscapeKey(() => { setDetailId(null); setAddOpen(false); setEditId(null); setDeleteId(null); }, !!(detailId || addOpen || editId || deleteId));

  const filtered = useMemo(() => plans.filter(p => {
    const s = search.toLowerCase();
    const matchSearch = !search || p.name.toLowerCase().includes(s) || p.code.toLowerCase().includes(s) || p.subject.toLowerCase().includes(s);
    const matchStatus = filters.status === "all" || p.status === filters.status;
    const matchType = filters.type === "all" || p.examType === filters.type;
    return matchSearch && matchStatus && matchType;
  }), [plans, search, filters]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const stats = useMemo(() => ({
    total: plans.length,
    approved: plans.filter(p => p.status === "approved").length,
    ongoing: plans.filter(p => p.status === "ongoing").length,
    totalCandidates: plans.reduce((s, p) => s + p.totalCandidates, 0),
  }), [plans]);

  const detail = plans.find(p => p.id === detailId);
  const editPlan = plans.find(p => p.id === editId);

  const handleAdd = () => {
    if (!form.name || !form.plannedDate) { toast.error("Vui lòng điền đầy đủ thông tin bắt buộc"); return; }
    const newPlan: ExamPlan = {
      id: String(plans.length + 1),
      code: `KT-26-${String(plans.length + 1).padStart(3, "0")}`,
      centerName: "TT Ngoại ngữ VUS",
      status: "draft",
      createdAt: new Date().toLocaleDateString("vi-VN"),
      ...form,
    };
    setPlans(prev => [newPlan, ...prev]);
    setAddOpen(false);
    setForm({ name: "", course: "", subject: "", examType: "Sát hạch cấp chứng chỉ", plannedDate: "", duration: 90, totalCandidates: 0, rooms: 1, note: "" });
    toast.success("Đã tạo kế hoạch thi mới");
  };

  const handleApprove = (id: string) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, status: "approved" as const } : p));
    toast.success("Kế hoạch thi đã được phê duyệt");
  };

  const handleDelete = (id: string) => {
    setPlans(prev => prev.filter(p => p.id !== id));
    setDeleteId(null);
    toast.success("Đã xóa kế hoạch thi");
  };

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="relative mb-6 p-6 rounded-2xl overflow-hidden bg-gradient-to-r from-rose-600 to-pink-700 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: "28px 28px" }} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-rose-200 text-[13px] font-semibold mb-1 tracking-wide uppercase">Module Thi & Kiểm tra</p>
            <h1 className="text-[24px] font-extrabold">Kế hoạch Thi</h1>
            <p className="text-rose-100/70 text-[14px] mt-1">Lập và theo dõi kế hoạch tổ chức thi, sát hạch chứng chỉ</p>
          </div>
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white px-4 py-2.5 rounded-xl text-[14px] font-semibold transition-all">
            <Plus className="w-4 h-4" /> Tạo kế hoạch
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Tổng kỳ thi", value: stats.total, icon: CalendarDays, color: "text-rose-500", bg: "bg-rose-500/10" },
          { label: "Đã phê duyệt", value: stats.approved, icon: CheckCircle, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Đang diễn ra", value: stats.ongoing, icon: PlayCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Tổng thí sinh", value: stats.totalCandidates.toLocaleString("vi-VN"), icon: Users, color: "text-violet-500", bg: "bg-violet-500/10" },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-[22px] font-extrabold text-[#1a1a2e] dark:text-foreground leading-none">{s.value}</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kỳ thi, môn, mã kế hoạch..." className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400" />
        </div>
        <select value={filters.status} onChange={e => setFilter("status", e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none">
          <option value="all">Tất cả trạng thái</option>
          {statusList.slice(1).map(s => <option key={s} value={s}>{statusCfg[s as keyof typeof statusCfg].label}</option>)}
        </select>
        <select value={filters.type} onChange={e => setFilter("type", e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none">
          {examTypes.map(t => <option key={t} value={t === "Tất cả" ? "all" : t}>{t}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[14px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-border bg-gray-50/50 dark:bg-white/[0.02]">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-[12px] uppercase tracking-wide">Mã / Kỳ thi</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-[12px] uppercase tracking-wide">Môn / Loại</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-[12px] uppercase tracking-wide hidden md:table-cell">Ngày thi</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-[12px] uppercase tracking-wide hidden lg:table-cell">Thí sinh / Phòng</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-[12px] uppercase tracking-wide">Trạng thái</th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground text-[12px] uppercase tracking-wide">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/[0.03]">
              {paginated.map(plan => {
                const st = statusCfg[plan.status];
                return (
                  <tr key={plan.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-[#1a1a2e] dark:text-foreground">{plan.name}</p>
                      <p className="text-[12px] text-muted-foreground font-mono mt-0.5">{plan.code} · {plan.centerName}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-[#1a1a2e] dark:text-foreground">{plan.subject}</p>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[11px] font-semibold">{plan.examType}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-[#1a1a2e] dark:text-foreground">
                        <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                        {plan.plannedDate}
                      </div>
                      <p className="text-[12px] text-muted-foreground mt-0.5">{plan.duration} phút</p>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-[13px]"><Users className="w-3.5 h-3.5 text-muted-foreground" /> {plan.totalCandidates}</span>
                        <span className="flex items-center gap-1 text-[13px]"><MapPin className="w-3.5 h-3.5 text-muted-foreground" /> {plan.rooms} phòng</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold ${st.bg} ${st.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setDetailId(plan.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors" title="Xem chi tiết"><Eye className="w-4 h-4 text-muted-foreground" /></button>
                        {plan.status === "draft" && (
                          <>
                            <button onClick={() => handleApprove(plan.id)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors" title="Phê duyệt"><CheckCircle className="w-4 h-4 text-blue-500" /></button>
                            <button onClick={() => setDeleteId(plan.id)} className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors" title="Xóa"><Trash2 className="w-4 h-4 text-rose-500" /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr><td colSpan={6} className="py-16 text-center text-muted-foreground"><AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-30" /><p>Không tìm thấy kế hoạch thi nào</p></td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-100 dark:border-border px-4 py-3">
          <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} onPageSizeChange={() => {}} />
        </div>
      </div>

      {/* Detail Drawer */}
      <AnimatePresence>
        {detail && (
          <motion.div className="fixed inset-0 z-50 flex" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDetailId(null)} />
            <motion.div className="relative ml-auto w-full max-w-lg bg-white dark:bg-card h-full overflow-y-auto shadow-2xl" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 300 }}>
              <div className="p-6 border-b border-gray-100 dark:border-border flex items-start justify-between">
                <div>
                  <p className="text-[12px] font-mono text-muted-foreground">{detail.code}</p>
                  <h3 className="text-[18px] font-bold text-[#1a1a2e] dark:text-foreground mt-0.5">{detail.name}</h3>
                </div>
                <button onClick={() => setDetailId(null)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Trung tâm", value: detail.centerName },
                    { label: "Khóa học", value: detail.course },
                    { label: "Môn thi", value: detail.subject },
                    { label: "Loại kỳ thi", value: detail.examType },
                    { label: "Ngày thi", value: detail.plannedDate },
                    { label: "Thời gian", value: `${detail.duration} phút` },
                    { label: "Số thí sinh", value: `${detail.totalCandidates} người` },
                    { label: "Số phòng thi", value: `${detail.rooms} phòng` },
                  ].map(item => (
                    <div key={item.label} className="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-3">
                      <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">{item.label}</p>
                      <p className="text-[14px] font-semibold text-[#1a1a2e] dark:text-foreground mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>
                {detail.note && (
                  <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl p-4">
                    <p className="text-[12px] font-semibold text-amber-700 dark:text-amber-400 uppercase mb-1">Ghi chú</p>
                    <p className="text-[14px] text-amber-800 dark:text-amber-300">{detail.note}</p>
                  </div>
                )}
                {detail.status === "draft" && (
                  <button onClick={() => { handleApprove(detail.id); setDetailId(null); }} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-[14px] transition-colors flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Phê duyệt kế hoạch
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Modal */}
      <AnimatePresence>
        {addOpen && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAddOpen(false)} />
            <motion.div className="relative w-full max-w-lg bg-white dark:bg-card rounded-2xl shadow-2xl overflow-hidden" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}>
              <div className="p-5 border-b border-gray-100 dark:border-border flex items-center justify-between">
                <h3 className="text-[17px] font-bold text-[#1a1a2e] dark:text-foreground">Tạo Kế hoạch Thi</h3>
                <button onClick={() => setAddOpen(false)} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-[13px] font-semibold text-[#1a1a2e] dark:text-foreground mb-1.5">Tên kỳ thi *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400" placeholder="VD: Kỳ thi Tiếng Anh B1 Q2/2026" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[13px] font-semibold text-[#1a1a2e] dark:text-foreground mb-1.5">Môn thi *</label>
                    <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none focus:ring-2 focus:ring-rose-500/20" placeholder="Tiếng Anh, Tin học..." />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-[#1a1a2e] dark:text-foreground mb-1.5">Ngày thi *</label>
                    <input type="date" value={form.plannedDate} onChange={e => setForm(f => ({ ...f, plannedDate: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none focus:ring-2 focus:ring-rose-500/20" />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[#1a1a2e] dark:text-foreground mb-1.5">Loại kỳ thi</label>
                  <select value={form.examType} onChange={e => setForm(f => ({ ...f, examType: e.target.value as ExamPlan["examType"] }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none">
                    <option>Sát hạch cấp chứng chỉ</option>
                    <option>Kết thúc khóa</option>
                    <option>Giữa kỳ</option>
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[13px] font-semibold text-[#1a1a2e] dark:text-foreground mb-1.5">Thời gian (phút)</label>
                    <input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: +e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-[#1a1a2e] dark:text-foreground mb-1.5">Số thí sinh</label>
                    <input type="number" value={form.totalCandidates} onChange={e => setForm(f => ({ ...f, totalCandidates: +e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-[#1a1a2e] dark:text-foreground mb-1.5">Số phòng thi</label>
                    <input type="number" value={form.rooms} onChange={e => setForm(f => ({ ...f, rooms: +e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[#1a1a2e] dark:text-foreground mb-1.5">Ghi chú</label>
                  <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} rows={3} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none resize-none" placeholder="Ghi chú về kỳ thi..." />
                </div>
              </div>
              <div className="p-5 border-t border-gray-100 dark:border-border flex gap-3">
                <button onClick={() => setAddOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-border text-[14px] font-semibold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Hủy</button>
                <button onClick={handleAdd} className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[14px] font-semibold transition-colors">Tạo kế hoạch</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteId && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
            <motion.div className="relative w-full max-w-sm bg-white dark:bg-card rounded-2xl shadow-2xl p-6 text-center" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="w-6 h-6 text-rose-500" /></div>
              <h3 className="text-[17px] font-bold mb-2 text-[#1a1a2e] dark:text-foreground">Xóa kế hoạch thi?</h3>
              <p className="text-[14px] text-muted-foreground mb-5">Hành động này không thể hoàn tác.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-border font-semibold text-[14px] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Hủy</button>
                <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[14px] transition-colors">Xóa</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

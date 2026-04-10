import { useState, useMemo } from "react";
import { useDocumentTitle, useEscapeKey } from "../../utils/hooks";
import { useUrlPagination } from "../../utils/useUrlPagination";
import { AnimatePresence, motion } from "motion/react";
import {
  Search, Plus, X, CreditCard, CheckCircle, Clock, AlertCircle,
  Trash2, Eye, TrendingUp, Users, Banknote, CalendarDays, Edit2, BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "./Pagination";
import { useAppData, type AppFeePeriod as FeePeriod } from "../../context/AppDataContext";

const statusCfg = {
  draft: { label: "Bản nháp", bg: "bg-gray-100 dark:bg-white/5", text: "text-gray-600 dark:text-gray-400", dot: "bg-gray-400" },
  open: { label: "Đang thu", bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500" },
  overdue: { label: "Quá hạn", bg: "bg-rose-50 dark:bg-rose-500/10", text: "text-rose-700 dark:text-rose-400", dot: "bg-rose-500" },
  closed: { label: "Đã đóng", bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
};

const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

export function AdminFeePeriods() {
  useDocumentTitle("Đợt Thu học phí");
  const { feePeriods: data, addFeePeriod, updateFeePeriodStatus } = useAppData();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const { page, pageSize, setPage } = useUrlPagination();
  const [addOpen, setAddOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", courseId: "", courseName: "", startDate: "", dueDate: "", amount: 0, totalStudents: 0, note: "" });

  useEscapeKey(() => { setAddOpen(false); setDetailId(null); }, addOpen || !!detailId);

  const filtered = useMemo(() => data.filter(d => {
    const s = search.toLowerCase();
    const matchSearch = !search || d.name.toLowerCase().includes(s) || d.code.toLowerCase().includes(s) || d.courseName.toLowerCase().includes(s);
    const matchStatus = filterStatus === "all" || d.status === filterStatus;
    return matchSearch && matchStatus;
  }), [data, search, filterStatus]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const stats = useMemo(() => ({
    total: data.length,
    open: data.filter(d => d.status === "open").length,
    overdue: data.filter(d => d.status === "overdue").length,
    totalCollected: data.reduce((s, d) => s + d.collectedAmount, 0),
  }), [data]);

  const detail = data.find(d => d.id === detailId);

  const handleAdd = () => {
    if (!form.name || !form.dueDate) { toast.error("Vui lòng điền đầy đủ thông tin"); return; }
    addFeePeriod({ ...form, paymentMethods: ["Tiền mặt", "Chuyển khoản"], status: "draft" });
    setAddOpen(false);
    setForm({ name: "", courseId: "", courseName: "", startDate: "", dueDate: "", amount: 0, totalStudents: 0, note: "" });
    toast.success("Đã tạo đợt thu mới");
  };

  const handleOpen = (id: string) => {
    updateFeePeriodStatus(id, "open");
    toast.success("Đã mở đợt thu học phí");
  };

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="relative mb-6 p-6 rounded-2xl overflow-hidden bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: "28px 28px" }} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-green-200 text-[13px] font-semibold mb-1 tracking-wide uppercase">Module Quản lý Học phí</p>
            <h1 className="text-[24px] font-extrabold">Đợt Thu Học phí</h1>
            <p className="text-green-100/70 text-[14px] mt-1">Tạo và theo dõi các đợt thu theo khóa học, kỳ học</p>
          </div>
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white px-4 py-2.5 rounded-xl text-[14px] font-semibold transition-all">
            <Plus className="w-4 h-4" /> Tạo đợt thu
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Tổng đợt thu", value: stats.total, sub: "đợt thu", icon: CreditCard, color: "text-green-600", bg: "bg-green-500/10" },
          { label: "Đang thu", value: stats.open, sub: "đợt đang mở", icon: Clock, color: "text-blue-600", bg: "bg-blue-500/10" },
          { label: "Quá hạn", value: stats.overdue, sub: "cần xử lý", icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-500/10" },
          { label: "Đã thu được", value: `${(stats.totalCollected / 1e9).toFixed(2)} tỷ`, sub: "tổng doanh thu", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-500/10" },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className={`text-[20px] font-extrabold ${s.color} leading-none`}>{s.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm đợt thu, khóa học..." className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[["all", "Tất cả"], ["open", "Đang thu"], ["overdue", "Quá hạn"], ["closed", "Đã đóng"], ["draft", "Nháp"]].map(([v, l]) => (
            <button key={v} onClick={() => setFilterStatus(v)} className={`px-3 py-1.5 rounded-full text-[13px] font-semibold transition-all ${filterStatus === v ? "bg-green-600 text-white" : "bg-gray-100 dark:bg-white/5 text-muted-foreground hover:bg-gray-200 dark:hover:bg-white/10"}`}>{l}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[14px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-border bg-gray-50/50 dark:bg-white/[0.02]">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-[12px] uppercase tracking-wide">Đợt thu / Khóa học</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-[12px] uppercase tracking-wide hidden md:table-cell">Thời hạn</th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground text-[12px] uppercase tracking-wide">Học phí</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-[12px] uppercase tracking-wide hidden lg:table-cell">Tiến độ thu</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-[12px] uppercase tracking-wide">Trạng thái</th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground text-[12px] uppercase tracking-wide">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/[0.03]">
              {paginated.map(p => {
                const st = statusCfg[p.status];
                const pct = p.totalStudents ? Math.round((p.paidCount / p.totalStudents) * 100) : 0;
                return (
                  <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-[#1a1a2e] dark:text-foreground">{p.name}</p>
                      <p className="text-[12px] text-muted-foreground mt-0.5">{p.code} · {p.courseName}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <p className="text-[13px]">{p.startDate} → {p.dueDate}</p>
                      {p.status === "overdue" && <p className="text-[11px] text-rose-500 font-semibold mt-0.5">⚠ Đã quá hạn!</p>}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <p className="font-bold text-green-700 dark:text-green-400">{fmt(p.amount)}</p>
                      <p className="text-[11px] text-muted-foreground">/học viên</p>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${pct === 100 ? "bg-emerald-500" : pct >= 80 ? "bg-blue-500" : pct >= 50 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[12px] font-semibold text-muted-foreground w-10 text-right">{pct}%</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{p.paidCount}/{p.totalStudents} HV đã nộp · {fmt(p.collectedAmount)}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold ${st.bg} ${st.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setDetailId(p.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"><Eye className="w-4 h-4 text-muted-foreground" /></button>
                        {p.status === "draft" && <button onClick={() => handleOpen(p.id)} className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-500/10"><CheckCircle className="w-4 h-4 text-green-500" /></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
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
            <motion.div className="relative ml-auto w-full max-w-md bg-white dark:bg-card h-full overflow-y-auto shadow-2xl" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 300 }}>
              <div className="p-5 border-b border-gray-100 dark:border-border flex items-start justify-between">
                <div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold mb-2 ${statusCfg[detail.status].bg} ${statusCfg[detail.status].text}`}>{statusCfg[detail.status].label}</span>
                  <h3 className="text-[17px] font-bold text-[#1a1a2e] dark:text-foreground">{detail.name}</h3>
                  <p className="text-[12px] font-mono text-muted-foreground">{detail.code}</p>
                </div>
                <button onClick={() => setDetailId(null)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Khóa học", value: detail.courseName },
                    { label: "Học phí/HV", value: fmt(detail.amount) },
                    { label: "Ngày mở", value: detail.startDate },
                    { label: "Hạn nộp", value: detail.dueDate },
                    { label: "Tổng HV", value: `${detail.totalStudents} người` },
                    { label: "Đã nộp", value: `${detail.paidCount} người` },
                  ].map(item => (
                    <div key={item.label} className="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-3">
                      <p className="text-[11px] text-muted-foreground font-semibold uppercase">{item.label}</p>
                      <p className="text-[14px] font-semibold text-[#1a1a2e] dark:text-foreground mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-green-50 dark:bg-green-500/10 rounded-xl p-4">
                  <p className="text-[12px] font-semibold text-green-700 dark:text-green-400 uppercase mb-1">Đã thu được</p>
                  <p className="text-[24px] font-extrabold text-green-700 dark:text-green-400">{fmt(detail.collectedAmount)}</p>
                  <div className="mt-2 h-2 bg-green-200 dark:bg-green-700/30 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${detail.totalStudents ? Math.round(detail.paidCount / detail.totalStudents * 100) : 0}%` }} />
                  </div>
                </div>
                {detail.note && <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl p-3 text-[13px] text-amber-700 dark:text-amber-300">{detail.note}</div>}
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
            <motion.div className="relative w-full max-w-md bg-white dark:bg-card rounded-2xl shadow-2xl overflow-hidden" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
              <div className="p-5 border-b border-gray-100 dark:border-border flex items-center justify-between">
                <h3 className="text-[17px] font-bold text-[#1a1a2e] dark:text-foreground">Tạo Đợt Thu mới</h3>
                <button onClick={() => setAddOpen(false)} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div><label className="block text-[13px] font-semibold mb-1.5">Tên đợt thu *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" placeholder="VD: Học phí Kỳ 2 - Tiếng Anh" /></div>
                <div><label className="block text-[13px] font-semibold mb-1.5">Khóa học</label><input value={form.courseName} onChange={e => setForm(f => ({ ...f, courseName: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" placeholder="Tên khóa học" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-[13px] font-semibold mb-1.5">Ngày mở *</label><input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" /></div>
                  <div><label className="block text-[13px] font-semibold mb-1.5">Hạn nộp *</label><input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-[13px] font-semibold mb-1.5">Học phí (đồng)</label><input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: +e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" /></div>
                  <div><label className="block text-[13px] font-semibold mb-1.5">Số học viên</label><input type="number" value={form.totalStudents} onChange={e => setForm(f => ({ ...f, totalStudents: +e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" /></div>
                </div>
              </div>
              <div className="p-5 border-t border-gray-100 dark:border-border flex gap-3">
                <button onClick={() => setAddOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-border text-[14px] font-semibold hover:bg-gray-50 dark:hover:bg-white/5">Hủy</button>
                <button onClick={handleAdd} className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-[14px] font-semibold">Tạo đợt thu</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

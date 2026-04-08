import { useState, useMemo } from "react";
import { useDocumentTitle, useEscapeKey } from "../../utils/hooks";
import { useUrlPagination } from "../../utils/useUrlPagination";
import { AnimatePresence, motion } from "motion/react";
import {
  Search, Plus, X, RefreshCw, CheckCircle, Clock, Banknote,
  CreditCard, Eye, Printer, AlertTriangle, ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "./Pagination";

interface FeeRefund {
  id: string;
  refundCode: string;
  studentName: string;
  studentCode: string;
  reason: "Bảo lưu" | "Thôi học" | "Lỗi hệ thống" | "Khác";
  originalAmount: number;
  refundPercent: number;
  refundAmount: number;
  paymentMethod: "Tiền mặt" | "Chuyển khoản";
  refundDate: string;
  approvedBy: string;
  note: string;
  status: "pending" | "approved" | "paid" | "rejected";
}

const refunds: FeeRefund[] = [
  { id: "1", refundCode: "PT-R-001", studentName: "Lý Gia Hân", studentCode: "HV-26-0003", reason: "Bảo lưu", originalAmount: 3200000, refundPercent: 70, refundAmount: 2240000, paymentMethod: "Tiền mặt", refundDate: "20/02/2026", approvedBy: "Nguyễn Thị Thanh", note: "Bảo lưu 6 tháng theo chính sách TT", status: "paid" },
  { id: "2", refundCode: "PT-R-002", studentName: "Phạm Bình Minh", studentCode: "HV-26-0004", reason: "Thôi học", originalAmount: 3200000, refundPercent: 50, refundAmount: 1600000, paymentMethod: "Chuyển khoản", refundDate: "25/02/2026", approvedBy: "Giám đốc TT", note: "Thôi học sau tuần 6 — hoàn 50% học phí còn lại", status: "paid" },
  { id: "3", refundCode: "PT-R-003", studentName: "Trương Minh Khoa", studentCode: "HV-26-0018", reason: "Bảo lưu", originalAmount: 4200000, refundPercent: 80, refundAmount: 3360000, paymentMethod: "Chuyển khoản", refundDate: "01/03/2026", approvedBy: "Nguyễn Thị Thanh", note: "Bảo lưu lý do bệnh — có giấy tờ y tế", status: "approved" },
  { id: "4", refundCode: "PT-R-004", studentName: "Đinh Thị Nhung", studentCode: "HV-26-0022", reason: "Thôi học", originalAmount: 4800000, refundPercent: 30, refundAmount: 1440000, paymentMethod: "Tiền mặt", refundDate: "10/03/2026", approvedBy: "", note: "Thôi học tuần thứ 10 — hoàn theo bậc thang", status: "pending" },
  { id: "5", refundCode: "PT-R-005", studentName: "Bùi Thị Cẩm Tú", studentCode: "HV-26-0031", reason: "Lỗi hệ thống", originalAmount: 2800000, refundPercent: 100, refundAmount: 2800000, paymentMethod: "Chuyển khoản", refundDate: "12/03/2026", approvedBy: "Phạm Văn Hùng", note: "Thu trùng 2 lần — hoàn toàn bộ lần thu 2", status: "approved" },
  { id: "6", refundCode: "PT-R-006", studentName: "Ngô Đức Long", studentCode: "HV-26-0039", reason: "Thôi học", originalAmount: 3500000, refundPercent: 0, refundAmount: 0, paymentMethod: "Tiền mặt", refundDate: "14/03/2026", approvedBy: "Giám đốc TT", note: "Thôi học sau 80% khóa — không hoàn phí theo quy định", status: "rejected" },
];

const statusCfg = {
  pending: { label: "Chờ duyệt", bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
  approved: { label: "Đã duyệt", bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500" },
  paid: { label: "Đã hoàn trả", bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  rejected: { label: "Từ chối", bg: "bg-rose-50 dark:bg-rose-500/10", text: "text-rose-700 dark:text-rose-400", dot: "bg-rose-500" },
};

const reasonColor: Record<string, string> = {
  "Bảo lưu": "text-amber-600 bg-amber-500/10",
  "Thôi học": "text-rose-600 bg-rose-500/10",
  "Lỗi hệ thống": "text-blue-600 bg-blue-500/10",
  "Khác": "text-gray-600 bg-gray-500/10",
};

const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

export function AdminFeeRefunds() {
  useDocumentTitle("Phiếu Trả Học phí");
  const [data, setData] = useState<FeeRefund[]>(refunds);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const { page, pageSize, setPage } = useUrlPagination();
  const [addOpen, setAddOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [form, setForm] = useState({ studentName: "", studentCode: "", reason: "Bảo lưu" as FeeRefund["reason"], originalAmount: 0, refundPercent: 70, paymentMethod: "Chuyển khoản" as FeeRefund["paymentMethod"], note: "" });

  useEscapeKey(() => { setAddOpen(false); setDetailId(null); }, addOpen || !!detailId);

  const filtered = useMemo(() => data.filter(d => {
    const s = search.toLowerCase();
    const matchSearch = !search || d.studentName.toLowerCase().includes(s) || d.refundCode.toLowerCase().includes(s) || d.studentCode.toLowerCase().includes(s);
    const matchStatus = filterStatus === "all" || d.status === filterStatus;
    return matchSearch && matchStatus;
  }), [data, search, filterStatus]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const detail = data.find(d => d.id === detailId);
  const stats = {
    total: data.length,
    pending: data.filter(d => d.status === "pending").length,
    totalRefunded: data.filter(d => d.status === "paid").reduce((s, d) => s + d.refundAmount, 0),
  };

  const handleApprove = (id: string) => {
    setData(prev => prev.map(d => d.id === id ? { ...d, status: "approved" as const, approvedBy: "Admin" } : d));
    toast.success("Đã duyệt phiếu hoàn trả");
  };

  const handleMarkPaid = (id: string) => {
    setData(prev => prev.map(d => d.id === id ? { ...d, status: "paid" as const } : d));
    toast.success("Đã xác nhận hoàn trả tiền");
  };

  const handleAdd = () => {
    if (!form.studentName || form.originalAmount <= 0) { toast.error("Vui lòng điền đầy đủ"); return; }
    const refundAmt = Math.round(form.originalAmount * form.refundPercent / 100);
    const newItem: FeeRefund = {
      id: String(data.length + 1),
      refundCode: `PT-R-${String(data.length + 1).padStart(3, "0")}`,
      refundAmount: refundAmt,
      refundDate: new Date().toLocaleDateString("vi-VN"),
      approvedBy: "",
      status: "pending",
      ...form,
    };
    setData(prev => [newItem, ...prev]);
    setAddOpen(false);
    toast.success("Đã tạo phiếu hoàn trả — chờ phê duyệt");
  };

  return (
    <div className="pb-10">
      <div className="relative mb-6 p-6 rounded-2xl overflow-hidden bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: "28px 28px" }} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-orange-200 text-[13px] font-semibold mb-1 tracking-wide uppercase">Module Quản lý Học phí</p>
            <h1 className="text-[24px] font-extrabold">Phiếu Hoàn Trả Học phí</h1>
            <p className="text-orange-100/70 text-[14px] mt-1">Quản lý hoàn tiền khi bảo lưu, thôi học theo chính sách</p>
          </div>
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white px-4 py-2.5 rounded-xl text-[14px] font-semibold">
            <Plus className="w-4 h-4" /> Lập phiếu hoàn trả
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        {[
          { label: "Tổng phiếu", value: stats.total, color: "text-orange-600" },
          { label: "Chờ duyệt", value: stats.pending, color: "text-amber-600" },
          { label: "Đã hoàn trả", value: `${(stats.totalRefunded / 1e6).toFixed(1)}tr`, color: "text-emerald-600" },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-4 text-center">
            <p className={`text-[24px] font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[["all", "Tất cả"], ["pending", "Chờ duyệt"], ["approved", "Đã duyệt"], ["paid", "Đã hoàn"], ["rejected", "Từ chối"]].map(([v, l]) => (
          <button key={v} onClick={() => setFilterStatus(v)} className={`px-3 py-1.5 rounded-full text-[13px] font-semibold transition-all ${filterStatus === v ? "bg-orange-600 text-white" : "bg-white dark:bg-card border border-gray-200 dark:border-border text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/5"}`}>{l}</button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm học viên, số phiếu hoàn trả..." className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[14px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-border bg-gray-50/50 dark:bg-white/[0.02]">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-[12px] uppercase">Phiếu / Học viên</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-[12px] uppercase hidden md:table-cell">Lý do</th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground text-[12px] uppercase">Số tiền hoàn</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-[12px] uppercase hidden lg:table-cell">Phương thức</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-[12px] uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground text-[12px] uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/[0.03]">
              {paginated.map(r => {
                const st = statusCfg[r.status];
                return (
                  <tr key={r.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] group transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="font-mono text-[12px] text-orange-600 font-semibold">{r.refundCode}</p>
                      <p className="font-semibold text-[#1a1a2e] dark:text-foreground">{r.studentName}</p>
                      <p className="text-[11px] text-muted-foreground">{r.studentCode}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${reasonColor[r.reason]}`}>{r.reason}</span>
                      {r.note && <p className="text-[11px] text-muted-foreground mt-0.5 italic line-clamp-1">{r.note}</p>}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <p className="font-bold text-[16px] text-orange-600">{fmt(r.refundAmount)}</p>
                      <p className="text-[11px] text-muted-foreground">{r.refundPercent}% của {fmt(r.originalAmount)}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className={`inline-flex items-center gap-1 text-[12px] font-semibold ${r.paymentMethod === "Tiền mặt" ? "text-emerald-600" : "text-blue-600"}`}>
                        {r.paymentMethod === "Tiền mặt" ? <Banknote className="w-3.5 h-3.5" /> : <CreditCard className="w-3.5 h-3.5" />}{r.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold ${st.bg} ${st.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setDetailId(r.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"><Eye className="w-4 h-4 text-muted-foreground" /></button>
                        {r.status === "pending" && <button onClick={() => handleApprove(r.id)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10"><CheckCircle className="w-4 h-4 text-blue-500" /></button>}
                        {r.status === "approved" && <button onClick={() => handleMarkPaid(r.id)} className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-500/10"><Banknote className="w-4 h-4 text-emerald-500" /></button>}
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

      {/* Add Modal */}
      <AnimatePresence>
        {addOpen && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAddOpen(false)} />
            <motion.div className="relative w-full max-w-md bg-white dark:bg-card rounded-2xl shadow-2xl overflow-hidden" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
              <div className="p-5 border-b border-gray-100 dark:border-border flex items-center justify-between">
                <h3 className="text-[17px] font-bold text-[#1a1a2e] dark:text-foreground">Lập Phiếu Hoàn Trả</h3>
                <button onClick={() => setAddOpen(false)} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-[13px] font-semibold mb-1.5">Tên học viên *</label><input value={form.studentName} onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" /></div>
                  <div><label className="block text-[13px] font-semibold mb-1.5">Mã HV</label><input value={form.studentCode} onChange={e => setForm(f => ({ ...f, studentCode: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" /></div>
                </div>
                <div><label className="block text-[13px] font-semibold mb-1.5">Lý do hoàn trả</label>
                  <select value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value as FeeRefund["reason"] }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none">
                    <option>Bảo lưu</option><option>Thôi học</option><option>Lỗi hệ thống</option><option>Khác</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-[13px] font-semibold mb-1.5">Học phí gốc *</label><input type="number" value={form.originalAmount} onChange={e => setForm(f => ({ ...f, originalAmount: +e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" /></div>
                  <div><label className="block text-[13px] font-semibold mb-1.5">% Hoàn trả</label><input type="number" min={0} max={100} value={form.refundPercent} onChange={e => setForm(f => ({ ...f, refundPercent: +e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" /></div>
                </div>
                {form.originalAmount > 0 && (
                  <div className="bg-orange-50 dark:bg-orange-500/10 rounded-xl p-3 text-center">
                    <p className="text-[12px] text-orange-600 font-semibold">Số tiền hoàn trả</p>
                    <p className="text-[24px] font-extrabold text-orange-700">{fmt(Math.round(form.originalAmount * form.refundPercent / 100))}</p>
                  </div>
                )}
                <div><label className="block text-[13px] font-semibold mb-1.5">Ghi chú</label><textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} rows={2} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none resize-none" /></div>
              </div>
              <div className="p-5 border-t border-gray-100 dark:border-border flex gap-3">
                <button onClick={() => setAddOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-border text-[14px] font-semibold hover:bg-gray-50 dark:hover:bg-white/5">Hủy</button>
                <button onClick={handleAdd} className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-[14px] font-semibold">Tạo phiếu hoàn</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

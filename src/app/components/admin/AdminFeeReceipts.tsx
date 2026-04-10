import { useState, useMemo } from "react";
import { useDocumentTitle, useEscapeKey } from "../../utils/hooks";
import { useUrlFilters } from "../../utils/useUrlFilters";
import { useUrlPagination } from "../../utils/useUrlPagination";
import { AnimatePresence, motion } from "motion/react";
import {
  Search, Plus, X, Receipt, CreditCard, Banknote, Smartphone,
  Download, Eye, CheckCircle, Printer, TrendingUp, Users, Filter
} from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "./Pagination";
import { useAppData, type AppFeeReceipt } from "../../context/AppDataContext";

type FeeReceipt = AppFeeReceipt;

const methodIcon = { "Tiền mặt": Banknote, "Chuyển khoản": CreditCard, "Ví điện tử": Smartphone };
const methodColor = { "Tiền mặt": "text-emerald-600 bg-emerald-500/10", "Chuyển khoản": "text-blue-600 bg-blue-500/10", "Ví điện tử": "text-violet-600 bg-violet-500/10" };
const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

function genReceiptCode(existingCount: number): string {
  const year = new Date().getFullYear();
  const seq = String(existingCount + 1).padStart(5, "0");
  return `BL-${year}-${seq}`;
}

function printReceipt(r: FeeReceipt) {
  const win = window.open("", "_blank", "width=600,height=800");
  if (!win) { toast.error("Vui lòng cho phép popup để in biên lai"); return; }
  win.document.write(`
    <!DOCTYPE html><html><head><meta charset="utf-8">
    <title>Biên lai ${r.receiptCode}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 32px; max-width: 500px; margin: auto; }
      .header { text-align: center; margin-bottom: 24px; }
      .title { font-size: 20px; font-weight: bold; margin: 8px 0; }
      .code { font-family: monospace; font-size: 14px; color: #0d9488; font-weight: bold; }
      .amount { text-align: center; font-size: 32px; font-weight: 900; color: #0d9488; padding: 16px 0; border-top: 1px dashed #ccc; border-bottom: 1px dashed #ccc; margin: 16px 0; }
      .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; border-bottom: 1px solid #f0f0f0; }
      .label { color: #666; }
      .value { font-weight: 600; }
      .footer { text-align: center; font-size: 12px; color: #999; margin-top: 24px; }
      @media print { button { display: none; } }
    </style></head><body>
    <div class="header">
      <div style="font-size:13px;color:#666;">TRUNG TÂM GDNN-GDTX</div>
      <div class="title">BIÊN LAI THU TIỀN HỌC PHÍ</div>
      <div class="code">${r.receiptCode}</div>
    </div>
    <div class="amount">${fmt(r.finalAmount)}</div>
    <div class="row"><span class="label">Học viên</span><span class="value">${r.studentName}</span></div>
    <div class="row"><span class="label">Mã học viên</span><span class="value">${r.studentCode}</span></div>
    <div class="row"><span class="label">Đợt thu</span><span class="value">${r.periodName}</span></div>
    <div class="row"><span class="label">Học phí gốc</span><span class="value">${fmt(r.amount)}</span></div>
    ${r.discountAmount > 0 ? `<div class="row"><span class="label">Giảm giá</span><span class="value" style="color:#ef4444;">-${fmt(r.discountAmount)}</span></div>` : ""}
    <div class="row"><span class="label">Phương thức</span><span class="value">${r.paymentMethod}</span></div>
    <div class="row"><span class="label">Ngày thu</span><span class="value">${r.paidDate}</span></div>
    <div class="row"><span class="label">Thu ngân</span><span class="value">${r.receivedBy}</span></div>
    ${r.note ? `<div class="row"><span class="label">Ghi chú</span><span class="value">${r.note}</span></div>` : ""}
    <div class="footer">Cảm ơn Quý học viên đã tin tưởng và đồng hành cùng Trung tâm!<br>Biên lai này có giá trị khi có chữ ký xác nhận của thu ngân.</div>
    <script>window.onload = () => { window.print(); }</script>
    </body></html>
  `);
  win.document.close();
}

export function AdminFeeReceipts() {
  useDocumentTitle("Phiếu Thu học phí");
  const { feeReceipts: data, addFeeReceipt } = useAppData();
  const [search, setSearch] = useState("");
  const [filters, setFilter] = useUrlFilters({ method: "all", status: "all" });
  const { page, pageSize, setPage } = useUrlPagination();
  const [addOpen, setAddOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [form, setForm] = useState({ studentName: "", studentCode: "", periodName: "", amount: 0, discountAmount: 0, paymentMethod: "Tiền mặt" as FeeReceipt["paymentMethod"], note: "" });

  useEscapeKey(() => { setAddOpen(false); setDetailId(null); }, addOpen || !!detailId);

  const filtered = useMemo(() => data.filter(d => {
    const s = search.toLowerCase();
    const matchSearch = !search || d.studentName.toLowerCase().includes(s) || d.receiptCode.toLowerCase().includes(s) || d.studentCode.toLowerCase().includes(s);
    const matchMethod = filters.method === "all" || d.paymentMethod === filters.method;
    const matchStatus = filters.status === "all" || d.status === filters.status;
    return matchSearch && matchMethod && matchStatus;
  }), [data, search, filters]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const stats = useMemo(() => ({
    total: data.length,
    totalAmount: data.reduce((s, d) => s + d.finalAmount, 0),
    totalDiscount: data.reduce((s, d) => s + d.discountAmount, 0),
    byMethod: {
      cash: data.filter(d => d.paymentMethod === "Tiền mặt").reduce((s, d) => s + d.finalAmount, 0),
      bank: data.filter(d => d.paymentMethod === "Chuyển khoản").reduce((s, d) => s + d.finalAmount, 0),
      ewallet: data.filter(d => d.paymentMethod === "Ví điện tử").reduce((s, d) => s + d.finalAmount, 0),
    },
  }), [data]);

  const detail = data.find(d => d.id === detailId);

  const handleAdd = () => {
    if (!form.studentName || !form.periodName || form.amount <= 0) { toast.error("Vui lòng điền đầy đủ thông tin"); return; }
    const newR = addFeeReceipt({
      receiptCode: genReceiptCode(data.length),
      studentId: "",
      studentCode: form.studentCode,
      studentName: form.studentName,
      courseId: "",
      courseName: form.periodName,
      periodName: form.periodName,
      amount: form.amount,
      discountAmount: form.discountAmount,
      finalAmount: form.amount - form.discountAmount,
      paymentMethod: form.paymentMethod,
      paidDate: new Date().toLocaleDateString("vi-VN"),
      receivedBy: "Admin",
      note: form.note,
      status: "confirmed",
    });
    setAddOpen(false);
    setForm({ studentName: "", studentCode: "", periodName: "", amount: 0, discountAmount: 0, paymentMethod: "Tiền mặt", note: "" });
    toast.success(`Đã tạo phiếu thu ${newR.receiptCode}`);
  };

  return (
    <div className="pb-10">
      <div className="relative mb-6 p-6 rounded-2xl overflow-hidden bg-gradient-to-r from-teal-600 to-cyan-700 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: "28px 28px" }} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-teal-200 text-[13px] font-semibold mb-1 tracking-wide uppercase">Module Quản lý Học phí</p>
            <h1 className="text-[24px] font-extrabold">Phiếu Thu Học phí</h1>
            <p className="text-teal-100/70 text-[14px] mt-1">Ghi nhận và in biên lai thu tiền học phí</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { toast.success("Đã xuất danh sách phiếu thu (.xlsx)"); }} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-3 py-2.5 rounded-xl text-[13px] font-semibold">
              <Download className="w-4 h-4" /> Xuất Excel
            </button>
            <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white px-4 py-2.5 rounded-xl text-[14px] font-semibold">
              <Plus className="w-4 h-4" /> Lập phiếu thu
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Tổng phiếu", value: stats.total, color: "text-teal-600" },
          { label: "Tiền mặt", value: `${(stats.byMethod.cash / 1e6).toFixed(1)}tr`, color: "text-emerald-600" },
          { label: "Chuyển khoản", value: `${(stats.byMethod.bank / 1e6).toFixed(1)}tr`, color: "text-blue-600" },
          { label: "Tổng thu", value: `${(stats.totalAmount / 1e6).toFixed(1)}tr`, color: "text-teal-700" },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-4 text-center">
            <p className={`text-[24px] font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm học viên, số phiếu..." className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400" />
        </div>
        <select value={filters.method} onChange={e => setFilter("method", e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none">
          <option value="all">Tất cả phương thức</option>
          <option>Tiền mặt</option>
          <option>Chuyển khoản</option>
          <option>Ví điện tử</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[14px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-border bg-gray-50/50 dark:bg-white/[0.02]">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-[12px] uppercase">Số phiếu / Học viên</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-[12px] uppercase hidden md:table-cell">Đợt thu</th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground text-[12px] uppercase">Số tiền</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-[12px] uppercase hidden lg:table-cell">Phương thức</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-[12px] uppercase hidden lg:table-cell">Ngày thu</th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground text-[12px] uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/[0.03]">
              {paginated.map(r => {
                const MethodIcon = methodIcon[r.paymentMethod];
                return (
                  <tr key={r.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                    <td className="px-4 py-3.5">
                      <p className="font-mono text-[12px] text-teal-600 font-semibold">{r.receiptCode}</p>
                      <p className="font-semibold text-[#1a1a2e] dark:text-foreground">{r.studentName}</p>
                      <p className="text-[11px] text-muted-foreground">{r.studentCode}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <p className="text-[13px] text-[#1a1a2e] dark:text-foreground">{r.periodName}</p>
                      {r.note && <p className="text-[11px] text-amber-600 italic">{r.note}</p>}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <p className="font-bold text-[16px] text-teal-700 dark:text-teal-400">{fmt(r.finalAmount)}</p>
                      {r.discountAmount > 0 && <p className="text-[11px] text-rose-500">-{fmt(r.discountAmount)}</p>}
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold ${methodColor[r.paymentMethod]}`}>
                        <MethodIcon className="w-3 h-3" />{r.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <p className="text-[13px]">{r.paidDate}</p>
                      <p className="text-[11px] text-muted-foreground">{r.receivedBy}</p>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setDetailId(r.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"><Eye className="w-4 h-4 text-muted-foreground" /></button>
                        <button onClick={() => printReceipt(r)} className="p-1.5 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-500/10" title="In biên lai"><Printer className="w-4 h-4 text-teal-500" /></button>
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
            <motion.div className="relative ml-auto w-full max-w-sm bg-white dark:bg-card h-full overflow-y-auto shadow-2xl" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 300 }}>
              <div className="p-5 border-b border-gray-100 dark:border-border flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-mono text-teal-600 font-semibold">{detail.receiptCode}</p>
                  <h3 className="text-[16px] font-bold text-[#1a1a2e] dark:text-foreground">Biên lai Thu tiền</h3>
                </div>
                <button onClick={() => setDetailId(null)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-5">
                <div className="text-center py-6 border-b border-dashed border-gray-200 dark:border-border mb-4">
                  <p className="text-[12px] text-muted-foreground uppercase font-semibold mb-1">Số tiền thu</p>
                  <p className="text-[36px] font-extrabold text-teal-600">{fmt(detail.finalAmount)}</p>
                  {detail.discountAmount > 0 && (
                    <p className="text-[13px] text-rose-500 mt-1">Đã giảm: {fmt(detail.discountAmount)} — Gốc: {fmt(detail.amount)}</p>
                  )}
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Học viên", value: `${detail.studentName} (${detail.studentCode})` },
                    { label: "Đợt thu", value: detail.periodName },
                    { label: "Phương thức", value: detail.paymentMethod },
                    { label: "Ngày thu", value: detail.paidDate },
                    { label: "Thu ngân", value: detail.receivedBy },
                    ...(detail.note ? [{ label: "Ghi chú", value: detail.note }] : []),
                  ].map(item => (
                    <div key={item.label} className="flex items-start justify-between gap-3 text-[13px]">
                      <span className="text-muted-foreground shrink-0">{item.label}</span>
                      <span className="font-semibold text-right text-[#1a1a2e] dark:text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => printReceipt(detail)} className="w-full mt-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold text-[14px] transition-colors flex items-center justify-center gap-2">
                  <Printer className="w-4 h-4" /> In biên lai
                </button>
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
                <h3 className="text-[17px] font-bold text-[#1a1a2e] dark:text-foreground">Lập Phiếu Thu</h3>
                <button onClick={() => setAddOpen(false)} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-[13px] font-semibold mb-1.5">Tên học viên *</label><input value={form.studentName} onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" placeholder="Họ và tên" /></div>
                  <div><label className="block text-[13px] font-semibold mb-1.5">Mã học viên</label><input value={form.studentCode} onChange={e => setForm(f => ({ ...f, studentCode: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" placeholder="HV-26-xxxx" /></div>
                </div>
                <div><label className="block text-[13px] font-semibold mb-1.5">Đợt thu *</label><input value={form.periodName} onChange={e => setForm(f => ({ ...f, periodName: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" placeholder="VD: Học phí Kỳ 2 - Tiếng Anh B1" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-[13px] font-semibold mb-1.5">Số tiền (đồng) *</label><input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: +e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" /></div>
                  <div><label className="block text-[13px] font-semibold mb-1.5">Số tiền giảm</label><input type="number" value={form.discountAmount} onChange={e => setForm(f => ({ ...f, discountAmount: +e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" /></div>
                </div>
                {form.amount > 0 && (
                  <div className="bg-teal-50 dark:bg-teal-500/10 rounded-xl p-3 text-center">
                    <p className="text-[12px] text-teal-600 font-semibold mb-0.5">Thực thu</p>
                    <p className="text-[24px] font-extrabold text-teal-700">{fmt(form.amount - form.discountAmount)}</p>
                  </div>
                )}
                <div><label className="block text-[13px] font-semibold mb-1.5">Phương thức</label>
                  <div className="flex gap-2">
                    {(["Tiền mặt", "Chuyển khoản", "Ví điện tử"] as const).map(m => {
                      const Icon = methodIcon[m];
                      return (
                        <button key={m} onClick={() => setForm(f => ({ ...f, paymentMethod: m }))} className={`flex-1 py-2.5 rounded-xl border text-[12px] font-semibold flex items-center justify-center gap-1 transition-all ${form.paymentMethod === m ? "border-teal-400 bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400" : "border-gray-200 dark:border-border text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/5"}`}>
                          <Icon className="w-3.5 h-3.5" />{m}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div><label className="block text-[13px] font-semibold mb-1.5">Ghi chú</label><input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" placeholder="Lý do miễn giảm, ghi chú..." /></div>
              </div>
              <div className="p-5 border-t border-gray-100 dark:border-border flex gap-3">
                <button onClick={() => setAddOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-border text-[14px] font-semibold hover:bg-gray-50 dark:hover:bg-white/5">Hủy</button>
                <button onClick={handleAdd} className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-[14px] font-semibold">Lập phiếu thu</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

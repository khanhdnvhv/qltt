import { useState, useMemo } from "react";
import { useDocumentTitle, useEscapeKey } from "../../utils/hooks";
import { AnimatePresence, motion } from "motion/react";
import { Search, Plus, X, Gift, Users, Percent, CheckCircle, Trash2, Eye, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { useAppData, type AppFeeDiscountPolicy as DiscountPolicy, type AppFeeDiscountApplication as DiscountApplication } from "../../context/AppDataContext";

const statusCfg = {
  active: { label: "Đang áp dụng", bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400" },
  inactive: { label: "Tạm ngưng", bg: "bg-gray-100 dark:bg-white/5", text: "text-gray-600 dark:text-gray-400" },
  expired: { label: "Hết hạn", bg: "bg-rose-50 dark:bg-rose-500/10", text: "text-rose-700 dark:text-rose-400" },
};

const typeCfg: Record<string, { color: string; bg: string }> = {
  "Diện chính sách": { color: "text-blue-700", bg: "bg-blue-500/10" },
  "Học sinh giỏi": { color: "text-amber-700", bg: "bg-amber-500/10" },
  "Anh/chị/em": { color: "text-violet-700", bg: "bg-violet-500/10" },
  "Nhân viên": { color: "text-emerald-700", bg: "bg-emerald-500/10" },
  "Đặc biệt": { color: "text-rose-700", bg: "bg-rose-500/10" },
};

const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

export function AdminFeeDiscounts() {
  useDocumentTitle("Miễn giảm Học phí");
  const { feeDiscountPolicies: data, feeDiscountApplications: applications, addFeeDiscountPolicy, updateFeeDiscountPolicy } = useAppData();
  const [activeTab, setActiveTab] = useState<"policies" | "applications">("policies");
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", type: "Diện chính sách" as DiscountPolicy["type"], discountType: "percent" as "percent" | "fixed", discountValue: 0, conditions: "", validFrom: "", validTo: "", maxApply: null as number | null });

  useEscapeKey(() => { setAddOpen(false); setDetailId(null); }, addOpen || !!detailId);

  const filtered = useMemo(() => data.filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.code.toLowerCase().includes(search.toLowerCase())), [data, search]);

  const detail = data.find(d => d.id === detailId);

  const stats = {
    total: data.filter(d => d.status === "active").length,
    totalApplied: data.reduce((s, d) => s + d.appliedCount, 0),
    totalSaved: applications.reduce((s, a) => s + a.discountAmount, 0),
  };

  const handleAdd = () => {
    if (!form.name || !form.validFrom) { toast.error("Vui lòng điền đầy đủ"); return; }
    addFeeDiscountPolicy({ ...form, validTo: form.validTo || null, status: "active" });
    setAddOpen(false);
    toast.success("Đã tạo chính sách miễn giảm");
  };

  return (
    <div className="pb-10">
      <div className="relative mb-6 p-6 rounded-2xl overflow-hidden bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: "28px 28px" }} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-violet-200 text-[13px] font-semibold mb-1 tracking-wide uppercase">Module Quản lý Học phí</p>
            <h1 className="text-[24px] font-extrabold">Miễn giảm Học phí</h1>
            <p className="text-violet-100/70 text-[14px] mt-1">Quản lý chính sách ưu đãi và theo dõi áp dụng cho học viên</p>
          </div>
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white px-4 py-2.5 rounded-xl text-[14px] font-semibold transition-all">
            <Plus className="w-4 h-4" /> Tạo chính sách
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        {[
          { label: "Chính sách hoạt động", value: stats.total, color: "text-violet-600" },
          { label: "Lượt áp dụng", value: stats.totalApplied, color: "text-blue-600" },
          { label: "Tổng đã giảm", value: `${(stats.totalSaved / 1e6).toFixed(1)} triệu`, color: "text-emerald-600" },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-4 text-center">
            <p className={`text-[24px] font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[["policies", "Chính sách miễn giảm"], ["applications", "Lịch sử áp dụng"]].map(([v, l]) => (
          <button key={v} onClick={() => setActiveTab(v as typeof activeTab)} className={`px-4 py-2 rounded-xl text-[14px] font-semibold transition-all ${activeTab === v ? "bg-violet-600 text-white" : "bg-white dark:bg-card border border-gray-200 dark:border-border text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/5"}`}>{l}</button>
        ))}
      </div>

      {activeTab === "policies" ? (
        <>
          <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-4 mb-4 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm chính sách..." className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(p => {
              const st = statusCfg[p.status];
              const tc = typeCfg[p.type] || typeCfg["Đặc biệt"];
              return (
                <div key={p.id} className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl ${tc.bg} flex items-center justify-center`}><Gift className={`w-5 h-5 ${tc.color}`} /></div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${st.bg} ${st.text}`}>{st.label}</span>
                  </div>
                  <p className="font-bold text-[#1a1a2e] dark:text-foreground mb-0.5">{p.name}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${tc.bg} ${tc.color}`}>{p.type}</span>
                    <span className="text-[12px] font-mono text-muted-foreground">{p.code}</span>
                  </div>
                  <div className="text-center p-3 bg-violet-50 dark:bg-violet-500/10 rounded-xl mb-3">
                    <p className="text-[28px] font-extrabold text-violet-600">
                      {p.discountType === "percent" ? `${p.discountValue}%` : fmt(p.discountValue)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{p.discountType === "percent" ? "giảm học phí" : "giảm cố định"}</p>
                  </div>
                  <div className="flex items-center justify-between text-[12px] text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {p.appliedCount} lượt dùng</span>
                    {p.maxApply && <span>Tối đa: {p.maxApply}</span>}
                  </div>
                  <p className="text-[12px] text-muted-foreground italic line-clamp-2">{p.conditions}</p>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-border bg-gray-50/50 dark:bg-white/[0.02]">
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-[12px] uppercase">Học viên</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-[12px] uppercase">Chính sách</th>
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground text-[12px] uppercase">Học phí gốc</th>
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground text-[12px] uppercase text-rose-500">Đã giảm</th>
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground text-[12px] uppercase text-emerald-500">Thực thu</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-[12px] uppercase hidden lg:table-cell">Ngày duyệt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/[0.03]">
                {applications.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-[#1a1a2e] dark:text-foreground">{a.studentName}</p>
                      <p className="text-[11px] font-mono text-muted-foreground">{a.studentCode}</p>
                    </td>
                    <td className="px-4 py-3.5"><p className="text-[13px]">{a.policyName}</p></td>
                    <td className="px-4 py-3.5 text-right text-[13px] text-muted-foreground">{fmt(a.originalAmount)}</td>
                    <td className="px-4 py-3.5 text-right font-semibold text-rose-500">-{fmt(a.discountAmount)}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-emerald-600">{fmt(a.finalAmount)}</td>
                    <td className="px-4 py-3.5 hidden lg:table-cell text-[13px] text-muted-foreground">{a.date} · {a.approvedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {addOpen && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAddOpen(false)} />
            <motion.div className="relative w-full max-w-md bg-white dark:bg-card rounded-2xl shadow-2xl overflow-hidden" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
              <div className="p-5 border-b border-gray-100 dark:border-border flex items-center justify-between">
                <h3 className="text-[17px] font-bold text-[#1a1a2e] dark:text-foreground">Tạo Chính sách Miễn giảm</h3>
                <button onClick={() => setAddOpen(false)} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div><label className="block text-[13px] font-semibold mb-1.5">Tên chính sách *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" placeholder="VD: Ưu đãi Tết 2026" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-[13px] font-semibold mb-1.5">Loại chính sách</label><select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as DiscountPolicy["type"] }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none">
                    {["Diện chính sách", "Học sinh giỏi", "Anh/chị/em", "Đặc biệt", "Nhân viên"].map(t => <option key={t}>{t}</option>)}</select></div>
                  <div><label className="block text-[13px] font-semibold mb-1.5">Kiểu giảm</label><select value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value as "percent" | "fixed" }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none"><option value="percent">Phần trăm (%)</option><option value="fixed">Cố định (đồng)</option></select></div>
                </div>
                <div><label className="block text-[13px] font-semibold mb-1.5">Mức giảm ({form.discountType === "percent" ? "%" : "đồng"})</label><input type="number" value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: +e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" /></div>
                <div><label className="block text-[13px] font-semibold mb-1.5">Điều kiện áp dụng</label><textarea value={form.conditions} onChange={e => setForm(f => ({ ...f, conditions: e.target.value }))} rows={2} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none resize-none" placeholder="Mô tả điều kiện..." /></div>
                <div><label className="block text-[13px] font-semibold mb-1.5">Ngày hiệu lực *</label><input type="date" value={form.validFrom} onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" /></div>
              </div>
              <div className="p-5 border-t border-gray-100 dark:border-border flex gap-3">
                <button onClick={() => setAddOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-border text-[14px] font-semibold hover:bg-gray-50 dark:hover:bg-white/5">Hủy</button>
                <button onClick={handleAdd} className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-[14px] font-semibold">Tạo chính sách</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

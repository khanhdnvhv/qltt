import { useMemo, useState, useCallback } from "react";
import { useAppData, type AppCertStockBatch } from "../../context/AppDataContext";
import {
  Package, Plus, Download, Search, CheckCircle, Clock, RefreshCw,
  Archive, X, AlertTriangle, FileCheck
} from "lucide-react";
import { toast } from "sonner";
import { useUrlPagination } from "../../utils/useUrlPagination";
import { Pagination } from "./Pagination";
import { HighlightText } from "../ui/HighlightText";

const STATUS_CFG = {
  pending:     { label: "Chờ ký nhận",     cls: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",   icon: Clock },
  received:    { label: "Đang sử dụng",    cls: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",       icon: Package },
  reconciled:  { label: "Đã đối soát",     cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400", icon: CheckCircle },
} as const;

const CERT_TYPES = [
  "Chứng chỉ VSTEP B1", "Chứng chỉ VSTEP B2", "GCN Tin học CB", "Chứng chỉ TOEIC",
  "Chứng chỉ Hàn Điện", "GCN Điện dân dụng", "GCN Nấu ăn", "GCN Cắt may",
];

const emptyForm = {
  batchCode: "", certType: CERT_TYPES[0], centerName: "", allocated: 100,
  receivedDate: new Date().toLocaleDateString("vi-VN"),
  allocatedBy: "Phòng GDTX – Sở GD&ĐT", note: "",
};

export function AdminCertStock() {
  const { certStockBatches, certificates, addCertStockBatch, updateCertStockBatch } = useAppData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AppCertStockBatch["status"]>("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [selected, setSelected] = useState<AppCertStockBatch | null>(null);
  const { page, pageSize, setPage, setPageSize } = useUrlPagination();

  // Derive used count per certType+centerName from live certificates
  const usedMap = useMemo(() => {
    const map: Record<string, number> = {};
    certificates.forEach(c => {
      if (c.status === "ISSUED") {
        const key = `${c.certType}|||${c.issuedBy}`;
        map[key] = (map[key] || 0) + 1;
      }
    });
    return map;
  }, [certificates]);

  const enriched = useMemo(() => certStockBatches.map(b => {
    const key = `${b.certType}|||${b.centerName}`;
    const used = usedMap[key] || 0;
    const stock = Math.max(0, b.allocated - used);
    return { ...b, used, stock };
  }), [certStockBatches, usedMap]);

  // KPIs
  const totalAllocated = enriched.reduce((a, b) => a + b.allocated, 0);
  const totalUsed      = enriched.reduce((a, b) => a + b.used, 0);
  const totalStock     = enriched.reduce((a, b) => a + b.stock, 0);
  const reconciledCount = enriched.filter(b => b.status === "reconciled").length;

  const filtered = useMemo(() => enriched.filter(b => {
    const q = search.toLowerCase();
    const matchS = b.batchCode.toLowerCase().includes(q) || b.certType.toLowerCase().includes(q) || b.centerName.toLowerCase().includes(q);
    const matchF = statusFilter === "all" || b.status === statusFilter;
    return matchS && matchF;
  }), [enriched, search, statusFilter]);

  const paginated = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize]);

  const handleAdd = useCallback(() => {
    if (!form.batchCode.trim() || !form.centerName.trim()) {
      toast.error("Vui lòng nhập đủ mã lô và tên trung tâm"); return;
    }
    addCertStockBatch({ ...form, status: "pending" });
    toast.success(`Đã rót lô ${form.batchCode} — ${form.allocated} phôi`);
    setForm(emptyForm); setShowForm(false);
  }, [form, addCertStockBatch]);

  const handleReconcile = useCallback((id: string, batchCode: string) => {
    updateCertStockBatch(id, { status: "reconciled" });
    toast.success(`Đã đối soát lô ${batchCode}`);
    setSelected(null);
  }, [updateCertStockBatch]);

  const handleMarkReceived = useCallback((id: string) => {
    updateCertStockBatch(id, { status: "received" });
    toast.success("Đã xác nhận nhận phôi");
    setSelected(null);
  }, [updateCertStockBatch]);

  function exportCsv() {
    const rows = filtered.map(b => [b.batchCode, `"${b.certType}"`, `"${b.centerName}"`, b.allocated, b.used, b.stock, STATUS_CFG[b.status].label].join(","));
    const csv = ["Mã lô,Loại CC,Trung tâm,Rót,Đã dùng,Tồn kho,Trạng thái", ...rows].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv" }));
    a.download = `phoi-cc-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast.success("Đã xuất CSV!");
  }

  const selectedEnriched = selected ? enriched.find(b => b.id === selected.id) : null;

  return (
    <div className="flex-1 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[26px] font-black text-[#1a1a2e] dark:text-foreground tracking-tight">Quản lý Phôi Chứng Chỉ</h1>
          <p className="text-[15px] text-muted-foreground mt-1">Theo dõi rót phôi, sử dụng và đối soát tồn kho giữa Sở GD&ĐT và các trung tâm.</p>
        </div>
        <div className="flex gap-2 self-start">
          <button onClick={exportCsv} className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 text-foreground px-4 py-2.5 rounded-xl text-[14px] font-semibold hover:bg-gray-200 dark:hover:bg-white/10 transition-all">
            <Download className="w-4 h-4"/> Xuất CSV
          </button>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-[14px] font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20">
            <Plus className="w-4 h-4"/> Rót phôi mới
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Tổng phôi đã rót", value: totalAllocated.toLocaleString(), icon: Package, color: "text-indigo-500", sub: `${certStockBatches.length} lô phôi` },
          { label: "Đã sử dụng (in CC)", value: totalUsed.toLocaleString(), icon: FileCheck, color: "text-emerald-500", sub: totalAllocated > 0 ? `${((totalUsed / totalAllocated) * 100).toFixed(0)}% tổng rót` : "0%" },
          { label: "Tồn kho hiện tại", value: totalStock.toLocaleString(), icon: Archive, color: "text-amber-500", sub: "Phôi chưa in" },
          { label: "Lô đã đối soát", value: reconciledCount.toString(), icon: CheckCircle, color: "text-blue-500", sub: `/ ${certStockBatches.length} tổng lô` },
        ].map(card => (
          <div key={card.label} className="bg-white dark:bg-card p-5 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
            <card.icon className={`w-6 h-6 ${card.color} mb-3`}/>
            <p className="text-[26px] font-black text-[#1a1a2e] dark:text-foreground leading-none">{card.value}</p>
            <p className="text-[13px] text-muted-foreground font-medium mt-1">{card.label}</p>
            <p className="text-[11.5px] text-muted-foreground mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-card p-3 rounded-3xl border border-gray-100 dark:border-border mb-3 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm mã lô, loại CC, trung tâm..."
            className="w-full bg-[#f4f5f7] dark:bg-black/20 px-11 py-3 rounded-2xl text-[14px] outline-none"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "pending", "received", "reconciled"] as const).map(s => (
            <button key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-2 rounded-xl text-[13px] font-semibold transition-all whitespace-nowrap ${statusFilter === s ? "bg-indigo-600 text-white" : "bg-[#f4f5f7] dark:bg-white/5 text-muted-foreground hover:bg-indigo-50 dark:hover:bg-indigo-500/10"}`}
            >
              {s === "all" ? "Tất cả" : STATUS_CFG[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-card rounded-3xl border border-gray-100 dark:border-border overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-border">
              {["Mã lô / Loại CC", "Trung tâm", "Rót", "Đã in", "Tồn kho", "Ngày rót", "Trạng thái", ""].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[12.5px] font-bold text-muted-foreground uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 && (
              <tr><td colSpan={8} className="text-center py-12 text-muted-foreground text-[15px]">Không có dữ liệu</td></tr>
            )}
            {paginated.map(b => {
              const cfg = STATUS_CFG[b.status];
              const fillPct = b.allocated > 0 ? (b.used / b.allocated) * 100 : 0;
              return (
                <tr key={b.id} onClick={() => setSelected(b)} className="border-b border-gray-50 dark:border-border/30 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] cursor-pointer transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-[14px] font-bold text-[#1a1a2e] dark:text-foreground">
                      <HighlightText text={b.batchCode} query={search}/>
                    </p>
                    <p className="text-[12.5px] text-muted-foreground mt-0.5">
                      <HighlightText text={b.certType} query={search}/>
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[13.5px] font-medium text-foreground">
                      <HighlightText text={b.centerName} query={search}/>
                    </p>
                    <p className="text-[12px] text-muted-foreground">{b.allocatedBy}</p>
                  </td>
                  <td className="px-4 py-3 text-[14px] font-bold text-[#1a1a2e] dark:text-foreground">{b.allocated.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <p className="text-[14px] font-semibold text-emerald-600 dark:text-emerald-400">{b.used.toLocaleString()}</p>
                    <div className="h-1.5 bg-gray-100 dark:bg-white/10 rounded-full mt-1 w-20 overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${fillPct >= 80 ? "bg-rose-500" : fillPct >= 50 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${Math.min(fillPct, 100)}%` }}/>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[14px] font-bold ${b.stock <= 10 ? "text-rose-600" : "text-amber-600 dark:text-amber-400"}`}>
                      {b.stock.toLocaleString()}
                    </span>
                    {b.stock <= 10 && b.status === "received" && (
                      <span className="ml-1.5 inline-flex items-center gap-0.5 text-[11px] text-rose-500 font-semibold">
                        <AlertTriangle className="w-3 h-3"/> Sắp hết
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-muted-foreground">{b.receivedDate}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12.5px] font-semibold ${cfg.cls}`}>
                      <cfg.icon className="w-3.5 h-3.5"/>{cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {b.status === "pending" && (
                      <button onClick={e => { e.stopPropagation(); handleMarkReceived(b.id); }}
                        className="px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[12.5px] font-semibold rounded-lg hover:bg-blue-100 transition-colors">
                        Xác nhận nhận
                      </button>
                    )}
                    {b.status === "received" && (
                      <button onClick={e => { e.stopPropagation(); handleReconcile(b.id, b.batchCode); }}
                        className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[12.5px] font-semibold rounded-lg hover:bg-emerald-100 transition-colors">
                        <RefreshCw className="w-3 h-3 inline mr-1"/>Đối soát
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <Pagination page={page} total={filtered.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} itemLabel="Lô phôi"/>
      </div>

      {/* Add Batch Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)}/>
          <div className="relative bg-white dark:bg-[#1a1a2e] rounded-3xl shadow-2xl w-full max-w-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[20px] font-black text-[#1a1a2e] dark:text-foreground">Rót Phôi Mới</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10"><X className="w-5 h-5"/></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[13px] font-semibold text-muted-foreground mb-1 block">Mã lô phôi *</label>
                  <input value={form.batchCode} onChange={e => setForm(f => ({ ...f, batchCode: e.target.value }))}
                    placeholder="VD: LS-2026-005"
                    className="w-full bg-[#f4f5f7] dark:bg-black/20 px-4 py-2.5 rounded-xl text-[14px] outline-none border border-transparent focus:border-indigo-400"/>
                </div>
                <div>
                  <label className="text-[13px] font-semibold text-muted-foreground mb-1 block">Số lượng phôi *</label>
                  <input type="number" min={1} value={form.allocated} onChange={e => setForm(f => ({ ...f, allocated: +e.target.value }))}
                    className="w-full bg-[#f4f5f7] dark:bg-black/20 px-4 py-2.5 rounded-xl text-[14px] outline-none border border-transparent focus:border-indigo-400"/>
                </div>
              </div>
              <div>
                <label className="text-[13px] font-semibold text-muted-foreground mb-1 block">Loại chứng chỉ *</label>
                <select value={form.certType} onChange={e => setForm(f => ({ ...f, certType: e.target.value }))}
                  className="w-full bg-[#f4f5f7] dark:bg-black/20 px-4 py-2.5 rounded-xl text-[14px] outline-none border border-transparent focus:border-indigo-400">
                  {CERT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[13px] font-semibold text-muted-foreground mb-1 block">Trung tâm nhận *</label>
                <input value={form.centerName} onChange={e => setForm(f => ({ ...f, centerName: e.target.value }))}
                  placeholder="VD: Trung tâm GDNN-GDTX"
                  className="w-full bg-[#f4f5f7] dark:bg-black/20 px-4 py-2.5 rounded-xl text-[14px] outline-none border border-transparent focus:border-indigo-400"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[13px] font-semibold text-muted-foreground mb-1 block">Ngày rót phôi</label>
                  <input value={form.receivedDate} onChange={e => setForm(f => ({ ...f, receivedDate: e.target.value }))}
                    className="w-full bg-[#f4f5f7] dark:bg-black/20 px-4 py-2.5 rounded-xl text-[14px] outline-none border border-transparent focus:border-indigo-400"/>
                </div>
                <div>
                  <label className="text-[13px] font-semibold text-muted-foreground mb-1 block">Phòng ban rót</label>
                  <input value={form.allocatedBy} onChange={e => setForm(f => ({ ...f, allocatedBy: e.target.value }))}
                    className="w-full bg-[#f4f5f7] dark:bg-black/20 px-4 py-2.5 rounded-xl text-[14px] outline-none border border-transparent focus:border-indigo-400"/>
                </div>
              </div>
              <div>
                <label className="text-[13px] font-semibold text-muted-foreground mb-1 block">Ghi chú</label>
                <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} rows={2}
                  className="w-full bg-[#f4f5f7] dark:bg-black/20 px-4 py-2.5 rounded-xl text-[14px] outline-none border border-transparent focus:border-indigo-400 resize-none"/>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-2xl bg-gray-100 dark:bg-white/5 text-[14px] font-semibold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">Hủy</button>
              <button onClick={handleAdd} className="flex-1 py-3 rounded-2xl bg-indigo-600 text-white text-[14px] font-bold hover:bg-indigo-700 transition-colors shadow-md">Rót phôi</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      {selectedEnriched && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelected(null)}/>
          <div className="relative w-1/2 min-w-[480px] bg-white dark:bg-[#1a1a2e] h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-start justify-between p-6 border-b border-gray-100 dark:border-white/10 sticky top-0 bg-white dark:bg-[#1a1a2e] z-10">
              <div>
                <p className="text-[12px] font-mono text-muted-foreground">{selectedEnriched.batchCode}</p>
                <h2 className="text-[18px] font-black text-[#1a1a2e] dark:text-foreground mt-0.5">{selectedEnriched.certType}</h2>
                {(() => { const cfg = STATUS_CFG[selectedEnriched.status]; const Ic = cfg.icon; return (
                  <span className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-lg text-[12px] font-bold ${cfg.cls}`}>
                    <Ic className="w-3.5 h-3.5"/>
                    {cfg.label}
                  </span>
                ); })()}
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Trung tâm", value: selectedEnriched.centerName },
                  { label: "Phòng ban rót", value: selectedEnriched.allocatedBy },
                  { label: "Ngày rót phôi", value: selectedEnriched.receivedDate },
                  { label: "Số phôi rót", value: selectedEnriched.allocated.toLocaleString() },
                ].map(item => (
                  <div key={item.label} className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4">
                    <p className="text-[12px] text-muted-foreground">{item.label}</p>
                    <p className="text-[15px] font-bold text-[#1a1a2e] dark:text-foreground mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Stock visual */}
              <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-5">
                <p className="text-[13px] font-semibold text-[#1a1a2e] dark:text-foreground mb-4">Tình trạng Phôi</p>
                <div className="space-y-3">
                  {[
                    { label: "Đã rót", val: selectedEnriched.allocated, max: selectedEnriched.allocated, color: "bg-indigo-500" },
                    { label: "Đã in CC", val: selectedEnriched.used, max: selectedEnriched.allocated, color: "bg-emerald-500" },
                    { label: "Tồn kho", val: selectedEnriched.stock, max: selectedEnriched.allocated, color: "bg-amber-500" },
                  ].map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between text-[12.5px] mb-1">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-bold text-[#1a1a2e] dark:text-foreground">{item.val.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${item.color}`} style={{ width: item.max > 0 ? `${(item.val / item.max) * 100}%` : "0%" }}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedEnriched.note && (
                <div className="bg-amber-50 dark:bg-amber-500/10 rounded-2xl p-4">
                  <p className="text-[12px] text-amber-700 dark:text-amber-400 font-semibold mb-1">Ghi chú</p>
                  <p className="text-[13.5px] text-foreground">{selectedEnriched.note}</p>
                </div>
              )}

              <div className="flex gap-3">
                {selectedEnriched.status === "pending" && (
                  <button onClick={() => handleMarkReceived(selectedEnriched.id)} className="flex-1 py-3 rounded-2xl bg-blue-600 text-white text-[14px] font-bold hover:bg-blue-700 transition-colors">
                    Xác nhận nhận phôi
                  </button>
                )}
                {selectedEnriched.status === "received" && (
                  <button onClick={() => handleReconcile(selectedEnriched.id, selectedEnriched.batchCode)} className="flex-1 py-3 rounded-2xl bg-emerald-600 text-white text-[14px] font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4"/> Đối soát lô này
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

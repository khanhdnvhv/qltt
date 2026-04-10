import { useMemo, useCallback } from "react";
import { VirtualTable, type VirtualTableColumn } from "./VirtualTable";
import {
  Search, Printer, FileCheck, CheckCircle2, AlertTriangle, ShieldCheck,
  Download, PackageCheck, RotateCcw
} from "lucide-react";
import { HighlightText } from "../ui/HighlightText";
import { useUrlPagination } from "../../utils/useUrlPagination";
import { Pagination } from "./Pagination";
import { toast } from "sonner";
import { useState } from "react";
import { useAppData, type AppCertificate } from "../../context/AppDataContext";

type CertStatus = "PENDING" | "PRINTED" | "ISSUED" | "ERROR";
type CertRequest = AppCertificate;

const STATUS_LABELS: Record<CertStatus, string> = {
  PENDING: "Chờ gọi phôi",
  PRINTED: "Đã IN xong",
  ISSUED:  "Đã phát HV",
  ERROR:   "Phôi Lỗi",
};

const STATUS_STYLES: Record<CertStatus, string> = {
  PENDING: "bg-blue-50 text-blue-600 dark:bg-blue-500/10",
  PRINTED: "bg-purple-50 text-purple-600 dark:bg-purple-500/10",
  ISSUED:  "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10",
  ERROR:   "bg-rose-50 text-rose-600 dark:bg-rose-500/10",
};

const FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "all",     label: "Toàn bộ" },
  { value: "PENDING", label: "Chờ gọi phôi" },
  { value: "PRINTED", label: "Đã in (chưa phát)" },
  { value: "ISSUED",  label: "Đã phát an toàn" },
  { value: "ERROR",   label: "Phôi lỗi" },
];

export function AdminManageCertificates() {
  const { certificates: data, updateCertificateStatus } = useAppData();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { page, pageSize, setPage, setPageSize } = useUrlPagination();

  // Status transition logic — now validates business rules
  const advanceStatus = useCallback((id: string) => {
    const cert = data.find(c => c.id === id);
    if (!cert) return;
    if (cert.status === "PENDING") {
      const result = updateCertificateStatus(id, "PRINTED");
      if (!result.ok) { toast.error(result.error); return; }
      toast.success(`Đã rút phôi — serial ${cert.serialNo ?? "…"} — chờ lệnh in`);
    } else if (cert.status === "PRINTED") {
      const result = updateCertificateStatus(id, "ISSUED");
      if (!result.ok) { toast.error(result.error); return; }
      toast.success(`Đã phát chứng chỉ cho "${cert.studentName}"`);
    }
  }, [data, updateCertificateStatus]);

  const handleBulkIssue = useCallback(() => {
    if (selected.size === 0) { toast.error("Chưa chọn học viên nào"); return; }
    const printable = data.filter(c => selected.has(c.id) && c.status === "PRINTED");
    if (printable.length === 0) { toast.error("Không có chứng chỉ nào ở trạng thái 'Đã IN' để phát"); return; }
    let ok = 0;
    printable.forEach(c => {
      const r = updateCertificateStatus(c.id, "ISSUED");
      if (r.ok) ok++;
      else toast.error(`${c.studentName}: ${r.error}`);
    });
    setSelected(new Set());
    if (ok > 0) toast.success(`Đã cấp phát hàng loạt ${ok} chứng chỉ`);
  }, [selected, data, updateCertificateStatus]);

  const toggleSelect = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const filtered = useMemo(() =>
    data.filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !search || c.studentName.toLowerCase().includes(q) || c.certType.toLowerCase().includes(q);
      const matchStatus = filterStatus === "all" || c.status === filterStatus;
      return matchSearch && matchStatus;
    }), [data, search, filterStatus]);

  const paginated = useMemo(() =>
    filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]);

  // KPI counts
  const counts = useMemo(() => ({
    pending: data.filter(c => c.status === "PENDING").length,
    printed: data.filter(c => c.status === "PRINTED").length,
    issued:  data.filter(c => c.status === "ISSUED").length,
    error:   0,
  }), [data]);

  const columns: VirtualTableColumn<CertRequest>[] = useMemo(() => [
    {
      key: "select", header: "", width: "44px",
      render: (c) => (
        <input
          type="checkbox"
          checked={selected.has(c.id)}
          onChange={() => toggleSelect(c.id)}
          className="w-4 h-4 accent-primary cursor-pointer"
        />
      )
    },
    {
      key: "student", header: "Thông tin Học viên", width: "32%",
      render: (c) => (
        <div className="py-2">
          <p className="text-[15px] font-bold text-[#1a1a2e] dark:text-foreground line-clamp-1 mb-0.5">
            <HighlightText text={c.studentName} query={search} />
          </p>
          <div className="flex items-center gap-3 text-[12.5px] text-muted-foreground font-medium">
            <span>NS: {c.dob}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300"/>
            <span>Lớp: {c.className}</span>
          </div>
        </div>
      )
    },
    {
      key: "cert", header: "Khoản mục Cấp phát",
      render: (c) => (
        <div className="flex flex-col gap-1">
          <span className="text-[14px] font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
            <FileCheck className="w-4 h-4"/>
            <HighlightText text={c.certType} query={search} />
          </span>
          <span className="text-[13px] font-semibold text-gray-500">Điểm: {c.score}/10</span>
        </div>
      )
    },
    {
      key: "serial", header: "Mã Phôi / Seri",
      render: (c) => c.serialNo ? (
        <span className="font-mono text-[13.5px] bg-amber-50 text-amber-600 dark:bg-amber-500/10 px-2.5 py-1 rounded-lg font-bold tracking-widest border border-amber-200 dark:border-amber-500/30">
          #{c.serialNo}
        </span>
      ) : (
        <span className="text-[13px] italic text-muted-foreground">Chưa gọi phôi</span>
      )
    },
    {
      key: "status", header: "Tiến trình",
      render: (c) => (
        <span className={`px-2.5 py-1 rounded-lg text-[12.5px] font-bold flex items-center gap-1 w-max ${STATUS_STYLES[c.status]}`}>
          {c.status === "PENDING" && <ShieldCheck className="w-3.5 h-3.5"/>}
          {c.status === "PRINTED" && <Printer className="w-3.5 h-3.5"/>}
          {c.status === "ISSUED"  && <CheckCircle2 className="w-3.5 h-3.5"/>}
          {c.status === "ERROR"   && <AlertTriangle className="w-3.5 h-3.5"/>}
          {STATUS_LABELS[c.status]}
        </span>
      )
    },
    {
      key: "actions", header: "", width: "120px",
      render: (c) => {
        const canAdvance = c.status === "PENDING" || c.status === "PRINTED";
        return (
          <button
            onClick={() => advanceStatus(c.id)}
            disabled={!canAdvance}
            className={`flex justify-center w-full px-3 py-2 rounded-xl border transition-all text-[12.5px] font-bold items-center gap-1.5 ${canAdvance ? "bg-primary text-white hover:opacity-90 border-primary shadow-sm" : "bg-gray-100 dark:bg-white/5 text-gray-400 border-transparent cursor-not-allowed"}`}
          >
            {c.status === "PENDING" ? <><ShieldCheck className="w-3.5 h-3.5"/> Rút Phôi</>
              : c.status === "PRINTED" ? <><PackageCheck className="w-3.5 h-3.5"/> Phát HV</>
              : c.status === "ISSUED" ? <><CheckCircle2 className="w-3.5 h-3.5"/> Hoàn tất</>
              : <><RotateCcw className="w-3.5 h-3.5"/> Xử lý lại</>
            }
          </button>
        );
      }
    },
  ], [search, selected, toggleSelect, advanceStatus]);

  return (
    <div className="flex-1 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[26px] font-black text-[#1a1a2e] dark:text-foreground tracking-tight">Cấp phát & In ấn Văn bằng</h1>
          <p className="text-[15px] text-muted-foreground mt-1">Trực tiếp In chứng chỉ và tiêu hao Phôi theo danh sách HV tốt nghiệp đạt chuẩn.</p>
        </div>
        <div className="flex items-center gap-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 px-5 py-2.5 rounded-2xl">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0"/>
          <div>
            <p className="text-[12px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">Tồn kho Phôi Trắng</p>
            <p className="text-[18px] font-black text-amber-700 dark:text-amber-500 leading-none mt-0.5">
              {(14204 - counts.printed - counts.issued).toLocaleString()} <span className="text-[13px] font-medium">Tem</span>
            </p>
          </div>
        </div>
      </div>

      {/* KPI chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Chờ gọi phôi", count: counts.pending, cls: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20", filter: "PENDING" },
          { label: "Đã in (chờ phát)", count: counts.printed, cls: "bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20", filter: "PRINTED" },
          { label: "Đã phát HV", count: counts.issued, cls: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20", filter: "ISSUED" },
          { label: "Phôi lỗi", count: counts.error, cls: "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20", filter: "ERROR" },
        ].map(k => (
          <button
            key={k.filter}
            onClick={() => { setFilterStatus(filterStatus === k.filter ? "all" : k.filter); setPage(1); }}
            className={`rounded-2xl border p-4 text-left transition-all ${k.cls} ${filterStatus === k.filter ? "ring-2 ring-offset-1 ring-current" : "hover:opacity-80"}`}
          >
            <p className="text-[26px] font-black leading-none">{k.count}</p>
            <p className="text-[12.5px] font-semibold mt-1">{k.label}</p>
          </button>
        ))}
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 rounded-2xl px-5 py-3 mb-4 flex items-center justify-between flex-wrap gap-3">
          <span className="text-[14px] font-semibold text-indigo-700 dark:text-indigo-400">
            Đã chọn <strong>{selected.size}</strong> phiếu
          </span>
          <div className="flex gap-2">
            <button onClick={() => setSelected(new Set())} className="px-4 py-1.5 rounded-xl border border-indigo-300 dark:border-indigo-500/30 text-[13px] font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors">
              Bỏ chọn
            </button>
            <button onClick={handleBulkIssue} className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-semibold transition-colors">
              <PackageCheck className="w-4 h-4"/> Phát hàng loạt
            </button>
          </div>
        </div>
      )}

      {/* Search + filter */}
      <div className="bg-white dark:bg-card p-3 rounded-3xl border border-gray-100 dark:border-border mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"/>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm học viên nhận bằng, tên chứng chỉ..."
            className="w-full bg-[#f4f5f7] dark:bg-black/20 border border-transparent focus:border-primary/50 transition-colors px-12 py-3.5 rounded-2xl text-[15px] outline-none font-medium"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          className="bg-[#f4f5f7] dark:bg-black/20 px-5 py-3.5 rounded-2xl text-[14px] font-semibold outline-none border border-transparent"
        >
          {FILTER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-3xl overflow-hidden shadow-sm">
        <VirtualTable data={paginated} columns={columns} getRowKey={c => c.id} rowHeight={85} maxHeight={600}/>
      </div>
      <div className="mt-4">
        <Pagination page={page} total={filtered.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} itemLabel="Chỉ tiêu"/>
      </div>
    </div>
  );
}

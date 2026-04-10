import { useMemo, useState } from "react";
import { useAppData } from "../../context/AppDataContext";
import { VirtualTable, type VirtualTableColumn } from "./VirtualTable";
import { Search, Download, Award, ShieldCheck, AlertTriangle, FileSignature, BarChart2 } from "lucide-react";
import { HighlightText } from "../ui/HighlightText";
import { toast } from "sonner";
import { useUrlPagination } from "../../utils/useUrlPagination";
import { Pagination } from "./Pagination";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

interface CertReportData {
  id: string;
  centerName: string;
  certType: string;
  totalReceived: number;
  totalIssued: number;
  totalDamaged: number;
}


function exportCsv(rows: CertReportData[]) {
  const header = ["Mã", "Tên Trung Tâm", "Loại Chứng Chỉ", "Nhập Phôi", "Đã Cấp Phát", "Lỗi/Hỏng", "Tồn Kho", "Tỷ lệ Sử dụng (%)"];
  const lines = rows.map(r => {
    const stock = r.totalReceived - r.totalIssued - r.totalDamaged;
    const usageRate = ((r.totalIssued / r.totalReceived) * 100).toFixed(1);
    return [r.id, `"${r.centerName}"`, `"${r.certType}"`, r.totalReceived, r.totalIssued, r.totalDamaged, stock, usageRate].join(",");
  });
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bao-cao-van-bang-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Đã xuất báo cáo phôi văn bằng CSV!");
}

export function ReportCertificates() {
  const { certificates: storeCerts } = useAppData();
  const [search, setSearch] = useState("");
  const [certTypeFilter, setCertTypeFilter] = useState("all");
  const { page, pageSize, setPage, setPageSize } = useUrlPagination();

  // Aggregate live certificate data grouped by issuedBy + certType
  const liveData = useMemo((): CertReportData[] => {
    const map: Record<string, CertReportData> = {};
    storeCerts.forEach(c => {
      const key = `${c.issuedBy}|||${c.certType}`;
      if (!map[key]) {
        map[key] = {
          id: `CT-${Object.keys(map).length + 100}`,
          centerName: c.issuedBy,
          certType: c.certType,
          totalReceived: 0,
          totalIssued: 0,
          totalDamaged: 0,
        };
      }
      map[key].totalReceived++; // every cert record = one phôi allocated
      if (c.status === "ISSUED") map[key].totalIssued++;
    });
    return Object.values(map);
  }, [storeCerts]);

  const certTypes = useMemo(() => ["all", ...Array.from(new Set(liveData.map(d => d.certType)))], [liveData]);

  const filtered = useMemo(() =>
    liveData.filter(d => {
      const q = search.toLowerCase();
      const matchSearch = d.centerName.toLowerCase().includes(q) || d.certType.toLowerCase().includes(q);
      const matchType = certTypeFilter === "all" || d.certType === certTypeFilter;
      return matchSearch && matchType;
    }), [liveData, search, certTypeFilter]);

  const paginated = useMemo(() =>
    filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]);

  // Totals
  const totalIn      = liveData.reduce((a, b) => a + b.totalReceived, 0);
  const totalOut     = liveData.reduce((a, b) => a + b.totalIssued, 0);
  const totalDamaged = liveData.reduce((a, b) => a + b.totalDamaged, 0);
  const totalStock   = totalIn - totalOut - totalDamaged;

  // Bar chart: by cert type
  const certBarData = useMemo(() => {
    const map: Record<string, { received: number; issued: number; damaged: number }> = {};
    liveData.forEach(d => {
      const short = d.certType.replace("Chứng chỉ ", "").replace("GCN ", "");
      if (!map[short]) map[short] = { received: 0, issued: 0, damaged: 0 };
      map[short].received += d.totalReceived;
      map[short].issued   += d.totalIssued;
      map[short].damaged  += d.totalDamaged;
    });
    return Object.entries(map).map(([name, v]) => ({
      name,
      "Đã nhập": v.received,
      "Đã cấp":  v.issued,
      "Hỏng/Lỗi": v.damaged,
    }));
  }, [liveData]);

  const columns: VirtualTableColumn<CertReportData>[] = useMemo(() => [
    {
      key: "center", header: "Đơn vị Quản lý Phôi", width: "42%",
      render: (d) => (
        <div className="py-2">
          <HighlightText text={d.centerName} query={search} className="text-[15px] font-bold text-[#1a1a2e] dark:text-foreground" />
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[12px] bg-primary/10 text-primary px-2 py-0.5 rounded font-mono font-bold">{d.id}</span>
            <HighlightText text={d.certType} query={search} className="text-[12.5px] text-muted-foreground" />
          </div>
        </div>
      )
    },
    {
      key: "import", header: "Nhập Phôi Trắng",
      render: (d) => (
        <span className="text-[15px] font-bold text-[#1a1a2e] dark:text-foreground">
          {d.totalReceived.toLocaleString()} <span className="text-[13px] text-muted-foreground font-medium">phôi</span>
        </span>
      )
    },
    {
      key: "issued", header: "Đã Cấp Phát",
      render: (d) => {
        const rate = ((d.totalIssued / d.totalReceived) * 100).toFixed(0);
        return (
          <div>
            <span className="text-[14.5px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4"/> {d.totalIssued.toLocaleString()}
            </span>
            <p className="text-[11.5px] text-muted-foreground mt-0.5">{rate}% sử dụng</p>
          </div>
        );
      }
    },
    {
      key: "stock_issue", header: "Tồn Kho / Báo Hỏng",
      render: (d) => {
        const stock = d.totalReceived - d.totalIssued - d.totalDamaged;
        return (
          <div className="flex flex-col gap-1">
            <span className="text-[14px] font-semibold text-gray-700 dark:text-gray-300">Tồn: {stock.toLocaleString()}</span>
            {d.totalDamaged > 0 && (
              <span className="text-[12.5px] text-rose-500 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5"/> Lỗi/Hủy: {d.totalDamaged}
              </span>
            )}
          </div>
        );
      }
    }
  ], [search]);

  return (
    <div className="flex-1 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[26px] font-black text-[#1a1a2e] dark:text-foreground tracking-tight">Thống kê Cấp phát Văn bằng</h1>
          <p className="text-[15px] text-muted-foreground mt-1">Giám sát số lượng phôi trắng, phôi đã in và hư hỏng cần thu hồi từ các trung tâm.</p>
        </div>
        <button
          onClick={() => exportCsv(filtered)}
          className="flex items-center gap-2.5 bg-[#1a1a2e] dark:bg-muted text-white px-5 py-3 rounded-2xl text-[15px] shadow-lg hover:bg-black transition-all font-bold self-start"
        >
          <Download className="w-5 h-5"/> Xuất CSV ({filtered.length})
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-card p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-3">
            <FileSignature className="w-5 h-5 text-blue-600"/>
          </div>
          <p className="text-[28px] font-black text-[#1a1a2e] dark:text-foreground leading-none">{totalIn.toLocaleString()}</p>
          <p className="text-[13px] text-muted-foreground font-medium mt-1">Tổng Phôi Đã Rót</p>
        </div>
        <div className="bg-white dark:bg-card p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-3">
            <Award className="w-5 h-5 text-emerald-600"/>
          </div>
          <p className="text-[28px] font-black text-emerald-600 dark:text-emerald-400 leading-none">{totalOut.toLocaleString()}</p>
          <p className="text-[13px] text-muted-foreground font-medium mt-1">Đã Cấp Phát</p>
          <p className="text-[11.5px] text-muted-foreground mt-0.5">{((totalOut/totalIn)*100).toFixed(1)}% tổng phôi</p>
        </div>
        <div className="bg-white dark:bg-card p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5 text-amber-600"/>
          </div>
          <p className="text-[28px] font-black text-amber-600 dark:text-amber-400 leading-none">{totalStock.toLocaleString()}</p>
          <p className="text-[13px] text-muted-foreground font-medium mt-1">Phôi Tồn Kho</p>
        </div>
        <div className="bg-white dark:bg-card p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-rose-50 rounded-bl-full dark:bg-rose-500/5"/>
          <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mb-3">
            <AlertTriangle className="w-5 h-5 text-rose-600"/>
          </div>
          <p className="text-[28px] font-black text-rose-600 dark:text-rose-400 leading-none">{totalDamaged.toLocaleString()}</p>
          <p className="text-[13px] text-muted-foreground font-medium mt-1">Phôi Hỏng / Hủy</p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="bg-white dark:bg-card p-5 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="w-5 h-5 text-blue-500"/>
          <h3 className="text-[15px] font-bold text-[#1a1a2e] dark:text-foreground">Tổng hợp Phôi theo Loại Chứng Chỉ</h3>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={certBarData} margin={{ top: 4, right: 8, left: 0, bottom: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false}/>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} angle={-12} textAnchor="end" interval={0}/>
            <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`}/>
            <Tooltip formatter={(v: number) => [v.toLocaleString() + " phôi", ""]}/>
            <Legend wrapperStyle={{ paddingTop: 8 }}/>
            <Bar dataKey="Đã nhập"   fill="#6366f1" radius={[4, 4, 0, 0]}/>
            <Bar dataKey="Đã cấp"    fill="#10b981" radius={[4, 4, 0, 0]}/>
            <Bar dataKey="Hỏng/Lỗi" fill="#ef4444" radius={[4, 4, 0, 0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-card p-3 rounded-3xl border border-gray-100 dark:border-border mb-3 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"/>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm tên Trung tâm hoặc tên chứng chỉ (VD: IELTS, Tin học)..."
            className="w-full bg-[#f4f5f7] dark:bg-black/20 border border-transparent focus:border-primary/50 transition-colors px-12 py-3.5 rounded-2xl text-[15px] outline-none font-medium"
          />
        </div>
        <div className="flex gap-2 flex-wrap max-w-full overflow-x-auto">
          <button
            onClick={() => { setCertTypeFilter("all"); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all ${certTypeFilter === "all" ? "bg-[#1a1a2e] text-white dark:bg-muted" : "bg-[#f4f5f7] dark:bg-white/5 text-muted-foreground hover:bg-gray-200"}`}
          >
            Tất cả
          </button>
          {certTypes.filter(t => t !== "all").map(t => (
            <button
              key={t}
              onClick={() => { setCertTypeFilter(t); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all ${certTypeFilter === t ? "bg-[#1a1a2e] text-white dark:bg-muted" : "bg-[#f4f5f7] dark:bg-white/5 text-muted-foreground hover:bg-gray-200"}`}
            >
              {t.replace("Chứng chỉ ", "").replace("GCN ", "")}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-3xl overflow-hidden shadow-sm">
        <VirtualTable data={paginated} columns={columns} getRowKey={d => d.id} rowHeight={85} maxHeight={600}/>
      </div>
      <div className="mt-4">
        <Pagination page={page} total={filtered.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} itemLabel="Báo cáo Đơn vị"/>
      </div>
    </div>
  );
}

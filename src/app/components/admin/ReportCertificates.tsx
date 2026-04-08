import { useMemo, useState } from "react";
import { VirtualTable, type VirtualTableColumn } from "./VirtualTable";
import { Search, Download, Award, ShieldCheck, AlertTriangle, FileSignature } from "lucide-react";
import { HighlightText } from "../ui/HighlightText";
import { toast } from "sonner";
import { useUrlPagination } from "../../utils/useUrlPagination";
import { Pagination } from "./Pagination";

interface CertReportData {
  id: string;
  centerName: string;
  certType: string;
  totalReceived: number;
  totalIssued: number;
  totalDamaged: number;
}

const mockData: CertReportData[] = Array.from({ length: 25 }).map((_, i) => {
   const totalReceived = Math.floor(Math.random() * 2000) + 500;
   const totalIssued = Math.floor(totalReceived * (Math.random() * 0.4 + 0.4)); 
   const totalDamaged = Math.floor(totalReceived * (Math.random() * 0.05));
   return {
     id: `CT-${100 + i}`,
     centerName: ["Trung tâm Ngoại ngữ VUS", "TT GDNN-GDTX Tân Bình", "Tin học KHTN", "Ngoại ngữ Tương Lai", "Trường Nghề Thủ Đức"][i % 5] + ` (CS${(i%3)+1})`,
     certType: ["Chứng chỉ Tiếng Anh B1", "Chứng chỉ Tin học Cơ bản", "Chứng chỉ Nghề Hàn", "Chứng chỉ IELTS", "GCN Kế Toán Trưởng"][i%5],
     totalReceived,
     totalIssued,
     totalDamaged
   };
});

export function ReportCertificates() {
  const [search, setSearch] = useState("");
  const { page, pageSize, setPage, setPageSize } = useUrlPagination();

  const filtered = useMemo(() => mockData.filter(d => d.centerName.toLowerCase().includes(search.toLowerCase()) || d.certType.toLowerCase().includes(search.toLowerCase())), [search]);
  const paginated = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize]);

  const columns: VirtualTableColumn<CertReportData>[] = useMemo(() => [
    {
       key: "center", header: "Đơn vị Quản lý Phôi", width: "40%",
       render: (d) => (
         <div className="py-2">
            <HighlightText text={d.centerName} query={search} className="text-[15.5px] font-bold text-[#1a1a2e] dark:text-foreground" />
            <div className="flex items-center gap-2 mt-1">
               <span className="text-[12px] bg-primary/10 text-primary px-2 py-0.5 rounded font-mono font-bold">Mã Nhận: {d.id}</span>
               <HighlightText text={d.certType} query={search} className="text-[13px] text-muted-foreground" />
            </div>
         </div>
       )
    },
    {
       key: "import", header: "Nhập Phôi Trắng (Từ Sở)",
       render: (d) => (
         <span className="text-[15.5px] font-bold text-[#1a1a2e] dark:text-foreground">{d.totalReceived.toLocaleString()} <span className="text-[13px] text-muted-foreground font-medium">phôi</span></span>
       )
    },
    {
       key: "issued", header: "Đã Cấp Phát (+ In ấn thành công)",
       render: (d) => (
         <span className="text-[15.5px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-transparent flex items-center gap-1.5 w-max">
            <ShieldCheck className="w-4 h-4"/> {d.totalIssued.toLocaleString()}
         </span>
       )
    },
    {
       key: "stock_issue", header: "Tồn Kho / Báo Hỏng",
       render: (d) => (
         <div className="flex flex-col gap-1">
            <span className="text-[14px] font-semibold text-gray-700 dark:text-gray-300">Tồn rỗng: {(d.totalReceived - d.totalIssued - d.totalDamaged).toLocaleString()}</span>
            <span className="text-[13px] text-rose-500 font-medium flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5"/> Lỗi in/Hủy: {d.totalDamaged}</span>
         </div>
       )
    }
  ], [search]);

  // totals
  const totalIn = mockData.reduce((a,b)=>a+b.totalReceived,0);
  const totalOut = mockData.reduce((a,b)=>a+b.totalIssued,0);

  return (
    <div className="flex-1 pb-10">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div>
           <h1 className="text-[26px] font-black text-[#1a1a2e] dark:text-foreground tracking-tight">Thống kê Cấp phát Văn bằng</h1>
           <p className="text-[15px] text-muted-foreground mt-1">Giám sát số lượng phôi trắng, phôi đã in và các hư hỏng cần thu hồi từ TT.</p>
        </div>
        <button onClick={() => toast.success("Đang tổng hợp báo cáo Phôi gửi Bộ GD&ĐT...")} className="flex items-center gap-2.5 bg-[#1a1a2e] dark:bg-muted text-white px-5 py-3 rounded-2xl text-[15px] shadow-lg hover:bg-black transition-all font-bold self-start">
           <Download className="w-5 h-5"/> Kết xuất Sổ gốc Excel
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
         <div className="bg-white dark:bg-card p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm text-center">
            <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mx-auto mb-3"><FileSignature className="w-6 h-6 text-blue-600"/></div>
            <p className="text-[32px] font-black text-[#1a1a2e] dark:text-foreground leading-none">{totalIn.toLocaleString()}</p>
            <p className="text-[14.5px] text-muted-foreground font-medium mt-1">Tổng Phôi Trắng Đã Rót</p>
         </div>
         <div className="bg-white dark:bg-card p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mx-auto mb-3"><Award className="w-6 h-6 text-emerald-600"/></div>
            <p className="text-[32px] font-black text-emerald-600 dark:text-emerald-400 leading-none">{totalOut.toLocaleString()}</p>
            <p className="text-[14.5px] text-muted-foreground font-medium mt-1">Chứng chỉ Đã In Cấp Phát</p>
         </div>
         <div className="bg-white dark:bg-card p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -z-10 dark:bg-rose-500/5"/>
            <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mx-auto mb-3"><AlertTriangle className="w-6 h-6 text-rose-600"/></div>
            <p className="text-[32px] font-black text-rose-600 dark:text-rose-400 leading-none">{mockData.reduce((a,b)=>a+b.totalDamaged,0).toLocaleString()}</p>
            <p className="text-[14.5px] text-muted-foreground font-medium mt-1">Phôi in lỗi / Báo Hỏng</p>
         </div>
      </div>

       <div className="bg-white dark:bg-card p-3 rounded-3xl border border-gray-100 dark:border-border mb-6">
         <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm tên Trung tâm hoặc Tên chứng chỉ (VD: IELTS, Tin học)..." className="w-full bg-[#f4f5f7] dark:bg-black/20 focus:border-primary/50 transition-colors border-transparent border px-12 py-3.5 rounded-2xl text-[15.5px] outline-none font-medium" />
         </div>
      </div>

      <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-3xl overflow-hidden shadow-sm">
         <VirtualTable data={paginated} columns={columns} getRowKey={d=>d.id} rowHeight={85} maxHeight={600} />
      </div>
      <div className="mt-4">
         <Pagination page={page} total={filtered.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} itemLabel="Báo cáo Đơn vị" />
      </div>
    </div>
  )
}

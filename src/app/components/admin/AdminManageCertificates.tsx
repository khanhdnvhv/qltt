import { useState, useMemo } from "react";
import { VirtualTable, type VirtualTableColumn } from "./VirtualTable";
import { Search, Printer, FileCheck, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { HighlightText } from "../ui/HighlightText";
import { useUrlPagination } from "../../utils/useUrlPagination";
import { Pagination } from "./Pagination";
import { toast } from "sonner";

interface CertRequest {
  id: string;
  studentName: string;
  dob: string;
  className: string;
  certType: string;
  score: number;
  status: "PENDING" | "PRINTED" | "ISSUED" | "ERROR";
  serialNo?: string;
}

const mockReqs: CertRequest[] = Array.from({ length: 45 }).map((_, i) => {
  const statuses: CertRequest["status"][] = ["PENDING", "PRINTED", "ISSUED", "ERROR"];
  const st = statuses[i % 4];
  return {
    id: `REQ-${2000 + i}`,
    studentName: ["Nguyễn Văn An", "Trần Thị Cẩm Nương", "Lê Khắc Bình", "Phạm Hoàng Sơn", "Vũ Đăng Dương"][i%5],
    dob: `12/0${(i%9)+1}/200${i%9}`,
    className: ["Lớp Toeic Tối", "Tin học VP K2", "Kế toán T4", "Nghề Điện Lạnh", "SEO Nâng cao"][i%5],
    certType: ["Chứng chỉ Toeic 600", "GCN Tin học CB", "GCN Kế toán", "Sơ cấp nghề Lạnh", "GCN Digital Marketing"][i%5],
    score: Math.floor(Math.random() * 4) + 6,
    status: st,
    serialNo: st === 'PENDING' ? undefined : `A${100000+i}`
  };
});

export function AdminManageCertificates() {
  const [search, setSearch] = useState("");
  const { page, pageSize, setPage, setPageSize } = useUrlPagination();

  const filtered = useMemo(() => mockReqs.filter(c => c.studentName.toLowerCase().includes(search.toLowerCase()) || c.certType.toLowerCase().includes(search.toLowerCase())), [search]);
  const paginated = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize]);

  const columns: VirtualTableColumn<CertRequest>[] = useMemo(() => [
     {
        key: "student", header: "Thông tin Học viên", width: "35%",
        render: (c) => (
           <div className="py-2">
              <p className="text-[15.5px] font-bold text-[#1a1a2e] dark:text-foreground line-clamp-1 mb-0.5">
                 <HighlightText text={c.studentName} query={search} />
              </p>
              <div className="flex items-center gap-3 text-[13px] text-muted-foreground font-medium">
                 <span>NS: {c.dob}</span>
                 <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                 <span>Lớp: {c.className}</span>
              </div>
           </div>
        )
     },
     {
        key: "cert", header: "Khoản mục Cấp phát",
        render: (c) => (
           <div className="flex flex-col gap-1 w-max">
              <span className="text-[14px] font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5"><FileCheck className="w-4 h-4"/> <HighlightText text={c.certType} query={search} /></span>
              <span className="text-[13px] font-bold text-gray-500">Điểm KQ: {c.score}/10</span>
           </div>
        )
     },
     {
        key: "serial", header: "Mã Phôi / Seri Gốc",
        render: (c) => c.serialNo ? (
           <span className="font-mono text-[14px] bg-amber-50 text-amber-600 dark:bg-amber-500/10 px-2.5 py-1 rounded-lg font-bold tracking-widest border border-amber-200 dark:border-amber-500/30">#{c.serialNo}</span>
        ) : (
           <span className="text-[13px] italic text-muted-foreground">Chưa gọi phôi</span>
        )
     },
     {
        key: "status", header: "Tiến trình",
        render: (c) => {
           if(c.status === 'PENDING') return <span className="px-2.5 py-1 rounded-lg text-[13px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-500/10">Chờ gọi Phôi</span>;
           if(c.status === 'PRINTED') return <span className="px-2.5 py-1 rounded-lg text-[13px] font-bold bg-purple-50 text-purple-600 dark:bg-purple-500/10 flex items-center gap-1 w-max"><Printer className="w-3.5 h-3.5"/> Đã IN xong</span>;
           if(c.status === 'ISSUED') return <span className="px-2.5 py-1 rounded-lg text-[13px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 flex items-center gap-1 w-max"><CheckCircle2 className="w-3.5 h-3.5"/> Đã phát HV</span>;
           return <span className="px-2.5 py-1 rounded-lg text-[13px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-500/10 flex items-center gap-1 w-max"><AlertTriangle className="w-3.5 h-3.5"/> Phôi In Kẹt/Lỗi</span>;
        }
     },
     {
        key: "actions", header: "", width: "130px",
        render: (c) => (
           <button 
             onClick={() => toast.success("Kết xuất lệnh in trực tiếp tới Máy in Sở...")}
             disabled={c.status === 'ISSUED' || c.status === 'ERROR'}
             className={`flex justify-center w-full p-2 rounded-xl border transition-all text-[13px] font-bold flex items-center gap-1.5 ${c.status === 'ISSUED' || c.status==='ERROR' ? 'bg-gray-100 text-gray-400 border-transparent cursor-not-allowed' : 'bg-primary text-white hover:opacity-90 border-primary shadow-sm'}`}
           >
              {c.status === 'PENDING' ? <><ShieldCheck className="w-4 h-4"/> Rút Phôi</> : <><Printer className="w-4 h-4"/> Lệnh In</>}
           </button>
        )
     }
  ], [search]);

  return (
    <div className="flex-1 pb-10">
       <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div>
             <h1 className="text-[26px] font-black text-[#1a1a2e] dark:text-foreground tracking-tight">Cấp phát & In ấn Văn bằng</h1>
             <p className="text-[15px] text-muted-foreground mt-1">Trực tiếp In chứng chỉ và tiêu hao Phôi theo Danh sách HV tốt nghiệp đạt chuẩn.</p>
          </div>
          <div className="flex items-center gap-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 px-5 py-2.5 rounded-2xl">
             <div className="w-10 h-10 bg-amber-100 dark:bg-amber-500/20 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5"/>
             </div>
             <div>
                <p className="text-[12px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">Tồn kho Phôi Trắng</p>
                <p className="text-[18px] font-black text-amber-700 dark:text-amber-500 leading-none mt-0.5">14,204 <span className="text-[13px] font-medium">Tem</span></p>
             </div>
          </div>
       </div>

       <div className="bg-white dark:bg-card p-3 rounded-3xl border border-gray-100 dark:border-border mb-6 flex gap-3">
         <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm học viên nhận bằng, Tên chứng chỉ..." className="w-full bg-[#f4f5f7] dark:bg-black/20 focus:border-primary/50 transition-colors border-transparent border px-12 py-3.5 rounded-2xl text-[15.5px] outline-none font-medium" />
         </div>
         <select className="bg-[#f4f5f7] dark:bg-black/20 px-5 py-3.5 rounded-2xl text-[15px] font-semibold outline-none border border-transparent">
            <option>Toàn bộ Trạng thái</option>
            <option>Chờ gọi phôi (Mới)</option>
            <option>Đã in (Chưa phát)</option>
            <option>Đã phát an toàn</option>
         </select>
       </div>

       <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-3xl overflow-hidden shadow-sm">
         <VirtualTable data={paginated} columns={columns} getRowKey={c=>c.id} rowHeight={85} maxHeight={600} />
       </div>
       <div className="mt-4">
          <Pagination page={page} total={filtered.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} itemLabel="Chỉ tiêu" />
       </div>
    </div>
  )
}

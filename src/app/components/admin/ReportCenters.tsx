import { useMemo, useState } from "react";
import { VirtualTable, type VirtualTableColumn } from "./VirtualTable";
import { Search, Download, Building, Building2, MapPin, Users, Target, Activity } from "lucide-react";
import { HighlightText } from "../ui/HighlightText";
import { toast } from "sonner";
import { useUrlPagination } from "../../utils/useUrlPagination";
import { Pagination } from "./Pagination";

interface CenterReportData {
  id: string;
  name: string;
  type: string;
  district: string;
  totalStudents: number;
  activeClasses: number;
  status: "active" | "suspended" | "pending";
}

const mockData: CenterReportData[] = Array.from({ length: 45 }).map((_, i) => ({
  id: `TT-${2000 + i}`,
  name: ["Trung tâm Ngoại ngữ VUS", "TT GDNN-GDTX Tân Bình", "Tin học Tiến Đạt", "Ngoại ngữ Không Gian", "Nghề Điện Thành Đạt"][i % 5] + ` CS${i+1}`,
  type: ["Ngôn ngữ", "GDNN", "Tin học", "Ngôn ngữ", "GDNN"][i % 5],
  district: ["Quận 1", "Tân Bình", "Thủ Đức", "Quận 3", "Bình Chánh"][i % 5],
  totalStudents: Math.floor(Math.random() * 5000) + 200,
  activeClasses: Math.floor(Math.random() * 100) + 10,
  status: i % 10 === 0 ? "suspended" : i % 8 === 0 ? "pending" : "active"
}));

export function ReportCenters() {
  const [search, setSearch] = useState("");
  const { page, pageSize, setPage, setPageSize } = useUrlPagination();

  const filtered = useMemo(() => mockData.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.id.includes(search)), [search]);
  const paginated = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize]);

  const columns: VirtualTableColumn<CenterReportData>[] = useMemo(() => [
    {
      key: "info", header: "Trung tâm Đào tạo", width: "35%",
      render: (d) => (
        <div className="py-2">
          <HighlightText text={d.name} query={search} className="text-[15.5px] font-bold text-[#1a1a2e] dark:text-foreground block" />
          <div className="flex items-center gap-2 mt-1">
             <span className="text-[12px] font-mono bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded text-muted-foreground">{d.id}</span>
             <span className="text-[13px] text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3"/> {d.district}</span>
          </div>
        </div>
      )
    },
    {
      key: "type", header: "Loại hình tổ chức",
      render: (d) => <span className="inline-flex items-center gap-1.5 min-h-[28px] px-3 bg-[#f4f5f7] dark:bg-white/5 rounded-lg text-[13.5px] font-semibold text-primary">{d.type}</span>
    },
    {
      key: "scale", header: "Quy mô",
      render: (d) => (
        <div>
           <p className="text-[15px] font-bold text-[#1a1a2e] dark:text-foreground flex items-center gap-2"><Users className="w-4 h-4 text-blue-500"/> {d.totalStudents.toLocaleString()} HV</p>
           <p className="text-[13px] text-muted-foreground mt-0.5">Đang mở: {d.activeClasses} lớp</p>
        </div>
      )
    },
    {
      key: "status", header: "Trạng thái",
      render: (d) => {
        const styles = {
           active: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
           suspended: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
           pending: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
        }[d.status];
        const labels = { active: "Đang hoạt động", suspended: "Bị đình chỉ", pending: "Chờ cấp phép mới" }[d.status];
        return <span className={`inline-flex px-3 py-1.5 rounded-lg text-[13px] font-bold ${styles}`}>{labels}</span>
      }
    }
  ], [search]);

  return (
    <div className="flex-1 pb-10">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div>
           <h1 className="text-[26px] font-black text-[#1a1a2e] dark:text-foreground tracking-tight">Thống kê Trung Tâm (Mạng lưới Đào tạo)</h1>
           <p className="text-[15px] text-muted-foreground mt-1">Báo cáo mạng lưới các đơn vị GDNN-GDTX, Ngoại ngữ & Tin học trên địa bàn.</p>
        </div>
        <button onClick={() => toast.success("Đang xuất Báo cáo Excel...")} className="flex items-center gap-2.5 bg-emerald-600 text-white px-5 py-3 rounded-2xl text-[15px] shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all font-bold self-start">
           <Download className="w-5 h-5"/> Xuất File Excel
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="bg-white dark:bg-card p-5 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
           <Building className="w-7 h-7 text-blue-500 mb-3" />
           <p className="text-[26px] font-black text-[#1a1a2e] dark:text-foreground">{mockData.length}</p>
           <p className="text-[14px] text-muted-foreground font-medium">Tổng Trung Tâm Tỉnh</p>
        </div>
        <div className="bg-white dark:bg-card p-5 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
           <Activity className="w-7 h-7 text-emerald-500 mb-3" />
           <p className="text-[26px] font-black text-[#1a1a2e] dark:text-foreground">{mockData.filter(m => m.status === 'active').length}</p>
           <p className="text-[14px] text-muted-foreground font-medium">Đang Hoạt Động Cấp Phép</p>
        </div>
        <div className="bg-white dark:bg-card p-5 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
           <Target className="w-7 h-7 text-amber-500 mb-3" />
           <p className="text-[26px] font-black text-[#1a1a2e] dark:text-foreground">{mockData.reduce((a,b)=>a+b.totalStudents,0).toLocaleString()}</p>
           <p className="text-[14px] text-muted-foreground font-medium">Tổng Quy Mô Học Viên Toàn Đảo</p>
        </div>
      </div>

      <div className="bg-white dark:bg-card p-3 rounded-3xl border border-gray-100 dark:border-border mb-6">
         <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm kiếm Trung tâm xuất báo cáo..." className="w-full bg-[#f4f5f7] dark:bg-black/20 focus:border-primary/50 transition-colors border-transparent border px-12 py-3.5 rounded-2xl text-[15.5px] outline-none font-medium" />
         </div>
      </div>
      
      <div className="bg-white dark:bg-card rounded-3xl border border-gray-100 dark:border-border overflow-hidden shadow-sm">
         <VirtualTable data={paginated} columns={columns} getRowKey={d=>d.id} rowHeight={80} maxHeight={600} />
      </div>
      <div className="mt-4">
         <Pagination page={page} total={filtered.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} itemLabel="Trung tâm" />
      </div>
    </div>
  )
}

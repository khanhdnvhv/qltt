import { useMemo, useState } from "react";
import { VirtualTable, type VirtualTableColumn } from "./VirtualTable";
import { Search, Download, BookOpen, GraduationCap, TrendingUp, PieChart } from "lucide-react";
import { HighlightText } from "../ui/HighlightText";
import { toast } from "sonner";
import { useUrlPagination } from "../../utils/useUrlPagination";
import { Pagination } from "./Pagination";

interface TrainingReportData {
  id: string;
  programGroup: string;
  totalEnrolled: number;
  totalPassed: number;
  totalFailed: number;
  dropRate: number; // percentage
}

const mockData: TrainingReportData[] = [
  { id: "TR-001", programGroup: "Tin học Ứng dụng Cơ bản", totalEnrolled: 15400, totalPassed: 13200, totalFailed: 1500, dropRate: 4.5 },
  { id: "TR-002", programGroup: "Tiếng Anh Trẻ em & Thiếu niên", totalEnrolled: 8200, totalPassed: 7800, totalFailed: 200, dropRate: 2.4 },
  { id: "TR-003", programGroup: "Sơ cấp Nghề Thẩm mỹ - Spa", totalEnrolled: 2100, totalPassed: 1850, totalFailed: 150, dropRate: 4.7 },
  { id: "TR-004", programGroup: "Tin học Văn phòng Quốc tế MOS", totalEnrolled: 5400, totalPassed: 4900, totalFailed: 400, dropRate: 1.8 },
  { id: "TR-005", programGroup: "Kỹ thuật Máy lạnh & ĐHKK", totalEnrolled: 1200, totalPassed: 950, totalFailed: 150, dropRate: 8.3 },
  { id: "TR-006", programGroup: "Cấp tốc Tiếng Nhật N4/N5", totalEnrolled: 3000, totalPassed: 2100, totalFailed: 600, dropRate: 10.0 },
  { id: "TR-007", programGroup: "Bổ túc THCS - GDTX", totalEnrolled: 8000, totalPassed: 7200, totalFailed: 500, dropRate: 3.7 },
  { id: "TR-008", programGroup: "Sơ cấp Hàn Công Nghệ Cao", totalEnrolled: 950, totalPassed: 800, totalFailed: 100, dropRate: 5.2 },
  { id: "TR-009", programGroup: "Luyện thi IELTS 6.5+", totalEnrolled: 4200, totalPassed: 2500, totalFailed: 1400, dropRate: 7.1 },
];

export function ReportTraining() {
  const [search, setSearch] = useState("");
  const { page, pageSize, setPage, setPageSize } = useUrlPagination();

  const filtered = useMemo(() => mockData.filter(d => d.programGroup.toLowerCase().includes(search.toLowerCase())), [search]);
  const paginated = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize]);

  const columns: VirtualTableColumn<TrainingReportData>[] = useMemo(() => [
    {
       key: "group", header: "Khối Ngành / Lĩnh Vực Đào Tạo", width: "40%",
       render: (d) => (
         <div className="py-2">
            <HighlightText text={d.programGroup} query={search} className="text-[15.5px] font-bold text-[#1a1a2e] dark:text-foreground" />
            <p className="text-[13px] text-muted-foreground mt-1">Mã Nhóm: {d.id}</p>
         </div>
       )
    },
    {
       key: "input", header: "Tổng Đầu Vào",
       render: (d) => (
         <div className="flex flex-col gap-1">
            <span className="text-[15px] font-bold text-blue-600 dark:text-blue-400">{d.totalEnrolled.toLocaleString()} HV</span>
            <span className="text-[12.5px] text-muted-foreground">Tỷ lệ bỏ ngang: <span className="text-rose-500 font-semibold">{d.dropRate}%</span></span>
         </div>
       )
    },
    {
       key: "output", header: "Hiệu Suất Đầu Ra (Kết quả)",
       render: (d) => {
         const passRate = ((d.totalPassed / d.totalEnrolled) * 100).toFixed(1);
         return (
           <div className="w-full max-w-[200px]">
             <div className="flex justify-between items-center mb-1.5">
                <span className="text-[13.5px] font-bold text-emerald-600">{d.totalPassed.toLocaleString()} Đạt</span>
                <span className="text-[12.5px] font-bold text-gray-500">{passRate}%</span>
             </div>
             <div className="h-2 w-full bg-red-100 rounded-full overflow-hidden flex">
                <div className="h-full bg-emerald-500" style={{ width: `${passRate}%` }} />
             </div>
             <div className="mt-1.5 text-[12px] text-muted-foreground font-medium text-right">{d.totalFailed.toLocaleString()} Thi rớt/Chưa đạt</div>
           </div>
         );
       }
    }
  ], [search]);

  return (
    <div className="flex-1 pb-10">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div>
           <h1 className="text-[26px] font-black text-[#1a1a2e] dark:text-foreground tracking-tight">Báo Cáo Chất Lượng Đào Tạo</h1>
           <p className="text-[15px] text-muted-foreground mt-1">Đo lường tỷ lệ đầu vào, đầu ra và chất lượng giảng dạy theo nhóm môn học.</p>
        </div>
        <button onClick={() => toast.success("Đang trích xuất Pivot Đào tạo...")} className="flex items-center gap-2.5 bg-indigo-600 text-white px-5 py-3 rounded-2xl text-[15px] shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all font-bold self-start">
           <Download className="w-5 h-5"/> Tải File Phân Tích .XLSX
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
         <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-500/10 dark:to-blue-500/10 p-5 rounded-3xl border border-indigo-100 dark:border-indigo-500/20">
            <div className="flex justify-between items-start mb-2">
               <BookOpen className="w-7 h-7 text-indigo-600" />
               <span className="text-[13px] bg-white dark:bg-card px-2 py-1 rounded-md text-indigo-700 font-bold border border-indigo-100">+5 Lĩnh vực mới</span>
            </div>
            <p className="text-[28px] font-black text-indigo-900 dark:text-indigo-100">{mockData.length}</p>
            <p className="text-[14px] text-indigo-700/80 dark:text-indigo-300 font-medium">Nhóm Ngành Đào Tạo Trọng Điểm</p>
         </div>
         <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 p-5 rounded-3xl border border-emerald-100 dark:border-emerald-500/20">
            <PieChart className="w-7 h-7 text-emerald-600 mb-2" />
            <p className="text-[28px] font-black text-emerald-900 dark:text-emerald-100">{mockData.reduce((a,b)=>a+b.totalPassed,0).toLocaleString()}</p>
            <p className="text-[14px] text-emerald-700/80 dark:text-emerald-300 font-medium">Học viên Đạt Chứng chỉ / Tốt nghiệp</p>
         </div>
         <div className="bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-500/10 dark:to-red-500/10 p-5 rounded-3xl border border-rose-100 dark:border-rose-500/20">
            <TrendingUp className="w-7 h-7 text-rose-600 mb-2" />
            <p className="text-[28px] font-black text-rose-900 dark:text-rose-100">{((mockData.reduce((a,b)=>a+b.totalFailed,0) / mockData.reduce((a,b)=>a+b.totalEnrolled,0))*100).toFixed(1)}%</p>
            <p className="text-[14px] text-rose-700/80 dark:text-rose-300 font-medium">Tỷ lệ Thi trượt / Trật tốt nghiệp TT</p>
         </div>
      </div>

       <div className="bg-white dark:bg-card p-3 rounded-3xl border border-gray-100 dark:border-border mb-6">
         <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nhập nhóm lĩnh vực để thống kê (ví dụ: Tin học, Ngoại ngữ)..." className="w-full bg-[#f4f5f7] dark:bg-black/20 focus:border-primary/50 transition-colors border-transparent border px-12 py-3.5 rounded-2xl text-[15.5px] outline-none font-medium" />
         </div>
      </div>

      <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-3xl overflow-hidden shadow-sm">
         <VirtualTable data={paginated} columns={columns} getRowKey={d=>d.id} rowHeight={85} maxHeight={600} />
      </div>
      <div className="mt-4">
         <Pagination page={page} total={filtered.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} itemLabel="Nhóm Ngành" />
      </div>
    </div>
  )
}

import { useState, useMemo } from "react";
import { VirtualTable, type VirtualTableColumn } from "./VirtualTable";
import { Search, Plus, CalendarRange, Trash2, Edit, ListTree, Calendar, PauseCircle, CheckCircle2 } from "lucide-react";
import { HighlightText } from "../ui/HighlightText";
import { useUrlPagination } from "../../utils/useUrlPagination";
import { Pagination } from "./Pagination";
import { toast } from "sonner";
import { Link } from "react-router";

interface Course {
  id: string;
  name: string;
  program: string;
  classCount: number;
  startDate: string;
  endDate: string;
  status: "ENROLLING" | "IN_PROGRESS" | "COMPLETED" | "PAUSED";
}

const statusConfig = {
  ENROLLING: { label: "Đang Chiêu sinh", color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10", icon: CalendarRange },
  IN_PROGRESS: { label: "Đang Giảng dạy", color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10", icon: ListTree },
  COMPLETED: { label: "Đã Kết thúc", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10", icon: CheckCircle2 },
  PAUSED: { label: "Tạm ngưng", color: "text-rose-600 bg-rose-50 dark:bg-rose-500/10", icon: PauseCircle },
};

const mockCourses: Course[] = Array.from({ length: 35 }).map((_, i) => {
  const statuses: Course["status"][] = ["ENROLLING", "IN_PROGRESS", "COMPLETED", "PAUSED"];
  return {
    id: `CRS-2026-${i+100}`,
    name: ["Khóa Tiếng Anh B1 Cấp tốc", "Lớp Nghiệp Vụ Sư Phạm K18", "Khóa Kế toán trưởng Tháng 8", "Lớp Hàn Tig/Mig Nâng cao", "Sát hạch Tin học IC3 - Đợt 4"][i%5] + ` (Nhóm ${i%3 + 1})`,
    program: ["Ngoại ngữ Tương Lai", "Chuyên đề GDTX", "Đào tạo Ngắn hạn Kinh tế", "Sơ cấp nghề Cơ khí", "Tin học chuyên sâu"][i%5],
    classCount: Math.floor(Math.random() * 5) + 1,
    startDate: `15/0${(i%5)+4}/2026`,
    endDate: `15/0${(i%5)+7}/2026`,
    status: statuses[i % 4]
  };
});

export function AdminCourses() {
  const [search, setSearch] = useState("");
  const { page, pageSize, setPage, setPageSize } = useUrlPagination();

  const filtered = useMemo(() => mockCourses.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase())), [search]);
  const paginated = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize]);

  const columns: VirtualTableColumn<Course>[] = useMemo(() => [
     {
        key: "info", header: "Thông tin Khóa Đào tạo", width: "40%",
        render: (c) => (
           <div className="py-2">
              <p className="text-[15px] font-bold text-[#1a1a2e] dark:text-foreground line-clamp-1 mb-1">
                 <HighlightText text={c.name} query={search} />
              </p>
              <div className="flex items-center gap-2">
                 <span className="font-mono text-[12px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">{c.id}</span>
                 <span className="text-[12.5px] text-muted-foreground font-medium">{c.program}</span>
              </div>
           </div>
        )
     },
     {
        key: "classes", header: "Danh sách Lớp con",
        render: (c) => (
           <Link to={`/admin/classes?course=${c.id}`} className="text-[14px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-500/20 flex items-center gap-1.5 w-max transition-all">
              Tổ chức {c.classCount} Lớp
           </Link>
        )
     },
     {
        key: "schedule", header: "Khoảng Thời gian",
        render: (c) => (
           <div className="flex items-center gap-3">
              <div>
                 <p className="text-[12px] text-muted-foreground font-semibold mb-0.5">Khai giảng</p>
                 <p className="text-[14px] font-bold text-[#1a1a2e] dark:text-gray-200 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-blue-500"/>{c.startDate}</p>
              </div>
              <div className="w-4 border-b-2 border-dashed border-gray-300 dark:border-gray-600 mt-4"></div>
              <div>
                 <p className="text-[12px] text-muted-foreground font-semibold mb-0.5">Bế giảng</p>
                 <p className="text-[14px] border-b border-transparent border-dashed text-[#1a1a2e] dark:text-gray-200 font-bold">{c.endDate}</p>
              </div>
           </div>
        )
     },
     {
        key: "status", header: "Trạng thái",
        render: (c) => {
           const S = statusConfig[c.status];
           return (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[13px] font-bold ${S.color}`}>
                 <S.icon className="w-3.5 h-3.5"/> {S.label}
              </span>
           )
        }
     },
     {
        key: "actions", header: "", width: "80px",
        render: () => (
           <div className="flex items-center gap-2">
              <button className="p-1.5 text-muted-foreground hover:bg-indigo-50 hover:text-indigo-600 rounded-lg"><Edit className="w-4 h-4"/></button>
              <button className="p-1.5 text-muted-foreground hover:bg-rose-50 hover:text-rose-600 rounded-lg"><Trash2 className="w-4 h-4"/></button>
           </div>
        )
     }
  ], [search]);

  return (
    <div className="flex-1 pb-10">
       <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div>
             <h1 className="text-[26px] font-black text-[#1a1a2e] dark:text-foreground tracking-tight">Sổ quản lý Khóa Đào Tạo</h1>
             <p className="text-[15px] text-muted-foreground mt-1">Giám sát vòng đời các Khóa học (Chiêu sinh - Mở lớp - Bế giảng).</p>
          </div>
          <button onClick={() => toast.success("Đang mở biểu mẫu thêm Khóa...")} className="flex items-center gap-2.5 bg-primary text-white px-5 py-3 rounded-2xl text-[15px] shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all font-bold self-start">
             <Plus className="w-5 h-5"/> Phát hành Khóa Mới
          </button>
       </div>

       <div className="bg-white dark:bg-card p-3 rounded-3xl border border-gray-100 dark:border-border mb-6">
         <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nhập tên khóa học hoặc mã khóa..." className="w-full bg-[#f4f5f7] dark:bg-black/20 focus:border-primary/50 transition-colors border-transparent border pl-12 pr-4 py-3.5 rounded-2xl text-[15.5px] outline-none font-medium" />
         </div>
       </div>

       <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-3xl overflow-hidden shadow-sm">
         <VirtualTable data={paginated} columns={columns} getRowKey={c=>c.id} rowHeight={85} maxHeight={600} />
       </div>
       <div className="mt-4">
          <Pagination page={page} total={filtered.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} itemLabel="Khóa học" />
       </div>
    </div>
  )
}

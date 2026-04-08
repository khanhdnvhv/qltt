import { useState, useMemo } from "react";
import { VirtualTable, type VirtualTableColumn } from "./VirtualTable";
import { Search, Plus, Edit, Trash2, Box, Clock, LayoutTemplate } from "lucide-react";
import { HighlightText } from "../ui/HighlightText";
import { useUrlPagination } from "../../utils/useUrlPagination";
import { Pagination } from "./Pagination";
import { toast } from "sonner";

interface CourseModule {
  id: string;
  name: string;
  program: string;
  theoryHours: number;
  practiceHours: number;
  status: "active" | "draft";
}

const mockModules: CourseModule[] = Array.from({ length: 45 }).map((_, i) => ({
  id: `MOD-${1000 + i}`,
  name: ["Lý thuyết Kế toán Tài chính", "Thực hành Máy lạnh dân dụng", "Từ vựng IELTS chuyên sâu", "Cấu trúc dữ liệu và giải thuật", "Thực tập Garage Ô tô"][i%5],
  program: ["Kế toán Trưởng", "CĐN Điện lạnh", "IELTS 6.5 Intensive", "CNTT Lập trình mạng", "Sơ cấp nghề Ô tô"][i%5],
  theoryHours: Math.floor(Math.random() * 45) + 15,
  practiceHours: Math.floor(Math.random() * 80) + 10,
  status: i % 7 === 0 ? "draft" : "active"
}));

export function AdminCourseModules() {
  const [search, setSearch] = useState("");
  const { page, pageSize, setPage, setPageSize } = useUrlPagination();

  const filtered = useMemo(() => mockModules.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.program.toLowerCase().includes(search.toLowerCase())), [search]);
  const paginated = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize]);

  const columns: VirtualTableColumn<CourseModule>[] = useMemo(() => [
     {
        key: "name", header: "Tên Học phần / Môn học", width: "40%",
        render: (m) => (
           <div className="py-2">
              <div className="flex items-center gap-2 mb-1">
                 <Box className="w-4 h-4 text-primary shrink-0"/>
                 <HighlightText text={m.name} query={search} className="text-[15.5px] font-bold text-[#1a1a2e] dark:text-foreground line-clamp-1" />
              </div>
              <span className="inline-flex items-center gap-1 text-[12.5px] text-muted-foreground font-semibold bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded ml-6">
                 Thuộc CT: {m.program}
              </span>
           </div>
        )
     },
     {
        key: "time", header: "Thời lượng Phân bổ",
        render: (m) => (
           <div className="flex flex-col gap-1">
              <span className="text-[13.5px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5"><LayoutTemplate className="w-3.5 h-3.5"/> Lý thuyết: {m.theoryHours} tiết</span>
              <span className="text-[13.5px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> Thực hành: {m.practiceHours} tiết</span>
           </div>
        )
     },
     {
        key: "status", header: "Trạng thái",
        render: (m) => (
           <span className={`px-2.5 py-1 rounded-lg text-[13px] font-bold ${m.status === 'active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-gray-100 text-gray-600 dark:bg-white/10'}`}>
              {m.status === 'active' ? 'Đã duyệt giảng dạy' : 'Bản nháp dự thảo'}
           </span>
        )
     },
     {
        key: "actions", header: "", width: "100px",
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
             <h1 className="text-[26px] font-black text-[#1a1a2e] dark:text-foreground tracking-tight">Quản lý Học Phần (Modules)</h1>
             <p className="text-[15px] text-muted-foreground mt-1">Quản trị nội dung và phân bổ thời lượng của từng Môn học trong cấu trúc Khóa.</p>
          </div>
          <button onClick={() => toast.success("Mở Form thêm Môn học...")} className="flex items-center gap-2.5 bg-primary text-white px-5 py-3 rounded-2xl text-[15px] shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all font-bold self-start">
             <Plus className="w-5 h-5"/> Khởi tạo Học phần
          </button>
       </div>

       <div className="bg-white dark:bg-card p-3 rounded-3xl border border-gray-100 dark:border-border mb-6">
         <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm kiếm tên Học phần, tên Môn học hoặc Chương trình mẹ..." className="w-full bg-[#f4f5f7] dark:bg-black/20 focus:border-primary/50 transition-colors border-transparent border pl-12 pr-4 py-3.5 rounded-2xl text-[15.5px] outline-none font-medium" />
         </div>
       </div>

       <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-3xl overflow-hidden shadow-sm">
         <VirtualTable data={paginated} columns={columns} getRowKey={c=>c.id} rowHeight={80} maxHeight={600} />
       </div>
       <div className="mt-4">
          <Pagination page={page} total={filtered.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} itemLabel="Học phần" />
       </div>
    </div>
  )
}

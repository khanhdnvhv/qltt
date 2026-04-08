import { useState, useMemo } from "react";
import { VirtualTable, type VirtualTableColumn } from "./VirtualTable";
import { Search, Plus, Tag, FolderTree, Edit, Trash2 } from "lucide-react";
import { HighlightText } from "../ui/HighlightText";
import { useUrlPagination } from "../../utils/useUrlPagination";
import { Pagination } from "./Pagination";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  code: string;
  parent: string | null;
  status: "active" | "inactive";
  programsCount: number;
}

const mockCategories: Category[] = [
  { id: "C1", name: "Đào tạo Ngoại ngữ", code: "NN", parent: null, status: "active", programsCount: 15 },
  { id: "C1-1", name: "Tiếng Anh Thiếu nhi", code: "NN-KIDS", parent: "Đào tạo Ngoại ngữ", status: "active", programsCount: 5 },
  { id: "C1-2", name: "Luyện thi IELTS/TOEIC", code: "NN-IELTS", parent: "Đào tạo Ngoại ngữ", status: "active", programsCount: 4 },
  { id: "C2", name: "Đào tạo Tin học", code: "TH", parent: null, status: "active", programsCount: 12 },
  { id: "C2-1", name: "Tin học văn phòng cơ bản", code: "TH-VP", parent: "Đào tạo Tin học", status: "active", programsCount: 3 },
  { id: "C3", name: "Giáo dục Thường xuyên", code: "GDTX", parent: null, status: "active", programsCount: 8 },
  { id: "C4", name: "Giáo dục Nghề nghiệp", code: "GDNN", parent: null, status: "active", programsCount: 22 },
  { id: "C4-1", name: "Sơ cấp nghề Cơ khí - Hàn", code: "NN-CK", parent: "Giáo dục Nghề nghiệp", status: "active", programsCount: 6 }
];

export function AdminProgramCategories() {
  const [search, setSearch] = useState("");
  const { page, pageSize, setPage, setPageSize } = useUrlPagination();

  const filtered = useMemo(() => mockCategories.filter(c => c.name.toLowerCase().includes(search.toLowerCase())), [search]);
  const paginated = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize]);

  const columns: VirtualTableColumn<Category>[] = useMemo(() => [
     {
        key: "name", header: "Cấu trúc Danh mục", width: "40%",
        render: (c) => (
           <div className={`py-1 ${c.parent ? "pl-8" : ""}`}>
              <div className="flex items-center gap-2">
                 {!c.parent ? <FolderTree className="w-5 h-5 text-primary"/> : <Tag className="w-4 h-4 text-emerald-600"/> }
                 <HighlightText text={c.name} query={search} className={`text-[15.5px] ${!c.parent ? 'font-black text-[#1a1a2e] dark:text-foreground' : 'font-semibold text-gray-700 dark:text-gray-300'}`} />
              </div>
           </div>
        )
     },
     {
        key: "code", header: "Mã Danh mục",
        render: (c) => <span className="font-mono text-[13px] bg-gray-100 dark:bg-white/10 px-2 py-1 rounded text-muted-foreground font-bold">{c.code}</span>
     },
     {
        key: "count", header: "SL Khóa học",
        render: (c) => <span className="text-[14px] font-bold text-indigo-600 dark:text-indigo-400">{c.programsCount} CT Đào tạo</span>
     },
     {
        key: "actions", header: "", width: "100px",
        render: () => (
           <div className="flex items-center gap-2">
              <button className="p-1.5 text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600 rounded-lg"><Edit className="w-4 h-4"/></button>
              <button className="p-1.5 text-muted-foreground hover:bg-rose-50 hover:text-rose-600 rounded-lg"><Trash2 className="w-4 h-4"/></button>
           </div>
        )
     }
  ], [search]);

  return (
    <div className="flex-1 pb-10">
       <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div>
             <h1 className="text-[26px] font-black text-[#1a1a2e] dark:text-foreground tracking-tight">Danh mục Khung Chương trình</h1>
             <p className="text-[15px] text-muted-foreground mt-1">Phân cấp cây danh mục (Category Tree) cho các mảng đào tạo của Trung tâm.</p>
          </div>
          <button onClick={() => toast.success("Đang mở Form tạo Danh mục...")} className="flex items-center gap-2.5 bg-primary text-white px-5 py-3 rounded-2xl text-[15px] shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all font-bold self-start">
             <Plus className="w-5 h-5"/> Thêm Phân loại
          </button>
       </div>

       <div className="bg-white dark:bg-card p-3 rounded-3xl border border-gray-100 dark:border-border mb-6">
         <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm kiếm tên Danh mục mẹ/con..." className="w-full bg-[#f4f5f7] dark:bg-black/20 focus:border-primary/50 transition-colors border-transparent border pl-12 pr-4 py-3.5 rounded-2xl text-[15.5px] outline-none font-medium" />
         </div>
       </div>

       <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-3xl overflow-hidden shadow-sm">
         <VirtualTable data={paginated} columns={columns} getRowKey={c=>c.id} rowHeight={68} maxHeight={600} />
       </div>
       <div className="mt-4">
          <Pagination page={page} total={filtered.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} itemLabel="Danh mục" />
       </div>
    </div>
  )
}

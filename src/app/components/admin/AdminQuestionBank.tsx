import { useState, useMemo } from "react";
import { VirtualTable, type VirtualTableColumn } from "./VirtualTable";
import { Search, Plus, Database, Folder, Edit, Trash2, ShieldCheck, Tag } from "lucide-react";
import { HighlightText } from "../ui/HighlightText";
import { useUrlPagination } from "../../utils/useUrlPagination";
import { Pagination } from "./Pagination";
import { toast } from "sonner";
import { Link } from "react-router"; // Use react-router Link to navigate to details

interface QuestionBank {
  id: string;
  name: string;
  module: string;
  questionCount: number;
  approvedCount: number;
  status: "active" | "draft";
}

const mockBanks: QuestionBank[] = Array.from({ length: 25 }).map((_, i) => ({
  id: `BANK-${100 + i}`,
  name: ["Bộ Đề Tin học MOS 2026", "Ngân hàng Ngoại ngữ A2", "Trắc nghiệm nghề Hàn Cơ Bản", "Hệ thống câu hỏi Pháp luật GDTX", "Đề kiểm tra Lập trình Web"][i%5],
  module: ["Tin học", "Ngoại Ngữ", "GD Nghề", "GDTX", "Tin học chuyên sâu"][i%5],
  questionCount: Math.floor(Math.random() * 500) + 100,
  approvedCount: Math.floor(Math.random() * 400) + 50,
  status: i % 4 === 0 ? "draft" : "active"
}));

export function AdminQuestionBank() {
  const [search, setSearch] = useState("");
  const { page, pageSize, setPage, setPageSize } = useUrlPagination();

  const filtered = useMemo(() => mockBanks.filter(b => b.name.toLowerCase().includes(search.toLowerCase())), [search]);
  const paginated = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize]);

  const columns: VirtualTableColumn<QuestionBank>[] = useMemo(() => [
     {
        key: "name", header: "Kho Ngân hàng Bộ Đề Gốc", width: "40%",
        render: (b) => (
           <div className="py-2">
              <Link to={`/admin/questions?bankId=${b.id}`} className="hover:underline flex items-center gap-2 mb-1">
                 <Database className="w-4 h-4 text-primary shrink-0"/>
                 <HighlightText text={b.name} query={search} className="text-[15.5px] font-bold text-[#1a1a2e] dark:text-foreground line-clamp-1" />
              </Link>
              <span className="inline-flex items-center gap-1 text-[12.5px] text-muted-foreground font-semibold bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded">
                 <Tag className="w-3 h-3"/> Nhóm: {b.module}
              </span>
           </div>
        )
     },
     {
        key: "stats", header: "Dung lượng (Số lượng câu hỏi)",
        render: (b) => (
           <div className="flex flex-col gap-1 w-max">
              <span className="text-[14px] font-bold text-[#1a1a2e] dark:text-gray-200">Tổng cộng: {b.questionCount} câu</span>
              <span className="text-[12px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5"/> Duyệt công bố: {b.approvedCount}</span>
           </div>
        )
     },
     {
        key: "status", header: "Trạng thái sử dụng",
        render: (b) => (
           <span className={`px-2.5 py-1 rounded-lg text-[13px] font-bold ${b.status === 'active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10'}`}>
              {b.status === 'active' ? 'Đang Mở sinh Đề' : 'Đang Đóng Biên Soạn'}
           </span>
        )
     },
     {
        key: "actions", header: "", width: "100px",
        render: (b) => (
           <div className="flex items-center gap-2">
              <Link to={`/admin/questions?bankId=${b.id}`} className="p-1.5 text-muted-foreground hover:bg-indigo-50 hover:text-indigo-600 rounded-lg"><Edit className="w-4 h-4"/></Link>
              <button className="p-1.5 text-muted-foreground hover:bg-rose-50 hover:text-rose-600 rounded-lg"><Trash2 className="w-4 h-4"/></button>
           </div>
        )
     }
  ], [search]);

  return (
    <div className="flex-1 pb-10">
       <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div>
             <h1 className="text-[26px] font-black text-[#1a1a2e] dark:text-foreground tracking-tight">Cấu trúc Ngân hàng Bộ Đề</h1>
             <p className="text-[15px] text-muted-foreground mt-1">Phân hệ Kho Quản lý các Bank dữ liệu câu hỏi trắc nghiệm độc lập.</p>
          </div>
          <button onClick={() => toast.success("Mở Form thêm Bộ Đề Gốc...")} className="flex items-center gap-2.5 bg-primary text-white px-5 py-3 rounded-2xl text-[15px] shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all font-bold self-start">
             <Plus className="w-5 h-5"/> Khởi tạo Bộ Đề Nhánh
          </button>
       </div>

       <div className="bg-white dark:bg-card p-3 rounded-3xl border border-gray-100 dark:border-border mb-6">
         <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm bộ đề gốc bằng tên hoặc nhóm môn học..." className="w-full bg-[#f4f5f7] dark:bg-black/20 focus:border-primary/50 transition-colors border-transparent border pl-12 pr-4 py-3.5 rounded-2xl text-[15.5px] outline-none font-medium" />
         </div>
       </div>

       <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-3xl overflow-hidden shadow-sm">
         <VirtualTable data={paginated} columns={columns} getRowKey={b=>b.id} rowHeight={80} maxHeight={600} />
       </div>
       <div className="mt-4">
          <Pagination page={page} total={filtered.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} itemLabel="Tập Kho đề" />
       </div>
    </div>
  )
}

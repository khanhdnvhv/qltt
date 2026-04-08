import { useState, useMemo } from "react";
import { VirtualTable, type VirtualTableColumn } from "./VirtualTable";
import { Search, Plus, FileSignature, Edit, Trash2, Clock, CalendarDays, KeySquare } from "lucide-react";
import { HighlightText } from "../ui/HighlightText";
import { useUrlPagination } from "../../utils/useUrlPagination";
import { Pagination } from "./Pagination";
import { toast } from "sonner";

interface TestPaper {
  id: string;
  name: string;
  program: string;
  duration: number; // minutes
  questionCount: number;
  status: "active" | "draft" | "archived";
}

const mockTests: TestPaper[] = Array.from({ length: 30 }).map((_, i) => ({
  id: `TEST-${200 + i}`,
  name: ["Khảo sát Lý thuyết Hàn công nghệ cao", "Đề test Toeic 600 - Reading & Listening", "Kiểm tra Giữa kỳ Phổ cập Lớp 10", "Bài test Tin học Văn phòng MOS Word", "Sát hạch Lái xe hạng B2 - Lý thuyết"][i%5],
  program: ["Nghề Cơ Khí", "Ngoại Ngữ", "GDTX - Lớp 10", "Tin Học", "Nghề Vận Tải"][i%5],
  duration: [45, 120, 60, 45, 90][i%5],
  questionCount: [30, 100, 40, 35, 50][i%5],
  status: i % 5 === 0 ? "draft" : i % 8 === 0 ? "archived" : "active"
}));

export function AdminTests() {
  const [search, setSearch] = useState("");
  const { page, pageSize, setPage, setPageSize } = useUrlPagination();

  const filtered = useMemo(() => mockTests.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.program.toLowerCase().includes(search.toLowerCase())), [search]);
  const paginated = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize]);

  const columns: VirtualTableColumn<TestPaper>[] = useMemo(() => [
     {
        key: "name", header: "Cấu trúc & Ma trận Đề kiểm tra", width: "40%",
        render: (t) => (
           <div className="py-2">
              <div className="flex items-center gap-2 mb-1">
                 <FileSignature className="w-4 h-4 text-indigo-500 shrink-0"/>
                 <HighlightText text={t.name} query={search} className="text-[15.5px] font-bold text-[#1a1a2e] dark:text-foreground line-clamp-1" />
              </div>
              <span className="inline-flex items-center gap-1 text-[12.5px] text-muted-foreground font-medium rounded">
                 Khung C.Trình: <strong className="text-primary">{t.program}</strong>
              </span>
           </div>
        )
     },
     {
        key: "config", header: "Thông số cấu hình",
        render: (t) => (
           <div className="flex flex-col gap-1 w-max">
              <span className="text-[13.5px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-blue-500"/> Thời gian làm bài: {t.duration} phút</span>
              <span className="text-[13.5px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"><KeySquare className="w-3.5 h-3.5 text-emerald-500"/> Số lượng câu trắc nghiệm: {t.questionCount}</span>
           </div>
        )
     },
     {
        key: "status", header: "Trạng thái Mã Đề",
        render: (t) => {
           if(t.status === 'active') return <span className="px-2.5 py-1 rounded-lg text-[13px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10">Sẵn sàng Áp dụng</span>;
           if(t.status === 'draft') return <span className="px-2.5 py-1 rounded-lg text-[13px] font-bold bg-gray-100 text-gray-600 dark:bg-white/10">Đang biên soạn/Nháp</span>;
           return <span className="px-2.5 py-1 rounded-lg text-[13px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-500/10">Đã khóa/Treo</span>;
        }
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
             <h1 className="text-[26px] font-black text-[#1a1a2e] dark:text-foreground tracking-tight">Cấu hình Đề bài & Bài kiểm tra</h1>
             <p className="text-[15px] text-muted-foreground mt-1">Lập ma trận đề thi tự động, tổ hợp đảo đáp án từ Ngân hàng câu hỏi gốc.</p>
          </div>
          <button onClick={() => toast.success("Mở Popup thiết lập Ma trận...")} className="flex items-center gap-2.5 bg-primary text-white px-5 py-3 rounded-2xl text-[15px] shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all font-bold self-start">
             <Plus className="w-5 h-5"/> Mix (Tạo) Đề Thi Mới
          </button>
       </div>

       <div className="bg-white dark:bg-card p-3 rounded-3xl border border-gray-100 dark:border-border mb-6">
         <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm tên đề, môn học hoặc chứng chỉ..." className="w-full bg-[#f4f5f7] dark:bg-black/20 focus:border-primary/50 transition-colors border-transparent border pl-12 pr-4 py-3.5 rounded-2xl text-[15.5px] outline-none font-medium" />
         </div>
       </div>

       <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-3xl overflow-hidden shadow-sm">
         <VirtualTable data={paginated} columns={columns} getRowKey={c=>c.id} rowHeight={80} maxHeight={600} />
       </div>
       <div className="mt-4">
          <Pagination page={page} total={filtered.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} itemLabel="Đề kiểm tra" />
       </div>
    </div>
  )
}

import { useMemo, useState } from "react";
import { VirtualTable, type VirtualTableColumn } from "./VirtualTable";
import { Search, ShieldAlert, Activity, Filter, Download, UserCheck, Shield, Eye, AlertCircle, Database, LogIn, Edit, FilePlus2, Trash2 } from "lucide-react";
import { HighlightText } from "../ui/HighlightText";
import { toast } from "sonner";
import { useUrlPagination } from "../../utils/useUrlPagination";
import { Pagination } from "./Pagination";

interface SystemLogEntry {
  id: string;
  timestamp: string;
  ip: string;
  user: string;
  role: string;
  action: "LOGIN" | "CREATE" | "UPDATE" | "DELETE" | "SYSTEM";
  module: string;
  description: string;
  level: "INFO" | "WARNING" | "CRITICAL";
}

const actionStyles = {
  LOGIN: { label: "Đăng nhập", color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10", icon: LogIn },
  CREATE: { label: "Tạo mới", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10", icon: FilePlus2 },
  UPDATE: { label: "Cập nhật", color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10", icon: Edit },
  DELETE: { label: "Xóa DL", color: "text-rose-600 bg-rose-50 dark:bg-rose-500/10", icon: Trash2 },
  SYSTEM: { label: "Hệ thống", color: "text-purple-600 bg-purple-50 dark:bg-purple-500/10", icon: Activity },
};

const mockLogs: SystemLogEntry[] = Array.from({ length: 65 }).map((_, i) => {
   const actions = ["LOGIN", "CREATE", "UPDATE", "DELETE", "SYSTEM"] as const;
   const levels = ["INFO", "INFO", "INFO", "WARNING", "CRITICAL"] as const;
   const act = actions[i % 5];
   return {
     id: `LOG-${Date.now() - i * 10000}`,
     timestamp: new Date(Date.now() - i * 15 * 60000).toLocaleString('vi-VN'),
     ip: `113.160.${i%255}.${(i*3)%255}`,
     user: i % 7 === 0 ? "huyen.nguyen@sogd" : i % 3 === 0 ? "admin.tin_hocc" : "gv.tranha",
     role: i % 7 === 0 ? "Sở GD&ĐT" : i % 3 === 0 ? "Quản lý TT" : "Giáo viên",
     action: act,
     module: ["Xác thực", "Kế hoạch", "Tài khoản", "Học phí", "Cấu hình"][i%5],
     description: act === "DELETE" ? "Đã xóa toàn bộ dữ liệu Điểm thi lớp THTA-26" : 
                  act === "UPDATE" ? "Sửa quyền truy cập thư mục QĐ-201" :
                  act === "LOGIN" ? "Đăng nhập thành công từ mạng nội bộ" : "Khởi tạo Phiếu xác nhận mới",
     level: act === "DELETE" ? "CRITICAL" : act === "SYSTEM" ? "WARNING" : "INFO"
   };
});

export function SystemLogs() {
  const [search, setSearch] = useState("");
  const { page, pageSize, setPage, setPageSize } = useUrlPagination();

  const filtered = useMemo(() => mockLogs.filter(d => 
    d.user.toLowerCase().includes(search.toLowerCase()) || 
    d.description.toLowerCase().includes(search.toLowerCase()) || 
    d.ip.includes(search)
  ), [search]);
  
  const paginated = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize]);

  const columns: VirtualTableColumn<SystemLogEntry>[] = useMemo(() => [
    {
       key: "time", header: "Thời gian & IP", width: "18%",
       render: (d) => (
         <div>
            <p className="text-[14px] font-bold text-[#1a1a2e] dark:text-foreground">{d.timestamp}</p>
            <p className="text-[13px] font-mono text-muted-foreground mt-0.5">{d.ip}</p>
         </div>
       )
    },
    {
       key: "user", header: "Tài khoản (Tác nhân)", width: "22%",
       render: (d) => (
         <div>
            <HighlightText text={d.user} query={search} className="text-[14.5px] font-bold text-primary block truncate" />
            <span className="inline-flex items-center gap-1 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded text-[11px] font-bold mt-1 uppercase">
              {d.role}
            </span>
         </div>
       )
    },
    {
       key: "action", header: "Thao tác", width: "18%",
       render: (d) => {
         const AC = actionStyles[d.action];
         return (
           <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[13px] font-bold ${AC.color}`}>
              <AC.icon className="w-3.5 h-3.5"/> {AC.label}
           </span>
         )
       }
    },
    {
       key: "desc", header: "Nội dung chi tiết (Truy vết)", width: "42%",
       render: (d) => (
         <div className="flex items-center justify-between group">
            <div>
               <p className="text-[13px] font-bold text-indigo-700/80 dark:text-indigo-400 mb-0.5">[{d.module}]</p>
               <HighlightText text={d.description} query={search} className={`text-[14px] font-medium leading-tight ${d.level === 'CRITICAL' ? 'text-rose-600 dark:text-rose-400' : 'text-[#1a1a2e] dark:text-gray-300'}`} />
            </div>
            <button className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-all">
               <Database className="w-4 h-4"/>
            </button>
         </div>
       )
    }
  ], [search]);

  return (
    <div className="flex-1 pb-10">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div>
           <h1 className="text-[26px] font-black text-[#1a1a2e] dark:text-foreground tracking-tight flex items-center gap-3">
              Nhật ký Hệ thống (Audit Log)
           </h1>
           <p className="text-[15px] text-muted-foreground mt-1">Giám sát mọi truy cập và biến động Dữ liệu toàn mạch GDNN-GDTX Sở GD&ĐT.</p>
        </div>
        <button onClick={() => toast.success("Đang kết xuất Log ra Excel...")} className="flex items-center gap-2.5 bg-white dark:bg-card border border-gray-200 dark:border-border text-foreground px-5 py-3 rounded-2xl text-[15px] shadow-sm hover:border-primary transition-all font-bold self-start">
           <Download className="w-5 h-5"/> Tải sao lưu Data
        </button>
      </div>

       <div className="bg-white dark:bg-card p-3 rounded-3xl border border-gray-100 dark:border-border mb-6 flex gap-3">
         <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm kiếm theo IP, Tên tài khoản, nội dung truy vết..." className="w-full bg-[#f4f5f7] dark:bg-black/20 focus:border-primary/50 transition-colors border-transparent border pl-12 pr-4 py-3.5 rounded-2xl text-[15.5px] outline-none font-medium" />
         </div>
         <select className="bg-[#f4f5f7] dark:bg-black/20 px-4 py-3.5 rounded-2xl text-[15px] font-semibold outline-none border border-transparent">
            <option>Tất cả Mức độ</option>
            <option>Thông báo (INFO)</option>
            <option>Cảnh báo (WARNING)</option>
            <option>Nghiêm trọng (CRITICAL)</option>
         </select>
      </div>

      <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-3xl overflow-hidden shadow-sm">
         <VirtualTable data={paginated} columns={columns} getRowKey={d=>d.id} rowHeight={85} maxHeight={650} />
      </div>
      <div className="mt-4">
         <Pagination page={page} total={filtered.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} itemLabel="Bản ghi" />
      </div>
    </div>
  )
}

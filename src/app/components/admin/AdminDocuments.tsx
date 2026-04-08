import { useState } from "react";
import { useDocumentTitle } from "../../utils/hooks";
import { useOutletContext } from "react-router";
import {
  Search, FileText, CheckCircle, ShieldAlert, Plus, Download, Edit, Trash2, Eye, Send,
  FolderOpen, Folder, File, FileBadge, ChevronRight, CheckSquare, Clock, Filter, MoreVertical
} from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";
import { ConfirmModal } from "./ConfirmModal";

type DocStatus = "draft" | "published";
interface MockDoc {
  id: string;
  no: string;
  title: string;
  type: string;
  date: string;
  status: DocStatus;
  signed: boolean;
  color: string;
}

const initialDocs: MockDoc[] = [
  { id: "1", no: "524/SGDĐT-GDTX", title: "V/v Hướng dẫn thực hiện nhiệm vụ năm học 2025-2026", type: "Công văn", date: "24/08/2026", status: "published", signed: true, color: "bg-blue-500" },
  { id: "2", no: "182/QĐ-SGDĐT", title: "Quyết định đình chỉ hoạt động Trung tâm Ngoại ngữ AMES", type: "Quyết định", date: "15/07/2026", status: "published", signed: true, color: "bg-red-500" },
  { id: "3", no: "201/TB-SGDĐT", title: "Thông báo lịch tập huấn quản lý hồ sơ GDTX", type: "Thông báo", date: "05/06/2026", status: "published", signed: true, color: "bg-amber-500" },
  { id: "4", no: "[Chưa cấp số]", title: "Dự thảo Quy định thi cấp chứng chỉ ứng dụng CNTT", type: "Dự thảo", date: "10/05/2026", status: "draft", signed: false, color: "bg-gray-400" },
  { id: "5", no: "55/KH-SGDĐT", title: "Kế hoạch kiểm tra định kỳ các trung tâm năm 2026", type: "Kế hoạch", date: "01/04/2026", status: "published", signed: true, color: "bg-emerald-500" },
];

const categories = [
  { id: "all", name: "Tất cả văn bản", icon: FolderOpen, count: 56 },
  { id: "congvan", name: "Công văn", icon: FileText, count: 24 },
  { id: "quyetdinh", name: "Quyết định", icon: FileBadge, count: 12 },
  { id: "thongbao", name: "Thông báo", icon: File, count: 15 },
  { id: "duthao", name: "Dự thảo chờ duyệt", icon: Clock, count: 5 },
];

export function AdminDocuments() {
  useDocumentTitle("Hồ sơ & Văn bản chỉ đạo");
  const { adminRole } = useOutletContext<{ adminRole: "department" | "center" }>();
  const isDepartment = adminRole === "department";

  const [docs, setDocs] = useState<MockDoc[]>(initialDocs);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [newDocOpen, setNewDocOpen] = useState(false);
  const [signModal, setSignModal] = useState<string | null>(null);

  const filteredDocs = docs.filter(c => {
    const sMatch = c.title.toLowerCase().includes(search.toLowerCase()) || c.no.toLowerCase().includes(search.toLowerCase());
    
    let cMatch = true;
    if (activeCategory === "congvan") cMatch = c.type === "Công văn";
    if (activeCategory === "quyetdinh") cMatch = c.type === "Quyết định";
    if (activeCategory === "thongbao") cMatch = c.type === "Thông báo";
    if (activeCategory === "duthao") cMatch = c.status === "draft";

    if (!isDepartment && c.status === "draft") return false;

    return sMatch && cMatch;
  });

  return (
    <div className="h-[calc(100vh-100px)] lg:h-[calc(100vh-140px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-[24px] lg:text-[28px] text-[#1a1a2e] dark:text-foreground tracking-tight" style={{ fontWeight: 800 }}>
            Quản lý Kho Văn bản
          </h1>
          <p className="text-muted-foreground text-[15px] mt-1">
            Tra cứu, ban hành và lưu trữ điện tử hồ sơ chỉ đạo GDNN-GDTX
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isDepartment && (
            <button onClick={() => setNewDocOpen(true)} className="group flex items-center gap-2 bg-[#1a1a2e] hover:bg-[#2d2d4a] text-white px-5 py-2.5 rounded-xl text-[15px] shadow-[0_4px_14px_0_rgba(26,26,46,0.2)] hover:shadow-[0_6px_20px_rgba(26,26,46,0.3)] transition-all font-semibold">
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              Soạn Văn Bản
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Sidebar Categories */}
        <div className="hidden lg:flex w-64 flex-col gap-1 shrink-0 bg-white/60 dark:bg-card/60 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-border p-4 shadow-sm">
           <h3 className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2">Danh mục lưu trữ</h3>
           {categories.map((cat) => {
             const isActive = activeCategory === cat.id;
             return (
               <button
                 key={cat.id}
                 onClick={() => setActiveCategory(cat.id)}
                 className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                   isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-gray-100 hover:text-foreground dark:hover:bg-white/5"
                 }`}
               >
                 <div className="flex items-center gap-3">
                   <cat.icon className={`w-4.5 h-4.5 ${isActive ? "text-primary" : ""}`} />
                   <span className="text-[14px]" style={{ fontWeight: isActive ? 600 : 500 }}>{cat.name}</span>
                 </div>
                 {cat.count > 0 && (
                   <span className={`text-[12px] font-semibold px-2 py-0.5 rounded-full ${isActive ? "bg-primary/20 text-primary" : "bg-gray-200 dark:bg-white/10 text-muted-foreground"}`}>
                     {cat.id === "all" ? docs.length : cat.count}
                   </span>
                 )}
               </button>
             )
           })}

           <div className="mt-auto pt-4 border-t border-gray-200 dark:border-border px-2">
             <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/30 text-center">
                 <ShieldAlert className="w-8 h-8 mx-auto text-indigo-500 mb-2" />
                 <p className="text-[13px] font-semibold text-indigo-900 dark:text-indigo-200 mb-1">Bảo mật CA</p>
                 <p className="text-[11px] text-indigo-600/80 dark:text-indigo-300/80 leading-relaxed">Hệ thống áp dụng chữ ký điện tử tiêu chuẩn quốc gia.</p>
             </div>
           </div>
        </div>

        {/* Main Document Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white/60 dark:bg-card/60 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-border shadow-sm p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 group">
              <Search className="w-4.5 h-4.5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Tìm kiếm theo số hiệu, tên, phân loại..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-muted border border-gray-200 dark:border-transparent focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-2xl text-[15px] outline-none transition-all shadow-sm"
              />
            </div>
            <button className="p-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm">
               <Filter className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* List of Documents */}
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
             <AnimatePresence>
               {filteredDocs.map((doc, i) => (
                 <motion.div
                   key={doc.id}
                   initial={{ opacity: 0, y: 15 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   transition={{ duration: 0.2, delay: Math.min(i * 0.05, 0.3) }}
                 >
                   <div className="group bg-white dark:bg-muted border border-gray-100 dark:border-border/50 hover:border-gray-300 dark:hover:border-border rounded-2xl p-4 transition-all hover:shadow-md hover:shadow-black/5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                      
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${doc.status === 'draft' ? 'bg-gray-100' : 'bg-primary/5'}`}>
                         <FileText className={`w-6 h-6 ${doc.status === 'draft' ? 'text-gray-400' : 'text-primary'}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                         <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[13px] font-bold text-foreground bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-md">
                              {doc.no}
                            </span>
                            <span className="text-[13px] font-medium text-muted-foreground">•</span>
                            <span className="text-[13px] font-medium text-muted-foreground">{doc.date}</span>
                         </div>
                         <h3 className="text-[16px] font-bold text-[#1a1a2e] dark:text-foreground line-clamp-1 group-hover:text-primary transition-colors cursor-pointer">
                            {doc.title}
                         </h3>
                         <div className="flex items-center gap-2 mt-2">
                            <span className="text-[12px] font-medium px-2 py-0.5 rounded-full border border-gray-200 text-gray-600">
                               {doc.type}
                            </span>
                            {doc.signed ? (
                              <span className="flex items-center gap-1.5 text-[12px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle className="w-3.5 h-3.5" /> Ký số Giám đốc Sở
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                                <Clock className="w-3.5 h-3.5" /> Chờ phê duyệt điện tử
                              </span>
                            )}
                         </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 justify-end">
                         {isDepartment && !doc.signed && (
                           <button onClick={() => setSignModal(doc.id)} className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-2 rounded-xl text-[14px] font-bold transition-colors">
                              <ShieldAlert className="w-4 h-4" /> Duyệt & Ký
                           </button>
                         )}
                         <button onClick={() => toast.success("Đang mở tài liệu...")} className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors">
                            <Eye className="w-5 h-5" />
                         </button>
                         <button onClick={() => toast.success("Đang tải file xuống...")} className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors border border-transparent hover:border-blue-200">
                            <Download className="w-5 h-5" />
                         </button>
                         {isDepartment && (
                            <div className="relative">
                              <button onClick={() => setActionMenu(actionMenu === doc.id ? null : doc.id)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
                                 <MoreVertical className="w-5 h-5" />
                              </button>
                              <AnimatePresence>
                                {actionMenu === doc.id && (
                                  <>
                                    <div className="fixed inset-0 z-30" onClick={() => setActionMenu(null)} />
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                      className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-card rounded-xl shadow-xl border border-gray-100 dark:border-border py-1.5 z-40"
                                    >
                                      <button onClick={() => { setActionMenu(null); toast.error("Đã báo cáo xóa"); setDocs(docs.filter(d=>d.id !== doc.id)) }} className="w-full flex items-center gap-2.5 px-4 py-2 text-[14px] hover:bg-red-50 text-red-600 font-semibold transition-colors">
                                        <Trash2 className="w-4 h-4" /> Xóa bản ghi
                                      </button>
                                    </motion.div>
                                  </>
                                )}
                              </AnimatePresence>
                            </div>
                         )}
                      </div>
                   </div>
                 </motion.div>
               ))}
               {filteredDocs.length === 0 && (
                 <div className="text-center py-20">
                    <FolderOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-[16px] font-semibold text-gray-500">Không tìm thấy tài liệu phù hợp</p>
                 </div>
               )}
             </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {newDocOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setNewDocOpen(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white dark:bg-card w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col">
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-[20px] font-extrabold text-[#1a1a2e]">📦 Khởi tạo Văn bản</h3>
              </div>
              <div className="p-6 space-y-5 flex-1 overflow-y-auto">
                 <div>
                   <label className="text-[14px] font-bold text-foreground block mb-2">Loại hình / Danh mục</label>
                   <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-medium focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all">
                     <option>Công văn Chỉ đạo</option>
                     <option>Quyết định Hành chính</option>
                     <option>Thông báo Điều hành</option>
                   </select>
                 </div>
                 <div>
                   <label className="text-[14px] font-bold text-foreground block mb-2">Trích yếu nội dung</label>
                   <textarea rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none resize-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-medium" placeholder="Nhập trích yếu ngắn gọn..." />
                 </div>
                 <div>
                   <label className="text-[14px] font-bold text-foreground block mb-2">Đính kèm bản mộc (PDF/DOCX)</label>
                   <div className="border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 rounded-2xl p-8 text-center cursor-pointer transition-colors group">
                      <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                         <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <p className="text-[15px] font-bold text-primary mb-1">Upload hoặc Kéo thả File</p>
                      <p className="text-[13px] text-muted-foreground font-medium">Hỗ trợ PDF tối đa 10MB</p>
                   </div>
                 </div>
              </div>
              <div className="px-6 py-5 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                 <button onClick={() => setNewDocOpen(false)} className="px-5 py-2.5 font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-xl transition-colors">Hủy thao tác</button>
                 <button onClick={() => {
                   setDocs([{
                     id: Date.now().toString(),
                     no: "[Dự thảo " + Date.now().toString().slice(-4) + "]",
                     title: "Dự thảo nội quy vận hành nâng cấp hệ thống",
                     type: "Thông báo",
                     date: new Date().toLocaleDateString("vi-VN"),
                     status: "draft",
                     signed: false,
                     color: "bg-blue-500"
                   }, ...docs]);
                   setNewDocOpen(false);
                   toast.success("Đã ghi nhận lên hệ thống chờ duyệt!");
                 }} className="px-6 py-2.5 bg-[#1a1a2e] text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(26,26,46,0.3)] hover:shadow-[0_6px_20px_rgba(26,26,46,0.4)] transition-all">Lưu vào Kho Nháp</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        open={!!signModal}
        title="Ký Số Phê Duyệt Hành Chính & Chứng Thực"
        description="Bạn đang sử dụng ủy quyền Giám đốc Sở để áp dụng Chữ ký Số. Hệ thống sẽ sinh mã Hash đóng dấu Server Timestamp và công bố lập tức đến 112 Trung tâm trực thuộc. Xin xác nhận?"
        confirmLabel="Ký CA & Ban hành"
        cancelLabel="Từ chối"
        loading={false}
        variant="default"
        onConfirm={() => {
          setDocs(docs.map(d => d.id === signModal ? { ...d, status: "published", signed: true, no: `989/SGDĐT-GDTX` } : d));
          setSignModal(null);
          toast.success("✅ Đóng dấu ký số Server thành công! Văn bản đã được Push Push Notifications.");
        }}
        onClose={() => setSignModal(null)}
      />
    </div>
  );
}

import { useState } from "react";
import { Search, UploadCloud, FileText, Video, LayoutGrid, List, FileArchive, Folder, MoreVertical, Plus } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

interface LectureFile {
  id: string;
  name: string;
  type: "pdf" | "video" | "scorm";
  size: string;
  uploadedAt: string;
  module: string;
}

const mockFiles: LectureFile[] = Array.from({ length: 18 }).map((_, i) => {
   const types = ["pdf", "video", "scorm"] as const;
   const type = types[i % 3];
   return {
      id: `LEC-${i}`,
      name: type === "pdf" ? `Tai_lieu_C++_Co_ban_Chuong_${i}.pdf` : type === "video" ? `Bai_giang_C#_Nang_cao_P${i}.mp4` : `Giao_trinh_E_learning_SCORM_${i}.zip`,
      type,
      size: type === "pdf" ? "2.4 MB" : type === "video" ? "345 MB" : "50 MB",
      uploadedAt: "12/05/2026",
      module: "Khoa CNTT - Lập trình"
   }
});

export function AdminLectures() {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filtered = mockFiles.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex-1 pb-10">
       <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div>
             <h1 className="text-[26px] font-black text-[#1a1a2e] dark:text-foreground tracking-tight">Kho Học liệu & Bài giảng số</h1>
             <p className="text-[15px] text-muted-foreground mt-1">Lưu trữ tập trung tài liệu PDF, Video MP4 và bài giảng chuẩn E-learning (SCORM).</p>
          </div>
          <button onClick={() => toast.success("Đang mở Form Upload Data...")} className="flex items-center gap-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-2xl text-[15px] shadow-lg shadow-blue-500/30 hover:scale-[1.02] transition-all font-bold self-start">
             <UploadCloud className="w-5 h-5"/> Tải lên Học Liệu Mới
          </button>
       </div>

       {/* Toolbar */}
       <div className="flex items-center justify-between bg-white dark:bg-card p-3 rounded-3xl border border-gray-100 dark:border-border mb-6 shadow-sm">
          <div className="flex items-center gap-2">
             <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 rounded-xl text-[14px] font-bold text-[#1a1a2e] dark:text-gray-200">
               <Folder className="w-4 h-4 text-amber-500 fill-amber-500" /> Ngoại Ngữ
             </button>
             <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 rounded-xl text-[14px] font-bold text-[#1a1a2e] dark:text-gray-200">
               <Folder className="w-4 h-4 text-amber-500 fill-amber-500" /> Tin học ứng dụng
             </button>
             <button className="p-2 text-muted-foreground hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
               <Plus className="w-4 h-4" />
             </button>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm file học liệu..." className="w-full bg-[#f4f5f7] dark:bg-black/20 focus:border-primary/50 transition-colors border-transparent border pl-9 pr-4 py-2 rounded-xl text-[14px] outline-none font-medium" />
             </div>
             <div className="flex items-center bg-gray-100 dark:bg-black/20 rounded-xl p-1">
                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg ${viewMode==='grid' ? 'bg-white shadow-sm dark:bg-gray-700 text-[#1a1a2e] dark:text-white' : 'text-muted-foreground hover:text-foreground'}`}><LayoutGrid className="w-4 h-4"/></button>
                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg ${viewMode==='list' ? 'bg-white shadow-sm dark:bg-gray-700 text-[#1a1a2e] dark:text-white' : 'text-muted-foreground hover:text-foreground'}`}><List className="w-4 h-4"/></button>
             </div>
          </div>
       </div>

       {/* Grid Area */}
       <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1'}`}>
          <AnimatePresence>
             {filtered.map((file, i) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: viewMode==='grid'? i * 0.02 : 0 }}
                  key={file.id} 
                  className={`group bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-4 hover:shadow-xl hover:border-primary/30 transition-all cursor-pointer relative ${viewMode === 'list' && 'flex items-center justify-between'}`}
                >
                   <div className={`${viewMode === 'grid' ? 'mb-4 flex justify-center py-6 bg-gray-50 dark:bg-black/20 rounded-xl group-hover:bg-primary/5 transition-colors' : 'flex items-center gap-4'}`}>
                      {file.type === "pdf" && <FileText className={`text-rose-500 fill-rose-100 dark:fill-rose-900/50 ${viewMode==='grid'? 'w-16 h-16':'w-8 h-8'}`} strokeWidth={1} />}
                      {file.type === "video" && <Video className={`text-blue-500 fill-blue-100 dark:fill-blue-900/50 ${viewMode==='grid'? 'w-16 h-16':'w-8 h-8'}`} strokeWidth={1} />}
                      {file.type === "scorm" && <FileArchive className={`text-amber-500 fill-amber-100 dark:fill-amber-900/50 ${viewMode==='grid'? 'w-16 h-16':'w-8 h-8'}`} strokeWidth={1} />}
                      
                      {viewMode === 'list' && (
                         <div>
                            <p className="text-[14.5px] font-bold text-[#1a1a2e] dark:text-foreground max-w-md truncate">{file.name}</p>
                            <p className="text-[12.5px] text-muted-foreground">{file.module} • {file.size}</p>
                         </div>
                      )}
                   </div>

                   {viewMode === 'grid' && (
                      <div className="text-center">
                         <p className="text-[13.5px] font-bold text-[#1a1a2e] dark:text-foreground line-clamp-2 leading-tight mb-1">{file.name}</p>
                         <p className="text-[12px] text-muted-foreground font-medium">{file.size} • {file.uploadedAt}</p>
                      </div>
                   )}
                   
                   <button className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 bg-white/80 dark:bg-black/50 backdrop-blur-sm rounded-lg hover:bg-gray-100 transition-all">
                      <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                   </button>
                </motion.div>
             ))}
          </AnimatePresence>
       </div>
    </div>
  )
}

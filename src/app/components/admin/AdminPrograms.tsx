import { useState, useMemo } from "react";
import { useDocumentTitle } from "../../utils/hooks";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { 
  Layers, Search, Plus, Target, DollarSign, Clock, ChevronRight, 
  X, Briefcase, Languages, GraduationCap, CheckCircle, Save, 
  Edit, Trash2, ListTree, BookOpen, PenTool, LayoutGrid, BarChart3, AlertCircle 
} from "lucide-react";

type ProgramType = "gdtx" | "vocational" | "language";

interface Module {
  id: string;
  name: string;
  type: "theory" | "practice" | "integrated";
  hours: number;
  skills: string[];
}

interface Program {
  id: string;
  name: string;
  type: ProgramType;
  duration: string;
  credits: number;
  outcomes: string[];
  maxTuition: number;
  status: "active" | "draft";
  modules: Module[];
}

const mockPrograms: Program[] = [
  {
    id: "prg1",
    name: "Tiếng Anh Giao tiếp B1 (VSTEP)",
    type: "language",
    duration: "3 Tháng",
    credits: 15,
    outcomes: ["Đạt chứng chỉ B1 VSTEP", "Giao tiếp cơ bản nơi công sở", "Viết email chuyên nghiệp"],
    maxTuition: 4500000,
    status: "active",
    modules: [
      { id: "m1", name: "Ngữ pháp Ứng dụng", type: "theory", hours: 20, skills: ["Thì hiện tại", "Cấu trúc câu phức"] },
      { id: "m2", name: "Luyện Nghe & Đọc", type: "integrated", hours: 30, skills: ["Đọc hiểu văn bản", "Nghe hội thoại"] },
      { id: "m3", name: "Thực hành Nói", type: "practice", hours: 40, skills: ["Phát âm IPA", "Thuyết trình ngắn"] }
    ]
  },
  {
    id: "prg2",
    name: "Sơ cấp nghề Kỹ thuật Chế biến món ăn",
    type: "vocational",
    duration: "6 Tháng",
    credits: 30,
    outcomes: ["Thành thạo Dao chảo", "Thiết kế Thực đơn Á/Âu", "Đảm bảo Vệ sinh ATTP"],
    maxTuition: 12000000,
    status: "active",
    modules: [
      { id: "m1", name: "Lý thuyết Ẩm thực & Dinh dưỡng", type: "theory", hours: 45, skills: ["Tính toán Calo", "Hiểu đặc tính nguyên liệu"] },
      { id: "m2", name: "Kỹ năng Cắt tỉa & Bếp Á", type: "practice", hours: 100, skills: ["Cắt hạt lựu", "Xóc chảo", "Lên men món ăn"] },
      { id: "m3", name: "Kỹ thuật Bếp Âu căn bản", type: "practice", hours: 80, skills: ["Làm nước sốt", "Áp chảo Steak"] }
    ]
  },
  {
    id: "prg3",
    name: "Giáo dục Thường xuyên cấp THPT (Lớp 10)",
    type: "gdtx",
    duration: "9 Tháng",
    credits: 45,
    outcomes: ["Hoàn thành chương trình lớp 10", "Chuẩn bị thi Tốt nghiệp THPT"],
    maxTuition: 3000000,
    status: "draft",
    modules: [
      { id: "m1", name: "Toán học", type: "integrated", hours: 105, skills: ["Đại số", "Hình học không gian"] },
      { id: "m2", name: "Ngữ Văn", type: "theory", hours: 105, skills: ["Phân tích văn học", "Nghị luận xã hội"] },
      { id: "m3", name: "Lịch sử & Địa lý", type: "theory", hours: 70, skills: ["Nhận biết sự kiện", "Đọc bản đồ khoáng sản"] }
    ]
  }
];

const typeConfig: Record<ProgramType, { icon: any; label: string; color: string; bg: string }> = {
  gdtx: { icon: GraduationCap, label: "GDTX Văn hóa", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10" },
  vocational: { icon: Briefcase, label: "Đào tạo Nghề", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-500/10" },
  language: { icon: Languages, label: "Ngoại ngữ - Tin học", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10" }
};

export function AdminPrograms() {
  useDocumentTitle("Quản lý Chương trình Cốt lõi");
  
  const [programs, setPrograms] = useState(mockPrograms);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<ProgramType | "all">("all");
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  const filtered = useMemo(() => programs.filter(p => {
    const matchType = filterType === "all" || p.type === filterType;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  }), [programs, search, filterType]);

  const BuilderModal = ({ program, onClose }: { program: Program, onClose: () => void }) => {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col bg-[#f4f5f7] dark:bg-background">
        {/* Header Modal */}
        <div className="h-16 bg-white dark:bg-[#12121a] border-b border-gray-100 dark:border-white/5 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
           <div className="flex items-center gap-4">
              <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"><X className="w-5 h-5"/></button>
              <div>
                <h2 className="text-[16px] font-black">{program.name}</h2>
                <span className={`text-[12px] font-bold ${typeConfig[program.type].color}`}>{typeConfig[program.type].label}</span>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <span className={`px-3 py-1 text-[12px] font-bold rounded-full border ${program.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20' : 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-white/5 dark:border-white/10 dark:text-gray-400'}`}>
                {program.status === "active" ? "Đang áp dụng" : "Bản nháp"}
              </span>
              <button className="px-5 py-2 bg-[#1a1a2e] text-white dark:bg-white dark:text-[#1a1a2e] font-bold rounded-lg hover:opacity-90 flex items-center gap-2 text-[14px]">
                 <Save className="w-4 h-4" /> Lưu Tùy Chỉnh
              </button>
           </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8 flex justify-center">
           <div className="w-full max-w-5xl space-y-6">
              
              {/* General Config */}
              <div className="bg-white dark:bg-card p-8 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-white/5">
                   <Target className="w-6 h-6 text-primary" />
                   <h3 className="text-[18px] font-black">Thiết lập Thông số Chung</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                   <div>
                     <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Thời lượng Tổng</label>
                     <div className="flex items-center bg-gray-50 dark:bg-white/5 rounded-xl px-4 py-3 border border-gray-100 dark:border-white/5">
                        <Clock className="w-5 h-5 text-muted-foreground mr-3" />
                        <input className="bg-transparent border-none outline-none font-bold text-[16px] w-full" defaultValue={program.duration} />
                     </div>
                   </div>
                   <div>
                     <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Tổng Tín chỉ</label>
                     <div className="flex items-center bg-gray-50 dark:bg-white/5 rounded-xl px-4 py-3 border border-gray-100 dark:border-white/5">
                        <BookOpen className="w-5 h-5 text-muted-foreground mr-3" />
                        <input type="number" className="bg-transparent border-none outline-none font-bold text-[16px] w-full text-blue-600" defaultValue={program.credits} />
                     </div>
                   </div>
                   <div>
                     <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Học phí trần (Max)</label>
                     <div className="flex items-center bg-gray-50 dark:bg-white/5 rounded-xl px-4 py-3 border border-gray-100 dark:border-white/5">
                        <DollarSign className="w-5 h-5 text-amber-500 mr-3" />
                        <input type="number" className="bg-transparent border-none outline-none font-black text-[16px] w-full text-amber-600" defaultValue={program.maxTuition} />
                     </div>
                   </div>
                </div>

                <div>
                   <label className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider mb-3 block">Chuẩn Đầu Ra Kế Hoạch (Learning Outcomes)</label>
                   <div className="space-y-3">
                      {program.outcomes.map((o, idx) => (
                        <div key={idx} className="flex gap-3 items-center group">
                          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                          <input className="flex-1 bg-gray-50 dark:bg-white/5 px-4 py-3 rounded-xl border border-transparent focus:border-emerald-500/50 outline-none font-medium text-[15px] transition-colors" defaultValue={o} />
                          <button className="p-2 text-muted-foreground hover:bg-red-50 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                             <Trash2 className="w-4 h-4"/>
                          </button>
                        </div>
                      ))}
                      <button className="flex items-center gap-2 text-primary font-bold text-[14px] mt-2 py-2 px-3 hover:bg-primary/5 rounded-lg transition-colors">
                        <Plus className="w-4 h-4" /> Thêm chuẩn đầu ra
                      </button>
                   </div>
                </div>
              </div>

              {/* Module Tree Builder */}
              <div className="bg-white dark:bg-card rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/[0.02]">
                   <div className="flex items-center gap-3">
                     <ListTree className="w-6 h-6 text-accent" />
                     <h3 className="text-[18px] font-black">Cây Giảng dạy (Mô-đun & Kỹ năng)</h3>
                   </div>
                   <button onClick={() => toast.success("Đang tạo Mô đun mới...")} className="flex items-center gap-2 bg-white dark:bg-[#12121a] border border-gray-200 dark:border-white/10 px-4 py-2 rounded-xl text-[14px] font-bold shadow-sm hover:shadow-md transition-all">
                     <Plus className="w-4 h-4" /> Thêm Mô-đun (Học phần)
                   </button>
                </div>
                
                <div className="p-8 space-y-6">
                  {program.modules.map((m, i) => (
                    <div key={m.id} className="border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden group hover:border-gray-300 dark:hover:border-white/20 transition-all shadow-sm">
                      <div className="bg-gray-50 dark:bg-white/5 px-6 py-4 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                           <div className="w-8 h-8 bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-lg flex items-center justify-center font-black text-muted-foreground">{i+1}</div>
                           <div>
                             <h4 className="text-[16px] font-black">{m.name}</h4>
                             <p className="text-[13px] text-muted-foreground font-medium mt-0.5">Thời lượng: <span className="text-foreground font-bold">{m.hours} giờ</span></p>
                           </div>
                         </div>
                         <div className="flex items-center gap-3">
                           <span className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider border ${
                             m.type === 'theory' ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20' :
                             m.type === 'practice' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20' :
                             'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-500/10 dark:border-purple-500/20'
                           }`}>
                             {m.type === 'theory' ? 'Lý T.Huấn' : m.type === 'practice' ? 'Thực hành' : 'Tích hợp'}
                           </span>
                           <button className="p-2 text-muted-foreground hover:text-primary transition-colors"><Edit className="w-4 h-4"/></button>
                         </div>
                      </div>
                      <div className="px-6 py-4 bg-white dark:bg-card">
                         <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Các Kỹ năng đạt được</p>
                         <div className="flex flex-wrap gap-2">
                           {m.skills.map(s => (
                             <span key={s} className="px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg text-[13.5px] font-medium flex items-center gap-1.5">
                               <PenTool className="w-3.5 h-3.5 text-accent"/> {s}
                             </span>
                           ))}
                           <button className="px-3 py-1.5 border border-dashed border-gray-300 dark:border-white/20 rounded-lg text-[13.5px] font-medium text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center gap-1.5">
                             <Plus className="w-3.5 h-3.5" /> Thêm KN
                           </button>
                         </div>
                      </div>
                    </div>
                  ))}
                  
                  {program.modules.length === 0 && (
                    <div className="text-center py-10 bg-gray-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                       <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                       <p className="text-[15px] font-bold text-muted-foreground">Chưa có Học phần / Mô-đun nào được khai báo.</p>
                    </div>
                  )}
                </div>
              </div>

           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col pt-2 pb-10">
      
      <div className="relative mb-8 p-8 rounded-[2rem] overflow-hidden bg-gradient-to-br from-blue-900 to-[#1a1a2e] text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-accent opacity-30 rounded-full blur-[100px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-4 text-[13px] font-semibold tracking-wide">
               <Layers className="w-4 h-4 text-blue-300" />
               <span className="text-blue-50">Hệ thống Quản lý Khung Chương Trình & Học vụ</span>
            </div>
            <h1 className="text-[32px] md:text-[40px] font-black tracking-tight leading-tight mb-2">
               Biên soạn Chương Trình Tích hợp
            </h1>
            <p className="text-white/70 text-[16px] max-w-xl font-medium">
               Xây dựng, chuẩn hóa chuẩn đầu ra, thời lượng, số lượng tín chỉ và mức thu học phí cho toàn bộ hệ đào tạo.
            </p>
          </div>
          
          <button onClick={() => toast.info("Đang tạo Template mới...")} className="flex items-center justify-center gap-2.5 bg-blue-600 text-white px-6 py-3.5 rounded-2xl text-[15px] font-bold shadow-[0_8px_30px_rgba(37,99,235,0.4)] hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all duration-300">
             <Plus className="w-5 h-5" />
             Tạo Khung Đào tạo
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
         <div className="relative flex-1 group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
            <div className="relative flex items-center bg-white/80 dark:bg-card/80 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-2xl px-5 py-1 shadow-sm">
                <Search className="w-5 h-5 text-muted-foreground mr-3" />
                <input 
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Tìm kiếm Chương trình, Chứng chỉ..."
                  className="flex-1 bg-transparent border-none outline-none py-3 text-[15px] font-medium text-foreground placeholder:text-muted-foreground/60"
                />
            </div>
         </div>
         <div className="flex gap-2 p-1.5 bg-white/80 dark:bg-card/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-white/10 shadow-sm overflow-x-auto min-w-0 md:min-w-fit">
            <button onClick={() => setFilterType("all")} className={`px-4 py-2 rounded-xl text-[14px] font-bold whitespace-nowrap transition-all ${filterType === 'all' ? 'bg-[#1a1a2e] text-white dark:bg-white dark:text-[#1a1a2e]' : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-white/5'}`}>Tất cả</button>
            <button onClick={() => setFilterType("vocational")} className={`px-4 py-2 rounded-xl text-[14px] font-bold whitespace-nowrap transition-all ${filterType === 'vocational' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20' : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-white/5'}`}>Sơ cấp & Nghề</button>
            <button onClick={() => setFilterType("language")} className={`px-4 py-2 rounded-xl text-[14px] font-bold whitespace-nowrap transition-all ${filterType === 'language' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20' : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-white/5'}`}>Ngoại ngữ - Tin học</button>
            <button onClick={() => setFilterType("gdtx")} className={`px-4 py-2 rounded-xl text-[14px] font-bold whitespace-nowrap transition-all ${filterType === 'gdtx' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20' : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-white/5'}`}>GDTX Văn hóa</button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {filtered.map(program => {
           const PIcon = typeConfig[program.type].icon;
           return (
             <motion.div key={program.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-card rounded-[2rem] border border-gray-100 dark:border-white/5 p-6 hover:shadow-xl transition-all shadow-sm flex flex-col group cursor-pointer" onClick={() => setSelectedProgram(program)}>
                <div className="flex items-start justify-between mb-4">
                   <div className={`w-14 h-14 rounded-2xl ${typeConfig[program.type].bg} ${typeConfig[program.type].color} flex items-center justify-center`}>
                      <PIcon className="w-7 h-7" />
                   </div>
                   <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${program.status === 'active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-gray-100 text-gray-500 dark:bg-white/5'}`}>
                      {program.status === 'active' ? 'Ban hành' : 'Bản nháp'}
                   </span>
                </div>
                
                <h3 className="text-[18px] font-black leading-tight mb-2 text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">{program.name}</h3>
                
                <p className="text-[14px] text-muted-foreground font-medium mb-6 line-clamp-2">
                   Chuẩn đầu ra: {program.outcomes.join(', ')}
                </p>

                <div className="grid grid-cols-2 gap-3 mt-auto">
                   <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                      <div className="flex items-center gap-1.5 text-muted-foreground mb-1"><LayoutGrid className="w-3.5 h-3.5"/><span className="text-[11px] font-bold uppercase">Mô-đun</span></div>
                      <span className="text-[16px] font-black text-foreground">{program.modules.length} <span className="text-[13px] text-muted-foreground font-medium">chuyên đề</span></span>
                   </div>
                   <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                      <div className="flex items-center gap-1.5 text-muted-foreground mb-1"><BookOpen className="w-3.5 h-3.5"/><span className="text-[11px] font-bold uppercase">Tín chỉ</span></div>
                      <span className="text-[16px] font-black text-foreground">{program.credits} <span className="text-[13px] text-muted-foreground font-medium">TC</span></span>
                   </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
                   <span className="text-[14px] font-bold text-amber-600 dark:text-amber-500">{program.maxTuition.toLocaleString()}đ <span className="text-muted-foreground text-[12px] font-normal">/khóa</span></span>
                   <button className="flex items-center text-blue-600 dark:text-blue-400 text-[14px] font-bold opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                     Soạn thảo <ChevronRight className="w-4 h-4 ml-1" />
                   </button>
                </div>
             </motion.div>
           )
         })}
      </div>

      <AnimatePresence>
        {selectedProgram && (
           <BuilderModal program={selectedProgram} onClose={() => setSelectedProgram(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

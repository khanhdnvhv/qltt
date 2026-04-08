import { useState, useMemo } from "react";
import { useDocumentTitle } from "../../utils/hooks";
import { useOutletContext } from "react-router";
import {
  Search, Plus, CalendarDays, Users, Users2, LayoutGrid, Calendar,
  MonitorStop, Wrench, FileEdit, MoreHorizontal, UserCheck, X, Link, ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";

type ClassStatus = "recruiting" | "active" | "completed" | "cancelled";
type RoomType = "theory" | "lab" | "workshop";

interface TimeSlot {
  day: "T2" | "T3" | "T4" | "T5" | "T6" | "T7" | "CN";
  period: "Sáng" | "Chiều" | "Tối";
  time: string;
}

interface CenterClass {
  id: string;
  code: string;
  name: string;
  program: string;
  teacher: string;
  room: string;
  roomType: RoomType;
  studentsCount: number;
  maxStudents: number;
  status: ClassStatus;
  schedule: TimeSlot[];
  startDate: string;
  endDate: string;
}

const mockClasses: CenterClass[] = [
  { id: "C01", code: "TA-B1-K26", name: "Lớp Tiếng Anh B1 VSTEP", program: "Ngoại ngữ", teacher: "Nguyễn Thị Mai", room: "Phòng 102", roomType: "theory", studentsCount: 28, maxStudents: 30, status: "active", schedule: [{ day: "T2", period: "Tối", time: "18:00-20:00" }, { day: "T4", period: "Tối", time: "18:00-20:00" }, { day: "T6", period: "Tối", time: "18:00-20:00" }], startDate: "15/01/2026", endDate: "15/05/2026" },
  { id: "C02", code: "TH-CB-K11", name: "Tin học Cơ bản Chuẩn QG", program: "Tin học", teacher: "Trần Văn Hiếu", room: "Phòng Máy 1", roomType: "lab", studentsCount: 20, maxStudents: 20, status: "active", schedule: [{ day: "T3", period: "Chiều", time: "14:00-16:00" }, { day: "T5", period: "Chiều", time: "14:00-16:00" }], startDate: "20/02/2026", endDate: "20/04/2026" },
  { id: "C03", code: "HAN-01-K02", name: "Hàn Điện Cơ bản", program: "Sơ cấp nghề", teacher: "Lý Quý", room: "Xưởng Thực hành 2", roomType: "workshop", studentsCount: 12, maxStudents: 15, status: "recruiting", schedule: [{ day: "T7", period: "Sáng", time: "08:00-11:30" }, { day: "CN", period: "Sáng", time: "08:00-11:30" }], startDate: "10/05/2026", endDate: "10/08/2026" },
  { id: "C04", code: "TA-TOEIC-K9", name: "Luyện thi TOEIC 600+", program: "Ngoại ngữ", teacher: "Phạm Đức Minh", room: "Phòng 205", roomType: "theory", studentsCount: 15, maxStudents: 25, status: "recruiting", schedule: [{ day: "T2", period: "Sáng", time: "08:00-10:00" }, { day: "T4", period: "Sáng", time: "08:00-10:00" }], startDate: "01/06/2026", endDate: "01/09/2026" },
  { id: "C05", code: "LT-WEB-K1", name: "Lập trình Web Frontend", program: "Tin học", teacher: "Võ Quang", room: "Phòng Máy 2", roomType: "lab", studentsCount: 30, maxStudents: 30, status: "active", schedule: [{ day: "T3", period: "Tối", time: "18:30-21:00" }, { day: "T5", period: "Tối", time: "18:30-21:00" }], startDate: "05/03/2026", endDate: "05/07/2026" },
  { id: "C06", code: "NAU-05-K3", name: "Kỹ thuật Nấu ăn Á Âu", program: "Sơ cấp nghề", teacher: "Đào Bếp", room: "Khu Bếp Thực hành", roomType: "workshop", studentsCount: 25, maxStudents: 25, status: "completed", schedule: [{ day: "T7", period: "Chiều", time: "13:30-17:00" }], startDate: "10/10/2025", endDate: "10/01/2026" },
];

const statusStyles: Record<ClassStatus, { label: string, color: string, badgeBg: string }> = {
  recruiting: { label: "Đang tuyển sinh", color: "text-amber-600", badgeBg: "bg-amber-100 border-amber-200" },
  active: { label: "Đang học", color: "text-emerald-600", badgeBg: "bg-emerald-100 border-emerald-200" },
  completed: { label: "Đã bế giảng", color: "text-blue-600", badgeBg: "bg-blue-100 border-blue-200" },
  cancelled: { label: "Đã hủy", color: "text-gray-500", badgeBg: "bg-gray-100 border-gray-200" }
};

const roomIcons: Record<RoomType, any> = {
  theory: Users2,
  lab: MonitorStop,
  workshop: Wrench
};

type ViewMode = "grid" | "timeline";

export function AdminClasses() {
  const { adminRole } = useOutletContext<{ adminRole: "department" | "center" }>();
  const isDepartment = adminRole === "department";
  useDocumentTitle(isDepartment ? "Tra cứu Lớp học" : "Quản lý Lớp học & Lịch học");

  const [classes] = useState<CenterClass[]>(mockClasses);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedClass, setSelectedClass] = useState<CenterClass | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const filteredData = useMemo(() => classes.filter(c => 
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase())
  ), [classes, search]);

  const activeClasses = classes.filter(c => c.status === "active").length;
  const totalStudents = classes.filter(c => c.status === "active").reduce((sum, c) => sum + c.studentsCount, 0);
  const capacityPct = Math.round((totalStudents / classes.filter(c => c.status === "active").reduce((sum, c) => sum + c.maxStudents, 0)) * 100) || 0;

  // Timetable Matrix Generation
  const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const periods = ["Sáng", "Chiều", "Tối"];

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col pt-2 pb-10">
      
      {/* Dynamic Header Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-2 bg-gradient-to-br from-indigo-900 to-[#1a1a2e] rounded-3xl p-8 text-white relative flex flex-col justify-center overflow-hidden shadow-xl">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/30 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
           <div className="relative z-10">
             <h1 className="text-[28px] font-black tracking-tight mb-2">
               {isDepartment ? "Tổng quan Lớp học Toàn tỉnh" : "Điều hành Lớp & Lịch học"}
             </h1>
             <p className="text-white/70 font-medium max-w-sm text-[15px]">Theo dõi các đợt mở lớp, lịch sử dụng phòng học và sắp xếp thời khóa biểu tự động.</p>
           </div>
        </div>
        <div className="bg-white dark:bg-card border border-gray-100 dark:border-white/5 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
           <div className="flex justify-between items-center mb-4">
              <span className="text-muted-foreground font-bold text-[14px] uppercase tracking-wider">LỚP ĐANG ACTIVE</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600"><MonitorStop className="w-5 h-5"/></div>
           </div>
           <div>
              <span className="text-[36px] font-black">{activeClasses}</span>
              <span className="text-muted-foreground ml-2 font-medium">/ {classes.length} tổng lớp</span>
           </div>
        </div>
        <div className="bg-white dark:bg-card border border-gray-100 dark:border-white/5 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
           <div className="flex justify-between items-center mb-4">
              <span className="text-muted-foreground font-bold text-[14px] uppercase tracking-wider">TỶ LỆ LẤP ĐẦY</span>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Users className="w-5 h-5"/></div>
           </div>
           <div>
              <span className="text-[36px] font-black">{capacityPct}%</span>
              <div className="w-full h-2 bg-gray-100 dark:bg-white/5 rounded-full mt-2 overflow-hidden">
                 <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${capacityPct}%` }} />
              </div>
           </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
         <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative">
               <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
               <input 
                 value={search} onChange={(e) => setSearch(e.target.value)}
                 className="pl-11 pr-4 py-3 bg-white dark:bg-card border border-gray-200 dark:border-white/10 rounded-2xl w-full sm:w-[300px] outline-none focus:border-primary/50 text-[15px] font-medium transition-colors"
                 placeholder="Tìm kiếm mã lớp, tên lớp..."
               />
            </div>
            {!isDepartment && (
               <div className="flex bg-white dark:bg-card border border-gray-200 dark:border-white/10 p-1.5 rounded-2xl shadow-sm hide-scrollbar overflow-x-auto">
                 <button onClick={() => setViewMode("grid")} className={`flex items-center gap-2 py-2 px-4 rounded-xl font-bold transition-all text-[14.5px] ${viewMode === 'grid' ? 'bg-[#f4f5f7] dark:bg-white/10 text-foreground' : 'text-muted-foreground'}`}>
                   <LayoutGrid className="w-4 h-4" /> Bảng chi tiết
                 </button>
                 <button onClick={() => setViewMode("timeline")} className={`flex items-center gap-2 py-2 px-4 rounded-xl font-bold transition-all text-[14.5px] ${viewMode === 'timeline' ? 'bg-[#f4f5f7] dark:bg-white/10 text-foreground' : 'text-muted-foreground'}`}>
                   <CalendarDays className="w-4 h-4" /> Xếp Thời Khóa Biểu
                 </button>
               </div>
            )}
         </div>
         
         {!isDepartment && (
           <button onClick={() => setAddModalOpen(true)} className="bg-primary text-white font-bold px-6 py-3.5 rounded-2xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20">
             <Plus className="w-5 h-5" /> Mở lớp mới
           </button>
         )}
      </div>

      {/* VIEW 1: Grid Cards */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredData.map((cls, idx) => {
              const RoomIcon = roomIcons[cls.roomType];
              const pct = (cls.studentsCount / cls.maxStudents) * 100;
              return (
                <motion.div
                  key={cls.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white dark:bg-card rounded-[1.5rem] border border-gray-100 dark:border-white/5 p-6 hover:shadow-xl hover:border-primary/30 transition-all group flex flex-col"
                >
                  <div className="flex justify-between items-start mb-4">
                     <div>
                       <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-black border ${statusStyles[cls.status].badgeBg} ${statusStyles[cls.status].color} mb-3`}>
                          <span className={`w-2 h-2 rounded-full bg-current ${cls.status === 'active' ? 'animate-pulse' : ''}`} />
                          {statusStyles[cls.status].label}
                       </span>
                       <h3 className="text-[18px] font-black text-[#1a1a2e] dark:text-foreground leading-tight group-hover:text-primary transition-colors cursor-pointer" onClick={() => setSelectedClass(cls)}>{cls.name}</h3>
                       <span className="text-[13px] text-muted-foreground font-mono font-bold">{cls.code}</span>
                     </div>
                     <button onClick={() => setSelectedClass(cls)} className="p-2 bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl text-gray-500 transition-colors">
                       <ArrowRight className="w-4 h-4" />
                     </button>
                  </div>

                  <div className="space-y-3 mb-6 bg-[#f9fafc] dark:bg-white/[0.02] p-4 rounded-2xl border border-gray-50 dark:border-white/5">
                     <div className="flex items-center gap-3 text-[14px]">
                       <div className="w-7 h-7 rounded-lg bg-pink-100 dark:bg-pink-500/10 text-pink-600 flex items-center justify-center shrink-0"><Users2 className="w-3.5 h-3.5"/></div>
                       <span className="text-muted-foreground">GV:</span>
                       <span className="font-bold text-foreground">{cls.teacher}</span>
                     </div>
                     <div className="flex items-center gap-3 text-[14px]">
                       <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0"><RoomIcon className="w-3.5 h-3.5"/></div>
                       <span className="text-muted-foreground">Phòng:</span>
                       <span className="font-bold text-foreground uppercase">{cls.room}</span>
                     </div>
                     <div className="flex items-center gap-3 text-[14px]">
                       <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0"><Calendar className="w-3.5 h-3.5"/></div>
                       <span className="text-muted-foreground">Lịch:</span>
                       <div className="flex flex-wrap gap-1">
                          {cls.schedule.map(s => <span key={s.day+s.period} className="px-1.5 py-0.5 bg-white dark:bg-card border border-gray-200 dark:border-white/10 rounded text-[11px] font-bold">{s.day}</span>)}
                          <span className="text-[12px] font-bold ml-1">({cls.schedule[0].period})</span>
                       </div>
                     </div>
                  </div>

                  <div className="mt-auto">
                     <div className="flex justify-between items-end mb-2">
                       <div className="flex -space-x-2">
                          {[...Array(Math.min(minProfiles(cls.studentsCount), 4))].map((_, i) => (
                             <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-card bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-500 overflow-hidden">
                               <img src={`https://i.pravatar.cc/100?u=${cls.id}${i}`} className="w-full h-full object-cover" alt="hs" />
                             </div>
                          ))}
                          {cls.studentsCount > 4 && <div className="w-8 h-8 rounded-full border-2 border-white dark:border-card bg-gray-100 text-gray-600 text-[10px] font-bold flex items-center justify-center">+{cls.studentsCount - 4}</div>}
                       </div>
                       <div className="text-right">
                          <span className={`text-[15px] font-black ${pct >= 100 ? 'text-red-500' : 'text-primary'}`}>{cls.studentsCount}</span>
                          <span className="text-[13px] text-muted-foreground font-bold"> / {cls.maxStudents}</span>
                       </div>
                     </div>
                     <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                     </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* VIEW 2: Timeline Board (Matrix) */}
      {viewMode === "timeline" && !isDepartment && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-card border border-gray-200 dark:border-white/5 rounded-[2rem] shadow-sm overflow-hidden flex flex-col h-[600px]">
           <div className="p-6 border-b border-gray-100 dark:border-white/5 flex gap-4 overflow-x-auto hide-scrollbar bg-[#f9fafc] dark:bg-muted font-bold text-[14px]">
              <div className="w-32 shrink-0"> Ca Khóa Học</div>
              {days.map(d => <div key={d} className="flex-1 min-w-[120px] text-center border-l border-gray-200 dark:border-white/10 pl-4">{d}</div>)}
           </div>
           
           <div className="flex-1 overflow-y-auto">
             {periods.map(period => (
               <div key={period} className="flex border-b border-gray-100 dark:border-white/5 min-h-[160px]">
                  <div className="w-32 shrink-0 border-r border-gray-100 dark:border-white/5 p-4 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-white/[0.01]">
                     <span className="text-[18px] font-black text-foreground">{period}</span>
                     <span className="text-[12px] text-muted-foreground font-bold line-clamp-1 text-center">
                        {period === 'Sáng' ? '08:00 - 11:30' : period === 'Chiều' ? '13:30 - 17:00' : '18:00 - 21:00'}
                     </span>
                  </div>
                  {days.map(day => {
                    const classesInSlot = classes.filter(c => c.schedule.some(s => s.day === day && s.period === period));
                    return (
                      <div key={day} className="flex-1 min-w-[120px] border-r border-gray-50 dark:border-white/5 p-2 bg-[#fdfdfd] dark:bg-transparent">
                         <div className="space-y-2">
                           {classesInSlot.map(c => (
                             <div key={c.id} onClick={() => setSelectedClass(c)} className={`p-3 rounded-xl border cursor-pointer hover:shadow-md transition-all ${c.status === 'active' ? 'bg-indigo-50 border-indigo-100 dark:bg-indigo-500/10 dark:border-indigo-500/20' : 'bg-gray-50 border-gray-200 dark:bg-white/5'}`}>
                               <div className="text-[12.5px] font-black text-[#1a1a2e] dark:text-foreground line-clamp-2 leading-tight mb-1">{c.name}</div>
                               <div className="flex items-center justify-between text-[11px] font-bold">
                                  <span className="text-primary">{c.room}</span>
                                  <span className="text-muted-foreground line-clamp-1 pl-1">{c.teacher.split(' ').slice(-1)[0]}</span>
                               </div>
                             </div>
                           ))}
                           {classesInSlot.length === 0 && (
                              <div className="h-full min-h-[100px] flex items-center justify-center">
                                 <Plus className="w-5 h-5 text-gray-200 dark:text-white/10 group-hover:text-primary transition-colors cursor-pointer" />
                              </div>
                           )}
                         </div>
                      </div>
                    )
                  })}
               </div>
             ))}
           </div>
        </motion.div>
      )}

      {/* Class Profile Drawer */}
      <AnimatePresence>
        {selectedClass && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[90] backdrop-blur-[4px]" onClick={() => setSelectedClass(null)} />
            <motion.div
              initial={{ x: "100%", boxShadow: "0 0 0 rgba(0,0,0,0)" }} animate={{ x: 0, boxShadow: "-20px 0 50px rgba(0,0,0,0.15)" }} exit={{ x: "100%" }} transition={{ type: "spring", bounce: 0, duration: 0.5 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[500px] bg-[#f9fafc] dark:bg-[#12121a] z-[100] flex flex-col overflow-hidden"
            >
               <div className="bg-white dark:bg-card p-6 border-b border-gray-100 dark:border-white/5 shadow-sm relative z-20">
                  <button onClick={() => setSelectedClass(null)} className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 rounded-full transition-colors"><X className="w-4 h-4"/></button>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold border ${statusStyles[selectedClass.status].badgeBg} ${statusStyles[selectedClass.status].color} mb-3`}>
                    {statusStyles[selectedClass.status].label}
                  </span>
                  <h2 className="text-[24px] font-black leading-tight text-[#1a1a2e] dark:text-foreground mb-1 pr-8">{selectedClass.name}</h2>
                  <p className="text-muted-foreground font-mono font-bold text-[14px]">{selectedClass.code}</p>
               </div>

               <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-white dark:bg-card p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                        <div className="text-[12px] font-bold text-muted-foreground uppercase mb-1">Sĩ số</div>
                        <div className="text-[20px] font-black text-primary">{selectedClass.studentsCount} <span className="text-[14px] text-muted-foreground">/ {selectedClass.maxStudents}</span></div>
                     </div>
                     <div className="bg-white dark:bg-card p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                        <div className="text-[12px] font-bold text-muted-foreground uppercase mb-1">Khai Giảng</div>
                        <div className="text-[16px] font-black">{selectedClass.startDate}</div>
                     </div>
                  </div>

                  {/* Timetable Infobox */}
                  <div className="bg-white dark:bg-card rounded-2xl p-5 border border-gray-100 dark:border-white/5 shadow-sm space-y-4 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px] -translate-y-1/2" />
                     <h4 className="font-black text-[16px] flex items-center gap-2"><Calendar className="w-4 h-4 text-amber-500"/> Lịch & Địa điểm</h4>
                     <div className="space-y-3 relative z-10">
                        {selectedClass.schedule.map((s, i) => (
                           <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-white/5 last:border-0 pb-0">
                              <span className="font-bold text-[14.5px] bg-[#f4f5f7] dark:bg-white/10 px-3 py-1 rounded-lg">{s.day}</span>
                              <div className="text-right">
                                <p className="font-black text-[15px]">{s.time}</p>
                                <p className="text-[12px] font-bold text-muted-foreground">Ca {s.period}</p>
                              </div>
                           </div>
                        ))}
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                           <span className="text-[14px] font-bold text-muted-foreground">Phòng học (Room):</span>
                           <span className="text-[15px] font-black text-primary px-3 py-1 rounded-lg bg-primary/10">{selectedClass.room}</span>
                        </div>
                     </div>
                  </div>

                  {/* Actions Area */}
                  {!isDepartment && (
                     <div className="space-y-3">
                        <h4 className="font-black text-[16px]">Tác vụ Điều hành</h4>
                        <button className="w-full flex items-center justify-between bg-white dark:bg-card p-4 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-primary/50 hover:shadow-md transition-all group">
                           <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"><UserCheck className="w-5 h-5"/></div>
                             <div className="text-left">
                               <div className="font-black text-[15px]">Điểm danh & Báo cáo</div>
                               <div className="text-[12px] font-bold text-muted-foreground">Ghi danh nhật ký lớp học</div>
                             </div>
                           </div>
                           <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
                        </button>
                        <button className="w-full flex items-center justify-between bg-white dark:bg-card p-4 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-primary/50 hover:shadow-md transition-all group">
                           <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"><FileEdit className="w-5 h-5"/></div>
                             <div className="text-left">
                               <div className="font-black text-[15px]">Cập nhật Lịch / Đổi phòng</div>
                               <div className="text-[12px] font-bold text-muted-foreground">Sắp xếp lại thời khóa biểu</div>
                             </div>
                           </div>
                           <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
                        </button>
                     </div>
                  )}
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Premium Add Class Modal */}
      <AnimatePresence>
        {addModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setAddModalOpen(false)} />
             <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-2xl bg-white dark:bg-[#12121a] rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-white/5 text-foreground flex flex-col max-h-[90vh]">
               
               <div className="p-8 pb-4 shrink-0">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                     <CalendarDays className="w-8 h-8 text-primary" />
                  </div>
                 <h3 className="text-[28px] font-black tracking-tight mb-2">Mở Lớp học Mới</h3>
                 <p className="text-muted-foreground text-[15px] font-medium leading-relaxed">Thiết lập thông tin khóa học, sắp xếp phòng học và lịch khai giảng dự kiến.</p>
               </div>

               <div className="px-8 pb-8 flex-1 overflow-y-auto space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Chương trình Đào tạo</label>
                      <div className="relative">
                        <select className="w-full appearance-none bg-[#f4f5f7] dark:bg-white/5 border-none px-5 py-4 rounded-2xl font-bold text-[15px] text-foreground outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer">
                          <option>Chọn chương trình...</option>
                          <option>Tin học Cơ bản Chuẩn QG</option>
                          <option>Tiếng Anh B1 VSTEP</option>
                          <option>Sơ cấp nghề Kỹ thuật Chế biến Món ăn</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-muted-foreground">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Mã Lớp (Tự sinh)</label>
                      <input value="TA-B1-K27" disabled className="w-full bg-gray-100/50 dark:bg-white/[0.02] border border-transparent dark:border-white/5 px-5 py-4 rounded-2xl font-mono font-bold text-[15px] text-muted-foreground outline-none cursor-not-allowed" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Tên Lớp hiển thị</label>
                    <input placeholder="VD: Lớp Tiếng Anh B1 Khóa 27..." className="w-full bg-[#f4f5f7] dark:bg-white/5 border border-transparent dark:border-white/5 px-5 py-4 rounded-2xl font-bold text-[15px] outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground placeholder:text-muted-foreground/60" />
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                     <div className="col-span-2">
                        <label className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Giáo viên CN (Tùy chọn)</label>
                        <div className="relative">
                          <select className="w-full appearance-none bg-[#f4f5f7] dark:bg-white/5 border border-transparent dark:border-white/5 px-5 py-3.5 rounded-2xl font-bold text-[15px] text-foreground outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer">
                            <option>Chưa phân bổ</option>
                            <option>Nguyễn Thị Mai (TA)</option>
                            <option>Trần Văn Hiếu (TH)</option>
                          </select>
                           <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                             <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                           </div>
                        </div>
                     </div>
                     <div>
                        <label className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Sĩ số chờ</label>
                        <input type="number" defaultValue={30} className="w-full bg-[#f4f5f7] dark:bg-white/5 border border-transparent dark:border-white/5 px-5 py-3.5 rounded-2xl font-bold text-[15px] outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground" />
                     </div>
                     <div>
                        <label className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Khai giảng</label>
                        <input type="date" className="w-full bg-[#f4f5f7] dark:bg-white/5 border border-transparent dark:border-white/5 px-4 py-3.5 rounded-2xl font-bold text-[14px] outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground" />
                     </div>
                  </div>

                  <div className="p-5 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-2xl mb-2">
                     <div className="flex items-center gap-3 mb-2">
                        <CalendarDays className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                        <span className="font-bold text-amber-900 dark:text-amber-400 tracking-wide text-[14px]">XẾP LỊCH HỌC & PHÒNG</span>
                     </div>
                     <p className="text-[13.5px] text-amber-700/80 dark:text-amber-500/80 mb-0 font-medium">Sẽ được sắp xếp tại Tab <b>Xếp Thời Khóa Biểu</b> bằng thao tác kéo thả sau khi lớp được tạo.</p>
                  </div>
               </div>

               <div className="p-6 bg-[#f4f5f7]/50 dark:bg-white/5 flex gap-3 border-t border-gray-100 dark:border-white/5 shrink-0">
                 <button onClick={() => setAddModalOpen(false)} className="px-6 py-4 font-bold text-muted-foreground bg-transparent hover:bg-gray-200 dark:hover:bg-white/10 rounded-2xl transition-all flex-1">Hủy thao tác</button>
                 <button onClick={() => {
                   setAddModalOpen(false);
                   toast.success("Mở lớp thành công! Bạn có thể xếp phòng ngay trên Ma trận.");
                   setViewMode("timeline"); // Switch to timeline gently
                 }} className="px-8 py-4 font-black text-white bg-primary rounded-2xl hover:bg-primary/90 hover:scale-[1.02] shadow-[0_10px_20px_-10px_rgba(0,0,0,0.5)] transition-all flex-[2]">Tạo Lớp Mới</button>
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function minProfiles(count: number) { return count; }

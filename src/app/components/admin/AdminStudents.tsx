import { useState, useMemo } from "react";
import { useDocumentTitle } from "../../utils/hooks";
import { useOutletContext } from "react-router";
import {
  Search, Plus, MapPin, Phone, Activity, Clock, Ban, Save, X, Eye, 
  GraduationCap, Mail, Sparkles, LayoutGrid, List, Calendar, TrendingUp, BookOpen, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";
import { useUrlFilters } from "../../utils/useUrlFilters";

type Status = "learning" | "suspended" | "dropped" | "graduated";

interface MockStudent {
  id: string;
  code: string;
  name: string;
  dob: string;
  email: string;
  phone: string;
  status: Status;
  programs: string[];
  avatarColor: string;
  progress: number;
}

const initialStudents: MockStudent[] = [
  { id: "S001", code: "HV-26-0001", name: "Nguyễn Trung Tín", dob: "15/04/2005", email: "tin.nguyen@example.com", phone: "0901234567", status: "learning", programs: ["Tiếng Anh B1 VSTEP", "Tin học Cơ bản"], avatarColor: "from-blue-600 to-indigo-600", progress: 68 },
  { id: "S002", code: "HV-26-0002", name: "Trần Mai Anh", dob: "22/08/2007", email: "anh.tran@example.com", phone: "0912345678", status: "learning", programs: ["Lớp 10 GDTX"], avatarColor: "from-pink-500 to-rose-500", progress: 35 },
  { id: "S003", code: "HV-26-0003", name: "Lý Gia Hân", dob: "11/11/2006", email: "han.ly@example.com", phone: "0923456789", status: "suspended", programs: ["Kỹ thuật Nấu ăn 3 Tháng"], avatarColor: "from-amber-500 to-orange-500", progress: 12 },
  { id: "S004", code: "HV-26-0004", name: "Phạm Bình Minh", dob: "30/01/2003", email: "minh.pham@example.com", phone: "0934567890", status: "dropped", programs: ["Hàn Điện Cơ bản"], avatarColor: "from-red-500 to-rose-600", progress: 50 },
  { id: "S005", code: "HV-25-0992", name: "Hoàng Thanh Thảo", dob: "05/09/2001", email: "thao.hoang@example.com", phone: "0945678901", status: "graduated", programs: ["Tiếng Anh TOEIC Cấp tốc"], avatarColor: "from-emerald-500 to-teal-500", progress: 100 },
  { id: "S006", code: "HV-26-0012", name: "Lê Minh Trí", dob: "19/02/2004", email: "tri.le@example.com", phone: "0956789012", status: "learning", programs: ["Lập trình Web Frontend", "Tiếng Nhật N4"], avatarColor: "from-cyan-500 to-blue-500", progress: 82 },
  { id: "S007", code: "HV-26-0015", name: "Đỗ Xuân Trường", dob: "10/10/2006", email: "truong.do@example.com", phone: "0967890123", status: "learning", programs: ["Thiết kế Đồ họa Cơ bản"], avatarColor: "from-violet-500 to-purple-600", progress: 24 },
  { id: "S008", code: "HV-25-0811", name: "Vũ Ngọc Trâm", dob: "04/07/2002", email: "tram.vu@example.com", phone: "0978901234", status: "graduated", programs: ["Kế toán Thực hành"], avatarColor: "from-teal-400 to-emerald-500", progress: 100 },
];

const statusStyles: Record<Status, { label: string, badgeBg: string, badgeText: string, icon: any, dot: string, heroBg: string }> = {
  learning: { label: "Đang học", badgeBg: "bg-blue-500/10 dark:bg-blue-500/20", badgeText: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500", icon: Activity, heroBg: "from-blue-50 to-indigo-50/50 dark:from-blue-900/20 dark:to-background" },
  suspended: { label: "Bảo lưu", badgeBg: "bg-amber-500/10 dark:bg-amber-500/20", badgeText: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500", icon: Clock, heroBg: "from-amber-50 to-orange-50/50 dark:from-amber-900/20 dark:to-background" },
  dropped: { label: "Thôi học", badgeBg: "bg-red-500/10 dark:bg-red-500/20", badgeText: "text-red-700 dark:text-red-400", dot: "bg-red-500", icon: Ban, heroBg: "from-red-50 to-rose-50/50 dark:from-red-900/20 dark:to-background" },
  graduated: { label: "Đã Tốt nghiệp", badgeBg: "bg-emerald-500/10 dark:bg-emerald-500/20", badgeText: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500", icon: GraduationCap, heroBg: "from-emerald-50 to-teal-50/50 dark:from-emerald-900/20 dark:to-background" },
};

export function AdminStudents() {
  const { adminRole } = useOutletContext<{ adminRole: "department" | "center" }>();
  const isDepartment = adminRole === "department";
  useDocumentTitle(isDepartment ? "Tra cứu Học viên" : "Hồ sơ Học viên");

  const [students] = useState<MockStudent[]>(initialStudents);
  const [search, setSearch] = useState("");
  const [filters, setFilter] = useUrlFilters({ status: "all" });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<MockStudent | null>(null);
  const [activeDrawerTab, setActiveDrawerTab] = useState<"info" | "programs" | "history">("info");
  
  const [addModalOpen, setAddModalOpen] = useState(false);

  const filteredData = useMemo(() => students.filter(s => {
    const sMatch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.phone.includes(search) || s.code.toLowerCase().includes(search.toLowerCase());
    const fMatch = filters.status === "all" || s.status === filters.status;
    return sMatch && fMatch;
  }), [students, search, filters.status]);

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col pt-2 pb-10">
      {/* Premium Header */}
      <div className="relative mb-8 p-8 rounded-[2rem] overflow-hidden bg-[#1a1a2e] text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary opacity-30 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent opacity-30 rounded-full blur-[100px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-4 text-[13px] font-semibold tracking-wide">
               <Sparkles className="w-4 h-4 text-accent" />
               <span className="bg-gradient-to-r from-accent to-white bg-clip-text text-transparent">Premium Student Manager</span>
            </div>
            <h1 className="text-[32px] md:text-[40px] font-black tracking-tight leading-tight mb-2">
              {isDepartment ? "Tra cứu Hồ sơ Học viên" : "Quản lý Hồ sơ Điện tử"}
            </h1>
            <p className="text-white/70 text-[16px] max-w-xl font-medium">
              Kiểm soát tiến độ học tập, hành trình phát triển và hồ sơ số hóa toàn diện của học viên với trải nghiệm mượt mà nhất.
            </p>
          </div>
          
          <div className="flex gap-3">
             {!isDepartment && (
                <button 
                  onClick={() => setAddModalOpen(true)}
                  className="flex items-center justify-center gap-2.5 bg-white text-[#1a1a2e] px-6 py-3.5 rounded-2xl text-[15px] font-bold shadow-[0_8px_30px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  <Plus className="w-5 h-5" />
                  Tiếp nhận Học viên 
                </button>
             )}
          </div>
        </div>
      </div>

      {/* Futuristic Toolbar */}
      <div className="flex flex-col lg:flex-row items-center gap-4 mb-8">
         <div className="relative flex-1 w-full group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
            <div className="relative flex items-center bg-white/80 dark:bg-card/80 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-2xl px-5 py-1 box-shadow-sm">
                <Search className="w-5 h-5 text-muted-foreground mr-3" />
                <input 
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Tìm kiếm theo Tên, Mã số, Số điện thoại..."
                  className="flex-1 bg-transparent border-none outline-none py-3 text-[15px] font-medium text-foreground placeholder:text-muted-foreground/60"
                />
            </div>
         </div>
         
         <div className="flex w-full lg:w-auto gap-3">
            <div className="relative">
              <select
                value={filters.status || "all"} onChange={(e) => setFilter("status", e.target.value)}
                className="w-full sm:w-[220px] appearance-none bg-white/80 dark:bg-card/80 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 text-foreground px-5 py-4 rounded-2xl text-[15px] font-bold outline-none cursor-pointer hover:border-primary/50 transition-colors shadow-sm"
              >
                <option value="all">🚀 Mọi Trạng thái</option>
                <option value="learning">Đang theo học</option>
                <option value="suspended">Tạm bảo lưu</option>
                <option value="dropped">Đã thôi học</option>
                <option value="graduated">Đã Tốt nghiệp</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-muted-foreground">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
              </div>
            </div>

            <div className="flex bg-white/80 dark:bg-card/80 backdrop-blur-xl rounded-2xl p-1.5 border border-gray-200/50 dark:border-white/10 shadow-sm shrink-0">
               <button onClick={() => setViewMode("grid")} className={`p-2.5 rounded-xl transition-all ${viewMode === "grid" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:bg-gray-100 dark:hover:bg-white/5"}`}>
                 <LayoutGrid className="w-5 h-5" />
               </button>
               <button onClick={() => setViewMode("list")} className={`p-2.5 rounded-xl transition-all ${viewMode === "list" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:bg-gray-100 dark:hover:bg-white/5"}`}>
                 <List className="w-5 h-5" />
               </button>
            </div>
         </div>
      </div>

      {/* Grid Content */}
      <motion.div layout className={`grid gap-6 ${viewMode === "grid" ? "sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4" : "grid-cols-1"}`}>
        <AnimatePresence>
          {filteredData.map((student, idx) => {
            const stIcon = statusStyles[student.status].icon;
            return (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className={`group relative bg-white dark:bg-card border border-gray-100 dark:border-white/5 rounded-[1.5rem] p-6 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 flex ${viewMode === 'list' ? 'flex-row items-center gap-6' : 'flex-col'}`}
              >
                 {/* Student Header */}
                 <div className={`flex justify-between items-start ${viewMode === 'list' ? 'w-1/3 shrink-0' : 'mb-6'}`}>
                    <div className="flex items-center gap-4">
                       <div className="relative">
                          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${student.avatarColor} flex items-center justify-center text-white text-[20px] font-black shadow-lg shadow-primary/20 ring-4 ring-white dark:ring-card z-10 relative`}>
                            {student.name.split(" ").slice(-1)[0].charAt(0)}
                          </div>
                          <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-card z-20 ${statusStyles[student.status].dot} ${student.status === 'learning' ? 'animate-pulse' : ''}`} />
                       </div>
                       <div>
                          <h3 className="text-[17px] font-black text-[#1a1a2e] dark:text-foreground group-hover:text-primary transition-colors cursor-pointer" onClick={() => { setSelectedStudent(student); setDrawerOpen(true); }}>
                             {student.name}
                          </h3>
                          <span className="text-[13px] text-muted-foreground font-semibold font-mono tracking-tight mt-0.5 block">{student.code}</span>
                       </div>
                    </div>
                 </div>

                 {/* Middle Section (Programs & Progress) */}
                 <div className={`flex-1 ${viewMode === 'list' ? 'pr-6 border-r border-gray-100 dark:border-white/5' : 'mb-6'}`}>
                    <div className="flex flex-wrap gap-2 mb-4">
                       {student.programs.map((p, i) => (
                         <span key={i} className="px-3 py-1.5 rounded-lg bg-[#f4f5f7] dark:bg-white/5 text-[#1a1a2e] dark:text-foreground text-[12px] font-bold border border-gray-200 dark:border-white/10">
                           {p}
                         </span>
                       ))}
                       {student.programs.length > 1 && (
                         <span className="px-2 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[11px] font-black tracking-wider shadow-md">
                           MULTI
                         </span>
                       )}
                    </div>
                    {student.status === "learning" && (
                      <div className="space-y-1.5">
                         <div className="flex justify-between text-[12px] font-bold text-muted-foreground">
                            <span>Tiến độ tổng hợp</span>
                            <span className="text-primary">{student.progress}%</span>
                         </div>
                         <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
                           <motion.div initial={{ width: 0 }} animate={{ width: `${student.progress}%` }} transition={{ duration: 1, ease: "easeOut" }} className={`h-full rounded-full bg-gradient-to-r ${student.avatarColor}`} />
                         </div>
                      </div>
                    )}
                 </div>

                 {/* Bottom Section */}
                 <div className={`flex items-center justify-between ${viewMode === 'list' ? 'w-[200px] shrink-0 pl-6' : 'pt-5 border-t border-gray-100 dark:border-white/10 mt-auto'}`}>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12.5px] font-bold ${statusStyles[student.status].badgeBg} ${statusStyles[student.status].badgeText}`}>
                       <stIcon className="w-3.5 h-3.5" />
                       {statusStyles[student.status].label}
                    </span>
                    <button 
                      onClick={() => { setSelectedStudent(student); setDrawerOpen(true); }}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#f4f5f7] hover:bg-primary dark:bg-white/5 dark:hover:bg-primary text-gray-500 hover:text-white transition-all duration-300"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                 </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>

      {filteredData.length === 0 && (
         <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-[18px] font-bold text-foreground">Không tìm thấy Học viên nào</h3>
            <p className="text-muted-foreground mt-2">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm nhé!</p>
         </div>
      )}

      {/* 🚀 ULTIMATE STUDENT PROFILE DRAWER */}
      <AnimatePresence>
        {drawerOpen && selectedStudent && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[90] backdrop-blur-[4px]" onClick={() => setDrawerOpen(false)} />
            <motion.div
              initial={{ x: "100%", boxShadow: "0 0 0 rgba(0,0,0,0)" }} animate={{ x: 0, boxShadow: "-20px 0 50px rgba(0,0,0,0.15)" }} exit={{ x: "100%" }} transition={{ type: "spring", bounce: 0, duration: 0.5 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[540px] bg-white dark:bg-[#12121a] z-[100] flex flex-col overflow-hidden"
            >
              {/* Dynamic Header Banner */}
              <div className={`relative h-[200px] w-full bg-gradient-to-br ${statusStyles[selectedStudent.status].heroBg} p-8 overflow-hidden`}>
                 {/* Decorative elements */}
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 dark:bg-white/5 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2" />
                 <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary/20 rounded-full blur-[40px] -translate-x-1/2 translate-y-1/2" />
                 
                 <button onClick={() => setDrawerOpen(false)} className="absolute top-6 right-6 p-2.5 bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 rounded-full text-foreground backdrop-blur-md transition-colors z-20">
                    <X className="w-5 h-5" />
                 </button>

                 <div className="relative z-10 h-full flex flex-col justify-between">
                    <div className="flex gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-black tracking-wide bg-white/60 dark:bg-black/40 backdrop-blur-md border border-white/20 shadow-sm ${statusStyles[selectedStudent.status].badgeText}`}>
                        Mã HV: {selectedStudent.code}
                      </span>
                    </div>
                 </div>
              </div>

              {/* Overlapping Avatar & Name */}
              <div className="px-8 relative pb-6 border-b border-gray-100 dark:border-white/5">
                 <div className="flex items-end gap-5 -translate-y-8">
                    <div className={`w-28 h-28 rounded-[2rem] bg-gradient-to-br ${selectedStudent.avatarColor} flex items-center justify-center text-white text-[40px] font-black shadow-2xl ring-8 ring-white dark:ring-[#12121a]`}>
                      {selectedStudent.name.split(" ").slice(-1)[0].charAt(0)}
                    </div>
                    <div className="pb-2">
                       <h2 className="text-[26px] font-black text-[#1a1a2e] dark:text-foreground tracking-tight leading-none">{selectedStudent.name}</h2>
                       <p className={`text-[14.5px] font-bold mt-2 ${statusStyles[selectedStudent.status].badgeText} flex items-center gap-1`}>
                          {(() => {
                             const StatusIcon = statusStyles[selectedStudent.status].icon;
                             return <StatusIcon className="w-4 h-4" />;
                          })()}
                          {statusStyles[selectedStudent.status].label}
                       </p>
                    </div>
                 </div>

                 {/* Premium Tabs */}
                 <div className="flex gap-2 p-1.5 bg-[#f4f5f7] dark:bg-white/5 rounded-2xl w-full">
                    {[
                      { id: "info", label: "Cá nhân", icon: Eye },
                      { id: "programs", label: "Khóa học", icon: BookOpen },
                      { id: "history", label: "Lịch sử", icon: Calendar }
                    ].map(t => (
                      <button 
                        key={t.id} 
                        onClick={() => setActiveDrawerTab(t.id as any)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[14.5px] font-bold rounded-xl transition-all duration-300 ${activeDrawerTab === t.id ? 'bg-white dark:bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        <t.icon className="w-4 h-4" />
                        {t.label}
                      </button>
                    ))}
                 </div>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-[#12121a]">
                
                {/* TAB 1: INFO */}
                {activeDrawerTab === "info" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div>
                       <h3 className="text-[17px] font-black text-[#1a1a2e] dark:text-foreground mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-amber-500" /> Thông tin Liên hệ</h3>
                       <div className="space-y-0.5 bg-[#f4f5f7]/50 dark:bg-white/[0.02] rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
                          <div className="flex justify-between items-center py-4 px-6 bg-white dark:bg-white/5 border-b border-gray-50 dark:border-white/5">
                             <div className="flex items-center gap-3 text-muted-foreground"><Calendar className="w-4 h-4" /> <span className="font-semibold text-[14.5px]">Ngày sinh</span></div>
                             <span className="font-black text-[15px]">{selectedStudent.dob}</span>
                          </div>
                          <div className="flex justify-between items-center py-4 px-6 bg-white dark:bg-white/5 border-b border-gray-50 dark:border-white/5">
                             <div className="flex items-center gap-3 text-muted-foreground"><Phone className="w-4 h-4" /> <span className="font-semibold text-[14.5px]">Điện thoại</span></div>
                             <span className="font-black text-[15px]">{selectedStudent.phone}</span>
                          </div>
                          <div className="flex justify-between items-center py-4 px-6 bg-white dark:bg-white/5 border-b border-gray-50 dark:border-white/5">
                             <div className="flex items-center gap-3 text-muted-foreground"><Mail className="w-4 h-4" /> <span className="font-semibold text-[14.5px]">Email Address</span></div>
                             <span className="font-black text-[15px]">{selectedStudent.email}</span>
                          </div>
                          <div className="flex justify-between items-center py-4 px-6 bg-white dark:bg-white/5">
                             <div className="flex items-center gap-3 text-muted-foreground"><MapPin className="w-4 h-4" /> <span className="font-semibold text-[14.5px]">Thường trú</span></div>
                             <span className="font-black text-[15px] text-right">Quận 1, TP Hồ Chí Minh</span>
                          </div>
                       </div>
                    </div>
                  </motion.div>
                )}

                {/* TAB 2: PROGRAMS */}
                {activeDrawerTab === "programs" && (
                  <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5">
                    {selectedStudent.programs.map((p, i) => (
                      <div key={i} className="group bg-white dark:bg-card p-6 rounded-[1.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-white/5 relative overflow-hidden transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
                        {/* Glow corner */}
                        <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${selectedStudent.avatarColor} blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity`} />
                        <div className="relative z-10">
                          <h4 className="font-black text-[18px] text-[#1a1a2e] dark:text-foreground mb-1">{p}</h4>
                          <p className="text-[13.5px] font-semibold text-muted-foreground mb-6">CSĐT: Cơ sở Chính • Nhập học: 15/01/2026</p>
                          
                          <div className="bg-[#f4f5f7] dark:bg-white/5 rounded-2xl p-5">
                             <div className="flex items-center justify-between mb-3">
                               <span className="text-[14px] font-bold text-muted-foreground">Tiến trình học tập</span>
                               <span className="text-[18px] font-black text-primary">68%</span>
                             </div>
                             <div className="h-3 w-full bg-white dark:bg-black/20 rounded-full overflow-hidden shadow-inner">
                                <motion.div initial={{ width: 0 }} animate={{ width: "68%" }} transition={{ delay: 0.2, duration: 1 }} className={`h-full bg-gradient-to-r ${selectedStudent.avatarColor} rounded-full`} />
                             </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {!isDepartment && selectedStudent.status !== "graduated" && (
                       <button className="w-full py-5 border-[3px] border-dashed border-primary/20 dark:border-primary/10 rounded-[1.5rem] text-[15px] text-primary font-black tracking-wide hover:bg-primary/5 transition-colors flex items-center justify-center gap-2">
                         <Plus className="w-5 h-5" /> GHI DANH KHÓA MỚI
                       </button>
                    )}
                  </motion.div>
                )}

                {/* TAB 3: HISTORY */}
                {activeDrawerTab === "history" && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="pt-2 pl-4">
                    <div className="relative border-l-[3px] border-gray-100 dark:border-white/10 space-y-10 pl-8 pb-4">
                      
                      {selectedStudent.status === "suspended" && (
                        <div className="relative">
                           <div className="absolute -left-[40.5px] w-5 h-5 bg-amber-500 rounded-full ring-[6px] ring-white dark:ring-[#12121a] shadow-md z-10" />
                           <div className="absolute -left-[31px] top-6 w-0.5 h-[calc(100%+24px)] bg-amber-500/30" />
                           <h4 className="text-[16px] font-black text-amber-600 dark:text-amber-500">Giáo vụ thay đổi: BẢO LƯU</h4>
                           <p className="text-[14px] text-muted-foreground mt-1.5 leading-relaxed bg-[#f4f5f7] dark:bg-white/5 p-4 rounded-2xl rounded-tl-none font-medium">Học viên xin bảo lưu tạm thời do vấn đề sức khỏe cá nhân. Hẹn quay lại vào khóa tháng 8.</p>
                           <span className="text-[12px] font-bold text-muted-foreground mt-3 block flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> Hôm nay lúc 14:00</span>
                        </div>
                      )}

                      <div className="relative">
                         <div className="absolute -left-[40.5px] w-5 h-5 bg-emerald-500 rounded-full ring-[6px] ring-white dark:ring-[#12121a] z-10" />
                         <h4 className="text-[16px] font-black text-[#1a1a2e] dark:text-foreground">Đăng ký thành công & Bắt đầu khóa</h4>
                         <p className="text-[14px] text-muted-foreground mt-1.5 leading-relaxed bg-[#f4f5f7] dark:bg-white/5 p-4 rounded-2xl rounded-tl-none font-medium">Ghi danh thành công lớp Tiếng Anh B1 VSTEP học tối 2-4-6.</p>
                         <span className="text-[12px] font-bold text-muted-foreground mt-3 block flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/> 15/01/2026 lúc 08:30</span>
                      </div>

                      <div className="relative">
                         <div className="absolute -left-[40.5px] w-5 h-5 bg-primary rounded-full ring-[6px] ring-white dark:ring-[#12121a] z-10" />
                         <h4 className="text-[16px] font-black text-[#1a1a2e] dark:text-foreground">Khởi tạo Hồ sơ Gốc</h4>
                         <span className="text-[12px] font-bold text-muted-foreground mt-2 block flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5"/> 14/01/2026 bởi Hệ thống</span>
                      </div>

                    </div>
                  </motion.div>
                )}

              </div>
              
              {/* Bottom Action Bar */}
              {!isDepartment && (
                <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-[#12121a] flex gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-50">
                   {selectedStudent.status === 'learning' ? (
                     <button onClick={() => toast.success("Đã ghi nhận yêu cầu Bảo lưu!")} className="flex-1 py-4 rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-500/10 dark:border-amber-500/20 text-amber-700 dark:text-amber-500 font-bold hover:bg-amber-100 transition-colors">Đình chỉ / Bảo lưu</button>
                   ) : (
                     <button onClick={() => toast.success("Học viên đã mở lại trạng thái học tập")} className="flex-1 py-4 rounded-2xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-500/10 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-500 font-bold hover:bg-emerald-100 transition-colors">Mở khóa lại</button>
                   )}
                   <button onClick={() => {toast.success("Thay đổi hồ sơ thành công"); setDrawerOpen(false)}} className="flex-1 py-4 rounded-2xl bg-[#1a1a2e] dark:bg-white text-white dark:text-[#1a1a2e] font-black hover:bg-black dark:hover:bg-gray-100 transition-colors shadow-xl">Lưu Thông tin</button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Premium Add Modal */}
      <AnimatePresence>
        {addModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setAddModalOpen(false)} />
             <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-xl bg-white dark:bg-[#12121a] rounded-[2rem] shadow-2xl overflow-hidden border border-white/10 text-foreground">
               
               <div className="p-8 pb-0">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                     <Plus className="w-8 h-8 text-primary" />
                  </div>
                 <h3 className="text-[28px] font-black tracking-tight mb-2">Tiếp nhận Học viên</h3>
                 <p className="text-muted-foreground text-[15px] font-medium leading-relaxed mb-8">Hồ sơ sẽ được mã hóa và tạo mã HS tự động. Chọn khóa học đầu tiên để kích hoạt lộ trình.</p>
               </div>

               <div className="p-8 pt-0 space-y-5">
                  <div>
                    <label className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Thông tin cơ bản</label>
                    <input placeholder="Họ và tên trên CCCD..." className="w-full bg-[#f4f5f7] dark:bg-white/5 border-none px-5 py-4 rounded-2xl font-bold text-[15px] outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <input placeholder="Số điện thoại..." className="w-full bg-[#f4f5f7] dark:bg-white/5 border-none px-5 py-4 rounded-2xl font-semibold text-[15px] outline-none focus:ring-2 focus:ring-primary/50 text-foreground" />
                     <input placeholder="Email liên hệ..." className="w-full bg-[#f4f5f7] dark:bg-white/5 border-none px-5 py-4 rounded-2xl font-semibold text-[15px] outline-none focus:ring-2 focus:ring-primary/50 text-foreground" />
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider mt-2 mb-2 block">Chương trình Ghi danh</label>
                    <div className="relative">
                      <select className="w-full appearance-none bg-[#f4f5f7] dark:bg-white/5 border-none px-5 py-4 rounded-2xl font-bold text-[15px] text-foreground outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer">
                        <option>Chọn chương trình khai giảng gần nhất...</option>
                        <option>Tin học Cơ bản Chuẩn QG</option>
                        <option>Tiếng Anh B1 VSTEP</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-muted-foreground">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                      </div>
                    </div>
                  </div>
               </div>

               <div className="p-6 bg-[#f4f5f7]/50 dark:bg-white/5 flex gap-3 border-t border-gray-100 dark:border-white/5">
                 <button onClick={() => setAddModalOpen(false)} className="px-6 py-4 font-bold text-muted-foreground bg-transparent hover:bg-gray-200 dark:hover:bg-white/10 rounded-2xl transition-all flex-1">Hủy thao tác</button>
                 <button onClick={() => {
                   setAddModalOpen(false);
                   toast.success("Tiếp nhận Hồ sơ thành công! Hệ thống đã gửi Email welcome.");
                 }} className="px-8 py-4 font-black text-white bg-primary rounded-2xl hover:bg-primary/90 hover:scale-[1.02] shadow-[0_10px_20px_-10px_rgba(0,0,0,0.5)] transition-all flex-[2]">Khởi tạo & Ghi danh</button>
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

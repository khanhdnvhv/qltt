import { ConfirmModal } from "./ConfirmModal";
import { TeacherPerformance } from "./TeacherPerformance";
import { useState, useMemo } from "react";
import { useDocumentTitle } from "../../utils/hooks";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Search, Plus, Star, BookOpen, Users, Clock, Award,
  MoreHorizontal, Mail, Phone, Calendar, MapPin, Edit,
  Trash2, Eye, LayoutGrid, List, ChevronDown, X, CheckCircle,
  TrendingUp, GraduationCap, MessageSquare, Briefcase, Zap, ShieldCheck
} from "lucide-react";

interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  levelScore: number;
  specializations: string[];
  classes: number;
  students: number;
  rating: number;
  reviewCount: number;
  experience: string;
  status: "active" | "onLeave" | "inactive";
  schedule: { day: string; time: string }[];
  joinDate: string;
  certifications: string[];
}

const mockTeachers: Teacher[] = [
  {
    id: "t1", name: "Nguyễn Thị Mai", email: "mai.nguyen@gdtx.edu.vn", phone: "0912 345 678",
    avatar: "NM", levelScore: 9, specializations: ["Tiếng Anh B1", "Giao tiếp"],
    classes: 6, students: 142, rating: 4.9, reviewCount: 287, experience: "7 năm",
    status: "active", schedule: [{ day: "T2-T4-T6", time: "08:00-10:00" }, { day: "T3-T5", time: "14:00-16:00" }],
    joinDate: "01/2020", certifications: ["Thạc sĩ Ngôn ngữ", "Nghiệp vụ Sư phạm"],
  },
  {
    id: "t2", name: "Trần Văn Hiếu", email: "hieu.tran@gdtx.edu.vn", phone: "0987 654 321",
    avatar: "TH", levelScore: 8, specializations: ["Tin học Cơ bản", "Lập trình Web"],
    classes: 5, students: 118, rating: 4.8, reviewCount: 205, experience: "5 năm",
    status: "active", schedule: [{ day: "T2-T4-T6", time: "10:00-12:00" }, { day: "T7", time: "09:00-12:00" }],
    joinDate: "06/2021", certifications: ["Cử nhân CNTT", "Chứng chỉ Kỹ năng nghề"],
  },
  {
    id: "t3", name: "Lý Quý", email: "quy.ly@gdtx.edu.vn", phone: "0901 234 567",
    avatar: "LQ", levelScore: 9, specializations: ["Hàn Điện", "Cơ khí"],
    classes: 8, students: 198, rating: 5.0, reviewCount: 412, experience: "15 năm",
    status: "active", schedule: [{ day: "T2-T6", time: "08:00-10:00" }, { day: "T3-T5", time: "18:00-20:00" }],
    joinDate: "03/2019", certifications: ["Bậc thợ 6/7", "Sư phạm Dạy nghề"],
  },
  {
    id: "t4", name: "Phạm Đức Minh", email: "minh.pham@gdtx.edu.vn", phone: "0976 543 210",
    avatar: "PM", levelScore: 7, specializations: ["Toán GDTX", "Lý GDTX"],
    classes: 4, students: 86, rating: 4.7, reviewCount: 143, experience: "3 năm",
    status: "active", schedule: [{ day: "T3-T5-T7", time: "14:00-16:00" }],
    joinDate: "09/2023", certifications: ["Cử nhân Sư phạm Toán"],
  },
  {
    id: "t5", name: "Đào Bếp", email: "bep.dao@gdtx.edu.vn", phone: "0945 678 901",
    avatar: "ĐB", levelScore: 8, specializations: ["Nấu ăn Á Âu", "Pha chế"],
    classes: 3, students: 72, rating: 4.6, reviewCount: 98, experience: "8 năm",
    status: "onLeave", schedule: [{ day: "T2-T4", time: "10:00-12:00" }],
    joinDate: "01/2022", certifications: ["Chứng chỉ Bếp Trưởng", "Sư phạm Dạy nghề"],
  },
];

const statusConfig = {
  active: { label: "Đang giảng dạy", color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" },
  onLeave: { label: "Nghỉ phép", color: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" },
  inactive: { label: "Ngừng hợp tác", color: "bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400" },
};

const avatarColors = [
  "from-primary to-accent",
  "from-blue-600 to-indigo-600",
  "from-emerald-500 to-teal-500",
  "from-purple-600 to-pink-600",
  "from-amber-500 to-orange-500",
  "from-cyan-600 to-blue-600",
];

export function AdminTeachers() {
  useDocumentTitle("Hồ sơ Giảng viên");
  const [teachers, setTeachers] = useState(mockTeachers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "calendar" | "performance">("grid");
  
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => teachers.filter((t) => {
    const matchSearch = !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      t.specializations.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  }), [teachers, search, statusFilter]);

  const totalStudents = teachers.reduce((s, t) => s + t.students, 0);
  const avgRating = (teachers.reduce((s, t) => s + t.rating, 0) / teachers.length).toFixed(1);

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col pt-2 pb-10">
      
      {/* Premium Header Banner */}
      <div className="relative mb-8 p-8 rounded-[2rem] overflow-hidden bg-[#1a1a2e] text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary opacity-30 rounded-full blur-[100px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-4 text-[13px] font-semibold tracking-wide">
               <ShieldCheck className="w-4 h-4 text-accent" />
               <span className="bg-gradient-to-r from-accent to-white bg-clip-text text-transparent">Hệ thống Quản trị Điểm trường</span>
            </div>
            <h1 className="text-[32px] md:text-[40px] font-black tracking-tight leading-tight mb-2">
              Kho Học liệu & Giảng viên
            </h1>
            <p className="text-white/70 text-[16px] max-w-xl font-medium">
              Quản lý chi tiết hồ sơ, năng lực chuyên môn, và phân bổ thời khóa biểu cho toàn bộ đội ngũ sư phạm nhà trường.
            </p>
          </div>
          
          <div className="flex gap-3">
             <button 
               onClick={() => setAddModalOpen(true)}
               className="flex items-center justify-center gap-2.5 bg-white text-[#1a1a2e] px-6 py-3.5 rounded-2xl text-[15px] font-bold shadow-[0_8px_30px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all duration-300"
             >
               <Plus className="w-5 h-5" />
               Tiếp nhận Giảng viên 
             </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Users, label: "Đang giảng dạy", value: teachers.filter((t) => t.status === "active").length, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
          { icon: BookOpen, label: "Số lớp phụ trách", value: teachers.reduce((s, t) => s + t.classes, 0), color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
          { icon: GraduationCap, label: "Tổng số Học viên", value: totalStudents.toLocaleString(), color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-500/10" },
          { icon: Star, label: "Trung bình Đánh giá", value: avgRating + " ★", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-card border border-gray-100 dark:border-white/5 rounded-[1.5rem] p-5 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] flex items-center gap-4">
             <div className={`w-12 h-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center shrink-0`}>
                <s.icon className="w-6 h-6" />
             </div>
             <div>
                <p className="text-[24px] font-black leading-tight text-foreground">{s.value}</p>
                <p className="text-[13px] font-bold text-muted-foreground">{s.label}</p>
             </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
         <div className="relative flex-1 group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
            <div className="relative flex items-center bg-white/80 dark:bg-card/80 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-2xl px-5 py-1 shadow-sm">
                <Search className="w-5 h-5 text-muted-foreground mr-3" />
                <input 
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Tìm kiếm Giảng viên, Email, Bộ môn..."
                  className="flex-1 bg-transparent border-none outline-none py-3 text-[15px] font-medium text-foreground placeholder:text-muted-foreground/60"
                />
            </div>
         </div>
         <div className="flex gap-3">
            <select
              value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white/80 dark:bg-card/80 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 text-foreground px-5 py-4 rounded-2xl text-[15px] font-bold outline-none cursor-pointer shadow-sm w-full lg:w-[200px]"
            >
              <option value="all">Mọi trạng thái</option>
              <option value="active">Đang giảng dạy</option>
              <option value="onLeave">Nghỉ phép</option>
              <option value="inactive">Ngừng hợp tác</option>
            </select>
            <div className="flex bg-white/80 dark:bg-card/80 backdrop-blur-xl rounded-2xl p-1.5 border border-gray-200/50 dark:border-white/10 shadow-sm shrink-0">
               {[
                 { mode: "grid", icon: LayoutGrid },
                 { mode: "list", icon: List },
                 { mode: "calendar", icon: Calendar },
                 { mode: "performance", icon: TrendingUp }
               ].map(btn => (
                 <button
                   key={btn.mode}
                   onClick={() => setViewMode(btn.mode as any)}
                   className={`p-2.5 rounded-xl transition-all ${viewMode === btn.mode ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:bg-gray-100 dark:hover:bg-white/5"}`}
                 >
                   <btn.icon className="w-5 h-5" />
                 </button>
               ))}
            </div>
         </div>
      </div>

      {/* Main Views */}
      <AnimatePresence mode="wait">
        <motion.div key={viewMode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
        
        {/* GRID VIEW */}
        {viewMode === "grid" && (
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((teacher, i) => (
                <div key={teacher.id} className="bg-white dark:bg-card rounded-[1.5rem] border border-gray-100 dark:border-white/5 p-6 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all group flex flex-col">
                   <div className="flex items-start justify-between mb-5">
                      <div className="flex gap-4 items-center">
                         <div className={`relative w-16 h-16 rounded-[1.25rem] bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white text-[22px] font-black shadow-lg`}>
                            {teacher.avatar}
                         </div>
                         <div>
                            <h3 onClick={() => { setSelectedTeacher(teacher); setDrawerOpen(true); }} className="text-[18px] font-black text-foreground hover:text-primary cursor-pointer transition-colors">{teacher.name}</h3>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold mt-1 ${statusConfig[teacher.status].color}`}>
                               {statusConfig[teacher.status].label}
                            </span>
                         </div>
                      </div>
                   </div>
                   
                   <div className="flex flex-wrap gap-1.5 mb-5">
                      {teacher.specializations.map(s => <span key={s} className="px-2.5 py-1 bg-[#f4f5f7] dark:bg-white/5 text-muted-foreground text-[12px] font-bold rounded-lg border border-gray-200/50 dark:border-white/10">{s}</span>)}
                   </div>

                   <div className="grid grid-cols-3 gap-2 mb-5">
                      <div className="bg-[#f8f9fb] dark:bg-white/5 rounded-xl p-2.5 text-center">
                         <div className="text-[16px] font-black text-primary">{teacher.levelScore}/10</div>
                         <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Bậc thợ/NL</div>
                      </div>
                      <div className="bg-[#f8f9fb] dark:bg-white/5 rounded-xl p-2.5 text-center">
                         <div className="text-[16px] font-black text-foreground">{teacher.classes}</div>
                         <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Lớp học</div>
                      </div>
                      <div className="bg-[#f8f9fb] dark:bg-white/5 rounded-xl p-2.5 text-center">
                         <div className="text-[16px] font-black text-amber-500 flex items-center justify-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-500"/> {teacher.rating}</div>
                         <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Đánh giá</div>
                      </div>
                   </div>

                   <div className="mt-auto flex gap-2">
                       <button onClick={() => { setSelectedTeacher(teacher); setDrawerOpen(true); }} className="flex-1 py-3 bg-[#f4f5f7] dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-foreground font-bold rounded-xl transition-colors">Hồ sơ chi tiết</button>
                       <button onClick={() => setDeletingId(teacher.id)} className="p-3 bg-red-50 text-red-500 dark:bg-red-500/10 hover:bg-red-100 rounded-xl transition-colors"><Trash2 className="w-5 h-5"/></button>
                   </div>
                </div>
              ))}
           </div>
        )}

        {/* LIST VIEW */}
        {viewMode === "list" && (
           <div className="bg-white dark:bg-card border border-gray-100 dark:border-white/5 rounded-[1.5rem] overflow-hidden shadow-sm">
             <table className="w-full text-left">
                <thead className="bg-[#f8f9fb] dark:bg-white/5 text-[13px] font-bold text-muted-foreground uppercase tracking-wider">
                   <tr>
                      <th className="p-5">Giảng viên</th>
                      <th className="p-5">Chuyên môn</th>
                      <th className="p-5 text-center">Năng lực</th>
                      <th className="p-5 text-center">Lớp / HV</th>
                      <th className="p-5 text-center">Hiệu suất</th>
                      <th className="p-5"></th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                   {filtered.map((teacher, i) => (
                      <tr key={teacher.id} className="hover:bg-[#f4f5f7]/50 dark:hover:bg-white/[0.02] transition-colors">
                         <td className="p-4">
                            <div className="flex gap-3 items-center">
                              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white text-[14px] font-black`}>{teacher.avatar}</div>
                              <div>
                                 <div className="font-bold text-[15px]">{teacher.name}</div>
                                 <div className="text-[12px] text-muted-foreground">{teacher.email}</div>
                              </div>
                            </div>
                         </td>
                         <td className="p-4">
                            <div className="flex gap-1 flex-wrap">
                               {teacher.specializations.slice(0,2).map(s => <span key={s} className="px-2 py-0.5 bg-gray-100 dark:bg-white/10 rounded text-[11px] font-bold">{s}</span>)}
                            </div>
                         </td>
                         <td className="p-4 text-center font-black text-primary">Bậc {teacher.levelScore}</td>
                         <td className="p-4 text-center font-bold text-foreground">{teacher.classes} <span className="text-muted-foreground font-medium text-[13px]">/ {teacher.students}</span></td>
                         <td className="p-4 text-center">
                             <span className="inline-flex items-center gap-1 font-bold text-amber-500"><Star className="w-3.5 h-3.5 fill-amber-500"/>{teacher.rating}</span>
                         </td>
                         <td className="p-4 text-right">
                            <button onClick={() => { setSelectedTeacher(teacher); setDrawerOpen(true); }} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"><Eye className="w-5 h-5 text-muted-foreground"/></button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
           </div>
        )}

        {/* CALENDAR & PERFORMANCE VIEWS remain standard components */}
        {viewMode === "performance" && <TeacherPerformance teachers={teachers} />}
        
        {/* Mock Calendar Grid */}
        {viewMode === "calendar" && (
           <div className="bg-white dark:bg-card border border-gray-100 dark:border-white/5 rounded-[2rem] shadow-sm overflow-hidden flex flex-col h-[600px] items-center justify-center text-center">
              <Calendar className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-[20px] font-black text-foreground">Lịch giảng dạy & Điều hành</h3>
              <p className="text-muted-foreground mt-2 max-w-sm">Chế độ này sẽ được đồng bộ trực tiếp từ phân hệ Lớp học ở phần Ma trận Thời Khóa Biểu.</p>
           </div>
        )}

        {filtered.length === 0 && (
           <div className="text-center py-20 bg-white dark:bg-card rounded-[2rem] border border-gray-100 dark:border-white/5">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4"><Search className="w-8 h-8 text-gray-300"/></div>
              <h3 className="text-[18px] font-black">Không tìm thấy giảng viên</h3>
           </div>
        )}

        </motion.div>
      </AnimatePresence>

      {/* TEACHER DRAWER */}
      <AnimatePresence>
        {drawerOpen && selectedTeacher && (
           <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[90] backdrop-blur-[4px]" onClick={() => setDrawerOpen(false)} />
            <motion.div
              initial={{ x: "100%", boxShadow: "0 0 0 rgba(0,0,0,0)" }} animate={{ x: 0, boxShadow: "-20px 0 50px rgba(0,0,0,0.15)" }} exit={{ x: "100%" }} transition={{ type: "spring", bounce: 0, duration: 0.5 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[500px] bg-white dark:bg-[#12121a] z-[100] flex flex-col overflow-hidden"
            >
               {/* Cover Image Area */}
               <div className="h-40 bg-[url('https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center relative border-b border-white/10">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <button onClick={() => setDrawerOpen(false)} className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-colors"><X className="w-4 h-4"/></button>
               </div>

               {/* Profile Offset */}
               <div className="px-8 relative pb-6 border-b border-gray-100 dark:border-white/5 flex gap-5 items-end -mt-12">
                  <div className={`w-28 h-28 rounded-[2rem] bg-gradient-to-br ${avatarColors[mockTeachers.indexOf(selectedTeacher) % avatarColors.length]} flex items-center justify-center text-white text-[40px] font-black shadow-xl ring-8 ring-white dark:ring-[#12121a] z-10`}>
                     {selectedTeacher.avatar}
                  </div>
                  <div className="pb-2">
                     <h2 className="text-[24px] font-black text-foreground">{selectedTeacher.name}</h2>
                     <p className={`inline-flex gap-1.5 text-[12px] font-bold px-2.5 py-0.5 rounded-full mt-1.5 ${statusConfig[selectedTeacher.status].color}`}><CheckCircle className="w-3.5 h-3.5"/>{statusConfig[selectedTeacher.status].label}</p>
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto p-8 space-y-6">
                  {/* Contact Info */}
                  <div className="bg-[#f4f5f7]/50 dark:bg-white/[0.02] rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
                     <div className="px-5 py-4 border-b border-gray-50 dark:border-white/5 flex justify-between">
                        <span className="text-[13px] font-bold text-muted-foreground flex items-center gap-2"><Mail className="w-4 h-4"/> Email</span>
                        <span className="text-[14px] font-bold">{selectedTeacher.email}</span>
                     </div>
                     <div className="px-5 py-4 border-b border-gray-50 dark:border-white/5 flex justify-between">
                        <span className="text-[13px] font-bold text-muted-foreground flex items-center gap-2"><Phone className="w-4 h-4"/> Điện thoại</span>
                        <span className="text-[14px] font-bold">{selectedTeacher.phone}</span>
                     </div>
                     <div className="px-5 py-4 flex justify-between">
                        <span className="text-[13px] font-bold text-muted-foreground flex items-center gap-2"><Briefcase className="w-4 h-4"/> Kinh nghiệm</span>
                        <span className="text-[14px] font-bold text-primary">{selectedTeacher.experience}</span>
                     </div>
                  </div>

                  {/* Skills / Certs */}
                  <div>
                     <h4 className="text-[14px] font-black text-foreground mb-3 uppercase tracking-wider">Chuyên môn & Chứng chỉ</h4>
                     <div className="flex flex-wrap gap-2 mb-4">
                        {selectedTeacher.specializations.map(s => <span key={s} className="px-3 py-1.5 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 font-bold text-[13px] rounded-lg border border-blue-100 dark:border-blue-500/20">{s}</span>)}
                     </div>
                     <div className="flex flex-wrap gap-2">
                        {selectedTeacher.certifications.map(c => <span key={c} className="px-3 py-1.5 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 font-bold text-[13px] rounded-lg border border-amber-100 dark:border-amber-500/20"><Award className="w-3.5 h-3.5 inline mr-1 -mt-0.5"/>{c}</span>)}
                     </div>
                  </div>

                  {/* Activity Stats */}
                  <div className="grid grid-cols-2 gap-3">
                     <div className="bg-white dark:bg-card border border-gray-100 dark:border-white/5 p-4 rounded-2xl text-center shadow-sm">
                        <div className="text-[24px] font-black text-primary">{selectedTeacher.classes}</div>
                        <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Lớp đang dạy</div>
                     </div>
                     <div className="bg-white dark:bg-card border border-gray-100 dark:border-white/5 p-4 rounded-2xl text-center shadow-sm">
                        <div className="text-[24px] font-black text-foreground">{selectedTeacher.students}</div>
                        <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Học viên</div>
                     </div>
                  </div>
               </div>
               
               <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-[#12121a] flex gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] shrink-0 z-50">
                  <button onClick={() => toast.success("Gửi yêu cầu đổi lịch thành công!")} className="flex-1 py-4 font-bold rounded-2xl bg-[#f4f5f7] dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-foreground transition-colors">Giao thêm Lớp</button>
                  <button onClick={() => setDrawerOpen(false)} className="flex-1 py-4 font-black rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl transition-all">Lưu Hồ sơ</button>
               </div>
            </motion.div>
           </>
        )}
      </AnimatePresence>

      {/* ADD TEACHER MODAL */}
      <AnimatePresence>
        {addModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setAddModalOpen(false)} />
             <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-2xl bg-white dark:bg-[#12121a] rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-white/5 text-foreground flex flex-col max-h-[90vh]">
               
               <div className="p-8 pb-4 shrink-0">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                     <GraduationCap className="w-8 h-8 text-primary" />
                  </div>
                 <h3 className="text-[28px] font-black tracking-tight mb-2">Tiếp nhận Giảng viên</h3>
                 <p className="text-muted-foreground text-[15px] font-medium leading-relaxed">Nhập thông tin nhân sự và thiết lập thông số năng lực giảng dạy.</p>
               </div>

               <div className="px-8 pb-8 flex-1 overflow-y-auto space-y-6">
                  <div>
                    <label className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Cơ sở Đào tạo phân bổ</label>
                    <select className="w-full appearance-none bg-[#f4f5f7] dark:bg-white/5 border border-transparent dark:border-white/5 px-5 py-4 rounded-2xl font-bold text-[15px] text-foreground outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer">
                      <option>Cơ sở 1 (Trung tâm Chính)</option>
                      <option>Cơ sở 2 (Khu Công nghệ Cao)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Họ và Tên</label>
                      <input placeholder="VD: Nguyễn Văn A" className="w-full bg-[#f4f5f7] dark:bg-white/5 border border-transparent dark:border-white/5 px-5 py-4 rounded-2xl font-bold text-[15px] outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground" />
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Email làm việc</label>
                      <input placeholder="VD: anva@gdtx.edu.vn" className="w-full bg-[#f4f5f7] dark:bg-white/5 border border-transparent dark:border-white/5 px-5 py-4 rounded-2xl font-bold text-[15px] outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                     <div className="col-span-2">
                        <label className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Chuyên môn (ngăn cách bởi dấu phẩy)</label>
                        <input placeholder="Hàn, Tiếng Anh giao tiếp..." className="w-full bg-[#f4f5f7] dark:bg-white/5 border border-transparent dark:border-white/5 px-5 py-3.5 rounded-2xl font-bold text-[15px] outline-none focus:ring-2 focus:ring-primary/50 text-foreground" />
                     </div>
                     <div>
                        <label className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Bậc NL (1-10)</label>
                        <input type="number" defaultValue={8} min={1} max={10} className="w-full bg-[#f4f5f7] dark:bg-white/5 border border-transparent dark:border-white/5 px-5 py-3.5 rounded-2xl font-black text-primary text-[15px] outline-none focus:ring-2 focus:ring-primary/50 text-foreground" />
                     </div>
                  </div>
               </div>

               <div className="p-6 bg-[#f4f5f7]/50 dark:bg-white/5 flex gap-3 border-t border-gray-100 dark:border-white/5 shrink-0">
                 <button onClick={() => setAddModalOpen(false)} className="px-6 py-4 font-bold text-muted-foreground bg-transparent hover:bg-gray-200 dark:hover:bg-white/10 rounded-2xl transition-all flex-1">Hủy thao tác</button>
                 <button onClick={() => {
                   setAddModalOpen(false);
                   toast.success("Tiếp nhận giảng viên Mới thành công!");
                 }} className="px-8 py-4 font-black text-white bg-primary rounded-2xl hover:bg-primary/90 hover:scale-[1.02] shadow-[0_10px_20px_-10px_rgba(0,0,0,0.5)] transition-all flex-[2]">Thêm Giảng viên</button>
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        open={!!deletingId} onClose={() => setDeletingId(null)}
        onConfirm={() => { setTeachers(prev => prev.filter(t => t.id !== deletingId)); setDeletingId(null); toast.success("Đã xóa hồ sơ giảng viên"); }}
        title="Xóa hồ sơ" description="Bạn chắc chắn muốn xóa hồ sơ giảng viên này khỏi hệ thống?" confirmLabel="Chấp nhận" variant="danger"
      />
    </div>
  );
}

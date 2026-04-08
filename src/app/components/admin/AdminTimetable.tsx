import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, Clock, MapPin, User, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";

const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"];
const times = ["07:00", "09:00", "13:00", "15:00", "18:00", "20:00"];

interface ScheduleBlock {
  id: string;
  subject: string;
  teacher: string;
  room: string;
  dayIdx: number;
  timeIdx: number; // For simplicity we map to index
  duration: number; // in slots (hours)
  type: "theory" | "practice" | "exam";
}

const mockSchedule: ScheduleBlock[] = [
  { id: "S1", subject: "Lý thuyết Hàn TIG", teacher: "GV. Trần Hữu A", room: "P.201", dayIdx: 0, timeIdx: 0, duration: 2, type: "theory" },
  { id: "S2", subject: "Thực hành Hàn 3G", teacher: "GV. Lê Văn B", room: "Xưởng Cơ khí 1", dayIdx: 0, timeIdx: 2, duration: 3, type: "practice" },
  { id: "S3", subject: "Reading TOEIC 600", teacher: "GV. Anna Smith", room: "P.305 Lab", dayIdx: 1, timeIdx: 4, duration: 2, type: "practice" },
  { id: "S4", subject: "Thi giữa kỳ Word", teacher: "Trưởng Cơ sở", room: "P.Tin học 2", dayIdx: 2, timeIdx: 2, duration: 1, type: "exam" },
  { id: "S5", subject: "Lập trình C++ Cơ bản", teacher: "GV. Nguyễn T. C", room: "P.Máy 1", dayIdx: 4, timeIdx: 1, duration: 2, type: "theory" },
];

export function AdminTimetable() {
  const [currentWeek, setCurrentWeek] = useState("Tuần 3 - Tháng 8/2026");

  return (
    <div className="flex-1 pb-10 flex flex-col h-[calc(100vh-100px)]">
       <div className="flex flex-col md:flex-row justify-between gap-4 mb-4 flex-shrink-0">
          <div>
             <h1 className="text-[26px] font-black text-[#1a1a2e] dark:text-foreground tracking-tight">Thời khóa biểu (Calendar Matrix)</h1>
             <p className="text-[15px] text-muted-foreground mt-1">Điều phối phòng học, ca học và lịch giảng dạy Giáo viên phân bổ.</p>
          </div>
          <div className="flex items-center gap-3 self-start">
             <button className="p-2 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-muted-foreground hover:text-foreground">
                <Filter className="w-5 h-5"/>
             </button>
             <button onClick={() => toast.success("Đã Lưu dữ liệu cập nhật Lịch...")} className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-[14.5px] shadow-sm hover:opacity-90 transition-all font-bold">
                <CheckCircle2 className="w-4 h-4"/> Lưu Tiến độ
             </button>
          </div>
       </div>

       {/* Toolbar */}
       <div className="flex items-center justify-between bg-white dark:bg-card p-2 rounded-2xl border border-gray-100 dark:border-border mb-4 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-2">
             <button onClick={()=>toast.info("Đổi tuần trước")} className="p-2 bg-gray-100 dark:bg-white/10 rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition-all"><ChevronLeft className="w-4 h-4"/></button>
             <div className="flex items-center gap-2 px-4 font-bold text-[15px] text-[#1a1a2e] dark:text-foreground">
                <CalendarIcon className="w-4 h-4 text-primary"/> {currentWeek}
             </div>
             <button onClick={()=>toast.info("Đổi tuần sau")} className="p-2 bg-gray-100 dark:bg-white/10 rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition-all"><ChevronRight className="w-4 h-4"/></button>
          </div>
          <div className="flex items-center gap-2">
             <span className="flex items-center gap-1.5 text-[12px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded"><div className="w-2 h-2 rounded-full bg-blue-500"/> Lý thuyết</span>
             <span className="flex items-center gap-1.5 text-[12px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded"><div className="w-2 h-2 rounded-full bg-emerald-500"/> Thực hành/Lab</span>
             <span className="flex items-center gap-1.5 text-[12px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded"><div className="w-2 h-2 rounded-full bg-rose-500"/> Kiểm tra/Thi</span>
          </div>
       </div>

       {/* Calendar Matrix */}
       <div className="flex-1 bg-white dark:bg-card border border-gray-100 dark:border-border rounded-3xl overflow-hidden shadow-sm flex flex-col min-h-0">
          <div className="overflow-x-auto flex-1 flex flex-col min-w-0">
          {/* Header Row */}
          <div className="grid grid-cols-8 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 shrink-0 min-w-[640px]">
             <div className="p-4 border-r border-gray-100 dark:border-white/5 flex items-center justify-center">
                <Clock className="w-5 h-5 text-muted-foreground"/>
             </div>
             {days.map((day, i) => (
                <div key={day} className="p-3 border-r border-gray-100 dark:border-white/5 text-center">
                   <p className="text-[13px] text-muted-foreground font-semibold mb-0.5">{day}</p>
                   <p className="text-[18px] font-black text-[#1a1a2e] dark:text-foreground">{18 + i}</p>
                </div>
             ))}
          </div>

          {/* Time Slots Area */}
          <div className="flex-1 overflow-y-auto">
             {times.map((time, tIdx) => (
                <div key={time} className="grid grid-cols-8 min-h-[140px] border-b border-gray-100 dark:border-white/5 group min-w-[640px]">
                   {/* Timeline Column */}
                   <div className="border-r border-gray-100 dark:border-white/5 p-3 flex flex-col items-center border-dashed">
                      <span className="text-[14px] font-bold text-gray-400 dark:text-gray-500">{time}</span>
                   </div>
                   
                   {/* Days Columns */}
                   {days.map((d, dIdx) => {
                      // Check if there is block here
                      const block = mockSchedule.find(s => s.dayIdx === dIdx && s.timeIdx === tIdx);
                      return (
                         <div key={dIdx} className="border-r border-gray-100 dark:border-white/5 border-dashed p-1.5 relative transition-colors hover:bg-gray-50 dark:hover:bg-white/5">
                            {block && (
                               <motion.div 
                                 initial={{ opacity: 0, y: 5 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 className={`absolute top-2 left-2 right-2 p-3 rounded-2xl border cursor-pointer hover:shadow-lg transition-all z-10 ${
                                   block.type === 'theory' ? 'bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/30' :
                                   block.type === 'practice' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30' :
                                   'bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/30'
                                 }`}
                                 style={{ height: `calc(${block.duration * 100}% - 16px)`}}
                               >
                                  <p className={`text-[13.5px] font-black mb-1.5 leading-tight ${
                                    block.type === 'theory' ? 'text-blue-900 dark:text-blue-100' :
                                    block.type === 'practice' ? 'text-emerald-900 dark:text-emerald-100' :
                                    'text-rose-900 dark:text-rose-100'
                                  }`}>{block.subject}</p>
                                  
                                  <div className="space-y-1 mt-auto absolute bottom-3 w-[calc(100%-24px)]">
                                     <div className={`flex items-center gap-1.5 text-[11px] font-bold px-2 py-1 rounded bg-white/60 dark:bg-black/20 ${block.type==='theory'?'text-blue-700 dark:text-blue-300':block.type==='practice'?'text-emerald-700 dark:text-emerald-300':'text-rose-700 dark:text-rose-300'}`}>
                                        <MapPin className="w-3 h-3"/> {block.room}
                                     </div>
                                     <div className={`flex items-center gap-1.5 text-[11px] font-bold px-2 py-1 rounded bg-white/60 dark:bg-black/20 ${block.type==='theory'?'text-blue-700 dark:text-blue-300':block.type==='practice'?'text-emerald-700 dark:text-emerald-300':'text-rose-700 dark:text-rose-300'}`}>
                                        <User className="w-3 h-3"/> {block.teacher}
                                     </div>
                                  </div>
                               </motion.div>
                            )}
                         </div>
                      );
                   })}
                </div>
             ))}
          </div>
          </div>{/* /overflow-x-auto */}
       </div>
    </div>
  )
}

import { useState } from "react";
import { Search, Plus, Save, ChevronLeft, LayoutPanelLeft, List, CheckCircle2, ChevronDown, Check, MoreVertical, Trash2 } from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";
import { HighlightText } from "../ui/HighlightText";

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  content: string;
  type: "single" | "multiple";
  level: "Dễ" | "Trung bình" | "Khó";
  options: Option[];
}

const mockQuestions: Question[] = Array.from({ length: 15 }).map((_, i) => ({
  id: `Q-${100 + i}`,
  content: ["Trong ngôn ngữ C#, từ khóa nào dùng để khai báo một lớp kế thừa từ một lớp khác?", "Hàm VLOOKUP trong Excel thường được sử dụng nhằm mục đích gì?", "Nút lệnh tắt máy khẩn cấp của thang máy nằm ở đâu?"][i % 3],
  type: "single",
  level: ["Dễ", "Trung bình", "Khó"][i % 3] as any,
  options: [
    { id: "A", text: "Answer A (Correct)", isCorrect: true },
    { id: "B", text: "Answer B", isCorrect: false },
    { id: "C", text: "Answer C", isCorrect: false },
    { id: "D", text: "Answer D", isCorrect: false }
  ]
}));

export function AdminQuestions() {
  const [activeQId, setActiveQId] = useState<string>(mockQuestions[0].id);
  const [search, setSearch] = useState("");

  const activeQuestion = mockQuestions.find(q => q.id === activeQId) || mockQuestions[0];
  const filtered = mockQuestions.filter(q => q.content.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex-1 flex flex-col pb-0 h-[calc(100vh-140px)] -mx-6 -my-8 px-6 py-8 relative">
       <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-4">
             <Link to="/admin/question-bank" className="p-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 rounded-xl transition-all">
                <ChevronLeft className="w-5 h-5" />
             </Link>
             <div>
                <h1 className="text-[22px] font-black text-[#1a1a2e] dark:text-foreground tracking-tight line-clamp-1 max-w-[600px]">Bộ Đề Tin học MOS 2026</h1>
                <p className="text-[14px] text-muted-foreground mt-0.5">Soạn thảo và chi tiết hóa nội dung câu hỏi trắc nghiệm (Q&A).</p>
             </div>
          </div>
          <button onClick={() => toast.success("Đang lưu Data lên Server...")} className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl text-[14.5px] shadow-sm hover:opacity-90 transition-all font-bold">
             <Save className="w-4 h-4"/> Lưu Bộ Đề
          </button>
       </div>

       {/* Split pane Workspace */}
       <div className="flex-1 flex gap-4 min-h-0 bg-white dark:bg-card border border-gray-100 dark:border-border rounded-3xl p-2 shadow-sm overflow-hidden">
          {/* Left: List Panel */}
          <div className="w-[35%] flex flex-col border-r border-gray-100 dark:border-border">
             <div className="p-3">
                <div className="relative mb-3">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                   <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm câu hỏi..." className="w-full bg-[#f4f5f7] dark:bg-black/20 focus:border-primary/50 transition-colors border-transparent border pl-9 pr-4 py-2.5 rounded-xl text-[14px] outline-none font-medium" />
                </div>
                <button onClick={() => toast.success("Tạo câu hỏi mới...")} className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-primary/40 text-primary rounded-xl font-bold bg-primary/5 hover:bg-primary/10 transition-colors">
                   <Plus className="w-5 h-5"/> Soạn thêm Câu Hỏi Trắc Nghiệm Mới
                </button>
             </div>
             
             <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-4">
                {filtered.map((q, idx) => (
                   <button 
                     key={q.id} 
                     onClick={() => setActiveQId(q.id)}
                     className={`w-full text-left p-3 rounded-xl transition-all border ${activeQId === q.id ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/20 shadow-sm' : 'border-transparent hover:bg-gray-50 dark:hover:bg-white/5'}`}
                   >
                     <div className="flex justify-between items-start mb-1">
                        <span className={`text-[12px] font-bold px-2 py-0.5 rounded ${activeQId===q.id ? 'bg-indigo-200 text-indigo-700 dark:bg-indigo-500/30' : 'bg-gray-200 text-gray-700 dark:bg-white/10 dark:text-gray-300'}`}>Câu {idx + 1}</span>
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase">{q.level}</span>
                     </div>
                     <HighlightText text={q.content} query={search} className={`text-[14px] line-clamp-2 leading-snug font-medium ${activeQId===q.id ? 'text-indigo-900 dark:text-indigo-100' : 'text-[#1a1a2e] dark:text-foreground'}`} />
                   </button>
                ))}
             </div>
          </div>

          {/* Right: Editor Panel */}
          <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-gray-50/50 dark:bg-transparent">
             <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-[15px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Mã câu hỏi: {activeQuestion.id}</h2>
                  <div className="flex items-center gap-3">
                     <span className="text-[14px] font-semibold text-[#1a1a2e] dark:text-gray-200 flex items-center gap-1.5"><LayoutPanelLeft className="w-4 h-4 text-primary"/> Câu hỏi nhiều Option (Multiple Choice)</span>
                  </div>
                </div>
                <button className="p-2 text-muted-foreground hover:bg-white dark:hover:bg-white/10 rounded-lg shadow-sm border border-gray-200 dark:border-transparent">
                   <MoreVertical className="w-5 h-5"/>
                </button>
             </div>

             <div className="space-y-6 max-w-3xl">
                <div>
                   <label className="block text-[15px] font-bold text-[#1a1a2e] dark:text-foreground mb-2">Nội dung câu hỏi (Đề dẫn) <span className="text-rose-500">*</span></label>
                   <textarea 
                     defaultValue={activeQuestion.content} 
                     className="w-full h-28 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-primary/50 px-5 py-4 rounded-2xl text-[16px] outline-none transition-all font-semibold resize-none shadow-[0_2px_10px_rgba(0,0,0,0.02)]" 
                   />
                </div>

                <div>
                   <label className="block text-[15px] font-bold text-[#1a1a2e] dark:text-foreground mb-3 flex items-center justify-between">
                     Các phương án đáp án (Tích chọn câu đúng)
                     <button className="text-[13px] text-primary hover:underline font-bold flex items-center gap-1">Đổi thành Multiple Answers <ChevronDown className="w-3 h-3"/></button>
                   </label>
                   
                   <div className="space-y-3">
                      {activeQuestion.options.map((opt, i) => (
                         <div key={opt.id} className={`flex items-center gap-3 p-2 pr-4 rounded-2xl border-2 transition-all ${opt.isCorrect ? 'bg-emerald-50/50 border-emerald-400 dark:bg-emerald-500/10' : 'bg-white border-gray-100 dark:bg-black/20 dark:border-white/5'}`}>
                            <button className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-[14px] border-2 transition-all ${opt.isCorrect ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 text-gray-500 hover:border-emerald-400'}`}>
                               {opt.isCorrect ? <Check className="w-4 h-4"/> : ["A","B","C","D","E","F"][i]}
                            </button>
                            <input defaultValue={opt.text} placeholder="Nhập đáp án..." className="flex-1 bg-transparent text-[15.5px] font-medium outline-none text-[#1a1a2e] dark:text-foreground placeholder:text-muted-foreground/50" />
                            <button className="p-2 text-gray-400 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4"/></button>
                         </div>
                      ))}
                      <button className="w-full flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 text-muted-foreground rounded-2xl font-bold hover:border-primary hover:text-primary transition-all">
                         <Plus className="w-4 h-4"/> Thêm phương án nhiễu
                      </button>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-white/5">
                   <div>
                      <label className="block text-[13.5px] font-bold text-muted-foreground mb-1.5">Mức độ nhận thức</label>
                      <select defaultValue={activeQuestion.level} className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 px-4 py-2.5 rounded-xl text-[14.5px] font-bold outline-none cursor-pointer">
                         <option>Dễ (Nhận biết)</option>
                         <option>Trung bình (Thông hiểu)</option>
                         <option>Khó (Vận dụng)</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-[13.5px] font-bold text-muted-foreground mb-1.5">Gắn Tag Chủ đề / Kiến thức</label>
                      <input placeholder="VD: Excel, C++, Nghề Khách sạn..." className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 px-4 py-2.5 rounded-xl text-[14.5px] font-medium outline-none" />
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  )
}

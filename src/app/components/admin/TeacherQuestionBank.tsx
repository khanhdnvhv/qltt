import { useDocumentTitle } from "../../utils/hooks";
import { useState, useMemo } from "react";
import { Plus, Search, Edit2, Trash2, Eye, ChevronDown, BookOpen, CheckCircle, XCircle, X } from "lucide-react";
import { toast } from "sonner";

type Difficulty = "easy" | "medium" | "hard";
type Skill = "listening" | "reading" | "grammar" | "vocabulary" | "writing";

interface Question {
  id: string;
  code: string;
  skill: Skill;
  difficulty: Difficulty;
  content: string;
  options: string[];
  answer: number; // index of correct option
  topic: string;
  usedInExams: number;
  createdAt: string;
}

const skillCfg: Record<Skill, { label: string; bg: string; text: string }> = {
  listening:   { label: "Nghe",    bg: "bg-blue-100 dark:bg-blue-500/20",    text: "text-blue-700 dark:text-blue-400"    },
  reading:     { label: "Đọc",     bg: "bg-emerald-100 dark:bg-emerald-500/20", text: "text-emerald-700 dark:text-emerald-400" },
  grammar:     { label: "Ngữ pháp",bg: "bg-violet-100 dark:bg-violet-500/20",text: "text-violet-700 dark:text-violet-400" },
  vocabulary:  { label: "Từ vựng", bg: "bg-amber-100 dark:bg-amber-500/20",  text: "text-amber-700 dark:text-amber-400"  },
  writing:     { label: "Viết",    bg: "bg-rose-100 dark:bg-rose-500/20",    text: "text-rose-700 dark:text-rose-400"    },
};

const diffCfg: Record<Difficulty, { label: string; color: string }> = {
  easy:   { label: "Dễ",    color: "text-emerald-600" },
  medium: { label: "Trung bình", color: "text-amber-600" },
  hard:   { label: "Khó",   color: "text-rose-600" },
};

const mockQuestions: Question[] = [
  { id: "Q01", code: "Q-2026-001", skill: "grammar",    difficulty: "easy",   content: "Choose the correct form: She ___ to school every day.", options: ["go", "goes", "going", "gone"], answer: 1, topic: "Simple Present", usedInExams: 3, createdAt: "10/01/2026" },
  { id: "Q02", code: "Q-2026-002", skill: "vocabulary", difficulty: "medium", content: "Choose the word closest in meaning to 'abundant'.", options: ["scarce", "plentiful", "ordinary", "expensive"], answer: 1, topic: "Synonyms", usedInExams: 2, createdAt: "12/01/2026" },
  { id: "Q03", code: "Q-2026-003", skill: "reading",    difficulty: "medium", content: "Read the passage: 'Vietnam is a country...'. What is the main topic?", options: ["Geography", "History", "Culture", "Economy"], answer: 2, topic: "Reading Comprehension", usedInExams: 5, createdAt: "15/01/2026" },
  { id: "Q04", code: "Q-2026-004", skill: "grammar",    difficulty: "hard",   content: "If I ___ you, I would study harder for the exam.", options: ["am", "was", "were", "be"], answer: 2, topic: "Conditionals", usedInExams: 4, createdAt: "18/01/2026" },
  { id: "Q05", code: "Q-2026-005", skill: "listening",  difficulty: "medium", content: "[Audio] The speaker is talking about...", options: ["weekend plans", "a job interview", "travel advice", "a restaurant review"], answer: 1, topic: "Short Conversations", usedInExams: 6, createdAt: "20/01/2026" },
  { id: "Q06", code: "Q-2026-006", skill: "vocabulary", difficulty: "easy",   content: "What does 'rapidly' mean?", options: ["slowly", "quickly", "quietly", "loudly"], answer: 1, topic: "Adverbs", usedInExams: 2, createdAt: "22/01/2026" },
  { id: "Q07", code: "Q-2026-007", skill: "grammar",    difficulty: "medium", content: "Choose the correct passive form: The letter ___ yesterday.", options: ["sent", "was sent", "is sent", "has sent"], answer: 1, topic: "Passive Voice", usedInExams: 7, createdAt: "25/01/2026" },
  { id: "Q08", code: "Q-2026-008", skill: "reading",    difficulty: "hard",   content: "According to the text, which of the following best describes the author's attitude?", options: ["Critical", "Optimistic", "Neutral", "Pessimistic"], answer: 1, topic: "Author's Purpose", usedInExams: 3, createdAt: "28/01/2026" },
  { id: "Q09", code: "Q-2026-009", skill: "listening",  difficulty: "easy",   content: "[Audio] What time does the flight depart?", options: ["7:00 AM", "8:30 AM", "9:00 AM", "10:15 AM"], answer: 2, topic: "Announcements", usedInExams: 4, createdAt: "02/02/2026" },
  { id: "Q10", code: "Q-2026-010", skill: "grammar",    difficulty: "easy",   content: "Choose the correct article: ___ apple a day keeps the doctor away.", options: ["A", "An", "The", "—"], answer: 1, topic: "Articles", usedInExams: 1, createdAt: "05/02/2026" },
];

export function TeacherQuestionBank() {
  useDocumentTitle("Ngân hàng câu hỏi");
  const [questions, setQuestions] = useState(mockQuestions);
  const [search, setSearch] = useState("");
  const [filterSkill, setFilterSkill] = useState<Skill | "all">("all");
  const [filterDiff, setFilterDiff] = useState<Difficulty | "all">("all");
  const [preview, setPreview] = useState<Question | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() =>
    questions.filter(q =>
      (filterSkill === "all" || q.skill === filterSkill) &&
      (filterDiff === "all" || q.difficulty === filterDiff) &&
      (!search || q.content.toLowerCase().includes(search.toLowerCase()) || q.topic.toLowerCase().includes(search.toLowerCase()))
    ), [questions, filterSkill, filterDiff, search]);

  const handleDelete = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
    setDeleteId(null);
    toast.success("Đã xóa câu hỏi");
  };

  return (
    <div className="pb-10">
      <div className="relative mb-6 p-6 rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-600 to-cyan-700 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: "28px 28px" }} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-emerald-200 text-[13px] font-semibold mb-1 uppercase">Cổng Giáo viên</p>
            <h1 className="text-[24px] font-extrabold">Ngân hàng câu hỏi</h1>
            <p className="text-emerald-100/70 text-[14px] mt-1">Quản lý và soạn thảo câu hỏi thi theo kỹ năng</p>
          </div>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl text-[14px] font-semibold transition-colors">
            <Plus className="w-4 h-4" /> Thêm câu hỏi
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {(Object.entries(skillCfg) as [Skill, typeof skillCfg[Skill]][]).map(([skill, cfg]) => {
          const count = questions.filter(q => q.skill === skill).length;
          return (
            <div key={skill} onClick={() => setFilterSkill(filterSkill === skill ? "all" : skill)}
              className={`bg-white dark:bg-card border rounded-2xl p-3 text-center cursor-pointer transition-all ${filterSkill === skill ? "border-emerald-400 shadow-md" : "border-gray-100 dark:border-border hover:shadow"}`}>
              <p className="text-[22px] font-extrabold text-emerald-600">{count}</p>
              <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm câu hỏi hoặc chủ đề..." className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-card text-[14px] outline-none" />
        </div>
        <select value={filterDiff} onChange={e => setFilterDiff(e.target.value as typeof filterDiff)} className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-card text-[14px] outline-none">
          <option value="all">Tất cả độ khó</option>
          <option value="easy">Dễ</option>
          <option value="medium">Trung bình</option>
          <option value="hard">Khó</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[14px] min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-border bg-gray-50/50 dark:bg-white/[0.02]">
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground text-[12px] uppercase">Mã</th>
                <th className="px-5 py-3 text-left font-semibold text-muted-foreground text-[12px] uppercase">Nội dung</th>
                <th className="px-3 py-3 text-center font-semibold text-muted-foreground text-[12px] uppercase">Kỹ năng</th>
                <th className="px-3 py-3 text-center font-semibold text-muted-foreground text-[12px] uppercase">Độ khó</th>
                <th className="px-3 py-3 text-center font-semibold text-muted-foreground text-[12px] uppercase">Chủ đề</th>
                <th className="px-3 py-3 text-center font-semibold text-muted-foreground text-[12px] uppercase">Dùng</th>
                <th className="px-3 py-3 text-center font-semibold text-muted-foreground text-[12px] uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/[0.03]">
              {filtered.map(q => {
                const sk = skillCfg[q.skill];
                const df = diffCfg[q.difficulty];
                return (
                  <tr key={q.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                    <td className="px-5 py-3 font-mono text-[12px] text-muted-foreground">{q.code}</td>
                    <td className="px-5 py-3 max-w-xs">
                      <p className="truncate font-medium text-[#1a1a2e] dark:text-foreground">{q.content}</p>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${sk.bg} ${sk.text}`}>{sk.label}</span>
                    </td>
                    <td className={`px-3 py-3 text-center text-[13px] font-bold ${df.color}`}>{df.label}</td>
                    <td className="px-3 py-3 text-center text-[12px] text-muted-foreground">{q.topic}</td>
                    <td className="px-3 py-3 text-center text-[13px] font-semibold text-muted-foreground">{q.usedInExams}x</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setPreview(q)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-muted-foreground hover:text-blue-600 transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                        <button className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-500/10 text-muted-foreground hover:text-amber-600 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteId(q.id)} className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 dark:border-border text-[13px] text-muted-foreground">
          Hiển thị {filtered.length} / {questions.length} câu hỏi
        </div>
      </div>

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="bg-white dark:bg-card rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[16px]">Xem câu hỏi</h3>
              <button onClick={() => setPreview(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex gap-2 mb-4">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${skillCfg[preview.skill].bg} ${skillCfg[preview.skill].text}`}>{skillCfg[preview.skill].label}</span>
              <span className={`text-[11px] font-semibold ${diffCfg[preview.difficulty].color}`}>{diffCfg[preview.difficulty].label}</span>
              <span className="text-[11px] text-muted-foreground">• {preview.topic}</span>
            </div>
            <p className="font-semibold text-[15px] mb-4 text-[#1a1a2e] dark:text-foreground">{preview.content}</p>
            <div className="space-y-2">
              {preview.options.map((opt, i) => (
                <div key={i} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all ${i === preview.answer ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10" : "border-gray-200 dark:border-border"}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 ${i === preview.answer ? "bg-emerald-500 text-white" : "bg-gray-100 dark:bg-white/10 text-muted-foreground"}`}>{String.fromCharCode(65 + i)}</span>
                  <span className="text-[14px]">{opt}</span>
                  {i === preview.answer && <CheckCircle className="w-4 h-4 text-emerald-500 ml-auto" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDeleteId(null)}>
          <div className="bg-white dark:bg-card rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <XCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <h3 className="text-center font-bold text-[16px] mb-2">Xóa câu hỏi?</h3>
            <p className="text-center text-muted-foreground text-[14px] mb-5">Hành động này không thể hoàn tác.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-border rounded-xl text-[14px] font-semibold hover:bg-gray-50">Hủy</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[14px] font-semibold">Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* Add modal placeholder */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white dark:bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[18px]">Thêm câu hỏi mới</h3>
              <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-semibold mb-1">Kỹ năng</label>
                  <select className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none">
                    {Object.entries(skillCfg).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold mb-1">Độ khó</label>
                  <select className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none">
                    <option value="easy">Dễ</option>
                    <option value="medium">Trung bình</option>
                    <option value="hard">Khó</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-semibold mb-1">Nội dung câu hỏi</label>
                <textarea rows={3} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none resize-none" placeholder="Nhập nội dung câu hỏi..." />
              </div>
              {["A", "B", "C", "D"].map(l => (
                <div key={l}>
                  <label className="block text-[13px] font-semibold mb-1">Đáp án {l}</label>
                  <input type="text" className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" placeholder={`Nhập đáp án ${l}...`} />
                </div>
              ))}
              <div>
                <label className="block text-[13px] font-semibold mb-1">Đáp án đúng</label>
                <select className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none">
                  <option value="0">A</option>
                  <option value="1">B</option>
                  <option value="2">C</option>
                  <option value="3">D</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-border rounded-xl text-[14px] font-semibold hover:bg-gray-50">Hủy</button>
              <button onClick={() => { setShowAdd(false); toast.success("Đã thêm câu hỏi mới"); }} className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[14px] font-semibold">Lưu câu hỏi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

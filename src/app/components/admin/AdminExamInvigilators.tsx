import { useState, useMemo } from "react";
import { useDocumentTitle, useEscapeKey } from "../../utils/hooks";
import { AnimatePresence, motion } from "motion/react";
import {
  Search, Plus, X, UserCheck, AlertTriangle, CalendarDays, Clock,
  MapPin, CheckCircle, Trash2, Users, Shield
} from "lucide-react";
import { toast } from "sonner";

interface Invigilator {
  id: string;
  teacherName: string;
  teacherCode: string;
  examName: string;
  examCode: string;
  room: string;
  date: string;
  shift: string;
  subject: string;
  role: "Giám thị 1" | "Giám thị 2" | "Giám thị Dự phòng";
  hasConflict: boolean;
  conflictNote?: string;
  status: "assigned" | "confirmed" | "replaced";
}

const invigilators: Invigilator[] = [
  { id: "1", teacherCode: "GV-001", teacherName: "Nguyễn Văn Đức", examCode: "KT-26-001", examName: "Tiếng Anh B1 VSTEP Q1/2026", room: "Phòng A101", date: "15/03/2026", shift: "Sáng (7:30-11:30)", subject: "Tiếng Anh", role: "Giám thị 1", hasConflict: false, status: "confirmed" },
  { id: "2", teacherCode: "GV-003", teacherName: "Trần Thị Lan", examCode: "KT-26-001", examName: "Tiếng Anh B1 VSTEP Q1/2026", room: "Phòng A101", date: "15/03/2026", shift: "Sáng (7:30-11:30)", subject: "Tiếng Anh", role: "Giám thị 2", hasConflict: false, status: "confirmed" },
  { id: "3", teacherCode: "GV-005", teacherName: "Lê Minh Hoàng", examCode: "KT-26-001", examName: "Tiếng Anh B1 VSTEP Q1/2026", room: "Phòng A102", date: "15/03/2026", shift: "Chiều (13:00-17:00)", subject: "Tiếng Anh", role: "Giám thị 1", hasConflict: false, status: "assigned" },
  { id: "4", teacherCode: "GV-002", teacherName: "Phạm Xuân Bình", examCode: "KT-26-001", examName: "Tiếng Anh B1 VSTEP Q1/2026", room: "Phòng A102", date: "15/03/2026", shift: "Chiều (13:00-17:00)", subject: "Tiếng Anh", role: "Giám thị 2", hasConflict: true, conflictNote: "Trùng với lớp Tiếng Anh TOEIC 15:00-17:00", status: "assigned" },
  { id: "5", teacherCode: "GV-004", teacherName: "Hoàng Thu Hà", examCode: "KT-26-002", examName: "Tin học IC3 Tháng 2", room: "Phòng máy Lab-1", date: "20/02/2026", shift: "Sáng (7:30-11:30)", subject: "Tin học", role: "Giám thị 1", hasConflict: false, status: "confirmed" },
  { id: "6", teacherCode: "GV-006", teacherName: "Vũ Ngọc Ánh", examCode: "KT-26-002", examName: "Tin học IC3 Tháng 2", room: "Phòng máy Lab-1", date: "20/02/2026", shift: "Sáng (7:30-11:30)", subject: "Tin học", role: "Giám thị 2", hasConflict: false, status: "confirmed" },
  { id: "7", teacherCode: "GV-007", teacherName: "Trần Văn Khánh", examCode: "KT-26-003", examName: "Hàn Điện Giữa kỳ", room: "Xưởng Hàn S01", date: "28/02/2026", shift: "Sáng (7:30-11:30)", subject: "Hàn Điện", role: "Giám thị 1", hasConflict: false, status: "confirmed" },
  { id: "8", teacherCode: "GV-008", teacherName: "Nguyễn Thị Mai", examCode: "KT-26-004", examName: "TOEIC 450 Tháng 3", room: "Phòng B201", date: "22/03/2026", shift: "Sáng (7:30-11:30)", subject: "Tiếng Anh TOEIC", role: "Giám thị 1", hasConflict: false, status: "assigned" },
  { id: "9", teacherCode: "GV-009", teacherName: "Đỗ Thanh Bình", examCode: "KT-26-004", examName: "TOEIC 450 Tháng 3", room: "Phòng B202", date: "22/03/2026", shift: "Chiều (13:00-17:00)", subject: "Tiếng Anh TOEIC", role: "Giám thị 1", hasConflict: false, status: "assigned" },
];

const teachers = [
  { code: "GV-001", name: "Nguyễn Văn Đức" },
  { code: "GV-002", name: "Phạm Xuân Bình" },
  { code: "GV-003", name: "Trần Thị Lan" },
  { code: "GV-004", name: "Hoàng Thu Hà" },
  { code: "GV-005", name: "Lê Minh Hoàng" },
  { code: "GV-006", name: "Vũ Ngọc Ánh" },
  { code: "GV-010", name: "Nguyễn Quốc Tuấn" },
  { code: "GV-011", name: "Bùi Thị Hương" },
];

const statusCfg = {
  assigned: { label: "Đã phân công", bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-700 dark:text-blue-400" },
  confirmed: { label: "Đã xác nhận", bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400" },
  replaced: { label: "Đã thay thế", bg: "bg-gray-100 dark:bg-white/5", text: "text-gray-500 dark:text-gray-400" },
};

const roleCfg = {
  "Giám thị 1": { color: "text-blue-600", bg: "bg-blue-500/10" },
  "Giám thị 2": { color: "text-violet-600", bg: "bg-violet-500/10" },
  "Giám thị Dự phòng": { color: "text-amber-600", bg: "bg-amber-500/10" },
};

export function AdminExamInvigilators() {
  useDocumentTitle("Phân công Coi thi");
  const [data, setData] = useState<Invigilator[]>(invigilators);
  const [search, setSearch] = useState("");
  const [filterExam, setFilterExam] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ teacherCode: "GV-001", examCode: "KT-26-004", room: "", date: "", shift: "Sáng (7:30-11:30)", role: "Giám thị 1" as Invigilator["role"] });

  useEscapeKey(() => setAddOpen(false), addOpen);

  const examOptions = [...new Set(data.map(d => d.examCode))];

  const filtered = useMemo(() => data.filter(d => {
    const s = search.toLowerCase();
    const matchSearch = !search || d.teacherName.toLowerCase().includes(s) || d.examName.toLowerCase().includes(s) || d.room.toLowerCase().includes(s);
    const matchExam = filterExam === "all" || d.examCode === filterExam;
    return matchSearch && matchExam;
  }), [data, search, filterExam]);

  const conflicts = data.filter(d => d.hasConflict);

  const handleAdd = () => {
    if (!form.room || !form.date) { toast.error("Vui lòng điền phòng thi và ngày thi"); return; }
    const teacher = teachers.find(t => t.code === form.teacherCode);
    const newItem: Invigilator = {
      id: String(data.length + 1),
      teacherCode: form.teacherCode,
      teacherName: teacher?.name || "",
      examCode: form.examCode,
      examName: "Kỳ thi được chọn",
      room: form.room,
      date: form.date,
      shift: form.shift,
      subject: "Chưa xác định",
      role: form.role,
      hasConflict: false,
      status: "assigned",
    };
    setData(prev => [...prev, newItem]);
    setAddOpen(false);
    toast.success("Đã phân công giám thị");
  };

  const handleConfirm = (id: string) => {
    setData(prev => prev.map(d => d.id === id ? { ...d, status: "confirmed" as const } : d));
    toast.success("Đã xác nhận phân công");
  };

  const handleRemove = (id: string) => {
    setData(prev => prev.filter(d => d.id !== id));
    toast.success("Đã hủy phân công");
  };

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="relative mb-6 p-6 rounded-2xl overflow-hidden bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: "28px 28px" }} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-violet-200 text-[13px] font-semibold mb-1 tracking-wide uppercase">Module Thi & Kiểm tra</p>
            <h1 className="text-[24px] font-extrabold">Phân công Coi thi</h1>
            <p className="text-violet-100/70 text-[14px] mt-1">Điều phối giám thị cho từng phòng thi, kiểm tra xung đột lịch</p>
          </div>
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white px-4 py-2.5 rounded-xl text-[14px] font-semibold transition-all">
            <Plus className="w-4 h-4" /> Phân công thêm
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Tổng phân công", value: data.length, color: "text-violet-500" },
          { label: "Đã xác nhận", value: data.filter(d => d.status === "confirmed").length, color: "text-emerald-500" },
          { label: "Chờ xác nhận", value: data.filter(d => d.status === "assigned").length, color: "text-blue-500" },
          { label: "Có xung đột", value: conflicts.length, color: "text-rose-500" },
        ].map(s => (
          <div key={s.label} className={`bg-white dark:bg-card border rounded-2xl p-4 text-center ${s.label === "Có xung đột" && conflicts.length > 0 ? "border-rose-200 dark:border-rose-500/30" : "border-gray-100 dark:border-border"}`}>
            <p className={`text-[28px] font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Conflict Warning */}
      {conflicts.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-2xl p-4 mb-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-700 dark:text-rose-400 text-[14px]">{conflicts.length} giám thị có xung đột lịch</p>
            {conflicts.map(c => (
              <p key={c.id} className="text-[13px] text-rose-600 dark:text-rose-300 mt-0.5">• <strong>{c.teacherName}</strong> ({c.examName} – {c.room}): {c.conflictNote}</p>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm giáo viên, kỳ thi, phòng..." className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400" />
        </div>
        <select value={filterExam} onChange={e => setFilterExam(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none">
          <option value="all">Tất cả kỳ thi</option>
          {examOptions.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[14px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-border bg-gray-50/50 dark:bg-white/[0.02]">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-[12px] uppercase tracking-wide">Giám thị</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-[12px] uppercase tracking-wide">Kỳ thi / Môn</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-[12px] uppercase tracking-wide hidden md:table-cell">Phòng / Ca</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-[12px] uppercase tracking-wide hidden lg:table-cell">Vai trò</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-[12px] uppercase tracking-wide">Trạng thái</th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground text-[12px] uppercase tracking-wide">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/[0.03]">
              {filtered.map(inv => {
                const st = statusCfg[inv.status];
                const roleCl = roleCfg[inv.role];
                return (
                  <tr key={inv.id} className={`hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors group ${inv.hasConflict ? "bg-rose-50/30 dark:bg-rose-500/5" : ""}`}>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-[12px] font-bold shrink-0">{inv.teacherName.charAt(0)}</div>
                        <div>
                          <p className="font-semibold text-[#1a1a2e] dark:text-foreground">{inv.teacherName}</p>
                          <p className="text-[11px] font-mono text-muted-foreground">{inv.teacherCode}</p>
                        </div>
                        {inv.hasConflict && <AlertTriangle className="w-4 h-4 text-rose-500" title={inv.conflictNote} />}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-[#1a1a2e] dark:text-foreground">{inv.examCode}</p>
                      <p className="text-[12px] text-muted-foreground">{inv.subject}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <p className="font-medium">{inv.room}</p>
                      <p className="text-[12px] text-muted-foreground">{inv.shift}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${roleCl.bg} ${roleCl.color}`}>
                        <Shield className="w-3 h-3" />{inv.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-semibold ${st.bg} ${st.text}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {inv.status === "assigned" && (
                          <button onClick={() => handleConfirm(inv.id)} className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-500/10" title="Xác nhận"><CheckCircle className="w-4 h-4 text-emerald-500" /></button>
                        )}
                        <button onClick={() => handleRemove(inv.id)} className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10" title="Hủy phân công"><Trash2 className="w-4 h-4 text-rose-500" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {addOpen && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAddOpen(false)} />
            <motion.div className="relative w-full max-w-md bg-white dark:bg-card rounded-2xl shadow-2xl overflow-hidden" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
              <div className="p-5 border-b border-gray-100 dark:border-border flex items-center justify-between">
                <h3 className="text-[17px] font-bold text-[#1a1a2e] dark:text-foreground">Phân công Giám thị</h3>
                <button onClick={() => setAddOpen(false)} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-[13px] font-semibold mb-1.5">Chọn Giáo viên</label>
                  <select value={form.teacherCode} onChange={e => setForm(f => ({ ...f, teacherCode: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none">
                    {teachers.map(t => <option key={t.code} value={t.code}>{t.name} ({t.code})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold mb-1.5">Kỳ thi</label>
                  <select value={form.examCode} onChange={e => setForm(f => ({ ...f, examCode: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none">
                    <option value="KT-26-004">KT-26-004 – TOEIC 450 Tháng 3</option>
                    <option value="KT-26-005">KT-26-005 – Nấu ăn Cơ bản</option>
                    <option value="KT-26-006">KT-26-006 – Lập trình Web</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[13px] font-semibold mb-1.5">Phòng thi *</label>
                    <input value={form.room} onChange={e => setForm(f => ({ ...f, room: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" placeholder="Phòng A101" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold mb-1.5">Ngày thi *</label>
                    <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[13px] font-semibold mb-1.5">Ca thi</label>
                    <select value={form.shift} onChange={e => setForm(f => ({ ...f, shift: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none">
                      <option>Sáng (7:30-11:30)</option>
                      <option>Chiều (13:00-17:00)</option>
                      <option>Tối (18:00-20:00)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold mb-1.5">Vai trò</label>
                    <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as Invigilator["role"] }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none">
                      <option>Giám thị 1</option>
                      <option>Giám thị 2</option>
                      <option>Giám thị Dự phòng</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="p-5 border-t border-gray-100 dark:border-border flex gap-3">
                <button onClick={() => setAddOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-border text-[14px] font-semibold hover:bg-gray-50 dark:hover:bg-white/5">Hủy</button>
                <button onClick={handleAdd} className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-[14px] font-semibold">Phân công</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

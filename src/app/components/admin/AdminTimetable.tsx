import { useState, useMemo, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  Clock, MapPin, User, Plus, X, AlertTriangle, Trash2, Edit2, CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { useDocumentTitle } from "../../utils/hooks";

const DAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];
const TIMES = ["07:00", "09:00", "11:00", "13:00", "15:00", "17:00", "19:00", "21:00"];

type BlockType = "theory" | "practice" | "exam";

interface ScheduleBlock {
  id: string;
  subject: string;
  teacher: string;
  room: string;
  dayIdx: number;
  timeIdx: number;
  durationSlots: number; // each slot = 2 hours
  type: BlockType;
  weekOffset: number; // 0 = base week, +1 = next, -1 = prev
}

const typeConfig: Record<BlockType, { label: string; bg: string; border: string; text: string; dot: string }> = {
  theory:   { label: "Lý thuyết",    bg: "bg-blue-50 dark:bg-blue-500/10",    border: "border-blue-200 dark:border-blue-500/30",    text: "text-blue-900 dark:text-blue-100",    dot: "bg-blue-500" },
  practice: { label: "Thực hành",    bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/30", text: "text-emerald-900 dark:text-emerald-100", dot: "bg-emerald-500" },
  exam:     { label: "Kiểm tra/Thi", bg: "bg-rose-50 dark:bg-rose-500/10",    border: "border-rose-200 dark:border-rose-500/30",    text: "text-rose-900 dark:text-rose-100",    dot: "bg-rose-500" },
};

// Base date: Monday of a reference week (2026-08-17 = Monday)
const BASE_MONDAY = new Date(2026, 7, 17); // month is 0-indexed

function getWeekDates(weekOffset: number): Date[] {
  return DAYS.map((_, i) => {
    const d = new Date(BASE_MONDAY);
    d.setDate(d.getDate() + weekOffset * 7 + i);
    return d;
  });
}

function fmtDate(d: Date) {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function fmtWeekLabel(weekOffset: number) {
  const dates = getWeekDates(weekOffset);
  const first = dates[0];
  const last = dates[6];
  return `Tuần ${weekOffset >= 0 ? weekOffset + 1 : ""} • ${fmtDate(first)} – ${fmtDate(last)}/${last.getFullYear()}`;
}

const initialBlocks: ScheduleBlock[] = [
  { id: "S1", subject: "Lý thuyết Hàn TIG", teacher: "GV. Trần Hữu An", room: "P.201", dayIdx: 0, timeIdx: 0, durationSlots: 1, type: "theory", weekOffset: 0 },
  { id: "S2", subject: "Thực hành Hàn 3G", teacher: "GV. Lê Văn Bình", room: "Xưởng CK 1", dayIdx: 0, timeIdx: 3, durationSlots: 2, type: "practice", weekOffset: 0 },
  { id: "S3", subject: "Reading TOEIC 600", teacher: "GV. Nguyễn Mai", room: "P.305 Lab", dayIdx: 1, timeIdx: 6, durationSlots: 1, type: "practice", weekOffset: 0 },
  { id: "S4", subject: "Kiểm tra giữa kỳ Word", teacher: "GV. Phạm Đức", room: "P.Tin học 2", dayIdx: 2, timeIdx: 3, durationSlots: 1, type: "exam", weekOffset: 0 },
  { id: "S5", subject: "Lập trình Web Frontend", teacher: "GV. Trần Văn Hiếu", room: "P.Máy 1", dayIdx: 4, timeIdx: 1, durationSlots: 1, type: "theory", weekOffset: 0 },
  { id: "S6", subject: "Tiếng Anh B1 - Nghe", teacher: "GV. Nguyễn Mai", room: "P.102", dayIdx: 3, timeIdx: 4, durationSlots: 1, type: "theory", weekOffset: 0 },
];

const EMPTY_FORM = { subject: "", teacher: "", room: "", dayIdx: 0, timeIdx: 0, durationSlots: 1, type: "theory" as BlockType };

export function AdminTimetable() {
  useDocumentTitle("Thời khóa biểu");
  const [weekOffset, setWeekOffset] = useState(0);
  const [blocks, setBlocks] = useState<ScheduleBlock[]>(initialBlocks);
  const [addOpen, setAddOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ScheduleBlock | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [clickedCell, setClickedCell] = useState<{ dayIdx: number; timeIdx: number } | null>(null);

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  const currentBlocks = useMemo(() =>
    blocks.filter(b => b.weekOffset === weekOffset),
    [blocks, weekOffset]
  );

  // Conflict detection: same room OR same teacher at overlapping time on same day
  const detectConflicts = useCallback((candidate: Omit<ScheduleBlock, "id" | "weekOffset">, excludeId?: string): string[] => {
    const conflicts: string[] = [];
    const cEnd = candidate.timeIdx + candidate.durationSlots;

    for (const b of currentBlocks) {
      if (b.id === excludeId) continue;
      if (b.dayIdx !== candidate.dayIdx) continue;
      const bEnd = b.timeIdx + b.durationSlots;
      // Overlap check
      if (candidate.timeIdx < bEnd && cEnd > b.timeIdx) {
        if (b.room === candidate.room) conflicts.push(`Phòng "${b.room}" đã có "${b.subject}" (${TIMES[b.timeIdx]}–${TIMES[Math.min(bEnd, TIMES.length - 1)]})`);
        if (b.teacher === candidate.teacher && candidate.teacher) conflicts.push(`GV "${b.teacher}" đã có "${b.subject}" (${TIMES[b.timeIdx]}–${TIMES[Math.min(bEnd, TIMES.length - 1)]})`);
      }
    }
    return [...new Set(conflicts)];
  }, [currentBlocks]);

  const handleOpenAdd = (dayIdx?: number, timeIdx?: number) => {
    setEditingBlock(null);
    setForm({ ...EMPTY_FORM, dayIdx: dayIdx ?? 0, timeIdx: timeIdx ?? 0 });
    setAddOpen(true);
  };

  const handleOpenEdit = (block: ScheduleBlock) => {
    setEditingBlock(block);
    setForm({ subject: block.subject, teacher: block.teacher, room: block.room, dayIdx: block.dayIdx, timeIdx: block.timeIdx, durationSlots: block.durationSlots, type: block.type });
    setAddOpen(true);
  };

  const handleSave = () => {
    if (!form.subject || !form.room) { toast.error("Vui lòng nhập tên môn học và phòng học"); return; }
    const conflicts = detectConflicts(form, editingBlock?.id);
    if (conflicts.length > 0) {
      toast.error("Phát hiện xung đột lịch:\n" + conflicts.join("\n"), { duration: 5000 });
      return;
    }
    if (editingBlock) {
      setBlocks(prev => prev.map(b => b.id === editingBlock.id ? { ...b, ...form } : b));
      toast.success("Đã cập nhật khối lịch");
    } else {
      const newBlock: ScheduleBlock = {
        id: `S${Date.now()}`,
        weekOffset,
        ...form,
      };
      setBlocks(prev => [...prev, newBlock]);
      toast.success("Đã thêm khối lịch mới");
    }
    setAddOpen(false);
    setClickedCell(null);
  };

  const handleDelete = (id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
    setDeleteId(null);
    toast.success("Đã xóa khối lịch");
  };

  const liveConflicts = useMemo(() => detectConflicts(form, editingBlock?.id), [form, editingBlock, detectConflicts]);

  return (
    <div className="flex-1 pb-10 flex flex-col" style={{ minHeight: "calc(100vh - 100px)" }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4 shrink-0">
        <div>
          <h1 className="text-[26px] font-black text-[#1a1a2e] dark:text-foreground tracking-tight">Thời khóa biểu</h1>
          <p className="text-[15px] text-muted-foreground mt-1">Điều phối phòng học, ca học và lịch giảng dạy — tự động phát hiện xung đột.</p>
        </div>
        <button
          onClick={() => handleOpenAdd()}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-[14.5px] shadow-sm hover:opacity-90 transition-all font-bold self-start"
        >
          <Plus className="w-4 h-4" /> Thêm tiết học
        </button>
      </div>

      {/* Toolbar: week navigation + legend */}
      <div className="flex items-center justify-between bg-white dark:bg-card p-2 rounded-2xl border border-gray-100 dark:border-border mb-4 shadow-sm shrink-0 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset(w => w - 1)}
            className="p-2 bg-gray-100 dark:bg-white/10 rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 px-3 font-bold text-[15px] text-[#1a1a2e] dark:text-foreground">
            <CalendarIcon className="w-4 h-4 text-primary" />
            {fmtWeekLabel(weekOffset)}
          </div>
          <button
            onClick={() => setWeekOffset(w => w + 1)}
            className="p-2 bg-gray-100 dark:bg-white/10 rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          {weekOffset !== 0 && (
            <button onClick={() => setWeekOffset(0)} className="text-[12px] font-bold text-primary hover:underline px-2">Tuần hiện tại</button>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {Object.entries(typeConfig).map(([k, v]) => (
            <span key={k} className={`flex items-center gap-1.5 text-[12px] font-bold px-2 py-1 rounded-lg ${v.bg}`}>
              <span className={`w-2 h-2 rounded-full ${v.dot}`} /> {v.label}
            </span>
          ))}
        </div>
      </div>

      {/* Calendar Matrix */}
      <div className="flex-1 bg-white dark:bg-card border border-gray-100 dark:border-border rounded-3xl overflow-hidden shadow-sm flex flex-col min-h-0">
        <div className="overflow-auto flex-1 flex flex-col min-w-0">
          {/* Header row */}
          <div className="grid shrink-0 border-b border-gray-100 dark:border-white/5 bg-gray-50/80 dark:bg-black/20" style={{ gridTemplateColumns: "80px repeat(7, 1fr)", minWidth: 700 }}>
            <div className="p-3 border-r border-gray-100 dark:border-white/5 flex items-center justify-center">
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
            {DAYS.map((day, i) => (
              <div key={day} className="p-3 border-r border-gray-100 dark:border-white/5 text-center last:border-r-0">
                <p className="text-[12px] text-muted-foreground font-semibold">{day}</p>
                <p className="text-[18px] font-black text-[#1a1a2e] dark:text-foreground">{fmtDate(weekDates[i])}</p>
              </div>
            ))}
          </div>

          {/* Time slots */}
          {TIMES.map((time, tIdx) => (
            <div key={time} className="grid border-b border-gray-100 dark:border-white/5 last:border-b-0" style={{ gridTemplateColumns: "80px repeat(7, 1fr)", minWidth: 700, minHeight: 100 }}>
              {/* Time label */}
              <div className="border-r border-gray-100 dark:border-white/5 p-3 flex items-start justify-center bg-gray-50/30 dark:bg-black/10">
                <span className="text-[13px] font-bold text-muted-foreground">{time}</span>
              </div>
              {/* Day cells */}
              {DAYS.map((_, dIdx) => {
                const block = currentBlocks.find(b => b.dayIdx === dIdx && b.timeIdx === tIdx);
                const isOccupied = currentBlocks.some(b => b.dayIdx === dIdx && b.timeIdx < tIdx && b.timeIdx + b.durationSlots > tIdx);
                return (
                  <div
                    key={dIdx}
                    className="border-r border-gray-100 dark:border-white/5 last:border-r-0 p-1.5 relative hover:bg-gray-50/50 dark:hover:bg-white/[0.03] transition-colors group"
                    onClick={() => !block && !isOccupied && handleOpenAdd(dIdx, tIdx)}
                  >
                    {!block && !isOccupied && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Plus className="w-5 h-5 text-gray-300 dark:text-white/20" />
                      </div>
                    )}
                    {block && (
                      <motion.div
                        key={block.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-2.5 rounded-xl border cursor-pointer hover:shadow-md transition-all group/block ${typeConfig[block.type].bg} ${typeConfig[block.type].border}`}
                        style={{ minHeight: `${block.durationSlots * 84}px` }}
                        onClick={e => { e.stopPropagation(); handleOpenEdit(block); }}
                      >
                        <p className={`text-[12.5px] font-black leading-tight mb-1 ${typeConfig[block.type].text}`}>{block.subject}</p>
                        <div className="space-y-0.5 mt-1">
                          <div className={`flex items-center gap-1 text-[11px] font-semibold ${typeConfig[block.type].text} opacity-80`}>
                            <MapPin className="w-2.5 h-2.5 shrink-0" /> {block.room}
                          </div>
                          <div className={`flex items-center gap-1 text-[11px] font-semibold ${typeConfig[block.type].text} opacity-80`}>
                            <User className="w-2.5 h-2.5 shrink-0" /> {block.teacher}
                          </div>
                        </div>
                        <div className="absolute top-1.5 right-1.5 opacity-0 group-hover/block:opacity-100 transition-opacity flex gap-0.5">
                          <button
                            onClick={e => { e.stopPropagation(); handleOpenEdit(block); }}
                            className="p-1 bg-white/80 dark:bg-black/40 rounded-lg hover:bg-white dark:hover:bg-black/60"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); setDeleteId(block.id); }}
                            className="p-1 bg-white/80 dark:bg-black/40 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/20 text-red-500"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {addOpen && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setAddOpen(false)} />
            <motion.div
              className="relative w-full max-w-lg bg-white dark:bg-card rounded-2xl shadow-2xl overflow-hidden"
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
            >
              <div className="p-5 border-b border-gray-100 dark:border-border flex items-center justify-between">
                <h3 className="text-[17px] font-bold text-[#1a1a2e] dark:text-foreground">
                  {editingBlock ? "Sửa tiết học" : "Thêm tiết học"}
                </h3>
                <button onClick={() => setAddOpen(false)} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Conflict warning */}
                <AnimatePresence>
                  {liveConflicts.length > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                        <span className="text-[13px] font-semibold text-red-700 dark:text-red-400">Xung đột lịch phát hiện</span>
                      </div>
                      {liveConflicts.map((c, i) => (
                        <p key={i} className="text-[12px] text-red-600 dark:text-red-400/80 ml-6">{c}</p>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="block text-[13px] font-semibold mb-1.5">Tên môn học / Tiết học *</label>
                  <input
                    value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none focus:border-primary/50"
                    placeholder="VD: Thực hành Hàn TIG Nâng cao..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[13px] font-semibold mb-1.5">Thứ</label>
                    <select value={form.dayIdx} onChange={e => setForm(f => ({ ...f, dayIdx: +e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none">
                      {DAYS.map((d, i) => <option key={d} value={i}>{d} ({fmtDate(weekDates[i])})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold mb-1.5">Giờ bắt đầu</label>
                    <select value={form.timeIdx} onChange={e => setForm(f => ({ ...f, timeIdx: +e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none">
                      {TIMES.map((t, i) => <option key={t} value={i}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[13px] font-semibold mb-1.5">Phòng học *</label>
                    <input value={form.room} onChange={e => setForm(f => ({ ...f, room: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" placeholder="P.102, Xưởng CK 1..." />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold mb-1.5">Số tiết (x2h)</label>
                    <select value={form.durationSlots} onChange={e => setForm(f => ({ ...f, durationSlots: +e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none">
                      {[1, 2, 3].map(n => <option key={n} value={n}>{n} tiết ({n * 2}h)</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold mb-1.5">Giảng viên</label>
                  <input value={form.teacher} onChange={e => setForm(f => ({ ...f, teacher: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" placeholder="GV. Họ Tên..." />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold mb-1.5">Loại tiết học</label>
                  <div className="flex gap-2">
                    {(["theory", "practice", "exam"] as BlockType[]).map(t => (
                      <button
                        key={t}
                        onClick={() => setForm(f => ({ ...f, type: t }))}
                        className={`flex-1 py-2 rounded-xl border text-[13px] font-semibold transition-all ${form.type === t ? `${typeConfig[t].bg} ${typeConfig[t].border} ${typeConfig[t].text}` : "border-gray-200 dark:border-border text-muted-foreground"}`}
                      >
                        {typeConfig[t].label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-gray-100 dark:border-border flex gap-3">
                <button onClick={() => setAddOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-border text-[14px] font-semibold hover:bg-gray-50 dark:hover:bg-white/5">Hủy</button>
                <button
                  onClick={handleSave}
                  disabled={liveConflicts.length > 0}
                  className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[14px] font-semibold flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {editingBlock ? "Lưu thay đổi" : "Thêm tiết học"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteId && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
            <motion.div className="relative w-full max-w-sm bg-white dark:bg-card rounded-2xl shadow-2xl p-6 text-center" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-[17px] font-bold mb-2">Xóa tiết học?</h3>
              <p className="text-[14px] text-muted-foreground mb-5">Hành động này không thể hoàn tác.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-border font-semibold text-[14px]">Hủy</button>
                <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-[14px]">Xóa</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

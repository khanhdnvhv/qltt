import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldAlert, Plus, Search, Download, X, ChevronRight,
  CheckCircle, Clock, FileText, AlertTriangle, Users,
  Calendar, Star, ClipboardList, Save,
} from "lucide-react";
import { useAppData, type AppInspection } from "../../context/AppDataContext";
import { toast } from "sonner";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<AppInspection["status"], { label: string; color: string; bg: string; icon: React.ElementType }> = {
  planned:     { label: "Kế hoạch",       color: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-50 dark:bg-blue-500/10",   icon: Calendar },
  in_progress: { label: "Đang tiến hành", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10", icon: Clock },
  completed:   { label: "Hoàn thành",     color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", icon: CheckCircle },
  reported:    { label: "Đã báo cáo",     color: "text-purple-600 dark:text-purple-400",  bg: "bg-purple-50 dark:bg-purple-500/10",  icon: FileText },
};

const TYPE_COLORS: Record<AppInspection["type"], string> = {
  "Định kỳ":  "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
  "Đột xuất": "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
  "Chuyên đề":"bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400",
};

const AREA_OPTIONS = [
  "Hồ sơ pháp lý", "Giấy phép hoạt động", "Cơ sở vật chất",
  "Chương trình đào tạo", "Đội ngũ giảng viên", "Tài chính",
  "Kết quả thi cấp CC", "An toàn phòng cháy chữa cháy",
];

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-muted-foreground text-[13px]">—</span>;
  const color = score >= 80 ? "text-emerald-600 dark:text-emerald-400" : score >= 60 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400";
  return (
    <span className={`font-bold text-[15px] flex items-center gap-1 ${color}`}>
      <Star className="w-3.5 h-3.5 fill-current" /> {score}
    </span>
  );
}

function exportCsv(rows: AppInspection[]) {
  const header = ["Mã", "Trung tâm", "Loại", "Ngày TT", "Trạng thái", "Trưởng đoàn", "Điểm", "Vi phạm"];
  const lines = rows.map(r => [
    r.code, `"${r.centerName}"`, r.type, r.inspectionDate,
    STATUS_CONFIG[r.status].label, `"${r.leader}"`,
    r.score ?? "", `"${r.violations}"`,
  ].join(","));
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `thanh-tra-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Đã xuất danh sách thanh tra CSV!");
}

// ─── Add Form ────────────────────────────────────────────────────────────────

interface AddFormProps {
  onClose: () => void;
  onSave: (data: Omit<AppInspection, "id" | "code">) => void;
}

function AddInspectionForm({ onClose, onSave }: AddFormProps) {
  const [form, setForm] = useState({
    centerName: "",
    inspectionDate: "",
    dueDate: "",
    type: "Định kỳ" as AppInspection["type"],
    areas: [] as string[],
    leader: "",
    teamMembers: "",
    findings: "",
    violations: "",
    recommendations: "",
    score: "",
    status: "planned" as AppInspection["status"],
    reportDate: null as string | null,
    note: "",
  });

  const toggleArea = (area: string) =>
    setForm(f => ({ ...f, areas: f.areas.includes(area) ? f.areas.filter(a => a !== area) : [...f.areas, area] }));

  const handleSave = () => {
    if (!form.centerName.trim() || !form.inspectionDate || !form.leader.trim()) {
      toast.error("Vui lòng điền đủ: tên trung tâm, ngày thanh tra, trưởng đoàn.");
      return;
    }
    onSave({
      centerName: form.centerName.trim(),
      inspectionDate: form.inspectionDate,
      dueDate: form.dueDate,
      type: form.type,
      areas: form.areas,
      leader: form.leader.trim(),
      teamMembers: form.teamMembers.split(",").map(s => s.trim()).filter(Boolean),
      findings: form.findings,
      violations: form.violations,
      recommendations: form.recommendations,
      score: form.score ? Number(form.score) : null,
      status: form.status,
      reportDate: form.reportDate,
    });
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        className="bg-white dark:bg-card rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
        initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
        style={{ maxHeight: "90vh" }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-border">
          <h2 className="text-[17px] font-black text-[#1a1a2e] dark:text-foreground">Lập đoàn Thanh tra</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5"><X className="w-5 h-5"/></button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          <div>
            <label className="block text-[13px] font-semibold text-muted-foreground mb-1">Trung tâm *</label>
            <input value={form.centerName} onChange={e => setForm(f => ({ ...f, centerName: e.target.value }))}
              className="w-full bg-[#f4f5f7] dark:bg-black/20 border border-transparent focus:border-primary/50 px-4 py-2.5 rounded-xl text-[14px] outline-none"
              placeholder="Tên trung tâm..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-semibold text-muted-foreground mb-1">Ngày thanh tra *</label>
              <input type="date" value={form.inspectionDate} onChange={e => setForm(f => ({ ...f, inspectionDate: e.target.value }))}
                className="w-full bg-[#f4f5f7] dark:bg-black/20 border border-transparent focus:border-primary/50 px-4 py-2.5 rounded-xl text-[14px] outline-none" />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-muted-foreground mb-1">Hạn hoàn thành</label>
              <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                className="w-full bg-[#f4f5f7] dark:bg-black/20 border border-transparent focus:border-primary/50 px-4 py-2.5 rounded-xl text-[14px] outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-muted-foreground mb-1">Loại thanh tra</label>
            <div className="flex gap-2">
              {(["Định kỳ", "Đột xuất", "Chuyên đề"] as const).map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                  className={`px-3 py-1.5 rounded-xl text-[13px] font-semibold transition-all ${form.type === t ? "bg-[#1a1a2e] text-white dark:bg-muted" : "bg-[#f4f5f7] dark:bg-white/5 text-muted-foreground"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-muted-foreground mb-1">Nội dung thanh tra</label>
            <div className="flex flex-wrap gap-2">
              {AREA_OPTIONS.map(area => (
                <button key={area} onClick={() => toggleArea(area)}
                  className={`px-3 py-1 rounded-xl text-[12px] font-semibold border transition-all ${form.areas.includes(area) ? "bg-primary/10 border-primary/30 text-primary" : "bg-[#f4f5f7] dark:bg-white/5 border-transparent text-muted-foreground"}`}>
                  {area}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-semibold text-muted-foreground mb-1">Trưởng đoàn *</label>
              <input value={form.leader} onChange={e => setForm(f => ({ ...f, leader: e.target.value }))}
                className="w-full bg-[#f4f5f7] dark:bg-black/20 border border-transparent focus:border-primary/50 px-4 py-2.5 rounded-xl text-[14px] outline-none"
                placeholder="Họ tên..." />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-muted-foreground mb-1">Thành viên (cách nhau bởi dấu phẩy)</label>
              <input value={form.teamMembers} onChange={e => setForm(f => ({ ...f, teamMembers: e.target.value }))}
                className="w-full bg-[#f4f5f7] dark:bg-black/20 border border-transparent focus:border-primary/50 px-4 py-2.5 rounded-xl text-[14px] outline-none"
                placeholder="Nguyễn A, Trần B..." />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 dark:border-border flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-border text-[14px] font-semibold hover:bg-gray-50">Hủy</button>
          <button onClick={handleSave} className="px-5 py-2.5 rounded-xl bg-[#1a1a2e] dark:bg-muted text-white text-[14px] font-semibold flex items-center gap-2 hover:bg-black">
            <Save className="w-4 h-4"/> Lập đoàn
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────

interface DrawerProps {
  inspection: AppInspection;
  onClose: () => void;
  onUpdate: (updates: Partial<AppInspection>) => void;
}

function InspectionDrawer({ inspection: ins, onClose, onUpdate }: DrawerProps) {
  const [editing, setEditing] = useState(false);
  const [findings, setFindings] = useState(ins.findings);
  const [violations, setViolations] = useState(ins.violations);
  const [recommendations, setRecommendations] = useState(ins.recommendations);
  const [score, setScore] = useState(ins.score?.toString() ?? "");

  const sc = STATUS_CONFIG[ins.status];
  const ScIcon = sc.icon;

  const handleSaveResults = () => {
    const parsed = score ? Number(score) : null;
    if (score && (isNaN(parsed!) || parsed! < 0 || parsed! > 100)) {
      toast.error("Điểm phải từ 0–100"); return;
    }
    onUpdate({ findings, violations, recommendations, score: parsed, status: ins.status === "in_progress" ? "in_progress" : ins.status });
    setEditing(false);
    toast.success("Đã lưu kết quả thanh tra.");
  };

  const nextStatus: Partial<Record<AppInspection["status"], AppInspection["status"]>> = {
    planned: "in_progress", in_progress: "completed", completed: "reported",
  };
  const nextLabel: Partial<Record<AppInspection["status"], string>> = {
    planned: "Bắt đầu tiến hành", in_progress: "Hoàn thành thanh tra", completed: "Tạo báo cáo",
  };

  const handleAdvanceStatus = () => {
    const next = nextStatus[ins.status];
    if (!next) return;
    const updates: Partial<AppInspection> = { status: next };
    if (next === "in_progress") updates.findings = findings || ins.findings;
    if (next === "reported") updates.reportDate = new Date().toLocaleDateString("vi-VN");
    onUpdate(updates);
    toast.success(`Cập nhật trạng thái: ${STATUS_CONFIG[next].label}`);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex justify-end"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative bg-white dark:bg-card w-full max-w-lg h-full shadow-2xl flex flex-col overflow-hidden"
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-border">
          <div>
            <p className="text-[12px] font-mono text-muted-foreground">{ins.code}</p>
            <h2 className="text-[16px] font-black text-[#1a1a2e] dark:text-foreground leading-tight mt-0.5">{ins.centerName}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5"><X className="w-5 h-5"/></button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Status + type */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-semibold ${sc.bg} ${sc.color}`}>
              <ScIcon className="w-3.5 h-3.5"/> {sc.label}
            </span>
            <span className={`px-3 py-1.5 rounded-xl text-[13px] font-semibold ${TYPE_COLORS[ins.type]}`}>{ins.type}</span>
            {ins.score !== null && (
              <span className="ml-auto"><ScoreBadge score={ins.score}/></span>
            )}
          </div>

          {/* Meta info */}
          <div className="grid grid-cols-2 gap-3">
            <InfoBox label="Ngày thanh tra" value={ins.inspectionDate}/>
            <InfoBox label="Hạn hoàn thành" value={ins.dueDate}/>
            <InfoBox label="Trưởng đoàn" value={ins.leader}/>
            <InfoBox label="Báo cáo ngày" value={ins.reportDate ?? "—"}/>
          </div>

          {/* Thành viên */}
          {ins.teamMembers.length > 0 && (
            <div>
              <p className="text-[12px] font-semibold text-muted-foreground mb-2 flex items-center gap-1.5"><Users className="w-3.5 h-3.5"/> Thành viên đoàn</p>
              <div className="flex flex-wrap gap-2">
                {ins.teamMembers.map(m => (
                  <span key={m} className="px-3 py-1 bg-gray-100 dark:bg-white/5 text-[13px] text-foreground rounded-lg font-medium">{m}</span>
                ))}
              </div>
            </div>
          )}

          {/* Nội dung */}
          {ins.areas.length > 0 && (
            <div>
              <p className="text-[12px] font-semibold text-muted-foreground mb-2 flex items-center gap-1.5"><ClipboardList className="w-3.5 h-3.5"/> Nội dung thanh tra</p>
              <div className="flex flex-wrap gap-2">
                {ins.areas.map(a => (
                  <span key={a} className="px-2.5 py-1 bg-primary/[0.07] text-primary text-[12px] rounded-lg font-medium">{a}</span>
                ))}
              </div>
            </div>
          )}

          {/* Results section */}
          <div className="bg-gray-50 dark:bg-black/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-bold text-[#1a1a2e] dark:text-foreground">Kết quả thanh tra</p>
              {ins.status !== "reported" && (
                <button onClick={() => setEditing(e => !e)}
                  className="text-[12px] text-primary font-semibold hover:underline">
                  {editing ? "Hủy sửa" : "Ghi kết quả"}
                </button>
              )}
            </div>

            {editing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-[12px] font-semibold text-muted-foreground mb-1 block">Kết quả / Nhận xét</label>
                  <textarea value={findings} onChange={e => setFindings(e.target.value)} rows={3}
                    className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-border px-3 py-2 rounded-xl text-[13px] outline-none focus:border-primary/50 resize-none"/>
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-muted-foreground mb-1 block">Vi phạm (nếu có)</label>
                  <textarea value={violations} onChange={e => setViolations(e.target.value)} rows={2}
                    className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-border px-3 py-2 rounded-xl text-[13px] outline-none focus:border-primary/50 resize-none"/>
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-muted-foreground mb-1 block">Kiến nghị</label>
                  <textarea value={recommendations} onChange={e => setRecommendations(e.target.value)} rows={2}
                    className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-border px-3 py-2 rounded-xl text-[13px] outline-none focus:border-primary/50 resize-none"/>
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-muted-foreground mb-1 block">Điểm (0–100)</label>
                  <input type="number" min={0} max={100} value={score} onChange={e => setScore(e.target.value)}
                    className="w-28 bg-white dark:bg-black/20 border border-gray-200 dark:border-border px-3 py-2 rounded-xl text-[13px] outline-none focus:border-primary/50"/>
                </div>
                <button onClick={handleSaveResults}
                  className="w-full py-2.5 rounded-xl bg-[#1a1a2e] dark:bg-muted text-white text-[13px] font-bold flex items-center justify-center gap-2">
                  <Save className="w-4 h-4"/> Lưu kết quả
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {ins.findings ? (
                  <p className="text-[13px] text-foreground leading-relaxed">{ins.findings}</p>
                ) : (
                  <p className="text-[13px] text-muted-foreground italic">Chưa có kết quả.</p>
                )}
                {ins.violations && (
                  <div className="flex items-start gap-2 p-3 bg-rose-50 dark:bg-rose-500/10 rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5"/>
                    <p className="text-[12.5px] text-rose-700 dark:text-rose-400 font-medium">{ins.violations}</p>
                  </div>
                )}
                {ins.recommendations && (
                  <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                    <ChevronRight className="w-4 h-4 text-blue-500 shrink-0 mt-0.5"/>
                    <p className="text-[12.5px] text-blue-700 dark:text-blue-400">{ins.recommendations}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        {nextStatus[ins.status] && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-border">
            <button onClick={handleAdvanceStatus}
              className="w-full py-3 rounded-2xl bg-[#1a1a2e] dark:bg-muted text-white text-[14px] font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors">
              <CheckCircle className="w-4 h-4"/> {nextLabel[ins.status]}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-black/10 rounded-xl px-3 py-2.5">
      <p className="text-[11px] font-semibold text-muted-foreground mb-0.5">{label}</p>
      <p className="text-[13px] font-semibold text-foreground">{value}</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminInspections() {
  const { inspections, addInspection, updateInspection } = useAppData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppInspection["status"] | "all">("all");
  const [typeFilter, setTypeFilter] = useState<AppInspection["type"] | "all">("all");
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<AppInspection | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return inspections.filter(ins => {
      const matchSearch = ins.centerName.toLowerCase().includes(q) || ins.code.toLowerCase().includes(q) || ins.leader.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || ins.status === statusFilter;
      const matchType = typeFilter === "all" || ins.type === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [inspections, search, statusFilter, typeFilter]);

  // KPIs
  const total        = inspections.length;
  const inProgress   = inspections.filter(i => i.status === "in_progress").length;
  const completed    = inspections.filter(i => i.status === "completed" || i.status === "reported").length;
  const withViolations = inspections.filter(i => i.violations && i.violations.trim() !== "").length;

  const handleAdd = (data: Omit<AppInspection, "id" | "code">) => {
    addInspection(data);
    setShowAdd(false);
    toast.success("Đã lập đoàn thanh tra mới!");
  };

  const handleUpdate = (id: string, updates: Partial<AppInspection>) => {
    updateInspection(id, updates);
    setSelected(prev => prev ? { ...prev, ...updates } : null);
  };

  return (
    <div className="flex-1 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[26px] font-black text-[#1a1a2e] dark:text-foreground tracking-tight">Thanh tra Trung tâm</h1>
          <p className="text-[15px] text-muted-foreground mt-1">Lập đoàn, ghi kết quả và theo dõi tiến độ thanh tra các cơ sở đào tạo.</p>
        </div>
        <div className="flex gap-2 self-start">
          <button
            onClick={() => exportCsv(filtered)}
            className="flex items-center gap-2 bg-white dark:bg-card border border-gray-200 dark:border-border text-foreground px-4 py-2.5 rounded-2xl text-[14px] font-semibold hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4"/> Xuất CSV
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-[#1a1a2e] dark:bg-muted text-white px-5 py-2.5 rounded-2xl text-[14px] font-bold shadow-lg hover:bg-black transition-colors"
          >
            <Plus className="w-4 h-4"/> Lập đoàn mới
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Tổng đợt TT", value: total, icon: ShieldAlert, iconBg: "bg-blue-50 dark:bg-blue-500/10", iconColor: "text-blue-600", valueColor: "text-[#1a1a2e] dark:text-foreground" },
          { label: "Đang tiến hành", value: inProgress, icon: Clock, iconBg: "bg-amber-50 dark:bg-amber-500/10", iconColor: "text-amber-600", valueColor: "text-amber-600 dark:text-amber-400" },
          { label: "Hoàn thành / Báo cáo", value: completed, icon: CheckCircle, iconBg: "bg-emerald-50 dark:bg-emerald-500/10", iconColor: "text-emerald-600", valueColor: "text-emerald-600 dark:text-emerald-400" },
          { label: "Phát hiện vi phạm", value: withViolations, icon: AlertTriangle, iconBg: "bg-rose-50 dark:bg-rose-500/10", iconColor: "text-rose-600", valueColor: "text-rose-600 dark:text-rose-400" },
        ].map(({ label, value, icon: Icon, iconBg, iconColor, valueColor }) => (
          <div key={label} className="bg-white dark:bg-card p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
            <div className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${iconColor}`}/>
            </div>
            <p className={`text-[28px] font-black leading-none ${valueColor}`}>{value}</p>
            <p className="text-[13px] text-muted-foreground font-medium mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-card p-3 rounded-3xl border border-gray-100 dark:border-border mb-3 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"/>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm tên trung tâm, mã đoàn, trưởng đoàn..."
            className="w-full bg-[#f4f5f7] dark:bg-black/20 border border-transparent focus:border-primary/50 transition-colors px-12 py-3.5 rounded-2xl text-[15px] outline-none font-medium"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "planned", "in_progress", "completed", "reported"] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all ${statusFilter === s ? "bg-[#1a1a2e] text-white dark:bg-muted" : "bg-[#f4f5f7] dark:bg-white/5 text-muted-foreground hover:bg-gray-200"}`}>
              {s === "all" ? "Tất cả" : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "Định kỳ", "Đột xuất", "Chuyên đề"] as const).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all ${typeFilter === t ? "bg-[#1a1a2e] text-white dark:bg-muted" : "bg-[#f4f5f7] dark:bg-white/5 text-muted-foreground hover:bg-gray-200"}`}>
              {t === "all" ? "Loại TT" : t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-3xl overflow-hidden shadow-sm">
        {/* Table header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-gray-50 dark:bg-black/10 border-b border-gray-100 dark:border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wide">
          <span>Trung tâm / Mã đoàn</span>
          <span>Loại / Ngày</span>
          <span>Trưởng đoàn</span>
          <span>Điểm / Trạng thái</span>
          <span></span>
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <ShieldAlert className="w-10 h-10 text-muted-foreground/20 mb-3"/>
            <p className="text-[15px] text-muted-foreground">Không có đợt thanh tra nào</p>
          </div>
        )}

        {filtered.map((ins, i) => {
          const sc = STATUS_CONFIG[ins.status];
          const ScIcon = sc.icon;
          return (
            <motion.div
              key={ins.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i < 8 ? i * 0.03 : 0 }}
              onClick={() => setSelected(ins)}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 border-b border-gray-50 dark:border-border/30 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] cursor-pointer transition-colors items-center last:border-b-0"
            >
              {/* Center */}
              <div>
                <p className="text-[14.5px] font-bold text-[#1a1a2e] dark:text-foreground leading-tight">{ins.centerName}</p>
                <p className="text-[12px] font-mono text-muted-foreground mt-0.5">{ins.code}</p>
                {ins.areas.length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-1">
                    {ins.areas.slice(0, 2).map(a => (
                      <span key={a} className="text-[10.5px] px-1.5 py-0.5 bg-gray-100 dark:bg-white/5 rounded text-muted-foreground">{a}</span>
                    ))}
                    {ins.areas.length > 2 && <span className="text-[10.5px] text-muted-foreground">+{ins.areas.length - 2}</span>}
                  </div>
                )}
              </div>

              {/* Type + date */}
              <div>
                <span className={`text-[12px] font-semibold px-2 py-0.5 rounded-lg ${TYPE_COLORS[ins.type]}`}>{ins.type}</span>
                <p className="text-[13px] text-muted-foreground mt-1">{ins.inspectionDate}</p>
              </div>

              {/* Leader */}
              <div>
                <p className="text-[13.5px] font-semibold text-foreground">{ins.leader}</p>
                {ins.teamMembers.length > 0 && (
                  <p className="text-[12px] text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Users className="w-3 h-3"/> {ins.teamMembers.length} TV
                  </p>
                )}
              </div>

              {/* Score + status */}
              <div className="space-y-1">
                <ScoreBadge score={ins.score}/>
                <span className={`flex items-center gap-1 text-[12px] font-semibold ${sc.color}`}>
                  <ScIcon className="w-3 h-3"/> {sc.label}
                </span>
                {ins.violations && ins.violations.trim() && (
                  <span className="flex items-center gap-1 text-[11px] text-rose-500 font-medium">
                    <AlertTriangle className="w-3 h-3"/> Vi phạm
                  </span>
                )}
              </div>

              {/* Arrow */}
              <ChevronRight className="w-4 h-4 text-muted-foreground/40"/>
            </motion.div>
          );
        })}
      </div>

      <p className="text-[13px] text-muted-foreground mt-3 text-center">
        Hiển thị {filtered.length} / {inspections.length} đợt thanh tra
      </p>

      {/* Add form modal */}
      <AnimatePresence>
        {showAdd && <AddInspectionForm onClose={() => setShowAdd(false)} onSave={handleAdd}/>}
      </AnimatePresence>

      {/* Detail drawer */}
      <AnimatePresence>
        {selected && (
          <InspectionDrawer
            inspection={selected}
            onClose={() => setSelected(null)}
            onUpdate={(updates) => handleUpdate(selected.id, updates)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

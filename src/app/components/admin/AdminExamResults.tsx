import { useState, useMemo, useRef } from "react";
import { useDocumentTitle } from "../../utils/hooks";
import { useUrlFilters } from "../../utils/useUrlFilters";
import { useUrlPagination } from "../../utils/useUrlPagination";
import { AnimatePresence, motion } from "motion/react";
import {
  Search, Download, CheckCircle, XCircle,
  TrendingUp, Users, Edit2, Save, X, AlertCircle, RefreshCw,
  Upload, Lock, LockOpen
} from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "./Pagination";
import { useAppData } from "../../context/AppDataContext";

export function AdminExamResults() {
  useDocumentTitle("Kết quả Thi");
  const { examResults: data, updateExamResult } = useAppData();
  const [search, setSearch] = useState("");
  const [filters, setFilter] = useUrlFilters({ status: "all", exam: "all" });
  const { page, pageSize, setPage } = useUrlPagination();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editScore, setEditScore] = useState<string>("");
  const [lockedExams, setLockedExams] = useState<Set<string>>(new Set());
  const [csvPreview, setCsvPreview] = useState<{ code: string; score: number }[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const examOptions = useMemo(() => [...new Set(data.map(r => r.examPlanId))], [data]);

  const filtered = useMemo(() => data.filter(r => {
    const s = search.toLowerCase();
    const matchSearch = !search || r.studentName.toLowerCase().includes(s) || r.seatNo.toLowerCase().includes(s);
    const matchStatus = filters.status === "all" || r.status === filters.status;
    const matchExam = filters.exam === "all" || r.examPlanId === filters.exam;
    return matchSearch && matchStatus && matchExam;
  }), [data, search, filters]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const stats = useMemo(() => {
    const graded = data.filter(r => r.score !== null);
    const passed = graded.filter(r => r.status === "pass");
    const avgScore = graded.length ? (graded.reduce((s, r) => s + (r.score || 0), 0) / graded.length).toFixed(1) : "—";
    return { total: data.length, passed: passed.length, failed: graded.filter(r => r.status === "fail").length, avgScore, passRate: graded.length ? Math.round((passed.length / graded.length) * 100) : 0 };
  }, [data]);

  const saveScore = (id: string) => {
    const score = parseFloat(editScore);
    if (isNaN(score)) { toast.error("Điểm không hợp lệ"); return; }
    const row = data.find(r => r.id === id);
    if (!row) return;
    if (lockedExams.has(row.examPlanId)) { toast.error("Kết quả kỳ thi này đã bị khóa. Không thể chỉnh sửa."); return; }
    if (score < 0 || score > row.maxScore) { toast.error(`Điểm phải trong khoảng 0 – ${row.maxScore}`); return; }
    const newStatus: "pass" | "fail" = score >= row.passScore ? "pass" : "fail";
    updateExamResult(id, { score, status: newStatus });
    setEditingId(null);
    toast.success("Đã cập nhật điểm thi");
  };

  const toggleLock = (examPlanId: string) => {
    setLockedExams(prev => {
      const next = new Set(prev);
      if (next.has(examPlanId)) { next.delete(examPlanId); toast.info(`Đã mở khóa kỳ thi ${examPlanId}`); }
      else { next.add(examPlanId); toast.success(`Đã khóa kết quả kỳ thi ${examPlanId}`); }
      return next;
    });
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const lines = text.split("\n").filter(l => l.trim());
        const parsed: { code: string; score: number }[] = [];
        for (const line of lines.slice(1)) { // skip header
          const cols = line.split(",").map(c => c.replace(/"/g, "").trim());
          const code = cols[0]; const score = parseFloat(cols[1]);
          if (code && !isNaN(score)) parsed.push({ code, score });
        }
        if (parsed.length === 0) { toast.error("File CSV không có dữ liệu hợp lệ"); return; }
        setCsvPreview(parsed);
        toast.info(`Đã đọc ${parsed.length} dòng từ CSV. Nhấn "Áp dụng" để nhập điểm.`);
      } catch { toast.error("Lỗi đọc file CSV"); }
      e.target.value = "";
    };
    reader.readAsText(file, "UTF-8");
  };

  const applyCsvImport = () => {
    if (!csvPreview) return;
    let updated = 0;
    data.forEach(r => {
      const row = csvPreview.find(c => c.code === r.seatNo);
      if (!row || lockedExams.has(r.examPlanId)) return;
      updated++;
      const newStatus: "pass" | "fail" = row.score >= r.passScore ? "pass" : "fail";
      updateExamResult(r.id, { score: row.score, status: newStatus });
    });
    setCsvPreview(null);
    toast.success(`Đã nhập điểm từ CSV: ${updated} học viên được cập nhật`);
  };

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="relative mb-6 p-6 rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: "28px 28px" }} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-emerald-200 text-[13px] font-semibold mb-1 tracking-wide uppercase">Module Thi & Kiểm tra</p>
            <h1 className="text-[24px] font-extrabold">Kết quả Thi</h1>
            <p className="text-emerald-100/70 text-[14px] mt-1">Nhập điểm, xem kết quả và xử lý phúc khảo</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white px-4 py-2.5 rounded-xl text-[14px] font-semibold transition-all"
            >
              <Upload className="w-4 h-4" /> Nhập CSV
            </button>
            <button
              onClick={() => { toast.success("Đã xuất danh sách kết quả thi (.xlsx)"); }}
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white px-4 py-2.5 rounded-xl text-[14px] font-semibold transition-all"
            >
              <Download className="w-4 h-4" /> Xuất Excel
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Tổng thí sinh", value: stats.total, icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Đạt", value: stats.passed, icon: CheckCircle, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Không đạt", value: stats.failed, icon: XCircle, color: "text-rose-500", bg: "bg-rose-500/10" },
          { label: "Tỷ lệ đạt", value: `${stats.passRate}%`, icon: TrendingUp, color: "text-violet-500", bg: "bg-violet-500/10" },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className={`text-[22px] font-extrabold ${s.color} leading-none`}>{s.value}</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CSV import preview banner */}
      <AnimatePresence>
        {csvPreview && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="mb-4 p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-2xl flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <Upload className="w-5 h-5 text-blue-500 shrink-0" />
              <div>
                <p className="font-semibold text-blue-700 dark:text-blue-400 text-[14px]">Sẵn sàng nhập {csvPreview.length} bản ghi từ CSV</p>
                <p className="text-[12px] text-blue-600/80 dark:text-blue-400/70">Các kỳ thi đang bị khóa sẽ không bị thay đổi.</p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => setCsvPreview(null)} className="px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400 text-[13px] font-semibold hover:bg-blue-100 dark:hover:bg-blue-500/20">Hủy</button>
              <button onClick={applyCsvImport} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-[13px] font-semibold hover:bg-blue-700">Áp dụng</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lock status per exam */}
      <div className="mb-4 flex flex-wrap gap-2">
        {examOptions.map(planId => {
          const isLocked = lockedExams.has(planId);
          const name = data.find(r => r.examPlanId === planId)?.examPlanName ?? planId;
          return (
            <button key={planId} onClick={() => toggleLock(planId)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[12px] font-semibold transition-all ${isLocked ? "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400" : "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-border text-muted-foreground hover:bg-gray-100 dark:hover:bg-white/10"}`}
            >
              {isLocked ? <Lock className="w-3 h-3" /> : <LockOpen className="w-3 h-3" />}
              {name} {isLocked ? "(Đã khóa)" : "(Mở)"}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm học viên, số báo danh..." className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
        </div>
        <select value={filters.exam} onChange={e => setFilter("exam", e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none">
          <option value="all">Tất cả kỳ thi</option>
          {examOptions.map(planId => {
            const name = data.find(r => r.examPlanId === planId)?.examPlanName ?? planId;
            return <option key={planId} value={planId}>{name}</option>;
          })}
        </select>
        <select value={filters.status} onChange={e => setFilter("status", e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none">
          <option value="all">Tất cả kết quả</option>
          <option value="pass">Đạt</option>
          <option value="fail">Không đạt</option>
          <option value="pending">Chờ nhập điểm</option>
          <option value="appeal">Phúc khảo</option>
        </select>
      </div>

      {/* Table with inline edit */}
      <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[14px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-border bg-gray-50/50 dark:bg-white/[0.02]">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-[12px] uppercase tracking-wide">SBD / Thí sinh</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-[12px] uppercase tracking-wide hidden md:table-cell">Kỳ thi / Môn</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground text-[12px] uppercase tracking-wide">Điểm</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground text-[12px] uppercase tracking-wide">Kết quả</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-[12px] uppercase tracking-wide hidden lg:table-cell">Ghi chú</th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground text-[12px] uppercase tracking-wide">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/[0.03]">
              {paginated.map(r => {
                const isEditing = editingId === r.id;
                const isLocked = lockedExams.has(r.examPlanId);
                const passPercent = r.score !== null ? Math.round((r.score / r.maxScore) * 100) : 0;
                return (
                  <tr key={r.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                    <td className="px-4 py-3.5">
                      <p className="font-mono text-[12px] text-muted-foreground">{r.seatNo}</p>
                      <p className="font-semibold text-[#1a1a2e] dark:text-foreground">{r.studentName}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <p className="font-medium text-[13px]">{r.examPlanId}</p>
                      <p className="text-[12px] text-muted-foreground">{r.subject}</p>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {isEditing ? (
                        <input autoFocus type="number" step="0.5" min={0} max={r.maxScore} value={editScore} onChange={e => setEditScore(e.target.value)} className="w-16 text-center px-2 py-1 rounded-lg border-2 border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 text-[14px] font-bold outline-none" />
                      ) : (
                        <div className="flex flex-col items-center">
                          <span className={`text-[18px] font-extrabold ${r.status === "pass" ? "text-emerald-600" : r.status === "fail" ? "text-rose-600" : "text-muted-foreground"}`}>
                            {r.score !== null ? r.score : "—"}
                          </span>
                          <span className="text-[10px] text-muted-foreground">/{r.maxScore}</span>
                          {r.score !== null && (
                            <div className="w-12 h-1 bg-gray-200 dark:bg-white/10 rounded-full mt-1">
                              <div className={`h-full rounded-full ${r.status === "pass" ? "bg-emerald-500" : "bg-rose-500"}`} style={{ width: `${passPercent}%` }} />
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {r.status === "pass" && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[12px] font-semibold"><CheckCircle className="w-3 h-3" /> Đạt</span>}
                      {r.status === "fail" && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 text-[12px] font-semibold"><XCircle className="w-3 h-3" /> Không đạt</span>}
                      {r.status === "pending" && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 text-[12px] font-semibold">Chờ nhập</span>}
                      {r.status === "appeal" && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[12px] font-semibold"><RefreshCw className="w-3 h-3" /> Phúc khảo</span>}
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell text-[13px] text-muted-foreground">{r.note || "—"}</td>
                    <td className="px-4 py-3.5 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => saveScore(r.id)} className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 transition-colors"><Save className="w-4 h-4 text-emerald-500" /></button>
                          <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"><X className="w-4 h-4 text-muted-foreground" /></button>
                        </div>
                      ) : (
                        isLocked ? (
                          <div className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" title="Kết quả đã khóa">
                            <Lock className="w-4 h-4 text-rose-400" />
                          </div>
                        ) : (
                          <button onClick={() => { setEditingId(r.id); setEditScore(String(r.score ?? "")); }} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-white/10 transition-all" title="Chỉnh sửa điểm"><Edit2 className="w-4 h-4 text-muted-foreground" /></button>
                        )
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-100 dark:border-border px-4 py-3">
          <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} onPageSizeChange={() => {}} />
        </div>
      </div>
    </div>
  );
}

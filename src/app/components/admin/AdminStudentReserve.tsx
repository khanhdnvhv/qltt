import { useState, useMemo } from "react";
import { useDocumentTitle, useEscapeKey } from "../../utils/hooks";
import { useUrlPagination } from "../../utils/useUrlPagination";
import { AnimatePresence, motion } from "motion/react";
import { Search, Clock, Plus, X, CheckCircle, RotateCcw, Eye, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "./Pagination";
import { useAppData, type AppStudentReserve } from "../../context/AppDataContext";

const statusCfg = {
  active: { label: "Đang bảo lưu", bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-700 dark:text-amber-400" },
  resumed: { label: "Đã học lại", bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400" },
  expired: { label: "Hết hạn BL", bg: "bg-rose-50 dark:bg-rose-500/10", text: "text-rose-700 dark:text-rose-400" },
};

export function AdminStudentReserve() {
  useDocumentTitle("Bảo lưu");
  const { reserveRecords: data, addReserveRecord, updateReserveStatus, students: storeStudents, enrollments } = useAppData();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const { page, pageSize, setPage } = useUrlPagination();
  const [addOpen, setAddOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [form, setForm] = useState({ studentName: "", studentCode: "", course: "", reserveFrom: "", months: 3, reason: "", refundPercent: 70 });

  // Count active reserves for entered student+course combination
  const existingActiveReserves = useMemo(() => {
    if (!form.studentName || !form.course) return 0;
    return data.filter(d =>
      d.status === "active" &&
      d.studentName.toLowerCase() === form.studentName.toLowerCase() &&
      d.courseName.toLowerCase().includes(form.course.toLowerCase().split(" ")[0])
    ).length;
  }, [data, form.studentName, form.course]);

  useEscapeKey(() => { setAddOpen(false); setDetailId(null); }, addOpen || !!detailId);

  const filtered = useMemo(() => data.filter(d => {
    const matchSearch = !search || d.studentName.toLowerCase().includes(search.toLowerCase()) || d.studentCode.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || d.status === filterStatus;
    return matchSearch && matchStatus;
  }), [data, search, filterStatus]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const detail = data.find(d => d.id === detailId);

  const handleAdd = () => {
    if (!form.studentName || !form.course || !form.reason || !form.reserveFrom) { toast.error("Vui lòng điền đầy đủ thông tin"); return; }

    const activeReservesForProgram = data.filter(d =>
      d.status === "active" &&
      d.studentName.toLowerCase() === form.studentName.toLowerCase() &&
      d.courseName.toLowerCase().includes(form.course.toLowerCase().split(" ")[0])
    );
    if (activeReservesForProgram.length >= 2) {
      toast.error(`Học viên đã có ${activeReservesForProgram.length} bảo lưu hiệu lực. Tối đa 2 lần bảo lưu mỗi chương trình.`);
      return;
    }

    const from = new Date(form.reserveFrom);
    const to = new Date(from);
    to.setMonth(to.getMonth() + form.months);

    // Try to find matching student in store
    const matchStudent = storeStudents.find(s =>
      s.name.toLowerCase() === form.studentName.toLowerCase() ||
      s.code === form.studentCode
    );
    const matchEnroll = matchStudent ? enrollments.find(e => e.studentId === matchStudent.id && e.status === "active") : undefined;

    addReserveRecord({
      studentId: matchStudent?.id ?? "",
      studentCode: form.studentCode || matchStudent?.code || `HV-26-${String(Math.floor(Math.random() * 900 + 100))}`,
      studentName: form.studentName,
      courseId: matchEnroll?.courseId ?? "",
      courseName: form.course,
      months: form.months,
      reserveFrom: from.toLocaleDateString("vi-VN"),
      reserveTo: to.toLocaleDateString("vi-VN"),
      resumeDate: null,
      approvedBy: "Admin",
      status: "active",
      refundPercent: form.refundPercent,
      reason: form.reason,
    });
    setAddOpen(false);
    toast.success("Đã xác nhận bảo lưu học viên");
  };

  const handleResume = (id: string) => {
    updateReserveStatus(id, "resumed", new Date().toLocaleDateString("vi-VN"));
    toast.success("Đã kích hoạt lại học tập cho học viên");
  };

  return (
    <div className="pb-10">
      <div className="relative mb-6 p-6 rounded-2xl overflow-hidden bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: "28px 28px" }} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-amber-200 text-[13px] font-semibold mb-1 uppercase">Học viên & Tuyển sinh</p>
            <h1 className="text-[24px] font-extrabold">Bảo lưu</h1>
            <p className="text-amber-100/70 text-[14px] mt-1">Tạm dừng và khôi phục quá trình học theo chính sách trung tâm</p>
          </div>
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white px-4 py-2.5 rounded-xl text-[14px] font-semibold">
            <Plus className="w-4 h-4" /> Tạo bảo lưu
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        {[
          { label: "Đang bảo lưu", value: data.filter(d => d.status === "active").length, color: "text-amber-600" },
          { label: "Đã học lại", value: data.filter(d => d.status === "resumed").length, color: "text-emerald-600" },
          { label: "Hết hạn", value: data.filter(d => d.status === "expired").length, color: "text-rose-600" },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-4 text-center">
            <p className={`text-[28px] font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm học viên..." className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" /></div>
        <div className="flex gap-2">
          {[["all", "Tất cả"], ["active", "Đang BL"], ["resumed", "Đã học lại"], ["expired", "Hết hạn"]].map(([v, l]) => (
            <button key={v} onClick={() => setFilterStatus(v)} className={`px-3 py-1.5 rounded-full text-[13px] font-semibold transition-all ${filterStatus === v ? "bg-amber-600 text-white" : "bg-gray-100 dark:bg-white/5 text-muted-foreground hover:bg-gray-200 dark:hover:bg-white/10"}`}>{l}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[14px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-border bg-gray-50/50 dark:bg-white/[0.02]">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-[12px] uppercase">Học viên</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-[12px] uppercase hidden md:table-cell">Khóa học / Lý do</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-[12px] uppercase hidden lg:table-cell">Thời gian BL</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-[12px] uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground text-[12px] uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/[0.03]">
              {paginated.map(r => {
                const st = statusCfg[r.status];
                return (
                  <tr key={r.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] group transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-[#1a1a2e] dark:text-foreground">{r.studentName}</p>
                      <p className="text-[11px] font-mono text-muted-foreground">{r.studentCode}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <p className="font-medium text-[13px]">{r.courseName}</p>
                      <p className="text-[12px] text-muted-foreground italic">{r.reason}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <p className="text-[13px]">{r.reserveFrom} → {r.reserveTo}</p>
                      <p className="text-[12px] text-muted-foreground">{r.months} tháng · Hoàn {r.refundPercent}% phí</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold ${st.bg} ${st.text}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setDetailId(r.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"><Eye className="w-4 h-4 text-muted-foreground" /></button>
                        {r.status === "active" && (
                          <button onClick={() => handleResume(r.id)} className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-500/10" title="Kích hoạt học lại"><RotateCcw className="w-4 h-4 text-emerald-500" /></button>
                        )}
                      </div>
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

      {/* Add Modal */}
      <AnimatePresence>
        {addOpen && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAddOpen(false)} />
            <motion.div className="relative w-full max-w-md bg-white dark:bg-card rounded-2xl shadow-2xl overflow-hidden" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
              <div className="p-5 border-b border-gray-100 dark:border-border flex items-center justify-between">
                <h3 className="text-[17px] font-bold text-[#1a1a2e] dark:text-foreground">Tạo Bảo lưu</h3>
                <button onClick={() => setAddOpen(false)} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-[13px] font-semibold mb-1.5">Tên học viên *</label><input value={form.studentName} onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" /></div>
                  <div><label className="block text-[13px] font-semibold mb-1.5">Mã HV</label><input value={form.studentCode} onChange={e => setForm(f => ({ ...f, studentCode: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" /></div>
                </div>
                <div><label className="block text-[13px] font-semibold mb-1.5">Khóa học *</label><input value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" placeholder="Tên khóa học đang học" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-[13px] font-semibold mb-1.5">Ngày bảo lưu *</label><input type="date" value={form.reserveFrom} onChange={e => setForm(f => ({ ...f, reserveFrom: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" /></div>
                  <div><label className="block text-[13px] font-semibold mb-1.5">Thời gian BL (tháng)</label><select value={form.months} onChange={e => setForm(f => ({ ...f, months: +e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none">{[1,2,3,6,12].map(m => <option key={m} value={m}>{m} tháng</option>)}</select></div>
                </div>
                <div><label className="block text-[13px] font-semibold mb-1.5">% Hoàn học phí</label>
                  <div className="flex gap-2">{[0, 30, 50, 70, 80, 100].map(p => (<button key={p} onClick={() => setForm(f => ({ ...f, refundPercent: p }))} className={`flex-1 py-2 rounded-xl border text-[13px] font-semibold transition-all ${form.refundPercent === p ? "border-amber-400 bg-amber-50 dark:bg-amber-500/10 text-amber-700" : "border-gray-200 dark:border-border text-muted-foreground"}`}>{p}%</button>))}
                  </div>
                </div>
                {existingActiveReserves >= 1 && (
                  <div className={`flex items-start gap-2.5 p-3 rounded-xl border ${existingActiveReserves >= 2 ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30" : "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30"}`}>
                    <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${existingActiveReserves >= 2 ? "text-red-500" : "text-amber-500"}`} />
                    <div>
                      <p className={`text-[13px] font-semibold ${existingActiveReserves >= 2 ? "text-red-700 dark:text-red-400" : "text-amber-700 dark:text-amber-400"}`}>
                        {existingActiveReserves >= 2 ? "Đã đạt giới hạn bảo lưu!" : "Cảnh báo: Sắp đạt giới hạn"}
                      </p>
                      <p className="text-[12px] text-muted-foreground mt-0.5">
                        Học viên đang có {existingActiveReserves} bảo lưu hiệu lực. Tối đa 2 lần bảo lưu mỗi chương trình.
                      </p>
                    </div>
                  </div>
                )}
                <div><label className="block text-[13px] font-semibold mb-1.5">Lý do bảo lưu *</label><textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} rows={2} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none resize-none" placeholder="Lý do cụ thể..." /></div>
              </div>
              <div className="p-5 border-t border-gray-100 dark:border-border flex gap-3">
                <button onClick={() => setAddOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-border text-[14px] font-semibold hover:bg-gray-50 dark:hover:bg-white/5">Hủy</button>
                <button onClick={handleAdd} disabled={existingActiveReserves >= 2} className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[14px] font-semibold">Xác nhận bảo lưu</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

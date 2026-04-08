import { useState, useMemo } from "react";
import { useDocumentTitle, useEscapeKey } from "../../utils/hooks";
import { useUrlPagination } from "../../utils/useUrlPagination";
import { AnimatePresence, motion } from "motion/react";
import { Search, UserX, Plus, X, AlertTriangle, Eye, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "./Pagination";

interface DropoutRecord {
  id: string;
  studentName: string;
  studentCode: string;
  course: string;
  enrollDate: string;
  dropoutDate: string;
  completedPercent: number;
  reason: "Tài chính" | "Sức khỏe" | "Việc làm" | "Học không hiệu quả" | "Cá nhân" | "Khác";
  refundAmount: number;
  note: string;
  processedBy: string;
  status: "pending" | "confirmed";
}

const records: DropoutRecord[] = [
  { id: "1", studentName: "Phạm Bình Minh", studentCode: "HV-26-0004", course: "Kỹ thuật Hàn Điện Cơ bản", enrollDate: "10/01/2026", dropoutDate: "25/02/2026", completedPercent: 50, reason: "Việc làm", refundAmount: 1600000, note: "Được nhận vào làm không thể thu xếp lịch học", processedBy: "Giám đốc TT", status: "confirmed" },
  { id: "2", studentName: "Ngô Đức Long", studentCode: "HV-26-0039", course: "Tin học IC3", enrollDate: "05/01/2026", dropoutDate: "15/03/2026", completedPercent: 75, reason: "Học không hiệu quả", refundAmount: 0, note: "Đã học >75% — không hoàn phí theo quy định", processedBy: "Nguyễn Thị Thanh", status: "confirmed" },
  { id: "3", studentName: "Đinh Thị Nhung", studentCode: "HV-26-0022", course: "Tiếng Nhật N4", enrollDate: "15/03/2026", dropoutDate: "10/04/2026", completedPercent: 15, reason: "Tài chính", refundAmount: 4080000, note: "Học được 3 buổi — hoàn 85% học phí", processedBy: "", status: "pending" },
];

const reasonColor: Record<string, string> = {
  "Tài chính": "text-rose-600 bg-rose-500/10",
  "Sức khỏe": "text-amber-600 bg-amber-500/10",
  "Việc làm": "text-blue-600 bg-blue-500/10",
  "Học không hiệu quả": "text-violet-600 bg-violet-500/10",
  "Cá nhân": "text-gray-600 bg-gray-500/10",
  "Khác": "text-gray-600 bg-gray-500/10",
};

export function AdminStudentDropout() {
  useDocumentTitle("Thôi học");
  const [data, setData] = useState<DropoutRecord[]>(records);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const { page, pageSize, setPage } = useUrlPagination();
  const [addOpen, setAddOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState({ studentName: "", studentCode: "", course: "", completedPercent: 0, reason: "Tài chính" as DropoutRecord["reason"], refundAmount: 0, note: "" });

  useEscapeKey(() => { setAddOpen(false); setConfirmId(null); }, addOpen || !!confirmId);

  const filtered = useMemo(() => data.filter(d => {
    const matchSearch = !search || d.studentName.toLowerCase().includes(search.toLowerCase()) || d.studentCode.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || d.status === filterStatus;
    return matchSearch && matchStatus;
  }), [data, search, filterStatus]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const confirmItem = data.find(d => d.id === confirmId);

  const handleAdd = () => {
    if (!form.studentName || !form.course) { toast.error("Vui lòng điền đủ thông tin"); return; }
    const newRecord: DropoutRecord = {
      id: String(data.length + 1),
      enrollDate: "01/01/2026",
      dropoutDate: new Date().toLocaleDateString("vi-VN"),
      processedBy: "",
      status: "pending",
      studentName: form.studentName,
      studentCode: form.studentCode || `HV-26-${String(Math.floor(Math.random() * 900 + 100))}`,
      course: form.course,
      completedPercent: form.completedPercent,
      reason: form.reason,
      refundAmount: form.refundAmount,
      note: form.note,
    };
    setData(prev => [newRecord, ...prev]);
    setAddOpen(false);
    toast.success("Đã tạo yêu cầu thôi học — chờ phê duyệt");
  };

  const handleConfirm = (id: string) => {
    setData(prev => prev.map(d => d.id === id ? { ...d, status: "confirmed" as const, processedBy: "Admin" } : d));
    setConfirmId(null);
    toast.success("Đã xác nhận thôi học");
  };

  return (
    <div className="pb-10">
      <div className="relative mb-6 p-6 rounded-2xl overflow-hidden bg-gradient-to-r from-red-700 to-rose-800 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: "28px 28px" }} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-red-200 text-[13px] font-semibold mb-1 uppercase">Học viên & Tuyển sinh</p>
            <h1 className="text-[24px] font-extrabold">Thôi học</h1>
            <p className="text-red-100/70 text-[14px] mt-1">Xử lý thủ tục thôi học, hoàn học phí theo quy định</p>
          </div>
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white px-4 py-2.5 rounded-xl text-[14px] font-semibold">
            <Plus className="w-4 h-4" /> Tạo hồ sơ thôi học
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        {[
          { label: "Tổng thôi học", value: data.length, color: "text-rose-600" },
          { label: "Chờ phê duyệt", value: data.filter(d => d.status === "pending").length, color: "text-amber-600" },
          { label: "Đã hoàn phí", value: `${(data.reduce((s, d) => s + d.refundAmount, 0) / 1e6).toFixed(1)}tr`, color: "text-emerald-600" },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-4 text-center">
            <p className={`text-[24px] font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm học viên..." className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" /></div>
        <div className="flex gap-2">
          {[["all", "Tất cả"], ["pending", "Chờ duyệt"], ["confirmed", "Đã xác nhận"]].map(([v, l]) => (
            <button key={v} onClick={() => setFilterStatus(v)} className={`px-3 py-1.5 rounded-full text-[13px] font-semibold transition-all ${filterStatus === v ? "bg-rose-700 text-white" : "bg-gray-100 dark:bg-white/5 text-muted-foreground hover:bg-gray-200 dark:hover:bg-white/10"}`}>{l}</button>
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
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground text-[12px] uppercase hidden lg:table-cell">Tiến độ học</th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground text-[12px] uppercase">Hoàn phí</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-[12px] uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground text-[12px] uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/[0.03]">
              {paginated.map(r => (
                <tr key={r.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] group transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center"><UserX className="w-4 h-4 text-rose-500" /></div>
                      <div>
                        <p className="font-semibold text-[#1a1a2e] dark:text-foreground">{r.studentName}</p>
                        <p className="text-[11px] font-mono text-muted-foreground">{r.studentCode}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <p className="font-medium text-[13px]">{r.course}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold mt-0.5 ${reasonColor[r.reason]}`}>{r.reason}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-[18px] font-bold text-[#1a1a2e] dark:text-foreground">{r.completedPercent}%</span>
                      <div className="w-16 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full mt-1 overflow-hidden">
                        <div className={`h-full rounded-full ${r.completedPercent >= 75 ? "bg-rose-500" : r.completedPercent >= 50 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${r.completedPercent}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {r.refundAmount > 0 ? (
                      <p className="font-bold text-emerald-600">{r.refundAmount.toLocaleString("vi-VN")}đ</p>
                    ) : (
                      <p className="text-[13px] text-muted-foreground">Không hoàn</p>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    {r.status === "pending" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400">Chờ duyệt</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-semibold bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400">Đã xác nhận</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {r.status === "pending" && (
                        <button onClick={() => setConfirmId(r.id)} className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10" title="Xác nhận thôi học">
                          <CheckCircle className="w-4 h-4 text-rose-500" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-100 dark:border-border px-4 py-3">
          <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} onPageSizeChange={() => {}} />
        </div>
      </div>

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmId && confirmItem && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmId(null)} />
            <motion.div className="relative w-full max-w-sm bg-white dark:bg-card rounded-2xl shadow-2xl p-6 text-center" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
              <div className="w-14 h-14 bg-rose-100 dark:bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle className="w-7 h-7 text-rose-500" /></div>
              <h3 className="text-[18px] font-bold mb-2 text-[#1a1a2e] dark:text-foreground">Xác nhận Thôi học</h3>
              <p className="text-[14px] text-muted-foreground mb-1"><strong className="text-[#1a1a2e] dark:text-foreground">{confirmItem.studentName}</strong></p>
              <p className="text-[13px] text-muted-foreground mb-1">{confirmItem.course}</p>
              {confirmItem.refundAmount > 0 && (
                <p className="text-[14px] font-semibold text-emerald-600 my-2">Hoàn trả: {confirmItem.refundAmount.toLocaleString("vi-VN")}đ</p>
              )}
              <p className="text-[13px] text-rose-500 font-semibold mb-5">Hành động này sẽ chấm dứt tư cách học viên.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmId(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-border font-semibold text-[14px] hover:bg-gray-50 dark:hover:bg-white/5">Hủy</button>
                <button onClick={() => handleConfirm(confirmId)} className="flex-1 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-semibold text-[14px]">Xác nhận</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Modal */}
      <AnimatePresence>
        {addOpen && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAddOpen(false)} />
            <motion.div className="relative w-full max-w-md bg-white dark:bg-card rounded-2xl shadow-2xl overflow-hidden" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
              <div className="p-5 border-b border-gray-100 dark:border-border flex items-center justify-between">
                <h3 className="text-[17px] font-bold text-[#1a1a2e] dark:text-foreground">Tạo Hồ sơ Thôi học</h3>
                <button onClick={() => setAddOpen(false)} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-[13px] font-semibold mb-1.5">Tên học viên *</label><input value={form.studentName} onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" /></div>
                  <div><label className="block text-[13px] font-semibold mb-1.5">Mã HV</label><input value={form.studentCode} onChange={e => setForm(f => ({ ...f, studentCode: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" /></div>
                </div>
                <div><label className="block text-[13px] font-semibold mb-1.5">Khóa học *</label><input value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-[13px] font-semibold mb-1.5">Đã học (%)</label><input type="number" min={0} max={100} value={form.completedPercent} onChange={e => setForm(f => ({ ...f, completedPercent: +e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" /></div>
                  <div><label className="block text-[13px] font-semibold mb-1.5">Lý do</label><select value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value as DropoutRecord["reason"] }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none"><option>Tài chính</option><option>Sức khỏe</option><option>Việc làm</option><option>Học không hiệu quả</option><option>Cá nhân</option><option>Khác</option></select></div>
                </div>
                <div><label className="block text-[13px] font-semibold mb-1.5">Số tiền hoàn trả (đồng)</label><input type="number" value={form.refundAmount} onChange={e => setForm(f => ({ ...f, refundAmount: +e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" /></div>
                <div><label className="block text-[13px] font-semibold mb-1.5">Ghi chú</label><textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} rows={2} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none resize-none" /></div>
              </div>
              <div className="p-5 border-t border-gray-100 dark:border-border flex gap-3">
                <button onClick={() => setAddOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-border text-[14px] font-semibold hover:bg-gray-50 dark:hover:bg-white/5">Hủy</button>
                <button onClick={handleAdd} className="flex-1 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-[14px] font-semibold">Tạo hồ sơ</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

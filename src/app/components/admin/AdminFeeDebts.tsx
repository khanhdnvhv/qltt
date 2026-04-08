import { useState, useMemo } from "react";
import { useDocumentTitle } from "../../utils/hooks";
import { useUrlFilters } from "../../utils/useUrlFilters";
import { useUrlPagination } from "../../utils/useUrlPagination";
import { AnimatePresence, motion } from "motion/react";
import {
  Search, AlertTriangle, Clock, MessageSquare,
  Download, Phone, Mail, TrendingDown, Users, Banknote, X, Bell
} from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "./Pagination";

interface DebtRecord {
  id: string;
  studentName: string;
  studentCode: string;
  phone: string;
  email: string;
  course: string;
  periodName: string;
  totalFee: number;
  paidAmount: number;
  debtAmount: number;
  dueDate: string;
  daysOverdue: number;
  reminderCount: number;
  lastReminderDate: string | null;
  status: "new" | "reminded" | "negotiating" | "escalated";
}

const debts: DebtRecord[] = [
  { id: "1", studentName: "Ngô Đức Long", studentCode: "HV-26-0039", phone: "0901112233", email: "long.ngo@gmail.com", course: "Tin học IC3", periodName: "Học phí Kỳ 1 - Tin học IC3", totalFee: 2800000, paidAmount: 0, debtAmount: 2800000, dueDate: "20/01/2026", daysOverdue: 54, reminderCount: 3, lastReminderDate: "01/03/2026", status: "escalated" },
  { id: "2", studentName: "Đinh Thị Nhung", studentCode: "HV-26-0022", phone: "0902223344", email: "nhung.dinh@gmail.com", course: "Tiếng Nhật N4", periodName: "Học phí Kỳ 1 - Tiếng Nhật N4", totalFee: 4800000, paidAmount: 2400000, debtAmount: 2400000, dueDate: "30/03/2026", daysOverdue: 15, reminderCount: 1, lastReminderDate: "05/04/2026", status: "reminded" },
  { id: "3", studentName: "Trương Minh Khoa", studentCode: "HV-26-0018", phone: "0903334455", email: "khoa.truong@gmail.com", course: "Hàn Điện Cơ bản", periodName: "Học phí Kỳ 1 - Hàn Điện", totalFee: 3200000, paidAmount: 1600000, debtAmount: 1600000, dueDate: "15/02/2026", daysOverdue: 58, reminderCount: 2, lastReminderDate: "20/03/2026", status: "negotiating" },
  { id: "4", studentName: "Lưu Thị Hoa", studentCode: "HV-26-0033", phone: "0904445566", email: "hoa.luu@gmail.com", course: "TOEIC 450", periodName: "Học phí Tháng 2 - TOEIC", totalFee: 4200000, paidAmount: 0, debtAmount: 4200000, dueDate: "15/02/2026", daysOverdue: 58, reminderCount: 1, lastReminderDate: "25/02/2026", status: "reminded" },
  { id: "5", studentName: "Phan Thị Lan", studentCode: "HV-26-0041", phone: "0905556677", email: "lan.phan@gmail.com", course: "Tiếng Anh B1 VSTEP", periodName: "Học phí Kỳ 2 - Tiếng Anh B1", totalFee: 3500000, paidAmount: 0, debtAmount: 3500000, dueDate: "15/03/2026", daysOverdue: 30, reminderCount: 0, lastReminderDate: null, status: "new" },
  { id: "6", studentName: "Bùi Văn Hải", studentCode: "HV-26-0044", phone: "0906667788", email: "hai.bui@gmail.com", course: "Lập trình Web", periodName: "Học phí Kỳ 1 - Web Frontend", totalFee: 8500000, paidAmount: 4000000, debtAmount: 4500000, dueDate: "25/03/2026", daysOverdue: 20, reminderCount: 1, lastReminderDate: "01/04/2026", status: "reminded" },
  { id: "7", studentName: "Nguyễn Thị Kim Chi", studentCode: "HV-26-0047", phone: "0907778899", email: "chi.nguyen@gmail.com", course: "Nấu ăn Cơ bản", periodName: "Học phí Kỳ 1 - Nấu ăn", totalFee: 3200000, paidAmount: 3200000 * 0.3, debtAmount: 3200000 * 0.7, dueDate: "20/01/2026", daysOverdue: 85, reminderCount: 4, lastReminderDate: "08/04/2026", status: "escalated" },
];

const statusCfg = {
  new: { label: "Mới phát sinh", bg: "bg-gray-100 dark:bg-white/5", text: "text-gray-600 dark:text-gray-400" },
  reminded: { label: "Đã nhắc nợ", bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-700 dark:text-blue-400" },
  negotiating: { label: "Đang thỏa thuận", bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-700 dark:text-amber-400" },
  escalated: { label: "Chuyển xử lý", bg: "bg-rose-50 dark:bg-rose-500/10", text: "text-rose-700 dark:text-rose-400" },
};

const urgencyColor = (days: number) => {
  if (days > 60) return "text-rose-600 bg-rose-500/10";
  if (days > 30) return "text-amber-600 bg-amber-500/10";
  return "text-blue-600 bg-blue-500/10";
};

const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

export function AdminFeeDebts() {
  useDocumentTitle("Công nợ Học viên");
  const [data, setData] = useState<DebtRecord[]>(debts);
  const [search, setSearch] = useState("");
  const [filters, setFilter] = useUrlFilters({ status: "all" });
  const { page, pageSize, setPage } = useUrlPagination();

  const filtered = useMemo(() => data.filter(d => {
    const s = search.toLowerCase();
    const matchSearch = !search || d.studentName.toLowerCase().includes(s) || d.studentCode.toLowerCase().includes(s) || d.course.toLowerCase().includes(s);
    const matchStatus = filters.status === "all" || d.status === filters.status;
    return matchSearch && matchStatus;
  }), [data, search, filters]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const stats = useMemo(() => ({
    total: data.length,
    totalDebt: data.reduce((s, d) => s + d.debtAmount, 0),
    critical: data.filter(d => d.daysOverdue > 30).length,
    escalated: data.filter(d => d.status === "escalated").length,
  }), [data]);

  const handleRemind = (id: string) => {
    setData(prev => prev.map(d => d.id === id ? { ...d, status: "reminded" as const, reminderCount: d.reminderCount + 1, lastReminderDate: new Date().toLocaleDateString("vi-VN") } : d));
    toast.success("Đã gửi tin nhắn nhắc nợ qua SMS/Zalo");
  };

  const handleEscalate = (id: string) => {
    setData(prev => prev.map(d => d.id === id ? { ...d, status: "escalated" as const } : d));
    toast.success("Đã chuyển xử lý cho Ban Giám đốc");
  };

  return (
    <div className="pb-10">
      <div className="relative mb-6 p-6 rounded-2xl overflow-hidden bg-gradient-to-r from-red-700 to-rose-700 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: "28px 28px" }} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-red-200 text-[13px] font-semibold mb-1 tracking-wide uppercase">Module Quản lý Học phí</p>
            <h1 className="text-[24px] font-extrabold">Công nợ Học viên</h1>
            <p className="text-red-100/70 text-[14px] mt-1">Theo dõi học viên chưa thanh toán, nhắc nợ tự động</p>
          </div>
          <button onClick={() => toast.success("Đã xuất danh sách công nợ (.xlsx)")} className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white px-4 py-2.5 rounded-xl text-[14px] font-semibold">
            <Download className="w-4 h-4" /> Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Học viên nợ", value: stats.total, color: "text-rose-600", bg: "bg-rose-500/10", icon: Users },
          { label: "Tổng công nợ", value: `${(stats.totalDebt / 1e6).toFixed(1)}tr`, color: "text-red-700", bg: "bg-red-500/10", icon: Banknote },
          { label: "Quá hạn >30 ngày", value: stats.critical, color: "text-amber-600", bg: "bg-amber-500/10", icon: AlertTriangle },
          { label: "Chuyển xử lý", value: stats.escalated, color: "text-rose-700", bg: "bg-rose-700/10", icon: TrendingDown },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <div>
              <p className={`text-[20px] font-extrabold ${s.color} leading-none`}>{s.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm học viên, khóa học..." className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[["all", "Tất cả"], ["new", "Mới"], ["reminded", "Đã nhắc"], ["negotiating", "Thỏa thuận"], ["escalated", "Chuyển XL"]].map(([v, l]) => (
            <button key={v} onClick={() => setFilter("status", v)} className={`px-3 py-1.5 rounded-full text-[13px] font-semibold transition-all ${filters.status === v ? "bg-rose-600 text-white" : "bg-gray-100 dark:bg-white/5 text-muted-foreground hover:bg-gray-200 dark:hover:bg-white/10"}`}>{l}</button>
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
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-[12px] uppercase hidden md:table-cell">Khóa học</th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground text-[12px] uppercase">Số nợ</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground text-[12px] uppercase hidden lg:table-cell">Quá hạn</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-[12px] uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground text-[12px] uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/[0.03]">
              {paginated.map(d => {
                const st = statusCfg[d.status];
                return (
                  <tr key={d.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] group transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-[#1a1a2e] dark:text-foreground">{d.studentName}</p>
                      <p className="text-[11px] font-mono text-muted-foreground">{d.studentCode}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <a href={`tel:${d.phone}`} className="text-[11px] text-muted-foreground hover:text-blue-500 flex items-center gap-0.5"><Phone className="w-3 h-3" />{d.phone}</a>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <p className="text-[13px]">{d.course}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Hạn: {d.dueDate}</p>
                      {d.reminderCount > 0 && <p className="text-[11px] text-blue-500">Đã nhắc {d.reminderCount} lần · {d.lastReminderDate}</p>}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <p className="font-bold text-[16px] text-rose-600">{fmt(d.debtAmount)}</p>
                      {d.paidAmount > 0 && <p className="text-[11px] text-emerald-500">Đã trả: {fmt(d.paidAmount)}</p>}
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-semibold ${urgencyColor(d.daysOverdue)}`}>
                        <Clock className="w-3 h-3" />{d.daysOverdue} ngày
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-semibold ${st.bg} ${st.text}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleRemind(d.id)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10" title="Gửi nhắc nợ"><Bell className="w-4 h-4 text-blue-500" /></button>
                        {d.status !== "escalated" && d.daysOverdue > 30 && (
                          <button onClick={() => handleEscalate(d.id)} className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10" title="Chuyển xử lý"><AlertTriangle className="w-4 h-4 text-rose-500" /></button>
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
    </div>
  );
}

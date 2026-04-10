import { useState, useEffect, useMemo } from "react";
import { DashboardSkeleton } from "../ui/SkeletonLoaders";
import { useDocumentTitle } from "../../utils/hooks";
import { motion } from "motion/react";
import { useOutletContext, useNavigate } from "react-router";
import {
  Users, BookOpen, GraduationCap, Building2, TrendingUp, ArrowUpRight, ArrowDownRight,
  FileText, Award, Banknote, PercentCircle, UserPlus, Receipt, ClipboardList,
  CheckCircle2, Clock, AlertTriangle, Activity, RefreshCcw,
} from "lucide-react";
import { toast } from "sonner";
import { useAppData } from "../../context/AppDataContext";

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtVnd(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} tỷ`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} tr`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return n.toLocaleString();
}

function parseDDMMYYYY(s: string): Date | null {
  const p = s.split("/");
  if (p.length !== 3) return null;
  return new Date(+p[2], +p[1] - 1, +p[0]);
}

// ── Audit log action labels ───────────────────────────────────────────────────
const AUDIT_ICON: Record<string, { icon: any; cls: string; bg: string }> = {
  ENROLL:    { icon: UserPlus,       cls: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-500/10" },
  ISSUED:    { icon: Award,          cls: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
  ADVANCE:   { icon: CheckCircle2,   cls: "text-violet-600",  bg: "bg-violet-50 dark:bg-violet-500/10" },
  RECEIPT:   { icon: Receipt,        cls: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-500/10" },
  TRANSFER:  { icon: RefreshCcw,     cls: "text-sky-600",     bg: "bg-sky-50 dark:bg-sky-500/10" },
  DROPOUT:   { icon: AlertTriangle,  cls: "text-rose-600",    bg: "bg-rose-50 dark:bg-rose-500/10" },
  DEFAULT:   { icon: Activity,       cls: "text-gray-500",    bg: "bg-gray-50 dark:bg-white/10" },
};
function auditIcon(action: string) {
  const key = Object.keys(AUDIT_ICON).find(k => action.includes(k)) ?? "DEFAULT";
  return AUDIT_ICON[key];
}
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
}

// ── Static fallback activity (shown when auditLogs is empty) ──────────────────
const FALLBACK_ACTIVITY = [
  { id: "f1", action: "ENROLL",   actor: "GV. Nguyễn Thị Lan",    detail: "Nguyễn Trung Tín → Tiếng Anh B1 VSTEP",       time: new Date(Date.now() - 3*3600000).toISOString() },
  { id: "f2", action: "ISSUED",   actor: "admin",                  detail: "Cấp chứng chỉ cho Hoàng Thanh Thảo",          time: new Date(Date.now() - 5*3600000).toISOString() },
  { id: "f3", action: "RECEIPT",  actor: "Nguyễn Thị Thanh",       detail: "Thu học phí 3.500.000đ — Phan Thị Yến",       time: new Date(Date.now() - 8*3600000).toISOString() },
  { id: "f4", action: "ADVANCE",  actor: "admin",                  detail: "Lớp TOEIC-K27 chuyển sang Hoạt động",         time: new Date(Date.now() - 12*3600000).toISOString() },
  { id: "f5", action: "TRANSFER", actor: "admin",                  detail: "Chuyển lớp: Vũ Ngọc Trâm → KT-TH-K09",       time: new Date(Date.now() - 20*3600000).toISOString() },
];

// ── Mini bar chart (pure CSS) ─────────────────────────────────────────────────
function MiniBar({ data }: { data: { month: string; value: number }[] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1 h-36">
      {data.map((d, i) => (
        <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
          {d.value > 0 && (
            <span className="text-[10px] text-muted-foreground font-medium leading-none">{d.value}</span>
          )}
          <motion.div
            initial={{ height: 0 }} animate={{ height: `${(d.value / max) * 100}%` }}
            transition={{ delay: 0.1 + i * 0.03, duration: 0.45, ease: "easeOut" }}
            className="w-full rounded-t-sm min-h-[2px]"
            style={{ background: i === data.length - 1 ? "var(--color-primary, #531ab4)" : "rgb(99 102 241 / 0.35)" }}
          />
          <span className="text-[10px] text-muted-foreground">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

// ── Donut chart (SVG) ─────────────────────────────────────────────────────────
function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, g) => s + g.value, 0);
  if (total === 0) return <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-white/5 mx-auto"/>;
  let angle = -90;
  const r = 40, cx = 50, cy = 50, stroke = 16;
  const arcs = segments.map(seg => {
    const pct = seg.value / total;
    const a = pct * 360;
    const start = angle;
    angle += a;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(start));
    const y1 = cy + r * Math.sin(toRad(start));
    const x2 = cx + r * Math.cos(toRad(start + a - 0.5));
    const y2 = cy + r * Math.sin(toRad(start + a - 0.5));
    const large = a > 180 ? 1 : 0;
    return { ...seg, d: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`, pct };
  });
  return (
    <svg viewBox="0 0 100 100" className="w-24 h-24 mx-auto">
      {arcs.map(arc => (
        <path key={arc.label} d={arc.d} fill="none" stroke={arc.color} strokeWidth={stroke} strokeLinecap="butt"/>
      ))}
      <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-[12px]" style={{ fontSize: 12, fontWeight: 800 }}>{total}</text>
      <text x="50" y="62" textAnchor="middle" className="fill-muted-foreground text-[8px]" style={{ fontSize: 8 }}>CC</text>
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function AdminDashboard() {
  useDocumentTitle("Báo cáo Thống kê");
  const { adminRole } = useOutletContext<{ adminRole: "department" | "center" }>();
  const navigate = useNavigate();
  const isDepartment = adminRole === "department";

  const {
    students, classes, enrollments, examResults, certificates,
    feeReceipts, trainingPlans, auditLogs, centers, resetDemo,
  } = useAppData();

  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setIsLoading(false), 400); return () => clearTimeout(t); }, []);

  // ── Computed KPIs ──────────────────────────────────────────────────────────
  const kpi = useMemo(() => {
    const learning     = students.filter(s => s.status === "learning").length;
    const graduated    = students.filter(s => s.status === "graduated").length;
    const dropped      = students.filter(s => s.status === "dropped" || s.status === "suspended").length;
    const activeClasses = classes.filter(c => c.status === "Hoạt động" || c.status === "Tuyển sinh").length;
    const issuedCerts  = certificates.filter(c => c.status === "ISSUED").length;
    const pendingCerts = certificates.filter(c => c.status === "PENDING").length;
    const pendingPlans = trainingPlans.filter(p => p.status === "pending" || p.status === "revision").length;
    const totalFee     = feeReceipts.filter(r => r.status === "confirmed").reduce((s, r) => s + r.finalAmount, 0);
    const passRate     = examResults.length > 0
      ? Math.round((examResults.filter(r => r.status === "pass").length / examResults.length) * 100) : 0;
    const activeArr    = classes.filter(c => c.status === "Hoạt động" || c.status === "Tuyển sinh");
    const avgFill      = activeArr.length > 0
      ? Math.round(activeArr.reduce((s, c) => s + (c.currentStudents / c.maxStudents), 0) / activeArr.length * 100) : 0;
    return { learning, graduated, dropped, activeClasses, issuedCerts, pendingCerts, pendingPlans, totalFee, passRate, avgFill };
  }, [students, classes, certificates, trainingPlans, feeReceipts, examResults]);

  // ── Monthly enrollment from real enrollDate ────────────────────────────────
  const monthlyChart = useMemo(() => {
    const counts = Array.from({ length: 12 }, (_, i) => ({ month: `T${i + 1}`, value: 0 }));
    enrollments.forEach(e => {
      const d = parseDDMMYYYY(e.enrollDate);
      if (d) { const m = d.getMonth(); if (m >= 0 && m < 12) counts[m].value++; }
    });
    return counts;
  }, [enrollments]);

  // ── Top courses by enrollment count ───────────────────────────────────────
  const topCourses = useMemo(() => {
    const map = new Map<string, { name: string; count: number }>();
    enrollments.forEach(e => {
      if (!map.has(e.courseId)) map.set(e.courseId, { name: e.courseName, count: 0 });
      map.get(e.courseId)!.count++;
    });
    const arr = Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 5);
    const maxC = arr[0]?.count || 1;
    return arr.map(c => ({ ...c, pct: Math.round((c.count / maxC) * 100) }));
  }, [enrollments]);

  // ── Certificate status for donut ───────────────────────────────────────────
  const certSegments = useMemo(() => [
    { label: "Đã phát", value: kpi.issuedCerts,  color: "#10b981" },
    { label: "Đã in",   value: certificates.filter(c => c.status === "PRINTED").length, color: "#8b5cf6" },
    { label: "Chờ in",  value: kpi.pendingCerts,  color: "#3b82f6" },
  ], [certificates, kpi]);

  // ── Activity feed (real or fallback) ──────────────────────────────────────
  const activityFeed = useMemo(() => {
    if (auditLogs.length > 0) return auditLogs.slice(0, 8);
    return FALLBACK_ACTIVITY;
  }, [auditLogs]);

  // ── Center comparison for department view ─────────────────────────────────
  const centerRanking = useMemo(() =>
    [...centers].sort((a, b) => b.currentStudents - a.currentStudents).slice(0, 5),
    [centers]
  );
  const maxCenterStudents = centerRanking[0]?.currentStudents || 1;

  if (isLoading) return <DashboardSkeleton />;

  // ── Department view ────────────────────────────────────────────────────────
  if (isDepartment) return (
    <div className="pb-10 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] sm:text-[28px] font-black text-[#1a1a2e] dark:text-foreground tracking-tight">
            Báo cáo Thống kê Toàn tỉnh
          </h1>
          <p className="text-[14px] text-muted-foreground mt-0.5">
            Số liệu tổng quan mạng lưới GDNN-GDTX — {centers.length} trung tâm · Nghệ An
          </p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <button
            onClick={() => toast.success("Đang tổng hợp báo cáo Excel...")}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-[14px] font-semibold hover:opacity-90 transition-opacity shadow-sm"
          >
            <FileText className="w-4 h-4"/> Kết xuất Báo cáo Sở
          </button>
          <button
            onClick={() => { if (confirm("Reset toàn bộ dữ liệu demo về ban đầu?")) { resetDemo(); toast.success("Đã reset dữ liệu demo!"); }}}
            className="flex items-center gap-2 border border-gray-200 dark:border-border text-muted-foreground px-3 py-2.5 rounded-xl text-[13px] font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            title="Reset dữ liệu demo"
          >
            <RefreshCcw className="w-3.5 h-3.5"/>
          </button>
        </div>
      </div>

      {/* KPI row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Users,       label: "Học viên đang học",    value: kpi.learning.toLocaleString(),     change: "+8.5%", up: true,  color: "#3b82f6", bg: "from-blue-50 to-indigo-50 dark:from-blue-500/5 dark:to-indigo-500/5" },
          { icon: BookOpen,    label: "Lớp đang hoạt động",   value: kpi.activeClasses.toString(),       change: "+3",    up: true,  color: "#10b981", bg: "from-emerald-50 to-teal-50 dark:from-emerald-500/5 dark:to-teal-500/5" },
          { icon: Award,       label: "Chứng chỉ đã cấp",     value: kpi.issuedCerts.toString(),         change: "+23%",  up: true,  color: "#f26522", bg: "from-orange-50 to-amber-50 dark:from-orange-500/5 dark:to-amber-500/5" },
          { icon: FileText,    label: "KH chờ phê duyệt",     value: kpi.pendingPlans.toString(),        change: kpi.pendingPlans > 0 ? `+${kpi.pendingPlans}` : "0", up: kpi.pendingPlans === 0, color: "#dc2f3c", bg: "from-red-50 to-rose-50 dark:from-red-500/5 dark:to-rose-500/5" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className={`bg-gradient-to-br ${s.bg} rounded-2xl p-4 border border-gray-100/60 dark:border-border`}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-white/80 dark:bg-white/10 flex items-center justify-center shadow-sm">
                <s.icon className="w-4.5 h-4.5" style={{ color: s.color }}/>
              </div>
              <span className={`text-[12px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${s.up ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" : "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"}`}>
                {s.up ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownRight className="w-3 h-3"/>}{s.change}
              </span>
            </div>
            <p className="text-[22px] font-black text-[#1a1a2e] dark:text-foreground">{s.value}</p>
            <p className="text-[13px] text-muted-foreground mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* KPI row 2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: GraduationCap, label: "Đã tốt nghiệp",     value: kpi.graduated.toString(),          color: "#6366f1", cls: "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400" },
          { icon: Banknote,      label: "Thu học phí",        value: fmtVnd(kpi.totalFee),              color: "#10b981", cls: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400" },
          { icon: PercentCircle, label: "Tỉ lệ điền lớp",    value: `${kpi.avgFill}%`,                 color: "#f59e0b", cls: "bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20 text-amber-700 dark:text-amber-400" },
          { icon: TrendingUp,    label: "Tỉ lệ đạt kỳ thi",  value: `${kpi.passRate}%`,                color: "#8b5cf6", cls: "bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20 text-purple-700 dark:text-purple-400" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 + i * 0.04 }}
            className={`rounded-2xl p-4 border ${s.cls}`}>
            <s.icon className="w-5 h-5 mb-2" style={{ color: s.color }}/>
            <p className="text-[22px] font-black">{s.value}</p>
            <p className="text-[13px] opacity-70 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Monthly enrollment bar */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
          className="lg:col-span-2 bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[15px] font-bold text-[#1a1a2e] dark:text-foreground">Ghi danh theo Tháng</h2>
              <p className="text-[12.5px] text-muted-foreground">Số học viên ghi danh mới trong năm</p>
            </div>
            <span className="text-[12px] font-semibold text-primary bg-primary/10 px-3 py-1 rounded-lg">{enrollments.length} HV tổng</span>
          </div>
          <MiniBar data={monthlyChart}/>
        </motion.div>

        {/* Top courses */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}
          className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-5">
          <h2 className="text-[15px] font-bold text-[#1a1a2e] dark:text-foreground mb-4">Khóa học Nổi bật</h2>
          <div className="space-y-3">
            {topCourses.map((c, i) => (
              <div key={c.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px] font-semibold text-[#1a1a2e] dark:text-foreground truncate max-w-[160px]">{c.name}</span>
                  <span className="text-[12px] text-muted-foreground shrink-0">{c.count} HV</span>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${c.pct}%` }} transition={{ delay: 0.3 + i * 0.05, duration: 0.45 }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent"/>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom row: Cert distribution + Center ranking + Activity */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Cert donut */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-5">
          <h2 className="text-[15px] font-bold text-[#1a1a2e] dark:text-foreground mb-4">Trạng thái Chứng chỉ</h2>
          <DonutChart segments={certSegments}/>
          <div className="mt-4 space-y-2">
            {certSegments.map(s => (
              <div key={s.label} className="flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }}/>
                  <span className="text-muted-foreground">{s.label}</span>
                </div>
                <span className="font-semibold text-[#1a1a2e] dark:text-foreground">{s.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Center ranking */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}
          className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-5">
          <h2 className="text-[15px] font-bold text-[#1a1a2e] dark:text-foreground mb-4">Trung tâm lớn nhất</h2>
          <div className="space-y-3">
            {centerRanking.map((c, i) => (
              <div key={c.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[11px] font-bold text-muted-foreground w-4 shrink-0">{i + 1}</span>
                    <span className="text-[13px] font-semibold text-[#1a1a2e] dark:text-foreground truncate">{c.shortName}</span>
                  </div>
                  <span className="text-[12px] text-muted-foreground shrink-0">{c.currentStudents.toLocaleString()}</span>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden ml-6">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(c.currentStudents / maxCenterStudents) * 100}%` }} transition={{ delay: 0.35 + i * 0.05, duration: 0.45 }}
                    className="h-full rounded-full" style={{ background: ["#6366f1","#10b981","#f59e0b","#3b82f6","#ec4899"][i] }}/>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => navigate("/admin/center-profile")} className="mt-4 text-[12.5px] text-primary hover:underline font-medium">
            Xem tất cả trung tâm →
          </button>
        </motion.div>

        {/* Activity feed */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
          className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-5 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-bold text-[#1a1a2e] dark:text-foreground">Nhật ký Hoạt động</h2>
            <span className="text-[12px] text-muted-foreground">{activityFeed.length} mục</span>
          </div>
          <div className="space-y-0 relative border-l-2 border-gray-100 dark:border-border ml-2.5 pl-4 overflow-y-auto max-h-[280px]">
            {activityFeed.map((entry) => {
              const ai = auditIcon("action" in entry ? (entry as any).action : entry.action);
              const AiIcon = ai.icon;
              const detail = "detail" in entry ? entry.detail : (entry as any).detail || "";
              const time = "time" in entry ? entry.time : "";
              return (
                <div key={entry.id} className="relative py-2.5">
                  <div className={`absolute -left-[22px] w-4 h-4 rounded-full ${ai.bg} flex items-center justify-center border-2 border-white dark:border-card`}>
                    <AiIcon className={`w-2 h-2 ${ai.cls}`}/>
                  </div>
                  <p className="text-[12.5px] font-medium text-[#1a1a2e] dark:text-foreground line-clamp-1">{detail}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{timeAgo(time)}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );

  // ── Center view ───────────────────────────────────────────────────────────
  return (
    <div className="pb-10 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] sm:text-[28px] font-black text-[#1a1a2e] dark:text-foreground tracking-tight">
            Dashboard Trung tâm
          </h1>
          <p className="text-[14px] text-muted-foreground mt-0.5">Quản trị nhanh các nghiệp vụ đào tạo</p>
        </div>
        <button onClick={() => { if (confirm("Reset dữ liệu demo về ban đầu?")) { resetDemo(); toast.success("Đã reset dữ liệu demo!"); }}}
          className="self-start flex items-center gap-2 border border-gray-200 dark:border-border text-muted-foreground px-3 py-2 rounded-xl text-[13px] font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
          <RefreshCcw className="w-3.5 h-3.5"/> Reset Demo
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Users,        label: "Đang học",        value: kpi.learning.toString(),         color: "#3b82f6", bg: "from-blue-50 to-indigo-50 dark:from-blue-500/5 dark:to-indigo-500/5",   badge: kpi.learning > 0 ? "Hoạt động" : "", badgeCls: "bg-blue-100 text-blue-700" },
          { icon: BookOpen,     label: "Lớp mở",          value: kpi.activeClasses.toString(),    color: "#10b981", bg: "from-emerald-50 to-teal-50 dark:from-emerald-500/5 dark:to-teal-500/5", badge: `${kpi.avgFill}% điền`, badgeCls: "bg-emerald-100 text-emerald-700" },
          { icon: Banknote,     label: "Thu học phí",     value: fmtVnd(kpi.totalFee),            color: "#f59e0b", bg: "from-amber-50 to-orange-50 dark:from-amber-500/5 dark:to-orange-500/5", badge: `${feeReceipts.length} phiếu`, badgeCls: "bg-amber-100 text-amber-700" },
          { icon: FileText,     label: "KH chờ duyệt",    value: kpi.pendingPlans.toString(),     color: "#8b5cf6", bg: "from-violet-50 to-purple-50 dark:from-violet-500/5 dark:to-purple-500/5", badge: kpi.pendingPlans > 0 ? "Cần xử lý" : "Đã ổn", badgeCls: kpi.pendingPlans > 0 ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`bg-gradient-to-br ${s.bg} rounded-2xl p-4 border border-gray-100/60 dark:border-border`}>
            <div className="flex items-center justify-between mb-2">
              <s.icon className="w-5 h-5" style={{ color: s.color }}/>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${s.badgeCls}`}>{s.badge}</span>
            </div>
            <p className="text-[24px] font-black text-[#1a1a2e] dark:text-foreground">{s.value}</p>
            <p className="text-[13px] text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
        className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-5">
        <h2 className="text-[15px] font-bold text-[#1a1a2e] dark:text-foreground mb-3">Thao tác Nhanh</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: UserPlus,     label: "Nhập học",          path: "/admin/students/enrollment", color: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20" },
            { icon: Receipt,      label: "Thu học phí",        path: "/admin/fee-receipts",        color: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20" },
            { icon: ClipboardList,label: "Kết quả thi",        path: "/admin/exam-results",        color: "bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-500/20" },
            { icon: Award,        label: "Cấp chứng chỉ",     path: "/admin/manage-certificates", color: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20" },
          ].map(a => (
            <button key={a.label} onClick={() => navigate(a.path)}
              className={`flex flex-col items-center gap-2 py-4 rounded-2xl border border-transparent transition-all ${a.color}`}>
              <a.icon className="w-5 h-5"/>
              <span className="text-[13px] font-semibold">{a.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
          className="lg:col-span-2 bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-bold text-[#1a1a2e] dark:text-foreground">Ghi danh theo Tháng</h2>
            <span className="text-[12px] font-semibold text-primary bg-primary/10 px-3 py-1 rounded-lg">{enrollments.length} tổng</span>
          </div>
          <MiniBar data={monthlyChart}/>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
          className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-5">
          <h2 className="text-[15px] font-bold text-[#1a1a2e] dark:text-foreground mb-4">Chứng chỉ</h2>
          <DonutChart segments={certSegments}/>
          <div className="mt-4 space-y-2">
            {certSegments.map(s => (
              <div key={s.label} className="flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }}/>
                  <span className="text-muted-foreground">{s.label}</span>
                </div>
                <span className="font-bold text-[#1a1a2e] dark:text-foreground">{s.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent enrollments */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}
        className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-bold text-[#1a1a2e] dark:text-foreground">Ghi danh Gần đây</h2>
          <button onClick={() => navigate("/admin/students")} className="text-[12.5px] text-primary hover:underline font-medium">Xem tất cả →</button>
        </div>
        <div className="space-y-2">
          {enrollments.slice(0, 6).map(e => (
            <div key={e.id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-border/50 last:border-0">
              <div className="min-w-0">
                <p className="text-[13.5px] font-semibold text-[#1a1a2e] dark:text-foreground">{e.studentName}</p>
                <p className="text-[12px] text-muted-foreground">{e.courseName} · {e.enrollDate}</p>
              </div>
              <span className={`text-[11.5px] font-bold px-2 py-0.5 rounded-lg shrink-0 ml-3 ${
                e.status === "active" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" :
                e.status === "completed" ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" :
                e.status === "reserve" ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" :
                "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
              }`}>
                {e.status === "active" ? "Đang học" : e.status === "completed" ? "Hoàn thành" : e.status === "reserve" ? "Bảo lưu" : "Thôi học"}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

import { useState, useEffect, useMemo } from "react";
import { DashboardSkeleton } from "../ui/SkeletonLoaders";
import { useDocumentTitle } from "../../utils/hooks";
import { motion, AnimatePresence } from "motion/react";
import { useOutletContext } from "react-router";
import {
  Users, BookOpen, GraduationCap, Building2, TrendingUp, ArrowUpRight, ArrowDownRight,
  UserPlus, Eye, BarChart3, Activity,
  Edit, Trash2, CheckCircle, Tag, Clock, ChevronDown, Filter, Download,
  FileText, Award, ShieldAlert
} from "lucide-react";
import { exportCsv } from "../../utils/csv-export";
import { toast } from "sonner";
import { useAppData } from "../../context/AppDataContext";


const centerStats = [
  { icon: Users, label: "Học viên Đang học", value: "1,240", change: "+8.5%", up: true, color: "#3b82f6", bg: "from-blue-50 to-indigo-50" },
  { icon: BookOpen, label: "Lớp học Mở mới", value: "24", change: "+5", up: true, color: "#10b981", bg: "from-emerald-50 to-teal-50" },
  { icon: FileText, label: "Kế hoạch Chờ duyệt", value: "2", change: "0%", up: true, color: "#f26522", bg: "from-orange-50 to-amber-50" },
  { icon: GraduationCap, label: "Học viên Nghỉ học", value: "32", change: "+10%", up: false, color: "#dc2f3c", bg: "from-red-50 to-rose-50" },
];

const monthlyAdmissions = [
  { month: "T1", value: 3.2 }, { month: "T2", value: 2.8 }, { month: "T3", value: 4.5 },
  { month: "T4", value: 4.2 }, { month: "T5", value: 3.9 }, { month: "T6", value: 5.6 },
  { month: "T7", value: 6.3 }, { month: "T8", value: 7.7 }, { month: "T9", value: 8.9 },
  { month: "T10", value: 5.1 }, { month: "T11", value: 4.8 }, { month: "T12", value: 4.0 }
];

const topPrograms = [
  { name: "Tuyển sinh Lớp 10 GDTX", students: 15930, pct: 100 },
  { name: "Đào tạo nghề Hàn Điện 3 tháng", students: 5120, pct: 57 },
  { name: "Tin học Cơ bản Chuẩn QG", students: 4450, pct: 45 },
  { name: "Luyện thi TOEIC Cấp tốc 600+", students: 2340, pct: 26 },
  { name: "Sơ cấp Nấu ăn - Khóa dài hạn", students: 1100, pct: 14 },
];

type ActivityAction = "create" | "approve" | "suspend" | "login" | "report";
interface ActivityEntry {
  id: string; user: string; action: ActivityAction; target: string; detail?: string; time: string;
}

const actionConfig: Record<ActivityAction, { icon: any; color: string; bg: string; label: string }> = {
  create: { icon: FileText, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10", label: "Soạn thảo" },
  approve: { icon: CheckCircle, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", label: "Phê duyệt" },
  suspend: { icon: ShieldAlert, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-500/10", label: "Đình chỉ" },
  login: { icon: Activity, color: "text-gray-600 dark:text-gray-400", bg: "bg-gray-50 dark:bg-gray-500/10", label: "Truy cập" },
  report: { icon: BarChart3, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-500/10", label: "Gửi báo cáo" },
};

const activityLog: ActivityEntry[] = [
  { id: "1", user: "Phòng QL Nghề - Sở GD", action: "approve", target: "Kế hoạch CĐN Đào Tạo Cơ Khí", detail: "Chữ ký Giám đốc Sở Cấp", time: "5 phút trước" },
  { id: "2", user: "TT GDTX Huyện Bình Chánh", action: "report", target: "Báo cáo cuối quý III", detail: "Đính kèm: Baocao_Q3.xls", time: "12 phút trước" },
  { id: "3", user: "Thanh tra Sở GD", action: "suspend", target: "Trung tâm Ngoại ngữ AMES", detail: "Treo GPHĐ do thiếu PCCC", time: "28 phút trước" },
  { id: "4", user: "Trung tâm Tin Học ABC", action: "create", target: "Kế hoạch Tuyển sinh Năm 2026", detail: "Lưu nháp - chờ bổ sung danh sách", time: "45 phút trước" },
];

export function AdminDashboard() {
  useDocumentTitle("Báo cáo Thống kê");
  const { adminRole } = useOutletContext<{ adminRole: "department" | "center" }>();
  const isDepartment = adminRole === "department";
  const { students, classes, trainingPlans, certificates } = useAppData();

  const [isLoading, setIsLoading] = useState(true);
  const [activityFilter, setActivityFilter] = useState<"all" | ActivityAction>("all");
  const maxAdmissions = Math.max(...monthlyAdmissions.map(r => r.value));

  const liveCenterStats = useMemo(() => [
    { icon: Users, label: "Học viên Đang học", value: students.filter(s => s.status === "learning").length.toLocaleString(), change: "+8.5%", up: true, color: "#3b82f6", bg: "from-blue-50 to-indigo-50" },
    { icon: BookOpen, label: "Lớp học Mở mới", value: classes.filter(c => c.status === "Hoạt động" || c.status === "Tuyển sinh").length.toString(), change: "+5", up: true, color: "#10b981", bg: "from-emerald-50 to-teal-50" },
    { icon: FileText, label: "Kế hoạch Chờ duyệt", value: trainingPlans.filter(p => p.status === "pending").length.toString(), change: "0%", up: true, color: "#f26522", bg: "from-orange-50 to-amber-50" },
    { icon: GraduationCap, label: "Học viên Nghỉ học", value: students.filter(s => s.status === "dropped" || s.status === "suspended").length.toString(), change: "+10%", up: false, color: "#dc2f3c", bg: "from-red-50 to-rose-50" },
  ], [students, classes, trainingPlans]);

  const liveDeptStats = useMemo(() => {
    const pendingPlans = trainingPlans.filter(p => p.status === "pending" || p.status === "revision").length;
    return [
      { icon: Users, label: "Tổng số Học viên", value: students.length.toLocaleString(), change: "+12.5%", up: true, color: "#3b82f6", bg: "from-blue-50 to-indigo-50" },
      { icon: Building2, label: "Lớp đang hoạt động", value: classes.filter(c => c.status === "Hoạt động" || c.status === "Tuyển sinh").length.toString(), change: "+3", up: true, color: "#10b981", bg: "from-emerald-50 to-teal-50" },
      { icon: Award, label: "Chứng chỉ Cấp phát", value: certificates.filter(c => c.status === "ISSUED").length.toLocaleString(), change: "+23.1%", up: true, color: "#f26522", bg: "from-orange-50 to-amber-50" },
      { icon: FileText, label: "Kế hoạch Chờ duyệt", value: pendingPlans.toString(), change: pendingPlans > 0 ? `+${pendingPlans}` : "0", up: pendingPlans === 0, color: "#dc2f3c", bg: "from-red-50 to-rose-50" },
    ];
  }, [students, classes, certificates, trainingPlans]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <DashboardSkeleton />;

  const displayStats = isDepartment ? liveDeptStats : liveCenterStats;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[20px] sm:text-[24px] lg:text-[28px] text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 800 }}>
            {isDepartment ? "Báo cáo Thống kê Toàn tỉnh" : "Dashboard Trung Tâm"}
          </h1>
          <p className="text-muted-foreground text-[13px] sm:text-[15.5px] mt-0.5">
            {isDepartment ? "Số liệu tổng quan mạng lưới GDNN-GDTX trên địa bàn quản lý" : "Quản trị nhanh các nghiệp vụ đào tạo"}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isDepartment && (
            <button
              onClick={() => toast.success("Đang tổng hợp báo cáo Excel...")}
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/90 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[13px] sm:text-[15px] shadow-sm hover:shadow-md transition-all font-semibold"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Kết xuất Báo Cáo Sở</span>
              <span className="sm:hidden">Xuất</span>
            </button>
          )}
          <select className="bg-white dark:bg-muted border border-gray-200 dark:border-border rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-[13px] sm:text-[15px] text-foreground outline-none font-medium">
            <option>Năm 2025</option>
            <option>Năm 2026</option>
          </select>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {displayStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-gradient-to-br ${stat.bg} dark:from-transparent dark:to-transparent dark:bg-muted rounded-2xl p-5 border border-gray-100/50 dark:border-border`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/80 dark:bg-white/10 flex items-center justify-center shadow-sm">
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div className={`flex items-center gap-0.5 text-[13px] px-2 py-1 rounded-full ${stat.up ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`} style={{ fontWeight: 600 }}>
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
            <p className="text-[24px] text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 800 }}>{stat.value}</p>
            <p className="text-[14px] text-muted-foreground mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="lg:col-span-2 bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[16px] text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 700 }}>
                Tuyển sinh theo Tháng
              </h2>
              <p className="text-[14px] text-muted-foreground">Đơn vị: Nghìn học viên</p>
            </div>
            <div className="flex items-center gap-1.5 text-[14px] text-primary bg-primary/10 px-3 py-1.5 rounded-lg font-semibold">
              <TrendingUp className="w-3.5 h-3.5" /> Thống kê Tỉnh
            </div>
          </div>
          <div className="flex items-end gap-2 h-48">
            {monthlyAdmissions.map((d, i) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[12px] text-muted-foreground font-medium">{d.value}k</span>
                <motion.div
                  initial={{ height: 0 }} animate={{ height: `${(d.value / maxAdmissions) * 100}%` }}
                  transition={{ delay: 0.2 + i * 0.03, duration: 0.5 }}
                  className="w-full rounded-md min-h-[4px] bg-primary/20"
                  style={{ backgroundColor: i === monthlyAdmissions.length - 1 ? "#531ab4" : undefined }}
                />
                <span className="text-[12px] text-muted-foreground">{d.month}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Programs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-6 h-full"
        >
          <h2 className="text-[16px] text-[#1a1a2e] dark:text-foreground mb-5" style={{ fontWeight: 700 }}>Chương trình Thu hút nhất</h2>
          <div className="space-y-4">
            {topPrograms.map((course, i) => (
              <div key={course.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[14px] text-[#1a1a2e] dark:text-foreground truncate block max-w-[140px] sm:max-w-[200px]" style={{ fontWeight: 600 }}>{course.name}</span>
                  <span className="text-[12px] text-muted-foreground shrink-0">{course.students.toLocaleString()} HV</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${course.pct}%` }}
                    transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                    className="h-full rounded-full bg-gradient-to-r from-[#531ab4] to-[#f26522]"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
      
      {/* Activity Log */}
      <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] text-[#1a1a2e] dark:text-foreground font-bold">Nhật ký Hệ thống GDNN-GDTX</h2>
            <button className="text-[14px] text-primary hover:underline font-medium">Xem toàn bộ</button>
          </div>
          
          <div className="space-y-0 relative border-l border-gray-100 dark:border-border ml-3 pl-5">
            <AnimatePresence>
              {activityLog.map((entry, i) => {
                 const ac = actionConfig[entry.action];
                 return (
                  <motion.div key={entry.id} className="relative py-4 group">
                    <div className={`absolute -left-[30px] w-5 h-5 rounded-full ${ac.bg} flex items-center justify-center border-2 border-white dark:border-card`}>
                      <ac.icon className={`w-2.5 h-2.5 ${ac.color}`} />
                    </div>
                    <div className="flex justify-between items-start gap-4">
                       <div>
                         <p className="text-[15px] font-semibold text-foreground">
                            {entry.user} <span className="text-muted-foreground font-normal mx-1">{ac.label.toLowerCase()}</span> {entry.target}
                         </p>
                         {entry.detail && <p className="text-[14px] text-muted-foreground mt-1.5">{entry.detail}</p>}
                       </div>
                       <span className="text-[13px] text-muted-foreground/60 whitespace-nowrap">{entry.time}</span>
                    </div>
                  </motion.div>
                 )
              })}
            </AnimatePresence>
          </div>
      </motion.div>
    </div>
  );
}

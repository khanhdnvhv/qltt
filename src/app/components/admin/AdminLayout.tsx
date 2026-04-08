import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard, Users, BookOpen, FileText, MessageSquare,
  Settings, LogOut, ChevronLeft, ChevronRight, Bell,
  BarChart3, Target, CreditCard, Award, Shield, Menu, X, Moon, Sun,
  Search, GraduationCap, Clock, Tag, Mail, LayoutGrid,
  Pen, Gift, Building,
  Beaker,
  Calendar,
  Globe,
  Activity,
  Send,
  Key,
  Share2,
  Webhook,
  Languages,
  HardDrive,
  ShieldAlert,
  Flag,
  Database,
  ArrowUpDown,
  Variable,
  Timer as TimerIcon,
  Radio,
  Bug,
  FileSearch,
  Plug,
  History,
  Route,
  UserCheck,
  TrendingUp,
  Gauge as GaugeIcon,
  UserX,
  Flame,
  Trophy,
  ClipboardList,
  MousePointerClick,
  DollarSign,
  Package,
  LineChart,
  PieChart,
  Banknote,
  CircleDollarSign,
  GitBranch,
  Crosshair,
  Filter,
  Navigation,
  Repeat,
  UserPlus,
  Server,
  Zap,
  Box,
  Layers,
  Lock,
  ChevronDown,
  ExternalLink,
  CalendarDays
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { useTheme } from "../ThemeContext";
import { LoadingScreen } from "../ui/LoadingScreen";
import { NetworkStatus } from "../ui/NetworkStatus";
import { useFocusTrap, useEscapeKey } from "../../utils/hooks";

const MODULE_NAMES: Record<string, string> = {
  "sys": "Quản trị Hệ thống",
  "plan": "Kế hoạch & Điều hành",
  "stu": "Học viên & Tuyển sinh",
  "org": "Nội dung đào tạo",
  "training": "Tổ chức đào tạo",
  "tea": "Đội ngũ Giảng viên",
  "exam": "Thi và kiểm tra",
  "cert": "Văn bằng Chứng chỉ",
  "fee": "Quản lý Học phí",
  "fin": "Tài chính Kế toán",
  "admin": "Hành chính & Báo cáo",
  "reports": "Báo cáo thống kê",
  "teacher_dash": "Bảng điều khiển",
  "teacher_course": "Khóa học",
  "teacher_materials": "Học liệu của tôi",
  "student_dash": "Bảng điều khiển",
  "student_course": "Học tập",
  "student_records": "Hồ sơ cá nhân",
};

const getNavItems = (role: string, module: string = "all") => {
  let items = [];

  if (role === "department") {
    items = [
      { icon: LayoutDashboard, label: "Dashboard điều hành", path: "/admin", module: "reports" },
      { icon: Building, label: "Quản lý Đơn vị", path: "/admin/centers", module: "sys" },
      { icon: Users, label: "Quản lý tài khoản", path: "/admin/users", module: "sys" },
      { icon: Shield, label: "Phân quyền", path: "/admin/roles", module: "sys" },
      { icon: Activity, label: "Nhật ký hệ thống", path: "/admin/system-logs", module: "sys" },
      { icon: Settings, label: "Cấu hình hệ thống", path: "/admin/system-config", module: "sys" },

      { icon: FileText, label: "Phê duyệt Kế hoạch", path: "/admin/training-plans", module: "plan" },
      { icon: BookOpen, label: "Hồ sơ & Văn bản", path: "/admin/documents", module: "plan" },

      { icon: Building, label: "Báo cáo trung tâm", path: "/admin/reports/centers", module: "reports" },
      { icon: BarChart3, label: "Báo cáo đào tạo", path: "/admin/reports/training", module: "reports" },
      { icon: Award, label: "Báo cáo chứng chỉ", path: "/admin/reports/certificates", module: "reports" },
    ];
  } else if (role === "teacher") {
    items = [
      { icon: LayoutDashboard, label: "Bảng điều khiển", path: "/admin/teacher", module: "teacher_dash" },
      { icon: Layers, label: "Khóa học công tác", path: "/admin/teacher/courses", module: "teacher_course" },
      { icon: Users, label: "Lớp học của tôi", path: "/admin/teacher/my-classes", module: "teacher_course" },
      { icon: Calendar, label: "Lịch giảng dạy", path: "/admin/teacher/schedule", module: "teacher_course" },
      { icon: Bell, label: "Thông báo", path: "/admin/teacher/notifications", module: "teacher_course" },

      { icon: Database, label: "Ngân hàng câu hỏi", path: "/admin/teacher/question-bank", module: "teacher_materials" },
      { icon: FileText, label: "Bài giảng", path: "/admin/teacher/lectures", module: "teacher_materials" },
      { icon: ClipboardList, label: "Bài kiểm tra", path: "/admin/teacher/tests", module: "teacher_materials" },
    ];
  } else if (role === "student") {
    items = [
      { icon: LayoutDashboard, label: "Bảng điều khiển", path: "/admin/student", module: "student_dash" },
      { icon: CalendarDays, label: "Lịch học", path: "/admin/student/schedule", module: "student_course" },
      { icon: BookOpen, label: "Khóa học của tôi", path: "/admin/student/my-courses", module: "student_course" },
      { icon: LineChart, label: "Kết quả học tập", path: "/admin/student/results", module: "student_records" },
      { icon: Award, label: "Chứng chỉ của tôi", path: "/admin/student/certificates", module: "student_records" },
      { icon: Bell, label: "Thông báo", path: "/admin/student/notifications", module: "student_records" },
    ];
  } else {
    items = [
      { icon: LayoutDashboard, label: "Báo cáo Thống kê", path: "/admin", module: "admin" },
      { icon: Building, label: "Hồ sơ Đơn vị", path: "/admin/centers", module: "sys" },
      { icon: Users, label: "Tài khoản", path: "/admin/users", module: "sys" },
      { icon: Shield, label: "Phân quyền", path: "/admin/roles", module: "sys" },
      
      { icon: FileText, label: "Kế hoạch Đào tạo", path: "/admin/training-plans", module: "plan" },
      { icon: BookOpen, label: "Hồ sơ & Văn bản", path: "/admin/documents", module: "plan" },
      
      { icon: Tag, label: "Danh mục chương trình", path: "/admin/program-categories", module: "org" },
      { icon: Layers, label: "Chương trình học", path: "/admin/programs", module: "org" },
      { icon: Box, label: "Quản lý học phần", path: "/admin/course-modules", module: "org" },
      { icon: FileText, label: "Bài giảng", path: "/admin/lectures", module: "org" },
      { icon: ClipboardList, label: "Bài kiểm tra", path: "/admin/tests", module: "org" },
      { icon: Database, label: "Ngân hàng câu hỏi", path: "/admin/question-bank", module: "org" },
      { icon: MessageSquare, label: "Danh sách câu hỏi", path: "/admin/questions", module: "org" },
      
      { icon: BookOpen, label: "Quản lý khóa học", path: "/admin/courses", module: "training" },
      { icon: Users, label: "Quản lý lớp học", path: "/admin/classes", module: "training" },
      { icon: Calendar, label: "Thời khóa biểu", path: "/admin/timetable", module: "training" },
      { icon: Award, label: "Quản lý chứng chỉ", path: "/admin/manage-certificates", module: "training" },
      
      { icon: FileText, label: "Kế hoạch thi", path: "/admin/exam-plans", module: "exam" },
      { icon: CalendarDays, label: "Lịch thi", path: "/admin/exam-schedules", module: "exam" },
      { icon: UserCheck, label: "Phân công coi thi", path: "/admin/exam-invigilators", module: "exam" },
      { icon: FileSearch, label: "Quản lý đề thi", path: "/admin/exam-papers", module: "exam" },
      { icon: PieChart, label: "Kết quả thi", path: "/admin/exam-results", module: "exam" },

      { icon: CreditCard, label: "Đợt thu", path: "/admin/fee-periods", module: "fee" },
      { icon: Gift, label: "Miễn giảm", path: "/admin/fee-discounts", module: "fee" },
      { icon: FileText, label: "Phiếu thu", path: "/admin/fee-receipts", module: "fee" },
      { icon: Repeat, label: "Phiếu trả", path: "/admin/fee-refunds", module: "fee" },
      { icon: Banknote, label: "Công nợ học viên", path: "/admin/fee-debts", module: "fee" },

      { icon: UserCheck, label: "Hồ sơ Học viên", path: "/admin/students", module: "stu" },
      { icon: UserPlus, label: "Nhập học", path: "/admin/students/enrollment", module: "stu" },
      { icon: Repeat, label: "Chuyển lớp", path: "/admin/students/transfer", module: "stu" },
      { icon: Clock, label: "Bảo lưu", path: "/admin/students/reserve", module: "stu" },
      { icon: UserX, label: "Thôi học", path: "/admin/students/dropout", module: "stu" },
      
      { icon: GraduationCap, label: "Giảng viên", path: "/admin/teachers", module: "tea" },
    ];
  }
  
  if (module && module !== "all") {
    items = items.filter(item => item.module === module);
  }
  
  return items;
};

const getAdminRouteNames = (role: string): Record<string, string> => ({
  "/admin": "Dashboard điều hành",
  "/admin/centers": role === "center" ? "Hồ sơ Đơn vị" : "Quản lý Đơn vị",
  "/admin/classes": "Lớp học & Lịch học",
  "/admin/training-plans": role === "center" ? "Kế hoạch Đào tạo" : "Phê duyệt Kế hoạch",
  "/admin/documents": "Hồ sơ & Văn bản",
  "/admin/students": "Hồ sơ Học viên",
  "/admin/students/enrollment": "Nhập học",
  "/admin/students/transfer": "Chuyển lớp",
  "/admin/students/reserve": "Bảo lưu",
  "/admin/students/dropout": "Thôi học",
  "/admin/users": "Quản lý Tài khoản",
  "/admin/roles": "Phân quyền",
  "/admin/teachers": "Quản lý Giảng viên",
  "/admin/programs": "Chương trình học",
  "/admin/program-categories": "Danh mục chương trình",
  "/admin/course-modules": "Quản lý học phần",
  "/admin/lectures": "Bài giảng",
  "/admin/tests": "Bài kiểm tra",
  "/admin/question-bank": "Ngân hàng câu hỏi",
  "/admin/questions": "Danh sách câu hỏi",
  "/admin/courses": "Quản lý khóa học",
  "/admin/timetable": "Thời khóa biểu",
  "/admin/manage-certificates": "Quản lý chứng chỉ",
  "/admin/exam-plans": "Kế hoạch thi",
  "/admin/exam-schedules": "Lịch thi",
  "/admin/exam-invigilators": "Phân công coi thi",
  "/admin/exam-papers": "Quản lý đề thi",
  "/admin/exam-results": "Kết quả thi",
  "/admin/fee-periods": "Đợt thu",
  "/admin/fee-discounts": "Miễn giảm",
  "/admin/fee-receipts": "Phiếu thu",
  "/admin/fee-refunds": "Phiếu trả",
  "/admin/fee-debts": "Công nợ học viên",
  "/admin/reports/centers": "Báo cáo trung tâm",
  "/admin/reports/training": "Báo cáo đào tạo",
  "/admin/reports/certificates": "Báo cáo chứng chỉ",
  "/admin/system-logs": "Nhật ký hệ thống",
  "/admin/system-config": "Cấu hình hệ thống",
  "/admin/teacher": "Bảng điều khiển",
  "/admin/teacher/courses": "Khóa học công tác",
  "/admin/teacher/question-bank": "Ngân hàng câu hỏi",
  "/admin/teacher/lectures": "Bài giảng",
  "/admin/teacher/tests": "Bài kiểm tra",
  "/admin/teacher/schedule": "Lịch giảng dạy",
  "/admin/teacher/my-classes": "Lớp học của tôi",
  "/admin/teacher/notifications": "Thông báo",
  "/admin/student": "Bảng điều khiển Học viên",
  "/admin/student/schedule": "Lịch học",
  "/admin/student/my-courses": "Khóa học của tôi",
  "/admin/student/results": "Kết quả học tập",
  "/admin/student/certificates": "Chứng chỉ của tôi",
  "/admin/student/notifications": "Thông báo hệ thống",
});

function AdminBreadcrumb({ role }: { role: string }) {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);
  const routeNames = getAdminRouteNames(role);
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[15px] text-muted-foreground mb-4 lg:mb-0">
      {segments.map((seg, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span>/</span>}
          <span className={i === segments.length - 1 ? "text-[#1a1a2e] dark:text-foreground" : ""} style={i === segments.length - 1 ? { fontWeight: 600 } : {}}>
            {routeNames["/" + segments.slice(0, i + 1).join("/")] || seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ")}
          </span>
        </span>
      ))}
    </nav>
  );
}

function NotificationCenter() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors" aria-label="Thong bao">
        <Bell className="w-[18px] h-[18px] text-muted-foreground" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-card border border-gray-200 dark:border-border rounded-xl shadow-lg p-3 z-50">
          <p className="text-[16px] text-muted-foreground text-center py-4">Không có thông báo mới</p>
        </div>
      )}
    </div>
  );
}

function CommandPalette({ role }: { role: string }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setOpen(true); }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const navItems = getNavItems(role, "all");
  const filtered = navItems.filter(i => i.label.toLowerCase().includes(query.toLowerCase()));

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-[100] flex items-start justify-center pt-[20vh]" onClick={() => setOpen(false)}>
      <div className="bg-white dark:bg-card rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-border" onClick={e => e.stopPropagation()}>
        <div className="p-3 border-b border-gray-100 dark:border-border">
          <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm kiếm chức năng..." className="w-full bg-transparent outline-none text-[15px] text-[#1a1a2e] dark:text-foreground placeholder:text-muted-foreground/50" />
        </div>
        <div className="max-h-64 overflow-y-auto p-2">
          {filtered.slice(0, 8).map(item => (
            <button key={item.path} onClick={() => { navigate(item.path); setOpen(false); setQuery(""); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[16px] text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/5 hover:text-[#1a1a2e] dark:hover:text-foreground transition-colors text-left">
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function KeyboardShortcutsPanel() {
  return null;
}

function AppLauncher({ activeRole, activeModule, onSelectModule }: { activeRole: string, activeModule: string, onSelectModule: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useFocusTrap<HTMLDivElement>(open);
  useEscapeKey(() => setOpen(false), open);

  const allModules = [
    { id: "all", name: "Tất cả Module", icon: LayoutDashboard, color: "text-gray-500", bg: "bg-gray-500/10" },
    { id: "sys", name: "Quản trị Hệ thống", icon: Shield, color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: "plan", name: "Kế hoạch & Điều hành", icon: Target, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { id: "stu", name: "Học viên & Tuyển sinh", icon: Users, color: "text-orange-500", bg: "bg-orange-500/10" },
    { id: "org", name: "Nội dung đào tạo", icon: Layers, color: "text-teal-500", bg: "bg-teal-500/10" },
    { id: "training", name: "Tổ chức đào tạo", icon: Clock, color: "text-blue-600", bg: "bg-blue-600/10" },
    { id: "tea", name: "Đội ngũ Giảng viên", icon: GraduationCap, color: "text-purple-500", bg: "bg-purple-500/10" },
    { id: "exam", name: "Thi và kiểm tra", icon: FileSearch, color: "text-rose-500", bg: "bg-rose-500/10" },
    { id: "cert", name: "Văn bằng Chứng chỉ", icon: ShieldAlert, color: "text-yellow-600", bg: "bg-yellow-500/10" },
    { id: "fee", name: "Quản lý Học phí", icon: Banknote, color: "text-green-600", bg: "bg-green-600/10" },
    { id: "fin", name: "Tài chính Kế toán", icon: CreditCard, color: "text-green-500", bg: "bg-green-500/10" },
    { id: "reports", name: "Báo cáo thống kê", icon: PieChart, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { id: "admin", name: "Hành chính & Portal", icon: Globe, color: "text-cyan-500", bg: "bg-cyan-500/10" },
    { id: "teacher_dash", name: "Bảng điều khiển", icon: LayoutDashboard, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { id: "teacher_course", name: "Khóa học", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: "teacher_materials", name: "Học liệu của tôi", icon: Database, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { id: "student_dash", name: "Bảng điều khiển", icon: LayoutDashboard, color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: "student_course", name: "Học tập", icon: BookOpen, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { id: "student_records", name: "Hồ sơ cá nhân", icon: GraduationCap, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  const modules = activeRole === "department" 
    ? allModules.filter(m => ["all", "plan", "sys", "reports"].includes(m.id))
    : activeRole === "teacher"
    ? allModules.filter(m => ["all", "teacher_dash", "teacher_course", "teacher_materials"].includes(m.id))
    : activeRole === "student"
    ? allModules.filter(m => ["all", "student_dash", "student_course", "student_records"].includes(m.id))
    : allModules.filter(m => !["reports", "teacher_dash", "teacher_course", "teacher_materials", "student_dash", "student_course", "student_records"].includes(m.id));

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={() => setOpen(!open)} 
        className={`p-2 rounded-xl transition-colors pointer-events-auto ${open ? "bg-primary/10 text-primary" : "hover:bg-gray-100 dark:hover:bg-white/5 text-muted-foreground hover:text-[#1a1a2e] dark:hover:text-foreground"}`}
        title="Danh sách Module"
      >
        <LayoutGrid className="w-5 h-5" />
      </button>
      <AnimatePresence>
        {open && (
           <>
              <div className="fixed inset-0 z-40 pointer-events-auto" onClick={() => setOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute right-0 mt-3 w-[380px] bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl shadow-xl overflow-hidden z-50 origin-top-right p-4 pointer-events-auto"
              >
                <div className="mb-4 mt-1 px-1">
                  <h3 className="text-[17px] text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 800 }}>Ứng dụng & Module</h3>
                  <p className="text-[13px] text-muted-foreground">Chuyển đổi nhanh giữa các phân hệ</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {modules.map((mod, i) => (
                    <motion.button 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.2 }}
                      key={mod.id}
                      onClick={() => { setOpen(false); onSelectModule(mod.id); }}
                      className={`flex flex-col items-center justify-start gap-2.5 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group text-center h-full border hover:border-gray-100 dark:hover:border-white/10 hover:shadow-sm ${activeModule === mod.id ? 'bg-gray-50 border-gray-200 dark:bg-white/5 dark:border-white/10' : 'border-transparent'}`}
                    >
                       <div className={`w-12 h-12 rounded-2xl ${mod.bg} ${mod.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                         <mod.icon className="w-5 h-5" />
                       </div>
                       <span className="text-[12px] text-[#1a1a2e] dark:text-foreground leading-tight" style={{ fontWeight: 600 }}>{mod.name}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
           </>
        )}
      </AnimatePresence>
    </div>
  );
}

function UserProfileMenu({ user, logout, navigate }: any) {
  const [open, setOpen] = useState(false);
  const ref = useFocusTrap<HTMLDivElement>(open);
  useEscapeKey(() => setOpen(false), open);

  return (
    <div className="relative ml-1 pointer-events-auto" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all outline-none focus:ring-2 focus:ring-primary/20"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-[14px]" style={{ fontWeight: 700 }}>
          {user?.fullName?.charAt(0) || "A"}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
           <>
              <div className="fixed inset-0 z-40 pointer-events-auto" onClick={() => setOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-3 w-60 bg-white dark:bg-card border border-gray-100 dark:border-border rounded-xl shadow-xl overflow-hidden z-50 origin-top-right py-2 pointer-events-auto"
              >
                <div className="px-4 py-3 border-b border-gray-100 dark:border-border mb-1">
                  <p className="text-[15px] text-[#1a1a2e] dark:text-foreground truncate" style={{ fontWeight: 700 }}>{user?.fullName || "Người dùng"}</p>
                  <p className="text-[13px] text-muted-foreground truncate">{user?.email || "admin@gdnn-gdtx.vn"}</p>
                </div>
                <div className="px-2 space-y-0.5">
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 text-[14.5px] text-[#1a1a2e] dark:text-foreground transition-colors" style={{ fontWeight: 500 }}>
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    Cài đặt tài khoản
                  </button>
                  <button onClick={() => { setOpen(false); logout(); navigate("/login"); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-[14.5px] text-red-600 transition-colors" style={{ fontWeight: 500 }}>
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </div>
              </motion.div>
           </>
        )}
      </AnimatePresence>
    </div>
  );
}

const VALID_ROLES = ["department", "center", "teacher", "student"] as const;
type AdminRole = "department" | "center" | "teacher" | "student";

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [routeAnnouncement, setRouteAnnouncement] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const initialRole: AdminRole = user?.role && (VALID_ROLES as readonly string[]).includes(user.role)
    ? user.role as AdminRole
    : "department";
  const [activeRole, setActiveRole] = useState<AdminRole>(initialRole);
  const [activeModule, setActiveModule] = useState<string>("all");
  useEscapeKey(() => setMobileOpen(false), mobileOpen);

  useEffect(() => {
    if (user?.role && (VALID_ROLES as readonly string[]).includes(user.role)) {
      setActiveRole(user.role as AdminRole);
    }
  }, [user?.role]);

  useEffect(() => {
    const pageName = getAdminRouteNames(activeRole)[location.pathname] || "Admin";
    setRouteAnnouncement(`Đang truy cập ${pageName}`);
  }, [location.pathname, activeRole]);

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  const SidebarContent = () => {
    const navItems = getNavItems(activeRole, activeModule);
    
    // Group items by module
    const groupedItems = navItems.reduce((acc, item) => {
      const mod = item.module || "other";
      if (!acc[mod]) acc[mod] = [];
      acc[mod].push(item);
      return acc;
    }, {} as Record<string, typeof navItems>);

    return (
    <>
      {/* Logo */}
      <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2.5"} px-4 py-5 border-b border-gray-100 dark:border-border sticky top-0 bg-white dark:bg-card z-10`}>
        <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white text-[15px] shrink-0" style={{ fontWeight: 800 }}>
          IP
        </div>
        {!collapsed && (
          <div className="leading-tight">
            <span className="text-[#1a1a2e] dark:text-foreground text-[15px]" style={{ fontWeight: 800 }}>GDNN·GDTX</span>
            <p className="text-[13px] text-primary" style={{ fontWeight: 600 }}>Ngoại ngữ · Tin học</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {navItems.length > 0 ? (
          <div className="space-y-4">
            {Object.entries(groupedItems).map(([modId, items]) => (
              <div key={modId} className="space-y-1">
                {activeModule === "all" && !collapsed && (
                  <div className="px-3 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 w-full truncate">
                    {MODULE_NAMES[modId] || modId}
                  </div>
                )}
                {items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] transition-all ${
                      isActive(item.path)
                        ? "bg-primary/[0.08] text-primary"
                        : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/5 hover:text-[#1a1a2e] dark:hover:text-foreground"
                    } ${collapsed ? "justify-center" : ""}`}
                    style={{ fontWeight: isActive(item.path) ? 600 : 500 }}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className="w-[18px] h-[18px] shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-4 py-8 text-center opacity-60">
            <Package className="w-8 h-8 text-muted-foreground mb-3 opacity-50" />
            <p className="text-[14px] text-muted-foreground" style={{ fontWeight: 500 }}>
              {!collapsed ? "Module này chưa có menu chức năng nào." : ""}
            </p>
          </div>
        )}
      </nav>

      {/* Bottom spacing to ensure items don't hide behind empty areas */}
      <div className="h-4"></div>
    </>
  );
  };

  return (
    <div className="min-h-screen flex bg-[#f8f9fb] dark:bg-background">
      {/* Screen reader route announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" role="status">
        {routeAnnouncement}
      </div>
      <a
        href="#admin-main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg text-[16px] focus:shadow-lg"
        style={{ fontWeight: 600 }}
      >
        Chuyển đến nội dung chính
      </a>
      <NetworkStatus />
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col bg-white dark:bg-card border-r border-gray-100 dark:border-border transition-all duration-300 sticky top-0 h-screen ${collapsed ? "w-[72px]" : "w-[250px]"}`} role="navigation" aria-label="Admin navigation">
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-card border border-gray-200 dark:border-border rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all z-10"
          aria-label={collapsed ? "Mo rong sidebar" : "Thu gon sidebar"}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </aside>

      {/* Mobile header + sidebar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-card border-b border-gray-100 dark:border-border px-3 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white text-[15px] shrink-0" style={{ fontWeight: 800 }}>
            IP
          </div>
          <div className="min-w-0">
            <span className="text-[14px] text-[#1a1a2e] dark:text-foreground truncate block" style={{ fontWeight: 700 }}>GDNN·GDTX</span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <select
            value={activeRole}
            onChange={(e) => setActiveRole(e.target.value as AdminRole)}
            className="bg-gray-100 dark:bg-white/10 border-0 px-2 py-1.5 rounded-lg text-[12px] outline-none font-semibold text-[#1a1a2e] dark:text-foreground"
          >
            <option value="department">Sở GD&ĐT</option>
            <option value="center">Trung tâm</option>
            <option value="teacher">Giáo viên</option>
            <option value="student">Học viên</option>
          </select>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-muted-foreground transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5" aria-label={mobileOpen ? "Dong menu" : "Mo menu"} aria-expanded={mobileOpen}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/40 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-[260px] bg-white dark:bg-card z-50 flex flex-col shadow-xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="lg:hidden h-[52px]" /> {/* Spacer for mobile header */}

        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-end px-8 h-[72px] bg-white/95 dark:bg-card/95 backdrop-blur-xl border-b border-gray-100 dark:border-border sticky top-0 z-30">
          
          <div className="flex items-center gap-2.5">
            {/* Role Switcher */}
            <select 
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value as AdminRole)}
              className="hidden xl:block bg-[#f4f5f7] dark:bg-white/5 border border-transparent focus:border-primary/30 px-3 py-2 rounded-xl text-[14px] outline-none transition-all dark:text-foreground shadow-sm cursor-pointer"
              style={{ fontWeight: 600 }}
            >
              <option value="department">Sở GD&ĐT</option>
              <option value="center">Trung tâm</option>
              <option value="teacher">Giáo viên</option>
              <option value="student">Học viên</option>
            </select>

            <div className="hidden xl:block h-6 w-px bg-gray-200 dark:bg-border mx-1"></div>

            <button
              onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }))}
              className="flex items-center gap-2 bg-[#f4f5f7] dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-transparent rounded-xl px-3 py-2 text-[15px] text-muted-foreground transition-colors pointer-events-auto"
              title="Tìm kiếm (Ctrl+K)"
            >
              <Search className="w-[18px] h-[18px]" />
              <kbd className="hidden 2xl:inline px-1 py-0.5 bg-white dark:bg-black/20 rounded text-[12px] font-sans border border-gray-200 dark:border-white/10" style={{ fontWeight: 600 }}>Ctrl+K</kbd>
            </button>
            
            <AppLauncher activeRole={activeRole} activeModule={activeModule} onSelectModule={setActiveModule} />
            
            <NotificationCenter />

            <div className="h-6 w-px bg-gray-200 dark:bg-border mx-1"></div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-muted-foreground transition-colors pointer-events-auto"
              title={isDark ? "Light mode" : "Dark mode"}
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            <UserProfileMenu user={user} logout={logout} navigate={navigate} />
          </div>
        </header>

        <div id="admin-main-content" className="p-4 sm:p-6 lg:px-8 lg:py-6" role="main">
          <div className="mb-2 lg:mb-6">
            <AdminBreadcrumb role={activeRole} />
          </div>
          <CommandPalette role={activeRole} />
          <KeyboardShortcutsPanel />
          <Suspense fallback={<LoadingScreen />}>
            <Outlet context={{ adminRole: activeRole }} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

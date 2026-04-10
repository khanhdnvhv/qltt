import { useUrlPagination } from "../../utils/useUrlPagination";
import { useState, useMemo, useCallback } from "react";
import { useDocumentTitle, useEscapeKey } from "../../utils/hooks";
import { useUrlFilters } from "../../utils/useUrlFilters";
import { useOutletContext } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Plus, Download, Mail, Phone, Edit, Trash2, Eye,
  Building2, GraduationCap, Library, X, CheckCircle, Ban, Save, Image as ImageIcon,
  MapPin, FileText, Users, BookOpen, Calendar, Shield, AlertTriangle,
  ChevronRight, MoreHorizontal, ClipboardList, Award, TrendingUp, Info,
  Clock, Hash, Star, Layers
} from "lucide-react";
import { toast } from "sonner";
import { HighlightText } from "../ui/HighlightText";
import { Pagination } from "./Pagination";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MockCenter {
  id: string;
  name: string;
  shortName: string;
  type: "gdnn_gdtx" | "ngoai_ngu" | "tin_hoc";
  status: "active" | "inactive" | "suspended";
  director: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  licenseNo: string;
  licenseDate: string;
  licenseExpiry: string;
  capacity: number;
  studentCount: number;
  classCount: number;
  establishedYear: number;
  programs: string[];
  rating: number; // 1-5
  auditLog: { action: string; time: string; actor: string; note: string }[];
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const CENTERS: MockCenter[] = [
  {
    id: "c1", name: "TT GDNN - GDTX Quận 1", shortName: "GDNN Q1",
    type: "gdnn_gdtx", status: "active",
    director: "Nguyễn Văn An", email: "ttgdnnq1@hcm.edu.vn", phone: "028.3823.4567",
    address: "25 Đinh Tiên Hoàng, P. Đa Kao, Q.1", district: "Quận 1",
    licenseNo: "1245/QĐ-SGDĐT", licenseDate: "15/07/2021", licenseExpiry: "15/07/2026",
    capacity: 2000, studentCount: 1547, classCount: 42, establishedYear: 2015,
    programs: ["GDTX lớp 10-12", "Nghề Điện-Lạnh", "Nấu ăn sơ cấp", "Tiếng Anh giao tiếp"],
    rating: 4,
    auditLog: [
      { action: "Kiểm tra định kỳ", time: "15/03/2026 09:00", actor: "Sở GD&ĐT", note: "Đạt chuẩn, không vi phạm" },
      { action: "Gia hạn GPHĐ", time: "20/07/2021 10:30", actor: "Sở GD&ĐT", note: "Gia hạn thêm 5 năm đến 2026" },
    ],
  },
  {
    id: "c2", name: "Trung tâm Ngoại ngữ Apollo", shortName: "Apollo",
    type: "ngoai_ngu", status: "active",
    director: "Trần Thị Bích", email: "contact@apollo.edu.vn", phone: "028.3824.5678",
    address: "45 Nguyễn Huệ, P. Bến Nghé, Q.1", district: "Quận 1",
    licenseNo: "0892/QĐ-SGDĐT", licenseDate: "10/03/2020", licenseExpiry: "10/03/2025",
    capacity: 5000, studentCount: 4231, classCount: 128, establishedYear: 2010,
    programs: ["IELTS", "TOEIC", "SAT/ACT", "Tiếng Anh trẻ em", "Tiếng Nhật", "Tiếng Hàn"],
    rating: 5,
    auditLog: [
      { action: "Cảnh báo phí vượt trần", time: "02/02/2026 14:00", actor: "Phòng QLNN", note: "Đã khắc phục, nộp biên bản" },
      { action: "Kiểm tra định kỳ", time: "10/11/2025 08:30", actor: "Sở GD&ĐT", note: "Đạt chuẩn xuất sắc" },
    ],
  },
  {
    id: "c3", name: "Trung tâm Tin học Nhật Nghề", shortName: "Nhật Nghề",
    type: "tin_hoc", status: "active",
    director: "Lê Văn Cường", email: "info@nhatnghe.edu.vn", phone: "028.3825.6789",
    address: "12 Cộng Hòa, P.4, Q. Tân Bình", district: "Tân Bình",
    licenseNo: "1102/QĐ-SGDĐT", licenseDate: "05/05/2018", licenseExpiry: "05/05/2028",
    capacity: 1500, studentCount: 987, classCount: 31, establishedYear: 2012,
    programs: ["IC3 Tin học", "MOS Excel/Word", "Kế toán máy", "AutoCAD", "Lập trình Python"],
    rating: 4,
    auditLog: [
      { action: "Kiểm tra CSVC", time: "20/01/2026 10:00", actor: "Phòng Chuyên môn", note: "Cần nâng cấp phòng máy Lab 3" },
    ],
  },
  {
    id: "c4", name: "TT GDNN - GDTX Quận 3", shortName: "GDNN Q3",
    type: "gdnn_gdtx", status: "inactive",
    director: "Phạm Thị Duyên", email: "ttgdnnq3@hcm.edu.vn", phone: "028.3829.4567",
    address: "78 Võ Thị Sáu, P.6, Q.3", district: "Quận 3",
    licenseNo: "0541/QĐ-SGDĐT", licenseDate: "01/09/2019", licenseExpiry: "01/09/2024",
    capacity: 800, studentCount: 0, classCount: 0, establishedYear: 2008,
    programs: ["GDTX lớp 10-12", "Sơ cấp nghề"],
    rating: 3,
    auditLog: [
      { action: "Tạm dừng hoạt động", time: "15/09/2024 08:00", actor: "Hiệu trưởng", note: "Hết hạn GPHĐ, đang làm thủ tục gia hạn" },
    ],
  },
  {
    id: "c5", name: "Trung tâm Tiếng Anh VUS", shortName: "VUS",
    type: "ngoai_ngu", status: "active",
    director: "Hoàng Văn Ân", email: "hello@vus.edu.vn", phone: "028.3826.7890",
    address: "120 Lý Thường Kiệt, P.7, Q.10", district: "Quận 10",
    licenseNo: "1378/QĐ-SGDĐT", licenseDate: "22/11/2022", licenseExpiry: "22/11/2027",
    capacity: 8000, studentCount: 6542, classCount: 215, establishedYear: 2005,
    programs: ["American English", "IELTS Premium", "Kids English", "Business English", "VSTEP"],
    rating: 5,
    auditLog: [
      { action: "Kiểm tra định kỳ", time: "05/04/2026 09:00", actor: "Sở GD&ĐT", note: "Xuất sắc, không phát sinh" },
    ],
  },
  {
    id: "c6", name: "Trung tâm Tin học KHTN", shortName: "KHTN",
    type: "tin_hoc", status: "active",
    director: "Vũ Thị Phương", email: "khtn@hcmus.edu.vn", phone: "028.3827.8901",
    address: "227 Nguyễn Văn Cừ, P.4, Q.5", district: "Quận 5",
    licenseNo: "0763/QĐ-SGDĐT", licenseDate: "14/04/2021", licenseExpiry: "14/04/2026",
    capacity: 2500, studentCount: 1823, classCount: 58, establishedYear: 2016,
    programs: ["Lập trình Web", "AI & Data Science", "Tin học văn phòng", "Thiết kế đồ họa"],
    rating: 4,
    auditLog: [
      { action: "Bổ sung chương trình mới", time: "10/02/2026 11:00", actor: "KHTN", note: "Thêm môn AI & Data Science đã được duyệt" },
    ],
  },
  {
    id: "c7", name: "TT GDNN - GDTX Tân Bình", shortName: "GDNN TB",
    type: "gdnn_gdtx", status: "active",
    director: "Ngô Văn Giang", email: "ttgdnntbinh@hcm.edu.vn", phone: "028.3828.9012",
    address: "15 Hoàng Hoa Thám, P.5, Q. Tân Bình", district: "Tân Bình",
    licenseNo: "0912/QĐ-SGDĐT", licenseDate: "30/06/2020", licenseExpiry: "30/06/2025",
    capacity: 1200, studentCount: 891, classCount: 26, establishedYear: 2014,
    programs: ["Hàn Điện", "Ô tô sơ cấp", "Nấu ăn", "GDTX lớp 10"],
    rating: 3,
    auditLog: [
      { action: "Cảnh báo vệ sinh ATTP", time: "18/01/2026 10:00", actor: "Chi cục VSATTP", note: "Bếp thực hành cần cải tạo hệ thống thoát khói" },
    ],
  },
  {
    id: "c8", name: "Ngoại ngữ Không Gian", shortName: "Không Gian",
    type: "ngoai_ngu", status: "suspended",
    director: "Đỗ Thị Hoa", email: "khonggian@edu.vn", phone: "028.3830.0123",
    address: "33 Phan Đình Phùng, P.2, Q. Phú Nhuận", district: "Phú Nhuận",
    licenseNo: "0448/QĐ-SGDĐT", licenseDate: "18/03/2019", licenseExpiry: "18/03/2024",
    capacity: 600, studentCount: 0, classCount: 0, establishedYear: 2018,
    programs: ["Tiếng Anh giao tiếp", "TOEIC"],
    rating: 2,
    auditLog: [
      { action: "Đình chỉ GPHĐ", time: "25/04/2025 08:00", actor: "Thanh tra Sở", note: "Vi phạm PCCC, thiếu hệ thống báo cháy" },
      { action: "Cảnh báo lần 1", time: "10/03/2025 09:00", actor: "Thanh tra Sở", note: "Thông báo vi phạm PCCC lần 1" },
    ],
  },
  {
    id: "c9", name: "Tin học Sao Việt", shortName: "Sao Việt",
    type: "tin_hoc", status: "active",
    director: "Bùi Văn Kiên", email: "saoviet@edu.vn", phone: "028.3831.1234",
    address: "88 Đinh Bộ Lĩnh, P.26, Q. Bình Thạnh", district: "Bình Thạnh",
    licenseNo: "1556/QĐ-SGDĐT", licenseDate: "07/10/2023", licenseExpiry: "07/10/2028",
    capacity: 900, studentCount: 612, classCount: 19, establishedYear: 2021,
    programs: ["MOS Office", "Kế toán tổng hợp", "Thiết kế web"],
    rating: 4,
    auditLog: [
      { action: "Cấp GPHĐ mới", time: "07/10/2023 14:00", actor: "Sở GD&ĐT", note: "Đơn vị mới, cấp phép lần đầu" },
    ],
  },
  {
    id: "c10", name: "TT GDNN - GDTX Phú Nhuận", shortName: "GDNN PN",
    type: "gdnn_gdtx", status: "active",
    director: "Lý Thị Kim", email: "ttgdnnphunhuan@hcm.edu.vn", phone: "028.3835.6789",
    address: "9 Phan Xích Long, P.2, Q. Phú Nhuận", district: "Phú Nhuận",
    licenseNo: "0678/QĐ-SGDĐT", licenseDate: "12/06/2017", licenseExpiry: "12/06/2027",
    capacity: 1600, studentCount: 1245, classCount: 38, establishedYear: 2011,
    programs: ["GDTX 10-12", "Điện dân dụng", "May thời trang", "Tin học CB"],
    rating: 4,
    auditLog: [
      { action: "Kiểm tra định kỳ", time: "22/02/2026 08:30", actor: "Sở GD&ĐT", note: "Đạt chuẩn, đề xuất tăng quy mô" },
    ],
  },
];

// ─── Config ───────────────────────────────────────────────────────────────────

const TYPE_CFG: Record<string, { bg: string; text: string; icon: React.ElementType; label: string }> = {
  gdnn_gdtx: { bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-700 dark:text-blue-400", icon: Building2, label: "GDNN - GDTX" },
  ngoai_ngu: { bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", icon: GraduationCap, label: "Ngoại ngữ" },
  tin_hoc:   { bg: "bg-purple-50 dark:bg-purple-500/10", text: "text-purple-700 dark:text-purple-400", icon: Library, label: "Tin học" },
};

const STATUS_CFG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  active:    { bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500", label: "Hoạt động" },
  inactive:  { bg: "bg-gray-100 dark:bg-white/5",          text: "text-gray-600 dark:text-gray-400",       dot: "bg-gray-400",    label: "Không HĐ"  },
  suspended: { bg: "bg-red-50 dark:bg-red-500/10",         text: "text-red-600 dark:text-red-400",         dot: "bg-red-500 animate-pulse", label: "Đình chỉ" },
};

const DISTRICTS = ["Tất cả Quận/Huyện", "Quận 1", "Quận 3", "Quận 5", "Quận 10", "Tân Bình", "Phú Nhuận", "Bình Thạnh"];

// ─── Component ────────────────────────────────────────────────────────────────

export function CentersList() {
  const { adminRole } = useOutletContext<{ adminRole: "department" | "center" }>();
  const isDepartment = adminRole === "department";
  useDocumentTitle(isDepartment ? "Quản lý Đơn vị" : "Hồ sơ Đơn vị");

  const [centers, setCenters] = useState<MockCenter[]>(CENTERS);
  const [search, setSearch] = useState("");
  const [filters, setFilter] = useUrlFilters({ type: "all", status: "all", district: "all" });
  const { page, pageSize, setPage, setPageSize } = useUrlPagination();

  const [detailCenter, setDetailCenter] = useState<MockCenter | null>(null);
  const [detailTab, setDetailTab] = useState<"info" | "capacity" | "log">("info");
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState<MockCenter | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newForm, setNewForm] = useState({
    name: "", shortName: "", type: "gdnn_gdtx", director: "", email: "", phone: "",
    address: "", district: "Quận 1", licenseNo: "", licenseDate: "", licenseExpiry: "",
    capacity: 500, establishedYear: new Date().getFullYear(), programs: "",
  });
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: "suspend" | "activate" | "delete" } | null>(null);

  useEscapeKey(() => { setDetailCenter(null); setEditOpen(false); setAddOpen(false); }, !!detailCenter || editOpen || addOpen);

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const kpi = useMemo(() => ({
    total: centers.length,
    active: centers.filter(c => c.status === "active").length,
    suspended: centers.filter(c => c.status === "suspended").length,
    totalStudents: centers.reduce((s, c) => s + c.studentCount, 0),
    totalClasses: centers.reduce((s, c) => s + c.classCount, 0),
  }), [centers]);

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => centers.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !search || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.director.toLowerCase().includes(q);
    const matchType   = filters.type === "all" || c.type === filters.type;
    const matchStatus = filters.status === "all" || c.status === filters.status;
    const matchDistrict = filters.district === "all" || c.district === filters.district;
    return matchSearch && matchType && matchStatus && matchDistrict;
  }), [centers, search, filters]);

  const paginated = useMemo(() => {
    const s = (page - 1) * pageSize;
    return filtered.slice(s, s + pageSize);
  }, [filtered, page, pageSize]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleStatusChange = useCallback((id: string, action: "suspend" | "activate") => {
    setCenters(p => p.map(c => {
      if (c.id !== id) return c;
      const newStatus = action === "suspend" ? "suspended" : "active";
      const entry = { action: action === "suspend" ? "Đình chỉ GPHĐ" : "Cấp phép HĐ lại", time: new Date().toLocaleString("vi-VN"), actor: "Sở GD&ĐT", note: action === "suspend" ? "Đình chỉ theo quyết định thanh tra" : "Đã khắc phục vi phạm, cấp phép lại" };
      return { ...c, status: newStatus, studentCount: newStatus === "suspended" ? 0 : c.studentCount, auditLog: [entry, ...c.auditLog] };
    }));
    toast.success(action === "suspend" ? "Đã đình chỉ giấy phép hoạt động" : "Đã cấp giấy phép hoạt động trở lại");
    setConfirmAction(null);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setCenters(p => p.filter(c => c.id !== id));
    setDetailCenter(null);
    toast.success("Đã xóa đơn vị");
    setConfirmAction(null);
  }, []);

  const handleAdd = useCallback(() => {
    if (!newForm.name || !newForm.email) { toast.error("Vui lòng nhập Tên và Email trung tâm"); return; }
    const programs = newForm.programs.split(",").map(p => p.trim()).filter(Boolean);
    const center: MockCenter = {
      id: `c${Date.now()}`,
      name: newForm.name,
      shortName: newForm.shortName || (newForm.name.split(" ").pop() ?? "TT"),
      type: newForm.type as MockCenter["type"],
      status: "active",
      director: newForm.director || "Chưa cập nhật",
      email: newForm.email,
      phone: newForm.phone,
      address: newForm.address,
      district: newForm.district,
      licenseNo: newForm.licenseNo || "Chờ cấp phép",
      licenseDate: newForm.licenseDate,
      licenseExpiry: newForm.licenseExpiry,
      capacity: newForm.capacity,
      studentCount: 0,
      classCount: 0,
      establishedYear: newForm.establishedYear,
      programs: programs.length ? programs : ["Chưa cập nhật"],
      rating: 3,
      auditLog: [{ action: "Thêm mới đơn vị", time: new Date().toLocaleString("vi-VN"), actor: "Sở GD&ĐT", note: "Đơn vị được đăng ký mới vào hệ thống" }],
    };
    setCenters(p => [center, ...p]);
    setAddOpen(false);
    setNewForm({ name: "", shortName: "", type: "gdnn_gdtx", director: "", email: "", phone: "", address: "", district: "Quận 1", licenseNo: "", licenseDate: "", licenseExpiry: "", capacity: 500, establishedYear: new Date().getFullYear(), programs: "" });
    toast.success(`Đã thêm mới trung tâm "${center.name}"`);
  }, [newForm]);

  const handleEdit = useCallback(() => {
    if (!editData) return;
    setCenters(p => p.map(c => c.id === editData.id ? editData : c));
    if (detailCenter?.id === editData.id) setDetailCenter(editData);
    setEditOpen(false);
    toast.success("Đã cập nhật thông tin trung tâm");
  }, [editData, detailCenter]);

  const openEdit = useCallback((center: MockCenter) => {
    setEditData({ ...center });
    setEditOpen(true);
    setActionMenu(null);
  }, []);

  const openDetail = useCallback((center: MockCenter) => {
    setDetailCenter(center);
    setDetailTab("info");
    setActionMenu(null);
  }, []);

  // ── Center View (for center role) ─────────────────────────────────────────
  if (!isDepartment) {
    return <CenterProfileForm />;
  }

  // ── Capacity bar ──────────────────────────────────────────────────────────
  const CapBar = ({ count, capacity }: { count: number; capacity: number }) => {
    const pct = Math.min(100, Math.round((count / capacity) * 100));
    const color = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500";
    return (
      <div className="w-full">
        <div className="flex justify-between text-[11px] mb-0.5">
          <span className="font-semibold text-foreground">{count.toLocaleString()}</span>
          <span className="text-muted-foreground">/{capacity.toLocaleString()}</span>
        </div>
        <div className="h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  };

  // ── Stars ──────────────────────────────────────────────────────────────────
  const Stars = ({ n }: { n: number }) => (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-3 h-3 ${i <= n ? "text-amber-400 fill-amber-400" : "text-gray-200 dark:text-white/10"}`} />
      ))}
    </div>
  );

  const licenseExpiring = (expiry: string) => {
    const [d, m, y] = expiry.split("/").map(Number);
    const exp = new Date(y, m - 1, d);
    const now = new Date();
    const diff = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff < 180; // within 6 months
  };

  return (
    <div>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[26px] font-black text-[#1a1a2e] dark:text-foreground tracking-tight">Quản Lý Trung Tâm & Đơn vị</h1>
          <p className="text-muted-foreground text-[14px] mt-0.5">Giám sát, cấp phép và quản lý toàn bộ đơn vị đào tạo trực thuộc Sở</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => toast.success("Đang xuất biểu mẫu Excel...")} className="flex items-center gap-2 bg-white dark:bg-card border border-gray-200 dark:border-border px-4 py-2.5 rounded-xl text-[14px] font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <Download className="w-4 h-4" /> Xuất Danh Sách
          </button>
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl text-[14px] font-semibold shadow-sm hover:shadow-md transition-all">
            <Plus className="w-4 h-4" /> Thêm Đơn vị
          </button>
        </div>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Tổng Đơn vị", value: kpi.total, icon: Building2, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10" },
          { label: "Đang Hoạt động", value: kpi.active, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
          { label: "Đình chỉ / Không HĐ", value: kpi.total - kpi.active, icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-500/10" },
          { label: "Tổng Học viên", value: kpi.totalStudents.toLocaleString(), icon: Users, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-500/10" },
          { label: "Tổng Lớp học", value: kpi.totalClasses, icon: BookOpen, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-500/10" },
        ].map(k => (
          <div key={k.label} className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${k.bg} flex items-center justify-center shrink-0`}>
              <k.icon className={`w-5 h-5 ${k.color}`} />
            </div>
            <div>
              <p className={`text-[22px] font-black leading-none ${k.color}`}>{k.value}</p>
              <p className="text-[11.5px] text-muted-foreground mt-0.5">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ───────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm tên TT, email, giám đốc..."
            className="w-full bg-[#f4f5f7] dark:bg-white/5 pl-10 pr-4 py-2.5 rounded-xl text-[14px] outline-none border border-transparent focus:border-primary/30 transition-all" />
        </div>
        {[
          { key: "type", opts: [["all","Tất cả Loại hình"],["gdnn_gdtx","GDNN-GDTX"],["ngoai_ngu","Ngoại ngữ"],["tin_hoc","Tin học"]] },
          { key: "status", opts: [["all","Tất cả Trạng thái"],["active","Hoạt động"],["inactive","Không HĐ"],["suspended","Đình chỉ"]] },
          { key: "district", opts: DISTRICTS.map((d,i) => [i === 0 ? "all" : d, d]) },
        ].map(({ key, opts }) => (
          <select key={key} value={(filters as any)[key]} onChange={e => { setFilter(key as any, e.target.value); setPage(1); }}
            className="bg-[#f4f5f7] dark:bg-white/5 px-4 py-2.5 rounded-xl text-[14px] font-medium outline-none border border-transparent focus:border-primary/30 min-w-[150px]">
            {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        ))}
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl overflow-hidden">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="border-b border-gray-100 dark:border-border bg-gray-50/50 dark:bg-white/[0.02]">
              <th className="px-5 py-3.5 text-left font-semibold text-muted-foreground text-[12px] uppercase tracking-wide">Đơn vị / Trung tâm</th>
              <th className="px-4 py-3.5 text-left font-semibold text-muted-foreground text-[12px] uppercase tracking-wide hidden md:table-cell">Loại hình</th>
              <th className="px-4 py-3.5 text-left font-semibold text-muted-foreground text-[12px] uppercase tracking-wide hidden lg:table-cell">Người đại diện</th>
              <th className="px-4 py-3.5 text-left font-semibold text-muted-foreground text-[12px] uppercase tracking-wide hidden xl:table-cell">Học viên / Lớp</th>
              <th className="px-4 py-3.5 text-left font-semibold text-muted-foreground text-[12px] uppercase tracking-wide hidden xl:table-cell">GPHĐ</th>
              <th className="px-4 py-3.5 text-left font-semibold text-muted-foreground text-[12px] uppercase tracking-wide">Trạng thái</th>
              <th className="px-4 py-3.5 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-white/[0.03]">
            {paginated.map(c => {
              const tc = TYPE_CFG[c.type];
              const sc = STATUS_CFG[c.status];
              const TypeIcon = tc.icon;
              const expiring = c.licenseExpiry && licenseExpiring(c.licenseExpiry);
              return (
                <tr key={c.id} onClick={() => openDetail(c)} className="hover:bg-gray-50/70 dark:hover:bg-white/[0.025] transition-colors cursor-pointer group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${tc.bg} flex items-center justify-center shrink-0`}>
                        <TypeIcon className={`w-5 h-5 ${tc.text}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[14.5px] text-[#1a1a2e] dark:text-foreground truncate">
                          <HighlightText text={c.name} query={search} />
                        </p>
                        <p className="text-[12px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 shrink-0" />{c.district}
                          <span className="mx-1 opacity-40">·</span>
                          <Mail className="w-3 h-3 shrink-0" />{c.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold ${tc.bg} ${tc.text}`}>
                      <TypeIcon className="w-3 h-3" />{tc.label}
                    </span>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <p className="font-semibold text-[13.5px] text-foreground">{c.director}</p>
                    <p className="text-[12px] text-muted-foreground">{c.phone}</p>
                  </td>
                  <td className="px-4 py-4 hidden xl:table-cell w-36">
                    <CapBar count={c.studentCount} capacity={c.capacity} />
                    <p className="text-[11px] text-muted-foreground mt-1">{c.classCount} lớp đang mở</p>
                  </td>
                  <td className="px-4 py-4 hidden xl:table-cell">
                    <p className="font-mono text-[12px] font-semibold text-foreground">{c.licenseNo}</p>
                    <p className={`text-[11px] mt-0.5 flex items-center gap-1 ${expiring ? "text-amber-600 font-semibold" : "text-muted-foreground"}`}>
                      {expiring && <AlertTriangle className="w-3 h-3" />}
                      HH: {c.licenseExpiry}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold ${sc.bg} ${sc.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{sc.label}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right" onClick={e => e.stopPropagation()}>
                    <div className="relative">
                      <button onClick={() => setActionMenu(actionMenu === c.id ? null : c.id)}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-white/10 transition-all">
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </button>
                      {actionMenu === c.id && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setActionMenu(null)} />
                          <div className="absolute right-0 top-8 w-52 bg-white dark:bg-card rounded-xl shadow-xl border border-gray-100 dark:border-border py-1.5 z-40">
                            {[
                              { icon: Eye, label: "Xem chi tiết", fn: () => openDetail(c) },
                              { icon: Edit, label: "Chỉnh sửa", fn: () => openEdit(c) },
                              c.status === "active"
                                ? { icon: Ban, label: "Đình chỉ GPHĐ", fn: () => { setConfirmAction({ id: c.id, action: "suspend" }); setActionMenu(null); }, cls: "text-amber-600" }
                                : { icon: CheckCircle, label: "Cấp phép HĐ lại", fn: () => { setConfirmAction({ id: c.id, action: "activate" }); setActionMenu(null); }, cls: "text-emerald-600" },
                              { icon: Trash2, label: "Xóa đơn vị", fn: () => { setConfirmAction({ id: c.id, action: "delete" }); setActionMenu(null); }, cls: "text-red-600" },
                            ].map(item => (
                              <button key={item.label} onClick={() => { item.fn(); setActionMenu(null); }}
                                className={`w-full flex items-center gap-2.5 px-4 py-2 text-[13px] font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${(item as any).cls ?? "text-foreground/80"}`}>
                                <item.icon className="w-4 h-4" />{item.label}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {paginated.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-16 text-center text-muted-foreground text-[14px]">Không tìm thấy đơn vị nào</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <Pagination page={page} total={filtered.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} itemLabel="Đơn vị" />
      </div>

      {/* ── Detail Drawer ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {detailCenter && (
          <motion.div className="fixed inset-0 z-50 flex" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDetailCenter(null)} />
            <motion.div
              className="relative ml-auto w-1/2 min-w-[480px] bg-white dark:bg-card h-full overflow-y-auto shadow-2xl border-l border-gray-100 dark:border-border"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
            >
              {/* Drawer header */}
              <div className={`${TYPE_CFG[detailCenter.type].bg} p-5 border-b border-gray-100 dark:border-border`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    {(() => { const TypeIcon = TYPE_CFG[detailCenter.type].icon; return <div className={`w-12 h-12 rounded-2xl bg-white/70 dark:bg-white/10 flex items-center justify-center`}><TypeIcon className={`w-6 h-6 ${TYPE_CFG[detailCenter.type].text}`} /></div>; })()}
                    <div>
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{TYPE_CFG[detailCenter.type].label} · {detailCenter.district}</p>
                      <h3 className="text-[17px] font-black text-[#1a1a2e] dark:text-foreground leading-snug">{detailCenter.name}</h3>
                    </div>
                  </div>
                  <button onClick={() => setDetailCenter(null)} className="p-2 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors shrink-0">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold ${STATUS_CFG[detailCenter.status].bg} ${STATUS_CFG[detailCenter.status].text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CFG[detailCenter.status].dot}`} />{STATUS_CFG[detailCenter.status].label}
                  </span>
                  <Stars n={detailCenter.rating} />
                  <span className="text-[12px] text-muted-foreground font-medium">Thành lập {detailCenter.establishedYear}</span>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-100 dark:border-border">
                {([["info","Thông tin","Info"],["capacity","Năng lực","Cap"],["log","Lịch sử","Log"]] as [typeof detailTab, string, string][]).map(([v, label]) => (
                  <button key={v} onClick={() => setDetailTab(v)}
                    className={`flex-1 py-3 text-[13px] font-semibold transition-colors border-b-2 ${detailTab === v ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                    {label}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {/* Tab: Info */}
                {detailTab === "info" && (
                  <div className="space-y-4">
                    {[
                      { icon: Users, label: "Giám đốc / Đại diện", value: detailCenter.director },
                      { icon: Phone, label: "Điện thoại", value: detailCenter.phone },
                      { icon: Mail, label: "Email", value: detailCenter.email },
                      { icon: MapPin, label: "Địa chỉ", value: detailCenter.address },
                    ].map(item => (
                      <div key={item.label} className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                          <item.icon className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-[11.5px] text-muted-foreground font-medium uppercase tracking-wide">{item.label}</p>
                          <p className="text-[14px] font-semibold text-foreground mt-0.5">{item.value}</p>
                        </div>
                      </div>
                    ))}

                    <div className="border-t border-gray-100 dark:border-border pt-4 mt-4">
                      <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-wide mb-3">Giấy phép Hoạt động</p>
                      <div className="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-4 space-y-2">
                        {[
                          ["Số QĐ", detailCenter.licenseNo],
                          ["Ngày cấp", detailCenter.licenseDate],
                          ["Hết hạn", detailCenter.licenseExpiry],
                        ].map(([l, v]) => (
                          <div key={l} className="flex justify-between text-[13px]">
                            <span className="text-muted-foreground">{l}</span>
                            <span className={`font-semibold ${l === "Hết hạn" && licenseExpiring(detailCenter.licenseExpiry) ? "text-amber-600" : "text-foreground"}`}>
                              {l === "Hết hạn" && licenseExpiring(detailCenter.licenseExpiry) && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                              {v}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-border pt-4">
                      <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-wide mb-3">Chương trình Đào tạo</p>
                      <div className="flex flex-wrap gap-2">
                        {detailCenter.programs.map(p => (
                          <span key={p} className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[12px] font-semibold">{p}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Capacity */}
                {detailTab === "capacity" && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { icon: Users, label: "Học viên hiện tại", value: detailCenter.studentCount.toLocaleString(), sub: `/ ${detailCenter.capacity.toLocaleString()} chỗ`, color: "text-blue-600" },
                        { icon: BookOpen, label: "Lớp đang mở", value: detailCenter.classCount, sub: "lớp học", color: "text-emerald-600" },
                        { icon: TrendingUp, label: "Công suất sử dụng", value: `${Math.round(detailCenter.studentCount / detailCenter.capacity * 100)}%`, sub: detailCenter.studentCount > 0 ? "Đang khai thác" : "Chưa hoạt động", color: "text-violet-600" },
                        { icon: Award, label: "Xếp loại", value: `${detailCenter.rating}/5 ★`, sub: "Đánh giá Sở GD", color: "text-amber-600" },
                      ].map(k => (
                        <div key={k.label} className="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-4">
                          <div className={`${k.color} font-black text-[22px] leading-none`}>{k.value}</div>
                          <p className="text-[12px] text-muted-foreground mt-1 font-medium">{k.label}</p>
                          <p className="text-[11px] text-muted-foreground/70">{k.sub}</p>
                        </div>
                      ))}
                    </div>

                    <div>
                      <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-wide mb-2">Tỷ lệ lấp đầy</p>
                      <div className="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-4">
                        <div className="flex justify-between text-[13px] mb-2">
                          <span className="font-semibold">{detailCenter.studentCount.toLocaleString()} HV đang học</span>
                          <span className="text-muted-foreground">Tối đa {detailCenter.capacity.toLocaleString()}</span>
                        </div>
                        <div className="h-3 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                          {(() => {
                            const pct = Math.min(100, Math.round(detailCenter.studentCount / detailCenter.capacity * 100));
                            const col = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500";
                            return <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: "easeOut" }} className={`h-full rounded-full ${col}`} />;
                          })()}
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-wide mb-2">Chương trình đào tạo ({detailCenter.programs.length})</p>
                      <div className="space-y-1.5">
                        {detailCenter.programs.map((p, i) => (
                          <div key={p} className="flex items-center gap-2 py-2 border-b border-gray-100 dark:border-white/[0.04] last:border-0">
                            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center shrink-0">{i+1}</span>
                            <span className="text-[13px] font-medium text-foreground">{p}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Log */}
                {detailTab === "log" && (
                  <div>
                    <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-wide mb-4">Lịch sử Kiểm tra & Xử lý</p>
                    <div className="relative border-l-2 border-gray-100 dark:border-border ml-3 pl-5 space-y-0">
                      {detailCenter.auditLog.map((entry, i) => (
                        <div key={i} className="relative pb-5">
                          <div className={`absolute -left-[25px] w-4 h-4 rounded-full border-2 border-white dark:border-card flex items-center justify-center ${entry.action.includes("Đình chỉ") || entry.action.includes("Cảnh báo") ? "bg-red-400" : entry.action.includes("phê duyệt") || entry.action.includes("Cấp phép") ? "bg-emerald-400" : "bg-blue-400"}`}>
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          </div>
                          <div className="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-3.5">
                            <div className="flex justify-between items-start gap-2 mb-1">
                              <p className="text-[13.5px] font-bold text-foreground">{entry.action}</p>
                              <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">{entry.time}</span>
                            </div>
                            <p className="text-[12.5px] text-muted-foreground">{entry.note}</p>
                            <p className="text-[11px] text-primary font-semibold mt-1.5">— {entry.actor}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer footer actions */}
              <div className="sticky bottom-0 bg-white dark:bg-card border-t border-gray-100 dark:border-border p-4 flex gap-2">
                <button onClick={() => openEdit(detailCenter)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-border text-[13px] font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <Edit className="w-4 h-4" /> Chỉnh sửa
                </button>
                {detailCenter.status === "active" ? (
                  <button onClick={() => setConfirmAction({ id: detailCenter.id, action: "suspend" })} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-amber-200 dark:border-amber-500/30 text-amber-600 text-[13px] font-semibold hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors">
                    <Ban className="w-4 h-4" /> Đình chỉ
                  </button>
                ) : (
                  <button onClick={() => setConfirmAction({ id: detailCenter.id, action: "activate" })} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 text-[13px] font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors">
                    <CheckCircle className="w-4 h-4" /> Cấp phép lại
                  </button>
                )}
                <button onClick={() => toast.success("Đang xuất hồ sơ trung tâm...")} className="p-2.5 rounded-xl border border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-white/5 transition-colors" title="Xuất hồ sơ">
                  <Download className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Add Modal ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {addOpen && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAddOpen(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white dark:bg-card rounded-2xl shadow-2xl my-4 overflow-hidden border border-gray-100 dark:border-border">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-border">
                <h3 className="text-[18px] font-bold">Thêm mới Đơn vị / Trung tâm</h3>
                <button onClick={() => setAddOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
              <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
                <Section title="Thông tin cơ bản">
                  <Row2>
                    <Field label="Tên Trung tâm *"><input value={newForm.name} onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))} placeholder="TT Ngoại ngữ VUS..." className={inputCls} /></Field>
                    <Field label="Tên viết tắt"><input value={newForm.shortName} onChange={e => setNewForm(f => ({ ...f, shortName: e.target.value }))} placeholder="VUS" className={inputCls} /></Field>
                  </Row2>
                  <Row2>
                    <Field label="Loại hình">
                      <select value={newForm.type} onChange={e => setNewForm(f => ({ ...f, type: e.target.value }))} className={inputCls}>
                        <option value="gdnn_gdtx">GDNN - GDTX</option>
                        <option value="ngoai_ngu">Ngoại ngữ</option>
                        <option value="tin_hoc">Tin học</option>
                      </select>
                    </Field>
                    <Field label="Năm thành lập">
                      <input type="number" value={newForm.establishedYear} onChange={e => setNewForm(f => ({ ...f, establishedYear: +e.target.value }))} className={inputCls} />
                    </Field>
                  </Row2>
                  <Field label="Địa chỉ đầy đủ"><input value={newForm.address} onChange={e => setNewForm(f => ({ ...f, address: e.target.value }))} placeholder="Số nhà, đường, phường, quận..." className={inputCls} /></Field>
                  <Row2>
                    <Field label="Quận/Huyện">
                      <select value={newForm.district} onChange={e => setNewForm(f => ({ ...f, district: e.target.value }))} className={inputCls}>
                        {DISTRICTS.slice(1).map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </Field>
                    <Field label="Quy mô (HV tối đa)">
                      <input type="number" value={newForm.capacity} onChange={e => setNewForm(f => ({ ...f, capacity: +e.target.value }))} className={inputCls} />
                    </Field>
                  </Row2>
                </Section>

                <Section title="Người đại diện & Liên hệ">
                  <Row2>
                    <Field label="Họ tên Giám đốc *"><input value={newForm.director} onChange={e => setNewForm(f => ({ ...f, director: e.target.value }))} placeholder="Nguyễn Văn A" className={inputCls} /></Field>
                    <Field label="Điện thoại"><input value={newForm.phone} onChange={e => setNewForm(f => ({ ...f, phone: e.target.value }))} placeholder="028.xxxx.xxxx" className={inputCls} /></Field>
                  </Row2>
                  <Field label="Email liên hệ *"><input type="email" value={newForm.email} onChange={e => setNewForm(f => ({ ...f, email: e.target.value }))} placeholder="contact@domain.edu.vn" className={inputCls} /></Field>
                </Section>

                <Section title="Giấy phép Hoạt động">
                  <Row2>
                    <Field label="Số QĐ cấp phép"><input value={newForm.licenseNo} onChange={e => setNewForm(f => ({ ...f, licenseNo: e.target.value }))} placeholder="XXXX/QĐ-SGDĐT" className={inputCls} /></Field>
                    <Field label="Ngày cấp"><input value={newForm.licenseDate} onChange={e => setNewForm(f => ({ ...f, licenseDate: e.target.value }))} placeholder="dd/mm/yyyy" className={inputCls} /></Field>
                  </Row2>
                  <Field label="Ngày hết hạn"><input value={newForm.licenseExpiry} onChange={e => setNewForm(f => ({ ...f, licenseExpiry: e.target.value }))} placeholder="dd/mm/yyyy" className={inputCls} /></Field>
                </Section>

                <Section title="Chương trình Đào tạo">
                  <Field label="Danh sách chương trình (phân cách bằng dấu phẩy)">
                    <input value={newForm.programs} onChange={e => setNewForm(f => ({ ...f, programs: e.target.value }))} placeholder="VD: Tiếng Anh B1, IELTS, Tin học văn phòng" className={inputCls} />
                  </Field>
                </Section>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 dark:border-border flex justify-end gap-2">
                <button onClick={() => setAddOpen(false)} className="px-4 py-2.5 rounded-xl text-[14px] font-semibold text-muted-foreground hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">Hủy</button>
                <button onClick={handleAdd} className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-[14px] font-semibold shadow-sm transition-all">Lưu Đơn vị</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Edit Modal ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {editOpen && editData && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditOpen(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white dark:bg-card rounded-2xl shadow-2xl my-4 overflow-hidden border border-gray-100 dark:border-border">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-border">
                <h3 className="text-[18px] font-bold">Chỉnh sửa: {editData.name}</h3>
                <button onClick={() => setEditOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
              <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
                <Section title="Thông tin cơ bản">
                  <Row2>
                    <Field label="Tên Trung tâm"><input value={editData.name} onChange={e => setEditData(d => d ? { ...d, name: e.target.value } : d)} className={inputCls} /></Field>
                    <Field label="Loại hình">
                      <select value={editData.type} onChange={e => setEditData(d => d ? { ...d, type: e.target.value as any } : d)} className={inputCls}>
                        <option value="gdnn_gdtx">GDNN - GDTX</option>
                        <option value="ngoai_ngu">Ngoại ngữ</option>
                        <option value="tin_hoc">Tin học</option>
                      </select>
                    </Field>
                  </Row2>
                  <Field label="Địa chỉ"><input value={editData.address} onChange={e => setEditData(d => d ? { ...d, address: e.target.value } : d)} className={inputCls} /></Field>
                  <Row2>
                    <Field label="Quận/Huyện">
                      <select value={editData.district} onChange={e => setEditData(d => d ? { ...d, district: e.target.value } : d)} className={inputCls}>
                        {DISTRICTS.slice(1).map(dist => <option key={dist} value={dist}>{dist}</option>)}
                      </select>
                    </Field>
                    <Field label="Quy mô (HV)"><input type="number" value={editData.capacity} onChange={e => setEditData(d => d ? { ...d, capacity: +e.target.value } : d)} className={inputCls} /></Field>
                  </Row2>
                </Section>
                <Section title="Người đại diện">
                  <Row2>
                    <Field label="Giám đốc"><input value={editData.director} onChange={e => setEditData(d => d ? { ...d, director: e.target.value } : d)} className={inputCls} /></Field>
                    <Field label="Điện thoại"><input value={editData.phone} onChange={e => setEditData(d => d ? { ...d, phone: e.target.value } : d)} className={inputCls} /></Field>
                  </Row2>
                  <Field label="Email"><input value={editData.email} onChange={e => setEditData(d => d ? { ...d, email: e.target.value } : d)} className={inputCls} /></Field>
                </Section>
                <Section title="Giấy phép">
                  <Row2>
                    <Field label="Số QĐ"><input value={editData.licenseNo} onChange={e => setEditData(d => d ? { ...d, licenseNo: e.target.value } : d)} className={inputCls} /></Field>
                    <Field label="Hết hạn"><input value={editData.licenseExpiry} onChange={e => setEditData(d => d ? { ...d, licenseExpiry: e.target.value } : d)} className={inputCls} /></Field>
                  </Row2>
                </Section>
                <Section title="Chương trình">
                  <Field label="Danh sách (phân cách bằng dấu phẩy)">
                    <input value={editData.programs.join(", ")} onChange={e => setEditData(d => d ? { ...d, programs: e.target.value.split(",").map(p => p.trim()).filter(Boolean) } : d)} className={inputCls} />
                  </Field>
                </Section>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 dark:border-border flex justify-end gap-2">
                <button onClick={() => setEditOpen(false)} className="px-4 py-2.5 rounded-xl text-[14px] font-semibold text-muted-foreground hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">Hủy</button>
                <button onClick={handleEdit} className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-[14px] font-semibold shadow-sm transition-all flex items-center gap-2"><Save className="w-4 h-4" /> Lưu thay đổi</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Confirm Modal ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {confirmAction && (
          <motion.div className="fixed inset-0 z-[60] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmAction(null)} />
            <motion.div initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}
              className="relative w-full max-w-sm bg-white dark:bg-card rounded-2xl shadow-2xl p-6 border border-gray-100 dark:border-border text-center">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${confirmAction.action === "delete" ? "bg-red-100 dark:bg-red-500/20" : confirmAction.action === "suspend" ? "bg-amber-100 dark:bg-amber-500/20" : "bg-emerald-100 dark:bg-emerald-500/20"}`}>
                {confirmAction.action === "delete" ? <Trash2 className="w-6 h-6 text-red-600" /> : confirmAction.action === "suspend" ? <Ban className="w-6 h-6 text-amber-600" /> : <CheckCircle className="w-6 h-6 text-emerald-600" />}
              </div>
              <h3 className="text-[17px] font-bold mb-1">{confirmAction.action === "delete" ? "Xóa đơn vị?" : confirmAction.action === "suspend" ? "Đình chỉ GPHĐ?" : "Cấp phép lại?"}</h3>
              <p className="text-[13px] text-muted-foreground mb-5">{confirmAction.action === "delete" ? "Thao tác này không thể hoàn tác. Dữ liệu trung tâm sẽ bị xóa vĩnh viễn." : confirmAction.action === "suspend" ? "Trung tâm sẽ bị tạm dừng hoạt động và không được phép tuyển sinh." : "Trung tâm sẽ được phép hoạt động và tuyển sinh trở lại."}</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmAction(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-border text-[14px] font-semibold hover:bg-gray-50 dark:hover:bg-white/5">Hủy</button>
                <button
                  onClick={() => confirmAction.action === "delete" ? handleDelete(confirmAction.id) : handleStatusChange(confirmAction.id, confirmAction.action as "suspend" | "activate")}
                  className={`flex-1 py-2.5 rounded-xl text-white text-[14px] font-semibold ${confirmAction.action === "delete" ? "bg-red-600 hover:bg-red-700" : confirmAction.action === "suspend" ? "bg-amber-500 hover:bg-amber-600" : "bg-emerald-600 hover:bg-emerald-700"}`}>
                  {confirmAction.action === "delete" ? "Xóa" : confirmAction.action === "suspend" ? "Đình chỉ" : "Cấp phép"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

const inputCls = "w-full bg-[#f4f5f7] dark:bg-white/5 border border-transparent focus:border-primary/40 px-3.5 py-2.5 rounded-xl text-[14px] outline-none transition-all font-medium";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider mb-3 border-b border-gray-100 dark:border-border pb-2">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Row2({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[13px] font-semibold text-foreground mb-1.5">{label}</label>
      {children}
    </div>
  );
}

// ─── Center Profile (for center role) ─────────────────────────────────────────

function CenterProfileForm() {
  useDocumentTitle("Hồ sơ Đơn vị");
  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[24px] font-extrabold text-[#1a1a2e] dark:text-foreground">Cập nhật Hồ sơ Đơn vị</h1>
          <p className="text-[14px] text-muted-foreground mt-1">Thông tin công khai và hồ sơ cấp phép của cơ sở đào tạo</p>
        </div>
        <button onClick={() => toast.success("Đã ghi nhận và gửi lên Sở chờ duyệt")}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl shadow-sm font-semibold transition-all hover:shadow-md">
          <Save className="w-4 h-4" /> Lưu & Gửi Sở duyệt
        </button>
      </div>
      <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 md:p-8 space-y-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gray-50 dark:bg-white/5 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-border cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
              <ImageIcon className="w-8 h-8 text-gray-400 mb-1" />
              <span className="text-[11px] font-semibold text-gray-500">Tải Logo</span>
            </div>
            <div className="flex-1 space-y-1.5 text-center md:text-left">
              <h2 className="text-[20px] font-bold text-foreground">Trung tâm Ngoại ngữ AMES</h2>
              <p className="text-[14px] text-muted-foreground">Mã đơn vị: TT-092 · Ngày cấp phép: 15/07/2021</p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-2">
                <span className="inline-flex items-center gap-1.5 text-[12px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 dark:border-emerald-500/30">
                  <CheckCircle className="w-3.5 h-3.5" /> Đang Hoạt động
                </span>
                <span className="inline-flex items-center gap-1.5 text-[12px] px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200 dark:border-blue-500/30">
                  Loại hình: Ngoại ngữ
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="md:col-span-2"><h3 className="text-[14px] font-bold text-muted-foreground uppercase tracking-wider border-b border-gray-100 dark:border-border pb-2">Thông tin Cơ bản</h3></div>
            {[["Tên Trung tâm *","Trung tâm Ngoại ngữ AMES"],["Người đại diện *","Trần Thị Bích"],["Điện thoại *","0902345678"],["Email *","contact@ames.edu.vn"]].map(([label, val]) => (
              <div key={label}>
                <label className="block text-[13px] font-bold text-foreground mb-2">{label}</label>
                <input defaultValue={val} className="w-full bg-[#f4f5f7] dark:bg-muted border border-transparent focus:border-primary/50 px-4 py-2.5 rounded-xl text-[14px] outline-none transition-all font-medium" />
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="block text-[13px] font-bold text-foreground mb-2">Địa chỉ trụ sở chính *</label>
              <input defaultValue="Tòa nhà Đổi mới, Quận 1, TP Hồ Chí Minh" className="w-full bg-[#f4f5f7] dark:bg-muted border border-transparent focus:border-primary/50 px-4 py-2.5 rounded-xl text-[14px] outline-none transition-all font-medium" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-4">
            <div className="md:col-span-2"><h3 className="text-[14px] font-bold text-muted-foreground uppercase tracking-wider border-b border-gray-100 dark:border-border pb-2">Hồ sơ Cấp phép</h3></div>
            <div className="md:col-span-2 p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[13.5px] font-medium text-amber-800 dark:text-amber-400">Mỗi thay đổi thông tin Cấp phép cần Sở GD&ĐT phê duyệt lại trước khi có hiệu lực chính thức.</p>
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-bold text-foreground mb-2">Mã Quyết định Cấp phép</label>
              <input defaultValue="1245/QĐ-SGDĐT" disabled className="w-full bg-gray-100 dark:bg-white/5 text-gray-500 px-4 py-2.5 rounded-xl text-[14px] cursor-not-allowed font-medium" />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-foreground mb-2">Quy mô Đào tạo (HV tối đa)</label>
              <input defaultValue="5000" type="number" className="w-full bg-[#f4f5f7] dark:bg-muted border border-transparent focus:border-primary/50 px-4 py-2.5 rounded-xl text-[14px] outline-none transition-all font-medium" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

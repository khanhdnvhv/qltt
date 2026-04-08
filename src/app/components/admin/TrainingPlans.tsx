import { useUrlPagination } from "../../utils/useUrlPagination";
import { useState, useMemo } from "react";
import { useDocumentTitle, useEscapeKey } from "../../utils/hooks";
import { useUrlFilters } from "../../utils/useUrlFilters";
import { useOutletContext } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  Search, MoreHorizontal, Plus, Download,
  CheckCircle, FileText, Clock, Eye, AlertCircle, Edit, CalendarDays, Send, X, UploadCloud, Building2, Target,
  FileSignature, ChevronRight, File, MessageSquare, History, Check
} from "lucide-react";
import { VirtualTable, type VirtualTableColumn } from "./VirtualTable";
import { toast } from "sonner";
import { HighlightText } from "../ui/HighlightText";
import { Pagination } from "./Pagination";

interface MockPlan {
  id: string;
  title: string;
  centerName: string;
  type: "Ngôn ngữ" | "Tin học" | "GDNN" | "GDTX" | "Tổng hợp";
  term: string;
  expectedStudents: number;
  submittedAt: string | null;
  status: "draft" | "pending" | "revision" | "approved" | "rejected";
  files: string[];
  history: { action: string; time: string; actor: string }[];
  comments: string;
}

const generatePlans = (): MockPlan[] => {
  return [
    { id: "KH-26-001", title: "Kế hoạch Chỉ tiêu Ngoại ngữ Q1/2026", centerName: "Trung tâm Ngoại ngữ VUS", type: "Ngôn ngữ", term: "Q1/2026", expectedStudents: 1500, submittedAt: "05/01/2026", status: "approved", files: ["To_trinh_Q1_2026.pdf"], history: [{ action: "Sở GD đã phê duyệt", time: "06/01/2026 09:00", actor: "Sở GD&ĐT" }], comments: "" },
    { id: "KH-26-002", title: "Kế hoạch Phổ cập THCS & THPT", centerName: "TT GDNN-GDTX Quận 1", type: "GDTX", term: "Năm 2026", expectedStudents: 850, submittedAt: "10/01/2026", status: "pending", files: ["De_an_tuyen_sinh_2026.pdf", "Danh_sach_dinh_kem.xlsx"], history: [{ action: "Đã trình Sở chờ thẩm định", time: "10/01/2026 14:30", actor: "Giám đốc TT Q1" }], comments: "" },
    { id: "KH-26-003", title: "Đề án Mở lớp Sửa chữa Ô Tô", centerName: "TT GDNN-GDTX Tân Bình", type: "GDNN", term: "Năm 2026", expectedStudents: 200, submittedAt: "12/01/2026", status: "revision", files: ["De_cuong_Mon_Hoc.pdf"], history: [{ action: "Sở yêu cầu bổ sung CSVC", time: "13/01/2026 10:15", actor: "Phòng Chuyên môn" }], comments: "Đề nghị Trung tâm Tân Bình cập nhật lại danh sách Xưởng thực hành máy đáp ứng đủ quy chuẩn đào tạo Nghề hạng 2." },
    { id: "KH-26-004", title: "Kế hoạch Bồi dưỡng CNTT Cơ bản", centerName: "Trung tâm Tin Học Hùng Vương", type: "Tin học", term: "Q1/2026", expectedStudents: 350, submittedAt: null, status: "draft", files: [], history: [{ action: "Tạo mới bản nháp", time: "15/01/2026 08:00", actor: "Giáo vụ TT" }], comments: "" },
    { id: "KH-26-005", title: "Kế hoạch Liên kết đào tạo Tiếng Nhật", centerName: "Ngoại ngữ Sakura", type: "Ngôn ngữ", term: "Năm 2026", expectedStudents: 400, submittedAt: "16/01/2026", status: "pending", files: ["Hop_dong_lien_ket.pdf"], history: [{ action: "Gửi phê duyệt", time: "16/01/2026 11:20", actor: "Trung tâm" }], comments: "" },
  ];
};

const initialPlans = generatePlans();

const statusProps: Record<string, { bg: string; text: string; dot: string; label: string; icon: any }> = {
  draft: { bg: "bg-gray-100 dark:bg-white/5", text: "text-gray-600 dark:text-gray-400", dot: "bg-gray-400", label: "Bản nháp", icon: FileText },
  pending: { bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500", label: "Chờ thẩm định", icon: Clock },
  revision: { bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500", label: "Yêu cầu sửa", icon: AlertCircle },
  approved: { bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500", label: "Đã phê duyệt", icon: CheckCircle },
  rejected: { bg: "bg-rose-50 dark:bg-rose-500/10", text: "text-rose-700 dark:text-rose-400", dot: "bg-rose-500", label: "Đã hủy/Từ chối", icon: X },
};

export function TrainingPlans() {
  useDocumentTitle("Kế hoạch & Điều hành Đào tạo");
  const { adminRole } = useOutletContext<{ adminRole: "department" | "center" | "teacher" | "student" }>();
  const isDepartment = adminRole === "department";

  const [plans, setPlans] = useState<MockPlan[]>(initialPlans);
  const [search, setSearch] = useState("");
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const { page, pageSize, setPage, setPageSize } = useUrlPagination();
  const [filters, setFilter] = useUrlFilters({ term: "all", status: "all", type: "all" });

  const [reviewPlanId, setReviewPlanId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [newPlanOpen, setNewPlanOpen] = useState(false);
  const [newPlanData, setNewPlanData] = useState({ title: "", type: "Ngôn ngữ", term: "Q1/2026", expectedStudents: 0 });

  useEscapeKey(() => { setReviewPlanId(null); setNewPlanOpen(false); }, !!reviewPlanId || newPlanOpen);

  // Stats Logic
  const stats = useMemo(() => {
    let total = plans.length;
    let pending = 0, approved = 0, totalTarget = 0;
    plans.forEach(p => {
      // For center, only count its own plans. Here we just mock all as yours except filtering
      if (p.status === "pending") pending++;
      if (p.status === "approved") approved++;
      if (p.status === "approved" || p.status === "pending") totalTarget += p.expectedStudents;
    });
    return { total, pending, approved, totalTarget };
  }, [plans]);

  const filtered = useMemo(() => plans.filter((p) => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()) || p.centerName.toLowerCase().includes(search.toLowerCase());
    const matchTerm = filters.term === "all" || p.term === filters.term;
    const matchStatus = filters.status === "all" || p.status === filters.status;
    const matchType = filters.type === "all" || p.type === filters.type;
    return matchSearch && matchTerm && matchStatus && matchType;
  }), [plans, search, filters]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // Actions
  const handleApprove = (id: string, decision: "approved" | "revision" | "rejected") => {
    setPlans(prev => prev.map(p => {
      if (p.id === id) {
        const historyUpdate = [{ action: decision === 'approved' ? 'Sở GD đã phê duyệt hệ thống' : decision === 'revision' ? 'Sở GD yêu cầu bổ sung' : 'Sở GD Từ chối cấp phép', time: new Date().toLocaleString('vi-VN'), actor: 'Sở GDĐT' }, ...p.history];
        return { ...p, status: decision, comments: reviewNote, history: historyUpdate };
      }
      return p;
    }));
    toast.success(decision === "approved" ? "Đã ký số phê duyệt Kế hoạch." : decision === "revision" ? "Đã gửi Yêu cầu chỉnh sửa lại Kế hoạch." : "Đã từ chối cấp phép.");
    setReviewPlanId(null);
    setReviewNote("");
  };

  const activePlan = useMemo(() => plans.find(p => p.id === reviewPlanId), [plans, reviewPlanId]);

  const handleCreatePlan = (submit: boolean) => {
    if (!newPlanData.title) return toast.error("Vui lòng nhập Tên Kế hoạch");
    const newPlan: MockPlan = {
      id: `KH-26-00${plans.length + 1}`,
      title: newPlanData.title,
      centerName: "Trung tâm Demo Vận Hành", 
      type: newPlanData.type as any,
      term: newPlanData.term,
      expectedStudents: newPlanData.expectedStudents,
      submittedAt: submit ? new Date().toLocaleDateString("vi-VN") : null,
      status: submit ? "pending" : "draft",
      files: ["To_trinh_Moi.pdf"],
      history: [{ action: submit ? "Trình duyệt lên Sở" : "Tạo bản nháp", time: new Date().toLocaleString('vi-VN'), actor: "Trung tâm" }],
      comments: ""
    };
    setPlans([newPlan, ...plans]);
    setNewPlanOpen(false);
    toast.success(submit ? "Đã đệ trình Văn bản Số lên Sở GD&ĐT!" : "Đã lưu Nháp thành công, có thể chỉnh sửa đệ trình sau.");
    setNewPlanData({ title: "", type: "Ngôn ngữ", term: "Q1/2026", expectedStudents: 0 });
  };

  // Columns definition
  const columns: VirtualTableColumn<MockPlan>[] = useMemo(() => [
    {
      key: "id_title",
      header: "Hồ sơ / Kế hoạch Đào tạo",
      width: "35%",
      sortable: (a: MockPlan, b: MockPlan) => a.title.localeCompare(b.title),
      render: (p) => (
        <div className="min-w-0 py-2">
          <HighlightText text={p.title} query={search} className="text-[15.5px] text-[#1a1a2e] dark:text-foreground font-bold truncate block" />
          <div className="flex items-center gap-2 mt-1">
            <span className="bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-[6px] text-[12px] font-mono font-medium">{p.id}</span>
            <span className="text-[13px] text-muted-foreground truncate">{p.centerName}</span>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Loại hình & Giai đoạn",
      width: "25%",
      render: (p) => (
        <div className="flex flex-col gap-1">
          <span className="inline-flex items-center gap-1.5 text-[14.5px] text-primary/80 font-semibold">
            {p.type}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[13.5px] text-muted-foreground">
            <CalendarDays className="w-3.5 h-3.5" /> {p.term}
          </span>
        </div>
      ),
    },
    {
      key: "students",
      header: "Chỉ tiêu HV",
      render: (p) => (
        <span className="text-[16px] text-[#1a1a2e] dark:text-foreground font-bold">
          {p.expectedStudents.toLocaleString('vi-VN')}
        </span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (p) => {
        const s = statusProps[p.status];
        return (
          <span className={`inline-flex items-center gap-1.5 text-[13px] px-3 py-1.5 rounded-lg ${s.bg} ${s.text} font-semibold`}>
            <s.icon className="w-4 h-4" />
            {s.label}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "",
      width: "48px",
      render: (p) => (
        <div className="relative">
          <button onClick={(e) => { e.stopPropagation(); setActionMenu(actionMenu === p.id ? null : p.id); }} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
            <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
          </button>
          {actionMenu === p.id && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setActionMenu(null)} />
              <div className="absolute right-0 mt-1 w-56 bg-white dark:bg-card rounded-xl shadow-2xl border border-gray-100 dark:border-border py-1.5 z-40 transform origin-top-right transition-all">
                <button
                  onClick={() => { setActionMenu(null); setReviewPlanId(p.id); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[15px] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-[#1a1a2e]/90 dark:text-foreground/90 font-semibold"
                >
                  <Eye className="w-4 h-4" /> Xem Hồ sơ Điện tử
                </button>
                {(!isDepartment && (p.status === "draft" || p.status === "revision")) && (
                    <button
                      onClick={() => { setActionMenu(null); toast.success("Đang mở Form Chỉnh sửa..."); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-[15px] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-primary font-semibold"
                    >
                      <Edit className="w-4 h-4" /> Điều chỉnh Cập nhật
                    </button>
                )}
                {(isDepartment && p.status === "pending") && (
                    <button
                      onClick={() => { setActionMenu(null); setReviewPlanId(p.id); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-[15px] hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors text-emerald-600 font-bold border-t border-gray-100 dark:border-white/5 mt-1"
                    >
                      <FileSignature className="w-4 h-4" /> Thẩm định & Phê duyệt
                    </button>
                )}
              </div>
            </>
          )}
        </div>
      ),
    },
  ], [actionMenu, search, isDepartment]);

  return (
    <div className="flex-1 pb-10">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-[28px] text-[#1a1a2e] dark:text-foreground tracking-tight mb-1" style={{ fontWeight: 800 }}>
            {isDepartment ? "Xét duyệt Kế hoạch Đào tạo" : "Quản lý Kế hoạch Mở khóa"}
          </h1>
          <p className="text-muted-foreground text-[16px] leading-relaxed">
            {isDepartment ? "Rà soát, thẩm định và cấp phép điện tử cho các Trung tâm trực thuộc Sở." : "Tuyển sinh Điện tử: Lên Kế hoạch chuyên môn trình cấp Sở phê chuẩn."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isDepartment ? (
            <button className="flex items-center gap-2.5 bg-white dark:bg-card border border-gray-200 dark:border-border px-5 py-3 rounded-2xl text-[15px] text-[#1a1a2e] dark:text-foreground hover:border-primary transition-colors font-semibold shadow-sm">
              <Download className="w-4 h-4" /> Báo cáo Vĩ mô
            </button>
          ) : (
            <button onClick={() => setNewPlanOpen(true)} className="flex items-center gap-2.5 bg-primary text-white px-5 py-3 rounded-2xl text-[15px] shadow-lg shadow-primary/25 hover:shadow-xl hover:translate-y-[-1px] transition-all font-bold">
              <Plus className="w-4 h-4" /> Soạn Kế hoạch Mới
            </button>
          )}
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Tổng Dự án đệ trình", value: stats.total, icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
          { label: "Sở đang Thẩm định", value: stats.pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-500/10" },
          { label: "Đã Cấp Phép", value: stats.approved, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
          { label: "Chỉ tiêu Tuyển sinh Quy hoạch", value: stats.totalTarget.toLocaleString('vi-VN'), icon: Target, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10" }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-card border border-gray-100 dark:border-border p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-[32px] text-[#1a1a2e] dark:text-foreground font-black leading-none mb-1.5">{stat.value}</p>
              <p className="text-[14.5px] text-muted-foreground font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-card rounded-3xl border border-gray-100 dark:border-border p-2.5 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Tìm Mã HS, Tên kế hoạch, Tên trung tâm..."
              className="w-full bg-[#f4f5f7] dark:bg-[#1a1a2e]/50 pl-12 pr-4 py-3.5 rounded-2xl text-[15.5px] text-foreground outline-none border border-transparent focus:border-primary/30 transition-all font-medium"
            />
          </div>
          <select value={filters.type} onChange={(e) => setFilter("type", e.target.value)} className="bg-[#f4f5f7] dark:bg-[#1a1a2e]/50 px-4 py-3.5 rounded-2xl text-[15px] font-semibold flex-shrink-0 min-w-[160px] outline-none">
            <option value="all">Tất cả Loại Hình</option>
            <option value="Ngôn ngữ">Khối Tiếng (Ngoại Ngữ)</option>
            <option value="Tin học">Khối Công nghệ & Tin Học</option>
            <option value="GDNN">Giáo dục Nghề Nghiệp</option>
            <option value="GDTX">Giáo dục Thường Xuyên</option>
          </select>
          <select value={filters.status} onChange={(e) => setFilter("status", e.target.value)} className="bg-[#f4f5f7] dark:bg-[#1a1a2e]/50 px-4 py-3.5 rounded-2xl text-[15px] font-semibold flex-shrink-0 min-w-[160px] outline-none">
            <option value="all">Mọi Trạng Thái</option>
            <option value="pending">Chờ Sở duyệt</option>
            <option value="approved">Cho phép Đào tạo</option>
            <option value="revision">Trang thái Sửa đổi</option>
          </select>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-3xl overflow-hidden shadow-sm">
        <VirtualTable data={paginatedData} columns={columns} getRowKey={(p) => p.id} showCheckbox={false} rowHeight={86} maxHeight={600} emptyMessage="Không tìm thấy Hồ sơ Kế hoạch nào" />
      </motion.div>

      <div className="mt-6">
        <Pagination page={page} total={filtered.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} itemLabel="Văn bản" />
      </div>

      {/* Review Drawer (Sở & Trung tâm đều xem được) */}
      <AnimatePresence>
        {activePlan && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setReviewPlanId(null)} className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
            <motion.div initial={{ x: "100%", opacity: 0.5 }} animate={{ x: 0, opacity: 1 }} exit={{ x: "100%", opacity: 0.5 }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="relative w-[560px] max-w-[95vw] h-full bg-white dark:bg-card shadow-2xl flex flex-col border-l border-gray-200 dark:border-border">
              
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-border bg-gray-50 dark:bg-white/5">
                <div>
                  <h2 className="text-[20px] text-[#1a1a2e] dark:text-foreground font-black">Hồ sơ Cấp phép Kế hoạch</h2>
                  <p className="text-[14px] text-muted-foreground font-medium mt-1">Mã tham chiếu: <span className="font-mono text-primary bg-primary/10 px-1 rounded">{activePlan.id}</span></p>
                </div>
                <button onClick={() => setReviewPlanId(null)} className="p-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Meta */}
                <div className="space-y-4">
                  <h3 className="text-[22px] text-[#1a1a2e] dark:text-foreground font-bold leading-snug">{activePlan.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                       const s = statusProps[activePlan.status];
                       return (
                         <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13.5px] font-bold ${s.bg} ${s.text}`}><s.icon className="w-4 h-4"/> {s.label}</span>
                       );
                    })()}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f4f5f7] dark:bg-white/5 text-[13.5px] font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10">Năm/Kỳ: {activePlan.term}</span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f4f5f7] dark:bg-white/5 text-[13.5px] font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10">Nhóm: {activePlan.type}</span>
                  </div>
                  <div className="p-4 bg-[#f8f9fb] dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 flex items-start gap-4 mt-2">
                    <Building2 className="w-10 h-10 text-muted-foreground/30 mt-1" />
                    <div>
                      <p className="text-[13px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Đơn vị Đề xuất (Trung Tâm)</p>
                      <p className="text-[17px] text-[#1a1a2e] dark:text-foreground font-bold">{activePlan.centerName}</p>
                      <p className="text-[15px] font-medium text-emerald-600 mt-1">Chỉ tiêu quy hoạch: {activePlan.expectedStudents} Học viên</p>
                    </div>
                  </div>
                </div>

                {/* Tệp đính kèm điện tử */}
                <div>
                  <h4 className="text-[16px] text-[#1a1a2e] dark:text-foreground font-bold flex items-center gap-2 mb-3"><File className="w-5 h-5 text-indigo-500"/> Văn bản / Đề cương đính kèm</h4>
                  {activePlan.files.length > 0 ? (
                    <div className="space-y-2">
                      {activePlan.files.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-primary/50 rounded-2xl transition-colors cursor-pointer group">
                           <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 rounded-xl flex items-center justify-center">
                               <FileText className="w-5 h-5" />
                             </div>
                             <div>
                               <p className="text-[14.5px] text-[#1a1a2e] dark:text-foreground font-bold group-hover:text-primary transition-colors">{file}</p>
                               <p className="text-[13px] text-muted-foreground font-medium">Bản trình điện tử (PDF)</p>
                             </div>
                           </div>
                           <Download className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-[14px] text-muted-foreground italic">Không có văn bản đính kèm.</p>}
                </div>

                {/* Timeline History */}
                <div>
                  <h4 className="text-[16px] text-[#1a1a2e] dark:text-foreground font-bold flex items-center gap-2 mb-4"><History className="w-5 h-5 text-amber-500"/> Lịch sử Hồ sơ (Audit Log)</h4>
                  <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 dark:before:via-white/10 before:to-transparent">
                    {activePlan.history.map((hist, idx) => (
                      <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-2">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-card bg-gray-200 dark:bg-white/20 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm text-[12px] font-bold">
                          {idx + 1}
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] shadow-sm flex flex-col gap-1">
                          <p className="text-[14px] font-bold text-[#1a1a2e] dark:text-foreground">{hist.action}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-[12.5px] font-medium text-primary">{hist.actor}</span>
                            <span className="text-[12px] text-muted-foreground">{hist.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Phê duyệt Role Sở */}
                {(isDepartment && activePlan.status === "pending") && (
                  <div className="p-5 bg-blue-50/50 dark:bg-blue-500/5 rounded-3xl border border-blue-100 dark:border-blue-500/10">
                    <h4 className="text-[16px] text-[#1a1a2e] dark:text-foreground font-bold flex items-center gap-2 mb-3"><FileSignature className="w-5 h-5 text-blue-600"/> Tác Nghiệp Yết Kiết Phê Duyệt</h4>
                    <p className="text-[14px] text-muted-foreground mb-4">Các quyết định Cấp phép ở đây mang tính Hệ thống và sẽ được lưu trữ vĩnh viễn.</p>
                    <textarea value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} placeholder="Nhập Ghi chú phê duyệt, hoặc nhập Lý do nếu Yêu cầu Trung tâm sửa đổi bản kế hoạch..." className="w-full h-24 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-blue-500 p-4 rounded-2xl text-[14.5px] font-medium outline-none resize-none mb-4 shadow-sm" />
                    <div className="flex gap-3">
                      <button onClick={() => handleApprove(activePlan.id, "rejected")} className="flex-1 py-3.5 bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 font-bold rounded-2xl hover:bg-rose-100 transition-colors">TỪ CHỐI DUYỆT</button>
                      <button onClick={() => { if(!reviewNote) { toast.error("Vui lòng nhập lý do vào Ghi chú!"); return; } handleApprove(activePlan.id, "revision"); }} className="flex-1 py-3.5 bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 font-bold rounded-2xl hover:bg-amber-100 transition-colors">YÊU CẦU SỬA CHI TIẾT</button>
                    </div>
                    <button onClick={() => handleApprove(activePlan.id, "approved")} className="w-full mt-3 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[15.5px] rounded-2xl shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2">
                       <Check className="w-5 h-5 border-2 border-white rounded-full bg-white/20 p-0.5" /> CHẤP THUẬN KẾ HOẠCH & ĐIỀU HÀNH
                    </button>
                  </div>
                )}
                
                {/* Lời Sở Yêu cầu sửa / Ghi chú */}
                {(activePlan.comments && activePlan.status !== "pending") && (
                   <div className="p-5 bg-amber-50 dark:bg-amber-500/10 rounded-2xl border border-amber-200 dark:border-amber-500/20">
                     <p className="text-[14px] font-bold text-amber-800 dark:text-amber-400 flex items-center gap-2 mb-2"><MessageSquare className="w-4 h-4"/> CHỈ ĐẠO CỦA SỞ / GHI CHÚ</p>
                     <p className="text-[15px] text-amber-900 dark:text-amber-200 font-medium whitespace-pre-wrap">{activePlan.comments}</p>
                   </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Draft New Plan Form Modal (Role: Trung tam) */}
      <AnimatePresence>
        {newPlanOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setNewPlanOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white dark:bg-card rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-border flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 dark:border-border bg-gray-50/50 dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><Building2 className="w-6 h-6"/></div>
                  <div>
                    <h3 className="text-[20px] text-[#1a1a2e] dark:text-foreground font-black">Khởi Tạo Kế Hoạch Tuyển Sinh / Đào Tạo</h3>
                    <p className="text-[14px] text-muted-foreground font-medium mt-0.5">Văn bản này mang tính pháp lý nội bộ, Sở GD sẽ xem xét đối chiếu.</p>
                  </div>
                </div>
                <button onClick={() => setNewPlanOpen(false)} className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                  <X className="w-6 h-6 text-muted-foreground" />
                </button>
              </div>
              <div className="p-8 space-y-6 overflow-y-auto">
                <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-100 dark:border-blue-500/20 text-blue-800 dark:text-blue-300 text-[14.5px] font-medium leading-relaxed">
                  📢 Kế hoạch sẽ được Lãnh đạo cấp Trung tâm soát xét trước khi đẩy lên Sở. Vui lòng nhập đầy đủ loại hình và đính kèm File quyết định (đề án hoặc kế hoạch năm).
                </div>
                <div>
                  <label className="block text-[15px] text-[#1a1a2e] dark:text-foreground mb-2" style={{ fontWeight: 700 }}>Tên Chủ Đề Kế Hoạch <span className="text-rose-500">*</span></label>
                  <input value={newPlanData.title} onChange={(e) => setNewPlanData({ ...newPlanData, title: e.target.value })} placeholder="VD: Đề án mở rông quy mô Dạy Nghề Sơ cấp Điện ôtô..." className="w-full bg-[#f4f5f7] dark:bg-black/20 border border-transparent focus:border-primary/50 px-5 py-3.5 rounded-2xl text-[16px] outline-none transition-all dark:text-foreground font-semibold placeholder:font-normal" />
                </div>
                <div className="grid grid-cols-2 gap-5">
                   <div>
                      <label className="block text-[15px] text-[#1a1a2e] dark:text-foreground mb-2" style={{ fontWeight: 700 }}>Loại hình Đào tạo</label>
                      <select value={newPlanData.type} onChange={(e) => setNewPlanData({ ...newPlanData, type: e.target.value as any })} className="w-full bg-[#f4f5f7] dark:bg-black/20 border border-transparent focus:border-primary/50 px-5 py-3.5 rounded-2xl text-[16px] outline-none transition-all dark:text-foreground font-bold">
                         <option value="Ngôn ngữ">Chuyên môn Môn Tiếng - Ngoại ngữ</option>
                         <option value="Tin học">Chuyên môn Tin học & Công Nghệ</option>
                         <option value="GDNN">Mảng Nghề - Sơ / Trung Cấp</option>
                         <option value="GDTX">Mảng Giáo Dục Thường Xuyên</option>
                         <option value="Tổng hợp">Cấu trúc Kế hoạch Tổng hợp</option>
                      </select>
                   </div>
                   <div>
                    <label className="block text-[15px] text-[#1a1a2e] dark:text-foreground mb-2" style={{ fontWeight: 700 }}>Giai đoạn/Kỳ hoạt động</label>
                    <select value={newPlanData.term} onChange={(e) => setNewPlanData({ ...newPlanData, term: e.target.value })} className="w-full bg-[#f4f5f7] dark:bg-black/20 border border-transparent focus:border-primary/50 px-5 py-3.5 rounded-2xl text-[16px] outline-none transition-all dark:text-foreground font-bold">
                      <option value="Q1/2026">Quý 1 / Năm 2026</option>
                      <option value="Q2/2026">Quý 2 / Năm 2026</option>
                      <option value="Năm 2026">Niên Khóa Năm 2026 Toàn Phần</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[15px] text-[#1a1a2e] dark:text-foreground mb-2" style={{ fontWeight: 700 }}>Số lượng Tuyển sinh Đầu vào/Chỉ tiêu Kế hoạch</label>
                  <input type="number" min="0" value={newPlanData.expectedStudents} onChange={(e) => setNewPlanData({ ...newPlanData, expectedStudents: Number(e.target.value) })} className="w-full bg-[#f4f5f7] dark:bg-black/20 border border-transparent focus:border-primary/50 px-5 py-3.5 rounded-2xl text-[16px] outline-none transition-all dark:text-foreground font-bold" />
                </div>
                <div>
                  <label className="block text-[15px] text-[#1a1a2e] dark:text-foreground mb-2" style={{ fontWeight: 700 }}>Biểu mẫu / Văn bản Đính kèm <span className="text-rose-500">*</span></label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer bg-gray-50/50 dark:bg-white/[0.02]">
                     <div className="w-14 h-14 bg-white dark:bg-card border border-gray-200 dark:border-white/10 rounded-full flex items-center justify-center mb-4 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
                       <UploadCloud className="w-7 h-7 text-primary" />
                     </div>
                     <p className="text-[16px] font-bold text-[#1a1a2e] dark:text-foreground mb-1">Kéo thả File hoặc Bấm vào đây</p>
                     <p className="text-[14.5px] text-muted-foreground font-medium">Bạn có thể chọn tối đa 5 file (File: PDF, DOCX, XLSX)</p>
                  </div>
                </div>
              </div>
              <div className="px-8 py-5 bg-gray-50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-border flex justify-between items-center gap-3">
                <button onClick={() => handleCreatePlan(false)} className="px-6 py-3.5 flex items-center justify-center rounded-2xl text-[15px] bg-white dark:bg-card text-muted-foreground hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 transition-colors font-bold shadow-sm">Lưu Trữ Nháp Nội Bộ</button>
                <div className="flex gap-3">
                   <button onClick={() => setNewPlanOpen(false)} className="px-6 py-3.5 rounded-2xl text-[15px] text-muted-foreground hover:bg-gray-200 dark:hover:bg-white/10 transition-colors font-bold">Xóa biểu mẫu</button>
                   <button onClick={() => handleCreatePlan(true)} className="px-8 py-3.5 rounded-2xl text-[15px] bg-gradient-to-r from-primary to-indigo-600 text-white flex items-center gap-2 hover:shadow-lg hover:shadow-primary/30 transition-all border-none font-black text-lg">
                     <Send className="w-4 h-4" /> KÝ DUYỆT & TRÌNH SỞ
                   </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useUrlPagination } from "../../utils/useUrlPagination";
import { ConfirmModal } from "./ConfirmModal";
import { useState, useMemo } from "react";
import { useDocumentTitle } from "../../utils/hooks";
import { useUrlFilters } from "../../utils/useUrlFilters";
import { useOutletContext } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, MoreHorizontal, Plus, Download,
  Mail, Edit, Trash2, Eye, Building2, Building, Library, GraduationCap, X, CheckCircle, Ban, Save, Image as ImageIcon
} from "lucide-react";
import { VirtualTable, type VirtualTableColumn } from "./VirtualTable";
import { toast } from "sonner";
import { HighlightText } from "../ui/HighlightText";
import { Pagination } from "./Pagination";

interface MockCenter {
  id: string;
  name: string;
  type: "gdnn_gdtx" | "ngoai_ngu" | "tin_hoc";
  director: string;
  email: string;
  phone: string;
  status: "active" | "inactive" | "suspended";
}

const generateCenters = (): MockCenter[] => {
  return [
    { id: "c1", name: "TT GDNN - GDTX Quận 1", type: "gdnn_gdtx", director: "Nguyễn Văn A", email: "ttgdnnq1@hcm.edu.vn", phone: "0901234567", status: "active" },
    { id: "c2", name: "Trung tâm Ngoại ngữ Apollo", type: "ngoai_ngu", director: "Trần Thị B", email: "contact@apollo.edu.vn", phone: "0902345678", status: "active" },
    { id: "c3", name: "Trung tâm Tin học Nhật Nghề", type: "tin_hoc", director: "Lê Văn C", email: "info@nhatnghe.edu.vn", phone: "0903456789", status: "active" },
    { id: "c4", name: "TT GDNN - GDTX Quận 3", type: "gdnn_gdtx", director: "Phạm Thị D", email: "ttgdnnq3@hcm.edu.vn", phone: "0904567890", status: "inactive" },
    { id: "c5", name: "Trung tâm Tiếng Anh VUS", type: "ngoai_ngu", director: "Hoàng Văn E", email: "hello@vus.edu.vn", phone: "0905678901", status: "active" },
    { id: "c6", name: "Trung tâm Tin học KHTN", type: "tin_hoc", director: "Vũ Thị F", email: "khtn@hcmus.edu.vn", phone: "0906789012", status: "active" },
    { id: "c7", name: "TT GDNN - GDTX Tân Bình", type: "gdnn_gdtx", director: "Ngô Văn G", email: "ttgdnntbinh@hcm.edu.vn", phone: "0907890123", status: "active" },
    { id: "c8", name: "Ngoại ngữ Không Gian", type: "ngoai_ngu", director: "Đỗ Thị H", email: "khonggian@edu.vn", phone: "0908901234", status: "suspended" },
    { id: "c9", name: "Tin học Sao Việt", type: "tin_hoc", director: "Bùi Văn I", email: "saoviet@edu.vn", phone: "0909012345", status: "active" },
    { id: "c10", name: "TT GDNN - GDTX Phú Nhuận", type: "gdnn_gdtx", director: "Lý Thị K", email: "ttgdnnphunhuan@hcm.edu.vn", phone: "0900123456", status: "active" },
  ];
};

const initialCenters = generateCenters();

const typeColors: Record<string, { bg: string; text: string; icon: any }> = {
  gdnn_gdtx: { bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", icon: Building2 },
  ngoai_ngu: { bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", icon: GraduationCap },
  tin_hoc: { bg: "bg-purple-50 dark:bg-purple-500/10", text: "text-purple-600 dark:text-purple-400", icon: Library },
};

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  inactive: { bg: "bg-gray-100 dark:bg-white/5", text: "text-gray-600 dark:text-gray-400", dot: "bg-gray-400" },
  suspended: { bg: "bg-red-50 dark:bg-red-500/10", text: "text-red-600 dark:text-red-400", dot: "bg-red-500" },
};

export function CentersList() {
  const { adminRole } = useOutletContext<{ adminRole: "department" | "center" }>();
  const isDepartment = adminRole === "department";
  useDocumentTitle(isDepartment ? "Quản lý Đơn vị" : "Hồ sơ Đơn vị");

  const [centers, setCenters] = useState<MockCenter[]>(initialCenters);
  const [search, setSearch] = useState("");
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const { page, pageSize, setPage, setPageSize } = useUrlPagination();
  const [filters, setFilter] = useUrlFilters({ type: "all", status: "all" });

  const [newCenterOpen, setNewCenterOpen] = useState(false);
  const [newCenterData, setNewCenterData] = useState({ name: "", type: "gdnn_gdtx", director: "", email: "", phone: "" });

  const handleCreateCenter = () => {
    if (!newCenterData.name || !newCenterData.email) {
      toast.error("Vui lòng nhập Tên và Email trung tâm");
      return;
    }
    const newCenter: MockCenter = {
      id: `c${Date.now()}`,
      name: newCenterData.name,
      type: newCenterData.type as "gdnn_gdtx" | "ngoai_ngu" | "tin_hoc",
      director: newCenterData.director || "Chưa cập nhật",
      email: newCenterData.email,
      phone: newCenterData.phone || "Chưa cập nhật",
      status: "active"
    };
    setCenters([newCenter, ...centers]);
    setNewCenterOpen(false);
    toast.success("Đã tạo mới trung tâm thành công");
    setNewCenterData({ name: "", type: "gdnn_gdtx", director: "", email: "", phone: "" });
  };

  const filtered = useMemo(() => centers.filter((c) => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    const matchType = filters.type === "all" || c.type === filters.type;
    const matchStatus = filters.status === "all" || c.status === filters.status;
    return matchSearch && matchType && matchStatus;
  }), [centers, search, filters.type, filters.status]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const columns: VirtualTableColumn<MockCenter>[] = useMemo(() => [
    {
      key: "name",
      header: "Tên Trung tâm",
      sortable: (a: MockCenter, b: MockCenter) => a.name.localeCompare(b.name),
      render: (center) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Building className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <HighlightText text={center.name} query={search} className="text-[15.5px] text-[#1a1a2e] dark:text-foreground font-semibold truncate block" />
            <HighlightText text={center.email} query={search} className="text-[11.5px] text-muted-foreground truncate block" />
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Loại hình",
      render: (center) => {
        const TypeIcon = typeColors[center.type].icon;
        return (
          <span className={`inline-flex items-center gap-1.5 text-[15px] px-2.5 py-1 rounded-full ${typeColors[center.type].bg} ${typeColors[center.type].text}`} style={{ fontWeight: 600 }}>
            <TypeIcon className="w-3.5 h-3.5" />
            {center.type === "gdnn_gdtx" ? "GDNN - GDTX" : center.type === "ngoai_ngu" ? "Ngoại ngữ" : "Tin học"}
          </span>
        );
      },
    },
    {
      key: "director",
      header: "Người đại diện",
      render: (center) => (
        <span className="text-[16px] text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 500 }}>
          {center.director}
          <span className="block text-[15px] text-muted-foreground font-normal mt-0.5">{center.phone}</span>
        </span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (center) => (
        <span className={`inline-flex items-center gap-1.5 text-[15px] px-2.5 py-1 rounded-full ${statusColors[center.status].bg} ${statusColors[center.status].text}`} style={{ fontWeight: 600 }}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusColors[center.status].dot}`} />
          {center.status === "active" ? "Hoạt động" : center.status === "inactive" ? "Không HĐ" : "Đình chỉ"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "40px",
      render: (center) => (
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setActionMenu(actionMenu === center.id ? null : center.id); }}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
          </button>
          {actionMenu === center.id && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setActionMenu(null)} />
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-card rounded-xl shadow-xl border border-gray-100 dark:border-border py-1.5 z-40">
                {[
                  { icon: Eye, label: "Xem chi tiết", color: "" },
                  ...(isDepartment ? [{ icon: Edit, label: "Chỉnh sửa", color: "" }] : []),
                  ...(isDepartment && center.status === "active" 
                      ? [{ icon: Ban, label: "Đình chỉ GPHĐ", color: "text-amber-600" }] 
                      : []
                  ),
                  ...(isDepartment && center.status !== "active"
                      ? [{ icon: CheckCircle, label: "Cấp phép HĐ lại", color: "text-emerald-600" }]
                      : []
                  ),
                  ...(isDepartment ? [{ icon: Trash2, label: "Xóa", color: "text-red-600" }] : []),
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={() => {
                      setActionMenu(null);
                      if (action.label === "Xóa") {
                         setCenters(prev => prev.filter(c => c.id !== center.id));
                         toast.success("Đã xóa trung tâm");
                      } else if (action.label === "Đình chỉ GPHĐ") {
                         setCenters(prev => prev.map(c => c.id === center.id ? { ...c, status: "suspended" } : c));
                         toast.warning("Đã đình chỉ giấy phép hoạt động");
                      } else if (action.label === "Cấp phép HĐ lại") {
                         setCenters(prev => prev.map(c => c.id === center.id ? { ...c, status: "active" } : c));
                         toast.success("Đã cấp giấy phép hoạt động trở lại");
                      }
                    }}
                    className={`w-full flex items-center gap-2.5 px-4 py-2 text-[15px] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${action.color || "text-[#1a1a2e]/80 dark:text-foreground/80"}`}
                    style={{ fontWeight: 500 }}
                  >
                    <action.icon className="w-3.5 h-3.5" />
                    {action.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      ),
    },
  ], [actionMenu, search, isDepartment]);

  if (!isDepartment) {
    return (
      <div className="max-w-4xl mx-auto pb-10">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
           <div>
             <h1 className="text-[24px] text-[#1a1a2e] dark:text-foreground tracking-tight" style={{ fontWeight: 800 }}>Cập nhật Hồ sơ Đơn vị</h1>
             <p className="text-[15px] text-muted-foreground mt-1">Thông tin công khai và liên hệ của cơ sở đào tạo</p>
           </div>
           <button onClick={() => toast.success("Đã ghi nhận bản sửa đổi và gửi lên Sở chờ duyệt")} className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/90 text-white px-5 py-2.5 rounded-xl shadow-[0_4px_14px_0_rgba(26,26,46,0.2)] font-semibold transition-all hover:shadow-lg">
             <Save className="w-4.5 h-4.5" />
             Lưu Thông Tin
           </button>
         </div>

         <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 md:p-8 space-y-8">
              {/* Profile Image & Status */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                 <div className="w-24 h-24 rounded-2xl bg-gray-50 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-100 transition-colors">
                    <ImageIcon className="w-8 h-8 text-gray-400 mb-1" />
                    <span className="text-[11px] font-semibold text-gray-500">Tải Logo</span>
                 </div>
                 <div className="flex-1 space-y-1.5 text-center md:text-left">
                    <h2 className="text-[20px] font-bold text-foreground">Trung tâm Ngoại ngữ AMES</h2>
                    <p className="text-[14px] font-medium text-muted-foreground">Mã đơn vị: TT-092 • Ngày cấp phép: 15/07/2021</p>
                    <div className="mt-2 flex flex-wrap gap-2 justify-center md:justify-start">
                       <span className="inline-flex items-center gap-1.5 text-[12px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5" /> Đang Hoạt động
                       </span>
                       <span className="inline-flex items-center gap-1.5 text-[12px] px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                          Loại hình: Ngoại ngữ
                       </span>
                    </div>
                 </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                 <div className="space-y-4 md:col-span-2">
                    <h3 className="text-[15px] font-bold text-muted-foreground uppercase tracking-wider border-b border-gray-100 pb-2">Thông tin Cơ bản</h3>
                 </div>
                 <div>
                   <label className="block text-[14px] font-bold text-foreground mb-2">Tên Trung tâm <span className="text-red-500">*</span></label>
                   <input defaultValue="Trung tâm Ngoại ngữ AMES" className="w-full bg-[#f4f5f7] dark:bg-muted border border-transparent focus:border-primary/50 px-4 py-2.5 rounded-xl text-[14.5px] outline-none transition-all font-medium" />
                 </div>
                 <div>
                   <label className="block text-[14px] font-bold text-foreground mb-2">Người đại diện (Giám đốc) <span className="text-red-500">*</span></label>
                   <input defaultValue="Trần Thị B" className="w-full bg-[#f4f5f7] dark:bg-muted border border-transparent focus:border-primary/50 px-4 py-2.5 rounded-xl text-[14.5px] outline-none transition-all font-medium" />
                 </div>
                 <div>
                   <label className="block text-[14px] font-bold text-foreground mb-2">Điện thoại liên hệ <span className="text-red-500">*</span></label>
                   <input defaultValue="0902345678" className="w-full bg-[#f4f5f7] dark:bg-muted border border-transparent focus:border-primary/50 px-4 py-2.5 rounded-xl text-[14.5px] outline-none transition-all font-medium" />
                 </div>
                 <div>
                   <label className="block text-[14px] font-bold text-foreground mb-2">Email chính <span className="text-red-500">*</span></label>
                   <input defaultValue="contact@ames.edu.vn" className="w-full bg-[#f4f5f7] dark:bg-muted border border-transparent focus:border-primary/50 px-4 py-2.5 rounded-xl text-[14.5px] outline-none transition-all font-medium" />
                 </div>
                 <div className="md:col-span-2">
                   <label className="block text-[14px] font-bold text-foreground mb-2">Địa chỉ trụ sở chính <span className="text-red-500">*</span></label>
                   <input defaultValue="Tòa nhà Đổi mới, Quận 1, TP Hồ Chí Minh" className="w-full bg-[#f4f5f7] dark:bg-muted border border-transparent focus:border-primary/50 px-4 py-2.5 rounded-xl text-[14.5px] outline-none transition-all font-medium" />
                 </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-4">
                 <div className="space-y-4 md:col-span-2">
                    <h3 className="text-[15px] font-bold text-muted-foreground uppercase tracking-wider border-b border-gray-100 pb-2">Hồ sơ Cấp phép</h3>
                 </div>
                 <div className="md:col-span-2 p-4 rounded-xl bg-orange-50 border border-orange-200">
                    <div className="flex gap-3">
                       <Ban className="w-5 h-5 text-orange-500 shrink-0" />
                       <div>
                          <p className="text-[14.5px] font-bold text-orange-800">Cập nhật Giấy phép Hoạt động</p>
                          <p className="text-[14px] font-medium text-orange-700/80 mt-1">Mỗi khi thay đổi thông tin Cấp phép, Hồ sơ sẽ cần chờ Sở GDĐT phê duyệt lại trước khi có hiệu lực chính thức trên biểu đồ Toàn tỉnh.</p>
                       </div>
                    </div>
                 </div>
                 <div>
                   <label className="block text-[14px] font-bold text-foreground mb-2">Mã Quyết định Cấp phép</label>
                   <input defaultValue="1245/QĐ-SGDĐT" disabled className="w-full bg-gray-100 text-gray-500 px-4 py-2.5 rounded-xl text-[14.5px] cursor-not-allowed font-medium" />
                 </div>
                 <div>
                   <label className="block text-[14px] font-bold text-foreground mb-2">Quy mô Đào tạo (Học viên)</label>
                   <input defaultValue="5000" type="number" className="w-full bg-[#f4f5f7] dark:bg-muted border border-transparent focus:border-primary/50 px-4 py-2.5 rounded-xl text-[14.5px] outline-none transition-all font-medium" />
                 </div>
              </div>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[24px] text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 800 }}>Quản Lý Trung Tâm</h1>
          <p className="text-muted-foreground text-[15px] mt-0.5">Danh sách các Trung tâm trực thuộc Sở</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => toast.success("Đang xuất biểu mẫu Excel")} className="flex items-center gap-2 bg-white dark:bg-card border border-gray-200 dark:border-border px-4 py-2.5 rounded-xl text-[15px] font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <Download className="w-4 h-4" />
            Xuất Danh Sách
          </button>
          {isDepartment && (
            <button onClick={() => setNewCenterOpen(true)} className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/90 text-white px-4 py-2.5 rounded-xl text-[15px] shadow-sm hover:shadow-md transition-all" style={{ fontWeight: 600 }}>
              <Plus className="w-4 h-4" />
              Thêm Mới Đơn vị
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Tìm kiếm theo tên TT hoặc email..."
              className="w-full bg-[#f4f5f7] dark:bg-white/5 pl-10 pr-4 py-2.5 rounded-xl text-[15px] text-foreground outline-none border border-transparent focus:border-primary/30 focus:bg-white dark:focus:bg-white/10 transition-all"
            />
          </div>
          <select
            value={filters.type}
            onChange={(e) => { setFilter("type", e.target.value); }}
            className="bg-[#f4f5f7] dark:bg-white/5 px-4 py-2.5 rounded-xl text-[15px] text-foreground outline-none border border-transparent focus:border-primary/30 appearance-none min-w-[150px]"
            style={{ fontWeight: 500 }}
          >
            <option value="all">Tất cả Loại hình</option>
            <option value="gdnn_gdtx">GDNN - GDTX</option>
            <option value="ngoai_ngu">Ngoại ngữ</option>
            <option value="tin_hoc">Tin học</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => { setFilter("status", e.target.value); }}
            className="bg-[#f4f5f7] dark:bg-white/5 px-4 py-2.5 rounded-xl text-[15px] text-foreground outline-none border border-transparent focus:border-primary/30 appearance-none min-w-[140px]"
            style={{ fontWeight: 500 }}
          >
            <option value="all">Tất cả Trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Không HĐ</option>
            <option value="suspended">Đình chỉ</option>
          </select>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <VirtualTable
          data={paginatedData}
          columns={columns}
          getRowKey={(c) => c.id}
          showCheckbox={false}
          rowHeight={64}
          maxHeight={540}
          emptyMessage="Không có Trung tâm nào thỏa mãn điều kiện"
        />
      </motion.div>

      <Pagination
        page={page}
        total={filtered.length}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        itemLabel="Trung tâm"
      />

      {/* Add New Center Modal */}
      <AnimatePresence>
        {newCenterOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setNewCenterOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white dark:bg-card rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-border">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-border">
                <h3 className="text-[18px] text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 700 }}>Thêm mới Đơn vị / Trung tâm</h3>
                <button onClick={() => setNewCenterOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-[14px] text-[#1a1a2e] dark:text-foreground mb-1.5" style={{ fontWeight: 600 }}>Tên Đơn vị/Trung tâm <span className="text-red-500">*</span></label>
                  <input value={newCenterData.name} onChange={(e) => setNewCenterData({ ...newCenterData, name: e.target.value })} placeholder="VD: Trung tâm Ngoại ngữ VUS..." className="w-full bg-[#f4f5f7] dark:bg-white/5 border border-transparent focus:border-primary/30 px-3.5 py-2.5 rounded-xl text-[14.5px] outline-none transition-all dark:text-foreground" />
                </div>
                <div>
                  <label className="block text-[14px] text-[#1a1a2e] dark:text-foreground mb-1.5" style={{ fontWeight: 600 }}>Loại hình đào tạo</label>
                  <select value={newCenterData.type} onChange={(e) => setNewCenterData({ ...newCenterData, type: e.target.value })} className="w-full bg-[#f4f5f7] dark:bg-white/5 border border-transparent focus:border-primary/30 px-3.5 py-2.5 rounded-xl text-[14.5px] outline-none transition-all dark:text-foreground">
                    <option value="gdnn_gdtx">GDNN - GDTX</option>
                    <option value="ngoai_ngu">Ngoại ngữ</option>
                    <option value="tin_hoc">Tin học</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[14px] text-[#1a1a2e] dark:text-foreground mb-1.5" style={{ fontWeight: 600 }}>Người đại diện / Giám đốc</label>
                    <input value={newCenterData.director} onChange={(e) => setNewCenterData({ ...newCenterData, director: e.target.value })} placeholder="Họ và tên..." className="w-full bg-[#f4f5f7] dark:bg-white/5 border border-transparent focus:border-primary/30 px-3.5 py-2.5 rounded-xl text-[14.5px] outline-none transition-all dark:text-foreground" />
                  </div>
                  <div>
                    <label className="block text-[14px] text-[#1a1a2e] dark:text-foreground mb-1.5" style={{ fontWeight: 600 }}>Điện thoại</label>
                    <input value={newCenterData.phone} onChange={(e) => setNewCenterData({ ...newCenterData, phone: e.target.value })} placeholder="090..." className="w-full bg-[#f4f5f7] dark:bg-white/5 border border-transparent focus:border-primary/30 px-3.5 py-2.5 rounded-xl text-[14.5px] outline-none transition-all dark:text-foreground" />
                  </div>
                </div>
                <div>
                  <label className="block text-[14px] text-[#1a1a2e] dark:text-foreground mb-1.5" style={{ fontWeight: 600 }}>Email liên hệ <span className="text-red-500">*</span></label>
                  <input type="email" value={newCenterData.email} onChange={(e) => setNewCenterData({ ...newCenterData, email: e.target.value })} placeholder="contact@domain.com" className="w-full bg-[#f4f5f7] dark:bg-white/5 border border-transparent focus:border-primary/30 px-3.5 py-2.5 rounded-xl text-[14.5px] outline-none transition-all dark:text-foreground" />
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-border flex justify-end gap-2">
                <button onClick={() => setNewCenterOpen(false)} className="px-4 py-2.5 rounded-xl text-[14.5px] text-muted-foreground hover:bg-gray-200 dark:hover:bg-white/5 transition-colors" style={{ fontWeight: 600 }}>Hủy bỏ</button>
                <button onClick={handleCreateCenter} className="px-5 py-2.5 rounded-xl text-[14.5px] bg-gradient-to-r from-primary to-primary/90 text-white hover:shadow-md transition-all" style={{ fontWeight: 600 }}>Lưu Trung tâm</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

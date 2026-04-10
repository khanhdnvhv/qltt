import { useUrlPagination } from "../../utils/useUrlPagination";
import { ConfirmModal } from "./ConfirmModal";
import { useState, useMemo, useCallback } from "react";
import { useDocumentTitle } from "../../utils/hooks";
import { useUrlFilters } from "../../utils/useUrlFilters";
import { useEditHistory } from "../../utils/useEditHistory";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, MoreHorizontal, UserPlus, Download,
  Mail, Edit, Trash2, Eye, Ban, X, CheckCircle, Undo2, Redo2,
} from "lucide-react";
import { VirtualTable, type VirtualTableColumn } from "./VirtualTable";
import { toast } from "sonner";
import { HighlightText } from "../ui/HighlightText";
import { exportCsv } from "../../utils/csv-export";
import { Pagination } from "./Pagination";

interface MockUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "student" | "teacher" | "admin";
  status: "active" | "inactive" | "banned";
  joinedAt: string;
  bandScore: number | null;
  coursesEnrolled: number;
  lastActive: string;
}

// Generate 50 realistic mock users for virtual scrolling demo
const firstNames = ["Nguyen", "Le", "Tran", "Pham", "Hoang", "Vo", "Dang", "Bui", "Ly", "Ngo", "Do", "Vu", "Trinh", "Dinh", "Luu"];
const midNames = ["Van", "Thi", "Minh", "Quoc", "Hoang", "Duc", "Thanh", "Hong", "Anh", "Ngoc"];
const lastNames = ["An", "Binh", "Cuong", "Dung", "Em", "Giang", "Hao", "Khanh", "Linh", "Mai", "Nam", "Oanh", "Phuc", "Quang", "Son", "Thao", "Uyen", "Vy", "Xuan", "Yen"];

function generateUsers(count: number): MockUser[] {
  const roles: MockUser["role"][] = ["student", "student", "student", "student", "teacher", "student", "student", "admin"];
  const statuses: MockUser["status"][] = ["active", "active", "active", "active", "active", "inactive", "banned"];
  const actives = ["30 phút trước", "1 giờ trước", "2 giờ trước", "5 giờ trước", "1 ngày trước", "3 ngày trước", "1 tuần trước", "2 tuần trước", "1 tháng trước"];

  return Array.from({ length: count }, (_, i) => {
    const fn = firstNames[i % firstNames.length];
    const mn = midNames[(i * 3) % midNames.length];
    const ln = lastNames[i % lastNames.length];
    const name = `${fn} ${mn} ${ln}`;
    const role = roles[i % roles.length];
    const status = statuses[i % statuses.length];
    const band = role === "teacher" ? 7.5 + Math.round((i % 3) * 0.5 * 10) / 10 : (i % 7 === 0 ? null : 3.0 + Math.round((i % 10) * 0.5 * 10) / 10);

    return {
      id: `u${i + 1}`,
      name,
      email: `${fn.toLowerCase()}${ln.toLowerCase()}${i}@gmail.com`,
      phone: `09${String(10000000 + i * 11111).slice(0, 8)}`,
      role,
      status,
      joinedAt: `${String((i % 28) + 1).padStart(2, "0")}/${String((i % 12) + 1).padStart(2, "0")}/2025`,
      bandScore: band,
      coursesEnrolled: role === "teacher" ? 0 : (i % 5),
      lastActive: actives[i % actives.length],
    };
  });
}

const initialUsers = generateUsers(50);

const filterDefaults = { role: "all", status: "all" };

const roleColors: Record<string, { bg: string; text: string }> = {
  student: { bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
  teacher: { bg: "bg-purple-50 dark:bg-purple-500/10", text: "text-purple-600 dark:text-purple-400" },
  admin: { bg: "bg-red-50 dark:bg-red-500/10", text: "text-red-600 dark:text-red-400" },
};

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  inactive: { bg: "bg-gray-100 dark:bg-white/5", text: "text-gray-600 dark:text-gray-400", dot: "bg-gray-400" },
  banned: { bg: "bg-red-50 dark:bg-red-500/10", text: "text-red-600 dark:text-red-400", dot: "bg-red-500" },
};

export function AdminUsers() {
  useDocumentTitle("Quản lý người dùng");
  const [users, setUsers] = useState<MockUser[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const { page, pageSize, setPage, setPageSize } = useUrlPagination();
  const [filters, setFilter] = useUrlFilters(filterDefaults);

  // ConfirmModal state for destructive actions
  const [confirmDelete, setConfirmDelete] = useState(false);
  // Bulk edit Band modal
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [bulkBandValue, setBulkBandValue] = useState("");

  // Silent edit apply for undo/redo (no toast)
  const applyEditSilent = useCallback((rowKey: string, colKey: string, value: string) => {
    setUsers((prev) => prev.map((u) => {
      if (u.id !== rowKey) return u;
      if (colKey === "band") {
        const num = parseFloat(value);
        if (isNaN(num)) return u;
        return { ...u, bandScore: Math.round(num * 2) / 2 };
      }
      if (colKey === "courses") {
        const num = parseInt(value, 10);
        if (isNaN(num)) return u;
        return { ...u, coursesEnrolled: num };
      }
      return u;
    }));
  }, []);

  const { pushEdit, undo, redo, canUndo, canRedo, historyLength, redoLength } = useEditHistory(50, applyEditSilent);

  const filtered = useMemo(() => users.filter((u) => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filters.role === "all" || u.role === filters.role;
    const matchStatus = filters.status === "all" || u.status === filters.status;
    return matchSearch && matchRole && matchStatus;
  }), [users, search, filters.role, filters.status]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const toggleSelect = (id: string) => {
    setSelectedUsers((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedUsers.length === paginatedData.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedData.map((u) => u.id));
    }
  };

  // Inline edit handler - updates user data + shows toast + tracks history
  const handleCellEdit = useCallback((rowKey: string, colKey: string, value: string) => {
    // Get old value for undo tracking
    const user = users.find((u) => u.id === rowKey);
    if (!user) return;

    setUsers((prev) => prev.map((u) => {
      if (u.id !== rowKey) return u;
      if (colKey === "band") {
        const num = parseFloat(value);
        if (isNaN(num) || num < 0 || num > 9) {
          toast.error("Điểm Band Score phải từ 0 đến 9");
          return u;
        }
        const rounded = Math.round(num * 2) / 2;
        const oldVal = u.bandScore?.toString() ?? "";
        pushEdit(rowKey, colKey, oldVal, String(rounded));
        toast.success(`Đã cập nhật Band Score của ${u.name} thành ${rounded}`);
        return { ...u, bandScore: rounded };
      }
      if (colKey === "courses") {
        const num = parseInt(value, 10);
        if (isNaN(num) || num < 0) {
          toast.error("Số khóa học không hợp lệ");
          return u;
        }
        const oldVal = String(u.coursesEnrolled);
        pushEdit(rowKey, colKey, oldVal, String(num));
        toast.success(`Đã cập nhật số khóa học của ${u.name} thành ${num}`);
        return { ...u, coursesEnrolled: num };
      }
      return u;
    }));
  }, [users, pushEdit]);

  const csvColumns = useMemo(() => [
    { key: "name", header: "Họ tên" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Số điện thoại" },
    { key: "role", header: "Vai trò", format: (u: MockUser) => u.role === "student" ? "Học viên" : u.role === "teacher" ? "Giảng viên" : "Admin" },
    { key: "status", header: "Trạng thái", format: (u: MockUser) => u.status === "active" ? "Hoạt động" : u.status === "inactive" ? "Không hoạt động" : "Đã chặn" },
    { key: "bandScore", header: "Band Score", format: (u: MockUser) => u.bandScore?.toString() ?? "" },
    { key: "coursesEnrolled", header: "Số khóa học" },
    { key: "joinedAt", header: "Ngày tham gia" },
  ], []);

  const handleExportAll = () => {
    exportCsv(filtered, csvColumns, `nguoi-dung-${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success(`Đã xuất ${filtered.length} người dùng ra CSV`);
  };

  const handleExportSelected = () => {
    const selectedData = filtered.filter((u) => selectedUsers.includes(u.id));
    exportCsv(selectedData, csvColumns, `nguoi-dung-selected-${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success(`Đã xuất ${selectedData.length} người dùng ra CSV`);
  };

  const columns: VirtualTableColumn<MockUser>[] = useMemo(() => [
    {
      key: "user",
      header: "Người dùng",
      sortable: (a: MockUser, b: MockUser) => a.name.localeCompare(b.name),
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center text-[16px] text-blue-600 dark:text-blue-400 shrink-0" style={{ fontWeight: 700 }}>
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <HighlightText text={user.name} query={search} className="text-[15px] text-[#1a1a2e] dark:text-foreground truncate block" />
            <HighlightText text={user.email} query={search} className="text-[15px] text-muted-foreground truncate block" />
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Vai trò",
      hiddenBelow: "md",
      render: (user) => (
        <span className={`text-[10.5px] px-2.5 py-1 rounded-full ${roleColors[user.role].bg} ${roleColors[user.role].text}`} style={{ fontWeight: 600 }}>
          {user.role === "student" ? "Học viên" : user.role === "teacher" ? "Giảng viên" : "Admin"}
        </span>
      ),
    },
    {
      key: "band",
      header: "Band",
      hiddenBelow: "lg",
      sortable: (a: MockUser, b: MockUser) => (a.bandScore ?? 0) - (b.bandScore ?? 0),
      editable: true,
      editValue: (user: MockUser) => user.bandScore?.toString() ?? "",
      render: (user) => (
        <span className="text-[15px] text-[#1a1a2e] dark:text-foreground group/band" style={{ fontWeight: 600 }}>
          {user.bandScore ?? "—"}
          <Edit className="w-2.5 h-2.5 text-muted-foreground/30 inline ml-1 opacity-0 group-hover/band:opacity-100 transition-opacity" />
        </span>
      ),
    },
    {
      key: "courses",
      header: "Khóa học",
      hiddenBelow: "lg",
      sortable: (a: MockUser, b: MockUser) => a.coursesEnrolled - b.coursesEnrolled,
      editable: true,
      editValue: (user: MockUser) => String(user.coursesEnrolled),
      render: (user) => (
        <span className="text-[15px] text-[#1a1a2e] dark:text-foreground group/courses" style={{ fontWeight: 500 }}>
          {user.coursesEnrolled}
          <Edit className="w-2.5 h-2.5 text-muted-foreground/30 inline ml-1 opacity-0 group-hover/courses:opacity-100 transition-opacity" />
        </span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      hiddenBelow: "sm",
      render: (user) => (
        <span className={`inline-flex items-center gap-1.5 text-[10.5px] px-2.5 py-1 rounded-full ${statusColors[user.status].bg} ${statusColors[user.status].text}`} style={{ fontWeight: 600 }}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusColors[user.status].dot}`} />
          {user.status === "active" ? "Hoạt động" : user.status === "inactive" ? "Không HĐ" : "Đã chặn"}
        </span>
      ),
    },
    {
      key: "lastActive",
      header: "Hoạt động",
      hiddenBelow: "xl",
      render: (user) => (
        <span className="text-[16px] text-muted-foreground">{user.lastActive}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "40px",
      render: (user) => (
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setActionMenu(actionMenu === user.id ? null : user.id); }}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
          </button>
          {actionMenu === user.id && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setActionMenu(null)} />
              <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-card rounded-xl shadow-xl border border-gray-100 dark:border-border py-1.5 z-40">
                {[
                  { icon: Eye, label: "Xem chi tiết", color: "" },
                  { icon: Edit, label: "Chỉnh sửa", color: "" },
                  { icon: Mail, label: "Gửi Email", color: "" },
                  { icon: Ban, label: "Khóa tài khoản", color: "text-amber-600" },
                  { icon: Trash2, label: "Xóa", color: "text-red-600" },
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={() => setActionMenu(null)}
                    className={`w-full flex items-center gap-2.5 px-4 py-2 text-[16px] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${action.color || "text-[#1a1a2e]/80 dark:text-foreground/80"}`}
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
  ], [actionMenu, search]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[24px] text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 800 }}>Quản lý người dùng</h1>
          <p className="text-muted-foreground text-[15px] mt-0.5">{users.length} người dùng trong hệ thống</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Undo/Redo buttons */}
          <AnimatePresence>
            {(canUndo || canRedo) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1 bg-white dark:bg-muted border border-gray-200 dark:border-border rounded-xl px-1 py-1"
              >
                <button
                  onClick={() => { const e = undo(); if (e) toast.info("Đã hoàn tác (Undo)"); }}
                  disabled={!canUndo}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Hoàn tác (Ctrl+Z)"
                  title={`Hoàn tác (${historyLength})`}
                >
                  <Undo2 className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => { const e = redo(); if (e) toast.info("Đã làm lại (Redo)"); }}
                  disabled={!canRedo}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Làm lại (Ctrl+Shift+Z)"
                  title={`Làm lại (${redoLength})`}
                >
                  <Redo2 className="w-4 h-4 text-muted-foreground" />
                </button>
                {historyLength > 0 && (
                  <span className="text-[16px] text-muted-foreground/50 px-1">{historyLength}</span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={handleExportAll} className="flex items-center gap-2 bg-white dark:bg-muted border border-gray-200 dark:border-border px-4 py-2.5 rounded-xl text-[15px] text-foreground hover:bg-gray-50 dark:hover:bg-white/5 transition-colors" style={{ fontWeight: 500 }}>
            <Download className="w-4 h-4" />
            Xuất CSV
          </button>
          <button className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/90 text-white px-4 py-2.5 rounded-xl text-[15px] shadow-sm hover:shadow-md transition-all" style={{ fontWeight: 600 }}>
            <UserPlus className="w-4 h-4" />
            Thêm Tài khoản
          </button>
        </div>
      </div>

      {/* Filters — role & status persisted in URL */}
      <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Tìm kiếm theo tên, email..."
              className="w-full bg-[#f4f5f7] dark:bg-white/5 pl-10 pr-4 py-2.5 rounded-xl text-[15px] text-foreground outline-none border border-transparent focus:border-primary/30 focus:bg-white dark:focus:bg-white/10 transition-all"
            />
          </div>
          <select
            value={filters.role}
            onChange={(e) => { setFilter("role", e.target.value); setSelectedUsers([]); }}
            className="bg-[#f4f5f7] dark:bg-white/5 px-4 py-2.5 rounded-xl text-[15px] text-foreground outline-none border border-transparent focus:border-primary/30 appearance-none min-w-[130px]"
            style={{ fontWeight: 500 }}
          >
            <option value="all">Tất cả vai trò</option>
            <option value="student">Học viên</option>
            <option value="teacher">Giảng viên</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => { setFilter("status", e.target.value); setSelectedUsers([]); }}
            className="bg-[#f4f5f7] dark:bg-white/5 px-4 py-2.5 rounded-xl text-[15px] text-foreground outline-none border border-transparent focus:border-primary/30 appearance-none min-w-[130px]"
            style={{ fontWeight: 500 }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
            <option value="banned">Đã chặn</option>
          </select>
        </div>
      </div>

      {/* Virtual Table with inline editing */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <VirtualTable
          data={paginatedData}
          columns={columns}
          getRowKey={(u) => u.id}
          showCheckbox
          selectedRows={selectedUsers}
          onSelectRow={toggleSelect}
          onSelectAll={toggleAll}
          rowHeight={60}
          maxHeight={540}
          virtualizeThreshold={30}
          emptyMessage="Không tìm thấy tài khoản nào"
          resizableColumns
          showColumnToggle
          onCellEdit={handleCellEdit}
        />
      </motion.div>

      {/* Batch Action Bar */}
      <AnimatePresence>
        {selectedUsers.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="sticky bottom-4 z-40 mx-auto max-w-2xl mt-4"
          >
            <div className="bg-[#1a1a2e] dark:bg-card rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/40 border border-white/[0.08] dark:border-border px-5 py-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span className="text-white text-[15px]" style={{ fontWeight: 600 }}>
                    {selectedUsers.length} người dùng
                  </span>
                </div>
                <button
                  onClick={() => setSelectedUsers([])}
                  className="text-white/40 hover:text-white/70 transition-colors"
                  aria-label="Bỏ chọn tất cả"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => { toast.success(`Đã gửi email cho ${selectedUsers.length} người dùng`); }}
                  className="flex items-center gap-1.5 text-white/80 hover:text-white bg-white/[0.08] hover:bg-white/[0.12] px-3.5 py-2 rounded-xl text-[16px] transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Gửi Email</span>
                </button>
                <button
                  onClick={handleExportSelected}
                  className="flex items-center gap-1.5 text-white/80 hover:text-white bg-white/[0.08] hover:bg-white/[0.12] px-3.5 py-2 rounded-xl text-[16px] transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Xuất CSV</span>
                </button>
                {/* Bulk edit Band */}
                <button
                  onClick={() => { setBulkBandValue(""); setBulkEditOpen(true); }}
                  className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 bg-blue-500/[0.12] hover:bg-blue-500/[0.18] px-3.5 py-2 rounded-xl text-[16px] transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Đổi Band</span>
                </button>
                <button
                  onClick={() => { toast.warning(`Đã chặn ${selectedUsers.length} người dùng`); }}
                  className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 bg-amber-500/[0.12] hover:bg-amber-500/[0.18] px-3.5 py-2 rounded-xl text-[16px] transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Khóa T.K</span >
                </button>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 text-red-400 hover:text-red-300 bg-red-500/[0.12] hover:bg-red-500/[0.18] px-3.5 py-2 rounded-xl text-[16px] transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Xóa</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      <Pagination
        page={page}
        total={filtered.length}
        pageSize={pageSize}
        onPageChange={(p) => { setPage(p); setSelectedUsers([]); }}
        onPageSizeChange={(s) => { setPageSize(s); setSelectedUsers([]); }}
        itemLabel="Tài khoản"
      />

      {/* Delete ConfirmModal */}
      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          const count = selectedUsers.length;
          setUsers((prev) => prev.filter((u) => !selectedUsers.includes(u.id)));
          setSelectedUsers([]);
          setConfirmDelete(false);
          toast.success(`Đã xóa ${count} tài khoản`);
        }}
        title="Xóa người dùng"
        description={`Bạn có chắc chắn muốn xóa ${selectedUsers.length} tài khoản đã chọn? Hành động này không thể hoàn tác.`}
        confirmLabel="Xác nhận xóa"
        variant="danger"
      />

      {/* Bulk Edit Band Modal */}
      <ConfirmModal
        open={bulkEditOpen}
        onClose={() => setBulkEditOpen(false)}
        onConfirm={() => {
          const num = parseFloat(bulkBandValue);
          if (isNaN(num) || num < 0 || num > 9) {
            toast.error("Điểm Band Score phải từ 0 đến 9");
            return;
          }
          const rounded = Math.round(num * 2) / 2;
          const count = selectedUsers.length;
          // Capture old values for undo
          const oldValues = new Map<string, number | null>();
          const affectedIds = [...selectedUsers];
          users.forEach((u) => {
            if (affectedIds.includes(u.id)) {
              oldValues.set(u.id, u.bandScore);
            }
          });
          setUsers((prev) => prev.map((u) =>
            affectedIds.includes(u.id) ? { ...u, bandScore: rounded } : u
          ));
          setBulkEditOpen(false);
          setSelectedUsers([]);
          toast.success(`Đã cập nhật Band Score = ${rounded} cho ${count} người dùng`, {
            action: {
              label: "Hoàn tác",
              onClick: () => {
                setUsers((prev) => prev.map((u) => {
                  if (oldValues.has(u.id)) {
                    return { ...u, bandScore: oldValues.get(u.id) ?? null };
                  }
                  return u;
                }));
                toast.info(`Đã hoàn tác Band Score cho ${count} người dùng`);
              },
            },
            duration: 8000,
          });
        }}
        title={`Cập nhật Band Score (${selectedUsers.length} người dùng)`}
        description="Nhập Band Score mới cho tất cả người dùng đã chọn (0–9, làm tròn 0.5)."
        confirmLabel="Áp dụng"
        variant="default"
      >
        <input
          type="number"
          min="0"
          max="9"
          step="0.5"
          value={bulkBandValue}
          onChange={(e) => setBulkBandValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.closest("[role=alertdialog]")?.querySelector<HTMLButtonElement>("button:last-of-type")?.click(); }}
          placeholder="VD: 6.5"
          className="w-full bg-[#f4f5f7] dark:bg-white/5 px-4 py-3 rounded-xl text-[15px] text-foreground outline-none border border-transparent focus:border-primary/30 transition-all text-center"
          style={{ fontWeight: 600 }}
          autoFocus
        />
      </ConfirmModal>
    </div>
  );
}

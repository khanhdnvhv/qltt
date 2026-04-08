import { useState, useEffect } from "react";
import { useDocumentTitle } from "../../utils/hooks";
import { useOutletContext } from "react-router";
import { Shield, Save, Undo, Key, ShieldCheck, Filter } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";

interface PermissionGroup {
  id: string;
  name: string;
  permissions: { id: string; name: string }[];
}

const permissionGroups: PermissionGroup[] = [
  {
    id: "system",
    name: "Quản trị Hệ thống & Đơn vị",
    permissions: [
      { id: "sys_users", name: "Quản lý Tài khoản (Thêm, Sửa, Khóa)" },
      { id: "sys_roles", name: "Phân quyền Hệ thống" },
      { id: "sys_centers", name: "Quản lý Danh sách Trung tâm" },
      { id: "sys_license", name: "Cấp phép / Đình chỉ Trung tâm" },
    ]
  },
  {
    id: "training",
    name: "Quản lý Đào tạo & Kế hoạch",
    permissions: [
      { id: "trn_plan_submit", name: "Lập & Trình duyệt Kế hoạch" },
      { id: "trn_plan_approve", name: "Phê duyệt Kế hoạch Đào tạo" },
      { id: "trn_programs", name: "Khai báo Chương trình / Khóa học" },
    ]
  },
  {
    id: "operation",
    name: "Vận hành Trung tâm",
    permissions: [
      { id: "op_students", name: "Quản lý Hồ sơ Học viên" },
      { id: "op_classes", name: "Quản lý Lớp học & TKB" },
      { id: "op_teachers", name: "Quản lý / Phân công Giảng viên" },
      { id: "op_finance", name: "Quản lý Học phí / Tài chính" },
    ]
  },
  {
    id: "exam",
    name: "Khảo thí & Văn bằng",
    permissions: [
      { id: "ex_grades", name: "Nhập điểm / Sổ điểm điện tử" },
      { id: "ex_organize", name: "Tổ chức Thi / Sát hạch" },
      { id: "ex_print", name: "In Giấy chứng nhận Nội bộ" },
      { id: "ex_cert_approve", name: "Quản lý Phôi & Cấp số Chứng chỉ gốc" },
    ]
  }
];

const roles = [
  { id: "superadmin", name: "Super Admin", isSystem: true },
  { id: "so_lanhdao", name: "Lãnh đạo Sở", isSystem: true },
  { id: "so_chuyenvien", name: "Chuyên viên Sở", isSystem: true },
  { id: "tt_giamdoc", name: "Giám đốc Trung tâm", isSystem: false },
  { id: "tt_giaovu", name: "Cán bộ Giáo vụ TT", isSystem: false },
  { id: "tt_giangvien", name: "Giảng viên", isSystem: false },
];

export function AdminRoles() {
  useDocumentTitle("Cấu hình Phân quyền Hệ thống");
  const { adminRole } = useOutletContext<{ adminRole: "department" | "center" }>();
  
  const displayRoles = adminRole === "center" ? roles.filter(r => !r.isSystem) : roles;
  const [activeRole, setActiveRole] = useState(displayRoles[0].id);
  
  useEffect(() => {
    // Nếu role đang active không tồn tại trong danh sách được phép (do đổi quyền giả lập context)
    // thì reset về phần tử đầu tiên
    if (!displayRoles.find(r => r.id === activeRole)) {
      setActiveRole(displayRoles[0].id);
    }
  }, [adminRole, activeRole, displayRoles]);
  
  // Fake state to hold current checked permissions per role
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({
    superadmin: permissionGroups.flatMap(g => g.permissions.map(p => p.id)),
    so_lanhdao: ["sys_centers", "trn_plan_approve", "ex_cert_approve"],
    so_chuyenvien: ["sys_centers", "sys_license", "trn_plan_approve", "ex_cert_approve"],
    tt_giamdoc: ["trn_plan_submit", "trn_programs", "op_students", "op_classes", "op_teachers", "op_finance", "ex_print", "ex_organize"],
    tt_giaovu: ["op_students", "op_classes", "op_teachers", "op_finance", "ex_organize", "ex_print"],
    tt_giangvien: ["ex_grades"],
  });

  const currentPerms = rolePermissions[activeRole] || [];
  const isSuperAdmin = activeRole === "superadmin";

  const togglePermission = (permId: string) => {
    if (isSuperAdmin) {
      toast.error("Không thể sửa quyền của Super Admin");
      return;
    }
    setRolePermissions(prev => {
      const perms = prev[activeRole] || [];
      const newPerms = perms.includes(permId) 
        ? perms.filter(id => id !== permId)
        : [...perms, permId];
      return { ...prev, [activeRole]: newPerms };
    });
  };

  const handleSave = () => {
    toast.success("Đã lưu Cấu hình Ma trận Phân quyền thành công");
  };

  const handleReset = () => {
    toast.info("Đã khôi phục cài đặt gốc của Nhóm quyền này");
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[24px] text-[#1a1a2e] dark:text-foreground flex items-center gap-2" style={{ fontWeight: 800 }}>
            <ShieldCheck className="w-6 h-6 text-primary" />
            Ma Trận Phân Quyền
          </h1>
          <p className="text-muted-foreground text-[15px] mt-0.5">Cấu hình chức năng chi tiết cho từng Vai trò trong nền tảng</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Left sidebar: Roles */}
        <div className="lg:w-72 flex-shrink-0 flex flex-col bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-border bg-gray-50/50 dark:bg-white/[0.02]">
            <h3 className="text-[15px] text-[#1a1a2e] dark:text-foreground flex items-center gap-2" style={{ fontWeight: 700 }}>
              <Key className="w-4 h-4 text-primary" />
              Danh sách Vai trò
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {displayRoles.map(role => (
              <button
                key={role.id}
                onClick={() => setActiveRole(role.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all ${
                  activeRole === role.id 
                    ? "bg-primary/[0.08] text-primary" 
                    : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/5 hover:text-[#1a1a2e] dark:hover:text-foreground"
                }`}
              >
                <span className="text-[15px]" style={{ fontWeight: activeRole === role.id ? 700 : 500 }}>{role.name}</span>
                {role.isSystem && <Shield className="w-3.5 h-3.5 opacity-50" />}
              </button>
            ))}
          </div>
        </div>

        {/* Right content: Permissions Matrix */}
        <div className="flex-1 flex flex-col bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-border flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.02]">
            <div>
              <h3 className="text-[17px] text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 700 }}>
                Chi tiết quyền: <span className="text-primary">{roles.find(r => r.id === activeRole)?.name}</span>
              </h3>
              {isSuperAdmin ? (
                <p className="text-[13.5px] text-amber-600 mt-1">Vai trò Super Admin mặc định có toàn quyền và không thể sửa đổi.</p>
              ) : (
                <p className="text-[13.5px] text-muted-foreground mt-1">
                  Cấu hình các quyền hạn và chức năng cụ thể.
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleReset} disabled={isSuperAdmin} className="p-2 rounded-xl text-muted-foreground hover:bg-gray-100 dark:hover:bg-white/10 transition-colors disabled:opacity-50">
                <Undo className="w-4.5 h-4.5" />
              </button>
              <button onClick={handleSave} disabled={isSuperAdmin} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl text-[14.5px] shadow-sm transition-all disabled:opacity-50" style={{ fontWeight: 600 }}>
                <Save className="w-4 h-4" />
                Lưu cấu hình
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {permissionGroups.map(group => (
                <motion.div key={group.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <h4 className="text-[14.5px] text-[#1a1a2e] dark:text-foreground uppercase tracking-wide border-b border-gray-100 dark:border-border pb-2" style={{ fontWeight: 700 }}>
                    {group.name}
                  </h4>
                  <div className="space-y-2">
                    {group.permissions.map(perm => (
                      <label 
                        key={perm.id} 
                        className={`flex items-start gap-3 p-2.5 rounded-xl transition-colors ${
                          isSuperAdmin ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5"
                        }`}
                      >
                        <div className="relative flex items-center justify-center mt-0.5">
                          <input
                            type="checkbox"
                            checked={currentPerms.includes(perm.id)}
                            onChange={() => togglePermission(perm.id)}
                            disabled={isSuperAdmin}
                            className={`w-5 h-5 rounded border-2 transition-colors ${
                              currentPerms.includes(perm.id)
                                ? "bg-primary border-primary"
                                : "border-gray-300 dark:border-gray-600 bg-transparent"
                            } appearance-none cursor-pointer disabled:cursor-not-allowed`}
                          />
                          {currentPerms.includes(perm.id) && (
                            <svg className="absolute w-3 h-3 text-white pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className="text-[15px] text-[#1a1a2e] dark:text-foreground leading-snug" style={{ fontWeight: 500 }}>
                          {perm.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useMemo } from "react";
import { useOutletContext } from "react-router";
import { useAppData, type AppCenter } from "../../context/AppDataContext";
import {
  Building2, Phone, Mail, MapPin, User, Award, Calendar, FileText,
  Users, BookOpen, Edit3, Save, X, Star, StarOff, CheckCircle2,
  AlertTriangle, ShieldCheck, ClipboardList, ChevronRight, Layers
} from "lucide-react";
import { toast } from "sonner";

const TYPE_COLORS: Record<AppCenter["type"], string> = {
  "GDNN-GDTX": "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  "GDNN":      "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  "GDTX":      "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
  "Ngoại ngữ": "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  "Tin học":   "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  "Dạy nghề":  "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
};

const STATUS_CONFIG = {
  active:    { label: "Đang hoạt động", cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10", icon: CheckCircle2 },
  suspended: { label: "Tạm dừng",       cls: "bg-amber-50 text-amber-700 dark:bg-amber-500/10",   icon: AlertTriangle },
  revoked:   { label: "Thu hồi phép",   cls: "bg-rose-50 text-rose-700 dark:bg-rose-500/10",     icon: ShieldCheck },
} as const;

function StarRating({ rating }: { rating: number | null }) {
  if (rating === null) return <span className="text-[13px] text-muted-foreground italic">Chưa xếp loại</span>;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i =>
        i <= rating
          ? <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400"/>
          : <StarOff key={i} className="w-4 h-4 text-gray-300"/>
      )}
    </div>
  );
}

interface EditForm {
  director: string; phone: string; email: string; address: string;
  studentCapacity: number; teacherCount: number; classroomCount: number; note: string;
}

export function AdminCenterProfile() {
  const { adminRole } = useOutletContext<{ adminRole: "department" | "center" }>();
  const { centers, updateCenter, inspections, trainingPlans, students, classes } = useAppData();

  // For department: show list; for center: show own profile
  const [selectedId, setSelectedId] = useState<string | null>(
    adminRole === "department" ? null : (centers[0]?.id ?? null)
  );
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<EditForm | null>(null);
  const [search, setSearch] = useState("");

  const center = selectedId ? centers.find(c => c.id === selectedId) ?? null : null;

  // Center-specific stats
  const centerInspections = useMemo(() =>
    center ? inspections.filter(i => i.centerName === center.name) : [],
    [center, inspections]
  );
  const centerPlans = useMemo(() =>
    center ? trainingPlans.filter(p => p.centerName === center.name) : [],
    [center, trainingPlans]
  );

  const filteredCenters = useMemo(() =>
    centers.filter(c => {
      const q = search.toLowerCase();
      return !search || c.name.toLowerCase().includes(q) || c.district.toLowerCase().includes(q) || c.director.toLowerCase().includes(q);
    }),
    [centers, search]
  );

  // KPI aggregates for department view
  const kpis = useMemo(() => ({
    total: centers.length,
    active: centers.filter(c => c.status === "active").length,
    totalStudents: centers.reduce((s, c) => s + c.currentStudents, 0),
    avgRating: (() => {
      const rated = centers.filter(c => c.rating !== null);
      if (!rated.length) return null;
      return (rated.reduce((s, c) => s + (c.rating ?? 0), 0) / rated.length).toFixed(1);
    })(),
  }), [centers]);

  const startEdit = () => {
    if (!center) return;
    setForm({ director: center.director, phone: center.phone, email: center.email,
      address: center.address, studentCapacity: center.studentCapacity,
      teacherCount: center.teacherCount, classroomCount: center.classroomCount, note: center.note });
    setEditing(true);
  };

  const saveEdit = () => {
    if (!center || !form) return;
    updateCenter(center.id, form);
    toast.success("Đã cập nhật thông tin trung tâm");
    setEditing(false);
    setForm(null);
  };

  // ── Department: list + detail view ──────────────────────────────────────────
  if (adminRole === "department") {
    return (
      <div className="flex-1 pb-10">
        <div className="mb-6">
          <h1 className="text-[26px] font-black text-[#1a1a2e] dark:text-foreground tracking-tight">Hồ sơ Trung tâm</h1>
          <p className="text-[15px] text-muted-foreground mt-1">Quản lý thông tin pháp lý và hồ sơ các trung tâm trong hệ thống.</p>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Tổng số Trung tâm", value: kpis.total, cls: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20" },
            { label: "Đang hoạt động", value: kpis.active, cls: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20" },
            { label: "Học viên đang học", value: kpis.totalStudents.toLocaleString(), cls: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20" },
            { label: "Điểm TB thanh tra", value: kpis.avgRating ? `${kpis.avgRating}/5 ★` : "—", cls: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20" },
          ].map(k => (
            <div key={k.label} className={`rounded-2xl border p-4 ${k.cls}`}>
              <p className="text-[24px] font-black leading-none">{k.value}</p>
              <p className="text-[12.5px] font-semibold mt-1">{k.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left: center list */}
          <div className="lg:w-[340px] shrink-0">
            <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-3xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-100 dark:border-border">
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Tìm trung tâm..."
                  className="w-full bg-[#f4f5f7] dark:bg-black/20 px-4 py-2.5 rounded-xl text-[14px] outline-none border border-transparent focus:border-primary/50"
                />
              </div>
              <div className="overflow-y-auto max-h-[600px]">
                {filteredCenters.map(c => {
                  const SC = STATUS_CONFIG[c.status];
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedId(c.id)}
                      className={`w-full text-left px-4 py-3.5 border-b border-gray-50 dark:border-border/50 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${selectedId === c.id ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[14px] font-bold text-[#1a1a2e] dark:text-foreground line-clamp-1">{c.shortName}</p>
                          <p className="text-[12px] text-muted-foreground mt-0.5 line-clamp-1">{c.district}</p>
                        </div>
                        <span className={`shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-lg ${TYPE_COLORS[c.type]}`}>{c.type}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg ${SC.cls}`}>{SC.label}</span>
                        {c.rating !== null && <StarRating rating={c.rating}/>}
                      </div>
                    </button>
                  );
                })}
                {filteredCenters.length === 0 && (
                  <div className="py-12 text-center text-muted-foreground text-[14px]">Không tìm thấy trung tâm</div>
                )}
              </div>
            </div>
          </div>

          {/* Right: detail panel */}
          <div className="flex-1 min-w-0">
            {center ? (
              <CenterDetail center={center} inspections={centerInspections} plans={centerPlans}
                canEdit onEdit={startEdit} editing={editing} form={form}
                setForm={f => setForm(prev => prev ? { ...prev, ...f } : prev)}
                onSave={saveEdit} onCancel={() => { setEditing(false); setForm(null); }}
              />
            ) : (
              <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-3xl p-12 text-center">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3"/>
                <p className="text-[15px] text-muted-foreground">Chọn một trung tâm để xem chi tiết</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Center role: own profile ──────────────────────────────────────────────────
  return (
    <div className="flex-1 pb-10">
      <div className="mb-6">
        <h1 className="text-[26px] font-black text-[#1a1a2e] dark:text-foreground tracking-tight">Hồ sơ Trung tâm</h1>
        <p className="text-[15px] text-muted-foreground mt-1">Thông tin pháp lý và hồ sơ hoạt động của trung tâm.</p>
      </div>
      {center ? (
        <CenterDetail center={center} inspections={centerInspections} plans={centerPlans}
          canEdit onEdit={startEdit} editing={editing} form={form}
          setForm={f => setForm(prev => prev ? { ...prev, ...f } : prev)}
          onSave={saveEdit} onCancel={() => { setEditing(false); setForm(null); }}
        />
      ) : (
        <div className="bg-white dark:bg-card border rounded-3xl p-12 text-center text-muted-foreground">
          Chưa có hồ sơ trung tâm. Liên hệ Sở GD&ĐT để thiết lập.
        </div>
      )}
    </div>
  );
}

// ── Sub-component: Center detail card ───────────────────────────────────────────
function CenterDetail({
  center, inspections, plans,
  canEdit, onEdit, editing, form, setForm, onSave, onCancel,
}: {
  center: AppCenter;
  inspections: ReturnType<typeof Array.prototype.filter>;
  plans: ReturnType<typeof Array.prototype.filter>;
  canEdit: boolean;
  onEdit: () => void;
  editing: boolean;
  form: EditForm | null;
  setForm: (f: Partial<EditForm>) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const SC = STATUS_CONFIG[center.status];
  const StatusIcon = SC.icon;

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <Building2 className="w-7 h-7 text-primary"/>
            </div>
            <div>
              <h2 className="text-[20px] font-black text-[#1a1a2e] dark:text-foreground leading-tight">{center.name}</h2>
              <p className="text-[13px] text-muted-foreground mt-0.5">{center.code} · {center.district}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`text-[12px] font-bold px-2.5 py-1 rounded-xl ${TYPE_COLORS[center.type]}`}>{center.type}</span>
                <span className={`text-[12px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 ${SC.cls}`}>
                  <StatusIcon className="w-3.5 h-3.5"/>{SC.label}
                </span>
                <StarRating rating={center.rating}/>
              </div>
            </div>
          </div>
          {canEdit && !editing && (
            <button onClick={onEdit} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-[13px] font-semibold hover:opacity-90 transition-opacity shrink-0">
              <Edit3 className="w-3.5 h-3.5"/> Chỉnh sửa
            </button>
          )}
        </div>

        {/* KPI chips */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          {[
            { icon: Users, label: "Học viên", value: `${center.currentStudents.toLocaleString()} / ${center.studentCapacity.toLocaleString()}` },
            { icon: User, label: "Giáo viên", value: `${center.teacherCount} GV` },
            { icon: Layers, label: "Phòng học", value: `${center.classroomCount} phòng` },
          ].map(k => (
            <div key={k.label} className="bg-[#f4f5f7] dark:bg-black/20 rounded-2xl p-3 text-center">
              <k.icon className="w-5 h-5 text-primary mx-auto mb-1"/>
              <p className="text-[16px] font-black text-[#1a1a2e] dark:text-foreground">{k.value}</p>
              <p className="text-[11.5px] text-muted-foreground">{k.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Edit form or info grid */}
      {editing && form ? (
        <div className="bg-white dark:bg-card border border-primary/30 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-[16px] font-bold text-[#1a1a2e] dark:text-foreground">Chỉnh sửa thông tin</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Giám đốc / Hiệu trưởng", key: "director" as const },
              { label: "Điện thoại", key: "phone" as const },
              { label: "Email", key: "email" as const },
              { label: "Địa chỉ", key: "address" as const },
            ].map(f => (
              <div key={f.key}>
                <label className="text-[13px] font-semibold text-muted-foreground block mb-1.5">{f.label}</label>
                <input
                  value={form[f.key] as string}
                  onChange={e => setForm({ [f.key]: e.target.value })}
                  className="w-full bg-[#f4f5f7] dark:bg-black/20 border border-transparent focus:border-primary/50 px-3.5 py-2.5 rounded-xl text-[14px] outline-none"
                />
              </div>
            ))}
            {[
              { label: "Sức chứa HV", key: "studentCapacity" as const },
              { label: "Số GV", key: "teacherCount" as const },
              { label: "Số phòng học", key: "classroomCount" as const },
            ].map(f => (
              <div key={f.key}>
                <label className="text-[13px] font-semibold text-muted-foreground block mb-1.5">{f.label}</label>
                <input
                  type="number" min={0}
                  value={form[f.key] as number}
                  onChange={e => setForm({ [f.key]: Number(e.target.value) })}
                  className="w-full bg-[#f4f5f7] dark:bg-black/20 border border-transparent focus:border-primary/50 px-3.5 py-2.5 rounded-xl text-[14px] outline-none"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="text-[13px] font-semibold text-muted-foreground block mb-1.5">Ghi chú</label>
            <textarea
              rows={2}
              value={form.note}
              onChange={e => setForm({ note: e.target.value })}
              className="w-full bg-[#f4f5f7] dark:bg-black/20 border border-transparent focus:border-primary/50 px-3.5 py-2.5 rounded-xl text-[14px] outline-none resize-none"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={onSave} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-white text-[13px] font-bold hover:opacity-90 transition-opacity">
              <Save className="w-3.5 h-3.5"/> Lưu thay đổi
            </button>
            <button onClick={onCancel} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-white/10 text-muted-foreground text-[13px] font-semibold hover:opacity-80 transition-opacity">
              <X className="w-3.5 h-3.5"/> Hủy
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-3xl p-6 shadow-sm">
          <h3 className="text-[15px] font-bold text-[#1a1a2e] dark:text-foreground mb-4">Thông tin Chi tiết</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
            {[
              { icon: User, label: "Giám đốc / Hiệu trưởng", value: center.director },
              { icon: Phone, label: "Điện thoại", value: center.phone },
              { icon: Mail, label: "Email", value: center.email },
              { icon: MapPin, label: "Địa chỉ", value: center.address },
              { icon: Calendar, label: "Ngày thành lập", value: center.establishedDate },
              { icon: FileText, label: "Số giấy phép HĐGD", value: center.licenseNo },
              { icon: Calendar, label: "Ngày cấp phép", value: center.licenseDate },
              { icon: Calendar, label: "Hạn phép", value: center.licenseExpiry ?? "Không thời hạn" },
            ].map(row => (
              <div key={row.label} className="flex items-start gap-3">
                <row.icon className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5"/>
                <div>
                  <p className="text-[12px] text-muted-foreground">{row.label}</p>
                  <p className="text-[14px] font-semibold text-[#1a1a2e] dark:text-foreground">{row.value || "—"}</p>
                </div>
              </div>
            ))}
          </div>
          {center.note && (
            <div className="mt-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl px-4 py-3 text-[13px] text-amber-700 dark:text-amber-400">
              <strong className="font-semibold">Ghi chú:</strong> {center.note}
            </div>
          )}
        </div>
      )}

      {/* Inspection history */}
      <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-bold text-[#1a1a2e] dark:text-foreground flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-primary"/> Lịch sử Thanh – Kiểm tra
          </h3>
          <span className="text-[12.5px] text-muted-foreground font-medium">{inspections.length} đợt</span>
        </div>
        {inspections.length === 0 ? (
          <p className="text-[13px] text-muted-foreground italic">Chưa có đợt thanh tra nào.</p>
        ) : (
          <div className="space-y-2">
            {inspections.map(insp => (
              <div key={insp.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 dark:border-border/30 last:border-0">
                <div>
                  <p className="text-[13.5px] font-semibold text-[#1a1a2e] dark:text-foreground">{insp.code} — {insp.type}</p>
                  <p className="text-[12px] text-muted-foreground">{insp.inspectionDate} · {insp.leader}</p>
                </div>
                <div className="text-right">
                  {insp.score !== null && (
                    <p className={`text-[15px] font-black ${insp.score >= 80 ? "text-emerald-600" : insp.score >= 60 ? "text-amber-600" : "text-rose-600"}`}>
                      {insp.score}/100
                    </p>
                  )}
                  <p className="text-[11.5px] text-muted-foreground capitalize">{insp.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Training plans */}
      <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-bold text-[#1a1a2e] dark:text-foreground flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary"/> Kế hoạch Đào tạo
          </h3>
          <span className="text-[12.5px] text-muted-foreground font-medium">{plans.length} kế hoạch</span>
        </div>
        {plans.length === 0 ? (
          <p className="text-[13px] text-muted-foreground italic">Chưa có kế hoạch nào.</p>
        ) : (
          <div className="space-y-2">
            {plans.slice(0, 5).map(plan => {
              const statusColors: Record<string, string> = {
                approved: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10",
                pending:  "text-amber-600 bg-amber-50 dark:bg-amber-500/10",
                revision: "text-orange-600 bg-orange-50 dark:bg-orange-500/10",
                draft:    "text-gray-500 bg-gray-100 dark:bg-white/10",
                rejected: "text-rose-600 bg-rose-50 dark:bg-rose-500/10",
              };
              return (
                <div key={plan.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 dark:border-border/30 last:border-0">
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-semibold text-[#1a1a2e] dark:text-foreground line-clamp-1">{plan.title}</p>
                    <p className="text-[12px] text-muted-foreground">{plan.term} · {plan.expectedStudents.toLocaleString()} HV</p>
                  </div>
                  <span className={`ml-3 shrink-0 text-[11.5px] font-bold px-2.5 py-1 rounded-xl ${statusColors[plan.status] ?? "bg-gray-100 text-gray-500"}`}>
                    {plan.status === "approved" ? "Đã duyệt" : plan.status === "pending" ? "Chờ duyệt" : plan.status === "revision" ? "Cần sửa" : plan.status === "draft" ? "Nháp" : "Từ chối"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useMemo } from "react";
import { useDocumentTitle } from "../../utils/hooks";
import { motion } from "motion/react";
import { Search, Repeat, ArrowRight, CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useAppData } from "../../context/AppDataContext";

type StudentStatus = "active" | "suspended" | "reserved";
const statusLabels: Record<StudentStatus, { label: string; color: string }> = {
  active: { label: "Đang học", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" },
  suspended: { label: "Đang bảo lưu", color: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" },
  reserved: { label: "Tạm dừng", color: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400" },
};

export function AdminStudentTransfer() {
  useDocumentTitle("Chuyển lớp");
  const { students: storeStudents, classes: storeClasses, enrollments, studentTransfers, addStudentTransfer } = useAppData();
  const [searchStudent, setSearchStudent] = useState("");
  const [tab, setTab] = useState<"transfer" | "history">("transfer");
  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Build list from store: students who are learning/suspended with their current enrollment
  const students = useMemo(() => storeStudents
    .filter(s => s.status === "learning" || s.status === "suspended")
    .map(s => {
      const enroll = enrollments.find(e => e.studentId === s.id && (e.status === "active" || e.status === "reserve"));
      const cls = enroll ? storeClasses.find(c => c.id === enroll.classId) : undefined;
      return {
        id: s.id, code: s.code, name: s.name,
        currentClass: cls?.code ?? enroll?.classCode ?? "Chưa xếp lớp",
        currentClassId: cls?.id ?? enroll?.classId ?? "",
        currentCourse: enroll?.courseName ?? s.programs[0] ?? "",
        status: (s.status === "suspended" ? "suspended" : "active") as StudentStatus,
      };
    }), [storeStudents, enrollments, storeClasses]);

  // Available classes from store
  const availableClasses = useMemo(() => storeClasses
    .filter(c => c.status === "Tuyển sinh" || c.status === "Hoạt động")
    .map(c => ({
      id: c.id, name: `${c.code} — ${c.courseName}`,
      currentSlots: c.currentStudents, maxSlots: c.maxStudents,
      teacher: c.teacherName, schedule: c.schedule,
    })), [storeClasses]);

  const [selectedStudent, setSelectedStudent] = useState<typeof students[0] | null>(null);
  const [selectedClass, setSelectedClass] = useState<typeof availableClasses[0] | null>(null);
  const [reason, setReason] = useState("");

  const filteredStudents = useMemo(() => students.filter(s =>
    !searchStudent || s.name.toLowerCase().includes(searchStudent.toLowerCase()) || s.code.toLowerCase().includes(searchStudent.toLowerCase())
  ), [students, searchStudent]);

  const handleSelectStudent = (s: typeof students[0]) => {
    setSelectedStudent(s);
    setSelectedClass(null);
    setValidationError(null);
    if (s.status === "suspended") {
      setValidationError(`Học viên ${s.name} đang trong thời gian bảo lưu. Không thể chuyển lớp.`);
    }
  };

  const handleSelectClass = (c: typeof availableClasses[0]) => {
    const remaining = c.maxSlots - c.currentSlots;
    if (remaining <= 0) {
      toast.error(`Lớp "${c.name}" đã đầy chỗ. Vui lòng chọn lớp khác.`);
      return;
    }
    setSelectedClass(c);
  };

  const handleSubmit = () => {
    if (!selectedStudent || !selectedClass || !reason.trim()) {
      toast.error("Vui lòng chọn đầy đủ thông tin và nhập lý do");
      return;
    }
    if (validationError) { toast.error("Không thể chuyển lớp: " + validationError); return; }
    if (selectedClass.maxSlots - selectedClass.currentSlots <= 0) {
      toast.error("Lớp đã đầy chỗ. Vui lòng chọn lớp khác.");
      return;
    }
    addStudentTransfer({
      studentId: selectedStudent.id,
      studentCode: selectedStudent.code,
      studentName: selectedStudent.name,
      fromClassId: selectedStudent.currentClassId,
      fromClassName: selectedStudent.currentClass,
      toClassId: selectedClass.id,
      toClassName: selectedClass.name,
      reason,
      transferDate: new Date().toLocaleDateString("vi-VN"),
      approvedBy: "Admin",
    });
    setSubmitted(true);
    toast.success(`Đã chuyển ${selectedStudent.name} sang ${selectedClass.name}`);
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div className="text-center max-w-md" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 20 }}>
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-[22px] font-extrabold text-[#1a1a2e] dark:text-foreground mb-2">Chuyển lớp thành công!</h2>
          <p className="text-muted-foreground mb-1"><strong>{selectedStudent?.name}</strong></p>
          <div className="flex items-center justify-center gap-2 my-3 text-[14px]">
            <span className="px-3 py-1.5 bg-gray-100 dark:bg-white/10 rounded-lg font-semibold text-muted-foreground">{selectedStudent?.currentClass}</span>
            <ArrowRight className="w-4 h-4 text-emerald-500" />
            <span className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg font-semibold text-emerald-700 dark:text-emerald-400">{selectedClass?.name}</span>
          </div>
          <button
            onClick={() => { setSubmitted(false); setSelectedStudent(null); setSelectedClass(null); setReason(""); setValidationError(null); }}
            className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-semibold text-[14px] mt-2"
          >
            Chuyển lớp mới
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <div className="relative mb-6 p-6 rounded-2xl overflow-hidden bg-gradient-to-r from-cyan-600 to-teal-700 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: "28px 28px" }} />
        <div className="relative z-10">
          <p className="text-cyan-200 text-[13px] font-semibold mb-1 uppercase">Học viên & Tuyển sinh</p>
          <h1 className="text-[24px] font-extrabold">Chuyển lớp</h1>
          <p className="text-cyan-100/70 text-[14px] mt-1">Xử lý yêu cầu đổi lịch học, chuyển ca thi cho học viên</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {[["transfer", "Thực hiện chuyển lớp"], ["history", "Lịch sử chuyển lớp"]].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setTab(v as typeof tab)}
            className={`px-4 py-2 rounded-xl text-[14px] font-semibold transition-all ${tab === v ? "bg-cyan-600 text-white" : "bg-white dark:bg-card border border-gray-200 dark:border-border text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/5"}`}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === "transfer" ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Select Student */}
          <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-5">
            <h3 className="text-[15px] font-bold text-[#1a1a2e] dark:text-foreground mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-cyan-500 rounded-full text-white text-[11px] flex items-center justify-center font-bold">1</span>
              Chọn học viên
            </h3>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={searchStudent}
                onChange={e => setSearchStudent(e.target.value)}
                placeholder="Tìm học viên theo tên hoặc mã..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none"
              />
            </div>
            <div className="space-y-2">
              {filteredStudents.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleSelectStudent(s)}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all ${selectedStudent?.id === s.id ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-500/10" : "border-gray-100 dark:border-border hover:border-cyan-300"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white text-[13px] font-bold">
                      {s.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-[#1a1a2e] dark:text-foreground text-[14px]">{s.name}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusLabels[s.status].color}`}>
                          {statusLabels[s.status].label}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-muted-foreground">{s.code}</p>
                      <p className="text-[12px] text-muted-foreground truncate">{s.currentClass}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Select new class + confirm */}
          <div className="space-y-4">
            {/* Validation Alert */}
            {validationError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl"
              >
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-700 dark:text-red-400 text-[14px]">Không thể chuyển lớp</p>
                  <p className="text-[13px] text-red-600 dark:text-red-400/80 mt-0.5">{validationError}</p>
                </div>
              </motion.div>
            )}

            <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-5">
              <h3 className="text-[15px] font-bold text-[#1a1a2e] dark:text-foreground mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-cyan-500 rounded-full text-white text-[11px] flex items-center justify-center font-bold">2</span>
                Chọn lớp mới
              </h3>
              {selectedStudent && !validationError ? (
                <div className="space-y-2">
                  {availableClasses.map(c => {
                    const remaining = c.maxSlots - c.currentSlots;
                    const isFull = remaining <= 0;
                    const pct = Math.round((c.currentSlots / c.maxSlots) * 100);
                    return (
                      <button
                        key={c.id}
                        onClick={() => handleSelectClass(c)}
                        disabled={isFull}
                        className={`w-full text-left p-3 rounded-xl border-2 transition-all ${isFull ? "opacity-50 cursor-not-allowed border-gray-100 dark:border-border" : selectedClass?.id === c.id ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-500/10" : "border-gray-100 dark:border-border hover:border-cyan-300"}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold text-[14px] text-[#1a1a2e] dark:text-foreground">{c.name}</p>
                          {isFull ? (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded-full shrink-0 ml-2">
                              <AlertCircle className="w-3 h-3" /> Đầy chỗ
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0 ml-2">
                              Còn {remaining} chỗ
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[12px] text-muted-foreground mb-2">
                          <span>GV: {c.teacher}</span>
                          <span>·</span>
                          <span>{c.schedule}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-amber-500" : "bg-emerald-500"}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">{c.currentSlots}/{c.maxSlots} học viên</p>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[14px] text-muted-foreground text-center py-6">
                  {validationError ? "Không thể chọn lớp do học viên không đủ điều kiện" : "Vui lòng chọn học viên trước"}
                </p>
              )}
            </div>

            <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-5">
              <h3 className="text-[15px] font-bold text-[#1a1a2e] dark:text-foreground mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-cyan-500 rounded-full text-white text-[11px] flex items-center justify-center font-bold">3</span>
                Lý do chuyển lớp
              </h3>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none resize-none"
                placeholder="Nhập lý do chuyển lớp (bắt buộc)..."
              />
              {selectedStudent && selectedClass && (
                <div className="mt-3 p-3 bg-cyan-50 dark:bg-cyan-500/10 rounded-xl">
                  <p className="text-[12px] text-cyan-600 font-semibold mb-1">Tóm tắt thay đổi</p>
                  <div className="flex items-center gap-2 text-[13px]">
                    <span className="text-muted-foreground">{selectedStudent.currentClass}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                    <span className="font-semibold text-cyan-700 dark:text-cyan-400">{selectedClass.name}</span>
                  </div>
                </div>
              )}
              <button
                onClick={handleSubmit}
                disabled={!!validationError}
                className="w-full mt-3 py-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-[14px] transition-colors flex items-center justify-center gap-2"
              >
                <Repeat className="w-4 h-4" />
                Xác nhận chuyển lớp
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-border bg-gray-50/50 dark:bg-white/[0.02]">
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-[12px] uppercase">Học viên</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-[12px] uppercase">Lớp cũ → Lớp mới</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-[12px] uppercase hidden md:table-cell">Lý do</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-[12px] uppercase hidden lg:table-cell">Ngày / Duyệt bởi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/[0.03]">
                {studentTransfers.map(h => (
                  <tr key={h.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                    <td className="px-4 py-3.5">
                      <p className="font-semibold">{h.studentName}</p>
                      <p className="text-[11px] font-mono text-muted-foreground">{h.studentCode}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2 text-[13px]">
                        <span className="text-muted-foreground">{h.fromClassName}</span>
                        <ArrowRight className="w-3 h-3 text-cyan-500 shrink-0" />
                        <span className="font-semibold text-cyan-600">{h.toClassName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell text-[13px] text-muted-foreground">{h.reason}</td>
                    <td className="px-4 py-3.5 hidden lg:table-cell text-[13px] text-muted-foreground">{h.transferDate} · {h.approvedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

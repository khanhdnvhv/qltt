import { useState, useMemo } from "react";
import { useDocumentTitle, useEscapeKey } from "../../utils/hooks";
import { AnimatePresence, motion } from "motion/react";
import { Search, Repeat, ChevronRight, X, CheckCircle, Users, ArrowRight, Filter } from "lucide-react";
import { toast } from "sonner";

const students = [
  { id: "S001", code: "HV-26-0001", name: "Nguyễn Trung Tín", currentClass: "Tiếng Anh B1 - Ca Tối T2T4T6", currentCourse: "Tiếng Anh B1 VSTEP" },
  { id: "S002", code: "HV-26-0002", name: "Trần Mai Anh", currentClass: "Bổ túc THPT Kỳ 1 - Ca Sáng", currentCourse: "Bổ túc THPT" },
  { id: "S007", code: "HV-26-0015", name: "Đỗ Xuân Trường", currentClass: "Tin học IC3 - Ca Chiều T3T5", currentCourse: "Tin học IC3" },
  { id: "S006", code: "HV-26-0012", name: "Lê Minh Trí", currentClass: "Lập trình Web - Lớp WEB01", currentCourse: "Lập trình Web" },
];

const availableClasses = [
  { id: "CL001", name: "Tiếng Anh B1 - Ca Sáng T2T4T6", slots: 5, teacher: "Nguyễn Văn Đức", schedule: "7:30-11:30, T2T4T6" },
  { id: "CL002", name: "Tiếng Anh B1 - Ca Tối T3T5T7", slots: 8, teacher: "Trần Thị Lan", schedule: "18:00-20:00, T3T5T7" },
  { id: "CL003", name: "Tiếng Anh B1 - Ca Cuối tuần", slots: 3, teacher: "Lê Minh Hoàng", schedule: "8:00-12:00, T7CN" },
  { id: "CL004", name: "Tin học IC3 - Ca Sáng T2T4T6", slots: 7, teacher: "Phạm Xuân Bình", schedule: "7:30-11:30, T2T4T6" },
  { id: "CL005", name: "Tin học IC3 - Ca Tối T2T4", slots: 12, teacher: "Hoàng Thu Hà", schedule: "18:00-20:30, T2T4" },
];

const history = [
  { id: "1", studentName: "Vũ Ngọc Trâm", code: "HV-25-0811", from: "Kế toán - Ca Chiều", to: "Kế toán - Ca Tối", reason: "Xung đột công việc", date: "15/02/2026", approvedBy: "Admin" },
  { id: "2", studentName: "Hoàng Thanh Thảo", code: "HV-25-0992", from: "TOEIC - Ca Sáng", to: "TOEIC - Ca Cuối tuần", reason: "Bận học chính quy", date: "10/02/2026", approvedBy: "Admin" },
  { id: "3", studentName: "Phạm Bình Minh", code: "HV-26-0004", from: "Hàn Điện - Ca Sáng", to: "Hàn Điện - Ca Chiều", reason: "Đổi ca làm việc", date: "05/02/2026", approvedBy: "Nguyễn Thị Thanh" },
];

export function AdminStudentTransfer() {
  useDocumentTitle("Chuyển lớp");
  const [searchStudent, setSearchStudent] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<typeof students[0] | null>(null);
  const [selectedClass, setSelectedClass] = useState<typeof availableClasses[0] | null>(null);
  const [reason, setReason] = useState("");
  const [tab, setTab] = useState<"transfer" | "history">("transfer");
  const [submitted, setSubmitted] = useState(false);

  const filteredStudents = useMemo(() => students.filter(s =>
    !searchStudent || s.name.toLowerCase().includes(searchStudent.toLowerCase()) || s.code.toLowerCase().includes(searchStudent.toLowerCase())
  ), [searchStudent]);

  const handleSubmit = () => {
    if (!selectedStudent || !selectedClass || !reason) { toast.error("Vui lòng chọn đầy đủ thông tin và nhập lý do"); return; }
    setSubmitted(true);
    toast.success(`Đã chuyển ${selectedStudent.name} sang ${selectedClass.name}`);
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div className="text-center max-w-md" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 20 }}>
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-emerald-500" /></div>
          <h2 className="text-[22px] font-extrabold text-[#1a1a2e] dark:text-foreground mb-2">Chuyển lớp thành công!</h2>
          <p className="text-muted-foreground mb-1"><strong>{selectedStudent?.name}</strong></p>
          <div className="flex items-center justify-center gap-2 my-3 text-[14px]">
            <span className="px-3 py-1.5 bg-gray-100 dark:bg-white/10 rounded-lg font-semibold text-muted-foreground">{selectedStudent?.currentClass}</span>
            <ArrowRight className="w-4 h-4 text-emerald-500" />
            <span className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg font-semibold text-emerald-700 dark:text-emerald-400">{selectedClass?.name}</span>
          </div>
          <button onClick={() => { setSubmitted(false); setSelectedStudent(null); setSelectedClass(null); setReason(""); }} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-[14px] mt-2">Chuyển lớp mới</button>
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
          <button key={v} onClick={() => setTab(v as typeof tab)} className={`px-4 py-2 rounded-xl text-[14px] font-semibold transition-all ${tab === v ? "bg-cyan-600 text-white" : "bg-white dark:bg-card border border-gray-200 dark:border-border text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/5"}`}>{l}</button>
        ))}
      </div>

      {tab === "transfer" ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Select Student */}
          <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-5">
            <h3 className="text-[15px] font-bold text-[#1a1a2e] dark:text-foreground mb-4 flex items-center gap-2"><span className="w-6 h-6 bg-cyan-500 rounded-full text-white text-[11px] flex items-center justify-center font-bold">1</span>Chọn học viên</h3>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={searchStudent} onChange={e => setSearchStudent(e.target.value)} placeholder="Tìm học viên..." className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" />
            </div>
            <div className="space-y-2">
              {filteredStudents.map(s => (
                <button key={s.id} onClick={() => setSelectedStudent(s)} className={`w-full text-left p-3 rounded-xl border-2 transition-all ${selectedStudent?.id === s.id ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-500/10" : "border-gray-100 dark:border-border hover:border-cyan-300"}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white text-[13px] font-bold">{s.name.charAt(0)}</div>
                    <div>
                      <p className="font-semibold text-[#1a1a2e] dark:text-foreground text-[14px]">{s.name}</p>
                      <p className="text-[11px] font-mono text-muted-foreground">{s.code}</p>
                      <p className="text-[12px] text-muted-foreground">{s.currentClass}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Select new class + confirm */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-5">
              <h3 className="text-[15px] font-bold text-[#1a1a2e] dark:text-foreground mb-4 flex items-center gap-2"><span className="w-6 h-6 bg-cyan-500 rounded-full text-white text-[11px] flex items-center justify-center font-bold">2</span>Chọn lớp mới</h3>
              {selectedStudent ? (
                <div className="space-y-2">
                  {availableClasses.filter(c => c.name.includes(selectedStudent.currentCourse.split(" ").slice(0, 2).join(" ")) || true).slice(0, 5).map(c => (
                    <button key={c.id} onClick={() => setSelectedClass(c)} className={`w-full text-left p-3 rounded-xl border-2 transition-all ${selectedClass?.id === c.id ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-500/10" : "border-gray-100 dark:border-border hover:border-cyan-300"}`}>
                      <p className="font-semibold text-[14px] text-[#1a1a2e] dark:text-foreground">{c.name}</p>
                      <div className="flex items-center gap-3 mt-0.5 text-[12px] text-muted-foreground">
                        <span>GV: {c.teacher}</span>
                        <span>Còn {c.slots} chỗ</span>
                      </div>
                      <p className="text-[12px] text-muted-foreground">{c.schedule}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-[14px] text-muted-foreground text-center py-6">Vui lòng chọn học viên trước</p>
              )}
            </div>

            <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-5">
              <h3 className="text-[15px] font-bold text-[#1a1a2e] dark:text-foreground mb-3 flex items-center gap-2"><span className="w-6 h-6 bg-cyan-500 rounded-full text-white text-[11px] flex items-center justify-center font-bold">3</span>Lý do chuyển lớp</h3>
              <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none resize-none" placeholder="Nhập lý do chuyển lớp (bắt buộc)..." />
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
              <button onClick={handleSubmit} className="w-full mt-3 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-semibold text-[14px] transition-colors flex items-center justify-center gap-2">
                <Repeat className="w-4 h-4" />Xác nhận chuyển lớp
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
                {history.map(h => (
                  <tr key={h.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                    <td className="px-4 py-3.5">
                      <p className="font-semibold">{h.studentName}</p>
                      <p className="text-[11px] font-mono text-muted-foreground">{h.code}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2 text-[13px]">
                        <span className="text-muted-foreground">{h.from}</span>
                        <ArrowRight className="w-3 h-3 text-cyan-500 shrink-0" />
                        <span className="font-semibold text-cyan-600">{h.to}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell text-[13px] text-muted-foreground">{h.reason}</td>
                    <td className="px-4 py-3.5 hidden lg:table-cell text-[13px] text-muted-foreground">{h.date} · {h.approvedBy}</td>
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

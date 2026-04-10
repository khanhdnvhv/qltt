import { useState, useMemo } from "react";
import { useDocumentTitle, useEscapeKey } from "../../utils/hooks";
import { AnimatePresence, motion } from "motion/react";
import {
  UserPlus, Search, ChevronRight, ChevronLeft, Check, X,
  User, BookOpen, CreditCard, Printer, CheckCircle, GraduationCap
} from "lucide-react";
import { toast } from "sonner";
import { useAppData } from "../../context/AppDataContext";

const courses = [
  { id: "C001", name: "Tiếng Anh B1 VSTEP Cấp tốc", fee: 3500000, duration: "3 tháng", slots: 5, startDate: "01/04/2026" },
  { id: "C002", name: "Luyện thi TOEIC 450+", fee: 4200000, duration: "2 tháng", slots: 8, startDate: "15/04/2026" },
  { id: "C003", name: "Tin học Văn phòng IC3", fee: 2800000, duration: "2 tháng", slots: 12, startDate: "01/04/2026" },
  { id: "C004", name: "Lập trình Web Frontend", fee: 8500000, duration: "4 tháng", slots: 3, startDate: "01/05/2026" },
  { id: "C005", name: "Tiếng Nhật JLPT N4", fee: 4800000, duration: "4 tháng", slots: 10, startDate: "15/04/2026" },
  { id: "C006", name: "Kỹ thuật Hàn Điện Cơ bản", fee: 3200000, duration: "3 tháng", slots: 6, startDate: "01/04/2026" },
  { id: "C007", name: "Kỹ thuật Nấu ăn 3 tháng", fee: 3200000, duration: "3 tháng", slots: 4, startDate: "01/04/2026" },
];

const recentEnrollments = [
  { code: "HV-26-0051", name: "Lê Thị Thu Hương", course: "Tiếng Anh B1 VSTEP Cấp tốc", date: "08/04/2026", fee: "3.500.000đ" },
  { code: "HV-26-0050", name: "Trần Công Minh", course: "Tin học Văn phòng IC3", date: "07/04/2026", fee: "2.800.000đ" },
  { code: "HV-26-0049", name: "Võ Thị Thanh Thúy", course: "Tiếng Nhật JLPT N4", date: "06/04/2026", fee: "4.800.000đ" },
  { code: "HV-26-0048", name: "Nguyễn Đức Hải", course: "Lập trình Web Frontend", date: "05/04/2026", fee: "8.500.000đ" },
];

const steps = ["Thông tin học viên", "Chọn khóa học", "Xác nhận & Thu phí"];

export function AdminStudentEnrollment() {
  useDocumentTitle("Nhập học");
  const { addStudent, addEnrollment, addFeeReceipt, enrollments, students } = useAppData();
  const [step, setStep] = useState(0);
  const [searchExisting, setSearchExisting] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<typeof courses[0] | null>(null);
  const [formData, setFormData] = useState({
    name: "", dob: "", gender: "Nam", phone: "", email: "", address: "", idNumber: "",
    parentName: "", parentPhone: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"Tiền mặt" | "Chuyển khoản">("Tiền mặt");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [newCode] = useState(`HV-26-${Math.floor(Math.random() * 900 + 100)}`);

  const finalAmount = selectedCourse ? selectedCourse.fee - discountAmount : 0;

  const handleNext = () => {
    if (step === 0 && !formData.name) { toast.error("Vui lòng nhập họ tên học viên"); return; }
    if (step === 1 && !selectedCourse) { toast.error("Vui lòng chọn khóa học"); return; }
    setStep(s => s + 1);
  };

  const handleSubmit = () => {
    if (!selectedCourse) return;
    const student = addStudent({
      code: newCode,
      name: formData.name,
      dob: formData.dob || "01/01/2000",
      gender: (formData.gender === "Nam" || formData.gender === "Nữ") ? formData.gender : "Nam",
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      idNumber: formData.idNumber,
      parentName: formData.parentName,
      parentPhone: formData.parentPhone,
      status: "learning",
      programs: [selectedCourse.name],
      avatarColor: "from-blue-600 to-indigo-600",
      progress: 0,
      enrollDate: new Date().toLocaleDateString("vi-VN"),
    });
    addEnrollment({
      studentId: student.id,
      studentCode: student.code,
      studentName: student.name,
      classId: selectedCourse.id,
      classCode: selectedCourse.id,
      courseId: selectedCourse.id,
      courseName: selectedCourse.name,
      teacherName: "—",
      schedule: "—",
      room: "—",
      enrollDate: new Date().toLocaleDateString("vi-VN"),
      startDate: selectedCourse.startDate,
      endDate: "—",
      fee: selectedCourse.fee,
      discountAmount,
      finalFee: finalAmount,
      paymentMethod,
      status: "active",
      progress: 0,
      completedLessons: 0,
      totalLessons: 24,
      attendanceRate: 100,
      color: "from-blue-500 to-indigo-500",
    });
    addFeeReceipt({
      receiptCode: `PT-${new Date().getFullYear()}-${String(enrollments.length + 1).padStart(4, "0")}`,
      studentId: student.id,
      studentCode: student.code,
      studentName: student.name,
      courseId: selectedCourse.id,
      courseName: selectedCourse.name,
      periodName: `Học phí Kỳ 1 - ${selectedCourse.name}`,
      amount: selectedCourse.fee,
      discountAmount,
      finalAmount,
      paymentMethod,
      paidDate: new Date().toLocaleDateString("vi-VN"),
      receivedBy: "Admin",
      note: "",
      status: "confirmed",
    });
    setSubmitted(true);
    toast.success(`Nhập học thành công! Mã học viên: ${newCode}`);
  };

  if (submitted) {
    return (
      <div className="pb-10 flex items-center justify-center min-h-[60vh]">
        <motion.div className="text-center max-w-md" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 20 }}>
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-[24px] font-extrabold text-[#1a1a2e] dark:text-foreground mb-2">Nhập học thành công!</h2>
          <p className="text-muted-foreground mb-1">Học viên: <strong className="text-[#1a1a2e] dark:text-foreground">{formData.name}</strong></p>
          <p className="text-muted-foreground mb-1">Mã học viên: <strong className="font-mono text-blue-600">{newCode}</strong></p>
          <p className="text-muted-foreground mb-5">Khóa học: <strong className="text-[#1a1a2e] dark:text-foreground">{selectedCourse?.name}</strong></p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => toast.success("Đã gửi lệnh in phiếu xác nhận")} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-[14px]"><Printer className="w-4 h-4" />In phiếu</button>
            <button onClick={() => { setStep(0); setSubmitted(false); setFormData({ name: "", dob: "", gender: "Nam", phone: "", email: "", address: "", idNumber: "", parentName: "", parentPhone: "" }); setSelectedCourse(null); }} className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 text-[#1a1a2e] dark:text-foreground rounded-xl font-semibold text-[14px]"><UserPlus className="w-4 h-4" />Nhập học mới</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="relative mb-6 p-6 rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: "28px 28px" }} />
        <div className="relative z-10">
          <p className="text-blue-200 text-[13px] font-semibold mb-1 uppercase">Học viên & Tuyển sinh</p>
          <h1 className="text-[24px] font-extrabold">Nhập học</h1>
          <p className="text-blue-100/70 text-[14px] mt-1">Đăng ký học viên mới vào khóa học — 3 bước đơn giản</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Wizard */}
        <div className="lg:col-span-2">
          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-6">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0 transition-all ${i < step ? "bg-emerald-500 text-white" : i === step ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-white/10 text-muted-foreground"}`}>
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-[13px] font-semibold hidden sm:block ${i === step ? "text-[#1a1a2e] dark:text-foreground" : "text-muted-foreground"}`}>{s}</span>
                {i < steps.length - 1 && <div className={`flex-1 h-px ml-auto ${i < step ? "bg-emerald-500" : "bg-gray-200 dark:bg-white/10"}`} />}
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-6">
            {/* Step 0: Student Info */}
            {step === 0 && (
              <div className="space-y-4">
                <h3 className="text-[17px] font-bold text-[#1a1a2e] dark:text-foreground mb-4">Thông tin Học viên</h3>
                <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-3 mb-4">
                  <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input value={searchExisting} onChange={e => setSearchExisting(e.target.value)} placeholder="Tìm học viên đã có trong hệ thống..." className="w-full pl-9 pr-3 py-2 rounded-lg border border-blue-200 dark:border-blue-500/30 bg-white dark:bg-background text-[14px] outline-none" /></div>
                  <p className="text-[11px] text-blue-600 mt-1.5">Nếu học viên đã có trong hệ thống, chọn để tự động điền thông tin</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1"><label className="block text-[13px] font-semibold mb-1.5">Họ và tên *</label><input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" placeholder="Nguyễn Văn A" /></div>
                  <div><label className="block text-[13px] font-semibold mb-1.5">Ngày sinh</label><input type="date" value={formData.dob} onChange={e => setFormData(f => ({ ...f, dob: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" /></div>
                  <div><label className="block text-[13px] font-semibold mb-1.5">Giới tính</label><select value={formData.gender} onChange={e => setFormData(f => ({ ...f, gender: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none"><option>Nam</option><option>Nữ</option><option>Khác</option></select></div>
                  <div><label className="block text-[13px] font-semibold mb-1.5">Số điện thoại *</label><input value={formData.phone} onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" placeholder="09xxxxxxxx" /></div>
                  <div><label className="block text-[13px] font-semibold mb-1.5">Email</label><input value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" placeholder="email@example.com" /></div>
                  <div className="col-span-2"><label className="block text-[13px] font-semibold mb-1.5">CCCD / CMND</label><input value={formData.idNumber} onChange={e => setFormData(f => ({ ...f, idNumber: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" placeholder="Số CCCD/CMND" /></div>
                  <div className="col-span-2"><label className="block text-[13px] font-semibold mb-1.5">Địa chỉ</label><input value={formData.address} onChange={e => setFormData(f => ({ ...f, address: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" /></div>
                  <div><label className="block text-[13px] font-semibold mb-1.5">Phụ huynh (nếu dưới 18)</label><input value={formData.parentName} onChange={e => setFormData(f => ({ ...f, parentName: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" placeholder="Tên phụ huynh" /></div>
                  <div><label className="block text-[13px] font-semibold mb-1.5">SĐT phụ huynh</label><input value={formData.parentPhone} onChange={e => setFormData(f => ({ ...f, parentPhone: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" /></div>
                </div>
              </div>
            )}

            {/* Step 1: Select Course */}
            {step === 1 && (
              <div>
                <h3 className="text-[17px] font-bold text-[#1a1a2e] dark:text-foreground mb-4">Chọn Khóa học</h3>
                <div className="space-y-3">
                  {courses.map(c => (
                    <button key={c.id} onClick={() => setSelectedCourse(c)} className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedCourse?.id === c.id ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10" : "border-gray-200 dark:border-border hover:border-blue-300 dark:hover:border-blue-500/30"}`}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedCourse?.id === c.id ? "border-blue-500 bg-blue-500" : "border-gray-300"}`}>
                            {selectedCourse?.id === c.id && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div>
                            <p className="font-semibold text-[#1a1a2e] dark:text-foreground">{c.name}</p>
                            <p className="text-[12px] text-muted-foreground">Khai giảng: {c.startDate} · {c.duration} · Còn {c.slots} chỗ</p>
                          </div>
                        </div>
                        <p className="font-bold text-blue-600 shrink-0">{c.fee.toLocaleString("vi-VN")}đ</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Confirm & Pay */}
            {step === 2 && selectedCourse && (
              <div className="space-y-4">
                <h3 className="text-[17px] font-bold text-[#1a1a2e] dark:text-foreground mb-4">Xác nhận & Thu học phí</h3>
                <div className="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-[14px]"><span className="text-muted-foreground">Học viên</span><span className="font-semibold">{formData.name}</span></div>
                  <div className="flex justify-between text-[14px]"><span className="text-muted-foreground">SĐT</span><span>{formData.phone}</span></div>
                  <div className="flex justify-between text-[14px]"><span className="text-muted-foreground">Khóa học</span><span className="font-semibold text-right max-w-[60%]">{selectedCourse.name}</span></div>
                  <div className="flex justify-between text-[14px]"><span className="text-muted-foreground">Khai giảng</span><span>{selectedCourse.startDate}</span></div>
                  <div className="flex justify-between text-[14px]"><span className="text-muted-foreground">Học phí</span><span className="font-semibold">{selectedCourse.fee.toLocaleString("vi-VN")}đ</span></div>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold mb-1.5">Miễn giảm (nếu có)</label>
                  <input type="number" value={discountAmount} onChange={e => setDiscountAmount(+e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none" />
                </div>
                <div className="bg-blue-600 rounded-xl p-4 text-white text-center">
                  <p className="text-blue-200 text-[12px] font-semibold mb-1">TỔNG THU</p>
                  <p className="text-[32px] font-extrabold">{finalAmount.toLocaleString("vi-VN")}đ</p>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold mb-2">Phương thức thanh toán</label>
                  <div className="flex gap-3">
                    {(["Tiền mặt", "Chuyển khoản"] as const).map(m => (
                      <button key={m} onClick={() => setPaymentMethod(m)} className={`flex-1 py-2.5 rounded-xl border text-[14px] font-semibold transition-all ${paymentMethod === m ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400" : "border-gray-200 dark:border-border text-muted-foreground"}`}>{m}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-border">
              {step > 0 && <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border text-[14px] font-semibold hover:bg-gray-50 dark:hover:bg-white/5"><ChevronLeft className="w-4 h-4" />Quay lại</button>}
              <div className="flex-1" />
              {step < steps.length - 1 ? (
                <button onClick={handleNext} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[14px] font-semibold">Tiếp theo<ChevronRight className="w-4 h-4" /></button>
              ) : (
                <button onClick={handleSubmit} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[14px] font-semibold"><CheckCircle className="w-4 h-4" />Hoàn tất nhập học</button>
              )}
            </div>
          </div>
        </div>

        {/* Recent sidebar */}
        <div>
          <h3 className="text-[15px] font-bold text-[#1a1a2e] dark:text-foreground mb-3">Nhập học gần đây</h3>
          <div className="space-y-2">
            {enrollments.slice(0, 6).map(e => (
              <div key={e.id} className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0">{e.studentName.charAt(0)}</div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[13px] text-[#1a1a2e] dark:text-foreground truncate">{e.studentName}</p>
                    <p className="text-[11px] font-mono text-muted-foreground">{e.studentCode}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{e.courseName}</p>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-[10px] text-muted-foreground">{e.enrollDate}</p>
                      <p className="text-[11px] font-bold text-blue-600">{e.finalFee.toLocaleString("vi-VN")}đ</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

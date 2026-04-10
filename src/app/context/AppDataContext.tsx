/**
 * AppDataContext — Trung tâm lưu trữ localStorage cho toàn hệ thống GDNN-GDTX
 * Tất cả dữ liệu được persist qua localStorage để demo hoàn chỉnh luồng nghiệp vụ.
 */
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AppStudent {
  id: string;
  userId?: string;          // liên kết với auth user (dùng cho cổng HV)
  code: string;             // HV-26-xxxx
  name: string;
  dob: string;
  gender: "Nam" | "Nữ";
  phone: string;
  email: string;
  address: string;
  idNumber: string;
  parentName: string;
  parentPhone: string;
  status: "learning" | "suspended" | "dropped" | "graduated";
  programs: string[];
  avatarColor: string;
  progress: number;
  enrollDate: string;
}

export interface AppEnrollment {
  id: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  classId: string;
  classCode: string;
  courseId: string;
  courseName: string;
  teacherName: string;
  schedule: string;
  room: string;
  enrollDate: string;
  startDate: string;
  endDate: string;
  fee: number;
  discountAmount: number;
  finalFee: number;
  paymentMethod: "Tiền mặt" | "Chuyển khoản";
  status: "active" | "reserve" | "dropout" | "graduated";
  progress: number;
  completedLessons: number;
  totalLessons: number;
  attendanceRate: number;
  color: string;
}

export interface AppClass {
  id: string;
  code: string;
  courseId: string;
  courseName: string;
  teacherId: string;
  teacherName: string;
  room: string;
  roomType: "Lý thuyết" | "Lab" | "Xưởng" | "Online";
  schedule: string;
  scheduleItems: { dayOfWeek: number; startTime: string; endTime: string }[];
  maxStudents: number;
  currentStudents: number;
  startDate: string;
  endDate: string;
  status: "Tuyển sinh" | "Hoạt động" | "Kết thúc" | "Hủy";
  type: "GDTX" | "GDNN" | "NNTH";
  color: string;
}

export interface AppExamPlan {
  id: string;
  code: string;
  name: string;
  courseId: string;
  subject: string;
  type: "Kết thúc khóa" | "Giữa kỳ" | "Sát hạch cấp CC";
  date: string;
  duration: number;
  totalCandidates: number;
  rooms: number;
  status: "Dự thảo" | "Đã duyệt" | "Đang thi" | "Hoàn thành" | "Hủy";
  note: string;
  createdDate: string;
}

export interface AppExamResult {
  id: string;
  examPlanId: string;
  examPlanName: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  seatNo: string;            // số báo danh
  subject: string;
  score: number | null;
  maxScore: number;
  passScore: number;
  status: "pending" | "pass" | "fail" | "appeal";
  examDate: string;
  note: string;
  // Điểm từng kỹ năng (dùng cho biểu đồ StudentResults)
  listening?: number | null;
  reading?: number | null;
  writing?: number | null;
  speaking?: number | null;
}

export interface AppCertificate {
  id: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  courseId: string;
  courseName: string;
  certType: string;
  serialNo: string | null;
  issuedDate: string | null;
  expiryDate: string | null;
  status: "PENDING" | "PRINTED" | "ISSUED";
  score: number;
  examDate: string;
  level: string;
  rank: string;
  issuedBy: string;
  dob: string;
  className: string;
}

export interface AppFeeReceipt {
  id: string;
  receiptCode: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  courseId: string;
  courseName: string;
  periodName: string;
  amount: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: "Tiền mặt" | "Chuyển khoản" | "Ví điện tử";
  paidDate: string;
  receivedBy: string;
  note: string;
  status: "confirmed" | "pending";
}

export interface AppTrainingPlan {
  id: string;
  code: string;
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

export interface AppLecture {
  id: string;
  teacherId: string;
  title: string;
  course: string;
  unit: string;
  fileType: "pdf" | "docx" | "pptx" | "mp4" | "xlsx";
  fileSize: string;
  uploadDate: string;
  downloads: number;
  views: number;
  description: string;
  tags: string[];
}

// ─── New Business Entities ───────────────────────────────────────────────────

export interface AppStudentTransfer {
  id: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  fromClassId: string;
  fromClassName: string;
  toClassId: string;
  toClassName: string;
  reason: string;
  transferDate: string;
  approvedBy: string;
}

export interface AppStudentReserve {
  id: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  courseId: string;
  courseName: string;
  reserveFrom: string;
  reserveTo: string;
  months: number;
  reason: string;
  refundPercent: number;
  resumeDate: string | null;
  approvedBy: string;
  status: "active" | "resumed" | "expired";
}

export interface AppStudentDropout {
  id: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  courseId: string;
  courseName: string;
  enrollDate: string;
  dropoutDate: string;
  completedPercent: number;
  reason: "Tài chính" | "Sức khỏe" | "Việc làm" | "Học không hiệu quả" | "Cá nhân" | "Khác";
  refundAmount: number;
  note: string;
  processedBy: string;
  status: "pending" | "confirmed";
}

export interface AppFeeRefund {
  id: string;
  refundCode: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  reason: "Bảo lưu" | "Thôi học" | "Lỗi hệ thống" | "Khác";
  originalAmount: number;
  refundPercent: number;
  refundAmount: number;
  paymentMethod: "Tiền mặt" | "Chuyển khoản";
  refundDate: string;
  approvedBy: string;
  note: string;
  status: "pending" | "approved" | "paid" | "rejected";
}

export interface AppFeePeriod {
  id: string;
  code: string;
  name: string;
  courseId: string;
  courseName: string;
  startDate: string;
  dueDate: string;
  amount: number;
  totalStudents: number;
  paidCount: number;
  collectedAmount: number;
  paymentMethods: string[];
  status: "draft" | "open" | "overdue" | "closed";
  note: string;
}

export interface AppFeeDiscountPolicy {
  id: string;
  code: string;
  name: string;
  type: "Diện chính sách" | "Học sinh giỏi" | "Anh/chị/em" | "Đặc biệt" | "Nhân viên";
  discountType: "percent" | "fixed";
  discountValue: number;
  appliedCount: number;
  maxApply: number | null;
  validFrom: string;
  validTo: string | null;
  conditions: string;
  status: "active" | "inactive" | "expired";
}

export interface AppFeeDiscountApplication {
  id: string;
  policyId: string;
  policyName: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  approvedBy: string;
  date: string;
}

// ── Certificate Stock ─────────────────────────────────────────────────────────

export interface AppCertStockBatch {
  id: string;
  batchCode: string;          // Mã lô: LS-2026-001
  certType: string;           // Loại chứng chỉ
  centerName: string;         // Trung tâm nhận phôi
  allocated: number;          // Số phôi Sở rót
  receivedDate: string;       // Ngày nhận
  allocatedBy: string;        // Người/phòng ban rót phôi
  status: "pending" | "received" | "reconciled";
  note: string;
}

// ── Inspections ──────────────────────────────────────────────────────────────

export interface AppInspection {
  id: string;
  code: string;               // TT-2026-001
  centerName: string;
  inspectionDate: string;
  type: "Định kỳ" | "Đột xuất" | "Chuyên đề";
  areas: string[];            // Nội dung thanh tra
  leader: string;             // Trưởng đoàn
  teamMembers: string[];
  findings: string;           // Kết quả
  violations: string;         // Vi phạm
  recommendations: string;    // Kiến nghị
  score: number | null;       // 0-100
  status: "planned" | "in_progress" | "completed" | "reported";
  dueDate: string;
  reportDate: string | null;
}

export type AppNotifType = "plan_approved" | "plan_rejected" | "plan_revision" | "system" | "fee" | "student";

export interface AppNotification {
  id: string;
  type: AppNotifType;
  title: string;
  message: string;
  time: string;    // ISO timestamp
  read: boolean;
  link?: string;
  targetRole?: "center" | "department" | "all"; // who should see this
}

// ─── Seed Data ───────────────────────────────────────────────────────────────

const SEED_STUDENTS: AppStudent[] = [
  // Demo student linked to student@gdnn.vn (student-001)
  {
    id: "S-DEMO", userId: "student-001",
    code: "HV-26-0050", name: "Nguyễn Thị Hương", dob: "20/03/2005",
    gender: "Nữ", phone: "0945678901", email: "student@gdnn.vn",
    address: "123 Lê Lợi, TP. Vinh, Nghệ An", idNumber: "001205012345",
    parentName: "Nguyễn Văn Quang", parentPhone: "0912345600",
    status: "learning", programs: ["Tiếng Anh B1 VSTEP", "Tin học IC3"],
    avatarColor: "from-pink-500 to-rose-500", progress: 68, enrollDate: "06/01/2026",
  },
  {
    id: "S001", code: "HV-26-0001", name: "Nguyễn Trung Tín", dob: "15/04/2005",
    gender: "Nam", phone: "0901234567", email: "tin.nguyen@example.com",
    address: "45 Nguyễn Du, TP. Vinh", idNumber: "001205011001",
    parentName: "Nguyễn Văn Mạnh", parentPhone: "0901234500",
    status: "learning", programs: ["Tiếng Anh B1 VSTEP", "Tin học Cơ bản"],
    avatarColor: "from-blue-600 to-indigo-600", progress: 68, enrollDate: "05/01/2026",
  },
  {
    id: "S002", code: "HV-26-0002", name: "Trần Mai Anh", dob: "22/08/2007",
    gender: "Nữ", phone: "0912345678", email: "anh.tran@example.com",
    address: "78 Trần Phú, TP. Vinh", idNumber: "001207011002",
    parentName: "Trần Văn Đức", parentPhone: "0912345600",
    status: "learning", programs: ["Lớp 10 GDTX"],
    avatarColor: "from-pink-500 to-rose-500", progress: 35, enrollDate: "07/01/2026",
  },
  {
    id: "S003", code: "HV-26-0003", name: "Lý Gia Hân", dob: "11/11/2006",
    gender: "Nữ", phone: "0923456789", email: "han.ly@example.com",
    address: "12 Lý Thường Kiệt, TP. Vinh", idNumber: "001206011003",
    parentName: "Lý Văn Hùng", parentPhone: "0923456700",
    status: "suspended", programs: ["Kỹ thuật Nấu ăn 3 Tháng"],
    avatarColor: "from-amber-500 to-orange-500", progress: 12, enrollDate: "08/01/2026",
  },
  {
    id: "S004", code: "HV-26-0004", name: "Phạm Bình Minh", dob: "30/01/2003",
    gender: "Nam", phone: "0934567890", email: "minh.pham@example.com",
    address: "56 Phan Bội Châu, TP. Vinh", idNumber: "001203011004",
    parentName: "Phạm Quang Hải", parentPhone: "0934567800",
    status: "dropped", programs: ["Hàn Điện Cơ bản"],
    avatarColor: "from-red-500 to-rose-600", progress: 50, enrollDate: "09/01/2026",
  },
  {
    id: "S005", code: "HV-25-0992", name: "Hoàng Thanh Thảo", dob: "05/09/2001",
    gender: "Nữ", phone: "0945678901", email: "thao.hoang@example.com",
    address: "99 Hùng Vương, TP. Vinh", idNumber: "001201011005",
    parentName: "", parentPhone: "",
    status: "graduated", programs: ["Tiếng Anh TOEIC Cấp tốc"],
    avatarColor: "from-emerald-500 to-teal-500", progress: 100, enrollDate: "03/09/2025",
  },
  {
    id: "S006", code: "HV-26-0012", name: "Lê Minh Trí", dob: "19/02/2004",
    gender: "Nam", phone: "0956789012", email: "tri.le@example.com",
    address: "34 Quang Trung, TP. Vinh", idNumber: "001204011006",
    parentName: "Lê Văn Bảo", parentPhone: "0956789000",
    status: "learning", programs: ["Lập trình Web Frontend", "Tiếng Nhật N4"],
    avatarColor: "from-cyan-500 to-blue-500", progress: 82, enrollDate: "11/01/2026",
  },
  {
    id: "S007", code: "HV-26-0015", name: "Đỗ Xuân Trường", dob: "10/10/2006",
    gender: "Nam", phone: "0967890123", email: "truong.do@example.com",
    address: "67 Đinh Tiên Hoàng, TP. Vinh", idNumber: "001206011007",
    parentName: "Đỗ Văn Năm", parentPhone: "0967890100",
    status: "learning", programs: ["Thiết kế Đồ họa Cơ bản"],
    avatarColor: "from-violet-500 to-purple-600", progress: 24, enrollDate: "12/01/2026",
  },
  {
    id: "S008", code: "HV-25-0811", name: "Vũ Ngọc Trâm", dob: "04/07/2002",
    gender: "Nữ", phone: "0978901234", email: "tram.vu@example.com",
    address: "88 Mai Hắc Đế, TP. Vinh", idNumber: "001202011008",
    parentName: "", parentPhone: "",
    status: "graduated", programs: ["Kế toán Thực hành"],
    avatarColor: "from-teal-400 to-emerald-500", progress: 100, enrollDate: "15/08/2025",
  },
];

const SEED_CLASSES: AppClass[] = [
  {
    id: "CL001", code: "TA-B1-K26", courseId: "C001", courseName: "Tiếng Anh B1 VSTEP Cấp tốc",
    teacherId: "T-DEMO", teacherName: "GV. Nguyễn Thị Lan",
    room: "Phòng A101", roomType: "Lý thuyết",
    schedule: "T2, T4, T6 — Ca Tối (18:00–20:30)",
    scheduleItems: [
      { dayOfWeek: 1, startTime: "18:00", endTime: "20:30" },
      { dayOfWeek: 3, startTime: "18:00", endTime: "20:30" },
      { dayOfWeek: 5, startTime: "18:00", endTime: "20:30" },
    ],
    maxStudents: 30, currentStudents: 22,
    startDate: "06/01/2026", endDate: "30/06/2026",
    status: "Hoạt động", type: "GDTX", color: "#f26522",
  },
  {
    id: "CL002", code: "IC3-K18", courseId: "C003", courseName: "Tin học Văn phòng IC3",
    teacherId: "T-DEMO", teacherName: "GV. Trần Văn Nam",
    room: "Phòng máy B2", roomType: "Lab",
    schedule: "T3, T5 — Buổi chiều (13:30–15:30)",
    scheduleItems: [
      { dayOfWeek: 2, startTime: "13:30", endTime: "15:30" },
      { dayOfWeek: 4, startTime: "13:30", endTime: "15:30" },
    ],
    maxStudents: 25, currentStudents: 18,
    startDate: "08/01/2026", endDate: "31/05/2026",
    status: "Hoạt động", type: "NNTH", color: "#10b981",
  },
  {
    id: "CL003", code: "HD-CB-K12", courseId: "C004", courseName: "Kỹ thuật Hàn Điện Cơ bản",
    teacherId: "teacher-001", teacherName: "GV. Trương Văn Nam",
    room: "Xưởng A1", roomType: "Xưởng",
    schedule: "T2, T4 — Buổi sáng (07:30–11:30)",
    scheduleItems: [
      { dayOfWeek: 1, startTime: "07:30", endTime: "11:30" },
      { dayOfWeek: 3, startTime: "07:30", endTime: "11:30" },
    ],
    maxStudents: 20, currentStudents: 15,
    startDate: "10/01/2026", endDate: "30/04/2026",
    status: "Hoạt động", type: "GDNN", color: "#3b82f6",
  },
  {
    id: "CL004", code: "DD-ND-K05", courseId: "C005", courseName: "Điện dân dụng Nâng cao",
    teacherId: "teacher-001", teacherName: "GV. Trương Văn Nam",
    room: "Xưởng A3", roomType: "Xưởng",
    schedule: "T3, T5 — Buổi sáng (07:30–11:30)",
    scheduleItems: [
      { dayOfWeek: 2, startTime: "07:30", endTime: "11:30" },
      { dayOfWeek: 4, startTime: "07:30", endTime: "11:30" },
    ],
    maxStudents: 20, currentStudents: 12,
    startDate: "10/01/2026", endDate: "30/04/2026",
    status: "Hoạt động", type: "GDNN", color: "#8b5cf6",
  },
  {
    id: "CL005", code: "TOEIC-K27", courseId: "C002", courseName: "Luyện thi TOEIC 450+",
    teacherId: "T-DEMO", teacherName: "GV. Nguyễn Thị Lan",
    room: "Phòng A102", roomType: "Lý thuyết",
    schedule: "T7, CN — Buổi sáng (08:00–11:00)",
    scheduleItems: [
      { dayOfWeek: 6, startTime: "08:00", endTime: "11:00" },
      { dayOfWeek: 0, startTime: "08:00", endTime: "11:00" },
    ],
    maxStudents: 30, currentStudents: 28,
    startDate: "15/04/2026", endDate: "15/06/2026",
    status: "Tuyển sinh", type: "GDTX", color: "#ec4899",
  },
];

const SEED_ENROLLMENTS: AppEnrollment[] = [
  // 3 enrollments for demo student (student-001 → S-DEMO)
  {
    id: "EN-D01", studentId: "S-DEMO", studentCode: "HV-26-0050", studentName: "Nguyễn Thị Hương",
    classId: "CL001", classCode: "TA-B1-K26", courseId: "C001", courseName: "Tiếng Anh B1 VSTEP Cấp tốc",
    teacherName: "GV. Nguyễn Thị Lan", schedule: "T2, T4, T6 — Ca Tối (18:00–20:30)",
    room: "Phòng A101", enrollDate: "06/01/2026", startDate: "06/01/2026", endDate: "30/06/2026",
    fee: 3500000, discountAmount: 0, finalFee: 3500000, paymentMethod: "Tiền mặt",
    status: "active", progress: 68, completedLessons: 17, totalLessons: 25, attendanceRate: 94,
    color: "#f26522",
  },
  {
    id: "EN-D02", studentId: "S-DEMO", studentCode: "HV-26-0050", studentName: "Nguyễn Thị Hương",
    classId: "CL002", classCode: "IC3-K18", courseId: "C003", courseName: "Tin học Văn phòng IC3",
    teacherName: "GV. Trần Văn Nam", schedule: "T3, T5 — Buổi chiều (13:30–15:30)",
    room: "Phòng máy B2", enrollDate: "08/01/2026", startDate: "08/01/2026", endDate: "31/05/2026",
    fee: 2800000, discountAmount: 0, finalFee: 2800000, paymentMethod: "Chuyển khoản",
    status: "active", progress: 45, completedLessons: 9, totalLessons: 20, attendanceRate: 88,
    color: "#10b981",
  },
  {
    id: "EN-D03", studentId: "S-DEMO", studentCode: "HV-26-0050", studentName: "Nguyễn Thị Hương",
    classId: "CL003", classCode: "HD-CB-K12", courseId: "C004", courseName: "Kỹ thuật Hàn Điện Cơ bản",
    teacherName: "GV. Trương Văn Nam", schedule: "T2, T4 — Buổi sáng (07:30–11:30)",
    room: "Xưởng A1", enrollDate: "10/01/2026", startDate: "10/01/2026", endDate: "30/04/2026",
    fee: 3200000, discountAmount: 0, finalFee: 3200000, paymentMethod: "Tiền mặt",
    status: "active", progress: 22, completedLessons: 5, totalLessons: 22, attendanceRate: 80,
    color: "#3b82f6",
  },
  // Other enrollments
  { id: "EN-001", studentId: "S001", studentCode: "HV-26-0001", studentName: "Nguyễn Trung Tín",
    classId: "CL001", classCode: "TA-B1-K26", courseId: "C001", courseName: "Tiếng Anh B1 VSTEP Cấp tốc",
    teacherName: "GV. Nguyễn Thị Lan", schedule: "T2, T4, T6 — Ca Tối (18:00–20:30)",
    room: "Phòng A101", enrollDate: "05/01/2026", startDate: "06/01/2026", endDate: "30/06/2026",
    fee: 3500000, discountAmount: 700000, finalFee: 2800000, paymentMethod: "Chuyển khoản",
    status: "active", progress: 68, completedLessons: 17, totalLessons: 25, attendanceRate: 96,
    color: "#f26522",
  },
  { id: "EN-002", studentId: "S002", studentCode: "HV-26-0002", studentName: "Trần Mai Anh",
    classId: "CL002", classCode: "IC3-K18", courseId: "C003", courseName: "Tin học Văn phòng IC3",
    teacherName: "GV. Trần Văn Nam", schedule: "T3, T5 — Buổi chiều (13:30–15:30)",
    room: "Phòng máy B2", enrollDate: "07/01/2026", startDate: "08/01/2026", endDate: "31/05/2026",
    fee: 2800000, discountAmount: 0, finalFee: 2800000, paymentMethod: "Tiền mặt",
    status: "active", progress: 35, completedLessons: 7, totalLessons: 20, attendanceRate: 85,
    color: "#10b981",
  },
];

const SEED_EXAM_RESULTS: AppExamResult[] = [
  // Results for demo student (S-DEMO)
  {
    id: "ER-D01", examPlanId: "EP001", examPlanName: "Thi giữa kỳ VSTEP B1",
    studentId: "S-DEMO", studentCode: "HV-26-0050", studentName: "Nguyễn Thị Hương",
    seatNo: "SBD-D01", subject: "Tiếng Anh B1 VSTEP",
    score: 6.25, maxScore: 10, passScore: 5,
    status: "pass", examDate: "01/02/2026", note: "",
    listening: 6.5, reading: 6.0, writing: 5.5, speaking: 7.0,
  },
  {
    id: "ER-D02", examPlanId: "EP001", examPlanName: "Thi thử VSTEP B1 lần 1",
    studentId: "S-DEMO", studentCode: "HV-26-0050", studentName: "Nguyễn Thị Hương",
    seatNo: "SBD-D01", subject: "Tiếng Anh B1 VSTEP",
    score: 6.75, maxScore: 10, passScore: 5,
    status: "pass", examDate: "15/03/2026", note: "",
    listening: 7.0, reading: 6.5, writing: 6.0, speaking: 7.5,
  },
  {
    id: "ER-D03", examPlanId: "EP002", examPlanName: "Kỳ thi Tin học IC3",
    studentId: "S-DEMO", studentCode: "HV-26-0050", studentName: "Nguyễn Thị Hương",
    seatNo: "SBD-D02", subject: "Tin học IC3",
    score: 8.5, maxScore: 10, passScore: 7,
    status: "pass", examDate: "20/02/2026", note: "",
    listening: null, reading: null, writing: null, speaking: null,
  },
  // Results for other students (dùng cho AdminExamResults)
  { id: "ER-001", examPlanId: "EP001", examPlanName: "Thi giữa kỳ VSTEP B1",
    studentId: "S001", studentCode: "HV-26-0001", studentName: "Nguyễn Trung Tín",
    seatNo: "SBD-001", subject: "Tiếng Anh", score: 6.5, maxScore: 10, passScore: 5,
    status: "pass", examDate: "15/03/2026", note: "",
    listening: 7.0, reading: 6.0, writing: 5.5, speaking: 7.5,
  },
  { id: "ER-002", examPlanId: "EP001", examPlanName: "Thi giữa kỳ VSTEP B1",
    studentId: "S002", studentCode: "HV-26-0002", studentName: "Trần Mai Anh",
    seatNo: "SBD-002", subject: "Tiếng Anh", score: 4.0, maxScore: 10, passScore: 5,
    status: "fail", examDate: "15/03/2026", note: "",
    listening: 4.5, reading: 3.5, writing: 4.0, speaking: 4.0,
  },
  { id: "ER-003", examPlanId: "EP002", examPlanName: "Kỳ thi Tin học IC3",
    studentId: "S003", studentCode: "HV-26-0003", studentName: "Lý Gia Hân",
    seatNo: "SBD-011", subject: "Tin học", score: 8.5, maxScore: 10, passScore: 7,
    status: "pass", examDate: "20/02/2026", note: "",
    listening: null, reading: null, writing: null, speaking: null,
  },
  { id: "ER-004", examPlanId: "EP002", examPlanName: "Kỳ thi Tin học IC3",
    studentId: "S004", studentCode: "HV-26-0004", studentName: "Phạm Bình Minh",
    seatNo: "SBD-012", subject: "Tin học", score: 6.5, maxScore: 10, passScore: 7,
    status: "fail", examDate: "20/02/2026", note: "",
    listening: null, reading: null, writing: null, speaking: null,
  },
  { id: "ER-005", examPlanId: "EP001", examPlanName: "Thi giữa kỳ VSTEP B1",
    studentId: "S005", studentCode: "HV-25-0992", studentName: "Hoàng Thanh Thảo",
    seatNo: "SBD-005", subject: "Tiếng Anh", score: 8.0, maxScore: 10, passScore: 5,
    status: "pass", examDate: "15/03/2026", note: "",
    listening: 8.5, reading: 7.5, writing: 7.5, speaking: 8.5,
  },
];

const SEED_CERTIFICATES: AppCertificate[] = [
  // Certificates for demo student (S-DEMO)
  {
    id: "CERT-D01", studentId: "S-DEMO", studentCode: "HV-26-0050", studentName: "Nguyễn Thị Hương",
    courseId: "C003", courseName: "Tin học Văn phòng IC3",
    certType: "GCN Tin học CB", serialNo: "CC-IC3-2026-050",
    issuedDate: "20/03/2026", expiryDate: null,
    status: "ISSUED", score: 8.5, examDate: "20/02/2026",
    level: "Cơ bản", rank: "Giỏi", issuedBy: "Trung tâm GDNN-GDTX", dob: "20/03/2005",
    className: "IC3-K18",
  },
  {
    id: "CERT-D02", studentId: "S-DEMO", studentCode: "HV-26-0050", studentName: "Nguyễn Thị Hương",
    courseId: "C001", courseName: "Tiếng Anh B1 VSTEP Cấp tốc",
    certType: "Chứng chỉ VSTEP B1", serialNo: null,
    issuedDate: null, expiryDate: null,
    status: "PENDING", score: 6.75, examDate: "15/03/2026",
    level: "B1", rank: "Khá", issuedBy: "Trung tâm GDNN-GDTX", dob: "20/03/2005",
    className: "TA-B1-K26",
  },
  // Certificates for other students
  { id: "CERT-001", studentId: "S001", studentCode: "HV-26-0001", studentName: "Nguyễn Trung Tín",
    courseId: "C001", courseName: "Tiếng Anh B1 VSTEP", certType: "Chứng chỉ VSTEP B1",
    serialNo: "CC-VSTEP-2026-001", issuedDate: "01/04/2026", expiryDate: "01/04/2028",
    status: "ISSUED", score: 6.5, examDate: "15/03/2026",
    level: "B1", rank: "Trung bình khá", issuedBy: "Trung tâm GDNN-GDTX", dob: "15/04/2005",
    className: "TA-B1-K26",
  },
  { id: "CERT-002", studentId: "S005", studentCode: "HV-25-0992", studentName: "Hoàng Thanh Thảo",
    courseId: "C002", courseName: "Luyện thi TOEIC 450+", certType: "Chứng chỉ TOEIC 600",
    serialNo: "CC-TOEIC-2026-002", issuedDate: "20/01/2026", expiryDate: "20/01/2028",
    status: "ISSUED", score: 8.0, examDate: "15/12/2025",
    level: "Upper Intermediate", rank: "Giỏi", issuedBy: "Trung tâm GDNN-GDTX", dob: "05/09/2001",
    className: "TOEIC-K25",
  },
  { id: "CERT-003", studentId: "S006", studentCode: "HV-26-0012", studentName: "Lê Minh Trí",
    courseId: "C003", courseName: "Tin học Văn phòng IC3", certType: "GCN Tin học CB",
    serialNo: null, issuedDate: null, expiryDate: null,
    status: "PRINTED", score: 8.5, examDate: "20/02/2026",
    level: "Cơ bản", rank: "Giỏi", issuedBy: "Trung tâm GDNN-GDTX", dob: "19/02/2004",
    className: "IC3-K18",
  },
  { id: "CERT-004", studentId: "S008", studentCode: "HV-25-0811", studentName: "Vũ Ngọc Trâm",
    courseId: "C006", courseName: "Kế toán Thực hành", certType: "GCN Kế toán",
    serialNo: null, issuedDate: null, expiryDate: null,
    status: "PENDING", score: 9.0, examDate: "10/12/2025",
    level: "Sơ cấp", rank: "Xuất sắc", issuedBy: "Trung tâm GDNN-GDTX", dob: "04/07/2002",
    className: "KT-K08",
  },
];

const SEED_FEE_RECEIPTS: AppFeeReceipt[] = [
  { id: "FP-D01", receiptCode: "PT-26-0050", studentId: "S-DEMO", studentCode: "HV-26-0050",
    studentName: "Nguyễn Thị Hương", courseId: "C001", courseName: "Tiếng Anh B1 VSTEP Cấp tốc",
    periodName: "Học phí Kỳ 1 - Tiếng Anh B1", amount: 3500000, discountAmount: 0, finalAmount: 3500000,
    paymentMethod: "Tiền mặt", paidDate: "06/01/2026", receivedBy: "Nguyễn Thị Thanh", note: "", status: "confirmed" },
  { id: "FP-D02", receiptCode: "PT-26-0051", studentId: "S-DEMO", studentCode: "HV-26-0050",
    studentName: "Nguyễn Thị Hương", courseId: "C003", courseName: "Tin học Văn phòng IC3",
    periodName: "Học phí Kỳ 1 - Tin học IC3", amount: 2800000, discountAmount: 0, finalAmount: 2800000,
    paymentMethod: "Chuyển khoản", paidDate: "08/01/2026", receivedBy: "Phạm Văn Hùng", note: "", status: "confirmed" },
  { id: "FP-001", receiptCode: "PT-26-0001", studentId: "S001", studentCode: "HV-26-0001",
    studentName: "Nguyễn Trung Tín", courseId: "C001", courseName: "Tiếng Anh B1 VSTEP",
    periodName: "Học phí Kỳ 1 - Tiếng Anh B1", amount: 3500000, discountAmount: 700000, finalAmount: 2800000,
    paymentMethod: "Chuyển khoản", paidDate: "08/01/2026", receivedBy: "Nguyễn Thị Thanh", note: "Giảm 20% học sinh giỏi", status: "confirmed" },
  { id: "FP-002", receiptCode: "PT-26-0002", studentId: "S002", studentCode: "HV-26-0002",
    studentName: "Trần Mai Anh", courseId: "C003", courseName: "Tin học IC3",
    periodName: "Học phí Kỳ 1 - Tin học", amount: 2800000, discountAmount: 0, finalAmount: 2800000,
    paymentMethod: "Tiền mặt", paidDate: "09/01/2026", receivedBy: "Phạm Văn Hùng", note: "", status: "confirmed" },
  { id: "FP-003", receiptCode: "PT-26-0003", studentId: "S003", studentCode: "HV-26-0003",
    studentName: "Lý Gia Hân", courseId: "C007", courseName: "Kỹ thuật Nấu ăn",
    periodName: "Học phí Kỳ 1 - Nấu ăn", amount: 3200000, discountAmount: 1600000, finalAmount: 1600000,
    paymentMethod: "Tiền mặt", paidDate: "10/01/2026", receivedBy: "Nguyễn Thị Thanh", note: "Diện hộ nghèo - giảm 50%", status: "confirmed" },
  { id: "FP-004", receiptCode: "PT-26-0004", studentId: "S004", studentCode: "HV-26-0004",
    studentName: "Phạm Bình Minh", courseId: "C004", courseName: "Hàn Điện Cơ bản",
    periodName: "Học phí Kỳ 1 - Hàn Điện", amount: 3200000, discountAmount: 0, finalAmount: 3200000,
    paymentMethod: "Chuyển khoản", paidDate: "11/01/2026", receivedBy: "Nguyễn Thị Thanh", note: "", status: "confirmed" },
  { id: "FP-005", receiptCode: "PT-26-0005", studentId: "S006", studentCode: "HV-26-0012",
    studentName: "Lê Minh Trí", courseId: "C006", courseName: "Lập trình Web Frontend",
    periodName: "Học phí Kỳ 1 - Web Frontend", amount: 8500000, discountAmount: 500000, finalAmount: 8000000,
    paymentMethod: "Ví điện tử" as any, paidDate: "12/01/2026", receivedBy: "Nguyễn Thị Thanh", note: "Ưu đãi khai trương", status: "confirmed" },
];

const SEED_TRAINING_PLANS: AppTrainingPlan[] = [
  { id: "KH-26-001", code: "KH-26-001", title: "Kế hoạch Chỉ tiêu Ngoại ngữ Q1/2026",
    centerName: "Trung tâm Ngoại ngữ VUS", type: "Ngôn ngữ", term: "Q1/2026",
    expectedStudents: 1500, submittedAt: "05/01/2026", status: "approved",
    files: ["To_trinh_Q1_2026.pdf"],
    history: [
      { action: "Tạo mới bản nháp", time: "03/01/2026 08:00", actor: "Trung tâm" },
      { action: "Đã nộp trình Sở", time: "05/01/2026 14:00", actor: "Giám đốc TT" },
      { action: "Sở GD đã phê duyệt", time: "06/01/2026 09:00", actor: "Sở GD&ĐT" },
    ],
    comments: "" },
  { id: "KH-26-002", code: "KH-26-002", title: "Kế hoạch Phổ cập THCS & THPT",
    centerName: "TT GDNN-GDTX Quận 1", type: "GDTX", term: "Năm 2026",
    expectedStudents: 850, submittedAt: "10/01/2026", status: "pending",
    files: ["De_an_tuyen_sinh_2026.pdf", "Danh_sach_dinh_kem.xlsx"],
    history: [
      { action: "Tạo mới bản nháp", time: "08/01/2026 09:00", actor: "Giáo vụ TT" },
      { action: "Đã trình Sở chờ thẩm định", time: "10/01/2026 14:30", actor: "Giám đốc TT Q1" },
    ],
    comments: "" },
  { id: "KH-26-003", code: "KH-26-003", title: "Đề án Mở lớp Sửa chữa Ô Tô",
    centerName: "TT GDNN-GDTX Tân Bình", type: "GDNN", term: "Năm 2026",
    expectedStudents: 200, submittedAt: "12/01/2026", status: "revision",
    files: ["De_cuong_Mon_Hoc.pdf"],
    history: [
      { action: "Tạo mới bản nháp", time: "10/01/2026 09:00", actor: "Giáo vụ TT" },
      { action: "Đã trình Sở", time: "12/01/2026 10:00", actor: "Giám đốc TT" },
      { action: "Sở yêu cầu bổ sung CSVC", time: "13/01/2026 10:15", actor: "Phòng Chuyên môn" },
    ],
    comments: "Đề nghị Trung tâm Tân Bình cập nhật lại danh sách Xưởng thực hành máy đáp ứng đủ quy chuẩn đào tạo Nghề hạng 2." },
  { id: "KH-26-004", code: "KH-26-004", title: "Kế hoạch Bồi dưỡng CNTT Cơ bản",
    centerName: "Trung tâm Tin Học Hùng Vương", type: "Tin học", term: "Q1/2026",
    expectedStudents: 350, submittedAt: null, status: "draft",
    files: [],
    history: [{ action: "Tạo mới bản nháp", time: "15/01/2026 08:00", actor: "Giáo vụ TT" }],
    comments: "" },
  { id: "KH-26-005", code: "KH-26-005", title: "Kế hoạch Liên kết đào tạo Tiếng Nhật",
    centerName: "Ngoại ngữ Sakura", type: "Ngôn ngữ", term: "Năm 2026",
    expectedStudents: 400, submittedAt: "16/01/2026", status: "pending",
    files: ["Hop_dong_lien_ket.pdf"],
    history: [
      { action: "Tạo mới bản nháp", time: "14/01/2026 09:00", actor: "Giáo vụ TT" },
      { action: "Gửi phê duyệt", time: "16/01/2026 11:20", actor: "Trung tâm" },
    ],
    comments: "" },
];

const SEED_LECTURES: AppLecture[] = [
  { id: "LEC-001", teacherId: "teacher-001", title: "Kỹ thuật Hàn MIG/MAG Cơ bản", course: "Kỹ thuật Hàn Điện", unit: "Chương 3", fileType: "pdf", fileSize: "4.2 MB", uploadDate: "05/04/2026", downloads: 24, views: 31, description: "Tổng quan về hàn MIG/MAG, các thông số cơ bản", tags: ["Hàn MIG", "Thực hành"] },
  { id: "LEC-002", teacherId: "teacher-001", title: "Điện dân dụng - Mạch điện một chiều", course: "Điện dân dụng Nâng cao", unit: "Chương 1", fileType: "pptx", fileSize: "8.7 MB", uploadDate: "03/04/2026", downloads: 18, views: 25, description: "Lý thuyết mạch điện DC, định luật Ohm", tags: ["Điện DC", "Lý thuyết"] },
  { id: "LEC-003", teacherId: "teacher-001", title: "An toàn lao động trong xưởng hàn", course: "Kỹ thuật Hàn Điện", unit: "Chương 1", fileType: "pdf", fileSize: "2.1 MB", uploadDate: "01/04/2026", downloads: 32, views: 45, description: "Quy định an toàn, trang bị bảo hộ", tags: ["An toàn", "Bắt buộc"] },
  { id: "LEC-004", teacherId: "teacher-001", title: "Video thực hành: Hàn điện hồ quang", course: "Kỹ thuật Hàn Điện", unit: "Chương 2", fileType: "mp4", fileSize: "125 MB", uploadDate: "28/03/2026", downloads: 15, views: 42, description: "Video hướng dẫn kỹ thuật hàn hồ quang tay", tags: ["Video", "Thực hành"] },
  { id: "LEC-005", teacherId: "teacher-001", title: "Bài kiểm tra cuối chương 2", course: "Điện dân dụng Nâng cao", unit: "Chương 2", fileType: "docx", fileSize: "0.8 MB", uploadDate: "25/03/2026", downloads: 22, views: 28, description: "Đề kiểm tra lý thuyết và bài tập áp dụng", tags: ["Kiểm tra", "Bài tập"] },
];

const SEED_TRANSFERS: AppStudentTransfer[] = [
  { id: "TR-001", studentId: "S005", studentCode: "HV-25-0992", studentName: "Hoàng Thanh Thảo", fromClassId: "CL001", fromClassName: "TOEIC - Ca Sáng T2T4T6", toClassId: "CL005", toClassName: "TOEIC - Ca Cuối tuần", reason: "Bận học chính quy buổi sáng", transferDate: "10/02/2026", approvedBy: "Nguyễn Thị Thanh" },
  { id: "TR-002", studentId: "S004", studentCode: "HV-26-0004", studentName: "Phạm Bình Minh", fromClassId: "CL003", fromClassName: "Hàn Điện - Ca Sáng", toClassId: "CL004", toClassName: "Hàn Điện - Ca Chiều", reason: "Đổi ca làm việc", transferDate: "05/02/2026", approvedBy: "Nguyễn Thị Thanh" },
  { id: "TR-003", studentId: "S008", studentCode: "HV-25-0811", studentName: "Vũ Ngọc Trâm", fromClassId: "CL002", fromClassName: "Kế toán - Ca Chiều", toClassId: "CL002", toClassName: "Kế toán - Ca Tối", reason: "Xung đột lịch công việc", transferDate: "15/02/2026", approvedBy: "Giám đốc TT" },
];

const SEED_RESERVES: AppStudentReserve[] = [
  { id: "RV-001", studentId: "S003", studentCode: "HV-26-0003", studentName: "Lý Gia Hân", courseId: "C007", courseName: "Kỹ thuật Nấu ăn 3 tháng", reserveFrom: "01/02/2026", reserveTo: "01/08/2026", months: 6, reason: "Bệnh dài hạn — có giấy chứng nhận bệnh viện", refundPercent: 70, resumeDate: null, approvedBy: "Nguyễn Thị Thanh", status: "active" },
  { id: "RV-002", studentId: "S006", studentCode: "HV-26-0012", studentName: "Lê Minh Trí", courseId: "C002", courseName: "Luyện thi TOEIC 450+", reserveFrom: "15/02/2026", reserveTo: "15/08/2026", months: 6, reason: "Đi nghĩa vụ quân sự", refundPercent: 80, resumeDate: null, approvedBy: "Giám đốc TT", status: "active" },
  { id: "RV-003", studentId: "S001", studentCode: "HV-26-0001", studentName: "Nguyễn Trung Tín", courseId: "C001", courseName: "Tiếng Anh B1 VSTEP", reserveFrom: "01/09/2025", reserveTo: "01/03/2026", months: 6, reason: "Sinh con — nghỉ thai sản", refundPercent: 80, resumeDate: "05/03/2026", approvedBy: "Nguyễn Thị Thanh", status: "resumed" },
  { id: "RV-004", studentId: "S007", studentCode: "HV-26-0015", studentName: "Đỗ Xuân Trường", courseId: "C006", courseName: "Lập trình Web Frontend", reserveFrom: "01/06/2025", reserveTo: "01/12/2025", months: 6, reason: "Đi công tác nước ngoài", refundPercent: 70, resumeDate: null, approvedBy: "Giám đốc TT", status: "expired" },
];

const SEED_DROPOUTS: AppStudentDropout[] = [
  { id: "DO-001", studentId: "S004", studentCode: "HV-26-0004", studentName: "Phạm Bình Minh", courseId: "C004", courseName: "Kỹ thuật Hàn Điện Cơ bản", enrollDate: "10/01/2026", dropoutDate: "25/02/2026", completedPercent: 50, reason: "Việc làm", refundAmount: 1600000, note: "Được nhận vào làm không thể thu xếp lịch học", processedBy: "Giám đốc TT", status: "confirmed" },
  { id: "DO-002", studentId: "S007", studentCode: "HV-26-0015", studentName: "Đỗ Xuân Trường", courseId: "C003", courseName: "Tin học IC3", enrollDate: "05/01/2026", dropoutDate: "15/03/2026", completedPercent: 75, reason: "Học không hiệu quả", refundAmount: 0, note: "Đã học >75% — không hoàn phí theo quy định", processedBy: "Nguyễn Thị Thanh", status: "confirmed" },
  { id: "DO-003", studentId: "S002", studentCode: "HV-26-0002", studentName: "Trần Mai Anh", courseId: "C008", courseName: "Tiếng Nhật N4", enrollDate: "15/03/2026", dropoutDate: "10/04/2026", completedPercent: 15, reason: "Tài chính", refundAmount: 4080000, note: "Học được 3 buổi — hoàn 85% học phí", processedBy: "", status: "pending" },
];

const SEED_FEE_REFUNDS: AppFeeRefund[] = [
  { id: "FR-001", refundCode: "PT-R-001", studentId: "S003", studentCode: "HV-26-0003", studentName: "Lý Gia Hân", reason: "Bảo lưu", originalAmount: 3200000, refundPercent: 70, refundAmount: 2240000, paymentMethod: "Tiền mặt", refundDate: "20/02/2026", approvedBy: "Nguyễn Thị Thanh", note: "Bảo lưu 6 tháng theo chính sách TT", status: "paid" },
  { id: "FR-002", refundCode: "PT-R-002", studentId: "S004", studentCode: "HV-26-0004", studentName: "Phạm Bình Minh", reason: "Thôi học", originalAmount: 3200000, refundPercent: 50, refundAmount: 1600000, paymentMethod: "Chuyển khoản", refundDate: "25/02/2026", approvedBy: "Giám đốc TT", note: "Thôi học sau tuần 6 — hoàn 50% học phí còn lại", status: "paid" },
  { id: "FR-003", refundCode: "PT-R-003", studentId: "S006", studentCode: "HV-26-0012", studentName: "Lê Minh Trí", reason: "Bảo lưu", originalAmount: 4200000, refundPercent: 80, refundAmount: 3360000, paymentMethod: "Chuyển khoản", refundDate: "01/03/2026", approvedBy: "Nguyễn Thị Thanh", note: "Bảo lưu lý do bệnh — có giấy tờ y tế", status: "approved" },
  { id: "FR-004", refundCode: "PT-R-004", studentId: "S002", studentCode: "HV-26-0002", studentName: "Trần Mai Anh", reason: "Thôi học", originalAmount: 4800000, refundPercent: 30, refundAmount: 1440000, paymentMethod: "Tiền mặt", refundDate: "10/03/2026", approvedBy: "", note: "Thôi học tuần thứ 10 — hoàn theo bậc thang", status: "pending" },
  { id: "FR-005", refundCode: "PT-R-005", studentId: "S001", studentCode: "HV-26-0001", studentName: "Nguyễn Trung Tín", reason: "Lỗi hệ thống", originalAmount: 2800000, refundPercent: 100, refundAmount: 2800000, paymentMethod: "Chuyển khoản", refundDate: "12/03/2026", approvedBy: "Phạm Văn Hùng", note: "Thu trùng 2 lần — hoàn toàn bộ lần thu 2", status: "approved" },
];

const SEED_FEE_PERIODS: AppFeePeriod[] = [
  { id: "FPD-001", code: "HP-26-001", name: "Học phí Kỳ 1 - Tiếng Anh B1", courseId: "C001", courseName: "Tiếng Anh B1 VSTEP", startDate: "05/01/2026", dueDate: "20/01/2026", amount: 3500000, totalStudents: 85, paidCount: 78, collectedAmount: 273000000, paymentMethods: ["Tiền mặt", "Chuyển khoản"], status: "closed", note: "" },
  { id: "FPD-002", code: "HP-26-002", name: "Học phí Kỳ 1 - Tin học IC3", courseId: "C003", courseName: "Tin học Văn phòng IC3", startDate: "05/01/2026", dueDate: "20/01/2026", amount: 2800000, totalStudents: 60, paidCount: 55, collectedAmount: 154000000, paymentMethods: ["Tiền mặt", "Chuyển khoản"], status: "closed", note: "" },
  { id: "FPD-003", code: "HP-26-003", name: "Học phí Tháng 2 - TOEIC 450", courseId: "C002", courseName: "Luyện thi TOEIC 450+", startDate: "01/02/2026", dueDate: "15/02/2026", amount: 4200000, totalStudents: 45, paidCount: 42, collectedAmount: 176400000, paymentMethods: ["Chuyển khoản"], status: "closed", note: "" },
  { id: "FPD-004", code: "HP-26-004", name: "Học phí Kỳ 2 - Tiếng Anh B1", courseId: "C001", courseName: "Tiếng Anh B1 VSTEP", startDate: "01/03/2026", dueDate: "15/03/2026", amount: 3500000, totalStudents: 85, paidCount: 71, collectedAmount: 248500000, paymentMethods: ["Tiền mặt", "Chuyển khoản", "Ví điện tử"], status: "open", note: "" },
  { id: "FPD-005", code: "HP-26-005", name: "Học phí Kỳ 1 - Lập trình Web", courseId: "C006", courseName: "Lập trình Web Frontend", startDate: "10/03/2026", dueDate: "25/03/2026", amount: 8500000, totalStudents: 28, paidCount: 18, collectedAmount: 153000000, paymentMethods: ["Chuyển khoản"], status: "open", note: "Khóa mới mở" },
  { id: "FPD-006", code: "HP-26-006", name: "Học phí Kỳ 1 - Hàn Điện", courseId: "C004", courseName: "Kỹ thuật Hàn Điện", startDate: "01/02/2026", dueDate: "15/02/2026", amount: 3200000, totalStudents: 32, paidCount: 25, collectedAmount: 80000000, paymentMethods: ["Tiền mặt"], status: "overdue", note: "7 học viên chưa đóng" },
];

const SEED_FEE_DISCOUNT_POLICIES: AppFeeDiscountPolicy[] = [
  { id: "DP-001", code: "MG-001", name: "Miễn giảm Diện chính sách", type: "Diện chính sách", discountType: "percent", discountValue: 50, appliedCount: 12, maxApply: null, validFrom: "01/01/2026", validTo: null, conditions: "Học sinh hộ nghèo, cận nghèo có xác nhận địa phương", status: "active" },
  { id: "DP-002", code: "MG-002", name: "Ưu đãi Học sinh Giỏi", type: "Học sinh giỏi", discountType: "percent", discountValue: 20, appliedCount: 8, maxApply: 20, validFrom: "01/01/2026", validTo: "31/12/2026", conditions: "Điểm TB >= 8.0 kỳ trước hoặc giấy khen cấp quận/huyện", status: "active" },
  { id: "DP-003", code: "MG-003", name: "Giảm giá Anh/Chị/Em cùng học", type: "Anh/chị/em", discountType: "percent", discountValue: 15, appliedCount: 6, maxApply: null, validFrom: "01/01/2026", validTo: null, conditions: "Từ 2 anh/chị/em đăng ký cùng kỳ tại trung tâm", status: "active" },
  { id: "DP-004", code: "MG-004", name: "Giảm học phí Nhân viên", type: "Nhân viên", discountType: "percent", discountValue: 100, appliedCount: 3, maxApply: 10, validFrom: "01/01/2026", validTo: null, conditions: "Nhân viên chính thức của trung tâm", status: "active" },
  { id: "DP-005", code: "MG-005", name: "Ưu đãi Khai trương Khóa mới", type: "Đặc biệt", discountType: "fixed", discountValue: 500000, appliedCount: 15, maxApply: 30, validFrom: "01/03/2026", validTo: "31/03/2026", conditions: "Đăng ký trong tháng 3/2026 cho khóa Lập trình Web", status: "active" },
  { id: "DP-006", code: "MG-006", name: "Học sinh Xuất sắc 2025", type: "Học sinh giỏi", discountType: "percent", discountValue: 30, appliedCount: 5, maxApply: 10, validFrom: "01/01/2025", validTo: "31/12/2025", conditions: "Top 3 điểm cao nhất của khóa 2025", status: "expired" },
];

const SEED_FEE_DISCOUNT_APPLICATIONS: AppFeeDiscountApplication[] = [
  { id: "DA-001", policyId: "DP-002", policyName: "Ưu đãi Học sinh Giỏi", studentId: "S001", studentCode: "HV-26-0001", studentName: "Nguyễn Trung Tín", originalAmount: 3500000, discountAmount: 700000, finalAmount: 2800000, approvedBy: "Nguyễn Thị Thanh", date: "08/01/2026" },
  { id: "DA-002", policyId: "DP-001", policyName: "Miễn giảm Diện chính sách", studentId: "S003", studentCode: "HV-26-0003", studentName: "Lý Gia Hân", originalAmount: 2800000, discountAmount: 1400000, finalAmount: 1400000, approvedBy: "Nguyễn Thị Thanh", date: "10/01/2026" },
  { id: "DA-003", policyId: "DP-003", policyName: "Giảm giá Anh/Chị/Em cùng học", studentId: "S002", studentCode: "HV-26-0002", studentName: "Trần Mai Anh", originalAmount: 3500000, discountAmount: 525000, finalAmount: 2975000, approvedBy: "Phạm Văn Hùng", date: "12/01/2026" },
  { id: "DA-004", policyId: "DP-004", policyName: "Giảm học phí Nhân viên", studentId: "S005", studentCode: "HV-25-0992", studentName: "Hoàng Thanh Thảo", originalAmount: 4800000, discountAmount: 4800000, finalAmount: 0, approvedBy: "Giám đốc TT", date: "15/01/2026" },
  { id: "DA-005", policyId: "DP-005", policyName: "Ưu đãi Khai trương Khóa mới", studentId: "S006", studentCode: "HV-26-0012", studentName: "Lê Minh Trí", originalAmount: 8500000, discountAmount: 500000, finalAmount: 8000000, approvedBy: "Nguyễn Thị Thanh", date: "10/03/2026" },
];

const SEED_NOTIFICATIONS: AppNotification[] = [
  { id: "NT-001", type: "plan_approved", title: "Kế hoạch được phê duyệt", message: "Kế hoạch KH-26-001 \"Kế hoạch Chỉ tiêu Ngoại ngữ Q1/2026\" đã được Sở GD&ĐT phê duyệt.", time: new Date(Date.now() - 3 * 3600000).toISOString(), read: false, link: "/admin/plans", targetRole: "center" },
  { id: "NT-002", type: "system", title: "Học viên mới đăng ký", message: "Nguyễn Trung Tín vừa ghi danh khóa Tiếng Anh B1 VSTEP Cấp tốc.", time: new Date(Date.now() - 6 * 3600000).toISOString(), read: true, link: "/admin/students", targetRole: "center" },
  { id: "NT-003", type: "fee", title: "Yêu cầu hoàn học phí mới", message: "Học viên Lý Gia Hân gửi yêu cầu hoàn học phí (Bảo lưu) — 2.240.000đ.", time: new Date(Date.now() - 12 * 3600000).toISOString(), read: true, link: "/admin/fees/refunds", targetRole: "center" },
];

const SEED_CERT_STOCK: AppCertStockBatch[] = [
  { id: "CS-001", batchCode: "LS-2026-001", certType: "Chứng chỉ VSTEP B1", centerName: "Trung tâm GDNN-GDTX", allocated: 200, receivedDate: "05/01/2026", allocatedBy: "Phòng GDTX – Sở GD&ĐT", status: "received", note: "" },
  { id: "CS-002", batchCode: "LS-2026-002", certType: "GCN Tin học CB", centerName: "Trung tâm GDNN-GDTX", allocated: 150, receivedDate: "05/01/2026", allocatedBy: "Phòng GDTX – Sở GD&ĐT", status: "received", note: "" },
  { id: "CS-003", batchCode: "LS-2025-012", certType: "Chứng chỉ Hàn Điện", centerName: "Trung tâm GDNN-GDTX", allocated: 100, receivedDate: "10/10/2025", allocatedBy: "Phòng GDNN – Sở GD&ĐT", status: "reconciled", note: "Đã đối soát lô Q4/2025" },
  { id: "CS-004", batchCode: "LS-2026-003", certType: "Chứng chỉ TOEIC", centerName: "Trung tâm Ngoại ngữ VUS", allocated: 120, receivedDate: "08/01/2026", allocatedBy: "Phòng GDTX – Sở GD&ĐT", status: "received", note: "" },
  { id: "CS-005", batchCode: "LS-2026-004", certType: "GCN Điện dân dụng", centerName: "TT GDNN-GDTX Tân Bình", allocated: 80, receivedDate: "12/01/2026", allocatedBy: "Phòng GDNN – Sở GD&ĐT", status: "pending", note: "Đang chờ ký nhận biên bản" },
];

const SEED_INSPECTIONS: AppInspection[] = [
  { id: "TT-001", code: "TT-2026-001", centerName: "Trung tâm Ngoại ngữ VUS", inspectionDate: "15/02/2026", type: "Định kỳ", areas: ["Hồ sơ pháp lý", "Cơ sở vật chất", "Chương trình đào tạo"], leader: "Nguyễn Văn Hùng", teamMembers: ["Trần Thị Lan", "Lê Minh Đức"], findings: "Trung tâm hoạt động đúng quy định, hồ sơ đầy đủ.", violations: "", recommendations: "Cần bổ sung thêm trang thiết bị phòng lab.", score: 88, status: "reported", dueDate: "01/03/2026", reportDate: "25/02/2026" },
  { id: "TT-002", code: "TT-2026-002", centerName: "TT GDNN-GDTX Tân Bình", inspectionDate: "20/03/2026", type: "Đột xuất", areas: ["Giấy phép hoạt động", "Đội ngũ giảng viên"], leader: "Phạm Thị Hoa", teamMembers: ["Nguyễn Minh Trí"], findings: "Phát hiện 1 giảng viên chưa có chứng chỉ nghiệp vụ sư phạm.", violations: "GV Trần Văn B chưa có CC sư phạm theo TT 03/2021.", recommendations: "Yêu cầu hoàn thiện trong 30 ngày.", score: 65, status: "completed", dueDate: "10/04/2026", reportDate: null },
  { id: "TT-003", code: "TT-2026-003", centerName: "Tin học Tiến Đạt", inspectionDate: "05/04/2026", type: "Định kỳ", areas: ["Hồ sơ", "Cơ sở vật chất", "Tài chính"], leader: "Nguyễn Văn Hùng", teamMembers: ["Trần Thị Lan", "Phạm Quốc Bảo"], findings: "", violations: "", recommendations: "", score: null, status: "in_progress", dueDate: "20/04/2026", reportDate: null },
  { id: "TT-004", code: "TT-2026-004", centerName: "Ngoại ngữ Không Gian", inspectionDate: "28/04/2026", type: "Chuyên đề", areas: ["Chương trình đào tạo", "Kết quả thi cấp CC"], leader: "Lê Thị Mai", teamMembers: ["Nguyễn Văn Tuấn"], findings: "", violations: "", recommendations: "", score: null, status: "planned", dueDate: "15/05/2026", reportDate: null },
];

// ─── localStorage helper hook ──────────────────────────────────────────────

const STORE_KEY = "gdnn_app_data_v1";

function loadStore<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const all = JSON.parse(raw);
      if (key in all) return all[key] as T;
    }
  } catch {}
  return fallback;
}

function saveStore(key: string, value: unknown) {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    all[key] = value;
    localStorage.setItem(STORE_KEY, JSON.stringify(all));
  } catch {}
}

function useLS<T>(key: string, seed: T): [T, (v: T | ((p: T) => T)) => void] {
  const [state, setState] = useState<T>(() => loadStore(key, seed));

  const set = useCallback((v: T | ((p: T) => T)) => {
    setState(prev => {
      const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
      saveStore(key, next);
      return next;
    });
  }, [key]);

  return [state, set];
}

// ID generators
let _seq = Date.now();
function genId(prefix: string) { return `${prefix}-${(++_seq).toString(36)}`; }

// ─── Context Definition ───────────────────────────────────────────────────────

interface AppDataCtx {
  students: AppStudent[];
  enrollments: AppEnrollment[];
  classes: AppClass[];
  examResults: AppExamResult[];
  certificates: AppCertificate[];
  feeReceipts: AppFeeReceipt[];
  trainingPlans: AppTrainingPlan[];
  lectures: AppLecture[];

  addStudent: (s: Omit<AppStudent, "id">) => AppStudent;
  updateStudentStatus: (id: string, status: AppStudent["status"]) => void;

  addEnrollment: (e: Omit<AppEnrollment, "id">) => AppEnrollment;
  updateEnrollmentStatus: (id: string, status: AppEnrollment["status"]) => void;

  addClass: (c: Omit<AppClass, "id">) => void;
  updateClass: (id: string, updates: Partial<AppClass>) => void;

  addExamResult: (r: Omit<AppExamResult, "id">) => void;
  updateExamResult: (id: string, updates: Partial<AppExamResult>) => void;

  addCertificate: (c: Omit<AppCertificate, "id">) => void;
  updateCertificateStatus: (id: string, status: AppCertificate["status"], serialNo?: string) => void;

  addFeeReceipt: (r: Omit<AppFeeReceipt, "id">) => AppFeeReceipt;

  addTrainingPlan: (p: Omit<AppTrainingPlan, "id" | "code">) => void;
  updateTrainingPlan: (id: string, updates: Partial<AppTrainingPlan>) => void;

  addLecture: (l: Omit<AppLecture, "id">) => void;
  deleteLecture: (id: string) => void;

  // Helpers dùng cho cổng HV
  getStudentByUserId: (userId: string) => AppStudent | undefined;
  getEnrollmentsByStudentId: (studentId: string) => AppEnrollment[];
  getExamResultsByStudentId: (studentId: string) => AppExamResult[];
  getCertificatesByStudentId: (studentId: string) => AppCertificate[];
  // Helpers dùng cho cổng GV
  getClassesByTeacherId: (teacherId: string) => AppClass[];
  getLecturesByTeacherId: (teacherId: string) => AppLecture[];

  // Student workflow
  studentTransfers: AppStudentTransfer[];
  addStudentTransfer: (t: Omit<AppStudentTransfer, "id">) => AppStudentTransfer;

  reserveRecords: AppStudentReserve[];
  addReserveRecord: (r: Omit<AppStudentReserve, "id">) => AppStudentReserve;
  updateReserveStatus: (id: string, status: AppStudentReserve["status"], resumeDate?: string) => void;

  dropoutRecords: AppStudentDropout[];
  addDropoutRecord: (d: Omit<AppStudentDropout, "id">) => AppStudentDropout;
  confirmDropout: (id: string, processedBy: string) => void;

  // Finance
  feeRefunds: AppFeeRefund[];
  addFeeRefund: (r: Omit<AppFeeRefund, "id">) => AppFeeRefund;
  updateFeeRefundStatus: (id: string, status: AppFeeRefund["status"], approvedBy?: string) => void;

  feePeriods: AppFeePeriod[];
  addFeePeriod: (p: Omit<AppFeePeriod, "id" | "code">) => AppFeePeriod;
  updateFeePeriodStatus: (id: string, status: AppFeePeriod["status"]) => void;

  feeDiscountPolicies: AppFeeDiscountPolicy[];
  addFeeDiscountPolicy: (p: Omit<AppFeeDiscountPolicy, "id" | "code" | "appliedCount">) => void;
  updateFeeDiscountPolicy: (id: string, updates: Partial<AppFeeDiscountPolicy>) => void;

  feeDiscountApplications: AppFeeDiscountApplication[];
  addFeeDiscountApplication: (a: Omit<AppFeeDiscountApplication, "id">) => void;

  // Notifications
  notifications: AppNotification[];
  addNotification: (n: Omit<AppNotification, "id">) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  removeNotification: (id: string) => void;

  // Cert Stock
  certStockBatches: AppCertStockBatch[];
  addCertStockBatch: (b: Omit<AppCertStockBatch, "id">) => AppCertStockBatch;
  updateCertStockBatch: (id: string, updates: Partial<AppCertStockBatch>) => void;

  // Inspections
  inspections: AppInspection[];
  addInspection: (ins: Omit<AppInspection, "id" | "code">) => AppInspection;
  updateInspection: (id: string, updates: Partial<AppInspection>) => void;

  resetDemo: () => void;
}

const AppDataContext = createContext<AppDataCtx | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [students, setStudents]           = useLS<AppStudent[]>("students", SEED_STUDENTS);
  const [enrollments, setEnrollments]     = useLS<AppEnrollment[]>("enrollments", SEED_ENROLLMENTS);
  const [classes, setClasses]             = useLS<AppClass[]>("classes", SEED_CLASSES);
  const [examResults, setExamResults]     = useLS<AppExamResult[]>("examResults", SEED_EXAM_RESULTS);
  const [certificates, setCertificates]   = useLS<AppCertificate[]>("certificates", SEED_CERTIFICATES);
  const [feeReceipts, setFeeReceipts]     = useLS<AppFeeReceipt[]>("feeReceipts", SEED_FEE_RECEIPTS);
  const [trainingPlans, setTrainingPlans] = useLS<AppTrainingPlan[]>("trainingPlans", SEED_TRAINING_PLANS);
  const [lectures, setLectures]           = useLS<AppLecture[]>("lectures", SEED_LECTURES);
  const [studentTransfers, setStudentTransfers] = useLS<AppStudentTransfer[]>("studentTransfers", SEED_TRANSFERS);
  const [reserveRecords, setReserveRecords]     = useLS<AppStudentReserve[]>("reserveRecords", SEED_RESERVES);
  const [dropoutRecords, setDropoutRecords]     = useLS<AppStudentDropout[]>("dropoutRecords", SEED_DROPOUTS);
  const [feeRefunds, setFeeRefunds]             = useLS<AppFeeRefund[]>("feeRefunds", SEED_FEE_REFUNDS);
  const [feePeriods, setFeePeriods]             = useLS<AppFeePeriod[]>("feePeriods", SEED_FEE_PERIODS);
  const [feeDiscountPolicies, setFeeDiscountPolicies]         = useLS<AppFeeDiscountPolicy[]>("feeDiscountPolicies", SEED_FEE_DISCOUNT_POLICIES);
  const [feeDiscountApplications, setFeeDiscountApplications] = useLS<AppFeeDiscountApplication[]>("feeDiscountApplications", SEED_FEE_DISCOUNT_APPLICATIONS);
  const [notifications, setNotifications]                     = useLS<AppNotification[]>("notifications", SEED_NOTIFICATIONS);
  const [certStockBatches, setCertStockBatches]               = useLS<AppCertStockBatch[]>("certStockBatches", SEED_CERT_STOCK);
  const [inspections, setInspections]                         = useLS<AppInspection[]>("inspections", SEED_INSPECTIONS);

  // ── Students ──
  const addStudent = useCallback((s: Omit<AppStudent, "id">): AppStudent => {
    const newS = { ...s, id: genId("S") };
    setStudents(p => [newS, ...p]);
    return newS;
  }, [setStudents]);

  const updateStudentStatus = useCallback((id: string, status: AppStudent["status"]) => {
    setStudents(p => p.map(s => s.id === id ? { ...s, status } : s));
  }, [setStudents]);

  // ── Enrollments ──
  const addEnrollment = useCallback((e: Omit<AppEnrollment, "id">): AppEnrollment => {
    const newE = { ...e, id: genId("EN") };
    setEnrollments(p => [newE, ...p]);
    // Tăng currentStudents trong class
    setClasses(p => p.map(c => c.id === e.classId ? { ...c, currentStudents: c.currentStudents + 1 } : c));
    return newE;
  }, [setEnrollments, setClasses]);

  const updateEnrollmentStatus = useCallback((id: string, status: AppEnrollment["status"]) => {
    setEnrollments(p => p.map(e => e.id === id ? { ...e, status } : e));
  }, [setEnrollments]);

  // ── Classes ──
  const addClass = useCallback((c: Omit<AppClass, "id">) => {
    setClasses(p => [{ ...c, id: genId("CL") }, ...p]);
  }, [setClasses]);

  const updateClass = useCallback((id: string, updates: Partial<AppClass>) => {
    setClasses(p => p.map(c => c.id === id ? { ...c, ...updates } : c));
  }, [setClasses]);

  // ── Exam Results ──
  const addExamResult = useCallback((r: Omit<AppExamResult, "id">) => {
    setExamResults(p => [{ ...r, id: genId("ER") }, ...p]);
  }, [setExamResults]);

  const updateExamResult = useCallback((id: string, updates: Partial<AppExamResult>) => {
    setExamResults(p => p.map(r => r.id === id ? { ...r, ...updates } : r));
  }, [setExamResults]);

  // ── Certificates ──
  const addCertificate = useCallback((c: Omit<AppCertificate, "id">) => {
    setCertificates(p => [{ ...c, id: genId("CERT") }, ...p]);
  }, [setCertificates]);

  const updateCertificateStatus = useCallback((id: string, status: AppCertificate["status"], serialNo?: string) => {
    setCertificates(p => p.map(c => {
      if (c.id !== id) return c;
      const now = new Date().toLocaleDateString("vi-VN");
      return {
        ...c, status,
        ...(status === "PRINTED" && serialNo ? { serialNo } : {}),
        ...(status === "ISSUED" ? { issuedDate: now } : {}),
      };
    }));
  }, [setCertificates]);

  // ── Fee Receipts ──
  const addFeeReceipt = useCallback((r: Omit<AppFeeReceipt, "id">): AppFeeReceipt => {
    const newR = { ...r, id: genId("FP") };
    setFeeReceipts(p => [newR, ...p]);
    return newR;
  }, [setFeeReceipts]);

  // ── Training Plans ──
  const addTrainingPlan = useCallback((p: Omit<AppTrainingPlan, "id" | "code">) => {
    const seq = String(Date.now()).slice(-3);
    const newP = { ...p, id: genId("KH"), code: `KH-26-${seq}` };
    setTrainingPlans(prev => [newP, ...prev]);
  }, [setTrainingPlans]);

  const updateTrainingPlan = useCallback((id: string, updates: Partial<AppTrainingPlan>) => {
    setTrainingPlans(p => {
      const plan = p.find(t => t.id === id);
      if (plan && updates.status && updates.status !== plan.status) {
        const statusMap: Partial<Record<AppTrainingPlan["status"], { type: AppNotifType; title: string; msg: string }>> = {
          approved: { type: "plan_approved", title: "Kế hoạch được phê duyệt", msg: `Kế hoạch "${plan.title}" đã được Sở GD&ĐT phê duyệt.` },
          rejected: { type: "plan_rejected", title: "Kế hoạch bị từ chối", msg: `Kế hoạch "${plan.title}" đã bị Sở GD&ĐT từ chối. Vui lòng xem chi tiết.` },
          revision: { type: "plan_revision", title: "Kế hoạch cần chỉnh sửa", msg: `Kế hoạch "${plan.title}" cần bổ sung/chỉnh sửa theo yêu cầu của Sở GD&ĐT.` },
        };
        const cfg = statusMap[updates.status as keyof typeof statusMap];
        if (cfg) {
          const notif: AppNotification = {
            id: genId("NT"),
            type: cfg.type,
            title: cfg.title,
            message: cfg.msg,
            time: new Date().toISOString(),
            read: false,
            link: "/admin/plans",
            targetRole: "center",
          };
          setNotifications(prev => [notif, ...prev].slice(0, 50));
        }
      }
      return p.map(t => t.id === id ? { ...t, ...updates } : t);
    });
  }, [setTrainingPlans, setNotifications]);

  // ── Notifications ──
  const addNotification = useCallback((n: Omit<AppNotification, "id">) => {
    setNotifications(prev => [{ ...n, id: genId("NT") }, ...prev].slice(0, 50));
  }, [setNotifications]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, [setNotifications]);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, [setNotifications]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, [setNotifications]);

  // ── Cert Stock ──
  const addCertStockBatch = useCallback((b: Omit<AppCertStockBatch, "id">): AppCertStockBatch => {
    const newB = { ...b, id: genId("CS") };
    setCertStockBatches(p => [newB, ...p]);
    return newB;
  }, [setCertStockBatches]);

  const updateCertStockBatch = useCallback((id: string, updates: Partial<AppCertStockBatch>) => {
    setCertStockBatches(p => p.map(b => b.id === id ? { ...b, ...updates } : b));
  }, [setCertStockBatches]);

  // ── Inspections ──
  const addInspection = useCallback((ins: Omit<AppInspection, "id" | "code">): AppInspection => {
    const count = String(Date.now()).slice(-3);
    const newIns = { ...ins, id: genId("TT"), code: `TT-${new Date().getFullYear()}-${count}` };
    setInspections(p => [newIns, ...p]);
    return newIns;
  }, [setInspections]);

  const updateInspection = useCallback((id: string, updates: Partial<AppInspection>) => {
    setInspections(p => p.map(i => i.id === id ? { ...i, ...updates } : i));
  }, [setInspections]);

  // ── Lectures ──
  const addLecture = useCallback((l: Omit<AppLecture, "id">) => {
    setLectures(p => [{ ...l, id: genId("LEC") }, ...p]);
  }, [setLectures]);

  const deleteLecture = useCallback((id: string) => {
    setLectures(p => p.filter(l => l.id !== id));
  }, [setLectures]);

  // ── Student Transfers ──
  const addStudentTransfer = useCallback((t: Omit<AppStudentTransfer, "id">): AppStudentTransfer => {
    const newT = { ...t, id: genId("TR") };
    setStudentTransfers(p => [newT, ...p]);
    // Update enrollment class reference
    setEnrollments(p => p.map(e =>
      e.studentId === t.studentId && e.classId === t.fromClassId
        ? { ...e, classId: t.toClassId, classCode: t.toClassName }
        : e
    ));
    return newT;
  }, [setStudentTransfers, setEnrollments]);

  // ── Reserve Records ──
  const addReserveRecord = useCallback((r: Omit<AppStudentReserve, "id">): AppStudentReserve => {
    const newR = { ...r, id: genId("RV") };
    setReserveRecords(p => [newR, ...p]);
    setStudents(p => p.map(s => s.id === r.studentId ? { ...s, status: "suspended" as const } : s));
    setEnrollments(p => p.map(e => e.studentId === r.studentId && e.classId === r.courseId ? { ...e, status: "reserve" as const } : e));
    return newR;
  }, [setReserveRecords, setStudents, setEnrollments]);

  const updateReserveStatus = useCallback((id: string, status: AppStudentReserve["status"], resumeDate?: string) => {
    setReserveRecords(p => p.map(r => {
      if (r.id !== id) return r;
      if (status === "resumed") {
        // Reactivate student
        setStudents(prev => prev.map(s => s.id === r.studentId ? { ...s, status: "learning" as const } : s));
        setEnrollments(prev => prev.map(e => e.studentId === r.studentId ? { ...e, status: "active" as const } : e));
      }
      return { ...r, status, ...(resumeDate ? { resumeDate } : {}) };
    }));
  }, [setReserveRecords, setStudents, setEnrollments]);

  // ── Dropout Records ──
  const addDropoutRecord = useCallback((d: Omit<AppStudentDropout, "id">): AppStudentDropout => {
    const newD = { ...d, id: genId("DO") };
    setDropoutRecords(p => [newD, ...p]);
    return newD;
  }, [setDropoutRecords]);

  const confirmDropout = useCallback((id: string, processedBy: string) => {
    setDropoutRecords(p => p.map(d => {
      if (d.id !== id) return d;
      setStudents(prev => prev.map(s => s.id === d.studentId ? { ...s, status: "dropped" as const } : s));
      setEnrollments(prev => prev.map(e => e.studentId === d.studentId ? { ...e, status: "dropout" as const } : e));
      return { ...d, status: "confirmed" as const, processedBy };
    }));
  }, [setDropoutRecords, setStudents, setEnrollments]);

  // ── Fee Refunds ──
  const addFeeRefund = useCallback((r: Omit<AppFeeRefund, "id">): AppFeeRefund => {
    const seq = String(feeRefunds.length + 1).padStart(3, "0");
    const newR = { ...r, id: genId("FR"), refundCode: r.refundCode || `PT-R-${seq}` };
    setFeeRefunds(p => [newR, ...p]);
    return newR;
  }, [setFeeRefunds, feeRefunds.length]);

  const updateFeeRefundStatus = useCallback((id: string, status: AppFeeRefund["status"], approvedBy?: string) => {
    setFeeRefunds(p => p.map(r => r.id === id ? { ...r, status, ...(approvedBy ? { approvedBy } : {}) } : r));
  }, [setFeeRefunds]);

  // ── Fee Periods ──
  const addFeePeriod = useCallback((p: Omit<AppFeePeriod, "id" | "code">): AppFeePeriod => {
    const seq = String(feePeriods.length + 1).padStart(3, "0");
    const newP = { ...p, id: genId("FPD"), code: `HP-26-${seq}`, paidCount: 0, collectedAmount: 0 };
    setFeePeriods(prev => [newP, ...prev]);
    return newP;
  }, [setFeePeriods, feePeriods.length]);

  const updateFeePeriodStatus = useCallback((id: string, status: AppFeePeriod["status"]) => {
    setFeePeriods(p => p.map(fp => fp.id === id ? { ...fp, status } : fp));
  }, [setFeePeriods]);

  // ── Fee Discount Policies ──
  const addFeeDiscountPolicy = useCallback((p: Omit<AppFeeDiscountPolicy, "id" | "code" | "appliedCount">) => {
    const seq = String(feeDiscountPolicies.length + 1).padStart(3, "0");
    setFeeDiscountPolicies(prev => [{ ...p, id: genId("DP"), code: `MG-${seq}`, appliedCount: 0 }, ...prev]);
  }, [setFeeDiscountPolicies, feeDiscountPolicies.length]);

  const updateFeeDiscountPolicy = useCallback((id: string, updates: Partial<AppFeeDiscountPolicy>) => {
    setFeeDiscountPolicies(p => p.map(d => d.id === id ? { ...d, ...updates } : d));
  }, [setFeeDiscountPolicies]);

  // ── Fee Discount Applications ──
  const addFeeDiscountApplication = useCallback((a: Omit<AppFeeDiscountApplication, "id">) => {
    setFeeDiscountApplications(prev => [{ ...a, id: genId("DA") }, ...prev]);
    // Increment appliedCount on the policy
    setFeeDiscountPolicies(p => p.map(d => d.id === a.policyId ? { ...d, appliedCount: d.appliedCount + 1 } : d));
  }, [setFeeDiscountApplications, setFeeDiscountPolicies]);

  // ── Helpers ──
  const getStudentByUserId = useCallback((userId: string) => {
    return students.find(s => s.userId === userId);
  }, [students]);

  const getEnrollmentsByStudentId = useCallback((studentId: string) => {
    return enrollments.filter(e => e.studentId === studentId && e.status === "active");
  }, [enrollments]);

  const getExamResultsByStudentId = useCallback((studentId: string) => {
    return examResults.filter(r => r.studentId === studentId);
  }, [examResults]);

  const getCertificatesByStudentId = useCallback((studentId: string) => {
    return certificates.filter(c => c.studentId === studentId);
  }, [certificates]);

  const getClassesByTeacherId = useCallback((teacherId: string) => {
    return classes.filter(c => c.teacherId === teacherId);
  }, [classes]);

  const getLecturesByTeacherId = useCallback((teacherId: string) => {
    return lectures.filter(l => l.teacherId === teacherId);
  }, [lectures]);

  // ── Reset ──
  const resetDemo = useCallback(() => {
    try { localStorage.removeItem(STORE_KEY); } catch {}
    setStudents(SEED_STUDENTS);
    setEnrollments(SEED_ENROLLMENTS);
    setClasses(SEED_CLASSES);
    setExamResults(SEED_EXAM_RESULTS);
    setCertificates(SEED_CERTIFICATES);
    setFeeReceipts(SEED_FEE_RECEIPTS);
    setTrainingPlans(SEED_TRAINING_PLANS);
    setLectures(SEED_LECTURES);
    setStudentTransfers(SEED_TRANSFERS);
    setReserveRecords(SEED_RESERVES);
    setDropoutRecords(SEED_DROPOUTS);
    setFeeRefunds(SEED_FEE_REFUNDS);
    setFeePeriods(SEED_FEE_PERIODS);
    setFeeDiscountPolicies(SEED_FEE_DISCOUNT_POLICIES);
    setFeeDiscountApplications(SEED_FEE_DISCOUNT_APPLICATIONS);
    setNotifications(SEED_NOTIFICATIONS);
    setCertStockBatches(SEED_CERT_STOCK);
    setInspections(SEED_INSPECTIONS);
  }, [setStudents, setEnrollments, setClasses, setExamResults, setCertificates, setFeeReceipts, setTrainingPlans, setLectures, setStudentTransfers, setReserveRecords, setDropoutRecords, setFeeRefunds, setFeePeriods, setFeeDiscountPolicies, setFeeDiscountApplications, setNotifications, setCertStockBatches, setInspections]);

  return (
    <AppDataContext.Provider value={{
      students, enrollments, classes, examResults, certificates, feeReceipts, trainingPlans, lectures,
      addStudent, updateStudentStatus,
      addEnrollment, updateEnrollmentStatus,
      addClass, updateClass,
      addExamResult, updateExamResult,
      addCertificate, updateCertificateStatus,
      addFeeReceipt,
      addTrainingPlan, updateTrainingPlan,
      addLecture, deleteLecture,
      studentTransfers, addStudentTransfer,
      reserveRecords, addReserveRecord, updateReserveStatus,
      dropoutRecords, addDropoutRecord, confirmDropout,
      feeRefunds, addFeeRefund, updateFeeRefundStatus,
      feePeriods, addFeePeriod, updateFeePeriodStatus,
      feeDiscountPolicies, addFeeDiscountPolicy, updateFeeDiscountPolicy,
      feeDiscountApplications, addFeeDiscountApplication,
      notifications, addNotification, markNotificationRead, markAllNotificationsRead, removeNotification,
      certStockBatches, addCertStockBatch, updateCertStockBatch,
      inspections, addInspection, updateInspection,
      getStudentByUserId, getEnrollmentsByStudentId, getExamResultsByStudentId,
      getCertificatesByStudentId, getClassesByTeacherId, getLecturesByTeacherId,
      resetDemo,
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}

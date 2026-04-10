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

// ── Center (Trung tâm) ────────────────────────────────────────────────────────
export interface AppCenter {
  id: string;
  code: string;             // TT-001
  name: string;             // Tên đầy đủ
  shortName: string;        // Tên viết tắt
  type: "GDNN-GDTX" | "GDNN" | "GDTX" | "Ngoại ngữ" | "Tin học" | "Dạy nghề";
  address: string;
  phone: string;
  email: string;
  director: string;         // Giám đốc/Hiệu trưởng
  licenseNo: string;        // Số giấy phép HĐGD
  licenseDate: string;      // Ngày cấp phép
  licenseExpiry: string | null; // Ngày hết hạn
  establishedDate: string;
  studentCapacity: number;  // Sức chứa học viên
  currentStudents: number;
  teacherCount: number;
  classroomCount: number;
  status: "active" | "suspended" | "revoked";
  rating: number | null;    // Xếp loại 1-5 từ thanh tra gần nhất
  lastInspectionDate: string | null;
  lastInspectionScore: number | null;
  managerId: string | null; // userId của center account
  district: string;         // Huyện/Thị xã/TP thuộc Nghệ An
  note: string;
}

export type AppNotifType = "plan_approved" | "plan_rejected" | "plan_revision" | "system" | "fee" | "student";

// ── Business result wrapper ───────────────────────────────────────────────────
export type BizResult<T = void> = { ok: true; data: T } | { ok: false; error: string };

// ── Audit log ─────────────────────────────────────────────────────────────────
export interface AppAuditLog {
  id: string;
  time: string; // ISO
  actor: string;
  action: string;
  entity: "enrollment" | "certificate" | "training_plan" | "fee_receipt" | "student" | "class" | "dropout" | "transfer" | "inspection";
  entityId: string;
  detail: string;
}

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
  // ── Sprint 1 — mở rộng danh sách học viên ──────────────────────────────────
  { id: "S009", code: "HV-26-0021", name: "Nguyễn Văn An", dob: "25/03/2006",
    gender: "Nam", phone: "0901112233", email: "an.nguyen26@example.com",
    address: "15 Trường Thi, TP. Vinh, Nghệ An", idNumber: "001206021009",
    parentName: "Nguyễn Đức Long", parentPhone: "0901110000",
    status: "learning", programs: ["Tiếng Anh Giao tiếp"],
    avatarColor: "from-sky-500 to-cyan-500", progress: 55, enrollDate: "06/01/2026" },
  { id: "S010", code: "HV-26-0022", name: "Trần Thị Bích", dob: "14/05/2009",
    gender: "Nữ", phone: "0912223344", email: "bich.tran26@example.com",
    address: "32 Lê Mao, TP. Vinh, Nghệ An", idNumber: "001209021010",
    parentName: "Trần Văn Bình", parentPhone: "0912220000",
    status: "learning", programs: ["Lớp 10 GDTX"],
    avatarColor: "from-rose-400 to-pink-500", progress: 40, enrollDate: "07/01/2026" },
  { id: "S011", code: "HV-26-0023", name: "Phạm Minh Cường", dob: "08/11/2003",
    gender: "Nam", phone: "0923334455", email: "cuong.pham26@example.com",
    address: "89 Nguyễn Văn Cừ, TP. Vinh, Nghệ An", idNumber: "001203021011",
    parentName: "Phạm Đức Cần", parentPhone: "0923330000",
    status: "learning", programs: ["Lập trình Web Frontend"],
    avatarColor: "from-indigo-500 to-blue-600", progress: 72, enrollDate: "10/01/2026" },
  { id: "S012", code: "HV-26-0024", name: "Lê Thị Dung", dob: "19/07/2001",
    gender: "Nữ", phone: "0934445566", email: "dung.le26@example.com",
    address: "5 Minh Khai, TX. Thái Hòa, Nghệ An", idNumber: "001201021012",
    parentName: "Lê Văn Dũng", parentPhone: "0934440000",
    status: "learning", programs: ["Kế toán Thực hành"],
    avatarColor: "from-amber-400 to-yellow-500", progress: 60, enrollDate: "11/01/2026" },
  { id: "S013", code: "HV-26-0025", name: "Hoàng Văn Em", dob: "02/09/2004",
    gender: "Nam", phone: "0945556677", email: "em.hoang26@example.com",
    address: "77 Phan Đình Phùng, TP. Vinh, Nghệ An", idNumber: "001204021013",
    parentName: "Hoàng Văn Đào", parentPhone: "0945550000",
    status: "learning", programs: ["Tiếng Nhật N4"],
    avatarColor: "from-red-400 to-rose-500", progress: 35, enrollDate: "12/01/2026" },
  { id: "S014", code: "HV-26-0026", name: "Ngô Thị Phương", dob: "30/01/2007",
    gender: "Nữ", phone: "0956667788", email: "phuong.ngo26@example.com",
    address: "22 Đặng Thái Thân, Huyện Diễn Châu, Nghệ An", idNumber: "001207021014",
    parentName: "Ngô Văn Phú", parentPhone: "0956660000",
    status: "learning", programs: ["May Công nghiệp"],
    avatarColor: "from-fuchsia-400 to-purple-500", progress: 48, enrollDate: "13/01/2026" },
  { id: "S015", code: "HV-26-0027", name: "Đặng Văn Giang", dob: "11/12/2005",
    gender: "Nam", phone: "0967778899", email: "giang.dang26@example.com",
    address: "40 Lý Tự Trọng, TP. Vinh, Nghệ An", idNumber: "001205021015",
    parentName: "Đặng Quốc Giao", parentPhone: "0967770000",
    status: "learning", programs: ["Kỹ thuật Hàn Điện Cơ bản"],
    avatarColor: "from-orange-400 to-amber-500", progress: 65, enrollDate: "14/01/2026" },
  { id: "S016", code: "HV-26-0028", name: "Bùi Thị Hà", dob: "08/04/2008",
    gender: "Nữ", phone: "0978889900", email: "ha.bui26@example.com",
    address: "60 Ngô Thị Nhậm, Huyện Nghi Lộc, Nghệ An", idNumber: "001208021016",
    parentName: "Bùi Văn Hào", parentPhone: "0978880000",
    status: "learning", programs: ["Tin học Văn phòng IC3"],
    avatarColor: "from-teal-500 to-green-500", progress: 30, enrollDate: "15/01/2026" },
  { id: "S017", code: "HV-26-0029", name: "Vũ Minh Hùng", dob: "23/06/2002",
    gender: "Nam", phone: "0989990011", email: "hung.vu26@example.com",
    address: "18 Nguyễn Thái Học, TX. Thái Hòa, Nghệ An", idNumber: "001202021017",
    parentName: "Vũ Văn Hải", parentPhone: "0989990000",
    status: "learning", programs: ["Điện dân dụng Nâng cao"],
    avatarColor: "from-cyan-600 to-blue-700", progress: 80, enrollDate: "16/01/2026" },
  { id: "S018", code: "HV-26-0030", name: "Phan Thị Yến", dob: "05/02/2005",
    gender: "Nữ", phone: "0990001122", email: "yen.phan26@example.com",
    address: "31 Hoàng Văn Thụ, Huyện Yên Thành, Nghệ An", idNumber: "001205021018",
    parentName: "Phan Văn Yên", parentPhone: "0990000000",
    status: "learning", programs: ["Tiếng Anh B1 VSTEP Cấp tốc"],
    avatarColor: "from-pink-400 to-rose-400", progress: 50, enrollDate: "17/01/2026" },
  { id: "S019", code: "HV-26-0031", name: "Nguyễn Thị Khánh", dob: "17/10/2003",
    gender: "Nữ", phone: "0901233221", email: "khanh.nguyen26@example.com",
    address: "50 Trần Hưng Đạo, TP. Vinh, Nghệ An", idNumber: "001203021019",
    parentName: "Nguyễn Văn Khải", parentPhone: "0901230000",
    status: "learning", programs: ["Luyện thi TOEIC 450+"],
    avatarColor: "from-violet-400 to-indigo-500", progress: 45, enrollDate: "18/01/2026" },
  { id: "S020", code: "HV-26-0032", name: "Trần Văn Lâm", dob: "29/08/2006",
    gender: "Nam", phone: "0912344332", email: "lam.tran26@example.com",
    address: "9 Lê Duẩn, Huyện Quỳnh Lưu, Nghệ An", idNumber: "001206021020",
    parentName: "Trần Văn Liêm", parentPhone: "0912340000",
    status: "learning", programs: ["Kỹ thuật Nấu ăn 3 Tháng"],
    avatarColor: "from-lime-500 to-green-600", progress: 62, enrollDate: "20/01/2026" },
  { id: "S021", code: "HV-26-0033", name: "Lý Thị Mỹ", dob: "11/11/2007",
    gender: "Nữ", phone: "0923455443", email: "my.ly26@example.com",
    address: "45 Đào Tấn, TP. Vinh, Nghệ An", idNumber: "001207021021",
    parentName: "Lý Văn Mạnh", parentPhone: "0923450000",
    status: "learning", programs: ["Lớp 11 GDTX"],
    avatarColor: "from-pink-500 to-fuchsia-500", progress: 38, enrollDate: "21/01/2026" },
  { id: "S022", code: "HV-26-0034", name: "Phạm Văn Nam", dob: "04/03/2004",
    gender: "Nam", phone: "0934566554", email: "nam.pham26@example.com",
    address: "67 Quang Trung, Thị xã Cửa Lò, Nghệ An", idNumber: "001204021022",
    parentName: "Phạm Quốc Nẫm", parentPhone: "0934560000",
    status: "learning", programs: ["Thiết kế Đồ họa Cơ bản"],
    avatarColor: "from-purple-400 to-violet-500", progress: 25, enrollDate: "22/01/2026" },
  { id: "S023", code: "HV-26-0035", name: "Lê Minh Ngọc", dob: "20/12/2005",
    gender: "Nam", phone: "0945677665", email: "ngoc.le26@example.com",
    address: "88 Lê Văn Hưu, TP. Vinh, Nghệ An", idNumber: "001205021023",
    parentName: "Lê Văn Nghĩa", parentPhone: "0945670000",
    status: "learning", programs: ["Tiếng Anh Giao tiếp"],
    avatarColor: "from-blue-400 to-sky-500", progress: 58, enrollDate: "23/01/2026" },
  { id: "S024", code: "HV-26-0036", name: "Hoàng Thị Oanh", dob: "16/06/2004",
    gender: "Nữ", phone: "0956788776", email: "oanh.hoang26@example.com",
    address: "13 Phạm Hồng Thái, Huyện Nghi Lộc, Nghệ An", idNumber: "001204021024",
    parentName: "Hoàng Văn Ổn", parentPhone: "0956780000",
    status: "suspended", programs: ["Tiếng Nhật N4"],
    avatarColor: "from-amber-500 to-orange-600", progress: 20, enrollDate: "05/01/2026" },
  { id: "S025", code: "HV-26-0037", name: "Đỗ Văn Phong", dob: "09/04/2002",
    gender: "Nam", phone: "0967899887", email: "phong.do26@example.com",
    address: "55 Điện Biên, TX. Thái Hòa, Nghệ An", idNumber: "001202021025",
    parentName: "Đỗ Quang Phú", parentPhone: "0967890000",
    status: "suspended", programs: ["Kế toán Thực hành"],
    avatarColor: "from-slate-400 to-gray-500", progress: 15, enrollDate: "06/01/2026" },
  { id: "S026", code: "HV-26-0038", name: "Bùi Thị Quỳnh", dob: "28/07/2005",
    gender: "Nữ", phone: "0978900998", email: "quynh.bui26@example.com",
    address: "7 Nguyễn Trãi, TP. Vinh, Nghệ An", idNumber: "001205021026",
    parentName: "Bùi Văn Quảng", parentPhone: "0978900000",
    status: "suspended", programs: ["Lập trình Web Frontend"],
    avatarColor: "from-rose-500 to-red-600", progress: 10, enrollDate: "07/01/2026" },
  { id: "S027", code: "HV-26-0039", name: "Vũ Văn Sơn", dob: "03/01/2006",
    gender: "Nam", phone: "0980011109", email: "son.vu26@example.com",
    address: "44 Chu Văn An, Huyện Diễn Châu, Nghệ An", idNumber: "001206021027",
    parentName: "Vũ Quốc Sáng", parentPhone: "0980010000",
    status: "suspended", programs: ["Tin học Văn phòng IC3"],
    avatarColor: "from-emerald-400 to-teal-500", progress: 8, enrollDate: "08/01/2026" },
  { id: "S028", code: "HV-26-0040", name: "Phan Minh Thành", dob: "17/09/2003",
    gender: "Nam", phone: "0901122210", email: "thanh.phan26@example.com",
    address: "20 Trần Phú, TP. Vinh, Nghệ An", idNumber: "001203021028",
    parentName: "Phan Văn Thắng", parentPhone: "0901120000",
    status: "dropped", programs: ["Điện dân dụng Nâng cao"],
    avatarColor: "from-red-600 to-rose-700", progress: 30, enrollDate: "10/01/2026" },
  { id: "S029", code: "HV-26-0041", name: "Nguyễn Thị Uyên", dob: "25/11/2007",
    gender: "Nữ", phone: "0912233321", email: "uyen.nguyen26@example.com",
    address: "91 Hồ Tùng Mậu, Huyện Quỳnh Lưu, Nghệ An", idNumber: "001207021029",
    parentName: "Nguyễn Văn Uy", parentPhone: "0912230000",
    status: "dropped", programs: ["May Công nghiệp"],
    avatarColor: "from-pink-600 to-fuchsia-600", progress: 22, enrollDate: "11/01/2026" },
  { id: "S030", code: "HV-26-0042", name: "Trần Văn Vinh", dob: "06/03/2005",
    gender: "Nam", phone: "0923344432", email: "vinh.tran26@example.com",
    address: "36 Nguyễn Công Trứ, Huyện Yên Thành, Nghệ An", idNumber: "001205021030",
    parentName: "Trần Quang Việt", parentPhone: "0923340000",
    status: "dropped", programs: ["Kỹ thuật Nấu ăn 3 Tháng"],
    avatarColor: "from-orange-600 to-red-600", progress: 18, enrollDate: "12/01/2026" },
  { id: "S031", code: "HV-25-1001", name: "Lê Thị Xuân", dob: "14/08/2003",
    gender: "Nữ", phone: "0934455543", email: "xuan.le25@example.com",
    address: "28 Kim Đồng, TP. Vinh, Nghệ An", idNumber: "001203021031",
    parentName: "Lê Văn Xuân", parentPhone: "0934450000",
    status: "dropped", programs: ["Tiếng Anh B1 VSTEP Cấp tốc"],
    avatarColor: "from-yellow-500 to-amber-600", progress: 45, enrollDate: "05/09/2025" },
  { id: "S032", code: "HV-25-0900", name: "Phạm Quang Yên", dob: "22/04/2001",
    gender: "Nam", phone: "0945566654", email: "yen.pham25@example.com",
    address: "10 Lê Hồng Phong, TP. Vinh, Nghệ An", idNumber: "001201021032",
    parentName: "", parentPhone: "",
    status: "graduated", programs: ["Luyện thi TOEIC 450+"],
    avatarColor: "from-blue-600 to-cyan-600", progress: 100, enrollDate: "01/09/2025" },
  { id: "S033", code: "HV-25-0901", name: "Lý Thị Đào", dob: "10/06/2002",
    gender: "Nữ", phone: "0956677765", email: "dao.ly25@example.com",
    address: "55 Nguyễn Sỹ Sách, TX. Thái Hòa, Nghệ An", idNumber: "001202021033",
    parentName: "", parentPhone: "",
    status: "graduated", programs: ["Kế toán Thực hành"],
    avatarColor: "from-teal-500 to-cyan-600", progress: 100, enrollDate: "02/09/2025" },
  { id: "S034", code: "HV-25-0902", name: "Hoàng Văn An", dob: "31/12/2000",
    gender: "Nam", phone: "0967788876", email: "an.hoang25@example.com",
    address: "6 Bạch Đằng, TP. Vinh, Nghệ An", idNumber: "001200021034",
    parentName: "", parentPhone: "",
    status: "graduated", programs: ["Kỹ thuật Hàn Điện Cơ bản"],
    avatarColor: "from-orange-500 to-amber-600", progress: 100, enrollDate: "03/09/2025" },
  { id: "S035", code: "HV-25-0903", name: "Ngô Thị Bích", dob: "08/02/2004",
    gender: "Nữ", phone: "0978899987", email: "bich.ngo25@example.com",
    address: "19 Phúc Thành, Huyện Nghi Lộc, Nghệ An", idNumber: "001204021035",
    parentName: "", parentPhone: "",
    status: "graduated", programs: ["Tin học Văn phòng IC3"],
    avatarColor: "from-emerald-500 to-green-600", progress: 100, enrollDate: "04/09/2025" },
  { id: "S036", code: "HV-25-0904", name: "Đặng Văn Cường", dob: "20/10/2001",
    gender: "Nam", phone: "0989900098", email: "cuong.dang25@example.com",
    address: "73 Đinh Tiên Hoàng, TP. Vinh, Nghệ An", idNumber: "001201021036",
    parentName: "", parentPhone: "",
    status: "graduated", programs: ["Tiếng Anh B1 VSTEP Cấp tốc"],
    avatarColor: "from-indigo-600 to-violet-600", progress: 100, enrollDate: "05/09/2025" },
  { id: "S037", code: "HV-25-0905", name: "Bùi Thị Dung", dob: "15/03/2003",
    gender: "Nữ", phone: "0901011209", email: "dung.bui25@example.com",
    address: "38 Ngô Thị Nhậm, Huyện Quỳnh Lưu, Nghệ An", idNumber: "001203021037",
    parentName: "", parentPhone: "",
    status: "graduated", programs: ["Điện dân dụng Nâng cao"],
    avatarColor: "from-rose-500 to-pink-600", progress: 100, enrollDate: "06/09/2025" },
  { id: "S038", code: "HV-25-0906", name: "Vũ Minh Đức", dob: "27/07/2002",
    gender: "Nam", phone: "0912122310", email: "duc.vu25@example.com",
    address: "50 Nguyễn Thị Minh Khai, TX. Cửa Lò, Nghệ An", idNumber: "001202021038",
    parentName: "", parentPhone: "",
    status: "graduated", programs: ["May Công nghiệp"],
    avatarColor: "from-purple-500 to-indigo-600", progress: 100, enrollDate: "07/09/2025" },
  { id: "S039", code: "HV-25-0907", name: "Phan Thị Phương", dob: "04/05/2004",
    gender: "Nữ", phone: "0923233411", email: "phuong.phan25@example.com",
    address: "14 Bà Triệu, TP. Vinh, Nghệ An", idNumber: "001204021039",
    parentName: "", parentPhone: "",
    status: "graduated", programs: ["Kỹ thuật Nấu ăn 3 Tháng"],
    avatarColor: "from-amber-400 to-orange-500", progress: 100, enrollDate: "08/09/2025" },
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
  // ── Sprint 1 — mở rộng lớp học ──────────────────────────────────────────────
  { id: "CL006", code: "GDTX10-K26", courseId: "C009", courseName: "Lớp 10 GDTX Khóa 2026",
    teacherId: "T002", teacherName: "GV. Phạm Thị Hoa",
    room: "Phòng B101", roomType: "Lý thuyết",
    schedule: "T2, T4, T6 — Buổi sáng (07:30–11:30)",
    scheduleItems: [{ dayOfWeek: 1, startTime: "07:30", endTime: "11:30" }, { dayOfWeek: 3, startTime: "07:30", endTime: "11:30" }, { dayOfWeek: 5, startTime: "07:30", endTime: "11:30" }],
    maxStudents: 35, currentStudents: 28, startDate: "06/01/2026", endDate: "31/05/2026",
    status: "Hoạt động", type: "GDTX", color: "#0ea5e9" },
  { id: "CL007", code: "GDTX11-K26", courseId: "C010", courseName: "Lớp 11 GDTX Khóa 2026",
    teacherId: "T002", teacherName: "GV. Phạm Thị Hoa",
    room: "Phòng B102", roomType: "Lý thuyết",
    schedule: "T3, T5, T7 — Buổi chiều (13:00–17:00)",
    scheduleItems: [{ dayOfWeek: 2, startTime: "13:00", endTime: "17:00" }, { dayOfWeek: 4, startTime: "13:00", endTime: "17:00" }, { dayOfWeek: 6, startTime: "13:00", endTime: "17:00" }],
    maxStudents: 35, currentStudents: 20, startDate: "06/01/2026", endDate: "31/05/2026",
    status: "Hoạt động", type: "GDTX", color: "#f59e0b" },
  { id: "CL008", code: "NA-CB-K05", courseId: "C007", courseName: "Kỹ thuật Nấu ăn 3 Tháng",
    teacherId: "T003", teacherName: "GV. Lê Văn Hải",
    room: "Bếp Thực hành 1", roomType: "Xưởng",
    schedule: "T2, T3, T4, T5 — Buổi sáng (07:30–11:00)",
    scheduleItems: [{ dayOfWeek: 1, startTime: "07:30", endTime: "11:00" }, { dayOfWeek: 2, startTime: "07:30", endTime: "11:00" }, { dayOfWeek: 3, startTime: "07:30", endTime: "11:00" }, { dayOfWeek: 4, startTime: "07:30", endTime: "11:00" }],
    maxStudents: 20, currentStudents: 14, startDate: "10/01/2026", endDate: "10/04/2026",
    status: "Hoạt động", type: "GDNN", color: "#f97316" },
  { id: "CL009", code: "TA-GT-K12", courseId: "C011", courseName: "Tiếng Anh Giao tiếp Cơ bản",
    teacherId: "T-DEMO", teacherName: "GV. Nguyễn Thị Lan",
    room: "Phòng A103", roomType: "Lý thuyết",
    schedule: "T2, T4, T6 — Buổi chiều (14:00–16:30)",
    scheduleItems: [{ dayOfWeek: 1, startTime: "14:00", endTime: "16:30" }, { dayOfWeek: 3, startTime: "14:00", endTime: "16:30" }, { dayOfWeek: 5, startTime: "14:00", endTime: "16:30" }],
    maxStudents: 25, currentStudents: 18, startDate: "08/01/2026", endDate: "30/04/2026",
    status: "Hoạt động", type: "NNTH", color: "#06b6d4" },
  { id: "CL010", code: "JP-N4-K08", courseId: "C008", courseName: "Tiếng Nhật N4",
    teacherId: "T-DEMO", teacherName: "GV. Nguyễn Thị Lan",
    room: "Phòng A104", roomType: "Lý thuyết",
    schedule: "T3, T5, T7 — Ca Tối (18:30–21:00)",
    scheduleItems: [{ dayOfWeek: 2, startTime: "18:30", endTime: "21:00" }, { dayOfWeek: 4, startTime: "18:30", endTime: "21:00" }, { dayOfWeek: 6, startTime: "18:30", endTime: "21:00" }],
    maxStudents: 20, currentStudents: 15, startDate: "10/01/2026", endDate: "30/06/2026",
    status: "Hoạt động", type: "NNTH", color: "#ef4444" },
  { id: "CL011", code: "WEB-K01", courseId: "C006", courseName: "Lập trình Web Frontend",
    teacherId: "T004", teacherName: "GV. Nguyễn Minh Đức",
    room: "Phòng máy C1", roomType: "Lab",
    schedule: "T3, T5 — Ca Tối (18:00–21:00)",
    scheduleItems: [{ dayOfWeek: 2, startTime: "18:00", endTime: "21:00" }, { dayOfWeek: 4, startTime: "18:00", endTime: "21:00" }],
    maxStudents: 20, currentStudents: 16, startDate: "12/01/2026", endDate: "30/06/2026",
    status: "Hoạt động", type: "NNTH", color: "#6366f1" },
  { id: "CL012", code: "DH-CB-K03", courseId: "C012", courseName: "Thiết kế Đồ họa Cơ bản",
    teacherId: "T004", teacherName: "GV. Nguyễn Minh Đức",
    room: "Phòng máy C2", roomType: "Lab",
    schedule: "T2, T4 — Ca Tối (18:00–21:00)",
    scheduleItems: [{ dayOfWeek: 1, startTime: "18:00", endTime: "21:00" }, { dayOfWeek: 3, startTime: "18:00", endTime: "21:00" }],
    maxStudents: 20, currentStudents: 12, startDate: "13/01/2026", endDate: "30/05/2026",
    status: "Hoạt động", type: "NNTH", color: "#8b5cf6" },
  { id: "CL013", code: "MAY-CN-K09", courseId: "C013", courseName: "May Công nghiệp",
    teacherId: "T005", teacherName: "GV. Trần Thị Thu",
    room: "Xưởng May 1", roomType: "Xưởng",
    schedule: "T2 → T6 — Buổi sáng (07:30–11:30)",
    scheduleItems: [{ dayOfWeek: 1, startTime: "07:30", endTime: "11:30" }, { dayOfWeek: 2, startTime: "07:30", endTime: "11:30" }, { dayOfWeek: 3, startTime: "07:30", endTime: "11:30" }, { dayOfWeek: 4, startTime: "07:30", endTime: "11:30" }, { dayOfWeek: 5, startTime: "07:30", endTime: "11:30" }],
    maxStudents: 25, currentStudents: 20, startDate: "06/01/2026", endDate: "30/06/2026",
    status: "Hoạt động", type: "GDNN", color: "#ec4899" },
  { id: "CL014", code: "KT-TH-K09", courseId: "C014", courseName: "Kế toán Thực hành",
    teacherId: "T002", teacherName: "GV. Phạm Thị Hoa",
    room: "Phòng máy B3", roomType: "Lab",
    schedule: "T3, T5, T7 — Buổi chiều (13:30–17:00)",
    scheduleItems: [{ dayOfWeek: 2, startTime: "13:30", endTime: "17:00" }, { dayOfWeek: 4, startTime: "13:30", endTime: "17:00" }, { dayOfWeek: 6, startTime: "13:30", endTime: "17:00" }],
    maxStudents: 25, currentStudents: 18, startDate: "07/01/2026", endDate: "30/07/2026",
    status: "Hoạt động", type: "GDNN", color: "#14b8a6" },
  { id: "CL015", code: "DD-CB-K06", courseId: "C005", courseName: "Điện dân dụng Nâng cao",
    teacherId: "teacher-001", teacherName: "GV. Trương Văn Nam",
    room: "Xưởng A2", roomType: "Xưởng",
    schedule: "T2, T4, T6 — Buổi sáng (07:30–11:00)",
    scheduleItems: [{ dayOfWeek: 1, startTime: "07:30", endTime: "11:00" }, { dayOfWeek: 3, startTime: "07:30", endTime: "11:00" }, { dayOfWeek: 5, startTime: "07:30", endTime: "11:00" }],
    maxStudents: 20, currentStudents: 16, startDate: "09/01/2026", endDate: "30/05/2026",
    status: "Hoạt động", type: "GDNN", color: "#84cc16" },
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
  // ── Sprint 1 — bổ sung ghi danh ─────────────────────────────────────────────
  { id: "EN-003", studentId: "S003", studentCode: "HV-26-0003", studentName: "Lý Gia Hân",
    classId: "CL008", classCode: "NA-CB-K05", courseId: "C007", courseName: "Kỹ thuật Nấu ăn 3 Tháng",
    teacherName: "GV. Lê Văn Hải", schedule: "T2–T5 Buổi sáng", room: "Bếp Thực hành 1",
    enrollDate: "08/01/2026", startDate: "10/01/2026", endDate: "10/04/2026",
    fee: 3200000, discountAmount: 1600000, finalFee: 1600000, paymentMethod: "Tiền mặt",
    status: "reserve", progress: 12, completedLessons: 4, totalLessons: 36, attendanceRate: 70, color: "#f97316" },
  { id: "EN-004", studentId: "S004", studentCode: "HV-26-0004", studentName: "Phạm Bình Minh",
    classId: "CL003", classCode: "HD-CB-K12", courseId: "C004", courseName: "Kỹ thuật Hàn Điện Cơ bản",
    teacherName: "GV. Trương Văn Nam", schedule: "T2, T4 Buổi sáng", room: "Xưởng A1",
    enrollDate: "09/01/2026", startDate: "10/01/2026", endDate: "30/04/2026",
    fee: 3200000, discountAmount: 0, finalFee: 3200000, paymentMethod: "Chuyển khoản",
    status: "dropped", progress: 50, completedLessons: 11, totalLessons: 22, attendanceRate: 75, color: "#3b82f6" },
  { id: "EN-005", studentId: "S005", studentCode: "HV-25-0992", studentName: "Hoàng Thanh Thảo",
    classId: "CL005", classCode: "TOEIC-K27", courseId: "C002", courseName: "Luyện thi TOEIC 450+",
    teacherName: "GV. Nguyễn Thị Lan", schedule: "T7, CN Buổi sáng", room: "Phòng A102",
    enrollDate: "03/09/2025", startDate: "03/09/2025", endDate: "15/12/2025",
    fee: 4200000, discountAmount: 0, finalFee: 4200000, paymentMethod: "Chuyển khoản",
    status: "completed", progress: 100, completedLessons: 24, totalLessons: 24, attendanceRate: 96, color: "#ec4899" },
  { id: "EN-006", studentId: "S006", studentCode: "HV-26-0012", studentName: "Lê Minh Trí",
    classId: "CL011", classCode: "WEB-K01", courseId: "C006", courseName: "Lập trình Web Frontend",
    teacherName: "GV. Nguyễn Minh Đức", schedule: "T3, T5 Ca Tối", room: "Phòng máy C1",
    enrollDate: "11/01/2026", startDate: "12/01/2026", endDate: "30/06/2026",
    fee: 8500000, discountAmount: 500000, finalFee: 8000000, paymentMethod: "Chuyển khoản",
    status: "active", progress: 82, completedLessons: 22, totalLessons: 28, attendanceRate: 92, color: "#6366f1" },
  { id: "EN-007", studentId: "S007", studentCode: "HV-26-0015", studentName: "Đỗ Xuân Trường",
    classId: "CL012", classCode: "DH-CB-K03", courseId: "C012", courseName: "Thiết kế Đồ họa Cơ bản",
    teacherName: "GV. Nguyễn Minh Đức", schedule: "T2, T4 Ca Tối", room: "Phòng máy C2",
    enrollDate: "12/01/2026", startDate: "13/01/2026", endDate: "30/05/2026",
    fee: 4500000, discountAmount: 0, finalFee: 4500000, paymentMethod: "Tiền mặt",
    status: "active", progress: 24, completedLessons: 5, totalLessons: 20, attendanceRate: 80, color: "#8b5cf6" },
  { id: "EN-008", studentId: "S008", studentCode: "HV-25-0811", studentName: "Vũ Ngọc Trâm",
    classId: "CL014", classCode: "KT-TH-K09", courseId: "C014", courseName: "Kế toán Thực hành",
    teacherName: "GV. Phạm Thị Hoa", schedule: "T3, T5, T7 Chiều", room: "Phòng máy B3",
    enrollDate: "15/08/2025", startDate: "15/08/2025", endDate: "30/01/2026",
    fee: 5500000, discountAmount: 0, finalFee: 5500000, paymentMethod: "Chuyển khoản",
    status: "completed", progress: 100, completedLessons: 30, totalLessons: 30, attendanceRate: 98, color: "#14b8a6" },
  { id: "EN-009", studentId: "S009", studentCode: "HV-26-0021", studentName: "Nguyễn Văn An",
    classId: "CL009", classCode: "TA-GT-K12", courseId: "C011", courseName: "Tiếng Anh Giao tiếp Cơ bản",
    teacherName: "GV. Nguyễn Thị Lan", schedule: "T2, T4, T6 Chiều", room: "Phòng A103",
    enrollDate: "06/01/2026", startDate: "08/01/2026", endDate: "30/04/2026",
    fee: 3000000, discountAmount: 0, finalFee: 3000000, paymentMethod: "Tiền mặt",
    status: "active", progress: 55, completedLessons: 12, totalLessons: 22, attendanceRate: 90, color: "#06b6d4" },
  { id: "EN-010", studentId: "S010", studentCode: "HV-26-0022", studentName: "Trần Thị Bích",
    classId: "CL006", classCode: "GDTX10-K26", courseId: "C009", courseName: "Lớp 10 GDTX Khóa 2026",
    teacherName: "GV. Phạm Thị Hoa", schedule: "T2, T4, T6 Sáng", room: "Phòng B101",
    enrollDate: "07/01/2026", startDate: "06/01/2026", endDate: "31/05/2026",
    fee: 2500000, discountAmount: 0, finalFee: 2500000, paymentMethod: "Tiền mặt",
    status: "active", progress: 40, completedLessons: 20, totalLessons: 50, attendanceRate: 88, color: "#0ea5e9" },
  { id: "EN-011", studentId: "S011", studentCode: "HV-26-0023", studentName: "Phạm Minh Cường",
    classId: "CL011", classCode: "WEB-K01", courseId: "C006", courseName: "Lập trình Web Frontend",
    teacherName: "GV. Nguyễn Minh Đức", schedule: "T3, T5 Ca Tối", room: "Phòng máy C1",
    enrollDate: "10/01/2026", startDate: "12/01/2026", endDate: "30/06/2026",
    fee: 8500000, discountAmount: 0, finalFee: 8500000, paymentMethod: "Chuyển khoản",
    status: "active", progress: 72, completedLessons: 20, totalLessons: 28, attendanceRate: 94, color: "#6366f1" },
  { id: "EN-012", studentId: "S012", studentCode: "HV-26-0024", studentName: "Lê Thị Dung",
    classId: "CL014", classCode: "KT-TH-K09", courseId: "C014", courseName: "Kế toán Thực hành",
    teacherName: "GV. Phạm Thị Hoa", schedule: "T3, T5, T7 Chiều", room: "Phòng máy B3",
    enrollDate: "11/01/2026", startDate: "07/01/2026", endDate: "30/07/2026",
    fee: 5500000, discountAmount: 0, finalFee: 5500000, paymentMethod: "Tiền mặt",
    status: "active", progress: 60, completedLessons: 18, totalLessons: 30, attendanceRate: 93, color: "#14b8a6" },
  { id: "EN-013", studentId: "S013", studentCode: "HV-26-0025", studentName: "Hoàng Văn Em",
    classId: "CL010", classCode: "JP-N4-K08", courseId: "C008", courseName: "Tiếng Nhật N4",
    teacherName: "GV. Nguyễn Thị Lan", schedule: "T3, T5, T7 Ca Tối", room: "Phòng A104",
    enrollDate: "12/01/2026", startDate: "10/01/2026", endDate: "30/06/2026",
    fee: 4800000, discountAmount: 0, finalFee: 4800000, paymentMethod: "Chuyển khoản",
    status: "active", progress: 35, completedLessons: 12, totalLessons: 36, attendanceRate: 86, color: "#ef4444" },
  { id: "EN-014", studentId: "S014", studentCode: "HV-26-0026", studentName: "Ngô Thị Phương",
    classId: "CL013", classCode: "MAY-CN-K09", courseId: "C013", courseName: "May Công nghiệp",
    teacherName: "GV. Trần Thị Thu", schedule: "T2–T6 Buổi sáng", room: "Xưởng May 1",
    enrollDate: "13/01/2026", startDate: "06/01/2026", endDate: "30/06/2026",
    fee: 3800000, discountAmount: 0, finalFee: 3800000, paymentMethod: "Tiền mặt",
    status: "active", progress: 48, completedLessons: 24, totalLessons: 50, attendanceRate: 85, color: "#ec4899" },
  { id: "EN-015", studentId: "S015", studentCode: "HV-26-0027", studentName: "Đặng Văn Giang",
    classId: "CL003", classCode: "HD-CB-K12", courseId: "C004", courseName: "Kỹ thuật Hàn Điện Cơ bản",
    teacherName: "GV. Trương Văn Nam", schedule: "T2, T4 Sáng", room: "Xưởng A1",
    enrollDate: "14/01/2026", startDate: "10/01/2026", endDate: "30/04/2026",
    fee: 3200000, discountAmount: 0, finalFee: 3200000, paymentMethod: "Tiền mặt",
    status: "active", progress: 65, completedLessons: 14, totalLessons: 22, attendanceRate: 91, color: "#3b82f6" },
  { id: "EN-016", studentId: "S016", studentCode: "HV-26-0028", studentName: "Bùi Thị Hà",
    classId: "CL002", classCode: "IC3-K18", courseId: "C003", courseName: "Tin học Văn phòng IC3",
    teacherName: "GV. Trần Văn Nam", schedule: "T3, T5 Chiều", room: "Phòng máy B2",
    enrollDate: "15/01/2026", startDate: "08/01/2026", endDate: "31/05/2026",
    fee: 2800000, discountAmount: 0, finalFee: 2800000, paymentMethod: "Tiền mặt",
    status: "active", progress: 30, completedLessons: 6, totalLessons: 20, attendanceRate: 82, color: "#10b981" },
  { id: "EN-017", studentId: "S017", studentCode: "HV-26-0029", studentName: "Vũ Minh Hùng",
    classId: "CL015", classCode: "DD-CB-K06", courseId: "C005", courseName: "Điện dân dụng Nâng cao",
    teacherName: "GV. Trương Văn Nam", schedule: "T2, T4, T6 Sáng", room: "Xưởng A2",
    enrollDate: "16/01/2026", startDate: "09/01/2026", endDate: "30/05/2026",
    fee: 3500000, discountAmount: 0, finalFee: 3500000, paymentMethod: "Chuyển khoản",
    status: "active", progress: 80, completedLessons: 20, totalLessons: 25, attendanceRate: 96, color: "#84cc16" },
  { id: "EN-018", studentId: "S018", studentCode: "HV-26-0030", studentName: "Phan Thị Yến",
    classId: "CL001", classCode: "TA-B1-K26", courseId: "C001", courseName: "Tiếng Anh B1 VSTEP Cấp tốc",
    teacherName: "GV. Nguyễn Thị Lan", schedule: "T2, T4, T6 Ca Tối", room: "Phòng A101",
    enrollDate: "17/01/2026", startDate: "06/01/2026", endDate: "30/06/2026",
    fee: 3500000, discountAmount: 0, finalFee: 3500000, paymentMethod: "Tiền mặt",
    status: "active", progress: 50, completedLessons: 12, totalLessons: 25, attendanceRate: 88, color: "#f26522" },
  { id: "EN-019", studentId: "S019", studentCode: "HV-26-0031", studentName: "Nguyễn Thị Khánh",
    classId: "CL005", classCode: "TOEIC-K27", courseId: "C002", courseName: "Luyện thi TOEIC 450+",
    teacherName: "GV. Nguyễn Thị Lan", schedule: "T7, CN Sáng", room: "Phòng A102",
    enrollDate: "18/01/2026", startDate: "15/04/2026", endDate: "15/06/2026",
    fee: 4200000, discountAmount: 0, finalFee: 4200000, paymentMethod: "Chuyển khoản",
    status: "reserve", progress: 45, completedLessons: 11, totalLessons: 24, attendanceRate: 83, color: "#ec4899" },
  { id: "EN-020", studentId: "S020", studentCode: "HV-26-0032", studentName: "Trần Văn Lâm",
    classId: "CL008", classCode: "NA-CB-K05", courseId: "C007", courseName: "Kỹ thuật Nấu ăn 3 Tháng",
    teacherName: "GV. Lê Văn Hải", schedule: "T2–T5 Sáng", room: "Bếp Thực hành 1",
    enrollDate: "20/01/2026", startDate: "10/01/2026", endDate: "10/04/2026",
    fee: 3200000, discountAmount: 0, finalFee: 3200000, paymentMethod: "Tiền mặt",
    status: "active", progress: 62, completedLessons: 22, totalLessons: 36, attendanceRate: 89, color: "#f97316" },
  { id: "EN-021", studentId: "S021", studentCode: "HV-26-0033", studentName: "Lý Thị Mỹ",
    classId: "CL007", classCode: "GDTX11-K26", courseId: "C010", courseName: "Lớp 11 GDTX Khóa 2026",
    teacherName: "GV. Phạm Thị Hoa", schedule: "T3, T5, T7 Chiều", room: "Phòng B102",
    enrollDate: "21/01/2026", startDate: "06/01/2026", endDate: "31/05/2026",
    fee: 2500000, discountAmount: 0, finalFee: 2500000, paymentMethod: "Tiền mặt",
    status: "active", progress: 38, completedLessons: 19, totalLessons: 50, attendanceRate: 84, color: "#f59e0b" },
  { id: "EN-022", studentId: "S022", studentCode: "HV-26-0034", studentName: "Phạm Văn Nam",
    classId: "CL012", classCode: "DH-CB-K03", courseId: "C012", courseName: "Thiết kế Đồ họa Cơ bản",
    teacherName: "GV. Nguyễn Minh Đức", schedule: "T2, T4 Ca Tối", room: "Phòng máy C2",
    enrollDate: "22/01/2026", startDate: "13/01/2026", endDate: "30/05/2026",
    fee: 4500000, discountAmount: 0, finalFee: 4500000, paymentMethod: "Tiền mặt",
    status: "active", progress: 25, completedLessons: 5, totalLessons: 20, attendanceRate: 75, color: "#8b5cf6" },
  { id: "EN-023", studentId: "S023", studentCode: "HV-26-0035", studentName: "Lê Minh Ngọc",
    classId: "CL009", classCode: "TA-GT-K12", courseId: "C011", courseName: "Tiếng Anh Giao tiếp Cơ bản",
    teacherName: "GV. Nguyễn Thị Lan", schedule: "T2, T4, T6 Chiều", room: "Phòng A103",
    enrollDate: "23/01/2026", startDate: "08/01/2026", endDate: "30/04/2026",
    fee: 3000000, discountAmount: 0, finalFee: 3000000, paymentMethod: "Chuyển khoản",
    status: "active", progress: 58, completedLessons: 13, totalLessons: 22, attendanceRate: 91, color: "#06b6d4" },
  { id: "EN-024", studentId: "S024", studentCode: "HV-26-0036", studentName: "Hoàng Thị Oanh",
    classId: "CL010", classCode: "JP-N4-K08", courseId: "C008", courseName: "Tiếng Nhật N4",
    teacherName: "GV. Nguyễn Thị Lan", schedule: "T3, T5, T7 Ca Tối", room: "Phòng A104",
    enrollDate: "05/01/2026", startDate: "10/01/2026", endDate: "30/06/2026",
    fee: 4800000, discountAmount: 0, finalFee: 4800000, paymentMethod: "Tiền mặt",
    status: "reserve", progress: 20, completedLessons: 7, totalLessons: 36, attendanceRate: 72, color: "#ef4444" },
  { id: "EN-025", studentId: "S025", studentCode: "HV-26-0037", studentName: "Đỗ Văn Phong",
    classId: "CL014", classCode: "KT-TH-K09", courseId: "C014", courseName: "Kế toán Thực hành",
    teacherName: "GV. Phạm Thị Hoa", schedule: "T3, T5, T7 Chiều", room: "Phòng máy B3",
    enrollDate: "06/01/2026", startDate: "07/01/2026", endDate: "30/07/2026",
    fee: 5500000, discountAmount: 0, finalFee: 5500000, paymentMethod: "Chuyển khoản",
    status: "reserve", progress: 15, completedLessons: 4, totalLessons: 30, attendanceRate: 65, color: "#14b8a6" },
  { id: "EN-026", studentId: "S026", studentCode: "HV-26-0038", studentName: "Bùi Thị Quỳnh",
    classId: "CL011", classCode: "WEB-K01", courseId: "C006", courseName: "Lập trình Web Frontend",
    teacherName: "GV. Nguyễn Minh Đức", schedule: "T3, T5 Ca Tối", room: "Phòng máy C1",
    enrollDate: "07/01/2026", startDate: "12/01/2026", endDate: "30/06/2026",
    fee: 8500000, discountAmount: 0, finalFee: 8500000, paymentMethod: "Tiền mặt",
    status: "reserve", progress: 10, completedLessons: 3, totalLessons: 28, attendanceRate: 60, color: "#6366f1" },
  { id: "EN-027", studentId: "S027", studentCode: "HV-26-0039", studentName: "Vũ Văn Sơn",
    classId: "CL002", classCode: "IC3-K18", courseId: "C003", courseName: "Tin học Văn phòng IC3",
    teacherName: "GV. Trần Văn Nam", schedule: "T3, T5 Chiều", room: "Phòng máy B2",
    enrollDate: "08/01/2026", startDate: "08/01/2026", endDate: "31/05/2026",
    fee: 2800000, discountAmount: 0, finalFee: 2800000, paymentMethod: "Tiền mặt",
    status: "reserve", progress: 8, completedLessons: 2, totalLessons: 20, attendanceRate: 55, color: "#10b981" },
  { id: "EN-028", studentId: "S028", studentCode: "HV-26-0040", studentName: "Phan Minh Thành",
    classId: "CL015", classCode: "DD-CB-K06", courseId: "C005", courseName: "Điện dân dụng Nâng cao",
    teacherName: "GV. Trương Văn Nam", schedule: "T2, T4, T6 Sáng", room: "Xưởng A2",
    enrollDate: "10/01/2026", startDate: "09/01/2026", endDate: "30/05/2026",
    fee: 3500000, discountAmount: 0, finalFee: 3500000, paymentMethod: "Chuyển khoản",
    status: "dropped", progress: 30, completedLessons: 7, totalLessons: 25, attendanceRate: 68, color: "#84cc16" },
  { id: "EN-029", studentId: "S029", studentCode: "HV-26-0041", studentName: "Nguyễn Thị Uyên",
    classId: "CL013", classCode: "MAY-CN-K09", courseId: "C013", courseName: "May Công nghiệp",
    teacherName: "GV. Trần Thị Thu", schedule: "T2–T6 Sáng", room: "Xưởng May 1",
    enrollDate: "11/01/2026", startDate: "06/01/2026", endDate: "30/06/2026",
    fee: 3800000, discountAmount: 0, finalFee: 3800000, paymentMethod: "Tiền mặt",
    status: "dropped", progress: 22, completedLessons: 11, totalLessons: 50, attendanceRate: 62, color: "#ec4899" },
  { id: "EN-030", studentId: "S030", studentCode: "HV-26-0042", studentName: "Trần Văn Vinh",
    classId: "CL008", classCode: "NA-CB-K05", courseId: "C007", courseName: "Kỹ thuật Nấu ăn 3 Tháng",
    teacherName: "GV. Lê Văn Hải", schedule: "T2–T5 Sáng", room: "Bếp Thực hành 1",
    enrollDate: "12/01/2026", startDate: "10/01/2026", endDate: "10/04/2026",
    fee: 3200000, discountAmount: 0, finalFee: 3200000, paymentMethod: "Tiền mặt",
    status: "dropped", progress: 18, completedLessons: 6, totalLessons: 36, attendanceRate: 58, color: "#f97316" },
  { id: "EN-031", studentId: "S031", studentCode: "HV-25-1001", studentName: "Lê Thị Xuân",
    classId: "CL001", classCode: "TA-B1-K26", courseId: "C001", courseName: "Tiếng Anh B1 VSTEP Cấp tốc",
    teacherName: "GV. Nguyễn Thị Lan", schedule: "T2, T4, T6 Ca Tối", room: "Phòng A101",
    enrollDate: "05/09/2025", startDate: "05/09/2025", endDate: "28/02/2026",
    fee: 3500000, discountAmount: 0, finalFee: 3500000, paymentMethod: "Tiền mặt",
    status: "dropped", progress: 45, completedLessons: 11, totalLessons: 25, attendanceRate: 70, color: "#f26522" },
  { id: "EN-032", studentId: "S032", studentCode: "HV-25-0900", studentName: "Phạm Quang Yên",
    classId: "CL005", classCode: "TOEIC-K25", courseId: "C002", courseName: "Luyện thi TOEIC 450+",
    teacherName: "GV. Nguyễn Thị Lan", schedule: "T7, CN Sáng", room: "Phòng A102",
    enrollDate: "01/09/2025", startDate: "01/09/2025", endDate: "30/12/2025",
    fee: 4200000, discountAmount: 0, finalFee: 4200000, paymentMethod: "Chuyển khoản",
    status: "completed", progress: 100, completedLessons: 24, totalLessons: 24, attendanceRate: 95, color: "#ec4899" },
  { id: "EN-033", studentId: "S033", studentCode: "HV-25-0901", studentName: "Lý Thị Đào",
    classId: "CL014", classCode: "KT-TH-K08", courseId: "C014", courseName: "Kế toán Thực hành",
    teacherName: "GV. Phạm Thị Hoa", schedule: "T3, T5, T7 Chiều", room: "Phòng máy B3",
    enrollDate: "02/09/2025", startDate: "02/09/2025", endDate: "28/02/2026",
    fee: 5500000, discountAmount: 0, finalFee: 5500000, paymentMethod: "Chuyển khoản",
    status: "completed", progress: 100, completedLessons: 30, totalLessons: 30, attendanceRate: 97, color: "#14b8a6" },
  { id: "EN-034", studentId: "S034", studentCode: "HV-25-0902", studentName: "Hoàng Văn An",
    classId: "CL003", classCode: "HD-CB-K11", courseId: "C004", courseName: "Kỹ thuật Hàn Điện Cơ bản",
    teacherName: "GV. Trương Văn Nam", schedule: "T2, T4 Sáng", room: "Xưởng A1",
    enrollDate: "03/09/2025", startDate: "03/09/2025", endDate: "28/01/2026",
    fee: 3200000, discountAmount: 0, finalFee: 3200000, paymentMethod: "Tiền mặt",
    status: "completed", progress: 100, completedLessons: 22, totalLessons: 22, attendanceRate: 100, color: "#3b82f6" },
  { id: "EN-035", studentId: "S035", studentCode: "HV-25-0903", studentName: "Ngô Thị Bích",
    classId: "CL002", classCode: "IC3-K17", courseId: "C003", courseName: "Tin học Văn phòng IC3",
    teacherName: "GV. Trần Văn Nam", schedule: "T3, T5 Chiều", room: "Phòng máy B2",
    enrollDate: "04/09/2025", startDate: "04/09/2025", endDate: "31/01/2026",
    fee: 2800000, discountAmount: 0, finalFee: 2800000, paymentMethod: "Tiền mặt",
    status: "completed", progress: 100, completedLessons: 20, totalLessons: 20, attendanceRate: 95, color: "#10b981" },
  { id: "EN-036", studentId: "S036", studentCode: "HV-25-0904", studentName: "Đặng Văn Cường",
    classId: "CL001", classCode: "TA-B1-K25", courseId: "C001", courseName: "Tiếng Anh B1 VSTEP Cấp tốc",
    teacherName: "GV. Nguyễn Thị Lan", schedule: "T2, T4, T6 Ca Tối", room: "Phòng A101",
    enrollDate: "05/09/2025", startDate: "05/09/2025", endDate: "25/02/2026",
    fee: 3500000, discountAmount: 0, finalFee: 3500000, paymentMethod: "Chuyển khoản",
    status: "completed", progress: 100, completedLessons: 25, totalLessons: 25, attendanceRate: 92, color: "#f26522" },
  { id: "EN-037", studentId: "S037", studentCode: "HV-25-0905", studentName: "Bùi Thị Dung",
    classId: "CL015", classCode: "DD-CB-K05", courseId: "C005", courseName: "Điện dân dụng Nâng cao",
    teacherName: "GV. Trương Văn Nam", schedule: "T2, T4, T6 Sáng", room: "Xưởng A2",
    enrollDate: "06/09/2025", startDate: "06/09/2025", endDate: "31/01/2026",
    fee: 3500000, discountAmount: 0, finalFee: 3500000, paymentMethod: "Tiền mặt",
    status: "completed", progress: 100, completedLessons: 25, totalLessons: 25, attendanceRate: 88, color: "#84cc16" },
  { id: "EN-038", studentId: "S038", studentCode: "HV-25-0906", studentName: "Vũ Minh Đức",
    classId: "CL013", classCode: "MAY-CN-K08", courseId: "C013", courseName: "May Công nghiệp",
    teacherName: "GV. Trần Thị Thu", schedule: "T2–T6 Sáng", room: "Xưởng May 1",
    enrollDate: "07/09/2025", startDate: "07/09/2025", endDate: "07/02/2026",
    fee: 3800000, discountAmount: 0, finalFee: 3800000, paymentMethod: "Chuyển khoản",
    status: "completed", progress: 100, completedLessons: 50, totalLessons: 50, attendanceRate: 91, color: "#ec4899" },
  { id: "EN-039", studentId: "S039", studentCode: "HV-25-0907", studentName: "Phan Thị Phương",
    classId: "CL008", classCode: "NA-CB-K04", courseId: "C007", courseName: "Kỹ thuật Nấu ăn 3 Tháng",
    teacherName: "GV. Lê Văn Hải", schedule: "T2–T5 Sáng", room: "Bếp Thực hành 1",
    enrollDate: "08/09/2025", startDate: "08/09/2025", endDate: "08/12/2025",
    fee: 3200000, discountAmount: 0, finalFee: 3200000, paymentMethod: "Tiền mặt",
    status: "completed", progress: 100, completedLessons: 36, totalLessons: 36, attendanceRate: 94, color: "#f97316" },
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
  // ── Sprint 1 — bổ sung kết quả thi ──────────────────────────────────────────
  { id: "ER-006", examPlanId: "EP003", examPlanName: "Kỳ thi Hàn Điện Cuối khóa",
    studentId: "S015", studentCode: "HV-26-0027", studentName: "Đặng Văn Giang",
    seatNo: "SBD-G01", subject: "Kỹ thuật Hàn Điện", score: 8.0, maxScore: 10, passScore: 5,
    status: "pass", examDate: "25/03/2026", note: "Thực hành đạt yêu cầu",
    listening: null, reading: null, writing: null, speaking: null },
  { id: "ER-007", examPlanId: "EP003", examPlanName: "Kỳ thi Hàn Điện Cuối khóa",
    studentId: "S034", studentCode: "HV-25-0902", studentName: "Hoàng Văn An",
    seatNo: "SBD-G02", subject: "Kỹ thuật Hàn Điện", score: 9.0, maxScore: 10, passScore: 5,
    status: "pass", examDate: "25/01/2026", note: "Xuất sắc",
    listening: null, reading: null, writing: null, speaking: null },
  { id: "ER-008", examPlanId: "EP004", examPlanName: "Kỳ thi Điện DD Cuối khóa",
    studentId: "S017", studentCode: "HV-26-0029", studentName: "Vũ Minh Hùng",
    seatNo: "SBD-D01", subject: "Điện dân dụng", score: 8.5, maxScore: 10, passScore: 5,
    status: "pass", examDate: "20/04/2026", note: "",
    listening: null, reading: null, writing: null, speaking: null },
  { id: "ER-009", examPlanId: "EP004", examPlanName: "Kỳ thi Điện DD Cuối khóa",
    studentId: "S037", studentCode: "HV-25-0905", studentName: "Bùi Thị Dung",
    seatNo: "SBD-D02", subject: "Điện dân dụng", score: 7.5, maxScore: 10, passScore: 5,
    status: "pass", examDate: "20/01/2026", note: "",
    listening: null, reading: null, writing: null, speaking: null },
  { id: "ER-010", examPlanId: "EP005", examPlanName: "Kỳ thi IC3 Kỳ 2",
    studentId: "S016", studentCode: "HV-26-0028", studentName: "Bùi Thị Hà",
    seatNo: "SBD-IC01", subject: "Tin học IC3", score: 6.5, maxScore: 10, passScore: 7,
    status: "fail", examDate: "15/04/2026", note: "Chưa đạt module 3",
    listening: null, reading: null, writing: null, speaking: null },
  { id: "ER-011", examPlanId: "EP005", examPlanName: "Kỳ thi IC3 Kỳ 2",
    studentId: "S035", studentCode: "HV-25-0903", studentName: "Ngô Thị Bích",
    seatNo: "SBD-IC02", subject: "Tin học IC3", score: 8.0, maxScore: 10, passScore: 7,
    status: "pass", examDate: "25/01/2026", note: "",
    listening: null, reading: null, writing: null, speaking: null },
  { id: "ER-012", examPlanId: "EP006", examPlanName: "Kỳ thi TOEIC 450+ Cuối khóa",
    studentId: "S019", studentCode: "HV-26-0031", studentName: "Nguyễn Thị Khánh",
    seatNo: "SBD-TOE01", subject: "TOEIC", score: 7.5, maxScore: 10, passScore: 5,
    status: "pass", examDate: "20/05/2026", note: "",
    listening: 7.5, reading: 7.5, writing: null, speaking: null },
  { id: "ER-013", examPlanId: "EP006", examPlanName: "Kỳ thi TOEIC 450+ Cuối khóa",
    studentId: "S032", studentCode: "HV-25-0900", studentName: "Phạm Quang Yên",
    seatNo: "SBD-TOE02", subject: "TOEIC", score: 8.5, maxScore: 10, passScore: 5,
    status: "pass", examDate: "20/12/2025", note: "Đạt 620 điểm",
    listening: 8.5, reading: 8.5, writing: null, speaking: null },
  { id: "ER-014", examPlanId: "EP007", examPlanName: "Kỳ thi Nấu ăn Cuối khóa",
    studentId: "S020", studentCode: "HV-26-0032", studentName: "Trần Văn Lâm",
    seatNo: "SBD-NA01", subject: "Kỹ thuật Nấu ăn", score: 8.5, maxScore: 10, passScore: 5,
    status: "pass", examDate: "05/04/2026", note: "",
    listening: null, reading: null, writing: null, speaking: null },
  { id: "ER-015", examPlanId: "EP007", examPlanName: "Kỳ thi Nấu ăn Cuối khóa",
    studentId: "S039", studentCode: "HV-25-0907", studentName: "Phan Thị Phương",
    seatNo: "SBD-NA02", subject: "Kỹ thuật Nấu ăn", score: 9.0, maxScore: 10, passScore: 5,
    status: "pass", examDate: "05/12/2025", note: "Xếp loại Giỏi",
    listening: null, reading: null, writing: null, speaking: null },
  { id: "ER-016", examPlanId: "EP008", examPlanName: "Kỳ thi Lập trình Web",
    studentId: "S011", studentCode: "HV-26-0023", studentName: "Phạm Minh Cường",
    seatNo: "SBD-WEB01", subject: "Lập trình Web", score: 8.0, maxScore: 10, passScore: 6,
    status: "pass", examDate: "20/05/2026", note: "",
    listening: null, reading: null, writing: null, speaking: null },
  { id: "ER-017", examPlanId: "EP008", examPlanName: "Kỳ thi Lập trình Web",
    studentId: "S006", studentCode: "HV-26-0012", studentName: "Lê Minh Trí",
    seatNo: "SBD-WEB02", subject: "Lập trình Web", score: 9.0, maxScore: 10, passScore: 6,
    status: "pass", examDate: "20/05/2026", note: "Dự án capstone xuất sắc",
    listening: null, reading: null, writing: null, speaking: null },
  { id: "ER-018", examPlanId: "EP009", examPlanName: "Kỳ thi Kế toán Thực hành",
    studentId: "S012", studentCode: "HV-26-0024", studentName: "Lê Thị Dung",
    seatNo: "SBD-KT01", subject: "Kế toán", score: 8.5, maxScore: 10, passScore: 5,
    status: "pass", examDate: "10/05/2026", note: "",
    listening: null, reading: null, writing: null, speaking: null },
  { id: "ER-019", examPlanId: "EP009", examPlanName: "Kỳ thi Kế toán Thực hành",
    studentId: "S033", studentCode: "HV-25-0901", studentName: "Lý Thị Đào",
    seatNo: "SBD-KT02", subject: "Kế toán", score: 9.0, maxScore: 10, passScore: 5,
    status: "pass", examDate: "20/02/2026", note: "Xếp loại Xuất sắc",
    listening: null, reading: null, writing: null, speaking: null },
  { id: "ER-020", examPlanId: "EP010", examPlanName: "Kỳ thi May CN Cuối khóa",
    studentId: "S014", studentCode: "HV-26-0026", studentName: "Ngô Thị Phương",
    seatNo: "SBD-MAY01", subject: "May Công nghiệp", score: 7.5, maxScore: 10, passScore: 5,
    status: "pass", examDate: "15/05/2026", note: "",
    listening: null, reading: null, writing: null, speaking: null },
  { id: "ER-021", examPlanId: "EP010", examPlanName: "Kỳ thi May CN Cuối khóa",
    studentId: "S038", studentCode: "HV-25-0906", studentName: "Vũ Minh Đức",
    seatNo: "SBD-MAY02", subject: "May Công nghiệp", score: 8.0, maxScore: 10, passScore: 5,
    status: "pass", examDate: "05/02/2026", note: "",
    listening: null, reading: null, writing: null, speaking: null },
  { id: "ER-022", examPlanId: "EP011", examPlanName: "Kỳ thi VSTEP B1 Cuối khóa",
    studentId: "S018", studentCode: "HV-26-0030", studentName: "Phan Thị Yến",
    seatNo: "SBD-VS01", subject: "Tiếng Anh VSTEP", score: 5.5, maxScore: 10, passScore: 5,
    status: "pass", examDate: "28/05/2026", note: "",
    listening: 6.0, reading: 5.5, writing: 5.0, speaking: 5.5 },
  { id: "ER-023", examPlanId: "EP011", examPlanName: "Kỳ thi VSTEP B1 Cuối khóa",
    studentId: "S036", studentCode: "HV-25-0904", studentName: "Đặng Văn Cường",
    seatNo: "SBD-VS02", subject: "Tiếng Anh VSTEP", score: 7.5, maxScore: 10, passScore: 5,
    status: "pass", examDate: "25/02/2026", note: "",
    listening: 7.5, reading: 7.5, writing: 7.5, speaking: 7.5 },
  { id: "ER-024", examPlanId: "EP012", examPlanName: "Kỳ thi Tiếng Nhật N4",
    studentId: "S013", studentCode: "HV-26-0025", studentName: "Hoàng Văn Em",
    seatNo: "SBD-JP01", subject: "Tiếng Nhật N4", score: 4.5, maxScore: 10, passScore: 5,
    status: "fail", examDate: "20/05/2026", note: "Chưa đạt ngữ pháp",
    listening: null, reading: null, writing: null, speaking: null },
  { id: "ER-025", examPlanId: "EP013", examPlanName: "Kỳ thi Thiết kế ĐH",
    studentId: "S022", studentCode: "HV-26-0034", studentName: "Phạm Văn Nam",
    seatNo: "SBD-DH01", subject: "Thiết kế Đồ họa", score: 7.0, maxScore: 10, passScore: 5,
    status: "pass", examDate: "25/04/2026", note: "",
    listening: null, reading: null, writing: null, speaking: null },
  { id: "ER-026", examPlanId: "EP013", examPlanName: "Kỳ thi Thiết kế ĐH",
    studentId: "S007", studentCode: "HV-26-0015", studentName: "Đỗ Xuân Trường",
    seatNo: "SBD-DH02", subject: "Thiết kế Đồ họa", score: 8.0, maxScore: 10, passScore: 5,
    status: "pass", examDate: "25/04/2026", note: "",
    listening: null, reading: null, writing: null, speaking: null },
  { id: "ER-027", examPlanId: "EP014", examPlanName: "Kỳ thi GDTX Lớp 10 HK1",
    studentId: "S010", studentCode: "HV-26-0022", studentName: "Trần Thị Bích",
    seatNo: "SBD-10-01", subject: "GDTX Lớp 10", score: 7.0, maxScore: 10, passScore: 5,
    status: "pass", examDate: "20/05/2026", note: "",
    listening: null, reading: null, writing: null, speaking: null },
  { id: "ER-028", examPlanId: "EP015", examPlanName: "Kỳ thi GDTX Lớp 11 HK1",
    studentId: "S021", studentCode: "HV-26-0033", studentName: "Lý Thị Mỹ",
    seatNo: "SBD-11-01", subject: "GDTX Lớp 11", score: 6.5, maxScore: 10, passScore: 5,
    status: "pass", examDate: "22/05/2026", note: "",
    listening: null, reading: null, writing: null, speaking: null },
  { id: "ER-029", examPlanId: "EP016", examPlanName: "Kỳ thi TA Giao tiếp Cuối khóa",
    studentId: "S009", studentCode: "HV-26-0021", studentName: "Nguyễn Văn An",
    seatNo: "SBD-GT01", subject: "Tiếng Anh Giao tiếp", score: 8.0, maxScore: 10, passScore: 5,
    status: "pass", examDate: "15/04/2026", note: "",
    listening: 8.0, reading: null, writing: null, speaking: 8.0 },
  { id: "ER-030", examPlanId: "EP016", examPlanName: "Kỳ thi TA Giao tiếp Cuối khóa",
    studentId: "S023", studentCode: "HV-26-0035", studentName: "Lê Minh Ngọc",
    seatNo: "SBD-GT02", subject: "Tiếng Anh Giao tiếp", score: 7.5, maxScore: 10, passScore: 5,
    status: "pass", examDate: "15/04/2026", note: "",
    listening: 7.5, reading: null, writing: null, speaking: 7.5 },
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
  // ── Sprint 1 — bổ sung chứng chỉ ────────────────────────────────────────────
  { id: "CERT-005", studentId: "S034", studentCode: "HV-25-0902", studentName: "Hoàng Văn An",
    courseId: "C004", courseName: "Kỹ thuật Hàn Điện Cơ bản", certType: "Chứng chỉ Hàn Điện",
    serialNo: "CC-HD-2026-034", issuedDate: "15/02/2026", expiryDate: null,
    status: "ISSUED", score: 9.0, examDate: "25/01/2026",
    level: "Sơ cấp", rank: "Xuất sắc", issuedBy: "Trung tâm GDNN-GDTX", dob: "31/12/2000", className: "HD-CB-K11" },
  { id: "CERT-006", studentId: "S035", studentCode: "HV-25-0903", studentName: "Ngô Thị Bích",
    courseId: "C003", courseName: "Tin học Văn phòng IC3", certType: "GCN Tin học CB",
    serialNo: "CC-IC3-2026-035", issuedDate: "10/02/2026", expiryDate: null,
    status: "ISSUED", score: 8.0, examDate: "25/01/2026",
    level: "Cơ bản", rank: "Giỏi", issuedBy: "Trung tâm GDNN-GDTX", dob: "08/02/2004", className: "IC3-K17" },
  { id: "CERT-007", studentId: "S036", studentCode: "HV-25-0904", studentName: "Đặng Văn Cường",
    courseId: "C001", courseName: "Tiếng Anh B1 VSTEP", certType: "Chứng chỉ VSTEP B1",
    serialNo: "CC-VSTEP-2026-036", issuedDate: "10/03/2026", expiryDate: "Không hết hạn",
    status: "ISSUED", score: 7.5, examDate: "25/02/2026",
    level: "B1", rank: "Khá", issuedBy: "Trung tâm GDNN-GDTX", dob: "20/10/2001", className: "TA-B1-K25" },
  { id: "CERT-008", studentId: "S037", studentCode: "HV-25-0905", studentName: "Bùi Thị Dung",
    courseId: "C005", courseName: "Điện dân dụng Nâng cao", certType: "GCN Điện dân dụng",
    serialNo: "CC-DD-2026-037", issuedDate: "10/02/2026", expiryDate: null,
    status: "ISSUED", score: 7.5, examDate: "20/01/2026",
    level: "Nâng cao", rank: "Khá", issuedBy: "Trung tâm GDNN-GDTX", dob: "15/03/2003", className: "DD-CB-K05" },
  { id: "CERT-009", studentId: "S038", studentCode: "HV-25-0906", studentName: "Vũ Minh Đức",
    courseId: "C013", courseName: "May Công nghiệp", certType: "GCN May Công nghiệp",
    serialNo: "CC-MAY-2026-038", issuedDate: "20/02/2026", expiryDate: null,
    status: "ISSUED", score: 8.0, examDate: "05/02/2026",
    level: "Sơ cấp", rank: "Giỏi", issuedBy: "Trung tâm GDNN-GDTX", dob: "27/07/2002", className: "MAY-CN-K08" },
  { id: "CERT-010", studentId: "S039", studentCode: "HV-25-0907", studentName: "Phan Thị Phương",
    courseId: "C007", courseName: "Kỹ thuật Nấu ăn 3 Tháng", certType: "GCN Nấu ăn",
    serialNo: "CC-NA-2025-039", issuedDate: "20/12/2025", expiryDate: null,
    status: "ISSUED", score: 9.0, examDate: "05/12/2025",
    level: "Sơ cấp", rank: "Xuất sắc", issuedBy: "Trung tâm GDNN-GDTX", dob: "04/05/2004", className: "NA-CB-K04" },
  { id: "CERT-011", studentId: "S032", studentCode: "HV-25-0900", studentName: "Phạm Quang Yên",
    courseId: "C002", courseName: "Luyện thi TOEIC 450+", certType: "Chứng chỉ TOEIC 620",
    serialNo: "CC-TOEIC-2026-032", issuedDate: "05/01/2026", expiryDate: "05/01/2028",
    status: "ISSUED", score: 8.5, examDate: "20/12/2025",
    level: "Upper-Intermediate", rank: "Giỏi", issuedBy: "Trung tâm GDNN-GDTX", dob: "22/04/2001", className: "TOEIC-K25" },
  { id: "CERT-012", studentId: "S033", studentCode: "HV-25-0901", studentName: "Lý Thị Đào",
    courseId: "C014", courseName: "Kế toán Thực hành", certType: "GCN Kế toán",
    serialNo: "CC-KT-2026-033", issuedDate: "10/03/2026", expiryDate: null,
    status: "ISSUED", score: 9.0, examDate: "20/02/2026",
    level: "Sơ cấp", rank: "Xuất sắc", issuedBy: "Trung tâm GDNN-GDTX", dob: "10/06/2002", className: "KT-TH-K08" },
  { id: "CERT-013", studentId: "S009", studentCode: "HV-26-0021", studentName: "Nguyễn Văn An",
    courseId: "C011", courseName: "Tiếng Anh Giao tiếp", certType: "GCN Tiếng Anh Giao tiếp",
    serialNo: "CC-GT-2026-009", issuedDate: "25/04/2026", expiryDate: null,
    status: "ISSUED", score: 8.0, examDate: "15/04/2026",
    level: "Cơ bản", rank: "Giỏi", issuedBy: "Trung tâm GDNN-GDTX", dob: "25/03/2006", className: "TA-GT-K12" },
  { id: "CERT-014", studentId: "S023", studentCode: "HV-26-0035", studentName: "Lê Minh Ngọc",
    courseId: "C011", courseName: "Tiếng Anh Giao tiếp", certType: "GCN Tiếng Anh Giao tiếp",
    serialNo: null, issuedDate: null, expiryDate: null,
    status: "PRINTED", score: 7.5, examDate: "15/04/2026",
    level: "Cơ bản", rank: "Khá", issuedBy: "Trung tâm GDNN-GDTX", dob: "20/12/2005", className: "TA-GT-K12" },
  { id: "CERT-015", studentId: "S015", studentCode: "HV-26-0027", studentName: "Đặng Văn Giang",
    courseId: "C004", courseName: "Kỹ thuật Hàn Điện Cơ bản", certType: "Chứng chỉ Hàn Điện",
    serialNo: null, issuedDate: null, expiryDate: null,
    status: "PRINTED", score: 8.0, examDate: "25/03/2026",
    level: "Sơ cấp", rank: "Giỏi", issuedBy: "Trung tâm GDNN-GDTX", dob: "11/12/2005", className: "HD-CB-K12" },
  { id: "CERT-016", studentId: "S017", studentCode: "HV-26-0029", studentName: "Vũ Minh Hùng",
    courseId: "C005", courseName: "Điện dân dụng Nâng cao", certType: "GCN Điện dân dụng",
    serialNo: null, issuedDate: null, expiryDate: null,
    status: "PENDING", score: 8.5, examDate: "20/04/2026",
    level: "Nâng cao", rank: "Giỏi", issuedBy: "Trung tâm GDNN-GDTX", dob: "23/06/2002", className: "DD-CB-K06" },
  { id: "CERT-017", studentId: "S019", studentCode: "HV-26-0031", studentName: "Nguyễn Thị Khánh",
    courseId: "C002", courseName: "Luyện thi TOEIC 450+", certType: "Chứng chỉ TOEIC",
    serialNo: null, issuedDate: null, expiryDate: null,
    status: "PENDING", score: 7.5, examDate: "20/05/2026",
    level: "Intermediate", rank: "Khá", issuedBy: "Trung tâm GDNN-GDTX", dob: "17/10/2003", className: "TOEIC-K27" },
  { id: "CERT-018", studentId: "S022", studentCode: "HV-26-0034", studentName: "Phạm Văn Nam",
    courseId: "C012", courseName: "Thiết kế Đồ họa Cơ bản", certType: "GCN Thiết kế ĐH",
    serialNo: null, issuedDate: null, expiryDate: null,
    status: "PENDING", score: 7.0, examDate: "25/04/2026",
    level: "Cơ bản", rank: "Khá", issuedBy: "Trung tâm GDNN-GDTX", dob: "04/03/2004", className: "DH-CB-K03" },
  { id: "CERT-019", studentId: "S007", studentCode: "HV-26-0015", studentName: "Đỗ Xuân Trường",
    courseId: "C012", courseName: "Thiết kế Đồ họa Cơ bản", certType: "GCN Thiết kế ĐH",
    serialNo: null, issuedDate: null, expiryDate: null,
    status: "PRINTED", score: 8.0, examDate: "25/04/2026",
    level: "Cơ bản", rank: "Giỏi", issuedBy: "Trung tâm GDNN-GDTX", dob: "10/10/2006", className: "DH-CB-K03" },
  { id: "CERT-020", studentId: "S020", studentCode: "HV-26-0032", studentName: "Trần Văn Lâm",
    courseId: "C007", courseName: "Kỹ thuật Nấu ăn 3 Tháng", certType: "GCN Nấu ăn",
    serialNo: null, issuedDate: null, expiryDate: null,
    status: "PENDING", score: 8.5, examDate: "05/04/2026",
    level: "Sơ cấp", rank: "Giỏi", issuedBy: "Trung tâm GDNN-GDTX", dob: "29/08/2006", className: "NA-CB-K05" },
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
  // ── Sprint 1 — bổ sung phiếu thu ────────────────────────────────────────────
  { id: "FP-006", receiptCode: "PT-26-0006", studentId: "S007", studentCode: "HV-26-0015",
    studentName: "Đỗ Xuân Trường", courseId: "C012", courseName: "Thiết kế Đồ họa Cơ bản",
    periodName: "Học phí Kỳ 1 - Thiết kế ĐH", amount: 4500000, discountAmount: 0, finalAmount: 4500000,
    paymentMethod: "Tiền mặt", paidDate: "13/01/2026", receivedBy: "Phạm Văn Hùng", note: "", status: "confirmed" },
  { id: "FP-007", receiptCode: "PT-26-0007", studentId: "S008", studentCode: "HV-25-0811",
    studentName: "Vũ Ngọc Trâm", courseId: "C014", courseName: "Kế toán Thực hành",
    periodName: "Học phí Kỳ 1 - Kế toán", amount: 5500000, discountAmount: 0, finalAmount: 5500000,
    paymentMethod: "Chuyển khoản", paidDate: "15/08/2025", receivedBy: "Nguyễn Thị Thanh", note: "", status: "confirmed" },
  { id: "FP-008", receiptCode: "PT-26-0008", studentId: "S009", studentCode: "HV-26-0021",
    studentName: "Nguyễn Văn An", courseId: "C011", courseName: "Tiếng Anh Giao tiếp Cơ bản",
    periodName: "Học phí Kỳ 1 - TA Giao tiếp", amount: 3000000, discountAmount: 0, finalAmount: 3000000,
    paymentMethod: "Tiền mặt", paidDate: "06/01/2026", receivedBy: "Nguyễn Thị Thanh", note: "", status: "confirmed" },
  { id: "FP-009", receiptCode: "PT-26-0009", studentId: "S010", studentCode: "HV-26-0022",
    studentName: "Trần Thị Bích", courseId: "C009", courseName: "Lớp 10 GDTX Khóa 2026",
    periodName: "Học phí HK1 - Lớp 10", amount: 2500000, discountAmount: 0, finalAmount: 2500000,
    paymentMethod: "Tiền mặt", paidDate: "07/01/2026", receivedBy: "Phạm Văn Hùng", note: "", status: "confirmed" },
  { id: "FP-010", receiptCode: "PT-26-0010", studentId: "S011", studentCode: "HV-26-0023",
    studentName: "Phạm Minh Cường", courseId: "C006", courseName: "Lập trình Web Frontend",
    periodName: "Học phí Kỳ 1 - Web Frontend", amount: 8500000, discountAmount: 0, finalAmount: 8500000,
    paymentMethod: "Chuyển khoản", paidDate: "10/01/2026", receivedBy: "Nguyễn Thị Thanh", note: "", status: "confirmed" },
  { id: "FP-011", receiptCode: "PT-26-0011", studentId: "S012", studentCode: "HV-26-0024",
    studentName: "Lê Thị Dung", courseId: "C014", courseName: "Kế toán Thực hành",
    periodName: "Học phí Kỳ 1 - Kế toán", amount: 5500000, discountAmount: 0, finalAmount: 5500000,
    paymentMethod: "Tiền mặt", paidDate: "11/01/2026", receivedBy: "Nguyễn Thị Thanh", note: "", status: "confirmed" },
  { id: "FP-012", receiptCode: "PT-26-0012", studentId: "S013", studentCode: "HV-26-0025",
    studentName: "Hoàng Văn Em", courseId: "C008", courseName: "Tiếng Nhật N4",
    periodName: "Học phí Kỳ 1 - Tiếng Nhật N4", amount: 4800000, discountAmount: 0, finalAmount: 4800000,
    paymentMethod: "Chuyển khoản", paidDate: "12/01/2026", receivedBy: "Phạm Văn Hùng", note: "", status: "confirmed" },
  { id: "FP-013", receiptCode: "PT-26-0013", studentId: "S014", studentCode: "HV-26-0026",
    studentName: "Ngô Thị Phương", courseId: "C013", courseName: "May Công nghiệp",
    periodName: "Học phí Kỳ 1 - May CN", amount: 3800000, discountAmount: 0, finalAmount: 3800000,
    paymentMethod: "Tiền mặt", paidDate: "13/01/2026", receivedBy: "Nguyễn Thị Thanh", note: "", status: "confirmed" },
  { id: "FP-014", receiptCode: "PT-26-0014", studentId: "S015", studentCode: "HV-26-0027",
    studentName: "Đặng Văn Giang", courseId: "C004", courseName: "Kỹ thuật Hàn Điện Cơ bản",
    periodName: "Học phí Kỳ 1 - Hàn Điện", amount: 3200000, discountAmount: 0, finalAmount: 3200000,
    paymentMethod: "Tiền mặt", paidDate: "14/01/2026", receivedBy: "Nguyễn Thị Thanh", note: "", status: "confirmed" },
  { id: "FP-015", receiptCode: "PT-26-0015", studentId: "S016", studentCode: "HV-26-0028",
    studentName: "Bùi Thị Hà", courseId: "C003", courseName: "Tin học Văn phòng IC3",
    periodName: "Học phí Kỳ 1 - Tin học IC3", amount: 2800000, discountAmount: 0, finalAmount: 2800000,
    paymentMethod: "Tiền mặt", paidDate: "15/01/2026", receivedBy: "Phạm Văn Hùng", note: "", status: "confirmed" },
  { id: "FP-016", receiptCode: "PT-26-0016", studentId: "S017", studentCode: "HV-26-0029",
    studentName: "Vũ Minh Hùng", courseId: "C005", courseName: "Điện dân dụng Nâng cao",
    periodName: "Học phí Kỳ 1 - Điện DD", amount: 3500000, discountAmount: 0, finalAmount: 3500000,
    paymentMethod: "Chuyển khoản", paidDate: "16/01/2026", receivedBy: "Nguyễn Thị Thanh", note: "", status: "confirmed" },
  { id: "FP-017", receiptCode: "PT-26-0017", studentId: "S018", studentCode: "HV-26-0030",
    studentName: "Phan Thị Yến", courseId: "C001", courseName: "Tiếng Anh B1 VSTEP Cấp tốc",
    periodName: "Học phí Kỳ 1 - TA VSTEP", amount: 3500000, discountAmount: 0, finalAmount: 3500000,
    paymentMethod: "Tiền mặt", paidDate: "17/01/2026", receivedBy: "Phạm Văn Hùng", note: "", status: "confirmed" },
  { id: "FP-018", receiptCode: "PT-26-0018", studentId: "S019", studentCode: "HV-26-0031",
    studentName: "Nguyễn Thị Khánh", courseId: "C002", courseName: "Luyện thi TOEIC 450+",
    periodName: "Học phí Kỳ 1 - TOEIC", amount: 4200000, discountAmount: 0, finalAmount: 4200000,
    paymentMethod: "Chuyển khoản", paidDate: "18/01/2026", receivedBy: "Nguyễn Thị Thanh", note: "", status: "confirmed" },
  { id: "FP-019", receiptCode: "PT-26-0019", studentId: "S020", studentCode: "HV-26-0032",
    studentName: "Trần Văn Lâm", courseId: "C007", courseName: "Kỹ thuật Nấu ăn 3 Tháng",
    periodName: "Học phí Kỳ 1 - Nấu ăn", amount: 3200000, discountAmount: 0, finalAmount: 3200000,
    paymentMethod: "Tiền mặt", paidDate: "20/01/2026", receivedBy: "Nguyễn Thị Thanh", note: "", status: "confirmed" },
  { id: "FP-020", receiptCode: "PT-26-0020", studentId: "S021", studentCode: "HV-26-0033",
    studentName: "Lý Thị Mỹ", courseId: "C010", courseName: "Lớp 11 GDTX Khóa 2026",
    periodName: "Học phí HK1 - Lớp 11", amount: 2500000, discountAmount: 0, finalAmount: 2500000,
    paymentMethod: "Tiền mặt", paidDate: "21/01/2026", receivedBy: "Phạm Văn Hùng", note: "", status: "confirmed" },
  { id: "FP-021", receiptCode: "PT-26-0021", studentId: "S022", studentCode: "HV-26-0034",
    studentName: "Phạm Văn Nam", courseId: "C012", courseName: "Thiết kế Đồ họa Cơ bản",
    periodName: "Học phí Kỳ 1 - Thiết kế", amount: 4500000, discountAmount: 0, finalAmount: 4500000,
    paymentMethod: "Tiền mặt", paidDate: "22/01/2026", receivedBy: "Nguyễn Thị Thanh", note: "", status: "confirmed" },
  { id: "FP-022", receiptCode: "PT-26-0022", studentId: "S023", studentCode: "HV-26-0035",
    studentName: "Lê Minh Ngọc", courseId: "C011", courseName: "Tiếng Anh Giao tiếp Cơ bản",
    periodName: "Học phí Kỳ 1 - TA Giao tiếp", amount: 3000000, discountAmount: 0, finalAmount: 3000000,
    paymentMethod: "Chuyển khoản", paidDate: "23/01/2026", receivedBy: "Nguyễn Thị Thanh", note: "", status: "confirmed" },
  { id: "FP-023", receiptCode: "PT-25-0900", studentId: "S032", studentCode: "HV-25-0900",
    studentName: "Phạm Quang Yên", courseId: "C002", courseName: "Luyện thi TOEIC 450+",
    periodName: "Học phí Kỳ 1 - TOEIC K25", amount: 4200000, discountAmount: 0, finalAmount: 4200000,
    paymentMethod: "Chuyển khoản", paidDate: "01/09/2025", receivedBy: "Nguyễn Thị Thanh", note: "", status: "confirmed" },
  { id: "FP-024", receiptCode: "PT-25-0901", studentId: "S033", studentCode: "HV-25-0901",
    studentName: "Lý Thị Đào", courseId: "C014", courseName: "Kế toán Thực hành",
    periodName: "Học phí Kỳ 1 - Kế toán K08", amount: 5500000, discountAmount: 0, finalAmount: 5500000,
    paymentMethod: "Chuyển khoản", paidDate: "02/09/2025", receivedBy: "Nguyễn Thị Thanh", note: "", status: "confirmed" },
  { id: "FP-025", receiptCode: "PT-25-0902", studentId: "S034", studentCode: "HV-25-0902",
    studentName: "Hoàng Văn An", courseId: "C004", courseName: "Kỹ thuật Hàn Điện Cơ bản",
    periodName: "Học phí Kỳ 1 - Hàn Điện K11", amount: 3200000, discountAmount: 0, finalAmount: 3200000,
    paymentMethod: "Tiền mặt", paidDate: "03/09/2025", receivedBy: "Phạm Văn Hùng", note: "", status: "confirmed" },
  { id: "FP-026", receiptCode: "PT-25-0903", studentId: "S035", studentCode: "HV-25-0903",
    studentName: "Ngô Thị Bích", courseId: "C003", courseName: "Tin học Văn phòng IC3",
    periodName: "Học phí Kỳ 1 - IC3 K17", amount: 2800000, discountAmount: 0, finalAmount: 2800000,
    paymentMethod: "Tiền mặt", paidDate: "04/09/2025", receivedBy: "Nguyễn Thị Thanh", note: "", status: "confirmed" },
  { id: "FP-027", receiptCode: "PT-25-0904", studentId: "S036", studentCode: "HV-25-0904",
    studentName: "Đặng Văn Cường", courseId: "C001", courseName: "Tiếng Anh B1 VSTEP Cấp tốc",
    periodName: "Học phí Kỳ 1 - VSTEP K25", amount: 3500000, discountAmount: 0, finalAmount: 3500000,
    paymentMethod: "Chuyển khoản", paidDate: "05/09/2025", receivedBy: "Nguyễn Thị Thanh", note: "", status: "confirmed" },
  { id: "FP-028", receiptCode: "PT-25-0905", studentId: "S037", studentCode: "HV-25-0905",
    studentName: "Bùi Thị Dung", courseId: "C005", courseName: "Điện dân dụng Nâng cao",
    periodName: "Học phí Kỳ 1 - Điện DD K05", amount: 3500000, discountAmount: 0, finalAmount: 3500000,
    paymentMethod: "Tiền mặt", paidDate: "06/09/2025", receivedBy: "Phạm Văn Hùng", note: "", status: "confirmed" },
  { id: "FP-029", receiptCode: "PT-25-0906", studentId: "S038", studentCode: "HV-25-0906",
    studentName: "Vũ Minh Đức", courseId: "C013", courseName: "May Công nghiệp",
    periodName: "Học phí Kỳ 1 - May CN K08", amount: 3800000, discountAmount: 0, finalAmount: 3800000,
    paymentMethod: "Chuyển khoản", paidDate: "07/09/2025", receivedBy: "Nguyễn Thị Thanh", note: "", status: "confirmed" },
  { id: "FP-030", receiptCode: "PT-25-0907", studentId: "S039", studentCode: "HV-25-0907",
    studentName: "Phan Thị Phương", courseId: "C007", courseName: "Kỹ thuật Nấu ăn 3 Tháng",
    periodName: "Học phí Kỳ 1 - Nấu ăn K04", amount: 3200000, discountAmount: 0, finalAmount: 3200000,
    paymentMethod: "Tiền mặt", paidDate: "08/09/2025", receivedBy: "Nguyễn Thị Thanh", note: "", status: "confirmed" },
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
  // ── Sprint 1 — bổ sung kế hoạch đào tạo ─────────────────────────────────────
  { id: "KH-26-006", code: "KH-26-006", title: "Kế hoạch Mở lớp May Công nghiệp",
    centerName: "TT GDNN-GDTX Nghệ An", type: "GDNN", term: "Q1/2026",
    expectedStudents: 120, submittedAt: "18/01/2026", status: "approved",
    files: ["De_an_may_CN_2026.pdf"],
    history: [
      { action: "Tạo mới bản nháp", time: "15/01/2026 08:30", actor: "Giáo vụ TT" },
      { action: "Nộp Sở phê duyệt", time: "18/01/2026 10:00", actor: "Giám đốc TT" },
      { action: "Sở GD&ĐT phê duyệt", time: "20/01/2026 14:00", actor: "Phòng GDNN" },
    ],
    comments: "" },
  { id: "KH-26-007", code: "KH-26-007", title: "Kế hoạch Phổ cập GDTX Lớp 10-12",
    centerName: "TT GDNN-GDTX Diễn Châu", type: "GDTX", term: "Năm 2026",
    expectedStudents: 600, submittedAt: "20/01/2026", status: "approved",
    files: ["KH_pho_cap_2026.pdf", "Danh_sach_hoc_vien.xlsx"],
    history: [
      { action: "Tạo mới bản nháp", time: "17/01/2026 09:00", actor: "Giáo vụ TT" },
      { action: "Gửi Sở thẩm định", time: "20/01/2026 14:00", actor: "Giám đốc TT" },
      { action: "Sở GD phê duyệt kế hoạch chỉ tiêu", time: "22/01/2026 10:30", actor: "Phòng GDTX" },
    ],
    comments: "" },
  { id: "KH-26-008", code: "KH-26-008", title: "Kế hoạch Đào tạo Nghề Điện dân dụng",
    centerName: "TT Dạy nghề Việt Đức", type: "GDNN", term: "Q2/2026",
    expectedStudents: 180, submittedAt: "22/01/2026", status: "pending",
    files: ["De_cuong_dien_dd.pdf"],
    history: [
      { action: "Tạo mới bản nháp", time: "19/01/2026 08:00", actor: "Giáo vụ TT" },
      { action: "Trình Sở", time: "22/01/2026 15:00", actor: "Giám đốc TT" },
    ],
    comments: "" },
  { id: "KH-26-009", code: "KH-26-009", title: "Kế hoạch Khai thác Thị trường Ngoại ngữ Q2",
    centerName: "Ngoại ngữ Hoa Hồng", type: "Ngôn ngữ", term: "Q2/2026",
    expectedStudents: 300, submittedAt: null, status: "draft",
    files: [],
    history: [{ action: "Tạo mới bản nháp", time: "25/01/2026 09:00", actor: "Giáo vụ TT" }],
    comments: "" },
  { id: "KH-26-010", code: "KH-26-010", title: "Kế hoạch Bồi dưỡng Nghiệp vụ Kế toán",
    centerName: "TT GDNN-GDTX Yên Thành", type: "GDNN", term: "Năm 2026",
    expectedStudents: 250, submittedAt: "28/01/2026", status: "revision",
    files: ["De_cuong_ke_toan.pdf"],
    history: [
      { action: "Tạo mới bản nháp", time: "24/01/2026 09:00", actor: "Giáo vụ TT" },
      { action: "Trình Sở", time: "28/01/2026 14:00", actor: "Giám đốc TT" },
      { action: "Yêu cầu bổ sung chương trình học", time: "30/01/2026 10:00", actor: "Phòng Chuyên môn" },
    ],
    comments: "Đề nghị bổ sung nội dung Kế toán thuế theo TT 200/2014/TT-BTC và cập nhật phần mềm MISA 2025." },
  { id: "KH-26-011", code: "KH-26-011", title: "Kế hoạch Liên kết Đào tạo Lập trình",
    centerName: "Tin học Tiến Đạt", type: "Tin học", term: "Q2/2026",
    expectedStudents: 150, submittedAt: "01/02/2026", status: "approved",
    files: ["HD_lien_ket_IT.pdf", "Chuong_trinh_dao_tao.pdf"],
    history: [
      { action: "Tạo mới bản nháp", time: "29/01/2026 09:00", actor: "Giáo vụ TT" },
      { action: "Trình Sở phê duyệt liên kết", time: "01/02/2026 10:00", actor: "Giám đốc TT" },
      { action: "Phê duyệt chương trình liên kết đào tạo", time: "03/02/2026 14:00", actor: "Sở GD&ĐT" },
    ],
    comments: "" },
  { id: "KH-26-012", code: "KH-26-012", title: "Kế hoạch Phát triển Kỹ năng Mềm cho HSSV",
    centerName: "Ngoại ngữ Không Gian", type: "Ngôn ngữ", term: "Năm 2026",
    expectedStudents: 200, submittedAt: "05/02/2026", status: "pending",
    files: ["KH_ky_nang_mem_2026.pdf"],
    history: [
      { action: "Tạo mới bản nháp", time: "02/02/2026 08:00", actor: "Giáo vụ TT" },
      { action: "Nộp Sở thẩm định", time: "05/02/2026 11:00", actor: "Giám đốc TT" },
    ],
    comments: "" },
  { id: "KH-26-013", code: "KH-26-013", title: "Kế hoạch Đào tạo Kỹ thuật Hàn Q2",
    centerName: "TT Dạy nghề Nhật Nghề", type: "GDNN", term: "Q2/2026",
    expectedStudents: 90, submittedAt: "08/02/2026", status: "approved",
    files: ["De_cuong_han_Q2.pdf"],
    history: [
      { action: "Tạo mới bản nháp", time: "05/02/2026 09:00", actor: "Giáo vụ TT" },
      { action: "Trình Sở", time: "08/02/2026 14:00", actor: "Giám đốc TT" },
      { action: "Phê duyệt chỉ tiêu", time: "10/02/2026 09:30", actor: "Phòng GDNN" },
    ],
    comments: "" },
  { id: "KH-26-014", code: "KH-26-014", title: "Kế hoạch Nâng cấp Chương trình Nấu ăn",
    centerName: "TT GDNN-GDTX Quỳnh Lưu", type: "GDNN", term: "Năm 2026",
    expectedStudents: 160, submittedAt: null, status: "draft",
    files: [],
    history: [{ action: "Tạo mới bản nháp", time: "10/02/2026 08:00", actor: "Giáo vụ TT" }],
    comments: "" },
  { id: "KH-26-015", code: "KH-26-015", title: "Chương trình Bồi dưỡng GV toàn tỉnh 2026",
    centerName: "TT GDNN-GDTX Nghệ An", type: "GDTX", term: "Năm 2026",
    expectedStudents: 500, submittedAt: "15/02/2026", status: "approved",
    files: ["KH_BD_GV_2026.pdf", "Danh_sach_giao_vien.xlsx", "Kinh_phi_du_toan.pdf"],
    history: [
      { action: "Tạo mới bản nháp", time: "10/02/2026 09:00", actor: "Giáo vụ Sở" },
      { action: "Trình lãnh đạo Sở duyệt", time: "13/02/2026 10:00", actor: "Phòng GDTX" },
      { action: "Lãnh đạo Sở phê duyệt chương trình", time: "15/02/2026 14:00", actor: "Giám đốc Sở GD" },
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

const SEED_CENTERS: AppCenter[] = [
  { id: "CTR-001", code: "TT-001", name: "Trung tâm GDNN-GDTX Nghệ An", shortName: "TT GDNN-GDTX NA",
    type: "GDNN-GDTX", address: "15 Trường Thi, TP. Vinh, Nghệ An", phone: "0238.3555.001", email: "ttgdnn@nghean.edu.vn",
    director: "Nguyễn Văn Thành", licenseNo: "SoGD-NA-001/2020", licenseDate: "01/01/2020", licenseExpiry: null,
    establishedDate: "15/05/2010", studentCapacity: 1200, currentStudents: 856,
    teacherCount: 45, classroomCount: 20, status: "active", rating: 4, lastInspectionDate: "15/02/2026",
    lastInspectionScore: 88, managerId: "center-001", district: "TP. Vinh", note: "Trung tâm đầu mối toàn tỉnh" },
  { id: "CTR-002", code: "TT-002", name: "Trung tâm Ngoại ngữ VUS Nghệ An", shortName: "VUS Nghệ An",
    type: "Ngoại ngữ", address: "82 Đinh Tiên Hoàng, TP. Vinh, Nghệ An", phone: "0238.3666.002", email: "vus.nghean@vus.edu.vn",
    director: "Phạm Thị Lệ Thủy", licenseNo: "SoGD-NA-002/2018", licenseDate: "15/03/2018", licenseExpiry: "15/03/2028",
    establishedDate: "01/09/2015", studentCapacity: 800, currentStudents: 612,
    teacherCount: 28, classroomCount: 12, status: "active", rating: 5, lastInspectionDate: "15/02/2026",
    lastInspectionScore: 92, managerId: "center-002", district: "TP. Vinh", note: "" },
  { id: "CTR-003", code: "TT-003", name: "Tin học Tiến Đạt", shortName: "TH Tiến Đạt",
    type: "Tin học", address: "40 Nguyễn Du, TP. Vinh, Nghệ An", phone: "0238.3777.003", email: "tiendat@example.com",
    director: "Lê Văn Tiến", licenseNo: "SoGD-NA-003/2019", licenseDate: "10/06/2019", licenseExpiry: "10/06/2029",
    establishedDate: "20/08/2017", studentCapacity: 400, currentStudents: 285,
    teacherCount: 12, classroomCount: 6, status: "active", rating: 3, lastInspectionDate: "05/04/2026",
    lastInspectionScore: 72, managerId: null, district: "TP. Vinh", note: "Đang thanh tra định kỳ" },
  { id: "CTR-004", code: "TT-004", name: "Trung tâm GDNN-GDTX Tân Bình", shortName: "TT Tân Bình",
    type: "GDNN-GDTX", address: "25 Hùng Vương, TX. Thái Hòa, Nghệ An", phone: "0236.3888.004", email: "ttgdnn.tanbinh@nghean.edu.vn",
    director: "Trần Văn Tùng", licenseNo: "SoGD-NA-004/2016", licenseDate: "05/04/2016", licenseExpiry: null,
    establishedDate: "12/01/2012", studentCapacity: 600, currentStudents: 320,
    teacherCount: 22, classroomCount: 10, status: "active", rating: 2, lastInspectionDate: "20/03/2026",
    lastInspectionScore: 65, managerId: null, district: "TX. Thái Hòa", note: "Yêu cầu bổ sung cơ sở vật chất" },
  { id: "CTR-005", code: "TT-005", name: "Ngoại ngữ Không Gian", shortName: "NN Không Gian",
    type: "Ngoại ngữ", address: "11 Quang Trung, Huyện Diễn Châu, Nghệ An", phone: "0235.3999.005", email: "khonggian@example.com",
    director: "Nguyễn Thị Mai Hương", licenseNo: "SoGD-NA-005/2021", licenseDate: "20/07/2021", licenseExpiry: "20/07/2031",
    establishedDate: "01/09/2019", studentCapacity: 300, currentStudents: 195,
    teacherCount: 10, classroomCount: 5, status: "active", rating: null, lastInspectionDate: null,
    lastInspectionScore: null, managerId: null, district: "Huyện Diễn Châu", note: "Lên lịch thanh tra tháng 5/2026" },
  { id: "CTR-006", code: "TT-006", name: "Ngoại ngữ Hoa Hồng", shortName: "NN Hoa Hồng",
    type: "Ngoại ngữ", address: "50 Phan Đình Phùng, Huyện Yên Thành, Nghệ An", phone: "0236.3100.006", email: "hoahong@example.com",
    director: "Lê Thị Bích Lan", licenseNo: "SoGD-NA-006/2022", licenseDate: "10/08/2022", licenseExpiry: "10/08/2032",
    establishedDate: "01/01/2021", studentCapacity: 250, currentStudents: 148,
    teacherCount: 8, classroomCount: 4, status: "active", rating: null, lastInspectionDate: null,
    lastInspectionScore: null, managerId: null, district: "Huyện Yên Thành", note: "" },
  { id: "CTR-007", code: "TT-007", name: "Trung tâm Dạy nghề Việt Đức", shortName: "TT Việt Đức",
    type: "Dạy nghề", address: "70 Nguyễn Trãi, Huyện Quỳnh Lưu, Nghệ An", phone: "0237.3200.007", email: "vietduc@example.com",
    director: "Phạm Quang Minh", licenseNo: "SoGD-NA-007/2017", licenseDate: "15/09/2017", licenseExpiry: null,
    establishedDate: "22/11/2014", studentCapacity: 500, currentStudents: 342,
    teacherCount: 18, classroomCount: 8, status: "active", rating: 4, lastInspectionDate: "10/01/2026",
    lastInspectionScore: 85, managerId: null, district: "Huyện Quỳnh Lưu", note: "" },
  { id: "CTR-008", code: "TT-008", name: "Trung tâm Dạy nghề Nhật Nghề", shortName: "TT Nhật Nghề",
    type: "Dạy nghề", address: "30 Lý Thường Kiệt, Huyện Nghi Lộc, Nghệ An", phone: "0238.3300.008", email: "nhatnghia@example.com",
    director: "Nguyễn Văn Nhật", licenseNo: "SoGD-NA-008/2020", licenseDate: "01/02/2020", licenseExpiry: null,
    establishedDate: "20/06/2018", studentCapacity: 350, currentStudents: 210,
    teacherCount: 14, classroomCount: 7, status: "active", rating: 4, lastInspectionDate: "08/02/2026",
    lastInspectionScore: 85, managerId: null, district: "Huyện Nghi Lộc", note: "" },
  { id: "CTR-009", code: "TT-009", name: "Ngoại ngữ Sakura", shortName: "NN Sakura",
    type: "Ngoại ngữ", address: "18 Chu Văn An, TP. Vinh, Nghệ An", phone: "0238.3400.009", email: "sakura@example.com",
    director: "Yamamoto Hanako (Nguyễn Hoa)", licenseNo: "SoGD-NA-009/2023", licenseDate: "15/03/2023", licenseExpiry: "15/03/2033",
    establishedDate: "01/04/2022", studentCapacity: 200, currentStudents: 125,
    teacherCount: 7, classroomCount: 3, status: "active", rating: null, lastInspectionDate: null,
    lastInspectionScore: null, managerId: null, district: "TP. Vinh", note: "Liên kết Nhật Bản" },
  { id: "CTR-010", code: "TT-010", name: "TT GDNN-GDTX Diễn Châu", shortName: "TT Diễn Châu",
    type: "GDNN-GDTX", address: "5 Lê Lợi, TT Diễn Châu, Huyện Diễn Châu, Nghệ An", phone: "0235.3500.010", email: "ttdc@nghean.edu.vn",
    director: "Trần Thị Minh Châu", licenseNo: "SoGD-NA-010/2015", licenseDate: "01/01/2015", licenseExpiry: null,
    establishedDate: "10/10/2011", studentCapacity: 700, currentStudents: 445,
    teacherCount: 30, classroomCount: 14, status: "active", rating: 4, lastInspectionDate: "12/01/2026",
    lastInspectionScore: 82, managerId: null, district: "Huyện Diễn Châu", note: "" },
];

// ─── Business helpers ────────────────────────────────────────────────────────

function computeCertExpiry(certType: string): string {
  const EXPIRY_MAP: [string, number][] = [
    ["IELTS", 2], ["TOEIC", 2], ["VSTEP", 0], ["JLPT", 5], ["HSK", 3],
    ["Tin học", 5], ["IC3", 3], ["Ngoại ngữ", 0],
  ];
  const match = EXPIRY_MAP.find(([k]) => certType.includes(k));
  if (!match || match[1] === 0) return "Không hết hạn";
  const d = new Date();
  d.setFullYear(d.getFullYear() + match[1]);
  return d.toLocaleDateString("vi-VN");
}

const CLASS_STATUS_NEXT: Record<AppClass["status"], AppClass["status"] | null> = {
  "Tuyển sinh": "Hoạt động",
  "Hoạt động":  "Kết thúc",
  "Kết thúc":   null,
  "Hủy":        null,
};

const SEED_AUDIT_LOGS: AppAuditLog[] = [];

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

  addEnrollment: (e: Omit<AppEnrollment, "id">) => BizResult<AppEnrollment>;
  updateEnrollmentStatus: (id: string, status: AppEnrollment["status"]) => void;

  addClass: (c: Omit<AppClass, "id">) => void;
  updateClass: (id: string, updates: Partial<AppClass>) => void;
  advanceClassStatus: (id: string) => BizResult;
  checkScheduleConflict: (teacherId: string, roomId: string, scheduleItems: AppClass["scheduleItems"], excludeId?: string) => AppClass[];

  addExamResult: (r: Omit<AppExamResult, "id">) => void;
  updateExamResult: (id: string, updates: Partial<AppExamResult>) => void;
  lockedExamPlans: string[];
  lockExamPlan: (id: string) => void;
  unlockExamPlan: (id: string) => void;

  addCertificate: (c: Omit<AppCertificate, "id">) => void;
  updateCertificateStatus: (id: string, status: AppCertificate["status"], serialNo?: string) => BizResult;
  isFeesPaid: (studentId: string, courseId: string) => boolean;
  isExamPassed: (studentId: string, courseId: string) => boolean;

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
  addStudentTransfer: (t: Omit<AppStudentTransfer, "id">) => BizResult<AppStudentTransfer>;

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
  addFeeDiscountApplication: (a: Omit<AppFeeDiscountApplication, "id">) => BizResult;

  // Audit
  auditLogs: AppAuditLog[];

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
  const [centers, setCenters]                                 = useLS<AppCenter[]>("centers", SEED_CENTERS);
  const [lockedExamPlans, setLockedExamPlans]                 = useLS<string[]>("lockedExamPlans", []);
  const [auditLogs, setAuditLogs]                             = useLS<AppAuditLog[]>("auditLogs", SEED_AUDIT_LOGS);

  // Internal audit helper (defined early so other callbacks can depend on it)
  const _addAuditLog = useCallback((log: Omit<AppAuditLog, "id" | "time">) => {
    setAuditLogs(prev => [{ ...log, id: genId("AL"), time: new Date().toISOString() }, ...prev].slice(0, 300));
  }, [setAuditLogs]);

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
  const addEnrollment = useCallback((e: Omit<AppEnrollment, "id">): BizResult<AppEnrollment> => {
    // [A] Capacity check
    const cls = classes.find(c => c.id === e.classId);
    if (cls && cls.currentStudents >= cls.maxStudents) {
      return { ok: false, error: `Lớp "${cls.courseName}" đã đủ sĩ số (${cls.maxStudents}/${cls.maxStudents}). Không thể đăng ký thêm.` };
    }
    // [A] Duplicate enrollment check
    const dup = enrollments.find(en =>
      en.studentId === e.studentId && en.courseId === e.courseId &&
      (en.status === "active" || en.status === "reserve")
    );
    if (dup) {
      return { ok: false, error: `Học viên đã đăng ký và đang hoạt động trong khóa "${e.courseName}".` };
    }
    const newE = { ...e, id: genId("EN") };
    setEnrollments(p => [newE, ...p]);
    if (e.classId) {
      setClasses(p => p.map(c => c.id === e.classId ? { ...c, currentStudents: c.currentStudents + 1 } : c));
    }
    _addAuditLog({ actor: "admin", action: "ENROLL", entity: "enrollment", entityId: newE.id, detail: `${e.studentName} → ${e.courseName}` });
    return { ok: true, data: newE };
  }, [setEnrollments, setClasses, classes, enrollments, _addAuditLog]);

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

  // [B] Enforce class lifecycle: Tuyển sinh → Hoạt động → Kết thúc
  const advanceClassStatus = useCallback((id: string): BizResult => {
    const cls = classes.find(c => c.id === id);
    if (!cls) return { ok: false, error: "Không tìm thấy lớp." };
    const next = CLASS_STATUS_NEXT[cls.status];
    if (!next) return { ok: false, error: `Lớp đang ở trạng thái "${cls.status}", không thể tiến thêm.` };
    if (next === "Hoạt động" && cls.currentStudents === 0) {
      return { ok: false, error: "Lớp chưa có học viên nào. Phải có ít nhất 1 học viên để khai giảng." };
    }
    setClasses(p => p.map(c => c.id === id ? { ...c, status: next } : c));
    _addAuditLog({ actor: "admin", action: "CLASS_STATUS", entity: "class", entityId: id, detail: `${cls.courseName}: ${cls.status} → ${next}` });
    return { ok: true, data: undefined };
  }, [classes, setClasses, _addAuditLog]);

  // [C] Detect teacher/room schedule conflicts
  const checkScheduleConflict = useCallback((
    teacherId: string, roomId: string,
    scheduleItems: AppClass["scheduleItems"],
    excludeId?: string
  ): AppClass[] => {
    return classes.filter(c => {
      if (c.id === excludeId || c.status === "Kết thúc" || c.status === "Hủy") return false;
      const sameTeacher = teacherId !== "" && c.teacherId === teacherId;
      const sameRoom    = roomId    !== "" && c.room      === roomId;
      if (!sameTeacher && !sameRoom) return false;
      return scheduleItems.some(item =>
        c.scheduleItems.some(existing =>
          existing.dayOfWeek === item.dayOfWeek &&
          existing.startTime < item.endTime &&
          item.startTime < existing.endTime
        )
      );
    });
  }, [classes]);

  // ── Exam Results ──
  const addExamResult = useCallback((r: Omit<AppExamResult, "id">) => {
    setExamResults(p => [{ ...r, id: genId("ER") }, ...p]);
  }, [setExamResults]);

  const updateExamResult = useCallback((id: string, updates: Partial<AppExamResult>) => {
    setExamResults(p => p.map(r => r.id === id ? { ...r, ...updates } : r));
  }, [setExamResults]);

  // [B] Persist exam plan lock state
  const lockExamPlan = useCallback((id: string) => {
    setLockedExamPlans(prev => prev.includes(id) ? prev : [...prev, id]);
  }, [setLockedExamPlans]);

  const unlockExamPlan = useCallback((id: string) => {
    setLockedExamPlans(prev => prev.filter(x => x !== id));
  }, [setLockedExamPlans]);

  // ── Certificates ──
  const addCertificate = useCallback((c: Omit<AppCertificate, "id">) => {
    setCertificates(p => [{ ...c, id: genId("CERT") }, ...p]);
  }, [setCertificates]);

  const updateCertificateStatus = useCallback((id: string, status: AppCertificate["status"], serialNo?: string): BizResult => {
    const cert = certificates.find(c => c.id === id);
    if (!cert) return { ok: false, error: "Không tìm thấy chứng chỉ." };

    if (status === "PRINTED") {
      // [A] Gate 1: exam passed
      const passed = examResults.some(r => r.studentId === cert.studentId && r.status === "pass");
      if (!passed) {
        return { ok: false, error: `"${cert.studentName}" chưa có kết quả thi ĐẠT. Không thể in chứng chỉ.` };
      }
      // [A] Gate 2: fee paid
      const paid = feeReceipts.some(r =>
        r.studentId === cert.studentId && r.courseId === cert.courseId && r.status === "confirmed"
      );
      if (!paid) {
        return { ok: false, error: `"${cert.studentName}" chưa đóng học phí khoá "${cert.courseName}".` };
      }
      // [A] Gate 3: cert stock available
      const batch = certStockBatches.find(b => {
        if (b.certType !== cert.certType || b.status === "pending") return false;
        const used = certificates.filter(c => c.serialNo?.startsWith(b.batchCode + "-")).length;
        return b.allocated > used;
      });
      if (!batch) {
        return { ok: false, error: `Hết phôi loại "${cert.certType}". Vui lòng rót thêm phôi tại mục Quản lý Phôi CC.` };
      }
      const usedInBatch = certificates.filter(c => c.serialNo?.startsWith(batch.batchCode + "-")).length;
      const sn = serialNo || `${batch.batchCode}-${String(usedInBatch + 1).padStart(4, "0")}`;
      setCertificates(p => p.map(c => c.id === id ? { ...c, status: "PRINTED", serialNo: sn } : c));
      _addAuditLog({ actor: "admin", action: "CERT_PRINT", entity: "certificate", entityId: id, detail: `#${sn} — ${cert.studentName}` });
      return { ok: true, data: undefined };
    }

    if (status === "ISSUED") {
      const now = new Date().toLocaleDateString("vi-VN");
      const expiry = computeCertExpiry(cert.certType);
      setCertificates(p => p.map(c =>
        c.id === id ? { ...c, status: "ISSUED", issuedDate: now, expiryDate: expiry || c.expiryDate } : c
      ));
      _addAuditLog({ actor: "admin", action: "CERT_ISSUE", entity: "certificate", entityId: id, detail: `${cert.studentName} — ${cert.certType}` });
      // [C] Low stock warning notification
      const typeStock = certStockBatches
        .filter(b => b.certType === cert.certType && b.status !== "pending")
        .reduce((acc, b) => acc + b.allocated, 0);
      const typeUsed = certificates.filter(c => c.certType === cert.certType && c.status !== "PENDING").length + 1;
      const remaining = typeStock - typeUsed;
      if (remaining >= 0 && remaining <= 5) {
        setNotifications(prev => [{
          id: genId("NT"), type: "system" as AppNotifType,
          title: "Cảnh báo sắp hết phôi",
          message: `Phôi loại "${cert.certType}" chỉ còn ${remaining} cái. Cần liên hệ Sở rót thêm sớm.`,
          time: new Date().toISOString(), read: false,
          link: "/admin/cert-stock", targetRole: "department",
        }, ...prev].slice(0, 50));
      }
      return { ok: true, data: undefined };
    }

    setCertificates(p => p.map(c => c.id === id ? { ...c, status } : c));
    return { ok: true, data: undefined };
  }, [certificates, examResults, feeReceipts, certStockBatches, setCertificates, setNotifications, _addAuditLog]);

  // [C] Business query helpers
  const isFeesPaid = useCallback((studentId: string, courseId: string): boolean =>
    feeReceipts.some(r => r.studentId === studentId && r.courseId === courseId && r.status === "confirmed"),
  [feeReceipts]);

  const isExamPassed = useCallback((studentId: string, courseId: string): boolean => {
    const enroll = enrollments.find(e => e.studentId === studentId && e.courseId === courseId);
    if (!enroll) return false;
    return examResults.some(r => r.studentId === studentId && r.status === "pass");
  }, [enrollments, examResults]);

  // ── Fee Receipts ──
  const addFeeReceipt = useCallback((r: Omit<AppFeeReceipt, "id">): AppFeeReceipt => {
    const newR = { ...r, id: genId("FP") };
    setFeeReceipts(p => [newR, ...p]);
    // [B] Auto-sync fee period paidCount + collectedAmount
    if (r.status === "confirmed") {
      setFeePeriods(p => p.map(fp =>
        fp.courseName === r.courseName || fp.name === r.periodName
          ? { ...fp, paidCount: fp.paidCount + 1, collectedAmount: fp.collectedAmount + r.finalAmount }
          : fp
      ));
    }
    _addAuditLog({ actor: "admin", action: "FEE_RECEIPT", entity: "fee_receipt", entityId: newR.id, detail: `${r.studentName} — ${r.finalAmount.toLocaleString("vi-VN")}đ` });
    return newR;
  }, [setFeeReceipts, setFeePeriods, _addAuditLog]);

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
  const addStudentTransfer = useCallback((t: Omit<AppStudentTransfer, "id">): BizResult<AppStudentTransfer> => {
    // [A] Capacity check on target class
    const targetCls = classes.find(c => c.id === t.toClassId);
    if (targetCls && targetCls.currentStudents >= targetCls.maxStudents) {
      return { ok: false, error: `Lớp "${t.toClassName}" đã đủ sĩ số (${targetCls.maxStudents}). Không thể chuyển.` };
    }
    const newT = { ...t, id: genId("TR") };
    setStudentTransfers(p => [newT, ...p]);
    setEnrollments(p => p.map(e =>
      e.studentId === t.studentId && e.classId === t.fromClassId
        ? { ...e, classId: t.toClassId, classCode: t.toClassName }
        : e
    ));
    // [B] Sync currentStudents on both classes
    setClasses(p => p.map(c => {
      if (c.id === t.fromClassId) return { ...c, currentStudents: Math.max(0, c.currentStudents - 1) };
      if (c.id === t.toClassId)   return { ...c, currentStudents: c.currentStudents + 1 };
      return c;
    }));
    _addAuditLog({ actor: "admin", action: "TRANSFER", entity: "transfer", entityId: newT.id, detail: `${t.studentName}: ${t.fromClassName} → ${t.toClassName}` });
    return { ok: true, data: newT };
  }, [setStudentTransfers, setEnrollments, setClasses, classes, _addAuditLog]);

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
      // [B] Sync enrollment status + decrement class count
      setEnrollments(prev => prev.map(e => {
        if (e.studentId !== d.studentId || e.status === "dropout") return e;
        setClasses(cls => cls.map(c =>
          c.id === e.classId ? { ...c, currentStudents: Math.max(0, c.currentStudents - 1) } : c
        ));
        return { ...e, status: "dropout" as const };
      }));
      _addAuditLog({ actor: processedBy, action: "DROPOUT_CONFIRM", entity: "dropout", entityId: id, detail: `${d.studentName} — ${d.reason}` });
      return { ...d, status: "confirmed" as const, processedBy };
    }));
  }, [setDropoutRecords, setStudents, setEnrollments, setClasses, _addAuditLog]);

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
  const addFeeDiscountApplication = useCallback((a: Omit<AppFeeDiscountApplication, "id">): BizResult => {
    // [A] Policy validation
    const policy = feeDiscountPolicies.find(p => p.id === a.policyId);
    if (!policy) return { ok: false, error: "Chính sách miễn giảm không tồn tại." };
    if (policy.status !== "active") return { ok: false, error: `Chính sách "${policy.name}" không còn hiệu lực.` };
    if (policy.maxApply !== null && policy.appliedCount >= policy.maxApply) {
      return { ok: false, error: `Chính sách "${policy.name}" đã đạt giới hạn áp dụng (${policy.maxApply} lần).` };
    }
    if (policy.validTo) {
      const parts = policy.validTo.split("/").map(Number);
      const expiry = parts.length === 3 ? new Date(parts[2], parts[1] - 1, parts[0]) : new Date(policy.validTo);
      if (expiry < new Date()) {
        return { ok: false, error: `Chính sách "${policy.name}" đã hết hạn vào ${policy.validTo}.` };
      }
    }
    setFeeDiscountApplications(prev => [{ ...a, id: genId("DA") }, ...prev]);
    setFeeDiscountPolicies(p => p.map(d => d.id === a.policyId ? { ...d, appliedCount: d.appliedCount + 1 } : d));
    return { ok: true, data: undefined };
  }, [feeDiscountPolicies, setFeeDiscountApplications, setFeeDiscountPolicies]);

  // ── Centers ──
  const addCenter = useCallback((c: Omit<AppCenter, "id" | "code">): AppCenter => {
    const seq = String(centers.length + 1).padStart(3, "0");
    const newC: AppCenter = { ...c, id: genId("CTR"), code: `TT-${seq}` };
    setCenters(p => [...p, newC]);
    return newC;
  }, [centers.length, setCenters]);

  const updateCenter = useCallback((id: string, updates: Partial<AppCenter>) => {
    setCenters(p => p.map(c => c.id === id ? { ...c, ...updates } : c));
  }, [setCenters]);

  const getCenterByManagerId = useCallback((managerId: string) => {
    return centers.find(c => c.managerId === managerId) ?? null;
  }, [centers]);

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
    setCenters(SEED_CENTERS);
    setLockedExamPlans([]);
    setAuditLogs([]);
  }, [setStudents, setEnrollments, setClasses, setExamResults, setCertificates, setFeeReceipts, setTrainingPlans, setLectures, setStudentTransfers, setReserveRecords, setDropoutRecords, setFeeRefunds, setFeePeriods, setFeeDiscountPolicies, setFeeDiscountApplications, setNotifications, setCertStockBatches, setInspections, setCenters, setLockedExamPlans, setAuditLogs]);

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
      centers, addCenter, updateCenter, getCenterByManagerId,
      advanceClassStatus, checkScheduleConflict,
      lockedExamPlans, lockExamPlan, unlockExamPlan,
      isFeesPaid, isExamPassed,
      auditLogs,
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

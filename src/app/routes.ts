import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { AdminLayout } from "./components/admin/AdminLayout";

// ============================================
// React Router native lazy loading (code splitting)
// Each page chunk is loaded only when navigated to
// ============================================

export const router = createBrowserRouter([
  // Public pages with header/footer
  {
    path: "/",
    Component: Layout,
    HydrateFallback: () => null,
    hydrateFallbackElement: null,
    children: [
      {
        index: true,
        lazy: () => import("./components/pages/HomePage").then((m) => ({ Component: m.HomePage })),
      },
      {
        path: "*",
        lazy: () => import("./components/pages/NotFoundPage").then((m) => ({ Component: m.NotFoundPage })),
      },
    ],
  },
  // Auth pages (no header/footer)
  {
    path: "/login",
    hydrateFallbackElement: null,
    lazy: () => import("./components/auth/LoginPage").then((m) => ({ Component: m.LoginPage })),
  },
  {
    path: "/register",
    hydrateFallbackElement: null,
    lazy: () => import("./components/auth/RegisterPage").then((m) => ({ Component: m.RegisterPage })),
  },
  {
    path: "/forgot-password",
    hydrateFallbackElement: null,
    lazy: () => import("./components/auth/ForgotPasswordPage").then((m) => ({ Component: m.ForgotPasswordPage })),
  },
  {
    path: "/reset-password",
    hydrateFallbackElement: null,
    lazy: () => import("./components/auth/ResetPasswordPage").then((m) => ({ Component: m.ResetPasswordPage })),
  },
  // Admin portal (own layout)
  {
    path: "/admin",
    Component: AdminLayout,
    HydrateFallback: () => null,
    hydrateFallbackElement: null,
    children: [
      {
        index: true,
        lazy: () => import("./components/admin/AdminDashboard").then((m) => ({ Component: m.AdminDashboard })),
      },
      {
        path: "teacher",
        lazy: () => import("./components/admin/TeacherDashboard").then((m) => ({ Component: m.TeacherDashboard })),
      },
      {
        path: "student",
        lazy: () => import("./components/admin/StudentDashboard").then((m) => ({ Component: m.StudentDashboard })),
      },
      {
        path: "classes",
        lazy: () => import("./components/admin/AdminClasses").then((m) => ({ Component: m.AdminClasses })),
      },
      {
        path: "centers",
        lazy: () => import("./components/admin/CentersList").then((m) => ({ Component: m.CentersList })),
      },
      {
        path: "students",
        lazy: () => import("./components/admin/AdminStudents").then((m) => ({ Component: m.AdminStudents })),
      },
      {
        path: "training-plans",
        lazy: () => import("./components/admin/TrainingPlans").then((m) => ({ Component: m.TrainingPlans })),
      },
      {
        path: "documents",
        lazy: () => import("./components/admin/AdminDocuments").then((m) => ({ Component: m.AdminDocuments })),
      },
      {
        path: "users",
        lazy: () => import("./components/admin/AdminUsers").then((m) => ({ Component: m.AdminUsers })),
      },
      {
        path: "roles",
        lazy: () => import("./components/admin/AdminRoles").then((m) => ({ Component: m.AdminRoles })),
      },
      {
        path: "teachers",
        lazy: () => import("./components/admin/AdminTeachers").then((m) => ({ Component: m.AdminTeachers })),
      },
      {
        path: "programs",
        lazy: () => import("./components/admin/AdminPrograms").then((m) => ({ Component: m.AdminPrograms })),
      },
      {
        path: "courses",
        lazy: () => import("./components/admin/AdminCourses").then((m) => ({ Component: m.AdminCourses })),
      },
      {
        path: "timetable",
        lazy: () => import("./components/admin/AdminTimetable").then((m) => ({ Component: m.AdminTimetable })),
      },
      {
        path: "manage-certificates",
        lazy: () => import("./components/admin/AdminManageCertificates").then((m) => ({ Component: m.AdminManageCertificates })),
      },
      {
        path: "program-categories",
        lazy: () => import("./components/admin/AdminProgramCategories").then((m) => ({ Component: m.AdminProgramCategories })),
      },
      {
        path: "course-modules",
        lazy: () => import("./components/admin/AdminCourseModules").then((m) => ({ Component: m.AdminCourseModules })),
      },
      {
        path: "lectures",
        lazy: () => import("./components/admin/AdminLectures").then((m) => ({ Component: m.AdminLectures })),
      },
      {
        path: "question-bank",
        lazy: () => import("./components/admin/AdminQuestionBank").then((m) => ({ Component: m.AdminQuestionBank })),
      },
      {
        path: "questions",
        lazy: () => import("./components/admin/AdminQuestions").then((m) => ({ Component: m.AdminQuestions })),
      },
      {
        path: "tests",
        lazy: () => import("./components/admin/AdminTests").then((m) => ({ Component: m.AdminTests })),
      },
      {
        path: "system-logs",
        lazy: () => import("./components/admin/SystemLogs").then((m) => ({ Component: m.SystemLogs })),
      },
      {
        path: "system-config",
        lazy: () => import("./components/admin/SystemConfig").then((m) => ({ Component: m.SystemConfig })),
      },
      {
        path: "reports/centers",
        lazy: () => import("./components/admin/ReportCenters").then((m) => ({ Component: m.ReportCenters })),
      },
      {
        path: "reports/training",
        lazy: () => import("./components/admin/ReportTraining").then((m) => ({ Component: m.ReportTraining })),
      },
      {
        path: "reports/certificates",
        lazy: () => import("./components/admin/ReportCertificates").then((m) => ({ Component: m.ReportCertificates })),
      },
      // ── Exam module ──────────────────────────────────────────────
      {
        path: "exam-plans",
        lazy: () => import("./components/admin/AdminExamPlans").then((m) => ({ Component: m.AdminExamPlans })),
      },
      {
        path: "exam-schedules",
        lazy: () => import("./components/admin/AdminExamSchedules").then((m) => ({ Component: m.AdminExamSchedules })),
      },
      {
        path: "exam-invigilators",
        lazy: () => import("./components/admin/AdminExamInvigilators").then((m) => ({ Component: m.AdminExamInvigilators })),
      },
      {
        path: "exam-papers",
        lazy: () => import("./components/admin/AdminExamPapers").then((m) => ({ Component: m.AdminExamPapers })),
      },
      {
        path: "exam-results",
        lazy: () => import("./components/admin/AdminExamResults").then((m) => ({ Component: m.AdminExamResults })),
      },
      // ── Fee module ───────────────────────────────────────────────
      {
        path: "fee-periods",
        lazy: () => import("./components/admin/AdminFeePeriods").then((m) => ({ Component: m.AdminFeePeriods })),
      },
      {
        path: "fee-discounts",
        lazy: () => import("./components/admin/AdminFeeDiscounts").then((m) => ({ Component: m.AdminFeeDiscounts })),
      },
      {
        path: "fee-receipts",
        lazy: () => import("./components/admin/AdminFeeReceipts").then((m) => ({ Component: m.AdminFeeReceipts })),
      },
      {
        path: "fee-refunds",
        lazy: () => import("./components/admin/AdminFeeRefunds").then((m) => ({ Component: m.AdminFeeRefunds })),
      },
      {
        path: "fee-debts",
        lazy: () => import("./components/admin/AdminFeeDebts").then((m) => ({ Component: m.AdminFeeDebts })),
      },
      // ── Student lifecycle ────────────────────────────────────────
      {
        path: "students/enrollment",
        lazy: () => import("./components/admin/AdminStudentEnrollment").then((m) => ({ Component: m.AdminStudentEnrollment })),
      },
      {
        path: "students/transfer",
        lazy: () => import("./components/admin/AdminStudentTransfer").then((m) => ({ Component: m.AdminStudentTransfer })),
      },
      {
        path: "students/reserve",
        lazy: () => import("./components/admin/AdminStudentReserve").then((m) => ({ Component: m.AdminStudentReserve })),
      },
      {
        path: "students/dropout",
        lazy: () => import("./components/admin/AdminStudentDropout").then((m) => ({ Component: m.AdminStudentDropout })),
      },
      // ── Teacher portal ───────────────────────────────────────────
      {
        path: "teacher/courses",
        lazy: () => import("./components/admin/TeacherCourses").then((m) => ({ Component: m.TeacherCourses })),
      },
      {
        path: "teacher/my-classes",
        lazy: () => import("./components/admin/TeacherMyClasses").then((m) => ({ Component: m.TeacherMyClasses })),
      },
      {
        path: "teacher/schedule",
        lazy: () => import("./components/admin/TeacherSchedule").then((m) => ({ Component: m.TeacherSchedule })),
      },
      {
        path: "teacher/notifications",
        lazy: () => import("./components/admin/TeacherNotifications").then((m) => ({ Component: m.TeacherNotifications })),
      },
      {
        path: "teacher/question-bank",
        lazy: () => import("./components/admin/TeacherQuestionBank").then((m) => ({ Component: m.TeacherQuestionBank })),
      },
      {
        path: "teacher/lectures",
        lazy: () => import("./components/admin/TeacherLectures").then((m) => ({ Component: m.TeacherLectures })),
      },
      {
        path: "teacher/tests",
        lazy: () => import("./components/admin/TeacherTests").then((m) => ({ Component: m.TeacherTests })),
      },
      // ── Student portal ───────────────────────────────────────────
      {
        path: "student/schedule",
        lazy: () => import("./components/admin/StudentSchedule").then((m) => ({ Component: m.StudentSchedule })),
      },
      {
        path: "student/my-courses",
        lazy: () => import("./components/admin/StudentMyCourses").then((m) => ({ Component: m.StudentMyCourses })),
      },
      {
        path: "student/results",
        lazy: () => import("./components/admin/StudentResults").then((m) => ({ Component: m.StudentResults })),
      },
      {
        path: "student/certificates",
        lazy: () => import("./components/admin/StudentCertificates").then((m) => ({ Component: m.StudentCertificates })),
      },
      {
        path: "student/notifications",
        lazy: () => import("./components/admin/StudentNotifications").then((m) => ({ Component: m.StudentNotifications })),
      },
    ],
  },
]);
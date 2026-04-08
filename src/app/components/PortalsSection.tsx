import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import {
  BarChart3, Building, FileText, Shield, Users, BookOpen,
  Calendar, Award, ClipboardList, Bell, LineChart, ArrowRight,
  Activity, CheckCircle,
} from "lucide-react";

const portals = [
  {
    id: "department",
    emoji: "🏛️",
    title: "Sở GD&ĐT",
    subtitle: "Quản lý vĩ mô toàn tỉnh",
    desc: "Nắm toàn bộ hoạt động đào tạo từ xa. Phê duyệt kế hoạch, giám sát 112+ trung tâm, kết xuất báo cáo toàn tỉnh chỉ trong vài cú nhấp.",
    color: "#dc2f3c",
    lightBg: "bg-red-50 dark:bg-red-500/[0.07]",
    activeBg: "bg-gradient-to-br from-red-500 to-rose-600",
    border: "border-red-200 dark:border-red-500/25",
    features: [
      { icon: FileText,  text: "Phê duyệt kế hoạch điện tử" },
      { icon: Building,  text: "Quản lý 112+ đơn vị" },
      { icon: BarChart3, text: "Báo cáo thống kê toàn tỉnh" },
      { icon: Shield,    text: "Phân quyền & Nhật ký hệ thống" },
    ],
    preview: [
      { label: "KH chờ duyệt", val: "3", up: false },
      { label: "TT hoạt động", val: "112", up: true },
      { label: "Báo cáo mới",  val: "7",   up: true },
    ],
    loginPath: "/login",
  },
  {
    id: "center",
    emoji: "🏢",
    title: "Trung tâm",
    subtitle: "Vận hành đào tạo vi mô",
    desc: "Quản lý toàn bộ hoạt động nội bộ: tuyển sinh, xếp lớp, điểm danh, thu học phí đến cấp chứng chỉ — không bỏ sót nghiệp vụ nào.",
    color: "#8b5cf6",
    lightBg: "bg-purple-50 dark:bg-purple-500/[0.07]",
    activeBg: "bg-gradient-to-br from-violet-500 to-purple-700",
    border: "border-purple-200 dark:border-purple-500/25",
    features: [
      { icon: Users,        text: "Học viên & Tuyển sinh" },
      { icon: BookOpen,     text: "Lớp học, thời khóa biểu" },
      { icon: Award,        text: "Cấp phát chứng chỉ" },
      { icon: ClipboardList,text: "Học phí & công nợ" },
    ],
    preview: [
      { label: "Học viên",   val: "1,240", up: true },
      { label: "Lớp đang học",val: "18",   up: true },
      { label: "Chờ thu phí",val: "32",    up: false },
    ],
    loginPath: "/login",
  },
  {
    id: "teacher",
    emoji: "👨‍🏫",
    title: "Giáo viên",
    subtitle: "Cổng thông tin giảng viên",
    desc: "Xem lịch dạy tuần/tháng, điểm danh trực tuyến, nhập điểm học viên và tải lên bài giảng số — mọi lúc, mọi nơi, không cần đến văn phòng.",
    color: "#10b981",
    lightBg: "bg-emerald-50 dark:bg-emerald-500/[0.07]",
    activeBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
    border: "border-emerald-200 dark:border-emerald-500/25",
    features: [
      { icon: Calendar, text: "Lịch giảng dạy tuần / tháng" },
      { icon: Users,    text: "Điểm danh & nhập điểm" },
      { icon: BookOpen, text: "Bài giảng, bài kiểm tra" },
      { icon: Bell,     text: "Thông báo từ trung tâm" },
    ],
    preview: [
      { label: "Lớp phụ trách", val: "5",  up: true },
      { label: "Tiết tuần này", val: "18", up: true },
      { label: "Chờ chấm bài",  val: "12", up: false },
    ],
    loginPath: "/login",
  },
  {
    id: "student",
    emoji: "👨‍🎓",
    title: "Học viên",
    subtitle: "Cổng thông tin học viên",
    desc: "Tra cứu lịch học, xem kết quả, tải chứng chỉ PDF ngay trên điện thoại. Không cần gọi điện hỏi trung tâm về phòng học hay điểm số.",
    color: "#f26522",
    lightBg: "bg-orange-50 dark:bg-orange-500/[0.07]",
    activeBg: "bg-gradient-to-br from-orange-500 to-amber-600",
    border: "border-orange-200 dark:border-orange-500/25",
    features: [
      { icon: Calendar,  text: "Lịch học & phòng học" },
      { icon: LineChart, text: "Kết quả & bảng điểm" },
      { icon: BookOpen,  text: "Tài liệu, video ôn luyện" },
      { icon: Award,     text: "Chứng chỉ PDF tra cứu" },
    ],
    preview: [
      { label: "Khóa học",     val: "3",  up: true },
      { label: "Bài hoàn thành",val: "47", up: true },
      { label: "Chứng chỉ",   val: "1",  up: true },
    ],
    loginPath: "/login",
  },
];

export function PortalsSection() {
  const [active, setActive] = useState(0);
  const current = portals[active];

  return (
    <section id="portal" className="py-20 lg:py-28 bg-[#fafbfc] dark:bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-primary/[0.07] text-primary px-4 py-1.5 rounded-full text-[13px] mb-5 border border-primary/15" style={{ fontWeight: 600 }}>
            4 PHÂN HỆ CHUYÊN BIỆT
          </div>
          <h2 className="text-[32px] lg:text-[42px] text-[#0d0f1a] dark:text-foreground mb-4" style={{ fontWeight: 800 }}>
            Mỗi vai trò — Một giao diện riêng
          </h2>
          <p className="text-muted-foreground text-[16px] max-w-2xl mx-auto">
            Tách bạch dữ liệu hoàn toàn. Không dư thừa, không thiếu sót — ai có nghiệp vụ gì thì thấy đúng giao diện đó.
          </p>
        </motion.div>

        {/* Tab selector */}
        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {portals.map((p, i) => (
            <motion.button
              key={p.id}
              onClick={() => setActive(i)}
              whileTap={{ scale: 0.96 }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[14px] border transition-all ${
                active === i
                  ? "text-white shadow-lg border-transparent"
                  : "bg-white dark:bg-card text-muted-foreground border-gray-200 dark:border-border hover:border-gray-300"
              }`}
              style={{
                fontWeight: 600,
                background: active === i ? `linear-gradient(135deg, ${p.color}, ${p.color}cc)` : undefined,
                boxShadow: active === i ? `0 8px 24px ${p.color}35` : undefined,
              }}
            >
              <span>{p.emoji}</span>
              {p.title}
            </motion.button>
          ))}
        </div>

        {/* Detail panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className={`rounded-3xl border ${current.border} overflow-hidden`}
            style={{ background: "transparent" }}
          >
            <div className={`${current.lightBg} grid lg:grid-cols-[1fr_380px]`}>

              {/* Left: info */}
              <div className="p-8 lg:p-10">
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-[26px] shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${current.color}, ${current.color}cc)` }}
                  >
                    {current.emoji}
                  </div>
                  <div>
                    <h3 className="text-[24px] text-[#0d0f1a] dark:text-foreground" style={{ fontWeight: 800 }}>{current.title}</h3>
                    <p className="text-muted-foreground text-[14px]">{current.subtitle}</p>
                  </div>
                </div>

                <p className="text-[15.5px] text-[#1a1a2e]/75 dark:text-foreground/70 leading-relaxed mb-8 max-w-lg">
                  {current.desc}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  {current.features.map((feat, j) => (
                    <motion.div
                      key={j}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: j * 0.07 }}
                      className="flex items-center gap-2.5 text-[14px] text-[#1a1a2e]/80 dark:text-foreground/75"
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: current.color + "15" }}
                      >
                        <feat.icon className="w-3.5 h-3.5" style={{ color: current.color }} />
                      </div>
                      {feat.text}
                    </motion.div>
                  ))}
                </div>

                <Link
                  to={current.loginPath}
                  className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-2xl text-[14.5px] shadow-lg transition-all hover:-translate-y-0.5"
                  style={{
                    fontWeight: 600,
                    background: `linear-gradient(135deg, ${current.color}, ${current.color}cc)`,
                    boxShadow: `0 8px 20px ${current.color}30`,
                  }}
                >
                  Đăng nhập thử ngay
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Right: mini dashboard preview */}
              <div className="hidden lg:flex items-center justify-center p-8 border-l border-black/[0.06] dark:border-white/[0.06]">
                <div className="w-full space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-5">
                    <p className="text-[14px] font-bold text-[#0d0f1a] dark:text-foreground">Tổng quan nhanh</p>
                    <div className="flex items-center gap-1.5 text-[12px]" style={{ color: current.color, fontWeight: 600 }}>
                      <Activity className="w-3.5 h-3.5" />
                      Trực tuyến
                    </div>
                  </div>

                  {current.preview.map((item, j) => (
                    <motion.div
                      key={j}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + j * 0.08 }}
                      className="flex items-center justify-between bg-white/70 dark:bg-white/5 rounded-xl px-4 py-3"
                    >
                      <span className="text-[13.5px] text-muted-foreground font-medium">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[18px] font-bold text-[#0d0f1a] dark:text-foreground tabular-nums">{item.val}</span>
                        <span
                          className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                          style={{
                            color: item.up ? "#10b981" : "#f26522",
                            background: item.up ? "#10b98115" : "#f2652215",
                          }}
                        >
                          {item.up ? "↑" : "↓"} tuần
                        </span>
                      </div>
                    </motion.div>
                  ))}

                  {/* All features check */}
                  <div className="mt-5 pt-5 border-t border-black/[0.06] dark:border-white/[0.06] space-y-2">
                    {["Dữ liệu mẫu đầy đủ", "Không cần cài đặt", "Trải nghiệm toàn tính năng"].map((t, j) => (
                      <div key={j} className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
                        <CheckCircle className="w-3.5 h-3.5" style={{ color: current.color }} />
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

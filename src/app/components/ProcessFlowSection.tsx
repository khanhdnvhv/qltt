import { motion } from "motion/react";
import { Building2, Upload, Bell, Eye, PenLine, CheckCircle, ArrowRight } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Building2,
    actor: "Trung tâm",
    title: "Lập kế hoạch đào tạo",
    desc: "Nhập thông tin số ca, khung giờ, môn học, thời lượng dự kiến theo tháng/quý.",
    color: "#8b5cf6",
    bg: "bg-purple-50 dark:bg-purple-500/10",
    iconBg: "bg-purple-100 dark:bg-purple-500/20",
  },
  {
    step: "02",
    icon: Upload,
    actor: "Trung tâm",
    title: "Gửi lên hệ thống",
    desc: "Nhấn [Gửi duyệt] — kế hoạch được đẩy lên Sở GD&ĐT kèm trạng thái Chờ phê duyệt.",
    color: "#3b82f6",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    iconBg: "bg-blue-100 dark:bg-blue-500/20",
  },
  {
    step: "03",
    icon: Bell,
    actor: "Sở GD&ĐT",
    title: "Nhận thông báo tức thì",
    desc: "Hệ thống gửi thông báo tới tài khoản Sở. Không cần chờ email hay điện thoại.",
    color: "#f26522",
    bg: "bg-orange-50 dark:bg-orange-500/10",
    iconBg: "bg-orange-100 dark:bg-orange-500/20",
  },
  {
    step: "04",
    icon: Eye,
    actor: "Sở GD&ĐT",
    title: "Xem xét trực tuyến",
    desc: "Lãnh đạo Sở đọc kế hoạch ngay trên dashboard — mọi lúc, mọi nơi, không cần in ấn.",
    color: "#10b981",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    iconBg: "bg-emerald-100 dark:bg-emerald-500/20",
  },
  {
    step: "05",
    icon: PenLine,
    actor: "Sở GD&ĐT",
    title: "Phê duyệt hoặc yêu cầu chỉnh sửa",
    desc: "Nhấn [Duyệt] với chữ ký số, hoặc [Yêu cầu chỉnh sửa] kèm ghi chú cụ thể.",
    color: "#dc2f3c",
    bg: "bg-red-50 dark:bg-red-500/10",
    iconBg: "bg-red-100 dark:bg-red-500/20",
  },
  {
    step: "06",
    icon: CheckCircle,
    actor: "Trung tâm",
    title: "Nhận kết quả & triển khai",
    desc: "Trung tâm nhận thông báo kết quả ngay lập tức. Kế hoạch được duyệt sẵn sàng triển khai.",
    color: "#10b981",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    iconBg: "bg-emerald-100 dark:bg-emerald-500/20",
  },
];

export function ProcessFlowSection() {
  return (
    <section className="py-16 lg:py-24 bg-[#fafbfc] dark:bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-[#10b981]/10 text-[#10b981] px-4 py-1.5 rounded-full text-[13px] mb-5 border border-[#10b981]/20" style={{ fontWeight: 600 }}>
            QUY TRÌNH PHÊ DUYỆT ĐIỆN TỬ
          </div>
          <h2 className="text-[30px] lg:text-[38px] text-[#1a1a2e] dark:text-foreground mb-4" style={{ fontWeight: 800 }}>
            Từ kế hoạch đến phê duyệt — <br className="hidden lg:block" />
            <span className="text-primary">không một tờ giấy</span>
          </h2>
          <p className="text-muted-foreground text-[16px] max-w-2xl mx-auto">
            Luồng phê duyệt hoàn toàn số hóa. Tiết kiệm thời gian đi lại, giảm thủ tục hành chính, tăng minh bạch quản lý.
          </p>
        </motion.div>

        {/* Steps — desktop: horizontal flow, mobile: vertical */}
        <div className="relative">
          {/* Connector line desktop */}
          <div className="hidden lg:block absolute top-[52px] left-[calc(8.33%+24px)] right-[calc(8.33%+24px)] h-0.5 bg-gradient-to-r from-purple-200 via-orange-200 to-emerald-200 dark:from-purple-500/20 dark:via-orange-500/20 dark:to-emerald-500/20" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 lg:gap-4 relative z-10">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex flex-col items-center text-center"
              >
                {/* Icon circle */}
                <div className={`w-[52px] h-[52px] rounded-2xl ${step.iconBg} flex items-center justify-center mb-4 relative border-2 border-white dark:border-background shadow-md`}>
                  <step.icon className="w-6 h-6" style={{ color: step.color }} />
                  <span
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center shadow"
                    style={{ backgroundColor: step.color, fontWeight: 700 }}
                  >
                    {i + 1}
                  </span>
                </div>

                {/* Actor badge */}
                <span
                  className="text-[11px] px-2.5 py-0.5 rounded-full mb-2"
                  style={{ backgroundColor: step.color + "18", color: step.color, fontWeight: 600 }}
                >
                  {step.actor}
                </span>

                <h3 className="text-[14px] text-[#1a1a2e] dark:text-foreground mb-1.5 leading-snug" style={{ fontWeight: 700 }}>
                  {step.title}
                </h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>

                {/* Arrow between steps on mobile/tablet */}
                {i < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center mt-4">
                    <ArrowRight className="w-4 h-4 text-muted-foreground/40 rotate-90" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Result banner */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-[16px] text-emerald-800 dark:text-emerald-300" style={{ fontWeight: 700 }}>
              Kết quả: Giảm 90% thời gian xử lý thủ tục phê duyệt
            </p>
            <p className="text-[14px] text-emerald-700/70 dark:text-emerald-400/70 mt-0.5">
              Từ vài ngày chờ đợi xuống còn vài giờ — tất cả trên một nền tảng, không cần di chuyển.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

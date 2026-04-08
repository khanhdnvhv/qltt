import { motion } from "motion/react";
import {
  Wrench, BookOpen, Globe, Monitor,
  Users, Award, Calendar, FileText,
} from "lucide-react";

const centerTypes = [
  {
    id: "gdnn",
    icon: Wrench,
    emoji: "🔧",
    name: "Trung tâm GDNN",
    fullName: "Giáo dục Nghề nghiệp",
    desc: "Đào tạo các ngành nghề kỹ thuật: hàn điện, cơ khí, điện dân dụng, may mặc, nấu ăn và hàng chục nghề khác theo chuẩn khung GDNN.",
    color: "#dc2f3c",
    gradient: "from-red-500 to-rose-600",
    bg: "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-500/[0.08] dark:to-rose-500/[0.05]",
    border: "border-red-200/70 dark:border-red-500/20",
    stats: [
      { icon: Users,    val: "28K+",  label: "Học viên" },
      { icon: Award,    val: "8,200+",label: "Chứng chỉ nghề" },
      { icon: Calendar, val: "320+",  label: "Lớp/năm" },
    ],
    tags: ["Sơ cấp", "Trung cấp", "Cao đẳng nghề"],
  },
  {
    id: "gdtx",
    icon: BookOpen,
    emoji: "📚",
    name: "Trung tâm GDTX",
    fullName: "Giáo dục Thường xuyên",
    desc: "Phổ cập giáo dục, bổ túc văn hóa, bồi dưỡng kiến thức và kỹ năng cho người lớn tuổi, cán bộ, công chức, viên chức.",
    color: "#f26522",
    gradient: "from-orange-500 to-amber-500",
    bg: "bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-500/[0.08] dark:to-amber-500/[0.05]",
    border: "border-orange-200/70 dark:border-orange-500/20",
    stats: [
      { icon: Users,    val: "9,400+", label: "Học viên" },
      { icon: FileText, val: "1,200+", label: "Văn bằng" },
      { icon: Calendar, val: "85+",    label: "Lớp/năm" },
    ],
    tags: ["Bổ túc THPT", "Bồi dưỡng", "Phổ cập"],
  },
  {
    id: "ngoaingu",
    icon: Globe,
    emoji: "🌐",
    name: "Trung tâm Ngoại ngữ",
    fullName: "Đào tạo Ngoại ngữ",
    desc: "Tiếng Anh, Tiếng Trung, Tiếng Nhật và các ngoại ngữ khác. Luyện thi chứng chỉ quốc tế IELTS, TOEIC, HSK, JLPT.",
    color: "#3b82f6",
    gradient: "from-blue-500 to-indigo-600",
    bg: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/[0.08] dark:to-indigo-500/[0.05]",
    border: "border-blue-200/70 dark:border-blue-500/20",
    stats: [
      { icon: Users,    val: "5,200+", label: "Học viên" },
      { icon: Award,    val: "2,100+", label: "Chứng chỉ NN" },
      { icon: Calendar, val: "140+",   label: "Lớp/năm" },
    ],
    tags: ["IELTS", "TOEIC", "HSK", "JLPT"],
  },
  {
    id: "tinhoc",
    icon: Monitor,
    emoji: "💻",
    name: "Trung tâm Tin học",
    fullName: "Đào tạo Tin học",
    desc: "Tin học văn phòng, lập trình, thiết kế đồ họa, kế toán máy tính. Cấp chứng chỉ tin học theo chuẩn quốc gia Bộ GD&ĐT.",
    color: "#10b981",
    gradient: "from-emerald-500 to-teal-500",
    bg: "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-500/[0.08] dark:to-teal-500/[0.05]",
    border: "border-emerald-200/70 dark:border-emerald-500/20",
    stats: [
      { icon: Users,    val: "3,200+", label: "Học viên" },
      { icon: Award,    val: "2,950+", label: "Chứng chỉ TH" },
      { icon: Calendar, val: "95+",    label: "Lớp/năm" },
    ],
    tags: ["Chuẩn Bộ GD", "IC3", "MOS"],
  },
];

export function CenterTypesSection() {
  return (
    <section id="loai-hinh" className="py-20 lg:py-28 bg-white dark:bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mb-14"
        >
          <div
            className="inline-flex items-center gap-2 text-[13px] px-4 py-1.5 rounded-full mb-5 border"
            style={{
              background: "linear-gradient(135deg, rgba(220,47,60,0.08), rgba(242,101,34,0.08))",
              borderColor: "rgba(220,47,60,0.2)",
              color: "#dc2f3c",
              fontWeight: 600,
            }}
          >
            4 LOẠI HÌNH TRUNG TÂM
          </div>
          <h2 className="text-[32px] lg:text-[42px] text-[#0d0f1a] dark:text-foreground leading-tight mb-4" style={{ fontWeight: 800 }}>
            Một hệ thống phục vụ{" "}
            <span className="relative">
              <span className="bg-gradient-to-r from-primary to-[#f26522] bg-clip-text text-transparent">tất cả</span>
              <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 100 6" preserveAspectRatio="none">
                <path d="M0 5 Q50 0 100 5" stroke="#dc2f3c" strokeWidth="2" fill="none" opacity="0.4" />
              </svg>
            </span>{" "}
            loại hình đào tạo
          </h2>
          <p className="text-muted-foreground text-[16.5px] leading-relaxed">
            Dù là dạy nghề kỹ thuật, bổ túc văn hóa, luyện ngoại ngữ hay cấp chứng chỉ tin học — hệ thống đều được thiết kế riêng cho từng nghiệp vụ đặc thù.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {centerTypes.map((ct, i) => (
            <motion.div
              key={ct.id}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`${ct.bg} border ${ct.border} rounded-3xl p-7 group hover:shadow-xl transition-all duration-400 relative overflow-hidden`}
            >
              {/* Background number watermark */}
              <div
                className="absolute -right-4 -bottom-6 text-[120px] leading-none select-none pointer-events-none opacity-[0.04]"
                style={{ fontWeight: 900, color: ct.color }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>

              <div className="relative z-10">
                {/* Top row */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${ct.color}, ${ct.color}cc)` }}
                    >
                      <ct.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-[18px] text-[#0d0f1a] dark:text-foreground" style={{ fontWeight: 800 }}>
                        {ct.name}
                      </h3>
                      <p className="text-[13px] text-muted-foreground">{ct.fullName}</p>
                    </div>
                  </div>
                  <span className="text-[28px]">{ct.emoji}</span>
                </div>

                {/* Description */}
                <p className="text-[14.5px] text-[#1a1a2e]/70 dark:text-foreground/65 leading-relaxed mb-6">
                  {ct.desc}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {ct.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[12px] px-3 py-1 rounded-full border font-semibold"
                      style={{
                        color: ct.color,
                        borderColor: ct.color + "35",
                        background: ct.color + "0f",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 pt-5 border-t border-black/[0.06] dark:border-white/[0.08]">
                  {ct.stats.map((stat) => (
                    <div key={stat.label} className="text-center">
                      <div
                        className="w-7 h-7 rounded-lg mx-auto mb-1.5 flex items-center justify-center"
                        style={{ background: ct.color + "18" }}
                      >
                        <stat.icon className="w-3.5 h-3.5" style={{ color: ct.color }} />
                      </div>
                      <p className="text-[16px] text-[#0d0f1a] dark:text-foreground" style={{ fontWeight: 700 }}>
                        {stat.val}
                      </p>
                      <p className="text-[11.5px] text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-muted-foreground text-[14px] mt-10"
        >
          Tất cả loại hình đều dùng chung một nền tảng — tiết kiệm chi phí, thống nhất dữ liệu, dễ quản lý.
        </motion.p>
      </div>
    </section>
  );
}

import { Link } from "react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import {
  ArrowRight, ChevronDown, Sparkles,
  Users, FileCheck, Award, BarChart3,
  Globe, Monitor, BookOpen, Wrench,
} from "lucide-react";

const centerTypes = [
  { icon: Wrench,   label: "Dạy nghề · GDNN",      color: "#dc2f3c", bg: "bg-red-500/15",     border: "border-red-500/25" },
  { icon: BookOpen, label: "Thường xuyên · GDTX",   color: "#f26522", bg: "bg-orange-500/15",  border: "border-orange-500/25" },
  { icon: Globe,    label: "Ngoại ngữ",              color: "#3b82f6", bg: "bg-blue-500/15",    border: "border-blue-500/25" },
  { icon: Monitor,  label: "Tin học",                color: "#10b981", bg: "bg-emerald-500/15", border: "border-emerald-500/25" },
];

const floatingCards = [
  {
    title: "Kế hoạch vừa được duyệt",
    sub: "TT GDTX Bình Chánh · 2 phút trước",
    icon: FileCheck, iconColor: "#10b981", iconBg: "bg-emerald-500/15",
    badge: "Đã phê duyệt", badgeColor: "text-emerald-400 bg-emerald-500/15",
  },
  {
    title: "Cấp 28 chứng chỉ Tin học A",
    sub: "TT Ngoại ngữ–Tin học ABC · Hôm nay",
    icon: Award, iconColor: "#f26522", iconBg: "bg-orange-500/15",
    badge: "Chứng chỉ", badgeColor: "text-orange-400 bg-orange-500/15",
  },
  {
    title: "45,847 học viên đang quản lý",
    sub: "112 trung tâm toàn tỉnh",
    icon: Users, iconColor: "#3b82f6", iconBg: "bg-blue-500/15",
    badge: "Tổng quan", badgeColor: "text-blue-400 bg-blue-500/15",
  },
  {
    title: "Báo cáo quý II đã kết xuất",
    sub: "Sở GD&ĐT · Xuất Excel thành công",
    icon: BarChart3, iconColor: "#8b5cf6", iconBg: "bg-purple-500/15",
    badge: "Báo cáo", badgeColor: "text-purple-400 bg-purple-500/15",
  },
];

export function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[92vh] flex items-center overflow-hidden bg-[#0d0f1a]">
      {/* ── Gradient background ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#0d0f1a] via-[#131629] to-[#0d0f1a]" />
        <div className="absolute top-[-10%] right-[-5%] w-[700px] h-[700px] rounded-full bg-primary/[0.08] blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-blue-500/[0.07] blur-[120px]" />
        <div className="absolute top-[40%] left-[35%] w-[400px] h-[400px] rounded-full bg-[#f26522]/[0.05] blur-[100px]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-0">
        <div className="grid lg:grid-cols-[1fr_480px] gap-12 lg:gap-16 items-center">

          {/* ── LEFT: Copy ── */}
          <motion.div style={{ y, opacity }}>
            {/* Center type pills */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-wrap gap-2 mb-8"
            >
              {centerTypes.map((ct, i) => (
                <motion.div
                  key={ct.label}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                  className={`inline-flex items-center gap-1.5 ${ct.bg} border ${ct.border} px-3 py-1.5 rounded-full text-[12.5px]`}
                  style={{ fontWeight: 600, color: ct.color }}
                >
                  <ct.icon className="w-3 h-3" />
                  {ct.label}
                </motion.div>
              ))}
            </motion.div>

            {/* Main headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-[38px] lg:text-[58px] leading-[1.1] mb-6 tracking-tight"
              style={{ fontWeight: 800 }}
            >
              <span className="text-white">Một nền tảng.</span>
              <br />
              <span className="bg-gradient-to-r from-primary via-[#f26522] to-[#facc15] bg-clip-text text-transparent">
                Mọi trung tâm đào tạo.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-white/55 text-[16.5px] lg:text-[18px] mb-10 leading-[1.75] max-w-xl"
            >
              Số hóa toàn diện quản lý <span className="text-white/80 font-semibold">GDNN · GDTX · Ngoại ngữ · Tin học</span>.
              Kết nối Sở GD&ĐT với các trung tâm — phê duyệt, báo cáo, chứng chỉ — tất cả không giấy tờ.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.42 }}
              className="flex flex-wrap gap-3 mb-12"
            >
              <Link
                to="/login"
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-primary to-[#f26522] text-white px-7 py-3.5 rounded-2xl text-[15px] shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
                style={{ fontWeight: 600 }}
              >
                <Sparkles className="w-4 h-4" />
                Dùng thử miễn phí
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href="#loai-hinh"
                className="inline-flex items-center gap-2 bg-white/[0.07] backdrop-blur text-white/80 border border-white/10 hover:bg-white/[0.12] hover:text-white px-7 py-3.5 rounded-2xl text-[15px] transition-all"
                style={{ fontWeight: 500 }}
              >
                Xem tính năng
                <ChevronDown className="w-4 h-4" />
              </a>
            </motion.div>

            {/* Mini stats strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-6 text-[13.5px] text-white/40 border-t border-white/[0.08] pt-6"
            >
              {[
                { val: "112+", label: "Trung tâm" },
                { val: "45K+", label: "Học viên" },
                { val: "12K+", label: "Chứng chỉ" },
                { val: "4",    label: "Loại hình TT" },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  {i > 0 && <span className="w-px h-4 bg-white/10" />}
                  <span className="text-white/80 font-bold text-[15px]">{s.val}</span>
                  <span>{s.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── RIGHT: Floating cards ── */}
          <div className="relative hidden lg:block h-[500px]">
            {floatingCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20, x: i % 2 === 0 ? -10 : 10 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ duration: 0.65, delay: 0.4 + i * 0.12 }}
                style={{
                  position: "absolute",
                  top:  i === 0 ? "0%"   : i === 1 ? "22%" : i === 2 ? "48%" : "72%",
                  left: i % 2 === 0 ? "0"   : "auto",
                  right: i % 2 !== 0 ? "0"  : "auto",
                  width: i === 0 || i === 3 ? "85%" : "80%",
                  zIndex: 4 - i,
                }}
                whileHover={{ scale: 1.02, zIndex: 10 }}
                className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] rounded-2xl px-4 py-3.5 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0`}>
                    <card.icon className="w-4.5 h-4.5" style={{ color: card.iconColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-[14px] font-semibold truncate">{card.title}</p>
                    <p className="text-white/40 text-[12px] truncate">{card.sub}</p>
                  </div>
                  <span className={`text-[11px] px-2.5 py-1 rounded-full shrink-0 font-semibold ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                </div>
              </motion.div>
            ))}

            {/* Glow orb behind cards */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/20 text-[12px]"
      >
        <span>Cuộn xuống</span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.div>
    </section>
  );
}

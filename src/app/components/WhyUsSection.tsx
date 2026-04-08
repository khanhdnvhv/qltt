import { motion } from "motion/react";
import { GraduationCap, Target, Users, Headphones, BookOpen, Trophy } from "lucide-react";

const features = [
  {
    icon: GraduationCap,
    title: "Giảng viên 8.0+ IELTS",
    description: "Đội ngũ giảng viên giàu kinh nghiệm, được đào tạo bài bản tại các trường đại học hàng đầu.",
    color: "#dc2f3c",
  },
  {
    icon: Target,
    title: "Cam kết đầu ra",
    description: "Hoàn tiền 100% nếu không đạt mục tiêu. Học lại miễn phí nếu chưa hài lòng.",
    color: "#f26522",
  },
  {
    icon: Users,
    title: "Lớp nhỏ 8-15 HV",
    description: "Giảng viên theo sát từng học viên, đảm bảo chất lượng giảng dạy tối đa.",
    color: "#3b82f6",
  },
  {
    icon: Headphones,
    title: "Hỗ trợ 24/7",
    description: "Giải đáp thắc mắc nhanh chóng qua nhóm Zalo/Facebook, hỗ trợ cả ngoài giờ học.",
    color: "#10b981",
  },
  {
    icon: BookOpen,
    title: "Tài liệu độc quyền",
    description: "Bộ tài liệu biên soạn riêng, cập nhật theo đề thi mới nhất từ British Council & IDP.",
    color: "#8b5cf6",
  },
  {
    icon: Trophy,
    title: "Luyện đề thực chiến",
    description: "Mock test hàng tuần, chấm chữa chi tiết Writing & Speaking bởi giảng viên.",
    color: "#f59e0b",
  },
];

export function WhyUsSection() {
  return (
    <section className="py-20 lg:py-28 bg-[#f8f9fb] dark:bg-[#0c0e14] relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(220,47,60,0.02),transparent_60%)]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 bg-accent/[0.06] text-accent px-4 py-2 rounded-full text-[16px] mb-5 border border-accent/10" style={{ fontWeight: 600 }}>
            <Trophy className="w-3.5 h-3.5" />
            Tại sao chọn chúng tôi
          </span>
          <h2 className="text-[26px] lg:text-[36px] text-[#1a1a2e] dark:text-foreground mb-4 tracking-tight" style={{ fontWeight: 800 }}>
            Ưu điểm <span className="text-primary">vượt trội</span>
          </h2>
          <p className="text-muted-foreground text-[15px] max-w-xl mx-auto leading-relaxed">
            GDNN-GDTX tự hào mang đến trải nghiệm học tập tốt nhất cho học viên
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.07 }}
              className="group bg-white dark:bg-card rounded-2xl p-6 border border-gray-100/80 dark:border-border hover:border-transparent hover:shadow-xl hover:shadow-black/[0.05] dark:hover:shadow-black/30 transition-all duration-300 relative overflow-hidden hover:-translate-y-1 hover-lift"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ backgroundImage: `linear-gradient(to right, transparent, ${feature.color}40, transparent)` }} />
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: feature.color + "0a" }}
              >
                <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
              </div>
              <h3 className="text-[16px] mb-2 text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 700 }}>{feature.title}</h3>
              <p className="text-muted-foreground text-[15.5px] leading-[1.7]">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

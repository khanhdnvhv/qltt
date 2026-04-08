import { motion } from "motion/react";
import {
  Users, Calendar, Award, CreditCard,
  FileCheck, BarChart3, GraduationCap, BookOpen,
} from "lucide-react";

const features = [
  {
    icon: Users,
    color: "#3b82f6",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    title: "Quản lý Học viên & Tuyển sinh",
    desc: "Hồ sơ điện tử toàn diện. Nhập học, chuyển lớp, bảo lưu, thôi học chỉ với một thao tác. Theo dõi học viên học song song nhiều chứng chỉ.",
    tags: ["Nhập học", "Bảo lưu", "Chuyển lớp"],
  },
  {
    icon: Calendar,
    color: "#8b5cf6",
    bg: "bg-purple-50 dark:bg-purple-500/10",
    title: "Thời khóa biểu thông minh",
    desc: "Xếp lịch tự động, cảnh báo trùng phòng học, trùng ca giáo viên. Hỗ trợ đa cơ sở, đa phòng học, đa ca học.",
    tags: ["Tự động xếp lịch", "Cảnh báo trùng"],
  },
  {
    icon: Award,
    color: "#f26522",
    bg: "bg-orange-50 dark:bg-orange-500/10",
    title: "Thi & Cấp phát Chứng chỉ",
    desc: "Trộn đề, phân công coi thi, nhập điểm tập trung. Quản lý số phôi, cấp phát chứng chỉ, tra cứu số hiệu liên thông hệ thống.",
    tags: ["Kỳ thi sát hạch", "Quản lý phôi"],
  },
  {
    icon: CreditCard,
    color: "#10b981",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    title: "Quản lý Học phí",
    desc: "Thiết lập đợt thu theo ca/tín chỉ/khóa học. Biên lai điện tử, miễn giảm học phí, cảnh báo học viên còn công nợ.",
    tags: ["Biên lai điện tử", "Cảnh báo nợ"],
  },
  {
    icon: FileCheck,
    color: "#dc2f3c",
    bg: "bg-red-50 dark:bg-red-500/10",
    title: "Phê duyệt Kế hoạch",
    desc: "Luân chuyển kế hoạch đào tạo hoàn toàn không giấy tờ. Tích hợp chữ ký số, lịch sử phê duyệt, ghi chú yêu cầu chỉnh sửa.",
    tags: ["Chữ ký số", "Không giấy tờ"],
  },
  {
    icon: BarChart3,
    color: "#0ea5e9",
    bg: "bg-sky-50 dark:bg-sky-500/10",
    title: "Báo cáo & Thống kê",
    desc: "Dashboard trực quan toàn tỉnh cho Sở GD&ĐT. Kết xuất báo cáo Word/Excel theo từng đơn vị, từng thời kỳ theo yêu cầu.",
    tags: ["Xuất Excel/Word", "Dashboard tổng"],
  },
  {
    icon: GraduationCap,
    color: "#d946ef",
    bg: "bg-fuchsia-50 dark:bg-fuchsia-500/10",
    title: "Quản lý Giảng viên",
    desc: "Hồ sơ năng lực, bằng cấp giáo viên. Giới hạn phân công đúng chuyên môn, kiểm soát định mức giờ dạy theo quy định.",
    tags: ["Hồ sơ năng lực", "Định mức giờ"],
  },
  {
    icon: BookOpen,
    color: "#14b8a6",
    bg: "bg-teal-50 dark:bg-teal-500/10",
    title: "Nội dung & Học liệu",
    desc: "Thiết lập chương trình học, học phần, ngân hàng câu hỏi. Giáo viên tải bài giảng, tạo bài tập trực tiếp trên hệ thống.",
    tags: ["Ngân hàng câu hỏi", "Bài giảng số"],
  },
];

export function FeaturesSection() {
  return (
    <section id="tinh-nang" className="py-16 lg:py-24 bg-white dark:bg-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-primary/[0.07] text-primary px-4 py-1.5 rounded-full text-[13px] mb-5 border border-primary/15" style={{ fontWeight: 600 }}>
            TÍNH NĂNG NỔI BẬT
          </div>
          <h2 className="text-[30px] lg:text-[38px] text-[#1a1a2e] dark:text-foreground mb-4" style={{ fontWeight: 800 }}>
            Đầy đủ nghiệp vụ — Không cần phần mềm khác
          </h2>
          <p className="text-muted-foreground text-[16px] max-w-2xl mx-auto leading-relaxed">
            Từ tuyển sinh đến cấp chứng chỉ, từ kế hoạch đến báo cáo — tất cả trên một nền tảng duy nhất, tích hợp hoàn toàn.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="group bg-[#fafbfc] dark:bg-background rounded-2xl border border-gray-100 dark:border-border p-5 hover:border-primary/20 hover:shadow-lg hover:shadow-gray-100 dark:hover:shadow-black/10 hover:-translate-y-0.5 transition-all duration-300"
            >
              {/* Icon */}
              <div className={`w-11 h-11 rounded-xl ${feat.bg} flex items-center justify-center mb-4`}>
                <feat.icon className="w-5 h-5" style={{ color: feat.color }} />
              </div>

              {/* Title */}
              <h3 className="text-[15px] text-[#1a1a2e] dark:text-foreground mb-2 leading-snug" style={{ fontWeight: 700 }}>
                {feat.title}
              </h3>

              {/* Desc */}
              <p className="text-[13.5px] text-muted-foreground leading-relaxed mb-4">
                {feat.desc}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {feat.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11.5px] px-2.5 py-0.5 rounded-full"
                    style={{ backgroundColor: feat.color + "14", color: feat.color, fontWeight: 600 }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Link } from "react-router";
import { Clock, Users, Star, ArrowRight, BookOpen, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { LazyImage } from "./ui/LazyImage";

const courses = [
  {
    id: 1,
    title: "IELTS Starter",
    slug: "ielts-starter",
    band: "0 - 3.5",
    description: "Xây dựng nền tảng tiếng Anh vững chắc, làm quen với format IELTS.",
    duration: "3 tháng",
    students: 2340,
    rating: 4.8,
    price: "3,500,000đ",
    oldPrice: "5,000,000đ",
    color: "#10b981",
    image: "https://images.unsplash.com/photo-1752920299180-e8fd9276c202?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwc3R1ZHlpbmclMjBsaWJyYXJ5JTIwYm9va3N8ZW58MXx8fHwxNzczMzc4OTcxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    level: "Cơ bản",
    tag: "Phổ biến",
  },
  {
    id: 2,
    title: "IELTS Foundation",
    slug: "ielts-foundation",
    band: "3.5 - 5.0",
    description: "Nắm vững kiến thức cốt lõi, phát triển 4 kỹ năng IELTS đồng đều.",
    duration: "4 tháng",
    students: 5120,
    rating: 4.9,
    price: "4,500,000đ",
    oldPrice: "6,500,000đ",
    color: "#3b82f6",
    image: "https://images.unsplash.com/photo-1758612215020-842383aadb9e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBlZHVjYXRpb24lMjBsYXB0b3AlMjBzdHVkeXxlbnwxfHx8fDE3NzM0ODE2OTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    level: "Sơ trung cấp",
    tag: "Best Seller",
  },
  {
    id: 3,
    title: "IELTS Intermediate",
    slug: "ielts-intermediate",
    band: "5.0 - 6.5",
    description: "Chiến lược làm bài hiệu quả, nâng band điểm nhanh chóng.",
    duration: "4 tháng",
    students: 8930,
    rating: 4.9,
    price: "5,500,000đ",
    oldPrice: "8,000,000đ",
    color: "#dc2f3c",
    image: "https://images.unsplash.com/photo-1643706755594-d0e8d8d42a09?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbmdsaXNoJTIwdGVzdCUyMGV4YW0lMjBwcmVwYXJhdGlvbnxlbnwxfHx8fDE3NzM0ODIzODh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    level: "Trung cấp",
    tag: "Hot",
  },
  {
    id: 4,
    title: "IELTS Advanced",
    slug: "ielts-advanced",
    band: "6.5 - 7.5+",
    description: "Mẹo thi nâng cao, luyện đề thực chiến, đạt band 7.5+ dễ dàng.",
    duration: "3 tháng",
    students: 3450,
    rating: 5.0,
    price: "6,500,000đ",
    oldPrice: "9,000,000đ",
    color: "#f26522",
    image: "https://images.unsplash.com/photo-1764044371712-18762769c257?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3cml0aW5nJTIwbm90ZWJvb2slMjBwZW4lMjBzdHVkeXxlbnwxfHx8fDE3NzM0ODIzOTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    level: "Nâng cao",
    tag: "Premium",
  },
];

export function CoursesSection() {
  return (
    <section className="py-20 lg:py-28 bg-white dark:bg-background relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 bg-primary/[0.06] text-primary px-4 py-2 rounded-full text-[16px] mb-5 border border-primary/10" style={{ fontWeight: 600 }}>
            <BookOpen className="w-3.5 h-3.5" />
            Khóa học nổi bật
          </span>
          <h2 className="text-[26px] lg:text-[36px] text-[#1a1a2e] dark:text-foreground mb-4 tracking-tight" style={{ fontWeight: 800 }}>
            Lộ trình học IELTS <span className="text-primary">toàn diện</span>
          </h2>
          <p className="text-muted-foreground text-[15px] max-w-xl mx-auto leading-relaxed">
            Từ cơ bản đến nâng cao, mỗi khóa học được thiết kế phù hợp với trình độ và mục tiêu của bạn
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="group bg-white dark:bg-card rounded-2xl border border-gray-100/80 dark:border-border hover:border-gray-200/80 dark:hover:border-white/10 shadow-sm hover:shadow-xl hover:shadow-black/[0.06] dark:hover:shadow-black/30 transition-all duration-300 overflow-hidden hover:-translate-y-1 hover-lift"
            >
              <div className="relative overflow-hidden">
                <LazyImage
                  src={course.image}
                  alt={course.title}
                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                  wrapperClassName="w-full h-44"
                  dominantColor={course.color + "20"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-3 left-3">
                  <span
                    className="text-white px-2.5 py-1 rounded-lg text-[10.5px] shadow-sm"
                    style={{ fontWeight: 700, backgroundColor: course.color }}
                  >
                    {course.tag}
                  </span>
                </div>
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[15px] shadow-sm" style={{ fontWeight: 600 }}>
                  Band {course.band}
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-[16px] mb-1.5 text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 700 }}>{course.title}</h3>
                <p className="text-[16px] text-muted-foreground mb-3 leading-relaxed">{course.description}</p>
                <div className="flex items-center gap-3 text-[11.5px] text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {course.students.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {course.rating}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-3.5">
                  <div>
                    <span className="text-primary text-[17px]" style={{ fontWeight: 800 }}>{course.price}</span>
                    <span className="text-muted-foreground/60 line-through text-[11.5px] ml-1.5">{course.oldPrice}</span>
                  </div>
                </div>
                <Link
                  to={`/courses/${course.slug}`}
                  className="w-full flex items-center justify-center gap-1.5 bg-[#1a1a2e]/[0.04] dark:bg-white/[0.06] text-[#1a1a2e] dark:text-foreground hover:bg-primary hover:text-white px-4 py-2.5 rounded-xl text-[15px] transition-all duration-200 group/btn"
                  style={{ fontWeight: 600 }}
                >
                  Xem chi tiết
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-[16px] group transition-colors"
            style={{ fontWeight: 600 }}
          >
            <TrendingUp className="w-4 h-4" />
            Xem tất cả khóa học
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

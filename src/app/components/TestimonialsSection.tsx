import { motion } from "motion/react";
import { Star, Quote, TrendingUp } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Nguyễn Thị Lan",
    avatar: "NL",
    band: "7.5",
    previousBand: "5.0",
    course: "IELTS Intermediate",
    content: "Mình đã tăng từ 5.0 lên 7.5 chỉ sau 4 tháng học tại GDNN-GDTX. Giảng viên rất tận tâm và phương pháp học rất hiệu quả!",
    color: "#dc2f3c",
  },
  {
    id: 2,
    name: "Trần Văn Đức",
    avatar: "TĐ",
    band: "8.0",
    previousBand: "6.0",
    course: "IELTS Advanced",
    content: "Tài liệu học rất chất lượng, đặc biệt là phần luyện đề thực chiến. Mình đã đạt 8.0 Overall và nhận được học bổng du học Úc.",
    color: "#3b82f6",
  },
  {
    id: 3,
    name: "Lê Hoàng Mai",
    avatar: "LM",
    band: "6.5",
    previousBand: "4.0",
    course: "IELTS Foundation",
    content: "Từ một người sợ tiếng Anh, giờ mình đã tự tin giao tiếp và đạt 6.5 IELTS. Cảm ơn GDNN-GDTX rất nhiều!",
    color: "#10b981",
  },
  {
    id: 4,
    name: "Phạm Minh Tuấn",
    avatar: "PT",
    band: "7.0",
    previousBand: "5.5",
    course: "IELTS Intermediate",
    content: "Lớp học chỉ 12 người nên thầy cô theo sát từng bạn. Writing được chấm chữa rất chi tiết, giúp mình tiến bộ nhanh.",
    color: "#f26522",
  },
  {
    id: 5,
    name: "Vũ Thị Hạnh",
    avatar: "VH",
    band: "8.5",
    previousBand: "6.5",
    course: "IELTS Advanced",
    content: "Phương pháp dạy Speaking rất độc đáo, giúp mình tự tin hơn rất nhiều khi thi. Overall 8.5, Speaking 9.0!",
    color: "#8b5cf6",
  },
  {
    id: 6,
    name: "Đỗ Quang Huy",
    avatar: "ĐH",
    band: "7.5",
    previousBand: "4.5",
    course: "Foundation - Intermediate",
    content: "Mình học từ Foundation lên Intermediate, tổng cộng 8 tháng. Kết quả 7.5 Overall vượt xa mong đợi!",
    color: "#f59e0b",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-28 bg-[#f8f9fb] dark:bg-[#0c0e14] relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(220,47,60,0.02),transparent_60%)]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 bg-emerald-500/[0.06] text-emerald-600 px-4 py-2 rounded-full text-[16px] mb-5 border border-emerald-500/10" style={{ fontWeight: 600 }}>
            <Star className="w-3.5 h-3.5 fill-emerald-600" />
            Học viên nói gì
          </span>
          <h2 className="text-[26px] lg:text-[36px] text-[#1a1a2e] dark:text-foreground mb-4 tracking-tight" style={{ fontWeight: 800 }}>
            Câu chuyện <span className="text-primary">thành công</span>
          </h2>
          <p className="text-muted-foreground text-[15px] max-w-xl mx-auto leading-relaxed">
            Hàng nghìn học viên đã đạt band điểm mong muốn và chinh phục ước mơ du học, định cư
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              className="bg-white dark:bg-card rounded-2xl p-6 border border-gray-100/80 dark:border-border hover:shadow-xl hover:shadow-black/[0.05] dark:hover:shadow-black/30 transition-all duration-300 relative group hover:-translate-y-1 hover-lift"
            >
              <Quote className="absolute top-5 right-5 w-8 h-8 text-gray-100 group-hover:text-gray-200 transition-colors" />
              
              <div className="flex items-center gap-3.5 mb-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-[15px]"
                  style={{ fontWeight: 700, background: `linear-gradient(135deg, ${item.color}, ${item.color}cc)` }}
                >
                  {item.avatar}
                </div>
                <div>
                  <h4 className="text-[14.5px] text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 700 }}>{item.name}</h4>
                  <p className="text-[11.5px] text-muted-foreground">{item.course}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-primary/[0.06] to-accent/[0.06] px-3 py-1.5 rounded-lg border border-primary/10">
                  <TrendingUp className="w-3 h-3 text-primary" />
                  <span className="text-muted-foreground/60 text-[16px] line-through">{item.previousBand}</span>
                  <span className="text-[15px] text-muted-foreground">→</span>
                  <span className="text-primary text-[15px]" style={{ fontWeight: 800 }}>{item.band}</span>
                </div>
                <div className="flex ml-auto">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>

              <p className="text-[15.5px] text-muted-foreground leading-[1.7]">"{item.content}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Link } from "react-router";
import { ArrowRight, Gift, Clock, Sparkles } from "lucide-react";
import { motion } from "motion/react";

export function CTASection() {
  return (
    <section className="py-16 lg:py-24 bg-white dark:bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative bg-gradient-to-br from-[#1a1a2e] via-[#252548] to-[#1a1a2e] rounded-3xl p-8 lg:p-16 text-center overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-80 h-80 bg-primary/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/[0.05] to-transparent rounded-full" />

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-white/10 text-white/90 px-5 py-2 rounded-full text-[16px] mb-7 border border-white/10 backdrop-blur-sm"
              style={{ fontWeight: 600 }}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Ưu đãi đặc biệt - Giảm 30% học phí
            </motion.div>

            <h2 className="text-[26px] lg:text-[40px] text-white mb-5 tracking-tight" style={{ fontWeight: 800 }}>
              Sẵn sàng chinh phục IELTS?
            </h2>
            <p className="text-white/60 text-[15px] lg:text-[16.5px] max-w-2xl mx-auto mb-9 leading-relaxed">
              Đăng ký ngay hôm nay để nhận ưu đãi giảm 30% học phí và 1 buổi test trình độ miễn phí
              cùng giảng viên 8.0+ IELTS
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/courses"
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary/90 text-white px-8 py-4 rounded-2xl text-[14.5px] transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
                style={{ fontWeight: 700 }}
              >
                Đăng ký ngay
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href="#"
                className="group inline-flex items-center gap-2 bg-white/[0.08] text-white border border-white/15 hover:bg-white/[0.12] px-8 py-4 rounded-2xl text-[14.5px] transition-all hover:-translate-y-0.5 backdrop-blur-sm"
                style={{ fontWeight: 600 }}
              >
                <Clock className="w-4 h-4 text-white/70" />
                Tư vấn miễn phí
              </a>
            </div>

            <p className="text-white/35 text-[16px] mt-8 flex items-center justify-center gap-2">
              <Gift className="w-3.5 h-3.5" />
              Ưu đãi có hạn - Chỉ còn 15 suất cuối cùng
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

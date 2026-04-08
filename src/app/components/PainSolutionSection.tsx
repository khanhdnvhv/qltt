import { motion } from "motion/react";
import { X, CheckCircle2 } from "lucide-react";

const comparisons = [
  {
    before: "In kế hoạch đào tạo, mang lên Sở chờ ký duyệt mất vài ngày",
    after: "Trung tâm đẩy kế hoạch online → Sở nhận thông báo → Click phê duyệt",
  },
  {
    before: "Excel học viên phân tán, dễ thất lạc, khó tổng hợp báo cáo",
    after: "Hồ sơ điện tử tập trung, tra cứu tức thì, xuất báo cáo một cú nhấp",
  },
  {
    before: "Giáo viên nhập điểm tay vào sổ, photo lại gửi lên văn phòng",
    after: "Giáo viên nhập điểm trực tiếp trên app — dữ liệu đồng bộ tức thì",
  },
  {
    before: "Học viên không biết lịch học, phải gọi điện hỏi trung tâm",
    after: "Học viên xem lịch học, kết quả, chứng chỉ ngay trên điện thoại",
  },
  {
    before: "Chứng chỉ cấp phát thủ công, không có hệ thống tra cứu số hiệu",
    after: "Cấp chứng chỉ điện tử, tra cứu số hiệu online, liên thông dữ liệu",
  },
];

export function PainSolutionSection() {
  return (
    <section className="py-16 lg:py-24 bg-white dark:bg-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-[#f26522]/10 text-[#f26522] px-4 py-1.5 rounded-full text-[13px] mb-5 border border-[#f26522]/20" style={{ fontWeight: 600 }}>
            TRƯỚC VÀ SAU KHI CÓ HỆ THỐNG
          </div>
          <h2 className="text-[30px] lg:text-[38px] text-[#1a1a2e] dark:text-foreground mb-4" style={{ fontWeight: 800 }}>
            Giải quyết đúng nỗi đau thực tế
          </h2>
          <p className="text-muted-foreground text-[16px] max-w-2xl mx-auto">
            Không phải phần mềm chung chung — đây là công cụ được xây dựng riêng cho bài toán quản lý GDNN-GDTX.
          </p>
        </motion.div>

        {/* Table header */}
        <div className="grid grid-cols-2 gap-4 mb-4 max-w-4xl mx-auto px-2">
          <div className="flex items-center gap-2 text-[14px] text-red-600 dark:text-red-400" style={{ fontWeight: 700 }}>
            <X className="w-5 h-5" /> Trước đây
          </div>
          <div className="flex items-center gap-2 text-[14px] text-emerald-600 dark:text-emerald-400" style={{ fontWeight: 700 }}>
            <CheckCircle2 className="w-5 h-5" /> Với hệ thống
          </div>
        </div>

        {/* Rows */}
        <div className="space-y-3 max-w-4xl mx-auto">
          {comparisons.map((row, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="grid grid-cols-2 gap-4"
            >
              {/* Before */}
              <div className="flex items-start gap-3 bg-red-50 dark:bg-red-500/[0.07] border border-red-100 dark:border-red-500/20 rounded-xl px-4 py-4">
                <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-[14px] text-red-700 dark:text-red-300 leading-relaxed">{row.before}</p>
              </div>
              {/* After */}
              <div className="flex items-start gap-3 bg-emerald-50 dark:bg-emerald-500/[0.07] border border-emerald-100 dark:border-emerald-500/20 rounded-xl px-4 py-4">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-[14px] text-emerald-800 dark:text-emerald-300 leading-relaxed">{row.after}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

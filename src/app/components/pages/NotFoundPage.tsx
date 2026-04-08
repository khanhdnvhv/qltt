import { Link } from "react-router";
import { motion } from "motion/react";
import { Home, ArrowLeft } from "lucide-react";
import { useDocumentTitle } from "../../utils/hooks";

export function NotFoundPage() {
  useDocumentTitle("404 - Không tìm thấy trang");
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#fafbfc] dark:bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="text-[120px] leading-none mb-4" style={{ fontWeight: 800 }}>
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">404</span>
        </div>
        <h1 className="text-[24px] text-[#1a1a2e] dark:text-foreground mb-3" style={{ fontWeight: 700 }}>
          Trang không tồn tại
        </h1>
        <p className="text-muted-foreground text-[14.5px] mb-8 leading-relaxed">
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển. Hãy quay về trang chủ để tiếp tục.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 bg-[#f4f5f7] dark:bg-white/5 text-[#1a1a2e] dark:text-foreground px-5 py-3 rounded-xl text-[15.5px] hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
            style={{ fontWeight: 500 }}
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>
          <Link
            to="/"
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/90 text-white px-5 py-3 rounded-xl text-[15.5px] shadow-md shadow-primary/20 hover:shadow-lg transition-all"
            style={{ fontWeight: 600 }}
          >
            <Home className="w-4 h-4" />
            Trang chủ
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

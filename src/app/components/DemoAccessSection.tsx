import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, Loader2, Zap, Lock } from "lucide-react";
import { useState } from "react";
import { useAuth } from "./auth/AuthContext";

const demoAccounts = [
  {
    emoji: "🏛️",
    role: "Sở GD&ĐT",
    roleEn: "Department",
    desc: "Dashboard điều hành toàn tỉnh. Phê duyệt kế hoạch, xem báo cáo 112 trung tâm.",
    email: "department@gdnn.vn",
    color: "#dc2f3c",
    gradient: "from-red-500 to-rose-600",
    glow: "shadow-red-500/30",
  },
  {
    emoji: "🏢",
    role: "Trung tâm",
    roleEn: "Center",
    desc: "Quản lý học viên, lớp học, học phí và chứng chỉ của một trung tâm mẫu.",
    email: "center@gdnn.vn",
    color: "#8b5cf6",
    gradient: "from-violet-500 to-purple-700",
    glow: "shadow-purple-500/30",
  },
  {
    emoji: "👨‍🏫",
    role: "Giáo viên",
    roleEn: "Teacher",
    desc: "Lịch dạy, điểm danh, nhập điểm và quản lý học liệu cá nhân.",
    email: "teacher@gdnn.vn",
    color: "#10b981",
    gradient: "from-emerald-500 to-teal-600",
    glow: "shadow-emerald-500/30",
  },
  {
    emoji: "👨‍🎓",
    role: "Học viên",
    roleEn: "Student",
    desc: "Lịch học, kết quả, tiến độ và chứng chỉ cá nhân trên điện thoại.",
    email: "student@gdnn.vn",
    color: "#f26522",
    gradient: "from-orange-500 to-amber-600",
    glow: "shadow-orange-500/30",
  },
];

export function DemoAccessSection() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);

  const handleDemo = async (email: string) => {
    setLoadingEmail(email);
    const result = await login(email, "123456");
    setLoadingEmail(null);
    if (result.success) {
      const path = result.role === "teacher" ? "/admin/teacher"
        : result.role === "student" ? "/admin/student"
        : "/admin";
      navigate(path, { replace: true });
    }
  };

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden bg-[#0d0f1a]">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/[0.07] blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-blue-500/[0.06] blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)`,
            backgroundSize: "36px 36px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-white/[0.07] text-white/70 px-4 py-1.5 rounded-full text-[13px] mb-5 border border-white/10" style={{ fontWeight: 600 }}>
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            TRẢI NGHIỆM NGAY — KHÔNG CẦN ĐĂNG KÝ
          </div>
          <h2 className="text-[32px] lg:text-[44px] text-white mb-4 leading-tight" style={{ fontWeight: 800 }}>
            Nhấp một cái.{" "}
            <span className="bg-gradient-to-r from-primary to-[#f26522] bg-clip-text text-transparent">
              Vào luôn dashboard.
            </span>
          </h2>
          <p className="text-white/45 text-[16px] max-w-xl mx-auto">
            Dữ liệu mẫu thực tế, đầy đủ tính năng. Không cài đặt, không điền form — chỉ cần chọn vai trò.
          </p>
        </motion.div>

        {/* Demo cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {demoAccounts.map((acc, i) => {
            const isLoading = loadingEmail === acc.email;
            const isDisabled = loadingEmail !== null;
            return (
              <motion.div
                key={acc.email}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.09 }}
              >
                <motion.button
                  whileHover={!isDisabled ? { scale: 1.02, y: -4 } : {}}
                  whileTap={!isDisabled ? { scale: 0.97 } : {}}
                  onClick={() => !isDisabled && handleDemo(acc.email)}
                  disabled={isDisabled}
                  className={`w-full text-left rounded-2xl overflow-hidden transition-all disabled:opacity-50 disabled:cursor-not-allowed group`}
                  style={{
                    boxShadow: isLoading ? `0 16px 40px ${acc.color}40` : "none",
                  }}
                >
                  {/* Card gradient header */}
                  <div
                    className="px-5 pt-5 pb-4 relative"
                    style={{ background: `linear-gradient(135deg, ${acc.color}22, ${acc.color}0a)`, borderBottom: `1px solid ${acc.color}20` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-[38px] leading-none">{acc.emoji}</span>
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin mt-1" style={{ color: acc.color }} />
                      ) : (
                        <motion.div
                          className="w-8 h-8 rounded-xl flex items-center justify-center border opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ borderColor: acc.color + "40", background: acc.color + "15" }}
                        >
                          <ArrowRight className="w-4 h-4" style={{ color: acc.color }} />
                        </motion.div>
                      )}
                    </div>
                    <p className="text-[17px] text-white font-bold">{acc.role}</p>
                    <p className="text-white/40 text-[12px] font-mono">{acc.email}</p>
                  </div>

                  {/* Card body */}
                  <div
                    className="px-5 py-4 bg-white/[0.04] border border-t-0"
                    style={{ borderColor: acc.color + "20" }}
                  >
                    <p className="text-[13.5px] text-white/55 leading-relaxed mb-4">{acc.desc}</p>
                    <div
                      className="w-full py-2 rounded-xl text-[13px] text-center transition-all"
                      style={{
                        background: isLoading ? `${acc.color}30` : `${acc.color}15`,
                        color: acc.color,
                        fontWeight: 700,
                        border: `1px solid ${acc.color}25`,
                      }}
                    >
                      {isLoading ? "Đang đăng nhập..." : "Đăng nhập ngay →"}
                    </div>
                  </div>
                </motion.button>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom row */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <div className="flex items-center gap-2 text-white/30 text-[13.5px]">
            <Lock className="w-3.5 h-3.5" />
            Mật khẩu demo: <span className="font-mono text-white/50 font-bold ml-1">123456</span>
          </div>
          <span className="hidden sm:block w-px h-4 bg-white/10" />
          <Link
            to="/login"
            className="flex items-center gap-1.5 text-white/40 hover:text-white/75 text-[13.5px] transition-colors"
            style={{ fontWeight: 500 }}
          >
            Đăng nhập với tài khoản thực
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

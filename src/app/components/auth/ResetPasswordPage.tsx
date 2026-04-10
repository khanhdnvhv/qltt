import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Lock, ArrowRight, Loader2, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "./AuthContext";
import { useDocumentTitle } from "../../utils/hooks";

export function ResetPasswordPage() {
  useDocumentTitle("Đặt lại mật khẩu");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  // Validate token on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ielts_reset_token");
      if (!stored) {
        setTokenValid(false);
        return;
      }
      const { expiresAt } = JSON.parse(stored);
      if (Date.now() > expiresAt) {
        localStorage.removeItem("ielts_reset_token");
        setTokenValid(false);
        return;
      }
      setTokenValid(true);
    } catch {
      setTokenValid(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!password || password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    setLoading(true);
    const result = await resetPassword("mock-token", password);
    setLoading(false);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2500);
    } else {
      setError(result.error || "Có lỗi xảy ra. Vui lòng thử lại");
    }
  };

  // Token loading state
  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafbfc] dark:bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafbfc] dark:bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[420px]"
      >
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white text-[17px]" style={{ fontWeight: 800 }}>
            GD
          </div>
          <div>
            <span className="text-[#1a1a2e] dark:text-foreground text-[19px]" style={{ fontWeight: 800 }}>GDNN</span>
            <span className="text-primary text-[19px]" style={{ fontWeight: 800 }}>&nbsp;GDTX</span>
          </div>
        </div>

        {/* Invalid/expired token */}
        {!tokenValid ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-[24px] text-[#1a1a2e] dark:text-foreground mb-3" style={{ fontWeight: 800 }}>
              Liên kết không hợp lệ
            </h1>
            <p className="text-muted-foreground text-[16px] mb-6 leading-relaxed">
              Liên kết đặt lại mật khẩu đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu liên kết mới.
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary/90 text-white px-6 py-3 rounded-xl text-[16px] shadow-lg shadow-primary/20"
              style={{ fontWeight: 600 }}
            >
              Yêu cầu liên kết mới
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-[24px] text-[#1a1a2e] dark:text-foreground mb-3" style={{ fontWeight: 800 }}>
              Đặt lại thành công!
            </h1>
            <p className="text-muted-foreground text-[16px] mb-4">
              Mật khẩu của bạn đã được cập nhật. Đang chuyển hướng đến trang đăng nhập...
            </p>
            <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          </motion.div>
        ) : (
          <>
            <h1 className="text-[28px] text-[#1a1a2e] dark:text-foreground mb-2" style={{ fontWeight: 800 }}>
              Đặt lại mật khẩu
            </h1>
            <p className="text-muted-foreground text-[14.5px] mb-8">
              Nhập mật khẩu mới cho tài khoản của bạn.
            </p>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-[15px] mb-5"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[15px] text-[#1a1a2e] dark:text-foreground mb-2" style={{ fontWeight: 600 }}>Mật khẩu mới</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/50" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ít nhất 6 ký tự"
                    className="w-full bg-[#f4f5f7] dark:bg-white/5 border border-transparent focus:border-primary/30 focus:bg-white dark:focus:bg-white/10 pl-11 pr-12 py-3.5 rounded-xl text-[16px] text-foreground outline-none transition-all focus:ring-2 focus:ring-primary/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[15px] text-[#1a1a2e] dark:text-foreground mb-2" style={{ fontWeight: 600 }}>Xác nhận mật khẩu mới</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/50" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full bg-[#f4f5f7] dark:bg-white/5 border border-transparent focus:border-primary/30 focus:bg-white dark:focus:bg-white/10 pl-11 pr-4 py-3.5 rounded-xl text-[16px] text-foreground outline-none transition-all focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary/90 text-white py-3.5 rounded-xl text-[14.5px] transition-all shadow-lg shadow-primary/20 hover:shadow-xl disabled:opacity-70"
                style={{ fontWeight: 600 }}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Đặt lại mật khẩu
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-muted-foreground text-[15px] mt-6">
              <Link to="/login" className="text-primary hover:underline" style={{ fontWeight: 500 }}>
                Quay lại đăng nhập
              </Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}

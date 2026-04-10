import { useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { Mail, ArrowRight, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useAuth } from "./AuthContext";
import { useDocumentTitle } from "../../utils/hooks";

export function ForgotPasswordPage() {
  useDocumentTitle("Quên mật khẩu");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Vui lòng nhập email");
      return;
    }
    setLoading(true);
    const result = await forgotPassword(email);
    setLoading(false);
    if (result.success) {
      setSent(true);
    } else {
      setError(result.error || "Có lỗi xảy ra. Vui lòng thử lại");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafbfc] dark:bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[420px]"
      >
        <Link to="/login" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-[#1a1a2e] dark:hover:text-foreground text-[15px] mb-8 transition-colors" style={{ fontWeight: 500 }}>
          <ArrowLeft className="w-4 h-4" />
          Quay lại đăng nhập
        </Link>

        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white text-[17px]" style={{ fontWeight: 800 }}>
            GD
          </div>
          <div>
            <span className="text-[#1a1a2e] dark:text-foreground text-[19px]" style={{ fontWeight: 800 }}>GDNN</span>
            <span className="text-primary text-[19px]" style={{ fontWeight: 800 }}>&nbsp;GDTX</span>
          </div>
        </div>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-[24px] text-[#1a1a2e] dark:text-foreground mb-3" style={{ fontWeight: 800 }}>
              Đã gửi email!
            </h1>
            <p className="text-muted-foreground text-[16px] mb-6 leading-relaxed">
              Nếu địa chỉ <span className="text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 600 }}>{email}</span> có trong hệ thống, chúng tôi đã gửi liên kết đặt lại mật khẩu. Vui lòng kiểm tra hộp thư.
            </p>
            <Link
              to="/reset-password"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary/90 text-white px-6 py-3 rounded-xl text-[16px] shadow-lg shadow-primary/20"
              style={{ fontWeight: 600 }}
            >
              Đặt lại mật khẩu (demo)
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-muted-foreground text-[16px] mt-5">
              Không nhận được email?{" "}
              <button onClick={() => setSent(false)} className="text-primary hover:underline" style={{ fontWeight: 500 }}>
                Thử lại
              </button>
            </p>
          </motion.div>
        ) : (
          <>
            <h1 className="text-[28px] text-[#1a1a2e] dark:text-foreground mb-2" style={{ fontWeight: 800 }}>
              Quên mật khẩu?
            </h1>
            <p className="text-muted-foreground text-[14.5px] mb-8 leading-relaxed">
              Nhập email đã đăng ký, chúng tôi sẽ gửi liên kết đặt lại mật khẩu cho bạn.
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
                <label className="block text-[15px] text-[#1a1a2e] dark:text-foreground mb-2" style={{ fontWeight: 600 }}>Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/50" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="w-full bg-[#f4f5f7] dark:bg-white/5 border border-transparent focus:border-primary/30 focus:bg-white dark:focus:bg-white/10 pl-11 pr-4 py-3.5 rounded-xl text-[16px] text-foreground outline-none transition-all focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary/90 text-white py-3.5 rounded-xl text-[14.5px] transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 disabled:opacity-70"
                style={{ fontWeight: 600 }}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Gửi liên kết đặt lại
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}

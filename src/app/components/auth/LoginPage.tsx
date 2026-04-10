import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { motion } from "motion/react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, BookOpen, ChevronLeft } from "lucide-react";
import { useAuth } from "./AuthContext";
import { useDocumentTitle } from "../../utils/hooks";

const DEMO_ACCOUNTS = [
  {
    role: "Số GĐ&ĐT",
    email: "department@gdnn.vn",
    password: "123456",
    color: "bg-blue-100 dark:bg-blue-500/20",
    icon: "🏢",
  },
  {
    role: "Trung tâm",
    email: "center@gdnn.vn",
    password: "123456",
    color: "bg-purple-100 dark:bg-purple-500/20",
    icon: "🏛️",
  },
  {
    role: "Giáo viên",
    email: "teacher@gdnn.vn",
    password: "123456",
    color: "bg-green-100 dark:bg-green-500/20",
    icon: "👨‍🏫",
  },
  {
    role: "Học viên",
    email: "student@gdnn.vn",
    password: "123456",
    color: "bg-orange-100 dark:bg-orange-500/20",
    icon: "👨‍🎓",
  },
];

export function LoginPage() {
  useDocumentTitle("Đăng nhập");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/";

  const getDashboardPath = (role: string) => {
    if (role === "teacher") return "/admin/teacher";
    if (role === "student") return "/admin/student";
    return "/admin"; // department, center
  };

  const applyRememberMe = (remember: boolean) => {
    if (!remember) {
      // Move auth data from localStorage → sessionStorage so session ends on browser close
      const authData = localStorage.getItem("ielts_pro_auth");
      if (authData) {
        sessionStorage.setItem("ielts_pro_auth", authData);
        localStorage.removeItem("ielts_pro_auth");
      }
    }
  };

  const handleSelectDemo = async (demoAccount: any) => {
    setError("");
    setLoading(true);
    const result = await login(demoAccount.email, demoAccount.password);
    setLoading(false);
    if (result.success) {
      applyRememberMe(rememberMe);
      navigate(getDashboardPath(result.role || ""), { replace: true });
    } else {
      setError(result.error || "Đăng nhập thất bại");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      applyRememberMe(rememberMe);
      navigate(getDashboardPath(result.role || ""), { replace: true });
    } else {
      setError(result.error || "Đăng nhập thất bại");
    }
  };

  return (
    <div className="min-h-screen flex bg-[#fafbfc] dark:bg-background">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-[48%] relative bg-gradient-to-br from-[#1a1a2e] via-[#2d2d4a] to-[#1a1a2e] items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent rounded-full blur-[120px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-md"
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white text-[20px] shadow-lg" style={{ fontWeight: 800 }}>
              IP
            </div>
            <div>
              <span className="text-white text-[22px]" style={{ fontWeight: 800 }}>GDNN·GDTX</span>
              <span className="text-primary text-[22px]" style={{ fontWeight: 800 }}> NNTH</span>
            </div>
          </div>

          <h2 className="text-white text-[36px] leading-tight mb-5" style={{ fontWeight: 800 }}>
            Chào mừng trở lại!
          </h2>
          <p className="text-white/50 text-[15px] leading-relaxed mb-10">
            Đăng nhập để truy cập hệ thống quản lý trung tâm Giáo dục Nghề nghiệp – Giáo dục Thường xuyên Ngoại ngữ & Tin học.
          </p>

          <div className="space-y-4">
            {[
              { icon: BookOpen, text: "Quản lý học viên, lớp học & khóa học" },
              { icon: BookOpen, text: "Theo dõi học phí, điểm danh & kết quả thi" },
              { icon: BookOpen, text: "Cấp phát văn bằng & chứng chỉ trực tuyến" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-white/70 text-[15.5px]">{item.text}</span>
              </motion.div>
            ))}
          </div>

          <div className="mt-14 pt-8 border-t border-white/10">
            <p className="text-white/50 text-[14px] font-semibold mb-3">📋 Tài khoản Demo:</p>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((account) => (
                <div key={account.email} className="text-white/40 text-[14px]">
                  <div className="font-medium text-white/60">{account.icon} {account.role}</div>
                  <div className="text-[13px] ml-6">{account.email} / {account.password}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[420px]"
        >
          {/* Back to home */}
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-[14px] text-muted-foreground hover:text-primary transition-colors"
              style={{ fontWeight: 500 }}
            >
              <ChevronLeft className="w-4 h-4" />
              Quay lại trang chủ
            </Link>
          </div>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white text-[17px]" style={{ fontWeight: 800 }}>
              IP
            </div>
            <div>
              <span className="text-[#1a1a2e] text-[19px]" style={{ fontWeight: 800 }}>GDNN·GDTX</span>
              <span className="text-primary text-[19px]" style={{ fontWeight: 800 }}> NNTH</span>
            </div>
          </div>

          <h1 className="text-[28px] text-[#1a1a2e] mb-2" style={{ fontWeight: 800 }}>
            Đăng nhập
          </h1>
          <p className="text-muted-foreground text-[14.5px] mb-8">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="text-primary hover:underline" style={{ fontWeight: 600 }}>
              Đăng ký miễn phí
            </Link>
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-[15px] mb-6"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[15px] text-[#1a1a2e] mb-2" style={{ fontWeight: 600 }}>
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/50" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full bg-[#f4f5f7] dark:bg-white/5 border border-transparent focus:border-primary/30 focus:bg-white dark:focus:bg-white/10 pl-11 pr-4 py-3.5 rounded-xl text-[16px] outline-none transition-all focus:ring-2 focus:ring-primary/10 text-foreground"
                />
              </div>
            </div>

            <div>
              <label className="block text-[15px] text-[#1a1a2e] mb-2" style={{ fontWeight: 600 }}>
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/50" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="w-full bg-[#f4f5f7] dark:bg-white/5 border border-transparent focus:border-primary/30 focus:bg-white dark:focus:bg-white/10 pl-11 pr-12 py-3.5 rounded-xl text-[16px] outline-none transition-all focus:ring-2 focus:ring-primary/10 text-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/30"
                />
                <span className="text-[15px] text-muted-foreground">Ghi nhớ đăng nhập</span>
              </label>
              <Link to="/forgot-password" className="text-[15px] text-primary hover:underline" style={{ fontWeight: 500 }}>
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary/90 text-white py-3.5 rounded-xl text-[14.5px] transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ fontWeight: 600 }}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Đăng nhập
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Accounts Section */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl">
            <p className="text-[14px] font-semibold text-blue-900 dark:text-blue-400 mb-3 flex items-center gap-2">
              <span>📋</span> Tài khoản Demo (nhấp để sử dụng)
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <motion.button
                  key={account.email}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectDemo(account)}
                  className={`p-3 rounded-lg border border-transparent hover:border-current transition-all text-left text-[13px] ${account.color}`}
                >
                  <div className="text-lg mb-1">{account.icon}</div>
                  <div className="font-semibold text-sm">{account.role}</div>
                  <div className="text-[12px] opacity-75 mt-1 break-all">{account.email}</div>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#fafbfc] px-4 text-[16px] text-muted-foreground">hoặc đăng nhập bằng</span>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-border py-3 rounded-xl text-[15px] text-foreground hover:bg-gray-50 dark:hover:bg-white/10 transition-colors" style={{ fontWeight: 500 }}>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-border py-3 rounded-xl text-[15px] text-foreground hover:bg-gray-50 dark:hover:bg-white/10 transition-colors" style={{ fontWeight: 500 }}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

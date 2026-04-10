import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, User, Phone, CheckCircle, BookOpen, Sparkles } from "lucide-react";
import { useAuth } from "./AuthContext";
import { useDocumentTitle } from "../../utils/hooks";

export function RegisterPage() {
  useDocumentTitle("Đăng ký tài khoản");
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const updateField = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const passwordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };
  const strength = passwordStrength(form.password);
  const strengthLabel = ["", "Yếu", "Trung bình", "Khá", "Mạnh", "Rất mạnh"][strength];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#eab308", "#22c55e", "#10b981"][strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.fullName || !form.email || !form.password || !form.confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu không khớp");
      return;
    }
    if (form.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (!agreed) {
      setError("Vui lòng đồng ý với điều khoản sử dụng");
      return;
    }
    setLoading(true);
    const result = await register({
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      password: form.password,
    });
    setLoading(false);
    if (result.success) {
      navigate("/admin/student");
    } else {
      setError(result.error || "Đăng ký thất bại. Vui lòng thử lại");
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
              GD
            </div>
            <div>
              <span className="text-white text-[22px]" style={{ fontWeight: 800 }}>GDNN</span>
              <span className="text-primary text-[22px]" style={{ fontWeight: 800 }}>&nbsp;GDTX</span>
            </div>
          </div>

          <h2 className="text-white text-[36px] leading-tight mb-5" style={{ fontWeight: 800 }}>
            Bắt đầu hành trình <span className="text-primary">học nghề của bạn!</span>
          </h2>
          <p className="text-white/50 text-[15px] leading-relaxed mb-10">
            Tham gia cùng hàng nghìn học viên đang đào tạo nghề tại hệ thống trung tâm GDNN-GDTX trên toàn tỉnh.
          </p>

          <div className="space-y-4">
            {[
              { icon: Sparkles, text: "Đào tạo nghề chất lượng cao" },
              { icon: BookOpen, text: "Chương trình đa dạng ngành nghề" },
              { icon: CheckCircle, text: "Giáo viên có chuyên môn, kinh nghiệm" },
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
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {["NA", "TB", "MC", "DL"].map((a, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#1a1a2e] bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white text-[9px]" style={{ fontWeight: 700 }}>
                    {a}
                  </div>
                ))}
              </div>
              <p className="text-white/40 text-[16px]">+1,500 học viên đang học cùng bạn</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[420px]"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white text-[17px]" style={{ fontWeight: 800 }}>
              GD
            </div>
            <div>
              <span className="text-[#1a1a2e] dark:text-foreground text-[19px]" style={{ fontWeight: 800 }}>GDNN</span>
              <span className="text-primary text-[19px]" style={{ fontWeight: 800 }}>&nbsp;GDTX</span>
            </div>
          </div>

          <h1 className="text-[28px] text-[#1a1a2e] dark:text-foreground mb-2" style={{ fontWeight: 800 }}>
            Tạo tài khoản
          </h1>
          <p className="text-muted-foreground text-[14.5px] mb-8">
            Đã có tài khoản?{" "}
            <Link to="/login" className="text-primary hover:underline" style={{ fontWeight: 600 }}>
              Đăng nhập
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full name */}
            <div>
              <label className="block text-[15px] text-[#1a1a2e] dark:text-foreground mb-2" style={{ fontWeight: 600 }}>
                Họ và tên
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/50" />
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full bg-[#f4f5f7] dark:bg-white/5 border border-transparent focus:border-primary/30 focus:bg-white dark:focus:bg-white/10 pl-11 pr-4 py-3.5 rounded-xl text-[16px] outline-none transition-all focus:ring-2 focus:ring-primary/10 text-foreground"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[15px] text-[#1a1a2e] dark:text-foreground mb-2" style={{ fontWeight: 600 }}>
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/50" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="name@email.com"
                  className="w-full bg-[#f4f5f7] dark:bg-white/5 border border-transparent focus:border-primary/30 focus:bg-white dark:focus:bg-white/10 pl-11 pr-4 py-3.5 rounded-xl text-[16px] outline-none transition-all focus:ring-2 focus:ring-primary/10 text-foreground"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[15px] text-[#1a1a2e] dark:text-foreground mb-2" style={{ fontWeight: 600 }}>
                Số điện thoại <span className="text-muted-foreground" style={{ fontWeight: 400 }}>(tùy chọn)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/50" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="0987 654 321"
                  className="w-full bg-[#f4f5f7] dark:bg-white/5 border border-transparent focus:border-primary/30 focus:bg-white dark:focus:bg-white/10 pl-11 pr-4 py-3.5 rounded-xl text-[16px] outline-none transition-all focus:ring-2 focus:ring-primary/10 text-foreground"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[15px] text-[#1a1a2e] dark:text-foreground mb-2" style={{ fontWeight: 600 }}>
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/50" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder="Ít nhất 6 ký tự"
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
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-colors"
                        style={{ backgroundColor: i <= strength ? strengthColor : "#e5e7eb" }}
                      />
                    ))}
                  </div>
                  <p className="text-[15px] mt-1" style={{ color: strengthColor, fontWeight: 500 }}>{strengthLabel}</p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-[15px] text-[#1a1a2e] dark:text-foreground mb-2" style={{ fontWeight: 600 }}>
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/50" />
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  className="w-full bg-[#f4f5f7] dark:bg-white/5 border border-transparent focus:border-primary/30 focus:bg-white dark:focus:bg-white/10 pl-11 pr-4 py-3.5 rounded-xl text-[16px] outline-none transition-all focus:ring-2 focus:ring-primary/10 text-foreground"
                />
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-emerald-500" />
                )}
              </div>
            </div>

            {/* Agreement */}
            <label className="flex items-start gap-2.5 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/30 mt-0.5"
              />
              <span className="text-[16px] text-muted-foreground leading-relaxed">
                Tôi đồng ý với{" "}
                <a href="#" className="text-primary hover:underline">Điều khoản sử dụng</a> và{" "}
                <a href="#" className="text-primary hover:underline">Chính sách bảo mật</a> của GDNN-GDTX
              </span>
            </label>

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
                  Đăng ký
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, User, Phone, CheckCircle, BookOpen, Sparkles } from "lucide-react";
import { useAuth } from "./AuthContext";
import { useDocumentTitle } from "../../utils/hooks";

export function RegisterPage() {
  useDocumentTitle("Dang ky tai khoan");
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
  const strengthLabel = ["", "Yeu", "Trung binh", "Kha", "Manh", "Rat manh"][strength];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#eab308", "#22c55e", "#10b981"][strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.fullName || !form.email || !form.password || !form.confirmPassword) {
      setError("Vui long dien day du thong tin");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Mat khau khong khop");
      return;
    }
    if (form.password.length < 6) {
      setError("Mat khau phai co it nhat 6 ky tu");
      return;
    }
    if (!agreed) {
      setError("Vui long dong y voi dieu khoan su dung");
      return;
    }
    setLoading(true);
    const result = await register(form.fullName, form.email, form.password);
    setLoading(false);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error || "Dang ky that bai");
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
              <span className="text-white text-[22px]" style={{ fontWeight: 800 }}>IELTS</span>
              <span className="text-primary text-[22px]" style={{ fontWeight: 800 }}> Pro</span>
            </div>
          </div>

          <h2 className="text-white text-[36px] leading-tight mb-5" style={{ fontWeight: 800 }}>
            Bat dau hanh trinh <span className="text-primary">chinh phuc IELTS!</span>
          </h2>
          <p className="text-white/50 text-[15px] leading-relaxed mb-10">
            Tham gia cung 15,000+ hoc vien da dat band 7.0+ IELTS. Dang ky hom nay de nhan ngay khoa hoc thu mien phi.
          </p>

          <div className="space-y-4">
            {[
              { icon: Sparkles, text: "Hoc thu mien phi 3 ngay" },
              { icon: BookOpen, text: "100+ bai hoc & mock test" },
              { icon: CheckCircle, text: "Giang vien IELTS 8.0+ kinh nghiem" },
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
              <p className="text-white/40 text-[16px]">+15,000 hoc vien dang hoc cung ban</p>
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
              IP
            </div>
            <div>
              <span className="text-[#1a1a2e] dark:text-foreground text-[19px]" style={{ fontWeight: 800 }}>IELTS</span>
              <span className="text-primary text-[19px]" style={{ fontWeight: 800 }}> Pro</span>
            </div>
          </div>

          <h1 className="text-[28px] text-[#1a1a2e] dark:text-foreground mb-2" style={{ fontWeight: 800 }}>
            Tao tai khoan
          </h1>
          <p className="text-muted-foreground text-[14.5px] mb-8">
            Da co tai khoan?{" "}
            <Link to="/login" className="text-primary hover:underline" style={{ fontWeight: 600 }}>
              Dang nhap
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
                Ho va ten
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/50" />
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  placeholder="Nguyen Van A"
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
                So dien thoai <span className="text-muted-foreground" style={{ fontWeight: 400 }}>(tuy chon)</span>
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
                Mat khau
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/50" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder="It nhat 6 ky tu"
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
                Xac nhan mat khau
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/50" />
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                  placeholder="Nhap lai mat khau"
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
                Toi dong y voi{" "}
                <a href="#" className="text-primary hover:underline">Dieu khoan su dung</a> va{" "}
                <a href="#" className="text-primary hover:underline">Chinh sach bao mat</a> cua GDNN-GDTX
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
                  Dang ky mien phi
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#fafbfc] dark:bg-background px-4 text-[16px] text-muted-foreground">hoac dang ky bang</span>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
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


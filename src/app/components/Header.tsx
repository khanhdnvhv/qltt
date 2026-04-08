import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Menu, X, Phone, Mail, ArrowRight, Sparkles, User, LogOut, LayoutDashboard, Settings, ChevronDown, Moon, Sun, Bell } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "./auth/AuthContext";
import { useTheme } from "./ThemeContext";
import { useAppReducedMotion } from "./ReducedMotionContext";
import { useFocusTrap, useEscapeKey } from "../utils/hooks";
import { StudentNotificationCenter } from "./StudentNotificationCenter";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const reducedMotion = useAppReducedMotion();
  const userMenuRef = useFocusTrap<HTMLDivElement>(userMenuOpen);
  const mobileMenuRef = useFocusTrap<HTMLDivElement>(mobileMenuOpen);
  useEscapeKey(() => setUserMenuOpen(false), userMenuOpen);
  useEscapeKey(() => setMobileMenuOpen(false), mobileMenuOpen);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { label: "Trang chủ", path: "/" },
    { label: "Tính năng", path: "/#tinh-nang" },
    { label: "Phân hệ", path: "/#portal" },
    { label: "Quy trình", path: "/#quy-trinh" },
    { label: "Liên hệ", path: "/#lien-he" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50" role="banner">
      {/* Top bar */}
      <div className={`bg-gradient-to-r from-[#1a1a2e] to-[#2d2d4a] text-white transition-all duration-300 ${scrolled ? "h-0 overflow-hidden opacity-0" : "h-auto opacity-100"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex justify-between items-center text-[16px]">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 opacity-90">
              <Phone className="w-3 h-3" />
              Hỗ trợ: 1900 xxxx
            </span>
            <span className="hidden sm:flex items-center gap-1.5 opacity-90">
              <Mail className="w-3 h-3" />
              support@gdnn-gdtx.vn
            </span>
          </div>
          <Link to="/courses" className="flex items-center gap-1.5 hover:text-white/90 transition-colors group">
            <Sparkles className="w-3 h-3 text-yellow-400" />
            <span>Trải nghiệm demo miễn phí</span>
            <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </Link>
        </div>
      </div>

      {/* Main nav */}
      <div className={`transition-all duration-300 ${scrolled ? "bg-white/80 dark:bg-[#1a1c24]/90 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)]" : "bg-white/95 dark:bg-[#1a1c24]/95 backdrop-blur-sm"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-[#f26522] rounded-xl flex items-center justify-center text-white text-[13px] shadow-md shadow-primary/20 group-hover:shadow-lg group-hover:shadow-primary/30 transition-shadow" style={{ fontWeight: 800 }}>
              EDU
            </div>
            <div className="leading-tight">
              <div className="flex items-baseline gap-0.5">
                <span className="text-[#1a1a2e] dark:text-white text-[17px] tracking-tight" style={{ fontWeight: 800 }}>GDNN·GDTX</span>
              </div>
              <p className="text-[10.5px] text-muted-foreground tracking-wide">Ngoại ngữ · Tin học · Đào tạo nghề</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main navigation">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="relative px-4 py-2 rounded-lg text-[14.5px] transition-all"
                style={{ fontWeight: 500 }}
              >
                <span className={`relative z-10 transition-colors ${isActive(item.path) ? "text-primary" : "text-[#1a1a2e]/80 dark:text-white/70 hover:text-[#1a1a2e] dark:hover:text-white"}`}>
                  {item.label}
                </span>
                {isActive(item.path) && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-primary/[0.06] rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-[#f4f5f7] dark:bg-white/10 hover:bg-[#ebedf0] dark:hover:bg-white/20 transition-colors"
              title={isDark ? "Chuyển sang Light mode" : "Chuyển sang Dark mode"}
              aria-label={isDark ? "Chuyển sang Light mode" : "Chuyển sang Dark mode"}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
            </button>
            {/* Notification center dropdown */}
            {isAuthenticated && <StudentNotificationCenter />}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 bg-[#f4f5f7] dark:bg-white/10 hover:bg-[#ebedf0] dark:hover:bg-white/20 px-3.5 py-2 rounded-xl transition-colors"
                  aria-label="Menu tài khoản"
                  aria-expanded={userMenuOpen}
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-[15px]" style={{ fontWeight: 700 }}>
                    {user?.fullName?.charAt(0) || "U"}
                  </div>
                  <span className="text-[15px] text-[#1a1a2e] dark:text-foreground max-w-[100px] truncate" style={{ fontWeight: 600 }}>
                    {user?.fullName?.split(" ").pop() || "User"}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-card rounded-xl shadow-xl shadow-black/10 dark:shadow-black/30 border border-gray-100 dark:border-border py-2 z-50"
                      >
                        <div className="px-4 py-2.5 border-b border-gray-100 dark:border-border">
                          <p className="text-[15px] text-[#1a1a2e] dark:text-foreground truncate" style={{ fontWeight: 600 }}>{user?.fullName}</p>
                          <p className="text-[15px] text-muted-foreground truncate">{user?.email}</p>
                        </div>
                        <div className="py-1">
                          <button
                            onClick={() => { setUserMenuOpen(false); navigate("/dashboard"); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[15px] text-[#1a1a2e]/80 hover:bg-gray-50 transition-colors"
                            style={{ fontWeight: 500 }}
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                          </button>
                          <button
                            onClick={() => { setUserMenuOpen(false); navigate("/profile"); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[15px] text-[#1a1a2e]/80 hover:bg-gray-50 transition-colors"
                            style={{ fontWeight: 500 }}
                          >
                            <Settings className="w-4 h-4" />
                            Cài đặt
                          </button>
                          {user?.role === "admin" && (
                            <button
                              onClick={() => { setUserMenuOpen(false); navigate("/admin"); }}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[15px] text-[#1a1a2e]/80 hover:bg-gray-50 transition-colors"
                              style={{ fontWeight: 500 }}
                            >
                              <User className="w-4 h-4" />
                              Admin Portal
                            </button>
                          )}
                        </div>
                        <div className="border-t border-gray-100 dark:border-border pt-1">
                          <button
                            onClick={() => { setUserMenuOpen(false); logout(); navigate("/"); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[15px] text-red-600 hover:bg-red-50 transition-colors"
                            style={{ fontWeight: 500 }}
                          >
                            <LogOut className="w-4 h-4" />
                            Đăng xuất
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-[15.5px] text-[#1a1a2e]/80 hover:text-[#1a1a2e] px-4 py-2.5 rounded-xl transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/login"
                  className="group relative bg-gradient-to-r from-primary to-primary/90 text-white px-6 py-2.5 rounded-xl text-[15.5px] transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 overflow-hidden"
                  style={{ fontWeight: 600 }}
                >
                  <span className="relative z-10 flex items-center gap-1.5">
                    Dùng thử miễn phí
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
              </>
            )}
          </div>

          <button
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Dong menu" : "Mo menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="lg:hidden bg-white/95 dark:bg-card/95 backdrop-blur-xl border-t border-gray-100 dark:border-border overflow-hidden"
          >
            <div className="px-4 sm:px-6 py-4 space-y-1" ref={mobileMenuRef} role="navigation" aria-label="Mobile navigation">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={item.path}
                    className={`block px-4 py-3 rounded-xl text-[14.5px] transition-all ${
                      isActive(item.path)
                        ? "bg-primary/[0.06] text-primary"
                        : "text-[#1a1a2e]/80 dark:text-foreground/70 hover:bg-gray-50 dark:hover:bg-white/5"
                    }`}
                    style={{ fontWeight: 500 }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              {/* Mobile auth buttons */}
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                {/* Mobile theme toggle */}
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-[14.5px] text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/5 transition-colors mb-2"
                  style={{ fontWeight: 500 }}
                >
                  <span className="flex items-center gap-2">
                    {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                    {isDark ? "Light Mode" : "Dark Mode"}
                  </span>
                  <div className={`w-10 h-5.5 rounded-full relative transition-colors ${isDark ? "bg-primary" : "bg-gray-300"}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${isDark ? "left-5.5" : "left-0.5"}`} />
                  </div>
                </button>
                {isAuthenticated ? (
                  <div className="mt-3 space-y-2">
                    <Link
                      to="/dashboard"
                      className="block bg-[#f4f5f7] text-[#1a1a2e] text-center px-5 py-3 rounded-xl text-[16px]"
                      style={{ fontWeight: 600 }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => { logout(); navigate("/"); setMobileMenuOpen(false); }}
                      className="block w-full text-red-600 text-center px-5 py-3 rounded-xl text-[16px] border border-red-200 hover:bg-red-50"
                      style={{ fontWeight: 600 }}
                    >
                      Đăng xuất
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 space-y-2">
                    <Link
                      to="/login"
                      className="block bg-[#f4f5f7] text-[#1a1a2e] text-center px-5 py-3 rounded-xl text-[16px]"
                      style={{ fontWeight: 600 }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      to="/register"
                      className="block bg-gradient-to-r from-primary to-primary/90 text-white text-center px-5 py-3.5 rounded-xl text-[16px] shadow-md shadow-primary/20"
                      style={{ fontWeight: 600 }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Đăng ký ngay
                    </Link>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

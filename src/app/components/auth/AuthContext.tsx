import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import {
  sanitizeEmail,
  sanitizeInput,
  checkRateLimit,
  resetRateLimit,
  generateCsrfToken,
  updateLastActivity,
  generateSessionId,
} from "../../utils/security";

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  avatar: string;
  role: "student" | "teacher" | "admin" | "department" | "center";
  bandScore: number | null;
  targetBand: number | null;
  weakSkills: string[];
  joinedAt: string;
  bio: string;
  address: string;
  dateOfBirth: string;
  language: "vi" | "en";
  notificationPrefs: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (token: string, password: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

interface RegisterData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "ielts_pro_auth";
const USERS_KEY = "ielts_pro_users";

// Mock users database
const defaultUsers = [
  {
    id: "dept-001",
    email: "department@gdnn.vn",
    password: "123456",
    fullName: "Sở Giáo dục Đào tạo",
    phone: "0912345678",
    avatar: "",
    role: "department" as const,
    bandScore: null,
    targetBand: null,
    weakSkills: [],
    joinedAt: "2025-01-01",
    bio: "Tài khoản Số Giáo dục Đào tạo & Đào tạo Dạy nghề",
    address: "Ha Noi",
    dateOfBirth: "2000-01-01",
    language: "vi" as const,
    notificationPrefs: { email: true, push: true, inApp: true },
  },
  {
    id: "center-001",
    email: "center@gdnn.vn",
    password: "123456",
    fullName: "Trung tâm Phát triển Nhân lực",
    phone: "0923456789",
    avatar: "",
    role: "center" as const,
    bandScore: null,
    targetBand: null,
    weakSkills: [],
    joinedAt: "2025-02-01",
    bio: "Quản lý Trung tâm GDNN & GDTX",
    address: "Ha Noi",
    dateOfBirth: "2000-01-01",
    language: "vi" as const,
    notificationPrefs: { email: true, push: true, inApp: true },
  },
  {
    id: "teacher-001",
    email: "teacher@gdnn.vn",
    password: "123456",
    fullName: "Trương Văn Nam (Giáo viên)",
    phone: "0934567890",
    avatar: "",
    role: "teacher" as const,
    bandScore: null,
    targetBand: null,
    weakSkills: [],
    joinedAt: "2025-03-01",
    bio: "Giáo viên dạy nghề tại trung tâm",
    address: "Ha Noi",
    dateOfBirth: "1990-05-15",
    language: "vi" as const,
    notificationPrefs: { email: true, push: true, inApp: true },
  },
  {
    id: "student-001",
    email: "student@gdnn.vn",
    password: "123456",
    fullName: "Nguyễn Thị Hương (Học viên)",
    phone: "0945678901",
    avatar: "",
    role: "student" as const,
    bandScore: null,
    targetBand: null,
    weakSkills: [],
    joinedAt: "2025-04-01",
    bio: "Học viên tham gia khóa đào tạo",
    address: "Ha Noi",
    dateOfBirth: "2005-03-20",
    language: "vi" as const,
    notificationPrefs: { email: true, push: true, inApp: true },
  },
];

function getStoredUsers() {
  try {
    const data = localStorage.getItem(USERS_KEY);
    if (data) {
      const stored = JSON.parse(data) as any[];
      // Ensure all default demo users are always present with correct passwords
      let changed = false;
      for (const def of defaultUsers) {
        const idx = stored.findIndex((u) => u.email === def.email);
        if (idx < 0) {
          stored.push(def);
          changed = true;
        } else if (!stored[idx].password) {
          stored[idx].password = def.password;
          changed = true;
        }
      }
      if (changed) localStorage.setItem(USERS_KEY, JSON.stringify(stored));
      return stored;
    }
  } catch {}
  localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  return defaultUsers;
}

function generateId() {
  return "user-" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth state on mount – check sessionStorage first (non-persistent), then localStorage (remember me)
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      }
    } catch {}
    setIsLoading(false);
  }, []);

  const persistUser = useCallback((u: User | null) => {
    setUser(u);
    if (u) {
      // Use whichever storage is currently active (session=non-persistent, local=remember me)
      const inSession = !!sessionStorage.getItem(STORAGE_KEY);
      if (inSession) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    // Rate limiting: max 5 login attempts per minute
    const rl = checkRateLimit("login", 5, 60000, 30000);
    if (!rl.allowed) {
      const seconds = Math.ceil(rl.retryAfterMs / 1000);
      return { success: false, error: `Quá nhiều lần thử. Vui lòng đợi ${seconds} giây.` };
    }

    const cleanEmail = sanitizeEmail(email);
    const cleanPassword = sanitizeInput(password);

    await new Promise((r) => setTimeout(r, 800)); // simulate network
    const users = getStoredUsers();
    const found = users.find((u: any) => u.email === cleanEmail && u.password === cleanPassword);
    if (!found) {
      return { success: false, error: "Email hoặc mật khẩu không chính xác" };
    }

    // Reset rate limit on success
    resetRateLimit("login");
    // Generate session
    generateCsrfToken();
    updateLastActivity();

    const { password: _, ...userData } = found;
    persistUser(userData as User);
    return { success: true, role: userData.role };
  }, [persistUser]);

  const register = useCallback(async (data: RegisterData) => {
    // Rate limiting: max 3 registrations per 5 minutes
    const rl = checkRateLimit("register", 3, 300000, 60000);
    if (!rl.allowed) {
      const seconds = Math.ceil(rl.retryAfterMs / 1000);
      return { success: false, error: `Quá nhiều lần thử. Vui lòng đợi ${seconds} giây.` };
    }

    const cleanEmail = sanitizeEmail(data.email);
    const cleanName = sanitizeInput(data.fullName);
    const cleanPhone = sanitizeInput(data.phone);

    await new Promise((r) => setTimeout(r, 800));
    const users = getStoredUsers();
    if (users.find((u: any) => u.email === cleanEmail)) {
      return { success: false, error: "Email đã được sử dụng" };
    }
    const newUser = {
      id: generateSessionId(),
      email: cleanEmail,
      password: data.password,
      fullName: cleanName,
      phone: cleanPhone,
      avatar: "",
      role: "student" as const,
      bandScore: null,
      targetBand: null,
      weakSkills: [],
      joinedAt: new Date().toISOString().split("T")[0],
      bio: "",
      address: "",
      dateOfBirth: "",
      language: "vi" as const,
      notificationPrefs: { email: true, push: true, inApp: true },
    };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    const { password: _, ...userData } = newUser;
    persistUser(userData as User);
    return { success: true };
  }, [persistUser]);

  const logout = useCallback(() => {
    persistUser(null);
  }, [persistUser]);

  const updateProfile = useCallback((data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    persistUser(updated);
    // Also update in users store
    const users = getStoredUsers();
    const idx = users.findIndex((u: any) => u.id === user.id);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...data };
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  }, [user, persistUser]);

  const forgotPassword = useCallback(async (email: string) => {
    // Rate limiting: max 3 requests per 10 minutes
    const rl = checkRateLimit("forgot-password", 3, 600000, 120000);
    if (!rl.allowed) {
      const seconds = Math.ceil(rl.retryAfterMs / 1000);
      return { success: false, error: `Quá nhiều lần thử. Vui lòng đợi ${seconds} giây.` };
    }

    const cleanEmail = sanitizeEmail(email);
    await new Promise((r) => setTimeout(r, 800));
    const users = getStoredUsers();
    const found = users.find((u: any) => u.email === cleanEmail);
    // Anti-enumeration: always return success regardless of whether email exists
    if (found) {
      localStorage.setItem("ielts_reset_token", JSON.stringify({ email: cleanEmail, token: "reset-" + Date.now(), expiresAt: Date.now() + 600000 }));
    }
    return { success: true };
  }, []);

  const resetPassword = useCallback(async (_token: string, password: string) => {
    await new Promise((r) => setTimeout(r, 800));
    try {
      const stored = localStorage.getItem("ielts_reset_token");
      if (!stored) return { success: false, error: "Liên kết đặt lại mật khẩu đã hết hạn" };
      const { email, expiresAt } = JSON.parse(stored);
      if (Date.now() > expiresAt) {
        localStorage.removeItem("ielts_reset_token");
        return { success: false, error: "Liên kết đặt lại mật khẩu đã hết hạn" };
      }
      const users = getStoredUsers();
      const idx = users.findIndex((u: any) => u.email === email);
      if (idx < 0) return { success: false, error: "Không tìm thấy tài khoản" };
      users[idx].password = password;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      localStorage.removeItem("ielts_reset_token");
      return { success: true };
    } catch {
      return { success: false, error: "Có lỗi xảy ra. Vui lòng thử lại" };
    }
  }, []);

  const changePassword = useCallback(async (oldPassword: string, newPassword: string) => {
    await new Promise((r) => setTimeout(r, 800));
    if (!user) return { success: false, error: "Chưa đăng nhập" };
    const users = getStoredUsers();
    const found = users.find((u: any) => u.id === user.id);
    if (!found || found.password !== oldPassword) {
      return { success: false, error: "Mật khẩu cũ không đúng" };
    }
    found.password = newPassword;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return { success: true };
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        forgotPassword,
        resetPassword,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

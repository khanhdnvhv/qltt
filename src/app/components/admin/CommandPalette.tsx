import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, LayoutDashboard, Users, BookOpen, FileText,
  MessageSquare, Settings, BarChart3, Tag, CreditCard,
  Bell, ArrowRight, Keyboard, Moon, Sun, LogOut,
  UserPlus, Download, Plus, Zap, Clock, X,
} from "lucide-react";
import { useTheme } from "../ThemeContext";
import { useEscapeKey } from "../../utils/hooks";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  category: string;
  action: () => void;
  keywords?: string[];
}

// --- Highlight matching text ---
function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-primary/15 text-primary rounded-[2px] px-[1px]" style={{ fontWeight: 700 }}>
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

// --- Recent commands localStorage ---
const RECENT_KEY = "cmd-palette-recent";
const MAX_RECENT = 5;

function getRecentIds(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecentId(id: string) {
  try {
    const prev = getRecentIds().filter((x) => x !== id);
    const next = [id, ...prev].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch { /* ignore */ }
}

function clearRecents() {
  try { localStorage.removeItem(RECENT_KEY); } catch { /* ignore */ }
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Register Ctrl+K / Cmd+K to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((p) => !p);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEscapeKey(() => {
    if (open) setOpen(false);
  });

  // Focus input + load recents when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setRecentIds(getRecentIds());
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const goTo = useCallback((path: string) => {
    navigate(path);
    setOpen(false);
  }, [navigate]);

  const executeCommand = useCallback((cmd: CommandItem) => {
    saveRecentId(cmd.id);
    cmd.action();
  }, []);

  const commands: CommandItem[] = useMemo(() => [
    // Navigation
    { id: "nav-dashboard", label: "Dashboard", icon: LayoutDashboard, category: "Dieu huong", action: () => goTo("/admin"), keywords: ["tong quan", "home"] },
    { id: "nav-users", label: "Quan ly nguoi dung", icon: Users, category: "Dieu huong", action: () => goTo("/admin/users"), keywords: ["hoc vien", "student", "teacher"] },
    { id: "nav-courses", label: "Quan ly khoa hoc", icon: BookOpen, category: "Dieu huong", action: () => goTo("/admin/courses"), keywords: ["course", "lop hoc"] },
    { id: "nav-blog", label: "Quan ly bai viet", icon: FileText, category: "Dieu huong", action: () => goTo("/admin/blog"), keywords: ["blog", "tin tuc"] },
    { id: "nav-reviews", label: "Quan ly danh gia", icon: MessageSquare, category: "Dieu huong", action: () => goTo("/admin/reviews"), keywords: ["review", "feedback"] },
    { id: "nav-orders", label: "Quan ly don hang", icon: CreditCard, category: "Dieu huong", action: () => goTo("/admin/orders"), keywords: ["order", "thanh toan"] },
    { id: "nav-discounts", label: "Ma giam gia", icon: Tag, category: "Dieu huong", action: () => goTo("/admin/discounts"), keywords: ["coupon", "khuyen mai", "voucher"] },
    { id: "nav-analytics", label: "Thong ke", icon: BarChart3, category: "Dieu huong", action: () => goTo("/admin/analytics"), keywords: ["bao cao", "report", "chart"] },
    { id: "nav-notifications", label: "Thong bao", icon: Bell, category: "Dieu huong", action: () => goTo("/admin/notifications"), keywords: ["notification", "alert"] },
    { id: "nav-settings", label: "Cai dat", icon: Settings, category: "Dieu huong", action: () => goTo("/admin/settings"), keywords: ["setting", "config"] },

    // Quick actions
    { id: "act-add-user", label: "Them nguoi dung moi", description: "Tao tai khoan hoc vien/giang vien", icon: UserPlus, category: "Thao tac nhanh", action: () => goTo("/admin/users"), keywords: ["tao user", "them hoc vien"] },
    { id: "act-add-course", label: "Them khoa hoc moi", icon: Plus, category: "Thao tac nhanh", action: () => goTo("/admin/courses"), keywords: ["tao khoa hoc", "new course"] },
    { id: "act-add-discount", label: "Tao ma giam gia", icon: Tag, category: "Thao tac nhanh", action: () => goTo("/admin/discounts"), keywords: ["tao coupon", "ma khuyen mai"] },
    { id: "act-export", label: "Xuat du lieu CSV", description: "Xuat nguoi dung hoac don hang", icon: Download, category: "Thao tac nhanh", action: () => goTo("/admin/users"), keywords: ["export", "download"] },

    // System
    { id: "sys-theme", label: theme === "dark" ? "Chuyen sang Light Mode" : "Chuyen sang Dark Mode", icon: theme === "dark" ? Sun : Moon, category: "He thong", action: () => { toggleTheme(); setOpen(false); }, keywords: ["dark", "light", "giao dien", "che do toi", "che do sang"] },
    { id: "sys-shortcuts", label: "Xem phim tat", description: "Nhan ? de xem tat ca phim tat", icon: Keyboard, category: "He thong", action: () => setOpen(false), keywords: ["shortcut", "keyboard", "ban phim"] },
    { id: "sys-logout", label: "Dang xuat", icon: LogOut, category: "He thong", action: () => { navigate("/login"); setOpen(false); }, keywords: ["logout", "thoat"] },

    // Public pages
    { id: "pub-home", label: "Trang chu (public)", icon: Zap, category: "Trang public", action: () => { navigate("/"); setOpen(false); }, keywords: ["homepage", "landing"] },
    { id: "pub-courses", label: "Khoa hoc (public)", icon: BookOpen, category: "Trang public", action: () => { navigate("/courses"); setOpen(false); }, keywords: ["course page"] },
  ], [goTo, theme, toggleTheme, navigate]);

  // Build recent commands list
  const recentCommands = useMemo(() => {
    if (recentIds.length === 0) return [];
    return recentIds
      .map((id) => commands.find((c) => c.id === id))
      .filter(Boolean) as CommandItem[];
  }, [recentIds, commands]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase().trim();
    return commands.filter((cmd) => {
      return (
        cmd.label.toLowerCase().includes(q) ||
        cmd.description?.toLowerCase().includes(q) ||
        cmd.category.toLowerCase().includes(q) ||
        cmd.keywords?.some((k) => k.includes(q))
      );
    });
  }, [commands, query]);

  // Build display list: recent (when no query) + filtered results
  const displayList = useMemo(() => {
    if (!query.trim() && recentCommands.length > 0) {
      // Prepend recents, then all commands (deduped)
      const recentSet = new Set(recentCommands.map((c) => c.id));
      const rest = commands.filter((c) => !recentSet.has(c.id));
      return { recents: recentCommands, results: rest };
    }
    return { recents: [], results: filtered };
  }, [query, recentCommands, commands, filtered]);

  // Flat list for keyboard nav
  const flatList = useMemo(() => [...displayList.recents, ...displayList.results], [displayList]);

  // Group results by category
  const grouped = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    for (const cmd of displayList.results) {
      if (!map.has(cmd.category)) map.set(cmd.category, []);
      map.get(cmd.category)!.push(cmd);
    }
    return map;
  }, [displayList.results]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, flatList.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && flatList[selectedIndex]) {
      e.preventDefault();
      executeCommand(flatList[selectedIndex]);
    }
  }, [flatList, selectedIndex, executeCommand]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const item = listRef.current.querySelector(`[data-cmd-index="${selectedIndex}"]`);
    item?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  // Reset index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const renderItem = (cmd: CommandItem, globalIdx: number) => {
    const isSelected = globalIdx === selectedIndex;
    return (
      <button
        key={cmd.id + "-" + globalIdx}
        data-cmd-index={globalIdx}
        onClick={() => executeCommand(cmd)}
        onMouseEnter={() => setSelectedIndex(globalIdx)}
        className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors ${isSelected ? "bg-primary/[0.06] dark:bg-primary/10" : "hover:bg-gray-50 dark:hover:bg-white/[0.03]"}`}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? "bg-primary/10" : "bg-gray-100 dark:bg-white/5"}`}>
          <cmd.icon className={`w-4 h-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-[15px] truncate ${isSelected ? "text-primary" : "text-[#1a1a2e] dark:text-foreground"}`} style={{ fontWeight: isSelected ? 600 : 500 }}>
            <HighlightMatch text={cmd.label} query={query} />
          </p>
          {cmd.description && (
            <p className="text-[15px] text-muted-foreground truncate">
              <HighlightMatch text={cmd.description} query={query} />
            </p>
          )}
        </div>
        {isSelected && (
          <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" />
        )}
      </button>
    );
  };

  let globalCounter = 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[60]"
            onClick={() => setOpen(false)}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-[95%] max-w-[560px] bg-white dark:bg-card rounded-2xl shadow-2xl border border-gray-100 dark:border-border z-[60] overflow-hidden flex flex-col max-h-[70vh]"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-border">
              <Search className="w-5 h-5 text-muted-foreground/50 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tim kiem trang, thao tac..."
                className="flex-1 bg-transparent text-[16px] text-foreground outline-none placeholder:text-muted-foreground/40"
                autoComplete="off"
                spellCheck={false}
              />
              <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 bg-gray-100 dark:bg-white/[0.08] border border-gray-200 dark:border-white/10 rounded-lg text-[16px] text-muted-foreground" style={{ fontWeight: 600 }}>
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="overflow-y-auto py-2 max-h-[55vh]">
              {flatList.length === 0 && (
                <div className="px-5 py-8 text-center">
                  <p className="text-[15px] text-muted-foreground">Khong tim thay ket qua cho &ldquo;{query}&rdquo;</p>
                </div>
              )}

              {/* Recent commands section */}
              {displayList.recents.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-5 py-1.5">
                    <p className="text-[16px] text-muted-foreground/60 uppercase tracking-wider flex items-center gap-1" style={{ fontWeight: 700 }}>
                      <Clock className="w-3 h-3" /> Gan day
                    </p>
                    <button
                      onClick={() => { clearRecents(); setRecentIds([]); }}
                      className="text-[16px] text-muted-foreground/40 hover:text-muted-foreground transition-colors flex items-center gap-0.5"
                    >
                      <X className="w-2.5 h-2.5" /> Xoa
                    </button>
                  </div>
                  {displayList.recents.map((cmd) => {
                    const idx = globalCounter++;
                    return renderItem(cmd, idx);
                  })}
                  <div className="mx-5 my-1.5 border-b border-gray-100 dark:border-border/50" />
                </div>
              )}

              {/* Grouped results */}
              {Array.from(grouped.entries()).map(([category, items]) => (
                <div key={category}>
                  <p className="px-5 py-1.5 text-[16px] text-muted-foreground/60 uppercase tracking-wider" style={{ fontWeight: 700 }}>
                    {category}
                  </p>
                  {items.map((cmd) => {
                    const idx = globalCounter++;
                    return renderItem(cmd, idx);
                  })}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 dark:border-border px-5 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3 text-[16px] text-muted-foreground/50">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-white/[0.08] rounded text-[9px]" style={{ fontWeight: 600 }}>  </kbd>
                  Di chuyen
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-white/[0.08] rounded text-[9px]" style={{ fontWeight: 600 }}> </kbd>
                  Chon
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-white/[0.08] rounded text-[9px]" style={{ fontWeight: 600 }}>Esc</kbd>
                  Dong
                </span>
              </div>
              <span className="text-[16px] text-muted-foreground/40">{flatList.length} ket qua</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


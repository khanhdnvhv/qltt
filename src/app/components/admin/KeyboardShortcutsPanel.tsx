import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Keyboard, Command } from "lucide-react";
import { useEscapeKey } from "../../utils/hooks";
import { useTheme } from "../ThemeContext";

interface ShortcutGroup {
  title: string;
  shortcuts: { keys: string[]; description: string }[];
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: "Dieu huong",
    shortcuts: [
      { keys: ["?"], description: "Mo/dong bang phim tat" },
      { keys: ["Ctrl", "Shift", "P"], description: "Performance Monitor (dev)" },
      { keys: ["Esc"], description: "Dong menu/modal/dropdown" },
    ],
  },
  {
    title: "Bang du lieu (VirtualTable)",
    shortcuts: [
      { keys: [" ", " "], description: "Di chuyen giua cac dong" },
      { keys: ["Home"], description: "Nhay den dong dau tien" },
      { keys: ["End"], description: "Nhay den dong cuoi cung" },
      { keys: ["Enter"], description: "Mo chi tiet dong dang focus" },
      { keys: ["Space"], description: "Chon/bo chon checkbox dong" },
      { keys: ["Ctrl", "A"], description: "Chon tat ca cac dong" },
      { keys: ["Double-click"], description: "Chinh sua inline cell (neu editable)" },
      { keys: ["Esc"], description: "Huy chinh sua inline" },
    ],
  },
  {
    title: "Chinh sua inline",
    shortcuts: [
      { keys: ["Enter"], description: "Xac nhan thay doi" },
      { keys: ["Esc"], description: "Huy thay doi" },
      { keys: ["Tab"], description: "Xac nhan va chuyen den cell tiep theo" },
      { keys: ["Shift", "Tab"], description: "Quay lai cell truoc do" },
    ],
  },
  {
    title: "Tat tat",
    shortcuts: [
      { keys: ["Ctrl", "K"], description: "Mo Command Palette (tim kiem nhanh)" },
      { keys: ["Ctrl", "Shift", "D"], description: "Chuyen dark/light mode" },
      { keys: ["Ctrl", "Z"], description: "Hoan tac thay doi (Undo)" },
      { keys: ["Ctrl", "Shift", "Z"], description: "Lam lai thay doi (Redo)" },
    ],
  },
];

export function KeyboardShortcutsPanel() {
  const [open, setOpen] = useState(false);
  const { toggleTheme } = useTheme();

  const handleToggle = useCallback(() => setOpen((p) => !p), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Only trigger on "?" when no input/textarea is focused
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((e.target as HTMLElement).isContentEditable) return;

      if (e.key === "?") {
        e.preventDefault();
        handleToggle();
      }

      // Ctrl+Shift+D to toggle dark mode
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        toggleTheme();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [handleToggle, toggleTheme]);

  useEscapeKey(() => {
    if (open) setOpen(false);
  });

  return (
    <>
      {/* Trigger button  fixed bottom-right */}
      <button
        onClick={handleToggle}
        className="fixed bottom-6 right-6 z-40 w-10 h-10 bg-white dark:bg-card border border-gray-200 dark:border-border rounded-xl shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
        aria-label="Phim tat"
        title="Phim tat (?)"
      >
        <Keyboard className="w-4.5 h-4.5 text-muted-foreground group-hover:text-foreground transition-colors" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50"
              onClick={() => setOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 28, stiffness: 350 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-[580px] max-h-[85vh] bg-white dark:bg-card rounded-2xl shadow-2xl border border-gray-100 dark:border-border z-50 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-border shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Command className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-[15px] text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 700 }}>
                      Phim tat ban phim
                    </h2>
                    <p className="text-[15px] text-muted-foreground">Nhan <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-white/10 rounded text-[16px]" style={{ fontWeight: 600 }}>?</kbd> bat ky luc nao de mo</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                  aria-label="Dong"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Body */}
              <div className="overflow-y-auto p-6 space-y-6">
                {shortcutGroups.map((group) => (
                  <div key={group.title}>
                    <h3 className="text-[15px] text-muted-foreground mb-3 uppercase tracking-wider" style={{ fontWeight: 700 }}>
                      {group.title}
                    </h3>
                    <div className="space-y-1">
                      {group.shortcuts.map((shortcut) => (
                        <div
                          key={shortcut.description}
                          className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
                        >
                          <span className="text-[16px] text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 500 }}>
                            {shortcut.description}
                          </span>
                          <div className="flex items-center gap-1">
                            {shortcut.keys.map((key, i) => (
                              <span key={`${key}-${i}`}>
                                <kbd className="inline-flex items-center justify-center min-w-[28px] h-[26px] px-1.5 bg-gray-100 dark:bg-white/[0.08] border border-gray-200 dark:border-white/10 rounded-lg text-[15px] text-[#1a1a2e] dark:text-foreground shadow-[0_1px_0_1px_rgba(0,0,0,0.04)]" style={{ fontWeight: 600 }}>
                                  {key}
                                </kbd>
                                {i < shortcut.keys.length - 1 && (
                                  <span className="text-muted-foreground/40 text-[16px] mx-0.5">+</span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 dark:border-border px-6 py-3 shrink-0">
                <p className="text-[10.5px] text-muted-foreground/60 text-center">
                  Mac R tren macOS | Ctrl tren Windows/Linux
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

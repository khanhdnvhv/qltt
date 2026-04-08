import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Clock, CheckCircle, XCircle, TrendingUp, Trophy,
  Trash2, ChevronRight, BarChart3, Zap, Calendar,
} from "lucide-react";

export interface QuizResult {
  id: string;
  category: string;
  categoryIcon: string;
  score: number;
  correct: number;
  total: number;
  timeSpent: number; // seconds
  timerMode: "off" | "perQ" | "total";
  date: string; // ISO
}

const STORAGE_KEY = "ielts_quiz_history";

export function getQuizHistory(): QuizResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveQuizResult(result: QuizResult) {
  const history = getQuizHistory();
  history.unshift(result);
  // Keep max 50 results
  if (history.length > 50) history.pop();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function clearQuizHistory() {
  localStorage.removeItem(STORAGE_KEY);
}

interface Props {
  onClose?: () => void;
}

export function QuizHistory({ onClose }: Props) {
  const [history, setHistory] = useState<QuizResult[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setHistory(getQuizHistory());
  }, []);

  const handleClear = () => {
    clearQuizHistory();
    setHistory([]);
  };

  if (history.length === 0) {
    return (
      <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-8 text-center">
        <Trophy className="w-10 h-10 mx-auto text-muted-foreground/20 mb-3" />
        <p className="text-[16px] text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 600 }}>Chua co lich su quiz</p>
        <p className="text-[16px] text-muted-foreground mt-1">Bat dau lam quiz de xem ket qua o day!</p>
      </div>
    );
  }

  const avgScore = Math.round(history.reduce((s, h) => s + h.score, 0) / history.length);
  const bestScore = Math.max(...history.map((h) => h.score));
  const totalQuizzes = history.length;
  const totalCorrect = history.reduce((s, h) => s + h.correct, 0);
  const totalQuestions = history.reduce((s, h) => s + h.total, 0);
  const visible = expanded ? history : history.slice(0, 5);

  return (
    <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 dark:border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="text-[16px] text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 700 }}>Lich su lam quiz</h3>
          </div>
          {history.length > 0 && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1 text-[15px] text-red-500 hover:text-red-600 transition-colors"
              style={{ fontWeight: 500 }}
            >
              <Trash2 className="w-3 h-3" /> Xoa tat ca
            </button>
          )}
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: Trophy, label: "Tong quiz", value: totalQuizzes, color: "#f59e0b" },
            { icon: TrendingUp, label: "Diem TB", value: `${avgScore}%`, color: "#3b82f6" },
            { icon: Zap, label: "Cao nhat", value: `${bestScore}%`, color: "#10b981" },
            { icon: CheckCircle, label: "Dung", value: `${totalCorrect}/${totalQuestions}`, color: "#dc2f3c" },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-2.5 bg-[#f8f9fb] dark:bg-muted rounded-xl">
              <stat.icon className="w-4 h-4 mx-auto mb-1" style={{ color: stat.color }} />
              <p className="text-[16px] text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 800 }}>{stat.value}</p>
              <p className="text-[9px] text-muted-foreground" style={{ fontWeight: 500 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* History list */}
      <div className="p-4 space-y-2">
        <AnimatePresence mode="popLayout">
          {visible.map((result, i) => {
            const date = new Date(result.date);
            const dateStr = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}`;
            const timeStr = `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`;
            const scoreColor = result.score >= 80 ? "text-emerald-600" : result.score >= 60 ? "text-amber-600" : "text-red-600";
            const scoreBg = result.score >= 80 ? "bg-emerald-50 dark:bg-emerald-500/10" : result.score >= 60 ? "bg-amber-50 dark:bg-amber-500/10" : "bg-red-50 dark:bg-red-500/10";

            return (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ delay: i * 0.02 }}
                layout
                className="flex items-center gap-3 p-3 bg-[#f8f9fb] dark:bg-muted rounded-xl"
              >
                <span className="text-[20px] shrink-0">{result.categoryIcon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[16px] text-[#1a1a2e] dark:text-foreground truncate" style={{ fontWeight: 600 }}>{result.category}</p>
                  <div className="flex items-center gap-2 text-[16px] text-muted-foreground">
                    <span className="flex items-center gap-0.5"><Calendar className="w-2.5 h-2.5" />{dateStr} {timeStr}</span>
                    <span>·</span>
                    <span>{result.correct}/{result.total} dung</span>
                    <span>·</span>
                    <span>{Math.floor(result.timeSpent / 60)}:{(result.timeSpent % 60).toString().padStart(2, "0")}</span>
                  </div>
                </div>
                <span className={`text-[16px] px-2.5 py-1 rounded-lg ${scoreBg} ${scoreColor}`} style={{ fontWeight: 800 }}>
                  {result.score}%
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Show more */}
      {history.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-3 border-t border-gray-100 dark:border-border text-[16px] text-primary hover:bg-primary/[0.03] transition-colors flex items-center justify-center gap-1"
          style={{ fontWeight: 600 }}
        >
          {expanded ? "Thu gon" : `Xem them ${history.length - 5} ket qua`}
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-90" : ""}`} />
        </button>
      )}
    </div>
  );
}


import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  Zap, Star, Trophy, Target, CheckCircle, Gift,
  ChevronRight, Flame, BookOpen, Pen, Headphones,
  MessageSquare, Clock, ArrowRight,
} from "lucide-react";

//  XP / Level system 
const XP_KEY = "ielts_gamification";

interface GamificationState {
  xp: number;
  level: number;
  dailyChallenges: DailyChallenge[];
  lastChallengeDate: string;
  totalChallengesCompleted: number;
  badges: string[];
}

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  icon: string;
  type: "quiz" | "flashcard" | "writing" | "speaking" | "reading" | "streak";
  target: number;
  current: number;
  completed: boolean;
}

const LEVELS = [
  { level: 1, title: "Beginner", xpNeeded: 0, color: "#94a3b8" },
  { level: 2, title: "Learner", xpNeeded: 100, color: "#3b82f6" },
  { level: 3, title: "Explorer", xpNeeded: 300, color: "#8b5cf6" },
  { level: 4, title: "Achiever", xpNeeded: 600, color: "#10b981" },
  { level: 5, title: "Scholar", xpNeeded: 1000, color: "#f59e0b" },
  { level: 6, title: "Expert", xpNeeded: 1500, color: "#f26522" },
  { level: 7, title: "Master", xpNeeded: 2200, color: "#dc2f3c" },
  { level: 8, title: "Champion", xpNeeded: 3000, color: "#c026d3" },
  { level: 9, title: "Legend", xpNeeded: 4000, color: "#eab308" },
  { level: 10, title: "GDNN-GDTX", xpNeeded: 5500, color: "#c9a94e" },
];

const CHALLENGE_TEMPLATES: Omit<DailyChallenge, "id" | "current" | "completed">[] = [
  { title: "Lam 1 quiz", description: "Hoan thanh it nhat 1 bai quiz", xpReward: 25, icon: "a", type: "quiz", target: 1 },
  { title: "On 10 tu vung", description: "Xem qua 10 flashcard tu vung", xpReward: 20, icon: "xa", type: "flashcard", target: 10 },
  { title: "Viet 1 bai Writing", description: "Luyen viet it nhat 150 tu", xpReward: 40, icon: "S️", type: "writing", target: 1 },
  { title: "Luyen Speaking 5p", description: "Ghi am it nhat 5 phut noi", xpReward: 35, icon: "x}", type: "speaking", target: 5 },
  { title: "Doc 1 bai blog", description: "Doc va hoan thanh 1 bai viet", xpReward: 15, icon: "x", type: "reading", target: 1 },
  { title: "Duy tri streak", description: "Hoc it nhat 30 phut hom nay", xpReward: 30, icon: "x", type: "streak", target: 30 },
];

function getLevel(xp: number) {
  let current = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.xpNeeded) current = l;
    else break;
  }
  return current;
}

function getNextLevel(xp: number) {
  for (const l of LEVELS) {
    if (xp < l.xpNeeded) return l;
  }
  return null;
}

function generateDailyChallenges(): DailyChallenge[] {
  // Pick 3 random challenges
  const shuffled = [...CHALLENGE_TEMPLATES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map((t, i) => ({
    ...t,
    id: `dc_${Date.now()}_${i}`,
    current: Math.random() < 0.4 ? t.target : Math.floor(Math.random() * t.target), // Simulate some progress
    completed: false,
  }));
}

function loadState(): GamificationState {
  try {
    const saved = JSON.parse(localStorage.getItem(XP_KEY) || "null");
    if (saved) {
      const today = new Date().toISOString().slice(0, 10);
      if (saved.lastChallengeDate !== today) {
        // Reset daily challenges
        saved.dailyChallenges = generateDailyChallenges();
        saved.lastChallengeDate = today;
        localStorage.setItem(XP_KEY, JSON.stringify(saved));
      }
      return saved;
    }
  } catch {}
  const state: GamificationState = {
    xp: 847,
    level: 5,
    dailyChallenges: generateDailyChallenges(),
    lastChallengeDate: new Date().toISOString().slice(0, 10),
    totalChallengesCompleted: 23,
    badges: ["first_quiz", "7day_streak", "writing_warrior"],
  };
  localStorage.setItem(XP_KEY, JSON.stringify(state));
  return state;
}

export function GamificationWidget() {
  const [state, setState] = useState<GamificationState>(loadState);
  const [showAll, setShowAll] = useState(false);

  const currentLevel = getLevel(state.xp);
  const nextLevel = getNextLevel(state.xp);
  const xpToNext = nextLevel ? nextLevel.xpNeeded - state.xp : 0;
  const levelProgress = nextLevel
    ? ((state.xp - currentLevel.xpNeeded) / (nextLevel.xpNeeded - currentLevel.xpNeeded)) * 100
    : 100;

  const completeChallenge = (challengeId: string) => {
    setState((prev) => {
      const newState = { ...prev };
      const challenge = newState.dailyChallenges.find((c) => c.id === challengeId);
      if (!challenge || challenge.completed) return prev;
      challenge.current = challenge.target;
      challenge.completed = true;
      newState.xp += challenge.xpReward;
      newState.totalChallengesCompleted += 1;
      newState.level = getLevel(newState.xp).level;
      localStorage.setItem(XP_KEY, JSON.stringify(newState));
      toast.success(`+${challenge.xpReward} XP! ${challenge.title}`, { duration: 3000 });

      // Check level up
      const oldLevel = getLevel(prev.xp);
      const newLevel = getLevel(newState.xp);
      if (newLevel.level > oldLevel.level) {
        setTimeout(() => {
          toast.success(`x}0 Len level ${newLevel.level}  ${newLevel.title}!`, { duration: 5000 });
        }, 500);
      }
      return newState;
    });
  };

  const completedCount = state.dailyChallenges.filter((c) => c.completed).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.22 }}
      className="bg-white dark:bg-card rounded-2xl border border-gray-100/80 dark:border-border overflow-hidden"
    >
      {/* XP Header */}
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: currentLevel.color + "15" }}>
              <Zap className="w-4 h-4" style={{ color: currentLevel.color }} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[15px] text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 700 }}>
                  Level {currentLevel.level}
                </span>
                <span className="text-[16px] px-1.5 py-0.5 rounded-md" style={{ fontWeight: 600, backgroundColor: currentLevel.color + "15", color: currentLevel.color }}>
                  {currentLevel.title}
                </span>
              </div>
              <p className="text-[16px] text-muted-foreground">{state.xp} XP tong</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[16px] text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 800 }}>{state.xp}</p>
            <p className="text-[9px] text-muted-foreground">XP</p>
          </div>
        </div>

        {/* XP Progress */}
        {nextLevel && (
          <div>
            <div className="flex items-center justify-between text-[9px] text-muted-foreground mb-1">
              <span>Lv.{currentLevel.level}</span>
              <span>{xpToNext} XP den Lv.{nextLevel.level}</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${levelProgress}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="h-full rounded-full"
                style={{ backgroundColor: currentLevel.color }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Daily Challenges */}
      <div className="px-5 pb-5">
        <div className="flex items-center justify-between mb-3 mt-2">
          <div className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-primary" />
            <span className="text-[16px] text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 700 }}>Nhiem vu hom nay</span>
          </div>
          <span className="text-[16px] px-2 py-0.5 rounded-full bg-primary/10 text-primary" style={{ fontWeight: 600 }}>
            {completedCount}/3
          </span>
        </div>

        <div className="space-y-2">
          {state.dailyChallenges.map((challenge) => (
            <div
              key={challenge.id}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                challenge.completed
                  ? "bg-emerald-50/50 dark:bg-emerald-500/5"
                  : "bg-[#f8f9fb] dark:bg-muted hover:bg-[#f0f2f5] dark:hover:bg-white/10"
              }`}
            >
              <span className="text-[18px]">{challenge.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className={`text-[11.5px] truncate ${challenge.completed ? "text-emerald-700 dark:text-emerald-400 line-through" : "text-[#1a1a2e] dark:text-foreground"}`} style={{ fontWeight: 600 }}>
                    {challenge.title}
                  </p>
                  <span className="text-[9px] text-amber-600 dark:text-amber-400 shrink-0" style={{ fontWeight: 700 }}>+{challenge.xpReward}XP</span>
                </div>
                {/* Progress */}
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-gray-200/60 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${challenge.completed ? "bg-emerald-500" : "bg-primary"}`}
                      style={{ width: `${Math.min(100, (challenge.current / challenge.target) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[8px] text-muted-foreground shrink-0">
                    {challenge.current}/{challenge.target}
                  </span>
                </div>
              </div>
              {!challenge.completed && challenge.current >= challenge.target ? (
                <button
                  onClick={() => completeChallenge(challenge.id)}
                  className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors shrink-0"
                >
                  <Gift className="w-3.5 h-3.5" />
                </button>
              ) : challenge.completed ? (
                <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* All challenges completed bonus */}
        {completedCount === 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-3 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border border-amber-200/50 dark:border-amber-800/30 text-center"
          >
            <p className="text-[15px] text-amber-700 dark:text-amber-400" style={{ fontWeight: 700 }}>
              x}0 Hoan thanh tat ca nhiem vu hom nay! +50 XP bonus
            </p>
          </motion.div>
        )}

        {/* Stats row */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-border text-[16px] text-muted-foreground">
          <span>Tong nhiem vu: <span className="text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 700 }}>{state.totalChallengesCompleted}</span></span>
          <span>Badges: <span className="text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 700 }}>{state.badges.length}</span></span>
        </div>
      </div>
    </motion.div>
  );
}


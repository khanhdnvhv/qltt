import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar, Target, Clock, CheckCircle, ChevronRight,
  Headphones, Eye, Pen, MessageSquare, BookOpen,
  Zap, TrendingUp, Star, Lock,
} from "lucide-react";

interface SkillScore {
  skill: string;
  score: number;
  target: number;
  color: string;
  icon: React.ElementType;
}

interface Props {
  skillScores: SkillScore[];
  targetBand: number;
  examDate?: string;
}

interface PlanWeek {
  week: number;
  focus: string;
  skill: string;
  tasks: { title: string; duration: string; done: boolean; type: "lesson" | "practice" | "mock" | "review" }[];
  milestones: string[];
}

const typeIcons = {
  lesson: BookOpen,
  practice: Target,
  mock: Star,
  review: Eye,
};

const typeColors = {
  lesson: "text-blue-600 bg-blue-50 dark:bg-blue-500/10",
  practice: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10",
  mock: "text-primary bg-primary/[0.06] dark:bg-primary/10",
  review: "text-amber-600 bg-amber-50 dark:bg-amber-500/10",
};

function generatePlan(skills: SkillScore[], targetBand: number): PlanWeek[] {
  const sorted = [...skills].sort((a, b) => (b.target - b.score) - (a.target - a.score));
  const weakest = sorted[0];
  const second = sorted[1];

  const skillIc: Record<string, string> = { Listening: "Listening", Reading: "Reading", Writing: "Writing", Speaking: "Speaking" };

  return [
    {
      week: 1, focus: `Tang cuong ${weakest.skill} co ban`, skill: weakest.skill,
      tasks: [
        { title: `${weakest.skill}  Ky thuat co ban`, duration: "45p", done: true, type: "lesson" },
        { title: `Luyen tap ${weakest.skill} co ban`, duration: "30p", done: true, type: "practice" },
        { title: `Tu vung theo chu de ${weakest.skill}`, duration: "20p", done: true, type: "lesson" },
        { title: `Mini quiz ${weakest.skill}`, duration: "15p", done: false, type: "practice" },
      ],
      milestones: [`Nham muc nang ${weakest.skill} len ${(weakest.score + 0.5).toFixed(1)}`],
    },
    {
      week: 2, focus: `${second.skill} + ${weakest.skill} song song`, skill: second.skill,
      tasks: [
        { title: `${second.skill}  Chien luoc nang cao`, duration: "45p", done: false, type: "lesson" },
        { title: `${weakest.skill}  Luyen de nang cao`, duration: "40p", done: false, type: "practice" },
        { title: `Phan tich bai mau ${second.skill}`, duration: "30p", done: false, type: "review" },
        { title: `Flashcards tu vung academic`, duration: "15p", done: false, type: "lesson" },
      ],
      milestones: [`Dat diem ${second.skill} >= ${(second.score + 0.5).toFixed(1)} trong quiz`],
    },
    {
      week: 3, focus: "Ren ky nang tong hop", skill: "All",
      tasks: [
        { title: "Full mock test  4 ky nang", duration: "2h45p", done: false, type: "mock" },
        { title: "Phan tich ket qua mock test", duration: "30p", done: false, type: "review" },
        { title: `${weakest.skill}  Bai tap bo sung`, duration: "40p", done: false, type: "practice" },
        { title: "Grammar & Vocabulary review", duration: "25p", done: false, type: "review" },
      ],
      milestones: [`Mock test band >= ${(targetBand - 0.5).toFixed(1)}`],
    },
    {
      week: 4, focus: "Sprint cuoi  Tap trung diem yeu", skill: weakest.skill,
      tasks: [
        { title: `${weakest.skill}  De thi that (Cambridge)`, duration: "45p", done: false, type: "mock" },
        { title: `${second.skill}  De thi that (Cambridge)`, duration: "45p", done: false, type: "mock" },
        { title: "Review toan bo loi thuong gap", duration: "30p", done: false, type: "review" },
        { title: "Full mock test cuoi ky", duration: "2h45p", done: false, type: "mock" },
      ],
      milestones: [`Dat muc tieu band ${targetBand.toFixed(1)} trong mock test cuoi`],
    },
  ];
}

export function StudyPlan({ skillScores, targetBand, examDate }: Props) {
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);
  const plan = generatePlan(skillScores, targetBand);

  const totalTasks = plan.reduce((s, w) => s + w.tasks.length, 0);
  const doneTasks = plan.reduce((s, w) => s + w.tasks.filter((t) => t.done).length, 0);
  const progress = Math.round((doneTasks / totalTasks) * 100);

  const currentWeek = plan.findIndex((w) => w.tasks.some((t) => !t.done)) + 1 || plan.length;

  const skillIcons: Record<string, React.ElementType> = {
    Listening: Headphones, Reading: Eye, Writing: Pen, Speaking: MessageSquare, All: BookOpen,
  };
  const skillColors: Record<string, string> = {
    Listening: "#3b82f6", Reading: "#10b981", Writing: "#dc2f3c", Speaking: "#f26522", All: "#8b5cf6",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white dark:bg-card rounded-2xl border border-gray-100/80 dark:border-border p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-[17px] text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 700 }}>Lo trinh hoc 4 tuan</h2>
            <p className="text-[10.5px] text-muted-foreground">Ca nhan hoa theo band {targetBand.toFixed(1)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[18px] text-primary" style={{ fontWeight: 800 }}>{progress}%</p>
          <p className="text-[9px] text-muted-foreground">{doneTasks}/{totalTasks} nhiem vu</p>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden mb-5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
        />
      </div>

      {/* Exam date */}
      {examDate && (
        <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-xl px-4 py-2.5 border border-indigo-100/50 dark:border-indigo-500/20 mb-5">
          <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="text-[16px] text-muted-foreground">
            Ngay thi: <span className="text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 700 }}>{examDate}</span>
          </span>
        </div>
      )}

      {/* Weeks */}
      <div className="space-y-2.5">
        {plan.map((week, wi) => {
          const isExpanded = expandedWeek === week.week;
          const weekDone = week.tasks.filter((t) => t.done).length;
          const weekTotal = week.tasks.length;
          const isActive = week.week === currentWeek;
          const isLocked = week.week > currentWeek + 1;
          const SIc = skillIcons[week.skill] || BookOpen;
          const sColor = skillColors[week.skill] || "#6b7280";

          return (
            <div key={week.week} className={`rounded-xl border transition-all ${
              isActive ? "border-primary/20 bg-primary/[0.02] dark:bg-primary/[0.03]" : "border-gray-100 dark:border-border"
            } ${isLocked ? "opacity-60" : ""}`}>
              <button
                onClick={() => !isLocked && setExpandedWeek(isExpanded ? null : week.week)}
                className="w-full flex items-center gap-3 p-3.5 text-left"
              >
                {/* Week number circle */}
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  weekDone === weekTotal
                    ? "bg-emerald-500 text-white"
                    : isActive
                      ? "bg-primary text-white"
                      : "bg-[#f4f5f7] dark:bg-white/5 text-muted-foreground"
                }`}>
                  {weekDone === weekTotal ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : isLocked ? (
                    <Lock className="w-3.5 h-3.5" />
                  ) : (
                    <span className="text-[16px]" style={{ fontWeight: 700 }}>T{week.week}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] text-[#1a1a2e] dark:text-foreground truncate" style={{ fontWeight: 700 }}>
                      Tuan {week.week}: {week.focus}
                    </span>
                    {isActive && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-primary/10 text-primary shrink-0" style={{ fontWeight: 700 }}>Hien tai</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <SIc className="w-3 h-3" style={{ color: sColor }} />
                    <span className="text-[16px] text-muted-foreground">{weekDone}/{weekTotal} nhiem vu</span>
                    <div className="flex-1 h-1 bg-gray-100 dark:bg-white/10 rounded-full max-w-[60px]">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(weekDone / weekTotal) * 100}%` }} />
                    </div>
                  </div>
                </div>

                <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ${isExpanded ? "rotate-90" : ""}`} />
              </button>

              <AnimatePresence>
                {isExpanded && !isLocked && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3.5 pb-3.5 space-y-2">
                      {week.tasks.map((task, ti) => {
                        const TIc = typeIcons[task.type];
                        return (
                          <motion.div
                            key={ti}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: ti * 0.04 }}
                            className={`flex items-center gap-2.5 p-2.5 rounded-lg ${
                              task.done ? "bg-emerald-50/50 dark:bg-emerald-500/5" : "bg-[#f8f9fb] dark:bg-muted"
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              task.done ? "bg-emerald-500 border-emerald-500" : "border-gray-300 dark:border-gray-600"
                            }`}>
                              {task.done && <span className="text-[7px] text-white">S</span>}
                            </div>
                            <span className={`flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded ${typeColors[task.type]}`} style={{ fontWeight: 600 }}>
                              <TIc className="w-2.5 h-2.5" />
                            </span>
                            <span className={`text-[16px] flex-1 ${task.done ? "text-muted-foreground line-through" : "text-[#1a1a2e] dark:text-foreground"}`} style={{ fontWeight: task.done ? 400 : 500 }}>
                              {task.title}
                            </span>
                            <span className="text-[16px] text-muted-foreground shrink-0 flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" />{task.duration}
                            </span>
                          </motion.div>
                        );
                      })}

                      {/* Milestones */}
                      {week.milestones.map((ms, mi) => (
                        <div key={mi} className="flex items-center gap-2 pl-2 text-[10.5px] text-indigo-600 dark:text-indigo-400" style={{ fontWeight: 600 }}>
                          <TrendingUp className="w-3 h-3" />
                          <span>Muc tieu: {ms}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}


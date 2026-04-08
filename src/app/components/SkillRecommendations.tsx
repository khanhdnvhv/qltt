import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Headphones, Eye, Pen, MessageSquare, BookOpen, Play, Star,
  ChevronRight, Sparkles, Target, Clock, Zap, ArrowRight,
  CheckCircle, TrendingUp, Lightbulb,
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
}

interface Recommendation {
  id: string;
  skill: string;
  title: string;
  description: string;
  type: "lesson" | "practice" | "mock" | "tip";
  duration: string;
  difficulty: "Co ban" | "Trung binh" | "Nang cao";
  priority: "high" | "medium" | "low";
  matchPct: number;
}

const typeConfig = {
  lesson: { label: "Bai hoc", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10", icon: BookOpen },
  practice: { label: "Luyen tap", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10", icon: Target },
  mock: { label: "Thi thu", color: "text-primary", bg: "bg-primary/[0.06] dark:bg-primary/10", icon: Sparkles },
  tip: { label: "Meo hay", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-500/10", icon: Lightbulb },
};

const priorityConfig = {
  high: { label: "Uu tien cao", color: "text-red-600 bg-red-50 dark:bg-red-500/10" },
  medium: { label: "Trung binh", color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10" },
  low: { label: "Tham khao", color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10" },
};

function generateRecommendations(skills: SkillScore[]): Recommendation[] {
  const recs: Recommendation[] = [];
  let id = 0;

  const sorted = [...skills].sort((a, b) => (a.target - a.score) - (b.target - b.score)).reverse();

  sorted.forEach((skill) => {
    const gap = skill.target - skill.score;
    const priority = gap >= 1.5 ? "high" : gap >= 1.0 ? "medium" : "low";

    if (skill.skill === "Writing") {
      recs.push(
        { id: `r${++id}`, skill: "Writing", title: "Writing Task 2: Opinion Essay", description: "Luyen viet bai luan 250 tu voi cau truc 4 doan, tap trung vao coherence va cohesion", type: "practice", duration: "45 phut", difficulty: "Trung binh", priority, matchPct: 95 },
        { id: `r${++id}`, skill: "Writing", title: "Phan tich Band 7+ Writing Samples", description: "Hoc tu 5 bai mau dat band 7+  nhan dien cau truc, tu vung va linking words", type: "lesson", duration: "30 phut", difficulty: "Trung binh", priority, matchPct: 88 },
        { id: `r${++id}`, skill: "Writing", title: "10 collocations giup tang Writing score", description: "Academic collocations thuong gap trong Task 2, vi du thuc te va cach ap dung", type: "tip", duration: "15 phut", difficulty: "Co ban", priority: "low", matchPct: 75 },
      );
    }
    if (skill.skill === "Speaking") {
      recs.push(
        { id: `r${++id}`, skill: "Speaking", title: "Speaking Part 2: 2-Minute Monologue", description: "Luyen noi 2 phut lien tuc ve chu de quen thuoc voi ghi am va tu danh gia", type: "practice", duration: "30 phut", difficulty: "Trung binh", priority, matchPct: 92 },
        { id: `r${++id}`, skill: "Speaking", title: "Mock Speaking Test  Part 1-2-3", description: "Thi thu Speaking day du 3 phan voi cham diem tu dong AI va feedback chi tiet", type: "mock", duration: "15 phut", difficulty: "Nang cao", priority, matchPct: 90 },
        { id: `r${++id}`, skill: "Speaking", title: "Fillers & Hesitation Devices", description: "Cach su dung 'Well...', 'That's an interesting question...' tu nhien", type: "tip", duration: "10 phut", difficulty: "Co ban", priority: "low", matchPct: 70 },
      );
    }
    if (skill.skill === "Listening") {
      recs.push(
        { id: `r${++id}`, skill: "Listening", title: "Listening Section 3: Discussion", description: "Luyen nghe hoi thoai hoc thuat voi note-taking strategy va prediction technique", type: "practice", duration: "25 phut", difficulty: "Trung binh", priority, matchPct: 85 },
        { id: `r${++id}`, skill: "Listening", title: "Dictation Practice  Academic Vocabulary", description: "Nghe va viet lai 10 cau hoi thoai hoc thuat, ren kha nang bat tu chinh xac", type: "lesson", duration: "20 phut", difficulty: "Co ban", priority: gap >= 1 ? "medium" : "low", matchPct: 78 },
      );
    }
    if (skill.skill === "Reading") {
      recs.push(
        { id: `r${++id}`, skill: "Reading", title: "Skimming & Scanning drills", description: "Luyen ky thuat doc nhanh voi 5 bai passage, muc tieu < 20 phut/passage", type: "practice", duration: "40 phut", difficulty: "Trung binh", priority, matchPct: 82 },
        { id: `r${++id}`, skill: "Reading", title: "True/False/Not Given  Advanced", description: "30 cau hoi T/F/NG tu cac bai thi that, phan tich chi tiet dap an va bay", type: "lesson", duration: "35 phut", difficulty: "Nang cao", priority: gap >= 0.5 ? "medium" : "low", matchPct: 80 },
      );
    }
  });

  return recs.sort((a, b) => b.matchPct - a.matchPct);
}

export function SkillRecommendations({ skillScores }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [filterSkill, setFilterSkill] = useState<string>("all");

  const recommendations = generateRecommendations(skillScores);
  const filtered = filterSkill === "all" ? recommendations : recommendations.filter((r) => r.skill === filterSkill);
  const visible = expanded ? filtered : filtered.slice(0, 4);

  const weakest = [...skillScores].sort((a, b) => (a.target - a.score) - (b.target - b.score)).reverse()[0];

  const skillIcons: Record<string, React.ElementType> = {
    Listening: Headphones, Reading: Eye, Writing: Pen, Speaking: MessageSquare,
  };
  const skillColors: Record<string, string> = {
    Listening: "#3b82f6", Reading: "#10b981", Writing: "#dc2f3c", Speaking: "#f26522",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="bg-white dark:bg-card rounded-2xl border border-gray-100/80 dark:border-border p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-[17px] text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 700 }}>De xuat luyen tap</h2>
            <p className="text-[10.5px] text-muted-foreground">Dua tren diem so va muc tieu cua ban</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[15px] text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg" style={{ fontWeight: 600 }}>
          <Zap className="w-3 h-3" />
          {recommendations.length} goi y
        </div>
      </div>

      {/* Focus area callout */}
      <div className="bg-gradient-to-r from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10 rounded-xl p-3.5 border border-primary/10 mb-4">
        <div className="flex items-center gap-2 text-[16px]">
          <Target className="w-4 h-4 text-primary shrink-0" />
          <span className="text-muted-foreground">
            Can tap trung: <span className="text-primary" style={{ fontWeight: 700 }}>{weakest?.skill}</span> (cach muc tieu{" "}
            <span className="text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 700 }}>{(weakest?.target - weakest?.score).toFixed(1)}</span> band)
          </span>
        </div>
      </div>

      {/* Skill filter tabs */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <button
          onClick={() => setFilterSkill("all")}
          className={`text-[15px] px-3 py-1.5 rounded-lg transition-colors ${filterSkill === "all" ? "bg-[#1a1a2e] dark:bg-white/15 text-white" : "bg-[#f4f5f7] dark:bg-white/5 text-muted-foreground hover:text-foreground"}`}
          style={{ fontWeight: 600 }}
        >
          Tat ca
        </button>
        {skillScores.map((s) => {
          const Ic = skillIcons[s.skill] || BookOpen;
          return (
            <button
              key={s.skill}
              onClick={() => setFilterSkill(s.skill)}
              className={`flex items-center gap-1 text-[15px] px-3 py-1.5 rounded-lg transition-colors ${filterSkill === s.skill ? "bg-[#1a1a2e] dark:bg-white/15 text-white" : "bg-[#f4f5f7] dark:bg-white/5 text-muted-foreground hover:text-foreground"}`}
              style={{ fontWeight: 600 }}
            >
              <Ic className="w-3 h-3" />
              {s.skill}
            </button>
          );
        })}
      </div>

      {/* Recommendations list */}
      <div className="space-y-2.5">
        <AnimatePresence mode="popLayout">
          {visible.map((rec, i) => {
            const tCfg = typeConfig[rec.type];
            const Ic = tCfg.icon;
            const sColor = skillColors[rec.skill] || "#6b7280";
            const SIc = skillIcons[rec.skill] || BookOpen;
            return (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: i * 0.03 }}
                layout
                className="flex items-start gap-3 p-3.5 bg-[#f8f9fb] dark:bg-muted rounded-xl hover:bg-[#f0f2f5] dark:hover:bg-white/[0.04] transition-colors group cursor-pointer"
              >
                {/* Skill icon */}
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: sColor + "12" }}>
                  <SIc className="w-4 h-4" style={{ color: sColor }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-[15px] text-[#1a1a2e] dark:text-foreground truncate" style={{ fontWeight: 700 }}>{rec.title}</h4>
                    <span className={`text-[8.5px] px-1.5 py-0.5 rounded ${priorityConfig[rec.priority].color}`} style={{ fontWeight: 600 }}>
                      {rec.priority === "high" ? "!" : ""} {priorityConfig[rec.priority].label}
                    </span>
                  </div>
                  <p className="text-[15px] text-muted-foreground leading-relaxed line-clamp-2 mb-2">{rec.description}</p>
                  <div className="flex items-center gap-3 text-[16px] text-muted-foreground">
                    <span className={`flex items-center gap-0.5 ${tCfg.color}`} style={{ fontWeight: 600 }}>
                      <Ic className="w-2.5 h-2.5" />
                      {tCfg.label}
                    </span>
                    <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{rec.duration}</span>
                    <span>{rec.difficulty}</span>
                    <span className="flex items-center gap-0.5 text-emerald-600" style={{ fontWeight: 600 }}>
                      <TrendingUp className="w-2.5 h-2.5" />{rec.matchPct}% phu hop
                    </span>
                  </div>
                </div>

                {/* Action */}
                <button className="shrink-0 w-8 h-8 rounded-lg bg-white dark:bg-card shadow-sm flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/5 transition-colors mt-1">
                  <Play className="w-3.5 h-3.5 ml-0.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Show more/less */}
      {filtered.length > 4 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-center gap-1 w-full mt-3 py-2.5 text-[16px] text-primary hover:bg-primary/5 rounded-xl transition-colors"
          style={{ fontWeight: 600 }}
        >
          {expanded ? "Thu gon" : `Xem them ${filtered.length - 4} goi y`}
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-90" : ""}`} />
        </button>
      )}
    </motion.div>
  );
}


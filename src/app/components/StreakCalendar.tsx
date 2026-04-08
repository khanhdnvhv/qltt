import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Flame, TrendingUp } from "lucide-react";

// Generate mock study data for the past 12 weeks
function generateStudyData(): Map<string, number> {
  const data = new Map<string, number>();
  const now = new Date();
  for (let i = 83; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    // More recent days have higher chance of activity
    const recentBoost = Math.max(0, 1 - i / 84);
    const rand = Math.random();
    if (rand < 0.15 + recentBoost * 0.3) {
      data.set(key, Math.floor(Math.random() * 3) + 1); // 1-3 hours
    } else if (rand < 0.4 + recentBoost * 0.2) {
      data.set(key, Math.random() < 0.5 ? 0.5 : 1);
    }
    // else: 0 (no study)
  }
  // Ensure last 7 days have a streak
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (!data.has(key) || data.get(key)! === 0) {
      data.set(key, Math.floor(Math.random() * 2) + 1);
    }
  }
  return data;
}

function getIntensityClass(hours: number): string {
  if (hours === 0) return "bg-gray-100 dark:bg-white/5";
  if (hours <= 0.5) return "bg-primary/20";
  if (hours <= 1) return "bg-primary/40";
  if (hours <= 2) return "bg-primary/70";
  return "bg-primary";
}

const dayLabels = ["", "T2", "", "T4", "", "T6", ""];

export function StreakCalendar() {
  const studyData = useMemo(generateStudyData, []);
  const [hoveredDay, setHoveredDay] = useState<{ date: string; hours: number; x: number; y: number } | null>(null);

  // Build 12 weeks grid (7 rows x 12 cols)
  const weeks = useMemo(() => {
    const result: { date: string; hours: number }[][] = [];
    const now = new Date();
    // Find the start: go back 83 days, then to the previous Monday
    const start = new Date(now);
    start.setDate(start.getDate() - 83);
    // Adjust to Monday
    const dayOfWeek = start.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    start.setDate(start.getDate() + mondayOffset);

    let currentDate = new Date(start);
    let currentWeek: { date: string; hours: number }[] = [];

    while (currentDate <= now) {
      const key = currentDate.toISOString().slice(0, 10);
      currentWeek.push({ date: key, hours: studyData.get(key) || 0 });
      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    if (currentWeek.length > 0) result.push(currentWeek);
    return result;
  }, [studyData]);

  // Stats
  const totalDays = Array.from(studyData.values()).filter((v) => v > 0).length;
  const totalHours = Array.from(studyData.values()).reduce((s, v) => s + v, 0);

  // Current streak
  let currentStreak = 0;
  const now = new Date();
  for (let i = 0; i < 84; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if ((studyData.get(key) || 0) > 0) currentStreak++;
    else break;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white dark:bg-card rounded-2xl border border-gray-100/80 dark:border-border p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" />
          <h3 className="text-[16px] text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 700 }}>Lich su hoc tap</h3>
        </div>
        <div className="flex items-center gap-1 text-[16px] text-emerald-600" style={{ fontWeight: 600 }}>
          <TrendingUp className="w-3 h-3" />
          {currentStreak} ngay streak
        </div>
      </div>

      {/* Heatmap */}
      <div className="relative">
        <div className="flex gap-[3px]">
          {/* Day labels */}
          <div className="flex flex-col gap-[3px] mr-1">
            {dayLabels.map((label, i) => (
              <div key={i} className="h-[12px] flex items-center">
                <span className="text-[7px] text-muted-foreground" style={{ fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Weeks */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) => (
                <div
                  key={day.date}
                  className={`w-[12px] h-[12px] rounded-[2px] transition-all cursor-pointer hover:ring-1 hover:ring-primary/50 ${getIntensityClass(day.hours)}`}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredDay({ date: day.date, hours: day.hours, x: rect.left, y: rect.top });
                  }}
                  onMouseLeave={() => setHoveredDay(null)}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Tooltip */}
        {hoveredDay && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1a1a2e] text-white text-[9px] px-2 py-1 rounded-md whitespace-nowrap z-10 pointer-events-none" style={{ fontWeight: 500 }}>
            {hoveredDay.hours > 0 ? `${hoveredDay.hours}h hoc` : "Khong hoc"}  {new Date(hoveredDay.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
          <span>{totalDays} ngay hoc</span>
          <span>{totalHours.toFixed(0)}h tong</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[8px] text-muted-foreground">It</span>
          {[0, 0.5, 1, 2, 3].map((v) => (
            <div key={v} className={`w-[10px] h-[10px] rounded-[2px] ${getIntensityClass(v)}`} />
          ))}
          <span className="text-[8px] text-muted-foreground">Nhieu</span>
        </div>
      </div>
    </motion.div>
  );
}


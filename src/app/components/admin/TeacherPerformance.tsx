import { motion } from "motion/react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, Legend,
} from "recharts";
import { Star, Users, TrendingUp, Award, Target, Zap } from "lucide-react";

interface Teacher {
  id: string;
  name: string;
  avatar: string;
  levelScore: number;
  students: number;
  rating: number;
  reviewCount: number;
  classes: number;
  specializations: string[];
  status: string;
}

interface Props {
  teachers: Teacher[];
}

const avatarColors = [
  "from-primary/80 to-accent/80",
  "from-blue-500 to-indigo-500",
  "from-emerald-500 to-teal-500",
  "from-purple-500 to-pink-500",
  "from-amber-500 to-orange-500",
  "from-cyan-500 to-blue-500",
  "from-rose-500 to-pink-500",
  "from-violet-500 to-purple-500",
];

export function TeacherPerformance({ teachers }: Props) {
  const activeTeachers = teachers.filter((t) => t.status === "active");

  // Data for comparison bar chart
  const comparisonData = activeTeachers.map((t) => ({
    name: t.name.split(" ").pop(),
    fullName: t.name,
    students: t.students,
    rating: t.rating,
    classes: t.classes,
    level: t.levelScore,
  }));

  // Data for radar chart  normalized metrics (0-100)
  const maxStudents = Math.max(...activeTeachers.map((t) => t.students));
  const maxReviews = Math.max(...activeTeachers.map((t) => t.reviewCount));
  const maxClasses = Math.max(...activeTeachers.map((t) => t.classes));

  const radarData = [
    { metric: "Hoc vien", ...Object.fromEntries(activeTeachers.map((t) => [t.id, Math.round((t.students / maxStudents) * 100)])) },
    { metric: "Danh gia", ...Object.fromEntries(activeTeachers.map((t) => [t.id, Math.round((t.rating / 5) * 100)])) },
    { metric: "Luot review", ...Object.fromEntries(activeTeachers.map((t) => [t.id, Math.round((t.reviewCount / maxReviews) * 100)])) },
    { metric: "So lop", ...Object.fromEntries(activeTeachers.map((t) => [t.id, Math.round((t.classes / maxClasses) * 100)])) },
    { metric: "Level Score", ...Object.fromEntries(activeTeachers.map((t) => [t.id, Math.round((t.levelScore / 10) * 100)])) },
  ];

  // Monthly trend data (mock)
  const trendData = [
    { month: "T10", t1: 120, t2: 95, t3: 170, t6: 140 },
    { month: "T11", t1: 128, t2: 100, t3: 175, t6: 148 },
    { month: "T12", t1: 132, t2: 108, t3: 180, t6: 155 },
    { month: "T1", t1: 135, t2: 112, t3: 188, t6: 158 },
    { month: "T2", t1: 140, t2: 115, t3: 195, t6: 162 },
    { month: "T3", t1: 142, t2: 118, t3: 198, t6: 165 },
  ];

  const trendColors = ["#dc2f3c", "#3b82f6", "#10b981", "#f59e0b"];
  const trendTeachers = activeTeachers.slice(0, 4);

  // Ranking
  const ranked = [...activeTeachers].sort((a, b) => {
    const scoreA = a.rating * 20 + (a.students / maxStudents) * 30 + (a.reviewCount / maxReviews) * 20 + (a.levelScore / 10) * 30;
    const scoreB = b.rating * 20 + (b.students / maxStudents) * 30 + (b.reviewCount / maxReviews) * 20 + (b.levelScore / 10) * 30;
    return scoreB - scoreA;
  });

  return (
    <div className="space-y-5">
      {/* Top performers */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <Award className="w-5 h-5 text-primary" />
          <h2 className="text-[16px] text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 700 }}>Xep hang giang vien</h2>
        </div>
        <div className="space-y-3">
          {ranked.map((t, i) => {
            const perfScore = Math.round(
              t.rating * 20 + (t.students / maxStudents) * 30 + (t.reviewCount / maxReviews) * 20 + (t.levelScore / 10) * 30
            );
            const medalColors = ["text-amber-500", "text-gray-400", "text-amber-700"];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 p-3 bg-[#f8f9fb] dark:bg-muted rounded-xl"
              >
                <div className="w-8 text-center shrink-0">
                  {i < 3 ? (
                    <span className={`text-[18px] ${medalColors[i]}`}>
                      {i === 0 ? "x!" : i === 1 ? "x" : "x0"}
                    </span>
                  ) : (
                    <span className="text-[15px] text-muted-foreground" style={{ fontWeight: 700 }}>#{i + 1}</span>
                  )}
                </div>
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${avatarColors[activeTeachers.indexOf(t) % avatarColors.length]} flex items-center justify-center text-white text-[15px] shrink-0`} style={{ fontWeight: 700 }}>
                  {t.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] text-[#1a1a2e] dark:text-foreground truncate" style={{ fontWeight: 600 }}>{t.name}</p>
                  <div className="flex items-center gap-2 text-[16px] text-muted-foreground">
                    <span className="flex items-center gap-0.5"><Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />{t.rating}</span>
                    <span>·</span>
                    <span>{t.students} HV</span>
                    <span>·</span>
                    <span>Bậc {t.levelScore}/10</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[15px] text-primary" style={{ fontWeight: 800 }}>{perfScore}</p>
                  <p className="text-[9px] text-muted-foreground">diem</p>
                </div>
                <div className="w-20 shrink-0 hidden sm:block">
                  <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${perfScore}%` }}
                      transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Students per teacher bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-blue-500" />
            <h3 className="text-[16px] text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 700 }}>So sanh hoc vien & lop hoc</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={comparisonData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid #e5e7eb" }}
                labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
              />
              <Bar dataKey="students" name="Hoc vien" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={16} />
              <Bar dataKey="classes" name="Lop hoc" fill="#10b981" radius={[4, 4, 0, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Radar comparison (top 3) */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-emerald-500" />
            <h3 className="text-[16px] text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 700 }}>So sanh da chieu (Top 3)</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fontWeight: 500 }} stroke="#9ca3af" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 8 }} stroke="#9ca3af" />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 11, border: "1px solid #e5e7eb" }} />
              {ranked.slice(0, 3).map((t, i) => (
                <Radar
                  key={t.id}
                  name={t.name.split(" ").pop()}
                  dataKey={t.id}
                  stroke={trendColors[i]}
                  fill={trendColors[i]}
                  fillOpacity={0.08}
                  strokeWidth={2}
                  dot={{ r: 3, fill: trendColors[i] }}
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {ranked.slice(0, 3).map((t, i) => (
              <div key={t.id} className="flex items-center gap-1.5 text-[16px] text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: trendColors[i] }} />
                {t.name.split(" ").pop()}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Growth trend line chart */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="text-[16px] text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 700 }}>Xu huong tang truong hoc vien (6 thang)</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {trendTeachers.map((t, i) => (
              <div key={t.id} className="flex items-center gap-1.5 text-[16px] text-muted-foreground">
                <span className="w-2.5 h-1.5 rounded-full" style={{ backgroundColor: trendColors[i] }} />
                {t.name.split(" ").pop()}
              </div>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trendData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#9ca3af" />
            <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
            <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid #e5e7eb" }} />
            {trendTeachers.map((t, i) => (
              <Line
                key={t.id}
                type="monotone"
                dataKey={`t${activeTeachers.indexOf(t) + 1}`}
                name={t.name.split(" ").pop()}
                stroke={trendColors[i]}
                strokeWidth={2}
                dot={{ r: 3, fill: trendColors[i] }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Insight box */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-gradient-to-r from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10 rounded-2xl p-5 border border-primary/10"
      >
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-[16px] text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 700 }}>Insight & De xuat</span>
        </div>
        <ul className="text-[16px] text-muted-foreground space-y-1.5 leading-relaxed">
          <li>⬢ <span className="text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 600 }}>{ranked[0]?.name}</span> dan dau voi diem hieu suat cao nhat, can duy tri va tao co hoi mentor cho giang vien moi.</li>
          <li>⬢ <span className="text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 600 }}>{ranked[ranked.length - 1]?.name}</span> can ho tro them ve phuong phap giang day va tuong tac hoc vien.</li>
          <li>⬢ Ky nang Writing va Speaking can bo sung them giang vien chuyen mon de giam tai cho giang vien hien tai.</li>
        </ul>
      </motion.div>
    </div>
  );
}


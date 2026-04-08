import { useDocumentTitle } from "../../utils/hooks";
import { useState } from "react";
import { Award, TrendingUp, CheckCircle, XCircle, Clock, Download, ChevronDown, BarChart2 } from "lucide-react";

type ResultStatus = "pass" | "fail" | "pending";

interface SkillScore {
  listening: number | null;
  speaking: number | null;
  reading: number | null;
  writing: number | null;
}

interface ExamResult {
  id: string;
  examName: string;
  course: string;
  examDate: string;
  scores: SkillScore;
  totalScore: number | null;
  passScore: number;
  status: ResultStatus;
  rank: string | null;
  certificateReady: boolean;
}

interface QuizResult {
  id: string;
  title: string;
  date: string;
  score: number;
  maxScore: number;
  duration: number;
  status: ResultStatus;
}

const statusCfg: Record<ResultStatus, { label: string; bg: string; text: string; icon: React.ElementType }> = {
  pass:    { label: "Đạt",          bg: "bg-emerald-100 dark:bg-emerald-500/20", text: "text-emerald-700 dark:text-emerald-400", icon: CheckCircle },
  fail:    { label: "Chưa đạt",     bg: "bg-rose-100 dark:bg-rose-500/20",       text: "text-rose-700 dark:text-rose-400",       icon: XCircle     },
  pending: { label: "Chờ kết quả",  bg: "bg-amber-100 dark:bg-amber-500/20",     text: "text-amber-700 dark:text-amber-400",     icon: Clock       },
};

const examResults: ExamResult[] = [
  {
    id: "E01", examName: "Kiểm tra giữa kỳ VSTEP B1", course: "Tiếng Anh B1 VSTEP",
    examDate: "01/02/2026",
    scores: { listening: 6.5, speaking: 7.0, reading: 6.0, writing: 5.5 },
    totalScore: 6.25, passScore: 5.0, status: "pass", rank: "Trung bình khá", certificateReady: false,
  },
  {
    id: "E02", examName: "Thi thử VSTEP B1 lần 1", course: "Tiếng Anh B1 VSTEP",
    examDate: "15/03/2026",
    scores: { listening: 7.0, speaking: 7.5, reading: 6.5, writing: 6.0 },
    totalScore: 6.75, passScore: 5.0, status: "pass", rank: "Khá", certificateReady: false,
  },
  {
    id: "E03", examName: "Kỳ thi VSTEP B1 chính thức", course: "Tiếng Anh B1 VSTEP",
    examDate: "20/04/2026",
    scores: { listening: null, speaking: null, reading: null, writing: null },
    totalScore: null, passScore: 5.0, status: "pending", rank: null, certificateReady: false,
  },
];

const quizResults: QuizResult[] = [
  { id: "Q01", title: "Kiểm tra Unit 1", date: "12/01/2026", score: 18, maxScore: 20, duration: 25, status: "pass" },
  { id: "Q02", title: "Kiểm tra Unit 2", date: "19/01/2026", score: 15, maxScore: 20, duration: 28, status: "pass" },
  { id: "Q03", title: "Kiểm tra Unit 3", date: "26/01/2026", score: 12, maxScore: 20, duration: 30, status: "fail" },
  { id: "Q04", title: "Kiểm tra Unit 3 (lần 2)", date: "02/02/2026", score: 16, maxScore: 20, duration: 29, status: "pass" },
  { id: "Q05", title: "Luyện tập Ngữ pháp", date: "10/03/2026", score: 42, maxScore: 50, duration: 40, status: "pass" },
  { id: "Q06", title: "Kiểm tra Unit 6", date: "30/03/2026", score: 19, maxScore: 20, duration: 22, status: "pass" },
  { id: "Q07", title: "Kiểm tra Unit 7", date: "08/04/2026", score: 0, maxScore: 20, duration: 0, status: "pending" },
];

const skills = ["Nghe", "Nói", "Đọc", "Viết"] as const;
const skillKeys: (keyof SkillScore)[] = ["listening", "speaking", "reading", "writing"];

export function StudentResults() {
  useDocumentTitle("Kết quả học tập");
  const [tab, setTab] = useState<"exam" | "quiz">("exam");
  const [expanded, setExpanded] = useState<string | null>(null);

  const bestScore = examResults.filter(r => r.totalScore !== null).sort((a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0))[0];
  const passedExams = examResults.filter(r => r.status === "pass").length;
  const quizPassRate = Math.round(quizResults.filter(r => r.status === "pass").length / quizResults.filter(r => r.status !== "pending").length * 100);

  return (
    <div className="pb-10">
      <div className="relative mb-6 p-6 rounded-2xl overflow-hidden bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: "28px 28px" }} />
        <div className="relative z-10">
          <p className="text-orange-200 text-[13px] font-semibold mb-1 uppercase">Cổng Học viên</p>
          <h1 className="text-[24px] font-extrabold">Kết quả học tập</h1>
          <p className="text-orange-100/70 text-[14px] mt-1">Điểm thi, điểm kiểm tra và tiến độ học tập của bạn</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Điểm TB tốt nhất", value: bestScore ? bestScore.totalScore?.toFixed(2) : "—", color: "text-orange-500" },
          { label: "Kỳ thi đạt", value: `${passedExams}/${examResults.filter(r => r.status !== "pending").length}`, color: "text-emerald-600" },
          { label: "Tỉ lệ đạt bài KT", value: `${quizPassRate}%`, color: "text-blue-600" },
          { label: "Xếp loại gần nhất", value: bestScore?.rank ?? "—", color: "text-violet-600" },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-4 text-center">
            <p className={`text-[20px] font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setTab("exam")} className={`px-4 py-2 rounded-xl text-[14px] font-semibold transition-all ${tab === "exam" ? "bg-orange-500 text-white" : "bg-white dark:bg-card border border-gray-200 dark:border-border text-muted-foreground hover:bg-gray-50"}`}>Kỳ thi chính thức</button>
        <button onClick={() => setTab("quiz")} className={`px-4 py-2 rounded-xl text-[14px] font-semibold transition-all ${tab === "quiz" ? "bg-orange-500 text-white" : "bg-white dark:bg-card border border-gray-200 dark:border-border text-muted-foreground hover:bg-gray-50"}`}>Bài kiểm tra định kỳ</button>
      </div>

      {tab === "exam" && (
        <div className="space-y-3">
          {examResults.map(r => {
            const st = statusCfg[r.status];
            const Icon = st.icon;
            const isOpen = expanded === r.id;
            return (
              <div key={r.id} className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl overflow-hidden">
                <div className="flex items-center gap-4 p-5 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-white/[0.02]" onClick={() => setExpanded(isOpen ? null : r.id)}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${st.bg}`}>
                    <Icon className={`w-5 h-5 ${st.text}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-[15px] text-[#1a1a2e] dark:text-foreground">{r.examName}</p>
                    <p className="text-[13px] text-muted-foreground">{r.course} · {r.examDate}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {r.totalScore !== null ? (
                      <>
                        <p className="text-[22px] font-extrabold text-orange-500">{r.totalScore.toFixed(2)}</p>
                        <p className="text-[11px] text-muted-foreground">/ {r.passScore} đạt</p>
                      </>
                    ) : (
                      <span className={`text-[12px] font-semibold px-2 py-1 rounded-full ${st.bg} ${st.text}`}>{st.label}</span>
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </div>

                {isOpen && r.totalScore !== null && (
                  <div className="px-5 pb-5 border-t border-gray-50 dark:border-white/[0.03] pt-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      {skills.map((skill, i) => {
                        const val = r.scores[skillKeys[i]];
                        return (
                          <div key={skill} className="text-center">
                            <p className="text-[12px] text-muted-foreground mb-1">{skill}</p>
                            <p className="text-[20px] font-extrabold text-orange-500">{val ?? "—"}</p>
                            {val !== null && (
                              <div className="h-1.5 bg-gray-100 dark:bg-white/10 rounded-full mt-1">
                                <div className={`h-full rounded-full ${val >= 5 ? "bg-orange-500" : "bg-rose-500"}`} style={{ width: `${(val / 10) * 100}%` }} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-[12px] font-semibold px-2 py-1 rounded-full ${st.bg} ${st.text}`}>{st.label}</span>
                        {r.rank && <span className="text-[13px] font-semibold text-[#1a1a2e] dark:text-foreground">Xếp loại: {r.rank}</span>}
                      </div>
                      {r.certificateReady && (
                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-[13px] font-semibold">
                          <Download className="w-3.5 h-3.5" /> Tải chứng chỉ
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === "quiz" && (
        <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[14px] min-w-[480px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-border bg-gray-50/50 dark:bg-white/[0.02]">
                  <th className="px-5 py-3 text-left font-semibold text-muted-foreground text-[12px] uppercase">Bài kiểm tra</th>
                  <th className="px-3 py-3 text-center font-semibold text-muted-foreground text-[12px] uppercase">Ngày</th>
                  <th className="px-3 py-3 text-center font-semibold text-muted-foreground text-[12px] uppercase">Điểm</th>
                  <th className="px-3 py-3 text-center font-semibold text-muted-foreground text-[12px] uppercase">Thời gian</th>
                  <th className="px-3 py-3 text-center font-semibold text-muted-foreground text-[12px] uppercase">Kết quả</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/[0.03]">
                {quizResults.map(q => {
                  const st = statusCfg[q.status];
                  const pct = q.maxScore > 0 ? Math.round((q.score / q.maxScore) * 100) : 0;
                  return (
                    <tr key={q.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                      <td className="px-5 py-3 font-semibold text-[#1a1a2e] dark:text-foreground">{q.title}</td>
                      <td className="px-3 py-3 text-center text-muted-foreground text-[13px]">{q.date}</td>
                      <td className="px-3 py-3 text-center">
                        {q.status === "pending" ? (
                          <span className="text-muted-foreground text-[13px]">—</span>
                        ) : (
                          <div>
                            <span className="font-extrabold text-[16px] text-orange-500">{q.score}</span>
                            <span className="text-muted-foreground text-[12px]">/{q.maxScore}</span>
                            <div className="w-16 h-1 bg-gray-100 dark:bg-white/10 rounded-full mx-auto mt-1">
                              <div className={`h-full rounded-full ${pct >= 50 ? "bg-orange-500" : "bg-rose-500"}`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center text-muted-foreground text-[13px]">{q.duration > 0 ? `${q.duration} phút` : "—"}</td>
                      <td className="px-3 py-3 text-center">
                        <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${st.bg} ${st.text}`}>{st.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

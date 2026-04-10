import { useMemo, useState } from "react";
import { useAppData } from "../../context/AppDataContext";
import { VirtualTable, type VirtualTableColumn } from "./VirtualTable";
import { Search, Download, BookOpen, GraduationCap, TrendingUp, TrendingDown, BarChart2 } from "lucide-react";
import { HighlightText } from "../ui/HighlightText";
import { toast } from "sonner";
import { useUrlPagination } from "../../utils/useUrlPagination";
import { Pagination } from "./Pagination";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, ReferenceLine
} from "recharts";

interface TrainingReportData {
  id: string;
  programGroup: string;
  sector: string;
  totalEnrolled: number;
  totalPassed: number;
  totalFailed: number;
  dropRate: number; // percentage
}


const MONTHLY_TREND = [
  { month: "T7/25", "Tin học": 4200, "Ngoại ngữ": 3100, "GDNN": 850, "GDTX": 1200 },
  { month: "T8/25", "Tin học": 4600, "Ngoại ngữ": 3400, "GDNN": 920, "GDTX": 1350 },
  { month: "T9/25", "Tin học": 5100, "Ngoại ngữ": 3750, "GDNN": 980, "GDTX": 1480 },
  { month: "T10/25","Tin học": 5300, "Ngoại ngữ": 3900, "GDNN": 1050,"GDTX": 1600 },
  { month: "T11/25","Tin học": 5800, "Ngoại ngữ": 4100, "GDNN": 1100,"GDTX": 1720 },
  { month: "T12/25","Tin học": 5400, "Ngoại ngữ": 3800, "GDNN": 950, "GDTX": 1550 },
  { month: "T1/26", "Tin học": 4900, "Ngoại ngữ": 3500, "GDNN": 870, "GDTX": 1400 },
  { month: "T2/26", "Tin học": 5200, "Ngoại ngữ": 3700, "GDNN": 930, "GDTX": 1510 },
  { month: "T3/26", "Tin học": 5700, "Ngoại ngữ": 4000, "GDNN": 1020,"GDTX": 1650 },
  { month: "T4/26", "Tin học": 6100, "Ngoại ngữ": 4300, "GDNN": 1150,"GDTX": 1780 },
];

const SECTOR_COLORS: Record<string, string> = {
  "Tin học":   "#6366f1",
  "Ngoại ngữ": "#10b981",
  "GDNN":      "#f59e0b",
  "GDTX":      "#3b82f6",
  "NNTH":      "#8b5cf6",
};

// Sectors shown in the MONTHLY_TREND line chart (historical data)
const TREND_SECTORS = ["Tin học", "Ngoại ngữ", "GDNN", "GDTX"] as const;

function exportCsv(rows: TrainingReportData[]) {
  const header = ["Mã", "Khối Ngành", "Lĩnh vực", "Tổng Đầu Vào", "Đạt", "Trượt", "Tỷ lệ Bỏ học (%)"];
  const lines = rows.map(r => [
    r.id, `"${r.programGroup}"`, r.sector,
    r.totalEnrolled, r.totalPassed, r.totalFailed, r.dropRate
  ].join(","));
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bao-cao-dao-tao-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Đã xuất báo cáo CSV!");
}

export function ReportTraining() {
  const { enrollments: storeEnrollments, classes: storeClasses, examResults: storeExamResults } = useAppData();
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const { page, pageSize, setPage, setPageSize } = useUrlPagination();

  // Aggregate live training data from enrollments + exam results
  const liveData = useMemo((): TrainingReportData[] => {
    // Build courseId → class type mapping
    const courseToSector: Record<string, string> = {};
    storeClasses.forEach(cls => { courseToSector[cls.courseId] = cls.type; });

    // Determine per-student per-course outcome (exam result overrides enrollment status)
    const studentCourseOutcome: Record<string, "pass" | "fail" | "dropout" | "active"> = {};
    storeEnrollments.forEach(e => {
      const key = `${e.studentId}:${e.courseId}`;
      if (e.status === "graduated") studentCourseOutcome[key] = "pass";
      else if (e.status === "dropout") studentCourseOutcome[key] = "dropout";
      else studentCourseOutcome[key] = "active";
    });

    // Override with exam result where subject fuzzy-matches courseName
    storeExamResults.forEach(er => {
      if (er.status !== "pass" && er.status !== "fail") return;
      const subjectLower = er.subject.toLowerCase().split(" ").slice(0, 2).join(" ");
      const enroll = storeEnrollments.find(
        e => e.studentId === er.studentId && e.courseName.toLowerCase().includes(subjectLower)
      );
      if (enroll) {
        const key = `${er.studentId}:${enroll.courseId}`;
        if (er.status === "pass" && studentCourseOutcome[key] !== "pass")
          studentCourseOutcome[key] = "pass";
        else if (er.status === "fail" && studentCourseOutcome[key] === "active")
          studentCourseOutcome[key] = "fail";
      }
    });

    // Aggregate by courseName
    const map: Record<string, { courseId: string; sector: string; enrolled: number; passed: number; failed: number; dropped: number }> = {};
    storeEnrollments.forEach(e => {
      if (!map[e.courseName]) {
        map[e.courseName] = {
          courseId: e.courseId,
          sector: courseToSector[e.courseId] || "NNTH",
          enrolled: 0, passed: 0, failed: 0, dropped: 0,
        };
      }
      const r = map[e.courseName];
      r.enrolled++;
      const outcome = studentCourseOutcome[`${e.studentId}:${e.courseId}`] || "active";
      if (outcome === "pass") r.passed++;
      else if (outcome === "fail") r.failed++;
      else if (outcome === "dropout") { r.failed++; r.dropped++; }
    });

    return Object.entries(map).map(([courseName, v], i) => ({
      id: `TR-${String(i + 1).padStart(3, "0")}`,
      programGroup: courseName,
      sector: v.sector,
      totalEnrolled: v.enrolled,
      totalPassed: v.passed,
      totalFailed: v.failed,
      dropRate: v.enrolled > 0 ? +((v.dropped / v.enrolled) * 100).toFixed(1) : 0,
    }));
  }, [storeEnrollments, storeClasses, storeExamResults]);

  const sectors = useMemo(() => ["all", ...Array.from(new Set(liveData.map(d => d.sector)))], [liveData]);

  const filtered = useMemo(() =>
    liveData.filter(d => {
      const matchSearch = d.programGroup.toLowerCase().includes(search.toLowerCase());
      const matchSector = sectorFilter === "all" || d.sector === sectorFilter;
      return matchSearch && matchSector;
    }), [liveData, search, sectorFilter]);

  const paginated = useMemo(() =>
    filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]);

  const totalEnrolled = liveData.reduce((a, b) => a + b.totalEnrolled, 0);
  const totalPassed   = liveData.reduce((a, b) => a + b.totalPassed, 0);
  const totalFailed   = liveData.reduce((a, b) => a + b.totalFailed, 0);
  const overallPassRate = totalEnrolled > 0 ? ((totalPassed / totalEnrolled) * 100).toFixed(1) : "0.0";
  const avgDropRate = liveData.length > 0
    ? (liveData.reduce((a, b) => a + b.dropRate, 0) / liveData.length).toFixed(1)
    : "0.0";

  // Bar chart data aggregated by sector
  const sectorBarData = useMemo(() => {
    const map: Record<string, { enrolled: number; passed: number }> = {};
    liveData.forEach(d => {
      if (!map[d.sector]) map[d.sector] = { enrolled: 0, passed: 0 };
      map[d.sector].enrolled += d.totalEnrolled;
      map[d.sector].passed += d.totalPassed;
    });
    return Object.entries(map).map(([sector, v]) => ({
      sector,
      "Đầu vào": v.enrolled,
      "Đạt chuẩn": v.passed,
    }));
  }, [liveData]);

  const columns: VirtualTableColumn<TrainingReportData>[] = useMemo(() => [
    {
      key: "group", header: "Khối Ngành / Lĩnh Vực Đào Tạo", width: "40%",
      render: (d) => (
        <div className="py-2">
          <HighlightText text={d.programGroup} query={search} className="text-[15px] font-bold text-[#1a1a2e] dark:text-foreground" />
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[12px] font-mono text-muted-foreground">{d.id}</span>
            <span
              className="inline-flex px-2 py-0.5 rounded text-[11.5px] font-bold"
              style={{ background: SECTOR_COLORS[d.sector] + "18", color: SECTOR_COLORS[d.sector] }}
            >
              {d.sector}
            </span>
          </div>
        </div>
      )
    },
    {
      key: "input", header: "Tổng Đầu Vào",
      render: (d) => (
        <div>
          <span className="text-[15px] font-bold text-blue-600 dark:text-blue-400">{d.totalEnrolled.toLocaleString()} HV</span>
          <div className="flex items-center gap-1 mt-0.5">
            <TrendingDown className="w-3 h-3 text-rose-500"/>
            <span className="text-[12px] text-rose-500 font-semibold">{d.dropRate}% bỏ học</span>
          </div>
        </div>
      )
    },
    {
      key: "output", header: "Hiệu Suất Đầu Ra",
      render: (d) => {
        const passRate = ((d.totalPassed / d.totalEnrolled) * 100);
        const color = passRate >= 90 ? "#10b981" : passRate >= 75 ? "#f59e0b" : "#ef4444";
        return (
          <div className="w-full max-w-[200px]">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[13.5px] font-bold" style={{ color }}>{d.totalPassed.toLocaleString()} Đạt</span>
              <span className="text-[12.5px] font-bold text-gray-500">{passRate.toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full bg-red-100 dark:bg-rose-500/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${passRate}%`, background: color }}/>
            </div>
            <p className="mt-1 text-[12px] text-muted-foreground text-right">{d.totalFailed.toLocaleString()} chưa đạt</p>
          </div>
        );
      }
    }
  ], [search]);

  return (
    <div className="flex-1 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[26px] font-black text-[#1a1a2e] dark:text-foreground tracking-tight">Báo Cáo Chất Lượng Đào Tạo</h1>
          <p className="text-[15px] text-muted-foreground mt-1">Đo lường tỷ lệ đầu vào, đầu ra và chất lượng giảng dạy theo nhóm môn học.</p>
        </div>
        <button
          onClick={() => exportCsv(filtered)}
          className="flex items-center gap-2.5 bg-indigo-600 text-white px-5 py-3 rounded-2xl text-[15px] shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all font-bold self-start"
        >
          <Download className="w-5 h-5"/> Xuất CSV ({filtered.length})
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-500/10 dark:to-blue-500/10 p-5 rounded-3xl border border-indigo-100 dark:border-indigo-500/20">
          <BookOpen className="w-6 h-6 text-indigo-600 mb-3"/>
          <p className="text-[26px] font-black text-indigo-900 dark:text-indigo-100 leading-none">{liveData.length}</p>
          <p className="text-[13px] text-indigo-700/80 dark:text-indigo-300 font-medium mt-1">Nhóm Ngành Đào Tạo</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-500/10 dark:to-sky-500/10 p-5 rounded-3xl border border-blue-100 dark:border-blue-500/20">
          <GraduationCap className="w-6 h-6 text-blue-600 mb-3"/>
          <p className="text-[26px] font-black text-blue-900 dark:text-blue-100 leading-none">{totalEnrolled.toLocaleString()}</p>
          <p className="text-[13px] text-blue-700/80 dark:text-blue-300 font-medium mt-1">Tổng Học Viên Đầu Vào</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 p-5 rounded-3xl border border-emerald-100 dark:border-emerald-500/20">
          <TrendingUp className="w-6 h-6 text-emerald-600 mb-3"/>
          <p className="text-[26px] font-black text-emerald-900 dark:text-emerald-100 leading-none">{overallPassRate}%</p>
          <p className="text-[13px] text-emerald-700/80 dark:text-emerald-300 font-medium mt-1">Tỷ lệ Đạt Chuẩn</p>
          <p className="text-[11px] text-emerald-600/70 mt-0.5">{totalPassed.toLocaleString()} / {totalEnrolled.toLocaleString()} HV</p>
        </div>
        <div className="bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-500/10 dark:to-red-500/10 p-5 rounded-3xl border border-rose-100 dark:border-rose-500/20">
          <TrendingDown className="w-6 h-6 text-rose-600 mb-3"/>
          <p className="text-[26px] font-black text-rose-900 dark:text-rose-100 leading-none">{avgDropRate}%</p>
          <p className="text-[13px] text-rose-700/80 dark:text-rose-300 font-medium mt-1">TB Tỷ lệ Bỏ học</p>
          <p className="text-[11px] text-rose-600/70 mt-0.5">{totalFailed.toLocaleString()} HV chưa đạt</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        {/* Line Chart: Monthly trend by sector */}
        <div className="lg:col-span-3 bg-white dark:bg-card p-5 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-indigo-500"/>
            <h3 className="text-[15px] font-bold text-[#1a1a2e] dark:text-foreground">Xu hướng Tuyển sinh theo Lĩnh vực</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={MONTHLY_TREND} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false}/>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`}/>
              <Tooltip formatter={(value: number, name: string) => [value.toLocaleString() + " HV", name]}/>
              <Legend/>
              {TREND_SECTORS.map(sector => (
                <Line
                  key={sector}
                  type="monotone"
                  dataKey={sector}
                  stroke={SECTOR_COLORS[sector]}
                  strokeWidth={2}
                  dot={{ r: 2.5 }}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart: Enrolled vs Passed by sector */}
        <div className="lg:col-span-2 bg-white dark:bg-card p-5 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-5 h-5 text-emerald-500"/>
            <h3 className="text-[15px] font-bold text-[#1a1a2e] dark:text-foreground">Đầu vào vs Đạt chuẩn</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sectorBarData} layout="vertical" margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false}/>
              <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`}/>
              <YAxis type="category" dataKey="sector" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={65}/>
              <Tooltip formatter={(v: number) => [v.toLocaleString() + " HV", ""]}/>
              <Legend/>
              <Bar dataKey="Đầu vào" fill="#6366f1" radius={[0, 4, 4, 0]}/>
              <Bar dataKey="Đạt chuẩn" fill="#10b981" radius={[0, 4, 4, 0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-card p-3 rounded-3xl border border-gray-100 dark:border-border mb-3 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"/>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Nhập nhóm lĩnh vực (ví dụ: Tin học, Ngoại ngữ)..."
            className="w-full bg-[#f4f5f7] dark:bg-black/20 border border-transparent focus:border-primary/50 transition-colors px-12 py-3.5 rounded-2xl text-[15px] outline-none font-medium"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {sectors.map(s => (
            <button
              key={s}
              onClick={() => { setSectorFilter(s); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all ${sectorFilter === s ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" : "bg-[#f4f5f7] dark:bg-white/5 text-muted-foreground hover:bg-indigo-50 dark:hover:bg-indigo-500/10"}`}
            >
              {s === "all" ? "Tất cả" : s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-3xl overflow-hidden shadow-sm">
        <VirtualTable data={paginated} columns={columns} getRowKey={d => d.id} rowHeight={85} maxHeight={600}/>
      </div>
      <div className="mt-4">
        <Pagination page={page} total={filtered.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} itemLabel="Nhóm Ngành"/>
      </div>
    </div>
  );
}

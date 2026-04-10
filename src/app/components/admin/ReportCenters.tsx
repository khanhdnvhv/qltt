import { useMemo, useState, useCallback } from "react";
import { useAppData } from "../../context/AppDataContext";
import { VirtualTable, type VirtualTableColumn } from "./VirtualTable";
import {
  Search, Download, Building, MapPin, Users, Activity,
  TrendingUp, X, ChevronRight, BarChart2
} from "lucide-react";
import { HighlightText } from "../ui/HighlightText";
import { toast } from "sonner";
import { useUrlPagination } from "../../utils/useUrlPagination";
import { Pagination } from "./Pagination";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
  PieChart, Pie, Cell
} from "recharts";

interface CenterReportData {
  id: string;
  name: string;
  type: string;
  district: string;
  totalStudents: number;
  activeClasses: number;
  capacity: number;
  status: "active" | "suspended" | "pending";
}



const PIE_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6"];

function exportCsv(rows: CenterReportData[]) {
  const header = ["Mã TT", "Tên Trung Tâm", "Loại hình", "Quận/Huyện", "Tổng Học Viên", "Lớp Đang Mở", "Sĩ Số Tối Đa", "Tỷ Lệ Lấp Đầy (%)", "Trạng Thái"];
  const statusLabel = { active: "Hoạt động", suspended: "Đình chỉ", pending: "Chờ cấp phép" };
  const lines = rows.map(r => [
    r.id, `"${r.name}"`, r.type, r.district,
    r.totalStudents, r.activeClasses, r.capacity,
    ((r.totalStudents / r.capacity) * 100).toFixed(1),
    statusLabel[r.status]
  ].join(","));
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bao-cao-trung-tam-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Đã xuất file CSV thành công!");
}

const statusCfg = {
  active:    { label: "Hoạt động",     cls: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" },
  suspended: { label: "Bị đình chỉ",   cls: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400" },
  pending:   { label: "Chờ cấp phép",  cls: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" },
};

function parseDMY(s: string): Date | null {
  const [d, mo, y] = s.split("/");
  if (!d || !mo || !y) return null;
  return new Date(+y, +mo - 1, +d);
}

export function ReportCenters() {
  const { classes: storeClasses, centers, enrollments: storeEnrollments } = useAppData();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedCenter, setSelectedCenter] = useState<CenterReportData | null>(null);
  const { page, pageSize, setPage, setPageSize } = useUrlPagination();

  // Per-center live data from the centers store
  const liveData = useMemo((): CenterReportData[] => {
    const totalActive = storeClasses.filter(
      cls => cls.status === "Hoạt động" || cls.status === "Tuyển sinh"
    ).length;
    const totalStu = centers.reduce((s, c) => s + c.currentStudents, 0) || 1;
    return centers.map(c => ({
      id: c.id,
      name: c.name,
      type: c.type,
      district: c.district,
      totalStudents: c.currentStudents,
      activeClasses: Math.max(1, Math.round(totalActive * c.currentStudents / totalStu)),
      capacity: c.studentCapacity,
      status: c.status === "revoked" ? "suspended" : c.status,
    }));
  }, [centers, storeClasses]);

  // Monthly new-enrollment trend from real enrollment data
  const trendData = useMemo(() => {
    const months = ["T7/25","T8/25","T9/25","T10/25","T11/25","T12/25","T1/26","T2/26","T3/26","T4/26"];
    const result = months.map(m => ({ month: m, "Tuyển sinh mới": 0 }));
    storeEnrollments.forEach(e => {
      const d = parseDMY(e.enrollDate);
      if (!d) return;
      const key = `T${d.getMonth() + 1}/${String(d.getFullYear()).slice(-2)}`;
      const idx = months.indexOf(key);
      if (idx !== -1) result[idx]["Tuyển sinh mới"]++;
    });
    return result;
  }, [storeEnrollments]);

  // Aggregated KPIs
  const totalCenters = liveData.length;
  const activeCenters = liveData.filter(d => d.status === "active").length;
  const totalStudents = liveData.reduce((a, b) => a + b.totalStudents, 0);
  const totalCapacity = liveData.reduce((a, b) => a + b.capacity, 0);
  const fillRate = totalCapacity > 0 ? ((totalStudents / totalCapacity) * 100).toFixed(1) : "0.0";

  // Chart data derived from liveData (memoized)
  const districtChartData = useMemo(() => {
    const map: Record<string, { students: number; classes: number }> = {};
    liveData.forEach(d => {
      if (!map[d.district]) map[d.district] = { students: 0, classes: 0 };
      map[d.district].students += d.totalStudents;
      map[d.district].classes += d.activeClasses;
    });
    return Object.entries(map).map(([district, v]) => ({ district, ...v }));
  }, [liveData]);

  const typeChartData = useMemo(() => {
    const map: Record<string, number> = {};
    liveData.forEach(d => { map[d.type] = (map[d.type] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [liveData]);

  const types = useMemo(() => ["all", ...Array.from(new Set(liveData.map(d => d.type)))], [liveData]);

  const filtered = useMemo(() =>
    liveData.filter(d => {
      const q = search.toLowerCase();
      const matchSearch = d.name.toLowerCase().includes(q) || d.id.includes(q) || d.district.toLowerCase().includes(q);
      const matchType = typeFilter === "all" || d.type === typeFilter;
      return matchSearch && matchType;
    }), [liveData, search, typeFilter]);

  const paginated = useMemo(() =>
    filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]);

  const handleRowClick = useCallback((d: CenterReportData) => setSelectedCenter(d), []);

  const columns: VirtualTableColumn<CenterReportData>[] = useMemo(() => [
    {
      key: "info", header: "Trung tâm Đào tạo", width: "36%",
      render: (d) => (
        <div className="py-2">
          <HighlightText text={d.name} query={search} className="text-[15px] font-bold text-[#1a1a2e] dark:text-foreground block" />
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[12px] font-mono bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded text-muted-foreground">{d.id}</span>
            <span className="text-[12.5px] text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3"/><HighlightText text={d.district} query={search} /></span>
          </div>
        </div>
      )
    },
    {
      key: "type", header: "Loại hình",
      render: (d) => (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-[13px] font-semibold text-indigo-700 dark:text-indigo-400">{d.type}</span>
      )
    },
    {
      key: "scale", header: "Quy mô & Lấp đầy",
      render: (d) => {
        const rate = Math.min((d.totalStudents / d.capacity) * 100, 100);
        return (
          <div className="min-w-[140px]">
            <p className="text-[14px] font-bold text-[#1a1a2e] dark:text-foreground flex items-center gap-1.5 mb-1">
              <Users className="w-4 h-4 text-blue-500"/>
              {d.totalStudents.toLocaleString()} HV
              <span className="text-[12px] text-muted-foreground font-medium ml-1">{d.activeClasses} lớp</span>
            </p>
            <div className="h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${rate >= 80 ? "bg-rose-500" : rate >= 60 ? "bg-amber-500" : "bg-emerald-500"}`}
                style={{ width: `${rate}%` }}
              />
            </div>
            <p className="text-[11.5px] text-muted-foreground mt-0.5">{rate.toFixed(0)}% lấp đầy</p>
          </div>
        );
      }
    },
    {
      key: "status", header: "Trạng thái",
      render: (d) => {
        const cfg = statusCfg[d.status];
        return (
          <div className="flex items-center gap-2">
            <span className={`inline-flex px-3 py-1.5 rounded-lg text-[12.5px] font-bold ${cfg.cls}`}>{cfg.label}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-50" />
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
          <h1 className="text-[26px] font-black text-[#1a1a2e] dark:text-foreground tracking-tight">Thống kê Mạng lưới Trung Tâm</h1>
          <p className="text-[15px] text-muted-foreground mt-1">Báo cáo tổng thể các đơn vị GDNN-GDTX, Ngoại ngữ &amp; Tin học trên địa bàn.</p>
        </div>
        <button
          onClick={() => exportCsv(filtered)}
          className="flex items-center gap-2.5 bg-emerald-600 text-white px-5 py-3 rounded-2xl text-[15px] shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all font-bold self-start"
        >
          <Download className="w-5 h-5"/> Xuất CSV ({filtered.length})
        </button>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-card p-5 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
          <Building className="w-6 h-6 text-indigo-500 mb-3"/>
          <p className="text-[28px] font-black text-[#1a1a2e] dark:text-foreground leading-none">{totalCenters}</p>
          <p className="text-[13px] text-muted-foreground font-medium mt-1">Tổng Trung Tâm</p>
        </div>
        <div className="bg-white dark:bg-card p-5 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
          <Activity className="w-6 h-6 text-emerald-500 mb-3"/>
          <p className="text-[28px] font-black text-emerald-600 dark:text-emerald-400 leading-none">{activeCenters}</p>
          <p className="text-[13px] text-muted-foreground font-medium mt-1">Đang Hoạt Động</p>
          <p className="text-[11.5px] text-muted-foreground">{((activeCenters/totalCenters)*100).toFixed(0)}% tổng số</p>
        </div>
        <div className="bg-white dark:bg-card p-5 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
          <Users className="w-6 h-6 text-blue-500 mb-3"/>
          <p className="text-[28px] font-black text-[#1a1a2e] dark:text-foreground leading-none">{totalStudents.toLocaleString()}</p>
          <p className="text-[13px] text-muted-foreground font-medium mt-1">Tổng Học Viên</p>
        </div>
        <div className="bg-white dark:bg-card p-5 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
          <TrendingUp className="w-6 h-6 text-amber-500 mb-3"/>
          <p className="text-[28px] font-black text-amber-600 dark:text-amber-400 leading-none">{fillRate}%</p>
          <p className="text-[13px] text-muted-foreground font-medium mt-1">Tỷ Lệ Lấp Đầy</p>
          <div className="h-1.5 bg-amber-100 dark:bg-amber-500/10 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${fillRate}%` }}/>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Bar Chart: Students by District */}
        <div className="lg:col-span-2 bg-white dark:bg-card p-5 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-5 h-5 text-indigo-500"/>
            <h3 className="text-[15px] font-bold text-[#1a1a2e] dark:text-foreground">Quy mô Học viên theo Quận/Huyện</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={districtChartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false}/>
              <XAxis dataKey="district" tick={{ fontSize: 12 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`}/>
              <Tooltip formatter={(value: number) => [value.toLocaleString() + " HV", "Học viên"]} />
              <Bar dataKey="students" fill="#6366f1" radius={[6, 6, 0, 0]} name="Học viên"/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart: Centers by Type */}
        <div className="bg-white dark:bg-card p-5 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
          <h3 className="text-[15px] font-bold text-[#1a1a2e] dark:text-foreground mb-4">Phân loại Loại Hình</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={typeChartData}
                cx="50%" cy="50%"
                innerRadius={50} outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {typeChartData.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]}/>
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => [v + " TT", ""]}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Line Chart: Monthly Trend */}
      <div className="bg-white dark:bg-card p-5 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-emerald-500"/>
          <h3 className="text-[15px] font-bold text-[#1a1a2e] dark:text-foreground">Tuyển sinh mới theo tháng (10 tháng gần nhất)</h3>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trendData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false}/>
            <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false}/>
            <Tooltip formatter={(value: number) => [value.toLocaleString() + " HV", "Tuyển sinh mới"]}/>
            <Line type="monotone" dataKey="Tuyển sinh mới" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }}/>
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-card p-3 rounded-3xl border border-gray-100 dark:border-border mb-3 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"/>
          <input
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm kiếm tên trung tâm, mã số, quận..."
            className="w-full bg-[#f4f5f7] dark:bg-black/20 border border-transparent focus:border-primary/50 transition-colors px-12 py-3.5 rounded-2xl text-[15px] outline-none font-medium"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {types.map(t => (
            <button
              key={t}
              onClick={() => { setTypeFilter(t); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all ${typeFilter === t ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" : "bg-[#f4f5f7] dark:bg-white/5 text-muted-foreground hover:bg-indigo-50 dark:hover:bg-indigo-500/10"}`}
            >
              {t === "all" ? "Tất cả" : t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-card rounded-3xl border border-gray-100 dark:border-border overflow-hidden shadow-sm">
        <VirtualTable
          data={paginated}
          columns={columns}
          getRowKey={d => d.id}
          rowHeight={80}
          maxHeight={600}
          onRowClick={handleRowClick}
        />
      </div>
      <div className="mt-4">
        <Pagination page={page} total={filtered.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} itemLabel="Trung tâm"/>
      </div>

      {/* Drill-down Detail Drawer */}
      {selectedCenter && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedCenter(null)}/>
          <div className="relative w-full max-w-[480px] bg-white dark:bg-[#1a1a2e] h-full overflow-y-auto shadow-2xl flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-100 dark:border-white/10 sticky top-0 bg-white dark:bg-[#1a1a2e] z-10">
              <div>
                <p className="text-[12px] font-mono text-muted-foreground">{selectedCenter.id}</p>
                <h2 className="text-[18px] font-black text-[#1a1a2e] dark:text-foreground mt-0.5 leading-snug">{selectedCenter.name}</h2>
                <span className={`inline-flex mt-2 px-3 py-1 rounded-lg text-[12px] font-bold ${statusCfg[selectedCenter.status].cls}`}>
                  {statusCfg[selectedCenter.status].label}
                </span>
              </div>
              <button onClick={() => setSelectedCenter(null)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors mt-1">
                <X className="w-5 h-5"/>
              </button>
            </div>
            {/* Drawer Content */}
            <div className="p-6 flex flex-col gap-5 flex-1">
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Quận/Huyện", value: selectedCenter.district, icon: <MapPin className="w-4 h-4 text-blue-500"/> },
                  { label: "Loại hình", value: selectedCenter.type, icon: <Building className="w-4 h-4 text-indigo-500"/> },
                  { label: "Tổng học viên", value: selectedCenter.totalStudents.toLocaleString() + " HV", icon: <Users className="w-4 h-4 text-emerald-500"/> },
                  { label: "Lớp đang mở", value: selectedCenter.activeClasses + " lớp", icon: <Activity className="w-4 h-4 text-amber-500"/> },
                ].map(item => (
                  <div key={item.label} className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4">
                    <div className="flex items-center gap-1.5 mb-1.5">{item.icon}<span className="text-[12px] text-muted-foreground">{item.label}</span></div>
                    <p className="text-[16px] font-bold text-[#1a1a2e] dark:text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Fill rate visual */}
              <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[13px] font-semibold text-[#1a1a2e] dark:text-foreground">Tỷ lệ lấp đầy lớp học</span>
                  <span className="text-[15px] font-black text-amber-600">
                    {Math.min((selectedCenter.totalStudents / selectedCenter.capacity) * 100, 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                  {(() => {
                    const rate = Math.min((selectedCenter.totalStudents / selectedCenter.capacity) * 100, 100);
                    return (
                      <div
                        className={`h-full rounded-full transition-all ${rate >= 80 ? "bg-rose-500" : rate >= 60 ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{ width: `${rate}%` }}
                      />
                    );
                  })()}
                </div>
                <div className="flex justify-between mt-1.5 text-[11.5px] text-muted-foreground">
                  <span>{selectedCenter.totalStudents.toLocaleString()} học viên thực tế</span>
                  <span>Tối đa: {selectedCenter.capacity.toLocaleString()}</span>
                </div>
              </div>

              {/* Mini bar chart for this center vs district average */}
              <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4">
                <p className="text-[13px] font-semibold text-[#1a1a2e] dark:text-foreground mb-3">So sánh với trung bình {selectedCenter.district}</p>
                {(() => {
                  const districtCenters = liveData.filter(d => d.district === selectedCenter.district);
                  const avgStudents = Math.round(districtCenters.reduce((a,b)=>a+b.totalStudents,0) / districtCenters.length);
                  const maxVal = Math.max(selectedCenter.totalStudents, avgStudents);
                  return (
                    <div className="space-y-3">
                      {[
                        { label: "Trung tâm này", val: selectedCenter.totalStudents, color: "bg-indigo-500" },
                        { label: `TB ${selectedCenter.district}`, val: avgStudents, color: "bg-gray-400" },
                      ].map(item => (
                        <div key={item.label}>
                          <div className="flex justify-between text-[12.5px] mb-1">
                            <span className="text-muted-foreground">{item.label}</span>
                            <span className="font-bold text-[#1a1a2e] dark:text-foreground">{item.val.toLocaleString()} HV</span>
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${item.color}`} style={{ width: `${(item.val / maxVal) * 100}%` }}/>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              <button
                onClick={() => { exportCsv([selectedCenter]); }}
                className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-2xl text-[14px] font-bold hover:bg-emerald-700 transition-all"
              >
                <Download className="w-4 h-4"/> Xuất CSV Trung Tâm Này
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

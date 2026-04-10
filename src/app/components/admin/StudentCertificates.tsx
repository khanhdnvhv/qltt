import { useDocumentTitle } from "../../utils/hooks";
import { useState, useMemo } from "react";
import { Award, Download, Eye, Calendar, CheckCircle, Clock, X, Shield, Star } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../auth/AuthContext";
import { useAppData } from "../../context/AppDataContext";

type CertStatus = "issued" | "pending" | "processing";

interface Certificate {
  id: string;
  name: string;
  course: string;
  issuedBy: string;
  issuedDate: string | null;
  expiryDate: string | null;
  certNumber: string | null;
  status: CertStatus;
  level: string;
  score: number | null;
  rank: string | null;
  downloadable: boolean;
}

const statusCfg: Record<CertStatus, { label: string; bg: string; text: string; dot: string }> = {
  issued:     { label: "Đã cấp",         bg: "bg-emerald-100 dark:bg-emerald-500/20", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500"              },
  pending:    { label: "Chờ xét duyệt",  bg: "bg-amber-100 dark:bg-amber-500/20",    text: "text-amber-700 dark:text-amber-400",    dot: "bg-amber-500 animate-pulse"  },
  processing: { label: "Đang xử lý",     bg: "bg-blue-100 dark:bg-blue-500/20",      text: "text-blue-700 dark:text-blue-400",      dot: "bg-blue-500 animate-pulse"   },
};

export function StudentCertificates() {
  useDocumentTitle("Chứng chỉ & Văn bằng");
  const { user } = useAuth();
  const { getStudentByUserId, getCertificatesByStudentId } = useAppData();
  const [preview, setPreview] = useState<Certificate | null>(null);

  const student = useMemo(() => user ? getStudentByUserId(user.id) : undefined, [user, getStudentByUserId]);

  const mockCerts = useMemo((): Certificate[] => {
    if (!student) return [];
    return getCertificatesByStudentId(student.id).map(c => ({
      id: c.id,
      name: c.certType,
      course: c.courseName,
      issuedBy: c.issuedBy,
      issuedDate: c.issuedDate,
      expiryDate: c.expiryDate,
      certNumber: c.serialNo,
      status: c.status === "ISSUED" ? "issued" : c.status === "PRINTED" ? "processing" : "pending",
      level: c.level,
      score: c.score,
      rank: c.rank,
      downloadable: c.status === "ISSUED",
    }));
  }, [student, getCertificatesByStudentId]);

  const issued = mockCerts.filter(c => c.status === "issued").length;
  const pending = mockCerts.filter(c => c.status !== "issued").length;

  return (
    <div className="pb-10">
      <div className="relative mb-6 p-6 rounded-2xl overflow-hidden bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: "28px 28px" }} />
        <div className="relative z-10">
          <p className="text-orange-200 text-[13px] font-semibold mb-1 uppercase">Cổng Học viên</p>
          <h1 className="text-[24px] font-extrabold">Chứng chỉ & Văn bằng</h1>
          <p className="text-orange-100/70 text-[14px] mt-1">Tra cứu và tải chứng chỉ đã được cấp</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Đã cấp", value: issued, color: "text-emerald-600", icon: CheckCircle },
          { label: "Đang chờ", value: pending, color: "text-amber-600", icon: Clock },
          { label: "Tổng văn bằng", value: mockCerts.length, color: "text-orange-500", icon: Award },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className={`text-[24px] font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-[12px] text-muted-foreground">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Certificate cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockCerts.map(c => {
          const st = statusCfg[c.status];
          return (
            <div key={c.id} className={`bg-white dark:bg-card border rounded-2xl p-5 transition-shadow hover:shadow-md ${c.status === "issued" ? "border-emerald-200 dark:border-emerald-500/20" : "border-gray-100 dark:border-border"}`}>
              {/* Certificate top strip */}
              <div className={`h-1.5 rounded-full mb-4 ${c.status === "issued" ? "bg-gradient-to-r from-orange-400 to-amber-500" : "bg-gray-200 dark:bg-white/10"}`} />

              <div className="flex items-start gap-3 mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${c.status === "issued" ? "bg-amber-50 dark:bg-amber-500/10" : "bg-gray-100 dark:bg-white/5"}`}>
                  {c.status === "issued" ? <Award className="w-6 h-6 text-amber-500" /> : <Clock className="w-6 h-6 text-muted-foreground" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{st.label}
                    </span>
                  </div>
                  <h3 className="font-bold text-[15px] text-[#1a1a2e] dark:text-foreground">{c.name}</h3>
                  <p className="text-[12px] text-muted-foreground">{c.course}</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 text-[13px] mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1"><Shield className="w-3.5 h-3.5" />Cấp bởi</span>
                  <span className="font-medium text-right">{c.issuedBy}</span>
                </div>
                {c.certNumber && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Số chứng chỉ</span>
                    <span className="font-mono font-semibold text-orange-600">{c.certNumber}</span>
                  </div>
                )}
                {c.issuedDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Ngày cấp</span>
                    <span className="font-medium">{c.issuedDate}</span>
                  </div>
                )}
                {c.score !== null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1"><Star className="w-3.5 h-3.5" />Điểm / Xếp loại</span>
                    <span className="font-bold text-orange-500">{c.score} — {c.rank}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cấp độ</span>
                  <span className="font-semibold">{c.level}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-gray-50 dark:border-white/[0.03]">
                <button onClick={() => setPreview(c)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-border text-[13px] font-semibold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <Eye className="w-3.5 h-3.5" /> Xem
                </button>
                {c.downloadable ? (
                  <button onClick={() => toast.success(`Đang tải xuống ${c.name}...`)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-[13px] font-semibold transition-colors">
                    <Download className="w-3.5 h-3.5" /> Tải xuống
                  </button>
                ) : (
                  <div className="flex-1 flex items-center justify-center px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/5 text-[13px] text-muted-foreground font-semibold">
                    Chưa sẵn sàng
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state for no certs */}
      {mockCerts.length === 0 && (
        <div className="py-20 text-center">
          <Award className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <p className="font-semibold text-muted-foreground">Bạn chưa có chứng chỉ nào</p>
          <p className="text-[13px] text-muted-foreground/70 mt-1">Hoàn thành khóa học để nhận chứng chỉ</p>
        </div>
      )}

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="bg-white dark:bg-card rounded-2xl shadow-2xl w-full max-w-md p-0 overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Certificate design header */}
            <div className="h-2 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider">Chứng nhận</span>
                <button onClick={() => setPreview(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"><X className="w-4 h-4" /></button>
              </div>
              <div className="text-center py-6 border border-amber-200 dark:border-amber-500/20 rounded-2xl bg-amber-50/30 dark:bg-amber-500/5 mb-5">
                <Award className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                <p className="text-[12px] text-muted-foreground uppercase tracking-widest mb-1">{preview.issuedBy}</p>
                <p className="text-[11px] text-muted-foreground mb-4">Xác nhận rằng</p>
                <p className="text-[20px] font-extrabold text-[#1a1a2e] dark:text-foreground mb-1">{student?.name ?? user?.fullName}</p>
                <p className="text-[12px] text-muted-foreground mb-4">{student?.code ?? ""}</p>
                <p className="text-[14px] text-muted-foreground mb-1">đã hoàn thành</p>
                <p className="text-[18px] font-bold text-orange-600 mb-1">{preview.name}</p>
                {preview.score && <p className="text-[14px] text-muted-foreground">Điểm: <strong className="text-orange-500">{preview.score}</strong> — Xếp loại: <strong>{preview.rank}</strong></p>}
                {preview.issuedDate && <p className="text-[12px] text-muted-foreground mt-3">Ngày cấp: {preview.issuedDate}</p>}
                {preview.certNumber && <p className="text-[12px] font-mono text-muted-foreground">Số: {preview.certNumber}</p>}
              </div>
              {preview.downloadable && (
                <button onClick={() => { toast.success("Đang tải xuống..."); setPreview(null); }} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold text-[14px] transition-colors">
                  <Download className="w-4 h-4" /> Tải xuống PDF
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

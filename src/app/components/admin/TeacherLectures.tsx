import { useDocumentTitle } from "../../utils/hooks";
import { useState, useMemo, useRef, useCallback } from "react";
import { Plus, Search, Upload, Download, Eye, Trash2, FileText, File, Video, Link2, X, FolderOpen, Clock, Tag, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../auth/AuthContext";
import { useAppData } from "../../context/AppDataContext";

type FileType = "pdf" | "doc" | "pptx" | "video" | "link";
type MaterialStatus = "draft" | "published";

interface Lecture {
  id: string;
  title: string;
  course: string;
  unit: string;
  fileType: FileType;
  fileSize: string;
  status: MaterialStatus;
  uploadedAt: string;
  downloads: number;
  description: string;
  tags: string[];
}

const fileTypeCfg: Record<FileType, { icon: React.ElementType; bg: string; color: string; label: string }> = {
  pdf:   { icon: FileText, bg: "bg-rose-100 dark:bg-rose-500/20",    color: "text-rose-600",   label: "PDF"  },
  doc:   { icon: FileText, bg: "bg-blue-100 dark:bg-blue-500/20",    color: "text-blue-600",   label: "Word" },
  pptx:  { icon: File,     bg: "bg-amber-100 dark:bg-amber-500/20",  color: "text-amber-600",  label: "PPT"  },
  video: { icon: Video,    bg: "bg-violet-100 dark:bg-violet-500/20",color: "text-violet-600", label: "Video"},
  link:  { icon: Link2,    bg: "bg-cyan-100 dark:bg-cyan-500/20",    color: "text-cyan-600",   label: "Link" },
};


function detectFileType(file: File): FileType {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "pdf";
  if (ext === "doc" || ext === "docx") return "doc";
  if (ext === "ppt" || ext === "pptx") return "pptx";
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext)) return "video";
  return "pdf";
}

function fmtBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function TeacherLectures() {
  useDocumentTitle("Bài giảng & Tài liệu");
  const { user } = useAuth();
  const { getLecturesByTeacherId, addLecture, deleteLecture } = useAppData();

  const storeLectures = getLecturesByTeacherId(user?.id ?? "teacher-001");
  // Map AppLecture → local Lecture (add status/uploadedAt from store fields)
  const lectures: Lecture[] = storeLectures.map(l => ({
    id: l.id,
    title: l.title,
    course: l.course,
    unit: l.unit,
    fileType: l.fileType as FileType,
    fileSize: l.fileSize,
    status: "published" as MaterialStatus,
    uploadedAt: l.uploadDate,
    downloads: l.downloads,
    description: l.description,
    tags: l.tags,
  }));

  const courses = useMemo(() => [...new Set(lectures.map(l => l.course))], [lectures]);

  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState<string>("all");
  const [filterType, setFilterType] = useState<FileType | "all">("all");
  const [preview, setPreview] = useState<Lecture | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadForm, setUploadForm] = useState({ title: "", course: "Tiếng Anh B1 VSTEP", unit: "", description: "", tags: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setUploadForm(prev => ({
      ...prev,
      title: prev.title || file.name.replace(/\.[^.]+$/, ""),
    }));
  }, []);

  const handleDropAreaClick = useCallback(() => fileInputRef.current?.click(), []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadForm(prev => ({ ...prev, title: prev.title || file.name.replace(/\.[^.]+$/, "") }));
    }
  }, []);

  const handleSubmitUpload = useCallback(() => {
    if (!selectedFile && !uploadForm.title) {
      toast.error("Vui lòng chọn file hoặc nhập tên tài liệu");
      return;
    }
    const fileType = selectedFile ? detectFileType(selectedFile) : "link";
    const fileSize = selectedFile ? fmtBytes(selectedFile.size) : "—";
    addLecture({
      teacherId: user?.id ?? "teacher-001",
      title: uploadForm.title || (selectedFile?.name.replace(/\.[^.]+$/, "") ?? "Tài liệu mới"),
      course: uploadForm.course || "Tiếng Anh B1 VSTEP",
      unit: uploadForm.unit || "General",
      fileType,
      fileSize,
      uploadDate: new Date().toLocaleDateString("vi-VN"),
      downloads: 0,
      views: 0,
      description: uploadForm.description,
      tags: uploadForm.tags.split(",").map(t => t.trim()).filter(Boolean),
    });
    setShowUpload(false);
    setSelectedFile(null);
    setUploadForm({ title: "", course: "Tiếng Anh B1 VSTEP", unit: "", description: "", tags: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.success("Đã thêm tài liệu vào danh sách!");
  }, [selectedFile, uploadForm, addLecture, user]);

  const filtered = useMemo(() =>
    lectures.filter(l =>
      (filterCourse === "all" || l.course === filterCourse) &&
      (filterType === "all" || l.fileType === filterType) &&
      (!search || l.title.toLowerCase().includes(search.toLowerCase()))
    ), [lectures, filterCourse, filterType, search]);

  const handleDelete = (id: string) => {
    deleteLecture(id);
    toast.success("Đã xóa tài liệu");
    if (preview?.id === id) setPreview(null);
  };

  const handlePublish = (id: string) => {
    setLectures(prev => prev.map(l => l.id === id ? { ...l, status: "published" as MaterialStatus } : l));
    toast.success("Đã phát hành tài liệu cho học viên");
  };

  const published = lectures.filter(l => l.status === "published").length;
  const totalDownloads = lectures.reduce((s, l) => s + l.downloads, 0);

  return (
    <div className="pb-10">
      <div className="relative mb-6 p-6 rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-600 to-green-700 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: "28px 28px" }} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-emerald-200 text-[13px] font-semibold mb-1 uppercase">Cổng Giáo viên</p>
            <h1 className="text-[24px] font-extrabold">Bài giảng & Tài liệu</h1>
            <p className="text-emerald-100/70 text-[14px] mt-1">Quản lý và chia sẻ tài liệu giảng dạy cho học viên</p>
          </div>
          <button onClick={() => setShowUpload(true)} className="flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl text-[14px] font-semibold transition-colors">
            <Upload className="w-4 h-4" /> Tải lên tài liệu
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Tổng tài liệu", value: lectures.length, color: "text-emerald-600" },
          { label: "Đã phát hành", value: published, color: "text-blue-600" },
          { label: "Bản nháp", value: lectures.length - published, color: "text-amber-600" },
          { label: "Lượt tải", value: totalDownloads, color: "text-violet-600" },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-4 text-center">
            <p className={`text-[26px] font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm tài liệu..." className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-card text-[14px] outline-none" />
        </div>
        <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)} className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-card text-[14px] outline-none">
          <option value="all">Tất cả khóa học</option>
          {courses.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value as typeof filterType)} className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-white dark:bg-card text-[14px] outline-none">
          <option value="all">Tất cả loại</option>
          {(Object.entries(fileTypeCfg) as [FileType, typeof fileTypeCfg[FileType]][]).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(l => {
          const ft = fileTypeCfg[l.fileType];
          const Icon = ft.icon;
          return (
            <div key={l.id} className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${ft.bg}`}>
                  <Icon className={`w-5 h-5 ${ft.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${ft.bg} ${ft.color}`}>{ft.label}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${l.status === "published" ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400" : "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400"}`}>
                      {l.status === "published" ? "Đã phát hành" : "Nháp"}
                    </span>
                  </div>
                  <h4 className="font-semibold text-[14px] text-[#1a1a2e] dark:text-foreground truncate">{l.title}</h4>
                  <p className="text-[12px] text-muted-foreground">{l.course} • {l.unit}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 text-[12px] text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{l.uploadedAt}</span>
                {l.fileSize !== "—" && <span><FolderOpen className="w-3.5 h-3.5 inline mr-1" />{l.fileSize}</span>}
                <span><Download className="w-3.5 h-3.5 inline mr-1" />{l.downloads} lượt</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {l.tags.map(t => <span key={t} className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-white/10 text-muted-foreground rounded-full">{t}</span>)}
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50 dark:border-white/[0.03]">
                <button onClick={() => setPreview(l)} className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-border text-[13px] font-semibold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/5 flex items-center justify-center gap-1 transition-colors">
                  <Eye className="w-3.5 h-3.5" /> Xem
                </button>
                {l.status === "draft" && (
                  <button onClick={() => handlePublish(l.id)} className="flex-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-semibold flex items-center justify-center gap-1 transition-colors">
                    Phát hành
                  </button>
                )}
                <button className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-border text-[13px] font-semibold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/5 flex items-center justify-center gap-1 transition-colors">
                  <Download className="w-3.5 h-3.5" /> Tải
                </button>
                <button onClick={() => handleDelete(l.id)} className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center">
          <FileText className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground">Không tìm thấy tài liệu nào</p>
        </div>
      )}

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="bg-white dark:bg-card rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[16px]">Chi tiết tài liệu</h3>
              <button onClick={() => setPreview(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"><X className="w-4 h-4" /></button>
            </div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${fileTypeCfg[preview.fileType].bg}`}>
              {(() => { const I = fileTypeCfg[preview.fileType].icon; return <I className={`w-7 h-7 ${fileTypeCfg[preview.fileType].color}`} />; })()}
            </div>
            <h4 className="font-bold text-[16px] mb-1">{preview.title}</h4>
            <p className="text-[13px] text-muted-foreground mb-3">{preview.course} · {preview.unit}</p>
            <p className="text-[13px] mb-4 leading-relaxed">{preview.description}</p>
            <div className="space-y-2 text-[13px]">
              <div className="flex justify-between"><span className="text-muted-foreground">Loại file</span><span className="font-semibold">{fileTypeCfg[preview.fileType].label}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Kích thước</span><span className="font-semibold">{preview.fileSize}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tải lên</span><span className="font-semibold">{preview.uploadedAt}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Lượt tải</span><span className="font-semibold">{preview.downloads}</span></div>
            </div>
            <div className="flex flex-wrap gap-1 mt-3">
              {preview.tags.map(t => <span key={t} className="text-[11px] px-2 py-0.5 bg-gray-100 dark:bg-white/10 rounded-full">{t}</span>)}
            </div>
            <button onClick={() => { toast.success("Đang tải xuống..."); setPreview(null); }} className="mt-5 w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-[14px] flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Tải xuống
            </button>
          </div>
        </div>
      )}

      {/* Upload modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => { setShowUpload(false); setSelectedFile(null); }}>
          <div className="bg-white dark:bg-card rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[18px]">Tải lên tài liệu mới</h3>
              <button onClick={() => { setShowUpload(false); setSelectedFile(null); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"><X className="w-4 h-4" /></button>
            </div>
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mov,.avi,.mkv,.webm"
              className="hidden"
              onChange={handleFileChange}
            />
            {/* Drop area */}
            <div
              onClick={handleDropAreaClick}
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center mb-4 cursor-pointer transition-colors ${selectedFile ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10" : "border-gray-200 dark:border-border hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5"}`}
            >
              {selectedFile ? (
                <>
                  <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="text-[14px] font-bold text-emerald-700 dark:text-emerald-400 truncate">{selectedFile.name}</p>
                  <p className="text-[12px] text-emerald-600/80 mt-0.5">{fmtBytes(selectedFile.size)}</p>
                  <button onClick={e => { e.stopPropagation(); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="mt-2 text-[12px] text-rose-500 underline">Xóa file</button>
                </>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-[14px] font-semibold text-muted-foreground">Kéo thả hoặc click để chọn file</p>
                  <p className="text-[12px] text-muted-foreground/60 mt-1">PDF, Word, PPT, Video — Tối đa 500MB</p>
                </>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[13px] font-semibold mb-1">Tên tài liệu <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={e => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none focus:border-emerald-400"
                  placeholder="Nhập tên tài liệu..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-semibold mb-1">Khóa học</label>
                  <select
                    value={uploadForm.course}
                    onChange={e => setUploadForm(prev => ({ ...prev, course: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none"
                  >
                    {courses.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold mb-1">Bài / Unit</label>
                  <input
                    type="text"
                    value={uploadForm.unit}
                    onChange={e => setUploadForm(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none focus:border-emerald-400"
                    placeholder="VD: Unit 3"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-semibold mb-1">Thẻ tags <span className="text-muted-foreground font-normal">(cách nhau bởi dấu phẩy)</span></label>
                <input
                  type="text"
                  value={uploadForm.tags}
                  onChange={e => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none focus:border-emerald-400"
                  placeholder="VD: Grammar, Unit 3, Exercise"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold mb-1">Mô tả ngắn</label>
                <textarea
                  rows={2}
                  value={uploadForm.description}
                  onChange={e => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-background text-[14px] outline-none resize-none focus:border-emerald-400"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setShowUpload(false); setSelectedFile(null); }} className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-border rounded-xl text-[14px] font-semibold hover:bg-gray-50">Hủy</button>
              <button onClick={handleSubmitUpload} className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[14px] font-semibold flex items-center justify-center gap-2">
                <Upload className="w-4 h-4"/> Lưu tài liệu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

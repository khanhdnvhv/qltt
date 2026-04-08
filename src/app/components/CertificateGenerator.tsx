import { useState, useRef } from "react";
import { motion } from "motion/react";
import {
  Download, Printer, Award, Star, Calendar, BookOpen,
  CheckCircle, Share2, X,
} from "lucide-react";
import { toast } from "sonner";

interface CertificateData {
  studentName: string;
  courseName: string;
  completionDate: string;
  bandScore: string;
  instructorName: string;
  totalHours: number;
  certificateId: string;
}

interface Props {
  data: CertificateData;
  onClose: () => void;
}

export function CertificateGenerator({ data, onClose }: Props) {
  const certRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePrint = () => {
    window.print();
    toast.success("Dang mo trang in...");
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    await new Promise((r) => setTimeout(r, 800));
    // In real app, would use html2canvas + jsPDF
    toast.success("Da tai chung chi thanh cong!");
    setIsDownloading(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Chung chi GDNN-GDTX - ${data.courseName}`,
        text: `${data.studentName} da hoan thanh khoa hoc ${data.courseName} voi band ${data.bandScore}!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(
        `${data.studentName} da hoan thanh khoa hoc ${data.courseName} voi band ${data.bandScore} tai GDNN-GDTX!`
      );
      toast.success("Da sao chep lien ket!");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.3 }}
        className="bg-white dark:bg-card rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-auto"
      >
        {/* Header actions */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-border sticky top-0 bg-white dark:bg-card z-10">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            <h2 className="text-[16px] text-[#1a1a2e] dark:text-foreground" style={{ fontWeight: 700 }}>Chung chi hoan thanh</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[15px] bg-[#f4f5f7] dark:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
              style={{ fontWeight: 600 }}
            >
              <Share2 className="w-3.5 h-3.5" /> Chia se
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[15px] bg-[#f4f5f7] dark:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
              style={{ fontWeight: 600 }}
            >
              <Printer className="w-3.5 h-3.5" /> In
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[15px] bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
              style={{ fontWeight: 600 }}
            >
              <Download className="w-3.5 h-3.5" /> {isDownloading ? "Dang tai..." : "Tai xuong"}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Certificate preview */}
        <div className="p-6">
          <div
            ref={certRef}
            className="relative bg-white border-2 border-[#c9a94e] rounded-xl p-8 sm:p-12 text-center print-break-inside-avoid"
            style={{ aspectRatio: "1.414/1" }}
          >
            {/* Decorative corners */}
            <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-[#c9a94e] rounded-tl-lg" />
            <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-[#c9a94e] rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-[#c9a94e] rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-[#c9a94e] rounded-br-lg" />

            {/* Inner border */}
            <div className="absolute inset-8 border border-[#c9a94e]/30 rounded-lg pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full gap-3 sm:gap-5">
              {/* Logo & brand */}
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-[16px] sm:text-[20px] text-[#1a1a2e]" style={{ fontWeight: 800 }}>
                  IELTS<span className="text-primary">Pro</span>
                </span>
              </div>

              {/* Title */}
              <div>
                <p className="text-[16px] sm:text-[16px] tracking-[0.3em] text-[#c9a94e] uppercase mb-1" style={{ fontWeight: 600 }}>
                  Chung nhan
                </p>
                <h1 className="text-[22px] sm:text-[32px] text-[#1a1a2e]" style={{ fontWeight: 800 }}>
                  HOAN THANH KHOA HOC
                </h1>
              </div>

              {/* Decorative line */}
              <div className="flex items-center gap-3 w-48">
                <div className="flex-1 h-px bg-[#c9a94e]" />
                <Star className="w-4 h-4 text-[#c9a94e] fill-[#c9a94e]" />
                <div className="flex-1 h-px bg-[#c9a94e]" />
              </div>

              {/* Description */}
              <p className="text-[15px] sm:text-[15px] text-muted-foreground">Chung nhan rang</p>

              {/* Student name */}
              <h2
                className="text-[24px] sm:text-[36px] text-primary"
                style={{ fontWeight: 800, fontStyle: "italic" }}
              >
                {data.studentName}
              </h2>

              <p className="text-[15px] sm:text-[15px] text-muted-foreground max-w-md leading-relaxed">
                da hoan thanh xuat sac khoa hoc <span className="text-[#1a1a2e]" style={{ fontWeight: 700 }}>{data.courseName}</span> voi tong thoi luong <span className="text-[#1a1a2e]" style={{ fontWeight: 700 }}>{data.totalHours} gio</span> va dat band
              </p>

              {/* Band score */}
              <div className="flex items-center gap-2">
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#c9a94e] to-[#d4af37] flex items-center justify-center shadow-lg shadow-[#c9a94e]/30">
                  <span className="text-[20px] sm:text-[28px] text-white" style={{ fontWeight: 800 }}>
                    {data.bandScore}
                  </span>
                </div>
              </div>

              {/* Decorative line */}
              <div className="flex items-center gap-3 w-48">
                <div className="flex-1 h-px bg-[#c9a94e]/40" />
                <CheckCircle className="w-3.5 h-3.5 text-[#c9a94e]" />
                <div className="flex-1 h-px bg-[#c9a94e]/40" />
              </div>

              {/* Footer info */}
              <div className="flex items-center justify-center gap-6 sm:gap-12 mt-1">
                <div className="text-center">
                  <p className="text-[16px] sm:text-[15px] text-[#1a1a2e]" style={{ fontWeight: 700 }}>{data.instructorName}</p>
                  <div className="h-px w-24 bg-[#1a1a2e]/20 my-1 mx-auto" />
                  <p className="text-[9px] sm:text-[16px] text-muted-foreground">Giang vien</p>
                </div>
                <div className="text-center">
                  <p className="text-[16px] sm:text-[15px] text-[#1a1a2e]" style={{ fontWeight: 700 }}>{data.completionDate}</p>
                  <div className="h-px w-24 bg-[#1a1a2e]/20 my-1 mx-auto" />
                  <p className="text-[9px] sm:text-[16px] text-muted-foreground">Ngay cap</p>
                </div>
              </div>

              {/* Certificate ID */}
              <p className="text-[8px] text-muted-foreground/50 mt-1">
                Ma chung chi: {data.certificateId}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}


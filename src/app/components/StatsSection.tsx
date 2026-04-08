import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { Building2, Users, Award, FileCheck } from "lucide-react";

const stats = [
  {
    icon: Building2,
    value: 112,
    suffix: "+",
    label: "Trung tâm đang vận hành",
    sub: "GDNN · GDTX · Ngoại ngữ · Tin học",
    color: "#dc2f3c",
  },
  {
    icon: Users,
    value: 45847,
    suffix: "+",
    label: "Học viên đang quản lý",
    sub: "Trên toàn bộ các đơn vị",
    color: "#f26522",
  },
  {
    icon: Award,
    value: 12450,
    suffix: "+",
    label: "Chứng chỉ đã cấp phát",
    sub: "Nghề · Ngoại ngữ · Tin học",
    color: "#3b82f6",
  },
  {
    icon: FileCheck,
    value: 100,
    suffix: "%",
    label: "Quy trình số hóa",
    sub: "Không còn thủ tục giấy tờ",
    color: "#10b981",
  },
];

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const motionVal = useMotionValue(0);
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const controls = animate(motionVal, value, {
      duration: 2,
      ease: "easeOut",
      onUpdate: (v) => {
        if (value >= 1000) {
          setDisplay(Math.floor(v).toLocaleString("vi-VN"));
        } else {
          setDisplay(Math.floor(v).toString());
        }
      },
    });
    return controls.stop;
  }, [inView, value, motionVal]);

  return (
    <span ref={ref}>
      {display}{suffix}
    </span>
  );
}

export function StatsSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-6 bg-[#0d0f1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="relative rounded-2xl lg:rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
            border: "1px solid rgba(255,255,255,0.07)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Glow accents */}
          <div className="absolute top-0 left-1/4 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

          <div className="relative grid grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`relative text-center px-6 py-10 ${i < stats.length - 1 ? "lg:border-r border-white/[0.07]" : ""} ${i < 2 ? "border-b lg:border-b-0 border-white/[0.07]" : ""}`}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                  style={{
                    background: `${stat.color}20`,
                    border: `1px solid ${stat.color}30`,
                  }}
                >
                  <stat.icon className="w-5.5 h-5.5" style={{ color: stat.color }} />
                </div>
                <p
                  className="text-[32px] lg:text-[38px] tracking-tight mb-1 tabular-nums"
                  style={{ fontWeight: 800, color: stat.color }}
                >
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-white/75 text-[14.5px] mb-1" style={{ fontWeight: 600 }}>
                  {stat.label}
                </p>
                <p className="text-white/30 text-[12.5px]">{stat.sub}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

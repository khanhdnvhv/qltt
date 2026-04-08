import { motion } from "motion/react";
import { Star, Award } from "lucide-react";
import { LazyImage } from "./ui/LazyImage";

const teachers = [
  {
    id: 1,
    name: "Nguyễn Minh Anh",
    role: "Speaking & Writing",
    band: "8.5",
    exp: "7 năm",
    students: "3,000+",
    image: "https://images.unsplash.com/photo-1667035533110-7964092f44a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGFzaWFuJTIwd29tYW4lMjB0ZWFjaGVyJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzczNDIyNDIzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    specialties: ["Speaking", "Writing"],
  },
  {
    id: 2,
    name: "Trần Đức Hùng",
    role: "Listening & Reading",
    band: "8.0",
    exp: "5 năm",
    students: "2,500+",
    image: "https://images.unsplash.com/photo-1511629091441-ee46146481b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMG1hbiUyMHByb2Zlc3Npb25hbCUyMHRlYWNoZXJ8ZW58MXx8fHwxNzczNDgyMzg2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    specialties: ["Listening", "Reading"],
  },
  {
    id: 3,
    name: "Phạm Thu Hà",
    role: "IELTS tổng hợp",
    band: "8.5",
    exp: "8 năm",
    students: "4,000+",
    image: "https://images.unsplash.com/photo-1758600587839-56ba05596c69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGFzaWFuJTIwd29tYW4lMjBwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdHxlbnwxfHx8fDE3NzM0NzE3MTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    specialties: ["Writing", "Reading", "Grammar"],
  },
  {
    id: 4,
    name: "Lê Hoàng Nam",
    role: "IELTS Speaking",
    band: "9.0",
    exp: "10 năm",
    students: "5,000+",
    image: "https://images.unsplash.com/photo-1700954343841-2134b33d569d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMG1hbiUyMGJ1c2luZXNzJTIwcG9ydHJhaXQlMjBzbWlsZXxlbnwxfHx8fDE3NzM0ODIzOTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    specialties: ["Speaking", "Pronunciation"],
  },
];

export function TeachersSection() {
  return (
    <section className="py-20 lg:py-28 bg-white dark:bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 bg-blue-500/[0.06] text-blue-600 px-4 py-2 rounded-full text-[16px] mb-5 border border-blue-500/10" style={{ fontWeight: 600 }}>
            <Award className="w-3.5 h-3.5" />
            Đội ngũ giảng viên
          </span>
          <h2 className="text-[26px] lg:text-[36px] text-[#1a1a2e] dark:text-foreground mb-4 tracking-tight" style={{ fontWeight: 800 }}>
            Giảng viên <span className="text-primary">tâm huyết</span>
          </h2>
          <p className="text-muted-foreground text-[15px] max-w-xl mx-auto leading-relaxed">
            100% giảng viên đạt IELTS 8.0+, tốt nghiệp các trường đại học uy tín trong và ngoài nước
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {teachers.map((teacher, index) => (
            <motion.div
              key={teacher.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="group text-center bg-white dark:bg-card rounded-2xl border border-gray-100/80 dark:border-border overflow-hidden hover:shadow-xl hover:shadow-black/[0.06] dark:hover:shadow-black/30 transition-all duration-300 hover:-translate-y-1 hover-lift"
            >
              <div className="relative overflow-hidden">
                <LazyImage
                  src={teacher.image}
                  alt={teacher.name}
                  className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-500"
                  wrapperClassName="w-full h-60"
                  dominantColor="#1a1a2e20"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e]/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="bg-white/95 backdrop-blur-sm text-[#1a1a2e] px-3 py-1 rounded-lg text-[11.5px] shadow-sm" style={{ fontWeight: 700 }}>
                    IELTS {teacher.band}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-[15.5px] mb-1 text-[#1a1a2e]" style={{ fontWeight: 700 }}>{teacher.name}</h3>
                <p className="text-muted-foreground text-[16px] mb-3">Giảng viên {teacher.role}</p>
                <div className="flex flex-wrap justify-center gap-1.5 mb-3">
                  {teacher.specialties.map((s) => (
                    <span key={s} className="bg-primary/[0.06] text-primary px-2.5 py-0.5 rounded-full text-[10.5px] border border-primary/10" style={{ fontWeight: 600 }}>
                      {s}
                    </span>
                  ))}
                </div>
                <div className="flex justify-center gap-4 text-[11.5px] text-muted-foreground">
                  <span>{teacher.exp} KN</span>
                  <span className="w-px h-3.5 bg-gray-200 self-center" />
                  <span>{teacher.students} HV</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

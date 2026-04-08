import { Link } from "react-router";
import { Phone, Mail, MapPin, Facebook, Youtube, MessageCircle } from "lucide-react";

const footerLinks = {
  system: [
    { label: "Phân hệ Sở GD&ĐT", href: "/login" },
    { label: "Phân hệ Trung tâm", href: "/login" },
    { label: "Cổng Giáo viên", href: "/login" },
    { label: "Cổng Học viên", href: "/login" },
  ],
  features: [
    { label: "Quản lý học viên", href: "/#tinh-nang" },
    { label: "Phê duyệt kế hoạch", href: "/#quy-trinh" },
    { label: "Quản lý thi & chứng chỉ", href: "/#tinh-nang" },
    { label: "Báo cáo & Thống kê", href: "/#tinh-nang" },
  ],
  support: [
    { label: "Hướng dẫn sử dụng", href: "#" },
    { label: "Câu hỏi thường gặp", href: "#" },
    { label: "Liên hệ hỗ trợ", href: "#lien-he" },
    { label: "Chính sách bảo mật", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer id="lien-he" className="bg-[#111122] text-white" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Main footer */}
        <div className="py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-[#f26522] rounded-xl flex items-center justify-center text-white text-[12px]" style={{ fontWeight: 800 }}>
                EDU
              </div>
              <div>
                <div>
                  <span className="text-white text-[17px]" style={{ fontWeight: 800 }}>GDNN·GDTX</span>
                </div>
                <p className="text-white/35 text-[11px]">Ngoại ngữ · Tin học · Đào tạo nghề</p>
              </div>
            </div>
            <p className="text-white/40 text-[14px] mb-6 leading-relaxed">
              Nền tảng số hóa toàn diện quản lý các trung tâm <strong className="text-white/55">GDNN · GDTX · Ngoại ngữ · Tin học</strong> — từ tuyển sinh đến cấp chứng chỉ.
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-white/40 text-[13.5px]">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <span>Hỗ trợ kỹ thuật: 1900 xxxx</span>
              </div>
              <div className="flex items-center gap-2.5 text-white/40 text-[13.5px]">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span>support@gdnn-gdtx.vn</span>
              </div>
              <div className="flex items-start gap-2.5 text-white/40 text-[13.5px]">
                <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>Dành cho các tỉnh/thành triển khai hệ thống</span>
              </div>
            </div>
            <div className="flex gap-2.5 mt-5">
              {[
                { icon: Facebook, label: "Facebook" },
                { icon: Youtube, label: "Youtube" },
                { icon: MessageCircle, label: "Zalo" },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  aria-label={social.label}
                  className="w-9 h-9 bg-white/[0.06] rounded-lg flex items-center justify-center hover:bg-primary/80 transition-all duration-200"
                >
                  <social.icon className="w-4 h-4 text-white/50" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white text-[15px] mb-5" style={{ fontWeight: 700 }}>Phân hệ hệ thống</h4>
            <ul className="space-y-3">
              {footerLinks.system.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-white/40 text-[14px] hover:text-white/80 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white text-[15px] mb-5" style={{ fontWeight: 700 }}>Tính năng nổi bật</h4>
            <ul className="space-y-3">
              {footerLinks.features.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-white/40 text-[14px] hover:text-white/80 transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white text-[15px] mb-5" style={{ fontWeight: 700 }}>Hỗ trợ</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-white/40 text-[14px] hover:text-white/80 transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.06] py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px] text-white/25">
          <p>© 2026 GDNN-GDTX Portal. Bản quyền thuộc về đơn vị phát triển.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-white/50 transition-colors">Điều khoản sử dụng</a>
            <a href="#" className="hover:text-white/50 transition-colors">Bảo mật</a>
            <a href="#" className="hover:text-white/50 transition-colors">Cookie</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

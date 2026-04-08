import { useState } from "react";
import { Save, Settings, Mail, ShieldAlert, Database, HardDrive, Bell, Globe, UploadCloud } from "lucide-react";
import { toast } from "sonner";

export function SystemConfig() {
  const [activeTab, setActiveTab] = useState("general");

  const submitConfig = () => {
     toast.success("Đã ghi đè Tham số Cấu hình Hệ thống GDNN-GDTX thành công!");
  };

  return (
    <div className="flex-1 pb-10">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
        <div>
           <h1 className="text-[26px] font-black text-[#1a1a2e] dark:text-foreground tracking-tight">Cấu hình Cổng Thông Tin GDNN-GDTX</h1>
           <p className="text-[15px] text-muted-foreground mt-1">Điều khiển các tham số Vĩ mô, Giới hạn hệ thống và Tên miền Sở Giáo Dục Toàn tỉnh.</p>
        </div>
        <button onClick={submitConfig} className="flex items-center gap-2.5 bg-primary text-white px-8 py-3 rounded-2xl text-[15px] shadow-lg shadow-primary/30 hover:scale-105 transition-all font-black self-start">
           <Save className="w-5 h-5"/> LƯU THIẾT LẬP
        </button>
      </div>

      <div className="flex gap-8">
         {/* Sidebar Menu Config */}
         <div className="w-[260px] shrink-0">
             <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-3xl p-3 flex flex-col gap-2 sticky top-5 shadow-sm">
                {[
                  { id: "general", icon: Globe, label: "Tên miền & Hiển thị" },
                  { id: "business", icon: Settings, label: "Tham số Nghiệp vụ" },
                  { id: "mail", icon: Mail, label: "Cổng SMTP Email" },
                  { id: "storage", icon: HardDrive, label: "Dung lượng Lưu trữ" },
                  { id: "backup", icon: Database, label: "Sao lưu Dữ liệu" },
                  { id: "security", icon: ShieldAlert, label: "Bảo mật & Tường lửa" },
                ].map((item) => (
                   <button 
                     key={item.id} 
                     onClick={() => setActiveTab(item.id)}
                     className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[15px] font-bold transition-all ${activeTab === item.id ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                   >
                     <item.icon className="w-5 h-5"/> {item.label}
                   </button>
                ))}
             </div>
         </div>

         {/* Content Area */}
         <div className="flex-1 space-y-6">
            {activeTab === "general" && (
                <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-3xl p-8 shadow-sm">
                   <h2 className="text-[18px] font-black text-[#1a1a2e] dark:text-foreground mb-6 flex items-center gap-2"><Globe className="w-5 h-5 text-blue-500"/> Trực quan Hiển thị Portal</h2>
                   
                   <div className="space-y-6">
                      <div>
                         <label className="block text-[14.5px] font-bold text-[#1a1a2e] dark:text-gray-200 mb-2">Tên Hệ thống phân giải Tỉnh</label>
                         <input defaultValue="Cổng Thông tin Điện tử Kế hoạch GDNN-GDTX Toàn tỉnh" className="w-full bg-[#f4f5f7] dark:bg-black/20 border border-transparent focus:border-primary px-5 py-3.5 rounded-2xl text-[15px] font-bold outline-none" />
                      </div>
                      <div>
                         <label className="block text-[14.5px] font-bold text-[#1a1a2e] dark:text-gray-200 mb-2">Tên tắt (Mã Hệ thống)</label>
                         <input defaultValue="PORTAL-GDNN-GDTX" className="w-full bg-[#f4f5f7] dark:bg-black/20 border border-transparent focus:border-primary px-5 py-3.5 rounded-2xl text-[15px] font-bold outline-none" />
                      </div>
                      <div>
                         <label className="block text-[14.5px] font-bold text-[#1a1a2e] dark:text-gray-200 mb-2">Quốc huy / Logo chuẩn Sở Giáo Dục</label>
                         <div className="border-2 border-dashed border-gray-300 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3"><UploadCloud className="w-8 h-8"/></div>
                            <p className="font-bold text-[15px]">Kéo thả file .PNG / .SVG Logo vào đây</p>
                            <p className="text-[13px] text-muted-foreground mt-1">Đề xuất tỉ lệ 1:1, dung lượng tối đa 10MB</p>
                         </div>
                      </div>
                   </div>
                </div>
            )}

            {activeTab === "business" && (
                <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-3xl p-8 shadow-sm">
                   <h2 className="text-[18px] font-black text-[#1a1a2e] dark:text-foreground mb-6 flex items-center gap-2"><Settings className="w-5 h-5 text-indigo-500"/> Các Tham số Vận hành Nghiệp vụ</h2>
                   
                   <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                         <div>
                            <label className="block text-[14.5px] font-bold text-[#1a1a2e] dark:text-gray-200 mb-2">Số HV tối đa trên 1 Lớp (Cảnh báo đỏ)</label>
                            <input type="number" defaultValue={45} className="w-full bg-[#f4f5f7] dark:bg-black/20 border border-transparent focus:border-primary px-5 py-3.5 rounded-2xl text-[15px] font-bold outline-none" />
                         </div>
                         <div>
                            <label className="block text-[14.5px] font-bold text-[#1a1a2e] dark:text-gray-200 mb-2">Sĩ số Tối thiểu Mở lớp (Cảnh báo vàng)</label>
                            <input type="number" defaultValue={15} className="w-full bg-[#f4f5f7] dark:bg-black/20 border border-transparent focus:border-primary px-5 py-3.5 rounded-2xl text-[15px] font-bold outline-none" />
                         </div>
                      </div>
                      
                      <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 flex items-center justify-between">
                         <div>
                            <p className="text-[15px] font-bold text-[#1a1a2e] dark:text-foreground">Tự động Khóa sổ Báo cáo tháng (Freeze Data)</p>
                            <p className="text-[13px] text-muted-foreground mt-0.5">Không cho phép TT Sửa dữ liệu ngày mùng 5 hàng tháng</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-black/40 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                         </label>
                      </div>

                      <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 flex items-center justify-between">
                         <div>
                            <p className="text-[15px] font-bold text-[#1a1a2e] dark:text-foreground">Yêu cầu chữ ký điện tử Kế hoạch Đào tạo</p>
                            <p className="text-[13px] text-muted-foreground mt-0.5">Bắt buộc khi Trung tâm đệ trình lên Sở</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-black/40 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                         </label>
                      </div>
                   </div>
                </div>
            )}

            {(activeTab !== "general" && activeTab !== "business") && (
                <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-3xl p-16 shadow-sm flex flex-col items-center justify-center text-center">
                   <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 text-gray-400 rounded-full flex items-center justify-center mb-4">
                      <Settings className="w-10 h-10 animate-spin-slow" />
                   </div>
                   <h2 className="text-[20px] font-black text-[#1a1a2e] dark:text-foreground">Mô đun Cấu hình đang bảo trì</h2>
                   <p className="text-[15px] text-muted-foreground mt-2 max-w-md">Khu vực cấu hình sâu cho Server Database, SMTP Relay, Backup AWS S3 Storage đang hạn chế mở trên trình duyệt WEB. Vui lòng liên hệ IT Quản trị qua SSH Terminal.</p>
                </div>
            )}
         </div>
      </div>
    </div>
  )
}

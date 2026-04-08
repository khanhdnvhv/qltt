const fs = require('fs');
const path = require('path');

const fileNames = [
  'src/app/components/admin/AdminUsers.tsx',
  'src/app/components/admin/AdminTeachers.tsx'
];

const replacements = [
  [/Quan ly nguoi dung/g, "Quản lý người dùng"],
  [/Quan ly giang vien/g, "Quản lý giảng viên"],
  [/nguoi dung/g, "người dùng"],
  [/Nguoi dung/g, "Người dùng"],
  [/Xuat CSV/g, "Xuất CSV"],
  [/Them nguoi dung/g, "Thêm người dùng"],
  [/Them giang vien/g, "Thêm giảng viên"],
  [/Tim kiem theo ten/g, "Tìm kiếm theo tên"],
  [/Tim kiem giang vien/g, "Tìm kiếm giảng viên"],
  [/Tat ca vai tro/g, "Tất cả vai trò"],
  [/Tat ca trang thai/g, "Tất cả trạng thái"],
  [/Tat ca/g, "Tất cả"],
  [/Vai tro/g, "Vai trò"],
  [/vai tro/g, "vai trò"],
  [/Trang thai/g, "Trạng thái"],
  [/trang thai/g, "trạng thái"],
  [/Hoat dong/g, "Hoạt động"],
  [/Hoc vien/g, "Học viên"],
  [/hoc vien/g, "học viên"],
  [/Giang vien/g, "Giảng viên"],
  [/giang vien/g, "giảng viên"],
  [/Khong HD/g, "Không HĐ"],
  [/Khoa hoc/g, "Khóa học"],
  [/khoa hoc/g, "khóa học"],
  [/Xoa/g, "Xóa"],
  [/he thong/g, "hệ thống"],
  [/Da xuat/g, "Đã xuất"],
  [/Da gui/g, "Đã gửi"],
  [/Da chan/g, "Đã chặn"],
  [/Da cap nhat/g, "Đã cập nhật"],
  [/Da them/g, "Đã thêm"],
  [/Dang xuat/g, "Đăng xuất"],
  [/Chinh sua/g, "Chỉnh sửa"],
  [/Thanh cong/g, "Thành công"],
  [/Hanh dong/g, "Hành động"],
  [/Ban co chac chan/g, "Bạn có chắc chắn"],
  [/khong the hoan tac/g, "không thể hoàn tác"],
  [/dong y/g, "đồng ý"],
  [/Huy/g, "Hủy"],
  [/Thach thuc/g, "Thách thức"],
  [/Chi tiet/g, "Chi tiết"],
  [/Tong quan/g, "Tổng quan"],
  [/Danh gia/g, "Đánh giá"],
  [/thang truoc/g, "tháng trước"],
  [/Ngay tham gia/g, "Ngày tham gia"],
  [/phut truoc/g, "phút trước"],
  [/gio truoc/g, "giờ trước"],
  [/ngay truoc/g, "ngày trước"],
  [/tuan truoc/g, "tuần trước"]
];

for (const fn of fileNames) {
  const fullPath = path.resolve(__dirname, fn);
  let content = fs.readFileSync(fullPath, 'utf8');
  for (const [regex, replacement] of replacements) {
    content = content.replace(regex, replacement);
  }
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Translated ${fn}`);
}

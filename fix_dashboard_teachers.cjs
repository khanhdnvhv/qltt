const fs = require('fs');
const path = require('path');

const files = [
  'src/app/components/admin/AdminDashboard.tsx',
  'src/app/components/admin/AdminTeachers.tsx'
];

const replacements = [
  [/Tong nguoi dung/g, "Tổng người dùng"],
  [/Khoa hoc active/g, "Khóa học active"],
  [/Doanh thu thang/g, "Doanh thu tháng"],
  [/Don hang thang/g, "Đơn hàng tháng"],
  [/Tong quan he thong GDNN-GDTX/g, "Tổng quan hệ thống GDNN-GDTX"],
  [/30 ngay qua/g, "30 ngày qua"],
  [/7 ngay qua/g, "7 ngày qua"],
  [/90 ngay qua/g, "90 ngày qua"],
  [/Nam nay/g, "Năm nay"],
  [/Doanh thu/g, "Doanh thu"],
  [/12 thang gan nhat/g, "12 tháng gần nhất"],
  [/Top khoa hoc/g, "Top khóa học"],
  [/Nguoi dung moi/g, "Người dùng mới"],
  [/Xem tat ca/g, "Xem tất cả"],
  [/Don hang gan day/g, "Đơn hàng gần đây"],
  [/Thanh cong/g, "Thành công"],
  [/Cho xu ly/g, "Chờ xử lý"],
  [/Da huy/g, "Đã hủy"],
  [/Nhat ky hoat dong/g, "Nhật ký hoạt động"],
  [/Thay doi gan day trong he thong/g, "Thay đổi gần đây trong hệ thống"],
  [/Xuat CSV/g, "Xuất CSV"],
  [/Tat ca/g, "Tất cả"],
  [/Tao moi/g, "Tạo mới"],
  [/Cap nhat/g, "Cập nhật"],
  [/Xoa/g, "Xóa"],
  [/Dang nhap/g, "Đăng nhập"],
  [/Danh gia/g, "Đánh giá"],
  [/Don hang/g, "Đơn hàng"],
  [/Giam gia/g, "Giảm giá"],
  [/Nguoi thuc hien/g, "Người thực hiện"],
  [/Loai/g, "Loại"],
  [/Doi tuong/g, "Đối tượng"],
  [/Thoi gian/g, "Thời gian"],
  [/Xem them/g, "Xem thêm"],
  [/con lai/g, "còn lại"],
  [/Thu gon/g, "Thu gọn"],
  [/Khong co hoat dong/g, "Không có hoạt động"],
  [/phut truoc/g, "phút trước"],
  [/gio truoc/g, "giờ trước"],
  [/ngay truoc/g, "ngày trước"],
  [/tuan truoc/g, "tuần trước"],
  [/Dang day/g, "Đang dạy"],
  [/Tong lop/g, "Tổng lớp"],
  [/Hoc vien/g, "Học viên"],
  [/TB danh gia/g, "TB đánh giá"],
  [/Kinh nghiem/g, "Kinh nghiệm"],
  [/Chuyen mon/g, "Chuyên môn"],
  [/Danh sach mang tinh chat minh hoa/g, "Danh sách mang tính chất minh họa"],
  [/Khong tim thay x/g, "Không tìm thấy dữ liệu"],
  [/Tim kiem theo tn/g, "Tìm kiếm theo tên"],
  [/Lop/g, "Lớp"]
];

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    replacements.forEach(([regex, repl]) => {
      content = content.replace(regex, repl);
    });
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});

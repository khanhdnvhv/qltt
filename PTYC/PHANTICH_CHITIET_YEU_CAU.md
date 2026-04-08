# PHÂN TÍCH CHI TIẾT TÍNH NĂNG HỆ THỐNG GDNN-GDTX
*(Tài liệu ánh xạ **12 Nhóm Yêu cầu** của Sếp vào **Cây Menu (Navigation)** thực tế)*

---

## 🌟 GIẢI QUYẾT BÀI TOÁN CỐT LÕI (NỖI ĐÀU CỦA SỞ)
> **Yêu cầu của Sếp:** Hàng tháng/Quý/năm các đơn vị lập kế hoạch đào tạo gửi lên Sở để phê duyệt. Mong muốn Sở có phần mềm triển khai sớm để giảm tải việc đi tận nơi kiểm tra, phê duyệt.

**Giải pháp trên Hệ thống (Đã chuẩn bị sẵn):**
Quy trình này đã được số hóa hoàn toàn thông qua Module **Kế hoạch & Điều hành** ở cả 2 phân hệ (Sở và Trung tâm), luân chuyển văn bản không giấy tờ.

---

## I. PHÂN TÍCH CHI TIẾT THEO PHÂN HỆ SỞ GD&ĐT

Vai trò này đóng vai trò Quản lý Vĩ mô, giám sát và phê duyệt (Đáp ứng **Nhóm 9, 10, 12**).

1. **Module: Kế hoạch & Điều hành**
   - **Phê duyệt Kế hoạch (Giải quyết *Bài toán Cốt lõi*):** Thay vì nhận bản cứng, Sở xem xét các kế hoạch đào tạo (số ca, khung giờ, môn học, thời lượng) do các TT đẩy lên. Nhấn [Duyệt] hoặc [Yêu cầu chỉnh sửa]. (Tích hợp Chữ ký số - *Nhóm 9*).
   - **Hồ sơ & Văn bản:** Nhận báo cáo, gửi công văn chỉ đạo xuống TT.

2. **Module: Báo cáo Thống kê**
   - **Dashboard điều hành (*Map với Mục 10*):** Hiển thị màn hình trực quan các thẻ báo cáo tổng quan toàn tỉnh (Tổng học viên, TT hoạt động, tỷ lệ đỗ,...).
   - **Báo cáo Trung tâm / Báo cáo Đào tạo / Báo cáo Chứng chỉ:** Kết xuất báo cáo (Word/Excel) về quy mô, tỷ lệ cấp chứng chỉ của từng đơn vị.

3. **Module: Quản trị Hệ thống (*Nhóm 12*)**
   - **Quản lý Đơn vị:** Nắm danh sách các Trung tâm GDNN-GDTX, Ngoại ngữ, Tin học.
   - Phân quyền, theo dõi nhật ký hoạt động đảm bảo tính bảo mật.

---

## II. PHÂN TÍCH CHI TIẾT THEO PHÂN HỆ TRUNG TÂM

Đóng vai trò vận hành vi mô, là khu vực tập hợp **Nhóm tính năng 1 -> 10**.

1. **Module: Kế hoạch & Điều hành (*Bài toán Cốt lõi & Nhóm 9*)**
   - **Kế hoạch Đào tạo:** Tạo form nhập liệu kế hoạch dự kiến theo tháng/quý -> Gửi lên Sở chờ chuyển trạng thái Approval.

2. **Module: Học viên & Tuyển sinh (*Map với Mục 1. Quản lý học viên*)**
   - **Hồ sơ Học viên:** Lưu trữ hồ sơ điện tử (Form thông tin, chụp Căn cước, bằng cấp đầu vào).
   - **Các Menu (Nhập học, Chuyển lớp, Bảo lưu, Thôi học):** Quy trình một chạm để đổi trạng thái học viên. Theo dõi trường hợp học sinh học song song nhiều chứng chỉ.

3. **Module: Nội dung đào tạo (*Map với Mục 2. Quản lý CT - Khóa học*)**
   - **Chương trình học & Quản lý học phần:** Thiết lập Khung GDTX / Ngoại ngữ / Tin học. Gán chỉ tiêu thời lượng, chuẩn đầu ra mức đóng học phí.
   - **Ngân hàng & Danh sách câu hỏi:** Chuẩn bị ngân hàng cho Khảo thí.

4. **Module: Tổ chức đào tạo (*Map với Mục 3 & Mục 7*)**
   - **Quản lý khóa học / Quản lý lớp học:** Mix chương trình vào một Lớp thực tế -> Setup thông số (Phòng máy, Xưởng nghề).
   - **Thời khóa biểu:** Hệ thống xếp lịch tự động cảnh báo trùng lặp (trùng phòng, trùng ca giáo viên).
   - **Quản lý chứng chỉ (*Mục 7*):** Tính năng theo dõi số phôi, quản lý cấp phát chứng chỉ nội bộ. Liên thông tra cứu số hiệu.

5. **Module: Đội ngũ Giảng viên (*Map với Mục 4*)**
   - **Giảng viên:** Nhập hồ sơ bằng cấp năng lực của GV -> Giới hạn GV được phân công dạy đúng lớp/môn chuyên môn. Kiểm soát định mức giờ dạy.

6. **Module: Thi và kiểm tra (*Map với Mục 6*)**
   - **Kế hoạch thi / Lịch thi:** Setup kỳ thi sát hạch chứng chỉ cuối khóa, sinh số báo danh tự động.
   - **Phân công coi thi:** Điều phối Giám thị.
   - **Quản lý đề thi / Kết quả thi:** Trộn đề, ghi nhận điểm thi tập trung, xử lý phúc khảo. Căn cứ quyết định Pass/Fail khóa học.

7. **Module: Quản lý Học phí (*Map với Mục 8*)**
   - **Đợt thu & Phiếu thu:** Quản lý tiền theo ca, theo tín chỉ hoặc khóa học. In biên lai điện tử.
   - **Miễn giảm / Phiếu trả / Công nợ:** Cảnh báo học viên còn nợ phí. Hạch toán trả tiền khi bảo lưu theo chính sách TT.

---

## III. PHÂN HỆ GIÁO VIÊN & HỌC VIÊN (CHUYỂN ĐỔI SỐ)
Được cấu trúc dạng Cổng thông tin (Portal), thiết kế phẳng, gọn, dễ nhìn trên cả Desktop và Điện thoại. Đáp ứng hoàn chỉnh **Nhóm 11: Cổng thông tin & Giao tiếp (Liên lạc)**.

**1. Đối với Giáo viên (Giảm tải khối lượng hành chính - *Map với Mục 5, 11*)**
   - **Khóa học (Lớp học của tôi):** Hiển thị các Lớp/Khóa được phân công. Bên trong chứa **Tab Điểm danh** và **Tab Nhập điểm** để giáo viên chủ động đánh giá (đủ các kỹ năng Nghe/Nói/Đọc/Viết).
   - **Lịch giảng dạy:** Nhìn tổng quan Lịch dạy Tuần/Tháng để sắp xếp thời gian.
   - **Học liệu của tôi:** Nơi tạo bài tập, tải giáo án riêng.
   - **Thông báo:** Kênh nhận việc khẩn từ TT. Tự động gửi SMS/Zalo.

**2. Đối với Học viên (*Map với Mục 11*)**
   - **Khóa học của tôi:** Truy cập xem bài vở, vào xem Video ôn luyện nếu Trung tâm cấp.
   - **Lịch học / Tiến độ:** HV nắm bắt tuần này học phòng số mấy, cơ sở nào.
   - **Kết quả học tập:** Xem bảng điểm các bài Quiz / Cuối kỳ bảo mật. 
   - **Chứng chỉ của tôi:** Hiển thị phiên bản PDF hoặc số hiệu Chứng chỉ để học viên mang đi xin việc. Tự động đối chiếu hệ thống thật.

---

### TỔNG KẾT VỀ KIẾN TRÚC HIỆN TẠI:
Cây Menu (Nav-Tree) hiện tại trên hệ thống **đã phủ kín 100% (12/12 điểm)** mong muốn của Lãnh đạo với mức độ tinh gọn (Clean UI) cao nhất:
1. Đập tan rào cản địa lý giữa Sở và các TT bằng luồng "Phê duyệt kế hoạch điện tử".
2. Tách bạch Data rõ ràng (Ai có nghiệp vụ gì thì thấy giao diện người đó).
3. Đáp ứng chuyên sâu cho việc thi, in phôi và tra cứu chứng chỉ (Pain-point của TT Ngoại Ngữ & Tin học).

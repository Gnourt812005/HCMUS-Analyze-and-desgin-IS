## 1. Cấu Trúc Layout Chung (Áp dụng cho cả 2 Form)

Toàn bộ trang form sẽ được chia thành 2 phần chính (Sections) xếp dọc từ trên xuống dưới:

* **Section 1: Thanh Tiến Trình (Progress Stepper)**
    * **Giao diện:** Nằm trên cùng, căn giữa trang. Gồm các hình tròn chứa số (1, 2) được nối với nhau bằng một đường thẳng.
    * **Trạng thái màu sắc:**
        * **Bước đã qua & Bước hiện tại:** Hình tròn nền Xanh Ocean (`#2563EB`), chữ trắng. Đường kẻ nối đổi sang màu Xanh.
        * **Bước chưa tới:** Hình tròn nền Xám Bạc (`#D1D5DB`), chữ xám đậm.
* **Section 2: Khung Nội Dung (Content Area)**
    * **Giao diện:** Nằm ngay dưới thanh tiến trình, là một khối nền Trắng (`#FFFFFF`), bo góc, có viền hoặc đổ bóng nhẹ (box-shadow) để tách biệt với nền xám nhạt của toàn trang. Nội dung bên trong sẽ thay đổi tùy thuộc vào bước hiện tại.

---

## 2. Đặc Tả Form Đặt Cọc (Deposit Form)

### Bước 1: Chọn số lượng giường cọc
* **Thông tin hiển thị:** * Tên phòng, địa chỉ phòng (Read-only).
    * **Số giường trống hiện tại:** Text nổi bật (VD: "Còn trống: 3 giường").
* **Tương tác nhập liệu:** * Một bộ đếm (Input dạng Number có nút `+` và `-`) để khách hàng chọn số lượng giường muốn cọc. Không được vượt quá số giường trống.
* **Hành động:** Nút **"Tiếp tục"** (Màu Xanh Ocean) nằm ở góc dưới cùng bên phải để chuyển sang Bước 2.

### Bước 2: Thanh toán đặt cọc
*(Xem chi tiết cấu trúc Bước 2 ở mục 4)*

---

## 3. Đặc Tả Form Đăng Ký Thuê (Rent Form)

### Bước 1: Thông tin thuê & Khấu trừ cọc
Luồng này phức tạp hơn về mặt logic dữ liệu, giao diện cần phản hồi linh hoạt dựa trên lịch sử của khách hàng.

* **Trường hợp 1: Khách hàng CHƯA từng đặt cọc**
    * Hiển thị thông tin phòng và số giường trống.
    * Bộ đếm số lượng giường: Hoạt động bình thường, cho phép khách chọn số lượng muốn thuê.
* **Trường hợp 2: Khách hàng ĐÃ từng đặt cọc**
    * **Thông báo (Alert Banner):** Xuất hiện một khung thông báo nổi bật (Nền xanh nhạt hoặc vàng nhạt) ghi rõ: *"Hệ thống ghi nhận bạn đã đặt cọc cho [X] giường. Số tiền cọc [Y]đ sẽ được tự động trừ vào tổng thanh toán ở bước sau."*
    * **Bộ đếm số lượng giường:** Bị khóa (Disabled - nền xám), hiển thị cố định con số [X] giường đã cọc. Không cho phép thay đổi để đảm bảo tính toàn vẹn của giao dịch trước đó.
* **Hành động:** Nút **"Tiếp tục"** (Màu Xanh Ocean) nằm ở góc phải dưới.

### Bước 2: Thanh toán tiền thuê
*(Xem chi tiết cấu trúc Bước 2 ở mục 4)*

---

## 4. Đặc Tả Chi Tiết Bước 2: Thanh Toán (Chung)

Khi chuyển sang Bước 2, khung nội dung (Section 2) sẽ được chia layout theo tỷ lệ **Trái (2/3)** và **Phải (1/3)**.

### Cột Trái (2/3) - Chọn Phương Thức Thanh Toán
Hiển thị danh sách các phương thức thanh toán dưới dạng các thẻ (Card) xếp dọc. 
* **Các lựa chọn tiêu biểu:**
    * Thanh toán qua ví điện tử (MoMo, ZaloPay).
    * Cổng thanh toán nội địa (VNPAY).
    * Chuyển khoản ngân hàng trực tiếp.
* **Tương tác (Accordion/Expandable):** Khi click vào một phương thức (VD: Chuyển khoản ngân hàng), thẻ đó sẽ tự động mở rộng xuống dưới, hiển thị thông tin chi tiết (Số tài khoản, Chủ tài khoản, Nội dung chuyển khoản, hoặc Mã QR Code). Các thẻ khác tự động thu gọn lại.

### Cột Phải (1/3) - Tóm Tắt & Xác Nhận (Order Summary)
Cột này tiếp tục được chia layout trên - dưới.

* **Phần Trên (2/3 chiều cao): Bảng Tóm Tắt Tiền**
    * Tiêu đề: "Chi tiết thanh toán".
    * Họ tên người đăng ký.
    * Tên phòng & Số lượng giường.
    * Tiền phòng/giường.
    * *Dòng trừ tiền (Chỉ xuất hiện ở Form Thuê nếu có cọc):* "Trừ tiền đã cọc" (Text màu Cam Amber `- [Số tiền]`).
    * **Đường kẻ ngang phân cách.**
    * **Tổng tiền cần thanh toán:** Text chữ to, in đậm, màu Cam Amber (`#F59E0B`).
* **Phần Dưới (1/3 chiều cao): Cụm Nút Hành Động**
    * **Nút Thanh Toán (Bên phải):** Nút Primary to bản, màu Xanh Ocean, chữ "Xác nhận thanh toán".
    * **Nút Quay Lại (Bên trái):** Nút dạng text hoặc icon mũi tên hướng sang trái (Text màu Xám Than `#1F2937`), cho phép người dùng quay lại Bước 1 để kiểm tra hoặc sửa đổi số lượng giường nếu cần thiết.
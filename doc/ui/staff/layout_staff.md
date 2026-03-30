### 1. Layout Tổng Thể (Admin Global Layout)
* **Sidebar (Cột trái cố định):** Chiếm khoảng 200px - 250px chiều rộng. Màu nền có thể dùng Xanh Than (Dark Navy) để phân biệt rõ với giao diện màu sáng của khách hàng. Gồm Logo ở trên cùng và danh sách các menu được chia làm 3 nhóm (có text nhỏ làm tiêu đề nhóm).
* **Main Content (Vùng làm việc bên phải):** Nền Xám nhạt (`#F9FAFB`). Mỗi trang sẽ có một Header nhỏ (chỉ chứa Tiêu đề trang, ví dụ: "Quản lý Phòng", và thanh Breadcrumb để dễ định vị). Khối nội dung chính thường là một thẻ (Card) nền Trắng chứa bộ lọc và bảng dữ liệu.

---

### 2. Chi tiết Nhóm 1: Cơ Sở Vật Chất (Bất động sản)

Nhóm này quản lý dữ liệu gốc của hệ thống. Dữ liệu ở đây sẽ được dùng để hiển thị ra Homepage cho khách hàng chọn.

* **Quản lý Ký túc xá (Cơ sở):**
    * **Hiển thị:** Bảng (Table).
    * **Các cột:** Mã KTX, Tên cơ sở (VD: Cơ sở Quận 1, Cơ sở Thủ Đức), Địa chỉ chi tiết, Tổng số phòng, Trạng thái (Hoạt động / Bảo trì).
    * **Thao tác:** Thêm mới, Sửa, Xóa/Khóa.
* **Quản lý Phòng:**
    * **Bộ lọc (Bắt buộc):** Dropdown lọc theo "Thuộc Ký túc xá nào".
    * **Hiển thị:** Bảng dữ liệu.
    * **Các cột:** Hình ảnh (Thumbnail nhỏ), Tên phòng, Thuộc KTX, Giá thuê/giường, Số giường tổng, Số giường trống, Trạng thái phòng.
    * **Thao tác:** Nút Thêm/Sửa/Xóa. Khi sửa sẽ cho phép upload hình ảnh, cập nhật danh sách tiện ích.

---

### 3. Chi tiết Nhóm 2: Quản Lý Giao Dịch (Sales Flow)

Đây là nơi Admin xử lý các yêu cầu đẩy về từ phía khách hàng. Đặc điểm chung của nhóm này là **rất cần bộ lọc theo Trạng thái (Status)** và **Thời gian**.

* **Quản lý Đơn đăng ký xem phòng:**
    * **Các cột:** Mã đơn, Tên khách hàng, SĐT, Tên phòng, Thời gian hẹn (Ngày & Khung giờ), Trạng thái (Chờ duyệt, Đã chốt, Đã hủy).
    * **Thao tác:** Nút "Xác nhận lịch" (để báo cho khách là nhân viên đã ghi nhận), hoặc "Hủy" (nếu phòng đột xuất có vấn đề).
* **Quản lý Đơn đặt cọc:**
    * **Các cột:** Mã đơn, Khách hàng, Phòng, Số giường cọc, Số tiền, Trạng thái thanh toán (Chờ thanh toán, Đã nhận tiền, Đã hủy cọc).
    * **Thao tác:** Nút "Xác nhận nhận tiền" (nếu khách chuyển khoản thủ công), "Xem biên lai".
* **Quản lý Đơn đăng ký thuê:**
    * **Các cột:** Mã đơn, Khách hàng, Phòng, Số giường, Tổng tiền, Số tiền đã trừ cọc, Trạng thái duyệt.
    * **Thao tác:** Duyệt đơn (Chuyển trạng thái sang Thành công và trigger tạo Hợp đồng), Từ chối.
* **Quản lý Hợp đồng:**
    * **Các cột:** Mã hợp đồng, Đại diện thuê (Tên khách), Phòng đang ở, Ngày bắt đầu, Ngày kết thúc, Trạng thái (Đang hiệu lực, Sắp hết hạn, Đã thanh lý).
    * **Thao tác:** Nút Xem chi tiết (để in PDF hoặc tải file hợp đồng có chữ ký), Thanh lý hợp đồng (khi khách trả phòng).

---

### 4. Chi tiết Nhóm 3: Hệ Thống

* **Quản lý Nhân viên:**
    * **Hiển thị:** Bảng danh sách nhân viên nội bộ.
    * **Các cột:** Avatar, Tên nhân viên, Email, SĐT, Vai trò (Role). Ở mức độ cơ bản nhất, bạn có thể chia 2 role: *Admin* (Toàn quyền) và *Nhân viên Sale/CSKH* (Chỉ được xem và duyệt đơn, không được xóa phòng hay hợp đồng).
    * **Thao tác:** Cấp tài khoản mới, Reset mật khẩu, Khóa tài khoản nhân viên.

### Bản Đặc Tả UI/UX: Màn Hình Quản Lý Cá Nhân

Các mục này sẽ được sử dụng thông qua nút profile ở phía góc phải màn hình. Khi nhấp vào (nếu có đăng nhập) thì sẽ hiện ra dropdown list như sau.

#### 1. Màn hình Quản lý thông tin cá nhân cơ bản
* **Layout:** Form điền thông tin đơn giản, chia làm 1 cột (mobile) hoặc 2 cột (desktop).
* **Thành phần chính:**
    * **Avatar:** Hình ảnh đại diện hình tròn, có nút/icon camera nhỏ để thay đổi ảnh.
    * **Các trường thông tin (Inputs):** Họ và tên, Số điện thoại, Email, Ngày sinh, CCCD/CMND (cần thiết cho việc làm hợp đồng sau này).
    * **Đổi mật khẩu:** Một section nhỏ phía dưới hoặc một nút mở ra modal đổi mật khẩu.
    * **Hành động:** Nút "Cập nhật thông tin" (Màu Xanh Ocean).

#### 2. Màn hình Quản lý Lịch xem phòng
* **Layout:** Bảng dữ liệu (Table).
* **Các cột (Columns):** * Mã đơn (VD: #VX123)
    * Tên phòng
    * Ngày & Giờ xem
    * Trạng thái (Badge màu: Chờ xác nhận [Vàng], Đã chốt [Xanh lá], Đã hủy [Xám/Đỏ]).
    * **Hành động (Action):** Nút/Icon "Hủy lịch" (Màu đỏ hoặc text đỏ) nằm ở cột cuối cùng.

#### 3. Màn hình Quản lý Đơn Đặt cọc & Đăng ký thuê (2 Tabs)
* **Layout chung:** Khu vực nội dung có thanh Tab Navigation ở trên cùng gồm 2 lựa chọn: **Đơn Đặt Cọc** và **Đơn Đăng Ký Thuê**. Khi click tab nào, hiển thị bảng tương ứng ở dưới.
* **Tab 1: Đơn Đặt Cọc (Table Layout)**
    * **Cột:** Mã đơn, Tên phòng, Số giường cọc, Tổng tiền, Ngày giao dịch, Trạng thái (Đang chờ, Đã thanh toán, Đã hủy).
    * **Hành động:** Nút "Hủy cọc" cho các đơn hợp lệ. Có thể thêm nút "Xem chi tiết" để xem lại hóa đơn.
* **Tab 2: Đơn Đăng Ký Thuê (Table Layout)**
    * **Cột:** Mã đơn, Tên phòng, Thời hạn thuê (VD: 6 tháng, 1 năm), Ngày bắt đầu, Trạng thái.
    * *Lưu ý:* Form thuê thường đã chốt hạ giao dịch lớn, nên có thể không cần nút Hủy trực tiếp ở đây mà yêu cầu liên hệ quản lý.

#### 4. Màn hình Quản lý Hợp đồng
* **Layout:** Lưới thẻ (Grid Card), khoảng 2-3 thẻ trên một hàng (desktop).
* **Visual Design:** Mỗi thẻ thiết kế giống như một tờ tài liệu thu nhỏ.
* **Chi tiết Card:**
    * **Header của thẻ:** Icon hợp đồng + Trạng thái (Ví dụ badge màu xanh lá: "Đang hiệu lực", màu xám: "Đã hết hạn").
    * **Nội dung:** * Tên phòng thuê.
        * Thời hạn: Từ ngày [A] đến ngày [B].
        * Giá thuê hàng tháng (nổi bật).
    * **Hành động (Footer của thẻ):** Một nút "Xem hợp đồng" (Mở ra file PDF hoặc trang chi tiết các điều khoản).

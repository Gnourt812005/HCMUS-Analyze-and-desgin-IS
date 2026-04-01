Dưới đây là bản tổng hợp tài liệu đặc tả giao diện (UI/UX Specification) chi tiết cho hệ thống quản lý phòng/ký túc xá của bạn. Mọi thứ đã được quy hoạch rõ ràng để bạn có thể dễ dàng chuyển giao cho frontend hoặc tự triển khai, đồng thời cấu trúc dữ liệu cũng được định hình sẵn sàng để khớp nối với backend.

---

## 1. Đề Xuất Bảng Màu (Color Palette)

Với định hướng nền trắng mang lại cảm giác sạch sẽ, rộng rãi (rất phù hợp với nền tảng tìm kiếm chỗ ở), tôi đề xuất kết hợp với tông màu **Xanh Dương Hiện Đại (Modern Blue)** làm màu chủ đạo. Bảng màu này tạo sự tin cậy, chuyên nghiệp và rất dễ phối hợp với các hình ảnh phòng ốc đa dạng.

| Vai trò | Tên màu | Mã HEX | Ứng dụng UI |
| :--- | :--- | :--- | :--- |
| **Nền chính** | Trắng tinh / Xám nhạt | `#FFFFFF` / `#F9FAFB` | Nền toàn trang, khoảng trắng giữa các section |
| **Màu chủ đạo** | Xanh Ocean | `#2563EB` | Nút bấm chính (Primary Button), các link đang active, biểu tượng quan trọng |
| **Màu phụ trợ** | Cam Amber | `#F59E0B` | Nhấn mạnh giá tiền, badge trạng thái (Sắp trống/Hot) |
| **Văn bản chính** | Xám Than | `#1F2937` | Tiêu đề, nội dung văn bản thông thường (dễ đọc hơn đen tuyền `#000000`) |
| **Thành phần phụ** | Xám Bạc | `#D1D5DB` | Viền (border) của input, phân cách các phần, nút bấm phụ |

---

## 2. Đặc Tả Màn Hình Chung (Global Layout)

Các thành phần này sẽ xuất hiện xuyên suốt trên hầu hết các trang của hệ thống.

### Navigation Bar (Thanh điều hướng trên cùng)
* **Góc trái:** Cụm Logo và Tên thương hiệu.
* **Ở giữa (NavLinks):** Các nút chuyển hướng chính (Trang chủ, Danh sách phòng, Về chúng tôi, Cẩm nang thuê phòng). Khi đang ở trang nào, NavLink đó sẽ đổi sang màu Xanh Ocean `#2563EB` và có gạch chân mỏng.
* **Góc phải (Trạng thái xác thực):**
    * **Chưa đăng nhập:** Hiển thị nút "Đăng nhập" (Nút viền - Outline button).
    * **Đã đăng nhập:** Hiển thị Avatar hoặc Tên người dùng. Khi click vào sẽ xổ ra một dropdown menu gồm 2 lựa chọn: **Thông tin cá nhân** và **Đăng xuất**.

### Footer (Chân trang)
* **Cột trái:** Cụm Logo lặp lại, Tên công ty/Dự án quản lý, dòng bản quyền (Copyright).
* **Cột phải:** Thông tin liên hệ cốt lõi (Hotline, Email, Địa chỉ văn phòng quản lý).

---

## 3. Đặc Tả Màn Hình Trang Chủ (Homepage)

Đây là màn hình trung tâm, tập trung vào luồng tìm kiếm và xem lướt thông tin.

### Khối Tìm Kiếm & Lọc (Filter Section)
* **Khoảng giá (Cost Range):** Dạng thanh trượt (slider) có 2 đầu mút min-max, hoặc 2 ô input nhập số tiền trực tiếp.
* **Bộ lọc Địa điểm:** Gồm 3 combobox phụ thuộc nhau theo thứ tự: **Tỉnh/Thành phố** -> **Quận/Huyện** -> **Phường/Xã**. (Dữ liệu của combobox sau chỉ mở khóa và load khi combobox trước đã được chọn).
* **Nút Action:** Một nút "Tìm kiếm" to, màu Xanh Ocean nằm bên cạnh hoặc phía dưới bộ lọc.

### Danh Sách Phòng (Room Grid)
* **Cấu trúc lưới:** Hiển thị dạng lưới (grid), thường là 3 hoặc 4 card trên một hàng (trên giao diện desktop).
* **Chi tiết Room Card:**
    * **Hình ảnh:** Ảnh thumbnail lớn, tỷ lệ 4:3 hoặc 16:9, bo góc nhẹ.
    * **Tên phòng:** Text in đậm, cắt chữ bằng dấu `...` nếu quá dài.
    * **Giá phòng:** Text màu Cam Amber nổi bật kèm đơn vị (VD: 3.500.000 đ/tháng).
    * **Hiệu ứng:** Khi trỏ chuột (hover) vào card, hình ảnh có thể zoom nhẹ và toàn bộ card đổ bóng (box-shadow) để kích thích click.

---

## 4. Đặc Tả Màn Hình Chi Tiết Phòng

Khi người dùng click vào một Room Card, màn hình này sẽ mở ra với cấu trúc chia 2 phần trên và 1 phần dưới.

### Khối Trên Cùng (Chia tỷ lệ 50-50 hoặc 60-40)
* **Bên trái (Media):** Khung hiển thị Slide hình ảnh phòng. Có nút mũi tên trái/phải, các chấm tròn chỉ mục bên dưới và tự động trượt sau mỗi 3-5 giây.
* **Bên phải (Thông tin chốt sale & Hành động):**
    * Tên phòng (Tiêu đề H1 lớn).
    * Giá phòng/tháng (Màu Cam Amber cỡ lớn).
    * Địa chỉ chi tiết.
    * Trạng thái hiện tại (VD: Còn trống, Đã có người thuê).
    * **Cụm 3 nút hành động (Phân cấp thị giác rõ ràng):**
        * **Nút 1 - Thuê (Primary):** Nút to nhất, nền Xanh Ocean, chữ trắng. (Tạm thời có thể disable hoặc dẫn tới thông báo "Tính năng đang phát triển").
        * **Nút 2 - Đăng ký xem phòng (Secondary):** Nút viền Xanh Ocean, nền trắng, chữ xanh.
        * **Nút 3 - Đặt cọc (Tertiary):** Dạng text link có gạch chân nhỏ bên dưới, ít nổi bật nhất.

### Khối Bên Dưới (Full-width)
* **Tiêu đề:** "Thông tin tiện ích & Mô tả".
* **Nội dung:** Hiển thị danh sách các tiện ích có sẵn (Điều hòa, Nóng lạnh, Chỗ để xe, Wifi, Máy giặt chung, v.v.) dưới dạng các icon đi kèm text chữ. Phần dưới cùng là đoạn văn bản mô tả chi tiết thêm về quy định giờ giấc hoặc phí dịch vụ (điện, nước).

---

## 5. Đặc Tả Màn Hình Khách Hàng (Yêu cầu Đăng nhập)

Các luồng tác vụ dành riêng cho người dùng đã có tài khoản trên hệ thống.

### Form Đăng Ký Xem Phòng
* **Cơ chế:** Xuất hiện dưới dạng một Modal (Popup nổi lên giữa màn hình) hoặc chuyển sang một trang nhỏ khi bấm "Đăng ký xem phòng" ở trang chi tiết.
* **Các trường thông tin:**
    * **Thông tin hiển thị sẵn:** Tên phòng đang muốn xem (Read-only).
    * **Ngày muốn xem:** Input dạng Datepicker để chọn lịch. Không cho phép chọn ngày trong quá khứ.
    * **Khung giờ:** Dropdown (Sáng 08:00 - 12:00, Chiều 13:00 - 17:00, Tối 18:00 - 21:00).
    * **Ghi chú (Tùy chọn):** Textarea để khách hàng nhắn nhủ thêm (VD: "Tôi đến cùng 2 bạn nữa").
* **Hành động:** Nút "Xác nhận lịch hẹn" (Màu Xanh Ocean).




### 1. Layout Tổng Thể (Global Auth Layout)
* **Background:** Toàn màn hình có thể dùng màu nền Xám nhạt (`#F9FAFB`) hoặc một bức ảnh mờ (blur) về không gian phòng ốc/ký túc xá để tạo bối cảnh.
* **Auth Card (Khung chứa chính):** Một khối hộp nền Trắng (`#FFFFFF`), đổ bóng (box-shadow) nổi bật, nằm căn giữa màn hình (cả chiều dọc lẫn chiều ngang).
* **Header của Card:** Bao gồm Logo hệ thống và thanh Tab Navigation với 2 lựa chọn: **Đăng nhập** | **Đăng ký**.

---

### 2. Tab 1: Form Đăng Nhập (Login)
Đây là trạng thái mặc định khi người dùng mở trang Auth.

* **Các trường thông tin (Inputs):**
    * Email (Kèm icon phong bì nhỏ bên trái).
    * Password (Kèm icon con mắt bên phải để ẩn/hiện mật khẩu).
* **Hành động phụ:** Dòng text link **"Quên mật khẩu?"** nằm căn lề phải, ngay dưới ô nhập Password.
* **Hành động chính:** Nút "Đăng nhập" to bản (Màu Xanh Ocean).

---

### 3. Tab 2: Form Đăng Ký (Register) - Gồm 2 Trạng thái
Để giữ form đơn giản, chúng ta sẽ chia phần này thành 2 bước ngay trên cùng một giao diện thay vì chuyển trang.

* **Trạng thái 1: Nhập thông tin khởi tạo**
    * **Inputs:** Email, Password, Confirm Password.
    * **Hành động:** Nút "Đăng ký" (khi bấm vào sẽ gọi API gửi OTP về email và chuyển sang Trạng thái 2).
* **Trạng thái 2: Xác thực OTP**
    * **Giao diện:** Ẩn 3 ô input trên. Hiển thị thông báo: *"Mã OTP gồm 6 chữ số đã được gửi tới email [abc@...]. Vui lòng kiểm tra hộp thư."*
    * **Inputs:** Khu vực nhập mã OTP (Thường thiết kế dạng 4 hoặc 6 ô vuông nhỏ rời nhau để người dùng nhập từng số).
    * **Hành động phụ:** Dòng text "Gửi lại mã (60s)" đếm ngược thời gian.
    * **Hành động chính:** Nút "Xác nhận & Tạo tài khoản".

---

### 4. Luồng Quên Mật Khẩu (Dynamic Flow)
Luồng này được kích hoạt khi người dùng bấm vào dòng chữ **"Quên mật khẩu?"** ở Tab Đăng nhập. Giao diện bên trong Card sẽ thay đổi linh hoạt theo 3 bước:

* **Bước 1: Yêu cầu OTP**
    * **Giao diện:** Form Đăng nhập biến mất. Tiêu đề đổi thành "Khôi phục mật khẩu".
    * **Inputs:** Một ô nhập Email.
    * **Hành động:** Nút "Gửi OTP". (Bấm xong sẽ hiện thêm phần nhập OTP ở dưới).
* **Bước 2: Nhập OTP**
    * **Giao diện:** Xuất hiện thêm ô nhập OTP ngay bên dưới ô Email. Nút hành động đổi tên.
    * **Inputs:** Email (Giữ nguyên, có thể khóa read-only), Ô nhập mã OTP.
    * **Hành động chính:** Nút "Xác thực OTP". (Có thêm nút "Quay lại đăng nhập" ở dạng text link).
* **Bước 3: Đặt lại mật khẩu**
    * **Giao diện:** Chỉ xuất hiện khi OTP nhập ở Bước 2 là hợp lệ. Các ô nhập Email và OTP biến mất.
    * **Inputs:** * Mật khẩu mới.
        * Xác nhận mật khẩu mới.
    * **Hành động chính:** Nút "Cập nhật mật khẩu". Bấm thành công sẽ hiện thông báo nhỏ và tự động chuyển giao diện về lại Tab Đăng nhập mặc định.
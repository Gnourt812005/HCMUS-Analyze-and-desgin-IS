| Tên Usecase | Đăng ký tài khoản |
| :---- | :---- |
| **Mã**  | UC10 |
| **Actor**  | Khách hàng  |
| **Tiền điều kiện**  | Khách hàng chưa có tài khoản trong hệ thống |
| **Hậu điều kiện**  | Khách hàng đăng ký tài khoản thành công |
| **Dòng cơ bản** | 1. Hệ thống hiển thị màn hình đăng ký. </br> 2. Khách hàng nhập email. </br> 3. Khách hàng nhập mật khẩu và xác nhận mật khẩu. </br> 4. Khách hàng bấm nút “Đăng ký”. </br> 5. Hệ thống kiểm tra thông tin đăng ký. </br> 6. Hệ thống hiển thị màn hình đăng ký thành công. </br> 7. Hệ thống điều hướng người dùng về trang chủ. </br> 8. Kết thúc use-case. |
| **Dòng thay thế** | A5.1: Nếu người dùng không điền một trong bất kỳ thông tin nào thì hệ thống hiện thông báo lỗi lên màn hình. Quay về bước 1. </br> A5.2: Nếu email đã tồn tại trong hệ thống, hệ thống sẽ hiện thông báo lỗi “Email đã tồn tại”. Quay về bước 1. |
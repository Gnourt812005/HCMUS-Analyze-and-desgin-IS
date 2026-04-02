| Tên Usecase | Đăng nhập  |
| :---- | :---- |
| **Mã**  | UC11 |
| **Actor**  | Khách hàng, nhân viên  |
| **Tiền điều kiện**  | Người dùng trong trạng thái không đăng nhập |
| **Hậu điều kiện**  | Người dùng đăng nhập thành công |
| **Dòng cơ bản** | 1. Hệ thống hiển thị màn hình đăng nhập. </br> 2. Khách hàng nhập email. </br> 3. Khách hàng nhập mật khẩu. </br> 4. Khách hàng bấm nút “Đăng nhập”. </br> 5. Hệ thống kiểm tra thông tin đăng nhập. </br> 6. Hệ thống hiển thị màn hình đăng nhập thành công. </br> 7. Hệ thống điều hướng người dùng về trang chủ. </br> 8. Kết thúc use-case |
| **Dòng thay thế** | A5.1: Nếu người dùng không điền một trong bất kỳ thông tin nào thì hệ thống hiện thông báo lỗi lên màn hình. Quay về bước 1. </br> A5.2: Nếu email không tồn tại trong hệ thống hoặc sai mật khẩu, hệ thống sẽ hiện thông báo lỗi “Thông tin đăng nhập không chính xác”. Quay về bước 1. |
# MÔ TẢ

* **`ky_tuc_xa` (Cơ sở):** Lưu trữ thông tin tổng quan của từng tòa nhà/chi nhánh ký túc xá.
* **`phong` (Phòng):** Quản lý thông tin chung của một căn phòng (loại phòng nam/nữ/mix) thuộc một cơ sở.
* **`giuong` (Giường):** Đơn vị lưu trú và tính tiền nhỏ nhất, quản lý trạng thái trống/đã thuê và đơn giá.
* **`loai_vat_tu` (Danh mục vật tư):** Từ điển các loại tài sản (giường, tủ, điều hòa) kèm đơn giá đền bù quy định.
* **`vat_tu_theo_phong` (Trang bị thực tế):** Lưu số lượng và tình trạng tài sản cụ thể được gắn cho phòng (hoặc giường).
* **`noi_quy` (Nội quy):** Các điều khoản, quy định có thể áp dụng linh hoạt cho toàn cơ sở hoặc từng phòng riêng biệt.
* **`tien_ich` (Danh mục tiện ích):** Quản lý các tiện ích và đặc điểm dịch vụ (như ban công, thang máy, pet-friendly) dùng để lọc theo yêu cầu của khách hàng.
* **`chi_tiet_tien_ich` (Chi tiết tiện ích):** Phân bổ linh hoạt các tiện ích áp dụng cho toàn bộ cơ sở hoặc chỉ một phòng cụ thể, đi kèm mô tả chi tiết để dùng để lọc theo yêu cầu của khách hàng.
---

* **`lien_he` (Lead/Liên hệ):**  Nhu cầu tìm phòng của khách hàng.
* **`lich_hen` (Lịch hẹn):** Quản lý các mốc thời gian khách đến xem phòng hoặc nhận phòng, gắn trách nhiệm với nhân viên dẫn khách.
* **`khach_hang` (Khách hàng):** Quản lý hồ sơ định danh (CCCD, nhân khẩu) của khách thuê chính thức.
* **`nhan_vien` (Nhân viên):** Lưu thông tin nội bộ của nhân viên tham gia vào các quy trình quản lý, vận hành.
---

* **`giay_dat_coc` (Giấy cọc):** Ghi nhận thỏa thuận giữ chỗ, thời hạn cam kết và số tiền đã cọc.
* **`chi_tiet_dat_coc` (Chi tiết cọc):** Ánh xạ giấy cọc với chính xác các `giuong` được giữ chỗ.
* **`hop_dong` (Hợp đồng):** Chứng từ pháp lý cao nhất, ghi nhận thời hạn lưu trú, số lượng người và trạng thái thuê của một nhóm/cá nhân.
* **`chi_tiet_hop_dong` (Chi tiết hợp đồng):** Ánh xạ hợp đồng với các `giuong` thực tế khách sử dụng, chốt giá thuê cuối cùng.
---

* **`bien_ban` (Biên bản):** Lưu vết các sự kiện mang tính pháp lý/hiện trạng như: bàn giao tài sản lúc vào, thanh lý lúc ra, hoặc ghi nhận sự cố hư hỏng.
* **`phieu_thanh_toan` (Phiếu thanh toán/Thu chi):** Quản lý trực tiếp dòng tiền thực tế (vào/ra), liên kết với Hợp đồng hoặc Giấy cọc để xác nhận đã hoàn tất nghĩa vụ tài chính.
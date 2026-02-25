**MÔ TẢ KIẾN TRÚC CƠ SỞ DỮ LIỆU**

Thiết kế cơ sở dữ liệu (CSDL) được cấu trúc dựa trên 4 phân hệ nghiệp vụ chính, đáp ứng các yêu cầu quản lý lưu trú như sau:

**1. Phân hệ Quản lý Không gian & Lưu trú (Space & Accommodation Management)**

* **Mô hình phân cấp dữ liệu:** Áp dụng cấu trúc `Ký túc xá -> Phòng -> Giường` để quản lý không gian vật lý theo từng cấp độ.
* **Hỗ trợ đa dạng hình thức thuê:** Các bảng chi tiết tham chiếu cho phép hệ thống lưu trữ và xử lý đồng thời hai nghiệp vụ: khách thuê nguyên phòng và khách thuê giường lẻ.

**2. Phân hệ Quản lý Pháp lý & Giao dịch (Legal & Transaction Management)**

* **Độc lập luồng Đặt cọc và Hợp đồng:** Thực thể `Giấy đặt cọc` và `Hợp đồng` được thiết kế riêng biệt với ràng buộc quan hệ `|o..||`. Cấu trúc này đáp ứng các trường hợp thực tế như: khách tiến hành đặt cọc nhưng hủy không ký hợp đồng, hoặc khách ký hợp đồng trực tiếp mà không qua bước đặt cọc.
* **Hợp đồng làm thực thể trung tâm:** Các nghiệp vụ phát sinh trong quá trình lưu trú (như lập Biên bản, xuất Hóa đơn) đều có tham chiếu khóa ngoại đến `Hợp đồng`. Việc này đảm bảo tính toàn vẹn dữ liệu và hỗ trợ truy xuất lịch sử giao dịch theo vòng đời của hợp đồng.

**3. Phân hệ Quản lý Tài sản & Vật tư (Asset & Inventory Management)**

* **Phân định thuộc tính tài sản:** Thực thể `vat_tu_theo_phong` sử dụng khóa ngoại để xác định phạm vi sử dụng và trách nhiệm đối với tài sản. Cụ thể:
  * Tài sản có liên kết mã `phong` nhưng không có mã `giuong` được xác định là **tài sản chung** của phòng (ví dụ: điều hòa, quạt).
  * Tài sản có liên kết đồng thời mã `phong` và mã `giuong` được xác định là **tài sản cá nhân** do người thuê giường đó chịu trách nhiệm (ví dụ: nệm, tủ cá nhân).


* Cấu trúc này cung cấp dữ liệu đầu vào cho quá trình lập **Biên bản bàn giao** và hỗ trợ hệ thống xác định đối tượng chịu trách nhiệm khi xảy ra sự cố hư hỏng tài sản.

**4. Phân hệ Quản lý Tài chính & Dịch vụ (Financial & Utility Management)**

* **Quản lý chỉ số dịch vụ:** Thực thể `chi_so_dien_nuoc` được định kỳ ghi nhận và liên kết với `Phòng` theo tháng, làm cơ sở dữ liệu để tính toán chi phí sử dụng dịch vụ.
* **Tích hợp dữ liệu hóa đơn:** Thực thể `hoa_don` tổng hợp thông tin của các loại giao dịch (tiền thuê, hoàn cọc, khoản phạt, dịch vụ tiện ích) và liên kết với dữ liệu chỉ số. Thiết kế này hỗ trợ quá trình tính toán và đối soát công nợ trong quy trình trả phòng.
* **Kiểm soát quy trình (Audit Trail):** Các thực thể nghiệp vụ như `Hóa đơn` và `Biên bản` đều bắt buộc tham chiếu đến mã `nhan_vien` thực hiện. Cấu trúc này giúp truy vết lịch sử cập nhật dữ liệu và xác định cá nhân phụ trách trong quá trình vận hành hệ thống.
Dưới đây là bản tóm tắt xúc tích và chuẩn hóa về kiến trúc công nghệ cũng như cấu trúc thư mục (Monorepo) cho dự án của bạn, đảm bảo khớp 100% với sơ đồ thiết kế 3 lớp (UI $\rightarrow$ Business $\rightarrow$ Database).

### 1. Tổng Quan Công Nghệ (Tech Stack)
* **Kiến trúc dự án:** Monorepo (Quản lý cả Front/Back trong cùng 1 Git repository).
* **Tầng UI (Frontend):** Vite + React + TypeScript.
* **Tầng Business & Database (Backend):** Node.js + Express + TypeScript.
* **Cơ sở dữ liệu:** Tùy chọn.

---

### 2. Cấu Trúc Thư Mục (Folder Tree)

```text
project-ky-tuc-xa/                 (Thư mục gốc Monorepo)
├── package.json                   (Quản lý workspace chung cho cả 2 project)
│
├── frontend/                      <-- TẦNG UI / BOUNDARY CLASS
│   ├── package.json               (Cài đặt React, Vite, Axios...)
│   ├── vite.config.ts             (Cấu hình Vite, setup Proxy gọi API)
│   └── src/
│       ├── pages/                 (Giao diện các màn hình: Home, Admin, Auth...)
│       ├── components/            (Thành phần UI dùng chung: Navbar, Modal, Card...)
│       └── api/                   (Nơi chứa các hàm gọi HTTP request xuống Backend)
│
└── backend/                       <-- TẦNG BUSINESS & DATABASE
│   ├── package.json               (Cài đặt Express, Typescript, DB Driver...)
│   ├── tsconfig.json              (Cấu hình dịch code TS sang JS)
│   └── src/
│      ├── server.ts              (File khởi chạy app Express chính)
│      ├── routes.ts              (Khai báo các URL API, đẩy request thẳng vào Service)
│      │
│      ├── business/              <-- TẦNG BUSINESS / CONTROL CLASS
│      │   ├── Room.ts     (Code logic kiểm tra phòng, tính tiền...)
│      │   ├── User.ts     (Code logic cập nhật thông tin cá nhân, validate...)
│      │   └── ...
│      │
│      └── database/              <-- TẦNG DATABASE / ENTITY CLASS
│          ├── connection.ts      (File thiết lập kết nối tới CSDL)
│          ├── RoomDB.ts  (Các hàm query thực tế: SELECT, INSERT, UPDATE...)
│          ├── UserDB.ts  
│          └── ...  
├── docker-compose.yml 
└── Dockerfile

```

---

### 3. Đối Chiếu Thiết Kế (UML Mapping)

Để giải trình với giáo viên, bạn chỉ cần chỉ rõ luồng di chuyển dữ liệu tương ứng với sơ đồ lớp như sau:

* **Boundary Layer (Tầng giao tiếp):** Nằm trọn vẹn trong thư mục `frontend/`. Khi người dùng bấm nút trên màn hình (`pages`), ứng dụng sẽ gọi các hàm trong thư mục `api` để bắn tín hiệu (Request) sang Backend.
* **Business Layer (Tầng nghiệp vụ):** Tín hiệu đi qua `routes.ts` (đóng vai trò như một cánh cửa mỏng) và đi thẳng vào thư mục `backend/src/business`. Các class `*Service.ts` tại đây sẽ chứa toàn bộ não bộ của hệ thống (kiểm tra điều kiện, tính toán số liệu).
* **Database Layer (Tầng lưu trữ):** Khi tầng Business cần lưu hoặc lấy dữ liệu, nó sẽ gọi các class `*Repository.ts` nằm trong thư mục `backend/src/database`. Các file này là nơi duy nhất được phép chứa các câu lệnh truy vấn (SQL/NoSQL) giao tiếp với ổ cứng.
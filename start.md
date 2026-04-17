# DormArch — Hướng dẫn chạy đồ án

## Chạy bằng Docker (khuyến nghị)

> Tất cả lệnh Docker chạy từ thư mục `src/`

### Lần đầu / sau khi pull code mới

```bash
cd "/Users/cato/Documents/PTTK HTTT/ĐỒ ÁN THỰC HÀNH/HCMUS-Analyze-and-desgin-IS/src"

# Build image và khởi động toàn bộ (db + backend + frontend)
docker compose up -d --build
```

### Chạy lại bình thường (đã build rồi)

```bash
docker compose up -d
```

### Dừng (giữ nguyên dữ liệu DB)

```bash
docker compose down
```

### Reset DB — chạy lại schema + seed từ đầu

> Cần làm mỗi khi sửa `schema_test.sql` hoặc `seed_test.sql`

```bash
# Xoá container + volume DB (mất dữ liệu cũ)
docker compose down -v

# Khởi động lại — PostgreSQL sẽ tự chạy lại 01_schema.sql → 02_seed.sql
docker compose up -d --build
```

### Xem log

```bash
# Tất cả service
docker compose logs -f

# Chỉ backend
docker compose logs -f backend

# Chỉ database
docker compose logs -f db
```

### Kết nối thẳng vào PostgreSQL (debug)

```bash
docker compose exec db psql -U dormarch -d dormarch
```

Một số lệnh psql hữu ích sau khi vào:
```sql
\dt                         -- liệt kê tất cả bảng
SELECT * FROM Customer;     -- xem dữ liệu
\q                          -- thoát
```

### Chạy lại seed thủ công (không cần rebuild)

```bash
docker compose exec -T db psql -U dormarch -d dormarch \
  < "../doc/database/seed_test.sql"
```

---

## Chạy local (không Docker)

### Xoá & chạy lại từ đầu

```bash
# 1. Kill tất cả process
lsof -ti :4000 | xargs kill -9 2>/dev/null
lsof -ti :3000 | xargs kill -9 2>/dev/null

# 2. Xoá Vite cache
rm -rf "/Users/cato/Documents/PTTK HTTT/ĐỒ ÁN THỰC HÀNH/HCMUS-Analyze-and-desgin-IS/src/frontend/node_modules/.vite"

# 3. Vào thư mục src
cd "/Users/cato/Documents/PTTK HTTT/ĐỒ ÁN THỰC HÀNH/HCMUS-Analyze-and-desgin-IS/src"

# 4. Build lại shared
npm run build -w shared
```

**Terminal 1 — Backend:**
```bash
cd "/Users/cato/Documents/PTTK HTTT/ĐỒ ÁN THỰC HÀNH/HCMUS-Analyze-and-desgin-IS/src"
npm run dev:backend
```

**Terminal 2 — Frontend:**
```bash
cd "/Users/cato/Documents/PTTK HTTT/ĐỒ ÁN THỰC HÀNH/HCMUS-Analyze-and-desgin-IS/src"
npm run dev:frontend
```

---

## Tài khoản

| Role | Email | Password |
|------|-------|----------|
| STAFF | `staff@gmail.com` | `staff@123` |
| STAFF | `admin@dormarch.vn` | `admin@123` |
| GUEST | `test@gmail.com` | `test@123` |
| GUEST | `sv002@student.hcmus.edu.vn` | `sv002@123` |
| GUEST | `sv003@student.hcmus.edu.vn` | `sv003@123` |
| GUEST | `sv004@student.hcmus.edu.vn` | `sv004@123` |
| GUEST | `sv005@student.hcmus.edu.vn` | `sv005@123` |

---

## Các link truy cập

### Docker
| Tính năng | URL |
|-----------|-----|
| Frontend | http://localhost:3000/ |
| Backend API | http://localhost:3001/api |
| Health check | http://localhost:3001/health |

### Local (npm run dev)
| Tính năng | URL |
|-----------|-----|
| Trang chủ | http://localhost:3000/ |
| Đăng nhập | http://localhost:3000/login |
| Đăng ký | http://localhost:3000/register |
| Hồ sơ cá nhân | http://localhost:3000/profile |
| Admin — Ký túc xá | http://localhost:3000/admin/facilities |
| Admin — Phòng | http://localhost:3000/admin/rooms |
| Admin — Lịch xem | http://localhost:3000/admin/viewing |
| Admin — Đơn hàng | http://localhost:3000/admin/orders |
| Admin — Hợp đồng | http://localhost:3000/admin/contracts |
| Admin — Bàn giao phòng | http://localhost:3000/admin/handover |
| Admin — Nhân viên | http://localhost:3000/admin/staff |
| Backend API | http://localhost:4000/api |
| Health check | http://localhost:4000/health |

---

## Lưu ý

- **Docker**: backend chạy port `3001`, frontend port `3000`
- **Local**: backend chạy port `4000`, frontend port `3000`
- Nếu thấy màn hình trắng: xoá Vite cache rồi restart frontend
- File `src/frontend/.env` phải tồn tại với `VITE_API_BASE_URL=http://localhost:4000/api`
- Đăng nhập bằng tài khoản STAFF để vào Admin Portal



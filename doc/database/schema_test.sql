-- ============================================================
-- schema_test.sql  –  DormArch Database Schema (Test Version)
-- Target: PostgreSQL
-- ============================================================
--
-- [FIX-1] Customer: dùng customerId (surrogate key) làm PRIMARY KEY
--   Thay vì email làm PK → nếu khách đổi email sẽ phải UPDATE CASCADE
--   qua toàn bộ FK, rất nặng và dễ lỗi. Dùng ID bất biến là đúng chuẩn.
--   email vẫn giữ UNIQUE NOT NULL để đăng nhập.
--
-- [FIX-2] FavoriteRoom.cccd → customerId
--   Tất cả FK tham chiếu Customer đều đổi về customerId
--
-- [FIX-3] Contract.bedId (đơn) → bảng ContractBed (junction)
--   Vì 1 hợp đồng thực tế thuê được nhiều giường (VD: 2 giường/phòng)
--   → Cột bedId đơn không lưu nổi, mất dữ liệu nếu thuê >1 giường
--   + Thêm depositId (liên kết đơn đăng ký thuê) và paymentPeriod (kỳ hạn)
--     để trang hợp đồng hiển thị tiền cọc + ngày thanh toán ngày 01
--
-- [FIX-4] HandoverReport.bedStatus TEXT → bảng HandoverBedDetail
--   Vì lưu tình trạng nhiều giường vào 1 cột TEXT không thể query/lọc
--   → Tách ra bảng riêng: mỗi giường 1 row, 4 hạng mục kiểm tra rõ ràng
--
-- [ADD-1] ContractBed – junction Contract ↔ Bed (nhiều-nhiều)
-- [ADD-2] HandoverBedDetail – checklist 4 hạng mục mỗi giường trong biên bản
-- [ADD-3] Dorm: +status, +description  (hiển thị trạng thái KTX ngoài trang chủ)
-- [ADD-4] Room: +name, +floor, +block, +tower, +imageUrl, +favoriteCount, +specialNotes
--               (phục vụ trang danh sách & chi tiết phòng)
-- ============================================================

-- ─── Drop (để chạy lại từ đầu) ───────────────────────────────────────────────
DROP TABLE IF EXISTS RefundCalculation   CASCADE;
DROP TABLE IF EXISTS CheckoutRequest     CASCADE;
DROP TABLE IF EXISTS HandoverBedDetail   CASCADE;
DROP TABLE IF EXISTS HandoverReport      CASCADE;
DROP TABLE IF EXISTS PaymentReceipt      CASCADE;
DROP TABLE IF EXISTS ContractBed         CASCADE;
DROP TABLE IF EXISTS Contract            CASCADE;
DROP TABLE IF EXISTS DepositReceipt      CASCADE;
DROP TABLE IF EXISTS ViewingSchedule     CASCADE;
DROP TABLE IF EXISTS FavoriteRoom        CASCADE;
DROP TABLE IF EXISTS RoomUtility         CASCADE;
DROP TABLE IF EXISTS DormUtility         CASCADE;
DROP TABLE IF EXISTS DormPolicy          CASCADE;
DROP TABLE IF EXISTS Bed                 CASCADE;
DROP TABLE IF EXISTS Room                CASCADE;
DROP TABLE IF EXISTS Utility             CASCADE;
DROP TABLE IF EXISTS Policy              CASCADE;
DROP TABLE IF EXISTS Employee            CASCADE;
DROP TABLE IF EXISTS Customer            CASCADE;
DROP TABLE IF EXISTS Dorm                CASCADE;

-- ─── 1. Dorm ─────────────────────────────────────────────────────────────────
CREATE TABLE Dorm (
    dormId      VARCHAR(50)  PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    address     VARCHAR(500),
    hotline     VARCHAR(20),
    status      VARCHAR(20)  DEFAULT 'Còn phòng',  -- 'Còn phòng' | 'Sắp đầy' | 'Hết phòng'
    description TEXT
);

-- ─── 2. Customer ─────────────────────────────────────────────────────────────
-- [FIX] Dùng customerId làm PK thay vì email
--   → email có thể thay đổi mà không ảnh hưởng FK ở các bảng khác
CREATE TABLE Customer (
    customerId VARCHAR(50)  PRIMARY KEY,           -- 'CUS001', 'CUS002', ...
    email      VARCHAR(255) NOT NULL UNIQUE,       -- dùng để đăng nhập
    password   VARCHAR(255) NOT NULL,
    fullName   VARCHAR(255) NOT NULL,
    cccd       VARCHAR(20)  UNIQUE,
    birthday   DATE,
    gender     VARCHAR(10),
    phone      VARCHAR(20),
    address    VARCHAR(500)
);

-- ─── 3. Employee ─────────────────────────────────────────────────────────────
CREATE TABLE Employee (
    employeeId VARCHAR(50)  PRIMARY KEY,
    fullName   VARCHAR(255) NOT NULL,
    role       VARCHAR(50),   -- 'Sale' | 'Manager' | 'Admin'
    phone      VARCHAR(20),
    email      VARCHAR(255)  UNIQUE,
    password   VARCHAR(255)  NOT NULL
);

-- ─── 4. Policy ───────────────────────────────────────────────────────────────
CREATE TABLE Policy (
    policyId VARCHAR(50)  PRIMARY KEY,
    title    VARCHAR(255) NOT NULL,
    content  TEXT
);

-- ─── 5. Utility ──────────────────────────────────────────────────────────────
CREATE TABLE Utility (
    utilityId   VARCHAR(50)  PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT
);

-- ─── 6. Room ─────────────────────────────────────────────────────────────────
CREATE TABLE Room (
    roomId        VARCHAR(50)  PRIMARY KEY,
    dormId        VARCHAR(50)  REFERENCES Dorm(dormId) ON DELETE CASCADE,
    name          VARCHAR(100),            -- 'Phòng A101'
    type          VARCHAR(100),            -- 'Phòng 4 người', 'Phòng VIP', ...
    floor         INTEGER,
    block         VARCHAR(20),
    tower         VARCHAR(20),
    specialNotes  TEXT,                    -- JSON array dạng text, VD: '["Gần cầu thang"]'
    imageUrl      VARCHAR(500),
    favoriteCount INTEGER DEFAULT 0
);

-- ─── 7. Bed ──────────────────────────────────────────────────────────────────
CREATE TABLE Bed (
    bedId     VARCHAR(50)    PRIMARY KEY,
    roomId    VARCHAR(50)    REFERENCES Room(roomId) ON DELETE CASCADE,
    basePrice DECIMAL(15, 2) DEFAULT 0,
    status    VARCHAR(50)    DEFAULT 'Available' -- 'Available' | 'Occupied' | 'Maintenance'
);

-- ─── 8. DormPolicy ───────────────────────────────────────────────────────────
CREATE TABLE DormPolicy (
    dormId   VARCHAR(50) REFERENCES Dorm(dormId)     ON DELETE CASCADE,
    policyId VARCHAR(50) REFERENCES Policy(policyId) ON DELETE CASCADE,
    PRIMARY KEY (dormId, policyId)
);

-- ─── 9. DormUtility ──────────────────────────────────────────────────────────
CREATE TABLE DormUtility (
    dormId    VARCHAR(50) REFERENCES Dorm(dormId)       ON DELETE CASCADE,
    utilityId VARCHAR(50) REFERENCES Utility(utilityId) ON DELETE CASCADE,
    PRIMARY KEY (dormId, utilityId)
);

-- ─── 10. RoomUtility ─────────────────────────────────────────────────────────
CREATE TABLE RoomUtility (
    roomId    VARCHAR(50) REFERENCES Room(roomId)       ON DELETE CASCADE,
    utilityId VARCHAR(50) REFERENCES Utility(utilityId) ON DELETE CASCADE,
    quantity  INTEGER     DEFAULT 1,
    PRIMARY KEY (roomId, utilityId)
);

-- ─── 11. FavoriteRoom ────────────────────────────────────────────────────────
CREATE TABLE FavoriteRoom (
    customerId VARCHAR(50)  REFERENCES Customer(customerId) ON DELETE CASCADE,
    roomId     VARCHAR(50)  REFERENCES Room(roomId)         ON DELETE CASCADE,
    createdAt  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (customerId, roomId)
);

-- ─── 12. DepositReceipt ──────────────────────────────────────────────────────
-- Dùng cho cả phiếu đặt cọc (Pending) và đơn đăng ký thuê đã trả đủ (Paid)
CREATE TABLE DepositReceipt (
    depositId     VARCHAR(50)    PRIMARY KEY,
    customerId    VARCHAR(50)    REFERENCES Customer(customerId),
    roomId        VARCHAR(50)    REFERENCES Room(roomId),
    createdDate   DATE           DEFAULT CURRENT_DATE,
    deadlineDate  DATE,
    occupantCount INTEGER        DEFAULT 1,
    depositAmount DECIMAL(15, 2),           -- tiền cọc đã thu
    totalAmount   DECIMAL(15, 2),           -- tổng tiền đã thanh toán
    status        VARCHAR(50)               -- 'Pending' | 'Paid' | 'Expired' | 'Cancelled'
);

-- ─── 13. Contract ────────────────────────────────────────────────────────────
-- Bỏ bedId đơn – dùng ContractBed thay thế
CREATE TABLE Contract (
    contractId    VARCHAR(50)    PRIMARY KEY,
    depositId     VARCHAR(50)    REFERENCES DepositReceipt(depositId),
    customerId    VARCHAR(50)    REFERENCES Customer(customerId),
    signedDate    DATE,
    startDate     DATE,
    endDate       DATE,
    paymentPeriod VARCHAR(20),   -- 'monthly' | 'quarterly' | 'yearly'
    depositAmount DECIMAL(15, 2),
    status        VARCHAR(50)    -- 'Active' | 'Expired' | 'Cancelled'
);

-- ─── 14. ContractBed ─────────────────────────────────────────────────────────
-- Junction: 1 hợp đồng có thể thuê nhiều giường
CREATE TABLE ContractBed (
    contractId VARCHAR(50) REFERENCES Contract(contractId) ON DELETE CASCADE,
    bedId      VARCHAR(50) REFERENCES Bed(bedId),
    PRIMARY KEY (contractId, bedId)
);

-- ─── 15. ViewingSchedule ─────────────────────────────────────────────────────
CREATE TABLE ViewingSchedule (
    scheduleId    VARCHAR(50)  PRIMARY KEY,
    customerId    VARCHAR(50)  REFERENCES Customer(customerId),
    employeeId    VARCHAR(50)  REFERENCES Employee(employeeId),
    roomId        VARCHAR(50)  REFERENCES Room(roomId),
    scheduledTime TIMESTAMP    NOT NULL,
    type          VARCHAR(50),  -- 'Trực tiếp' | 'Online'
    status        VARCHAR(50)   -- 'Pending' | 'Confirmed' | 'Done' | 'Cancelled'
);

-- ─── 16. PaymentReceipt ──────────────────────────────────────────────────────
CREATE TABLE PaymentReceipt (
    receiptId   VARCHAR(50)    PRIMARY KEY,
    contractId  VARCHAR(50)    REFERENCES Contract(contractId),
    depositId   VARCHAR(50)    REFERENCES DepositReceipt(depositId),
    method      VARCHAR(50),   -- 'Chuyển khoản' | 'Tiền mặt'
    amount      DECIMAL(15, 2) NOT NULL,
    paymentDate TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    note        TEXT
);

-- ─── 17. HandoverReport ──────────────────────────────────────────────────────
-- Bỏ bedStatus TEXT – dùng HandoverBedDetail thay thế
CREATE TABLE HandoverReport (
    reportId    VARCHAR(50) PRIMARY KEY,
    contractId  VARCHAR(50) REFERENCES Contract(contractId),
    employeeId  VARCHAR(50) REFERENCES Employee(employeeId),
    type        VARCHAR(20) NOT NULL,  -- 'check-in' | 'check-out'
    createdDate DATE        DEFAULT CURRENT_DATE,
    note        TEXT
);

-- ─── 18. HandoverBedDetail ───────────────────────────────────────────────────
-- Checklist thiết bị từng giường trong biên bản bàn giao
CREATE TABLE HandoverBedDetail (
    reportId       VARCHAR(50) REFERENCES HandoverReport(reportId) ON DELETE CASCADE,
    bedId          VARCHAR(50) REFERENCES Bed(bedId),
    bedStatus      VARCHAR(20) DEFAULT 'Tốt',      -- 'Tốt' | 'Hư hỏng' | 'Mất'
    mattressStatus VARCHAR(20) DEFAULT 'Tốt',
    cabinetStatus  VARCHAR(20) DEFAULT 'Tốt',
    keyStatus      VARCHAR(20) DEFAULT 'Tốt',
    PRIMARY KEY (reportId, bedId)
);

-- ─── 19. CheckoutRequest ─────────────────────────────────────────────────────
CREATE TABLE CheckoutRequest (
    requestId    VARCHAR(50) PRIMARY KEY,
    contractId   VARCHAR(50) REFERENCES Contract(contractId),
    expectedDate DATE,
    status       VARCHAR(50),  -- 'Pending' | 'Approved' | 'Rejected'
    rejectReason TEXT,
    documentUrl  VARCHAR(500)
);

-- ─── 20. RefundCalculation ───────────────────────────────────────────────────
CREATE TABLE RefundCalculation (
    calculationId   VARCHAR(50)    PRIMARY KEY,
    requestId       VARCHAR(50)    UNIQUE REFERENCES CheckoutRequest(requestId) ON DELETE CASCADE,
    damageNotes     TEXT,
    extraDeductions DECIMAL(15, 2) DEFAULT 0,
    totalAmount     DECIMAL(15, 2)
);

-- HomeStay Dorm Business Database Schema
-- Target Database: PostgreSQL

-- 1. Bảng Ký túc xá (Dorm)
CREATE TABLE Dorm (
    dormId VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500),
    hotline VARCHAR(20)
);

-- 2. Bảng Khách hàng (Customer)
CREATE TABLE Customer (
    cccd VARCHAR(20),
    fullName VARCHAR(255) NOT NULL,
    birthday DATE,
    gender VARCHAR(10),
    phone VARCHAR(20),
    address VARCHAR(500),
    email VARCHAR(255) PRIMARY KEY,
    password VARCHAR(255) NOT NULL
);

-- 3. Bảng Nhân viên (Employee)
CREATE TABLE Employee (
    employeeId VARCHAR(50) PRIMARY KEY,
    fullName VARCHAR(255) NOT NULL,
    role VARCHAR(50), -- VD: 'Sale', 'Manager', 'Admin'
    phone VARCHAR(20),
    email VARCHAR(255),
    password VARCHAR(255) NOT NULL
);

-- 4. Bảng Nội quy (Policy)
CREATE TABLE Policy (
    policyId VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT
);

-- 5. Bảng Tiện ích (Utility)
CREATE TABLE Utility (
    utilityId VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

-- 6. Bảng Phòng (Room)
CREATE TABLE Room (
    roomId VARCHAR(50) PRIMARY KEY,
    dormId VARCHAR(50) REFERENCES Dorm(dormId) ON DELETE CASCADE,
    type VARCHAR(100) -- VD: 'Phòng 4 người', 'Phòng VIP'
);

-- 7. Bảng Giường (Bed)
CREATE TABLE Bed (
    bedId VARCHAR(50) PRIMARY KEY,
    roomId VARCHAR(50) REFERENCES Room(roomId) ON DELETE CASCADE,
    basePrice DECIMAL(15, 2) DEFAULT 0,
    status VARCHAR(50) -- VD: 'Available', 'Occupied', 'Maintenance'
);

-- 8. Bảng Nội quy KTX (DormPolicy) - Quan hệ N-N
CREATE TABLE DormPolicy (
    dormId VARCHAR(50) REFERENCES Dorm(dormId) ON DELETE CASCADE,
    policyId VARCHAR(50) REFERENCES Policy(policyId) ON DELETE CASCADE,
    PRIMARY KEY (dormId, policyId)
);

-- 9. Bảng Tiện ích KTX (DormUtility) - Quan hệ N-N
CREATE TABLE DormUtility (
    dormId VARCHAR(50) REFERENCES Dorm(dormId) ON DELETE CASCADE,
    utilityId VARCHAR(50) REFERENCES Utility(utilityId) ON DELETE CASCADE,
    PRIMARY KEY (dormId, utilityId)
);

-- 10. Bảng Tiện ích Phòng (RoomUtility) - Quan hệ N-N có thuộc tính
CREATE TABLE RoomUtility (
    roomId VARCHAR(50) REFERENCES Room(roomId) ON DELETE CASCADE,
    utilityId VARCHAR(50) REFERENCES Utility(utilityId) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    PRIMARY KEY (roomId, utilityId)
);

-- 11. Bảng Phòng quan tâm (FavoriteRoom) - Quan hệ N-N
CREATE TABLE FavoriteRoom (
    cccd VARCHAR(20) REFERENCES Customer(cccd) ON DELETE CASCADE,
    roomId VARCHAR(50) REFERENCES Room(roomId) ON DELETE CASCADE,
    PRIMARY KEY (cccd, roomId)
);

-- 12. Bảng Hợp đồng (Contract)
CREATE TABLE Contract (
    contractId VARCHAR(50) PRIMARY KEY,
    customerId VARCHAR(20) REFERENCES Customer(cccd),
    bedId VARCHAR(50) REFERENCES Bed(bedId),
    signedDate DATE,
    startDate DATE,
    endDate DATE,
    occupantCount INTEGER DEFAULT 1,
    depositAmount DECIMAL(15, 2),
    status VARCHAR(50) -- VD: 'Active', 'Terminated', 'Expired'
);

-- 13. Bảng Giấy đặt cọc (DepositReceipt)
CREATE TABLE DepositReceipt (
    depositId VARCHAR(50) PRIMARY KEY,
    customerId VARCHAR(20) REFERENCES Customer(cccd),
    roomId VARCHAR(50) REFERENCES Room(roomId),
    createdDate DATE DEFAULT CURRENT_DATE,
    deadlineDate DATE,
    occupantCount INTEGER DEFAULT 1,
    totalAmount DECIMAL(15, 2),
    status VARCHAR(50) -- VD: 'Pending', 'Paid', 'Expired'
);

-- 14. Bảng Lịch hẹn xem phòng (ViewingSchedule)
CREATE TABLE ViewingSchedule (
    scheduleId VARCHAR(50) PRIMARY KEY,
    customerId VARCHAR(20) REFERENCES Customer(cccd),
    employeeId VARCHAR(50) REFERENCES Employee(employeeId),
    roomId VARCHAR(50) REFERENCES Room(roomId),
    time TIMESTAMP NOT NULL,
    type VARCHAR(50), -- VD: 'Trực tiếp', 'Online'
    status VARCHAR(50)
);

-- 15. Bảng Phiếu thanh toán (PaymentReceipt)
CREATE TABLE PaymentReceipt (
    receiptId VARCHAR(50) PRIMARY KEY,
    contractId VARCHAR(50) REFERENCES Contract(contractId),
    depositId VARCHAR(50) REFERENCES DepositReceipt(depositId),
    method VARCHAR(50), -- VD: 'Chuyển khoản', 'Tiền mặt'
    amount DECIMAL(15, 2) NOT NULL,
    paymentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16. Bảng Biên bản bàn giao (HandoverReport)
CREATE TABLE HandoverReport (
    reportId VARCHAR(50) PRIMARY KEY,
    contractId VARCHAR(50) REFERENCES Contract(contractId),
    type VARCHAR(50), -- VD: 'Nhận phòng', 'Trả phòng'
    createdDate DATE DEFAULT CURRENT_DATE,
    content TEXT,
    bedStatus TEXT,
    note TEXT
);

-- 17. Bảng Yêu cầu trả phòng (CheckoutRequest)
CREATE TABLE CheckoutRequest (
    requestId VARCHAR(50) PRIMARY KEY,
    contractId VARCHAR(50) REFERENCES Contract(contractId),
    expectedDate DATE,
    status VARCHAR(50), -- VD: 'Pending', 'Approved', 'Rejected'
    rejectReason TEXT,
    documentUrl VARCHAR(500)
);

-- 18. Bảng Hoàn cọc & Khấu trừ (RefundCalculation)
CREATE TABLE RefundCalculation (
    calculationId VARCHAR(50) PRIMARY KEY,
    requestId VARCHAR(50) UNIQUE REFERENCES CheckoutRequest(requestId) ON DELETE CASCADE,
    damageNotes TEXT,
    extraDeductions DECIMAL(15, 2) DEFAULT 0,
    totalAmount DECIMAL(15, 2) -- Số tiền hoàn trả cuối cùng
);

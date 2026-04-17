-- ============================================================
-- seed_test.sql  –  DormArch Seed Data (Test Version)
-- Chạy SAU schema_test.sql
-- ============================================================
-- Tài khoản admin : staff@gmail.com / staff@123  (Employee NV001)
-- Tài khoản guest : test@gmail.com  / test@123   (Customer CUS001)
-- CCCD test dùng cho Rental flow: 012345678901 (CUS001)
-- ============================================================

-- ─── 1. Dorm (4) ─────────────────────────────────────────────────────────────
INSERT INTO Dorm (dormId, name, address, hotline, status, description) VALUES
('KTX-A', 'Ký túc xá Khu A', '227 Nguyễn Văn Cừ, P.4, Q.5, TP.HCM', '028 3835 0001', 'Còn phòng', 'Dành cho sinh viên nam. Gần cổng chính, thuận tiện di chuyển.'),
('KTX-B', 'Ký túc xá Khu B', '227 Nguyễn Văn Cừ, P.4, Q.5, TP.HCM', '028 3835 0002', 'Còn phòng', 'Dành cho sinh viên nữ. Khu vực yên tĩnh, có phòng học chung.'),
('KTX-C', 'Ký túc xá Khu C', '227 Nguyễn Văn Cừ, P.4, Q.5, TP.HCM', '028 3835 0003', 'Còn phòng', 'Dành cho cả nam và nữ (tầng riêng). Mới xây, đầy đủ tiện nghi.'),
('KTX-D', 'Ký túc xá Khu D', '227 Nguyễn Văn Cừ, P.4, Q.5, TP.HCM', '028 3835 0004', 'Hết phòng', 'Dành cho nghiên cứu sinh và học viên cao học.');

-- ─── 2. Employee (8) ─────────────────────────────────────────────────────────
INSERT INTO Employee (employeeId, fullName, role, phone, email, password) VALUES
('NV001', 'Nguyễn Thị Lan',  'Sale',    '0901000001', 'staff@gmail.com',   'staff@123'),
('NV002', 'Trần Minh Quân',  'Manager', '0901000002', 'admin@dormarch.vn', 'admin@123'),
('NV003', 'Lê Văn Khoa',     'Sale',    '0901000003', 'khoa@dormarch.vn',  'khoa@123'),
('NV004', 'Phạm Thị Hoa',    'Sale',    '0901000004', 'hoa@dormarch.vn',   'hoa@123'),
('NV005', 'Võ Minh Tuấn',    'Manager', '0901000005', 'tuan@dormarch.vn',  'tuan@123'),
('NV006', 'Nguyễn Thị Mai',  'Sale',    '0901000006', 'mai@dormarch.vn',   'mai@123'),
('NV007', 'Đặng Văn Long',   'Sale',    '0901000007', 'long@dormarch.vn',  'long@123'),
('NV008', 'Bùi Thị Ngọc',   'Admin',   '0901000008', 'ngoc@dormarch.vn',  'ngoc@123');

-- ─── 3. Customer (9) ─────────────────────────────────────────────────────────
-- CUS001 dùng cccd='012345678901' để test Rental flow
INSERT INTO Customer (customerId, email, password, fullName, cccd, birthday, gender, phone, address) VALUES
('CUS001', 'test@gmail.com',             'test@123',  'Phạm Văn Bảo',    '012345678901', '2003-01-15', 'Nam', '0912000001', 'Tỉnh Bình Dương'),
('CUS002', 'sv002@student.hcmus.edu.vn', 'sv002@123', 'Lê Thị Cẩm Tú',   '012345678902', '2003-04-22', 'Nữ',  '0912000002', 'Tỉnh Long An'),
('CUS003', 'sv003@student.hcmus.edu.vn', 'sv003@123', 'Hoàng Đức Anh',   '012345678903', '2002-11-08', 'Nam', '0912000003', 'Tỉnh Tiền Giang'),
('CUS004', 'sv004@student.hcmus.edu.vn', 'sv004@123', 'Nguyễn Thị Diễm', '012345678904', '2003-09-30', 'Nữ',  '0912000004', 'Tỉnh Đồng Nai'),
('CUS005', 'sv005@student.hcmus.edu.vn', 'sv005@123', 'Trần Quốc Huy',   '012345678905', '2002-06-17', 'Nam', '0912000005', 'Tỉnh Vĩnh Long'),
('CUS006', 'nguyenvanan@mail.com',        'an@123',    'Nguyễn Văn An',   '012345678906', '2001-05-10', 'Nam', '0901234567', 'TP.HCM'),
('CUS007', 'tranthihinh@mail.com',        'binh@123',  'Trần Thị Bình',   '012345678907', '2002-08-15', 'Nữ',  '0912345678', 'Tỉnh Bình Dương'),
('CUS008', 'lehoanqcuong@mail.com',       'cuong@123', 'Lê Hoàng Cường',  '012345678908', '2000-03-22', 'Nam', '0923456789', 'Tỉnh Long An'),
('CUS009', 'phamthidung@mail.com',        'dung@123',  'Phạm Thị Dung',   '012345678909', '2001-11-05', 'Nữ',  '0934567890', 'Tỉnh Đồng Nai');

-- ─── 4. Policy (8) ───────────────────────────────────────────────────────────
INSERT INTO Policy (policyId, title, content) VALUES
('POL001', 'Giờ giấc',        'Không gây tiếng ồn sau 22:00 và trước 06:00.'),
('POL002', 'Cấm hút thuốc',   'Cấm hút thuốc lá trong toàn bộ khuôn viên ký túc xá.'),
('POL003', 'Thú cưng',        'Không nuôi thú cưng dưới mọi hình thức.'),
('POL004', 'An toàn tài sản', 'Khoá cửa phòng khi ra ngoài và khi đi ngủ.'),
('POL005', 'Nấu ăn',          'Không nấu ăn trong phòng, chỉ dùng bếp sinh hoạt chung.'),
('POL006', 'Khách thăm',      'Không cho người ngoài ở lại qua đêm khi chưa đăng ký.'),
('POL007', 'Vệ sinh',         'Giữ vệ sinh phòng và khu vực sinh hoạt chung sạch sẽ.'),
('POL008', 'Điện',            'Không dùng thiết bị điện công suất lớn chưa được phê duyệt.');

-- ─── 5. Utility (9) ──────────────────────────────────────────────────────────
INSERT INTO Utility (utilityId, name, description) VALUES
('UTI001', 'Điều hoà',     'Máy lạnh điều hoà nhiệt độ'),
('UTI002', 'Quạt trần',    'Quạt trần tốc độ 3 cấp'),
('UTI003', 'Tủ quần áo',   'Tủ quần áo 2 cánh cá nhân'),
('UTI004', 'Bàn học',      'Bàn học kèm ghế ngồi'),
('UTI005', 'Wifi',         'Wifi tốc độ tối thiểu 50 Mbps'),
('UTI006', 'Tủ lạnh mini', 'Tủ lạnh mini dùng chung trong phòng'),
('UTI007', 'Tủ lạnh',      'Tủ lạnh 150L'),
('UTI008', 'WC riêng',     'Nhà vệ sinh riêng trong phòng'),
('UTI009', 'TV',           'Tivi 32 inch');

-- ─── 6. Room (12) ────────────────────────────────────────────────────────────
INSERT INTO Room (roomId, dormId, name, type, floor, block, tower, specialNotes, imageUrl, favoriteCount) VALUES
('A101','KTX-A','Phòng A101','Phòng 4 người',       1,'A','A','["Gần cầu thang","View sân trường"]','',12),
('A102','KTX-A','Phòng A102','Phòng 4 người',       1,'A','A','[]',                                  '',8),
('A103','KTX-A','Phòng A103','Phòng 4 người',       1,'A','A','["Gần nhà vệ sinh chung"]',           '',5),
('A201','KTX-A','Phòng A201','Phòng đôi cao cấp',   2,'A','A','["Phòng đôi cao cấp"]',              '',24),
('A202','KTX-A','Phòng A202','Phòng đôi cao cấp',   2,'A','A','["Phòng đôi cao cấp","Có ban công"]','',31),
('B101','KTX-B','Phòng B101','Phòng 6 người',       1,'B','B','["Tiết kiệm chi phí"]',              '',3),
('B102','KTX-B','Phòng B102','Phòng 4 người',       1,'B','B','[]',                                  '',7),
('B201','KTX-B','Phòng B201','Phòng 4 người',       2,'B','B','["Tầng cao, thoáng mát"]',           '',15),
('B203','KTX-B','Phòng B203','Phòng 4 người',       2,'B','B','[]',                                  '',10),
('C301','KTX-C','Phòng C301','Phòng VIP',           3,'C','C','["WC riêng trong phòng"]',           '',47),
('C302','KTX-C','Phòng C302','Phòng VIP',           3,'C','C','["Phòng cao cấp","Hướng Đông"]',     '',39),
('D102','KTX-D','Phòng D102','Phòng đơn',           1,'D','D','["Dành cho nghiên cứu sinh"]',       '',18);

-- ─── 7. Bed ──────────────────────────────────────────────────────────────────
-- HD001 (Active): A101-1, A101-2 Occupied → còn A101-3, A101-4 để test Rental
INSERT INTO Bed (bedId, roomId, basePrice, status) VALUES
('A101-1','A101',1500000,'Occupied'),
('A101-2','A101',1500000,'Occupied'),
('A101-3','A101',1500000,'Available'),   -- ← có thể đặt
('A101-4','A101',1500000,'Available'),   -- ← có thể đặt

-- HD007 (Expired): tất cả Available để test
('A102-1','A102',1500000,'Available'),
('A102-2','A102',1500000,'Available'),
('A102-3','A102',1500000,'Available'),
('A102-4','A102',1500000,'Available'),

-- HD005 (Active): A103-1 Occupied → còn 3 giường
('A103-1','A103',1500000,'Occupied'),
('A103-2','A103',1500000,'Available'),
('A103-3','A103',1500000,'Available'),
('A103-4','A103',1500000,'Available'),

-- A201, A202: hoàn toàn trống để test phòng đôi cao cấp
('A201-1','A201',1700000,'Available'),
('A201-2','A201',1700000,'Available'),
('A202-1','A202',1700000,'Available'),
('A202-2','A202',1700000,'Available'),

-- B101: 4 Occupied (dữ liệu nền), 2 Available
('B101-1','B101',1400000,'Occupied'),
('B101-2','B101',1400000,'Occupied'),
('B101-3','B101',1400000,'Occupied'),
('B101-4','B101',1400000,'Occupied'),
('B101-5','B101',1400000,'Available'),
('B101-6','B101',1400000,'Available'),

-- HD008 (Active): B102-1 Occupied → còn 3 giường
('B102-1','B102',1500000,'Occupied'),
('B102-2','B102',1500000,'Available'),
('B102-3','B102',1500000,'Available'),
('B102-4','B102',1500000,'Available'),

-- HD006 (Active): B201-1, B201-2 Occupied → còn 2 giường
('B201-1','B201',1600000,'Occupied'),
('B201-2','B201',1600000,'Occupied'),
('B201-3','B201',1600000,'Available'),
('B201-4','B201',1600000,'Available'),

-- HD002 (Expired): B203-1 trở lại Available
('B203-1','B203',1600000,'Available'),
('B203-2','B203',1600000,'Available'),
('B203-3','B203',1600000,'Available'),
('B203-4','B203',1600000,'Available'),

-- HD003 (Active): C301-1 Occupied → C301-2 Available
('C301-1','C301',2000000,'Occupied'),
('C301-2','C301',2000000,'Available'),

-- C302: cả 2 Available để test phòng VIP
('C302-1','C302',2000000,'Available'),
('C302-2','C302',2000000,'Available'),

-- HD004 (Cancelled): D102-1 Available
('D102-1','D102',2500000,'Available');

-- ─── 8. DormPolicy ───────────────────────────────────────────────────────────
INSERT INTO DormPolicy (dormId, policyId) VALUES
('KTX-A','POL001'),('KTX-A','POL002'),('KTX-A','POL003'),('KTX-A','POL004'),
('KTX-A','POL005'),('KTX-A','POL006'),('KTX-A','POL007'),('KTX-A','POL008'),
('KTX-B','POL001'),('KTX-B','POL002'),('KTX-B','POL003'),('KTX-B','POL004'),
('KTX-B','POL005'),('KTX-B','POL006'),('KTX-B','POL007'),('KTX-B','POL008'),
('KTX-C','POL001'),('KTX-C','POL002'),('KTX-C','POL003'),('KTX-C','POL004'),
('KTX-C','POL005'),('KTX-C','POL006'),('KTX-C','POL007'),('KTX-C','POL008'),
('KTX-D','POL001'),('KTX-D','POL002'),('KTX-D','POL003'),('KTX-D','POL004'),
('KTX-D','POL005'),('KTX-D','POL006'),('KTX-D','POL007'),('KTX-D','POL008');

-- ─── 9. DormUtility ──────────────────────────────────────────────────────────
INSERT INTO DormUtility (dormId, utilityId) VALUES
('KTX-A','UTI001'),('KTX-A','UTI002'),('KTX-A','UTI005'),
('KTX-B','UTI001'),('KTX-B','UTI002'),('KTX-B','UTI005'),
('KTX-C','UTI001'),('KTX-C','UTI005'),('KTX-C','UTI007'),('KTX-C','UTI008'),
('KTX-D','UTI001'),('KTX-D','UTI005'),('KTX-D','UTI007'),('KTX-D','UTI008'),('KTX-D','UTI009');

-- ─── 10. RoomUtility ─────────────────────────────────────────────────────────
INSERT INTO RoomUtility (roomId, utilityId) VALUES
('A101','UTI001'),('A101','UTI002'),('A101','UTI003'),('A101','UTI004'),('A101','UTI005'),
('A102','UTI001'),('A102','UTI002'),('A102','UTI003'),('A102','UTI004'),('A102','UTI005'),
('A103','UTI002'),('A103','UTI003'),('A103','UTI004'),('A103','UTI005'),
('A201','UTI001'),('A201','UTI003'),('A201','UTI004'),('A201','UTI005'),('A201','UTI006'),
('A202','UTI001'),('A202','UTI003'),('A202','UTI004'),('A202','UTI005'),('A202','UTI006'),
('B101','UTI002'),('B101','UTI003'),('B101','UTI004'),('B101','UTI005'),
('B102','UTI001'),('B102','UTI003'),('B102','UTI004'),('B102','UTI005'),
('B201','UTI001'),('B201','UTI003'),('B201','UTI004'),('B201','UTI005'),
('B203','UTI001'),('B203','UTI003'),('B203','UTI004'),('B203','UTI005'),
('C301','UTI001'),('C301','UTI003'),('C301','UTI004'),('C301','UTI005'),('C301','UTI007'),('C301','UTI008'),
('C302','UTI001'),('C302','UTI003'),('C302','UTI004'),('C302','UTI005'),('C302','UTI007'),('C302','UTI008'),
('D102','UTI001'),('D102','UTI003'),('D102','UTI004'),('D102','UTI005'),('D102','UTI007'),('D102','UTI008'),('D102','UTI009');

-- ─── 11. FavoriteRoom (8) ────────────────────────────────────────────────────
INSERT INTO FavoriteRoom (customerId, roomId) VALUES
('CUS001','A201'),('CUS001','C301'),
('CUS002','A202'),('CUS002','B201'),
('CUS003','C301'),('CUS004','C302'),
('CUS005','A101'),('CUS006','A202');

-- ─── 12. DepositReceipt (8) ──────────────────────────────────────────────────
-- DK001–DK004: Paid → đã tạo hợp đồng HD001–HD004
-- DK005–DK006: Paid → hợp đồng HD005–HD006
-- DK007–DK008: Pending (chưa lập HĐ) → hiển thị trong dropdown Admin orders
INSERT INTO DepositReceipt (depositId, customerId, roomId, createdDate, deadlineDate, occupantCount, depositAmount, totalAmount, status) VALUES
('DK001','CUS006','A101','2024-12-20','2024-12-27',2,6000000, 6000000,'Paid'),
('DK002','CUS007','B203','2024-05-18','2024-05-25',1,3200000, 3200000,'Paid'),
('DK003','CUS008','C301','2025-02-10','2025-02-17',1,4000000, 4000000,'Paid'),
('DK004','CUS009','D102','2024-08-20','2024-08-27',1,2500000, 2500000,'Paid'),
('DK005','CUS003','A103','2025-05-20','2025-05-27',1,3000000, 3000000,'Paid'),
('DK006','CUS005','B201','2025-07-25','2025-08-01',2,6400000, 6400000,'Paid'),
('DK007','CUS001','A201','2026-04-10','2026-04-17',1,3400000, 3400000,'Pending'),
('DK008','CUS002','C302','2026-03-01','2026-03-08',2,8000000, 8000000,'Pending');

-- ─── 13. Contract (6) ────────────────────────────────────────────────────────
INSERT INTO Contract (contractId, depositId, customerId, signedDate, startDate, endDate, paymentPeriod, depositAmount, status) VALUES
('HD001','DK001','CUS006','2024-12-28','2025-01-01','2025-12-31','monthly',   6000000,'Active'),
('HD002','DK002','CUS007','2024-05-25','2024-06-01','2024-12-31','quarterly', 3200000,'Expired'),
('HD003','DK003','CUS008','2025-02-20','2025-03-01','2026-02-28','yearly',    4000000,'Active'),
('HD004','DK004','CUS009','2024-08-28','2024-09-01','2025-01-31','monthly',   2500000,'Cancelled'),
('HD005','DK005','CUS003','2025-05-28','2025-06-01','2026-05-31','monthly',   3000000,'Active'),
('HD006','DK006','CUS005','2025-08-01','2025-08-01','2026-07-31','quarterly', 6400000,'Active');

-- ─── 14. ContractBed ─────────────────────────────────────────────────────────
INSERT INTO ContractBed (contractId, bedId) VALUES
('HD001','A101-1'),('HD001','A101-2'),
('HD002','B203-1'),
('HD003','C301-1'),
('HD004','D102-1'),
('HD005','A103-1'),
('HD006','B201-1'),('HD006','B201-2');

-- ─── 15. ViewingSchedule (8) ─────────────────────────────────────────────────
INSERT INTO ViewingSchedule (scheduleId, customerId, employeeId, roomId, scheduledTime, type, status) VALUES
('VS001','CUS001','NV001','A201','2026-04-20 10:00:00','Trực tiếp','Confirmed'),
('VS002','CUS002','NV001','B201','2026-04-21 14:00:00','Trực tiếp','Pending'),
('VS003','CUS003','NV002','A202','2026-04-22 09:00:00','Online',   'Confirmed'),
('VS004','CUS004','NV001','C301','2026-04-15 10:30:00','Trực tiếp','Done'),
('VS005','CUS005','NV002','D102','2026-04-10 15:00:00','Trực tiếp','Cancelled'),
('VS006','CUS006','NV003','A103','2025-05-15 09:00:00','Online',   'Done'),
('VS007','CUS007','NV004','B203','2024-05-10 11:00:00','Trực tiếp','Done'),
('VS008','CUS009','NV003','D102','2024-08-15 14:30:00','Trực tiếp','Done');

-- ─── 16. PaymentReceipt (8) ──────────────────────────────────────────────────
INSERT INTO PaymentReceipt (receiptId, contractId, depositId, method, amount, paymentDate, note) VALUES
('PR001',NULL,   'DK001','Chuyển khoản',6000000, '2024-12-20 09:00:00','Đặt cọc DK001'),
('PR002',NULL,   'DK002','Tiền mặt',    3200000, '2024-05-18 10:30:00','Đặt cọc DK002'),
('PR003',NULL,   'DK003','Chuyển khoản',4000000, '2025-02-10 14:00:00','Đặt cọc DK003'),
('PR004',NULL,   'DK004','Tiền mặt',    2500000, '2024-08-20 11:00:00','Đặt cọc DK004'),
('PR005','HD001',NULL,   'Chuyển khoản',3000000, '2025-01-01 08:00:00','Tiền thuê tháng 1/2025'),
('PR006','HD001',NULL,   'Chuyển khoản',3000000, '2025-02-01 08:00:00','Tiền thuê tháng 2/2025'),
('PR007','HD002',NULL,   'Tiền mặt',    4800000, '2024-06-01 09:00:00','Tiền thuê quý 2/2024'),
('PR008','HD003',NULL,   'Chuyển khoản',48000000,'2025-03-01 10:00:00','Tiền thuê cả năm 2025');

-- ─── 17. HandoverReport (6) ──────────────────────────────────────────────────
INSERT INTO HandoverReport (reportId, contractId, employeeId, type, createdDate, note) VALUES
('BB001','HD001','NV001','check-in', '2025-01-01','Nệm giường A101-2 bị rách nhẹ tại góc.'),
('BB002','HD002','NV001','check-in', '2024-06-01',''),
('BB003','HD002','NV002','check-out','2024-12-31','Phòng sạch sẽ, không phát sinh hư hỏng.'),
('BB004','HD003','NV002','check-in', '2025-03-01',''),
('BB005','HD004','NV001','check-in', '2024-09-01',''),
('BB006','HD004','NV003','check-out','2025-01-20','Hợp đồng bị huỷ sớm. Tủ D102-1 mất chìa khoá.');

-- ─── 18. HandoverBedDetail ───────────────────────────────────────────────────
INSERT INTO HandoverBedDetail (reportId, bedId, bedStatus, mattressStatus, cabinetStatus, keyStatus) VALUES
('BB001','A101-1','Tốt',    'Tốt',    'Tốt','Tốt'),
('BB001','A101-2','Tốt',    'Hư hỏng','Tốt','Tốt'),
('BB002','B203-1','Tốt',    'Tốt',    'Tốt','Tốt'),
('BB003','B203-1','Tốt',    'Tốt',    'Tốt','Tốt'),
('BB004','C301-1','Tốt',    'Tốt',    'Tốt','Tốt'),
('BB005','D102-1','Tốt',    'Tốt',    'Tốt','Tốt'),
('BB006','D102-1','Tốt',    'Tốt',    'Tốt','Mất');

-- ─── 19. CheckoutRequest (6) ─────────────────────────────────────────────────
INSERT INTO CheckoutRequest (requestId, contractId, expectedDate, status, rejectReason, documentUrl) VALUES
('COR001','HD002','2024-12-31','Approved', NULL, NULL),
('COR002','HD004','2025-01-20','Approved', NULL, NULL),
('COR003','HD003','2026-02-28','Pending',  NULL, NULL),
('COR004','HD001','2025-12-31','Pending',  NULL, NULL),
('COR005','HD005','2026-05-31','Pending',  NULL, NULL),
('COR006','HD006','2026-07-31','Pending',  NULL, NULL);

-- ─── 20. RefundCalculation (2) ───────────────────────────────────────────────
INSERT INTO RefundCalculation (calculationId, requestId, damageNotes, extraDeductions, totalAmount) VALUES
('RFC001','COR001',NULL,                                                     0,       3200000),
('RFC002','COR002','Huỷ hợp đồng trước thời hạn, không hoàn tiền cọc.',    2500000, 0);

-- SEEDING DATA FOR DORMITORY MANAGEMENT SYSTEM
-- 5 Dorms, 10 Rooms/Dorm, 4 Beds/Room

-- 1. USERS & ROLES
INSERT INTO users (email, full_name, password, cccd, birthday, gender, phone, address, role)
VALUES 
('admin@gmail.com', 'Hệ Thống Admin', 'password123', '001095000001', '1985-05-20', 'Male', '0901234567', 'Quận 1, TP.HCM', 'ADMIN'),
('manager1@gmail.com', 'Quản Lý Khu A', 'password123', '001095000011', '1990-01-01', 'Male', '0911111111', 'TP.HCM', 'MANAGER'),
('manager2@gmail.com', 'Quản Lý Khu B', 'password123', '001095000012', '1990-02-02', 'Female', '0922222222', 'TP.HCM', 'MANAGER'),
('manager3@gmail.com', 'Quản Lý Khu C', 'password123', '001095000013', '1990-03-03', 'Male', '0933333333', 'TP.HCM', 'MANAGER'),
('manager4@gmail.com', 'Quản Lý Khu D', 'password123', '001095000014', '1990-04-04', 'Female', '0944444444', 'TP.HCM', 'MANAGER'),
('manager5@gmail.com', 'Quản Lý Khu E', 'password123', '001095000015', '1990-05-05', 'Male', '0955555555', 'TP.HCM', 'MANAGER'),
('sale1@gmail.com', 'Lê Văn Sales', 'password123', '001095000003', '1995-10-10', 'Male', '0903456789', 'Quận 10, TP.HCM', 'SALE_STAFF'),
('student1@gmail.com', 'Phạm Minh Đức', 'password123', '001095000004', '2005-01-01', 'Male', '0904567890', 'Bình Định', 'GUEST'),
('student2@gmail.com', 'Hoàng Thu Thảo', 'password123', '001095000005', '2005-08-20', 'Female', '0905678901', 'Đà Lạt', 'GUEST')
ON CONFLICT (email) DO NOTHING;

-- 2. POLICIES
INSERT INTO policies (title, content, is_active)
VALUES 
('Nội quy Ký túc xá 2024', '1. Giữ gìn vệ sinh chung... 2. Không gây ồn ào sau 23h...', TRUE),
('Quy định Hoàn tiền & Bồi thường', 'Tiền cọc sẽ được hoàn lại sau khi trừ chi phí hư hại thiết bị (nếu có)...', TRUE)
ON CONFLICT DO NOTHING;

-- 3. UTILITIES (Master Data)
INSERT INTO utilities (title, type, is_liable, incurred_price)
VALUES 
-- Dorm level
('Máy giặt công cộng', 'DORM', TRUE, 5000000),
('Máy lọc nước', 'DORM', FALSE, 2000000),
-- Room level
('Điều hòa Inverter', 'ROOM', TRUE, 12000000),
('Tủ lạnh mini', 'ROOM', TRUE, 4500000),
('Bàn học gỗ', 'ROOM', FALSE, 800000),
-- Bed level
('Đèn đọc sách chân kẹp', 'BED', FALSE, 250000),
('Nệm cao su non', 'BED', TRUE, 1500000)
ON CONFLICT DO NOTHING;

-- 4. MASTER SEEDING BLOCK
DO $$
DECLARE
    v_dorm_id UUID;
    v_room_id UUID;
    v_bed_id UUID;
    v_policy_id UUID;
    
    -- Utility IDs
    v_u_washing UUID;
    v_u_water UUID;
    v_u_ac UUID;
    v_u_fridge UUID;
    v_u_table UUID;
    v_u_lamp UUID;
    v_u_mattress UUID;
    
    v_manager_emails TEXT[] := ARRAY['manager1@gmail.com', 'manager2@gmail.com', 'manager3@gmail.com', 'manager4@gmail.com', 'manager5@gmail.com'];
    v_dorm_name TEXT;
    v_room_name TEXT;
BEGIN
    -- Fetch IDs
    SELECT id INTO v_policy_id FROM policies WHERE title = 'Nội quy Ký túc xá 2024' LIMIT 1;
    
    SELECT id INTO v_u_washing FROM utilities WHERE title = 'Máy giặt công cộng' LIMIT 1;
    SELECT id INTO v_u_water FROM utilities WHERE title = 'Máy lọc nước' LIMIT 1;
    SELECT id INTO v_u_ac FROM utilities WHERE title = 'Điều hòa Inverter' LIMIT 1;
    SELECT id INTO v_u_fridge FROM utilities WHERE title = 'Tủ lạnh mini' LIMIT 1;
    SELECT id INTO v_u_table FROM utilities WHERE title = 'Bàn học gỗ' LIMIT 1;
    SELECT id INTO v_u_lamp FROM utilities WHERE title = 'Đèn đọc sách chân kẹp' LIMIT 1;
    SELECT id INTO v_u_mattress FROM utilities WHERE title = 'Nệm cao su non' LIMIT 1;

    -- Loop 5 Dorms (Khu A -> Khu E)
    FOR i IN 1..5 LOOP
        v_dorm_name := 'KTX Khu ' || CHR(64 + i);
        
        -- Insert Dorm
        INSERT INTO dorms (name, address, phone, status, total_rooms, available_rooms, manager_id, policy_id)
        VALUES (v_dorm_name, 'Số ' || i || ' Đường nội bộ, Làng Đại Học, Thủ Đức', '028000000' || i, 'AVAILABLE', 10, 10, v_manager_emails[i], v_policy_id)
        RETURNING id INTO v_dorm_id;

        -- Attach Dorm to Manager (User table update)
        UPDATE users SET dorm_id = v_dorm_id WHERE email = v_manager_emails[i];

        -- Dorm Fees
        INSERT INTO dorm_fees (dorm_id, water_fee, electricity_fee, wifi_fee, cleaning_fee)
        VALUES (v_dorm_id, 50000, 3500, 100000, 30000);

        -- Dorm Utilities
        INSERT INTO dorm_utilities (dorm_id, utility_id) VALUES (v_dorm_id, v_u_washing);
        INSERT INTO dorm_utilities (dorm_id, utility_id) VALUES (v_dorm_id, v_u_water);

        -- Loop 10 Rooms per Dorm
        FOR j IN 1..10 LOOP
            v_room_name := CHR(64 + i) || '.' || (100 + j);
            
            INSERT INTO rooms (dorm_id, name, block, floor, status, total_beds, available_beds)
            VALUES (v_dorm_id, v_room_name, 'Block ' || CHR(64 + i), (j-1)/5 + 1, 'AVAILABLE', 4, 4)
            RETURNING id INTO v_room_id;

            -- Room Utilities
            INSERT INTO room_utilities (room_id, utility_id) VALUES (v_room_id, v_u_ac);
            INSERT INTO room_utilities (room_id, utility_id) VALUES (v_room_id, v_u_fridge);
            INSERT INTO room_utilities (room_id, utility_id) VALUES (v_room_id, v_u_table);

            -- Loop 4 Beds per Room
            FOR k IN 1..4 LOOP
                INSERT INTO beds (room_id, bed_number, status, price)
                VALUES (v_room_id, v_room_name || '.' || k, 'AVAILABLE', 1800000 + (i * 50000))
                RETURNING id INTO v_bed_id;

                -- Bed Utilities
                INSERT INTO bed_utilities (bed_id, utility_id) VALUES (v_bed_id, v_u_lamp);
                INSERT INTO bed_utilities (bed_id, utility_id) VALUES (v_bed_id, v_u_mattress);
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

/* 
-- 5. SAMPLE TRANSACTION SEEDING (COMMENTED OUT)
DO $$
DECLARE
    v_rental_id UUID;
    v_bed_id UUID;
    v_contract_id UUID;
BEGIN
    -- Pick the first bed of the first room in Khu A (A.101.1)
    SELECT id INTO v_bed_id FROM beds WHERE bed_number = 'A.101.1' LIMIT 1;

    IF v_bed_id IS NOT NULL THEN
        -- Mark bed as booked
        UPDATE beds SET status = 'BOOKED' WHERE id = v_bed_id;
        
        -- Create Rental Form
        INSERT INTO rental_forms (user_email, deadline, total_amount, type)
        VALUES ('student1@gmail.com', '2026-04-30 23:59:59+07', 500000, 'DEPOSIT')
        RETURNING id INTO v_rental_id;

        -- Link Bed
        INSERT INTO rental_form_beds (rental_form_id, bed_id)
        VALUES (v_rental_id, v_bed_id);

        -- Payment
        INSERT INTO payments (rental_form_id, method, amount, status)
        VALUES (v_rental_id, 'TRANSFER', 500000, 'SUCCESS');

        -- Contract
        INSERT INTO contracts (user_email, start_date, stay_duration, rental_form_id, status)
        VALUES ('student1@gmail.com', '2026-05-01', 12, v_rental_id, 'ACTIVE')
        RETURNING id INTO v_contract_id;

        INSERT INTO contract_beds (contract_id, bed_id)
        VALUES (v_contract_id, v_bed_id);

        -- Handover
        INSERT INTO handovers (contract_id, type)
        VALUES (v_contract_id, 'IN')
        RETURNING id INTO v_rental_id; -- Reuse variable for handover_id

        INSERT INTO handover_beds (handover_id, bed_id, note)
        VALUES (v_rental_id, v_bed_id, 'Phòng A.101, giường số 1. Đã bàn giao đầy đủ thiết bị.');
    END IF;
END $$;
*/

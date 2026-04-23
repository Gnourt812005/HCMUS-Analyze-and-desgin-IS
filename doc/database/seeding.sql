-- SEEDING DATA FOR DORMITORY MANAGEMENT SYSTEM (SCALED VERSION)
-- 5 Dorms, 10 Rooms/Dorm, 4 Beds/Room

-- 1. USERS
INSERT INTO users (email, full_name, password, cccd, birthday, gender, phone, address, role)
VALUES 
('admin@dorm.com', 'Nguyễn Văn Admin', 'password123', '001095000001', '1985-05-20', 'Male', '0901234567', 'Quận 1, TP.HCM', 'ADMIN'),
('manager1@dorm.com', 'Trần Thị Quản Lý', 'password123', '001095000002', '1990-03-15', 'Female', '0902345678', 'Quận 5, TP.HCM', 'MANAGER'),
('sale1@dorm.com', 'Lê Văn Sales', 'password123', '001095000003', '1995-10-10', 'Male', '0903456789', 'Quận 10, TP.HCM', 'SALE_STAFF'),
('student1@gmail.com', 'Phạm Minh Đức', 'password123', '001095000004', '2005-01-01', 'Male', '0904567890', 'Bình Định', 'GUEST'),
('student2@gmail.com', 'Hoàng Thu Thảo', 'password123', '001095000005', '2005-08-20', 'Female', '0905678901', 'Đà Lạt', 'GUEST')
ON CONFLICT (email) DO NOTHING;

-- 2. POLICIES
INSERT INTO policies (title, content, is_active)
VALUES 
('Nội quy Ký túc xá 2024', '1. Giữ gìn vệ sinh chung... 2. Không gây ồn ào sau 23h...', TRUE),
('Quy định Hoàn tiền', 'Tiền cọc sẽ được hoàn lại sau khi trừ chi phí hư hại...', TRUE)
ON CONFLICT DO NOTHING;

-- 3. UTILITIES
INSERT INTO utilities (title, type, is_liable, incurred_price)
VALUES 
('Máy giặt chung', 'DORM', TRUE, 5000000),
('Điều hòa', 'ROOM', TRUE, 8000000),
('Tủ lạnh mini', 'ROOM', TRUE, 3000000),
('Đèn bàn', 'BED', FALSE, 200000)
ON CONFLICT DO NOTHING;

-- 4. MASTER SEEDING BLOCK (Dorms -> Rooms -> Beds)
DO $$
DECLARE
    v_dorm_id UUID;
    v_room_id UUID;
    v_policy_id UUID;
    v_utility_washing_id UUID;
    v_utility_ac_id UUID;
    v_dorm_name TEXT;
    v_room_name TEXT;
BEGIN
    SELECT id INTO v_policy_id FROM policies WHERE title = 'Nội quy Ký túc xá 2024' LIMIT 1;
    SELECT id INTO v_utility_washing_id FROM utilities WHERE title = 'Máy giặt chung' LIMIT 1;
    SELECT id INTO v_utility_ac_id FROM utilities WHERE title = 'Điều hòa' LIMIT 1;

    -- Loop 5 Dorms (A to E)
    FOR i IN 1..5 LOOP
        v_dorm_name := 'KTX Khu ' || CHR(64 + i);
        
        INSERT INTO dorms (name, address, phone, status, total_rooms, available_rooms, manager_id, policy_id)
        VALUES (v_dorm_name, 'Địa chỉ ' || v_dorm_name || ', TP.HCM', '028000000' || i, 'AVAILABLE', 10, 10, 'manager1@dorm.com', v_policy_id)
        RETURNING id INTO v_dorm_id;

        -- Dorm Fees
        INSERT INTO dorm_fees (dorm_id, water_fee, electricity_fee, wifi_fee, cleaning_fee)
        VALUES (v_dorm_id, 50000, 3500, 100000, 20000);

        -- Assign Washing Machine to Dorm
        INSERT INTO dorm_utilities (dorm_id, utility_id, status)
        VALUES (v_dorm_id, v_utility_washing_id, 'GOOD');

        -- Loop 10 Rooms per Dorm
        FOR j IN 1..10 LOOP
            v_room_name := CHR(64 + i) || '.' || (100 + j);
            
            INSERT INTO rooms (dorm_id, name, block, floor, status, total_beds, available_beds)
            VALUES (v_dorm_id, v_room_name, 'Block ' || CHR(64 + i), (j-1)/5 + 1, 'AVAILABLE', 4, 4)
            RETURNING id INTO v_room_id;

            -- Assign AC to Room
            INSERT INTO room_utilities (room_id, utility_id)
            VALUES (v_room_id, v_utility_ac_id);

            -- Loop 4 Beds per Room
            FOR k IN 1..4 LOOP
                INSERT INTO beds (room_id, bed_number, status, price)
                VALUES (v_room_id, v_room_name || '.' || k, 'AVAILABLE', 1500000 + (i * 100000));
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- 5. SAMPLE TRANSACTION (For student1)
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

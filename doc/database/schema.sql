-- =========================================================
-- DORM ARCH SYSTEM - DATABASE SCHEMA (PostgreSQL)
-- Standardized to snake_case, relational integrity, and UUIDs
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS & ROLES
CREATE TABLE users (
    email VARCHAR(255) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    cccd VARCHAR(15) UNIQUE,
    birthday DATE,
    gender VARCHAR(10),
    phone VARCHAR(15),
    address TEXT,
    role VARCHAR(20) DEFAULT 'GUEST', -- GUEST, MANAGER, SALE_STAFF, ADMIN
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. POLICIES
CREATE TABLE policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. DORMS
CREATE TABLE dorms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(15),
    status VARCHAR(20) DEFAULT 'AVAILABLE', -- AVAILABLE, FULL, NEARLY_FULL 
    total_rooms INTEGER DEFAULT 0,
    available_rooms INTEGER DEFAULT 0,
    manager_id VARCHAR(255) REFERENCES users(email),
    image_url TEXT,
    policy_id UUID REFERENCES policies(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dorm_fees (
    dorm_id UUID PRIMARY KEY REFERENCES dorms(id) ON DELETE CASCADE,
    water_fee NUMERIC(12, 2) DEFAULT 0,
    electricity_fee NUMERIC(12, 2) DEFAULT 0,
    wifi_fee NUMERIC(12, 2) DEFAULT 0,
    cleaning_fee NUMERIC(12, 2) DEFAULT 0
);

-- 4. UTILITIES
CREATE TABLE utilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    type VARCHAR(20), -- ROOM, DORM, BED
    is_liable BOOLEAN DEFAULT FALSE,
    incurred_price NUMERIC(12, 2) DEFAULT 0
);

CREATE TABLE dorm_utilities (
    dorm_id UUID REFERENCES dorms(id) ON DELETE CASCADE,
    utility_id UUID REFERENCES utilities(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'GOOD', -- GOOD, BROKEN, MAINTAINED
    PRIMARY KEY (dorm_id, utility_id)
);

-- 5. ROOMS
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dorm_id UUID REFERENCES dorms(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- Room number/name (e.g., A101)
    block VARCHAR(50),
    floor INTEGER,
    status VARCHAR(20) DEFAULT 'AVAILABLE', -- AVAILABLE, FULL, NEARLY_FULL 
    total_beds INTEGER DEFAULT 0,
    available_beds INTEGER DEFAULT 0,
    image_url TEXT,
    policy_id UUID REFERENCES policies(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE room_utilities (
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    utility_id UUID REFERENCES utilities(id) ON DELETE CASCADE,
    PRIMARY KEY (room_id, utility_id)
);

-- 6. BEDS
CREATE TABLE beds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    bed_number VARCHAR(10) NOT NULL,
    status VARCHAR(20) DEFAULT 'AVAILABLE', -- AVAILABLE, DEPOSITED, BOOKED
    price NUMERIC(12, 2) DEFAULT 0
);

-- 7. USER FAVORITES
CREATE TABLE user_favorite_rooms (
    user_email VARCHAR(255) REFERENCES users(email) ON DELETE CASCADE,
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    PRIMARY KEY (user_email, room_id)
);

-- 8. PREVIEW/VIEWING REQUESTS
CREATE TABLE preview_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email VARCHAR(255) REFERENCES users(email),
    room_id UUID REFERENCES rooms(id),
    preview_date TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, CANCELLED
    staff_email VARCHAR(255) REFERENCES users(email),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. RENT / DEPOSIT FORMS
CREATE TABLE rental_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email VARCHAR(255) REFERENCES users(email),
    deadline TIMESTAMPTZ,
    total_amount NUMERIC(12, 2) DEFAULT 0,
    deposit_form_id UUID REFERENCES rental_forms(id),
    type VARCHAR(20), -- DEPOSIT, FULL
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rental_form_beds (
    rental_form_id UUID REFERENCES rental_forms(id) ON DELETE CASCADE,
    bed_id UUID REFERENCES beds(id),
    PRIMARY KEY (rental_form_id, bed_id)
);

-- 10. PAYMENTS
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rental_form_id UUID REFERENCES rental_forms(id),
    method VARCHAR(20), -- QR, TRANSFER
    amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, SUCCESS, FAILED, TIMEOUT
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 11. CONTRACTS
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email VARCHAR(255) REFERENCES users(email),
    start_date DATE NOT NULL,
    stay_duration INTEGER, -- In months
    rental_form_id UUID REFERENCES rental_forms(id),
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, TERMINATED, LIQUIDATED
    signature_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contract_beds (
    contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
    bed_id UUID REFERENCES beds(id),
    PRIMARY KEY (contract_id, bed_id)
);

-- 12. HANDOVERS
CREATE TABLE handovers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
    type VARCHAR(10), -- IN, OUT
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE handover_beds (
    handover_id UUID REFERENCES handovers(id) ON DELETE CASCADE,
    bed_id UUID REFERENCES beds(id),
    -- utility_status JSONB,
    note TEXT,
    PRIMARY KEY (handover_id, bed_id)
);

-- 13. CHECKOUT REQUESTS
CREATE TABLE checkout_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email VARCHAR(255) REFERENCES users(email),
    contract_id UUID REFERENCES contracts(id),
    expected_date DATE NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING', -- PENDING, PROCESSING, LIQUIDATED, CANCELLED
    handover_id UUID REFERENCES handovers(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 14. REFUND CALCULATIONS
CREATE TABLE refund_calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES checkout_requests(id) ON DELETE CASCADE,
    contract_id UUID REFERENCES contracts(id),
    deposit_amount NUMERIC(12, 2) DEFAULT 0,
    damage_fee NUMERIC(12, 2) DEFAULT 0,
    extra_fee NUMERIC(12, 2) DEFAULT 0,
    final_refund_amount NUMERIC(12, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
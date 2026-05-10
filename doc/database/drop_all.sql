-- SCRIPT TO DROP ALL TABLES AND TYPES IN THE DORMITORY SYSTEM
-- CAUTION: This will delete all data permanently.

-- 1. DROP ALL TABLES (Using CASCADE to handle foreign key dependencies)
DROP TABLE IF EXISTS refund_calculations CASCADE;
DROP TABLE IF EXISTS checkout_requests CASCADE;
DROP TABLE IF EXISTS handover_beds CASCADE;
DROP TABLE IF EXISTS handovers CASCADE;
DROP TABLE IF EXISTS contract_beds CASCADE;
DROP TABLE IF EXISTS contracts CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS rental_form_beds CASCADE;
DROP TABLE IF EXISTS rental_forms CASCADE;
DROP TABLE IF EXISTS preview_forms CASCADE;
DROP TABLE IF EXISTS user_favorite_rooms CASCADE;
DROP TABLE IF EXISTS bed_utilities CASCADE;
DROP TABLE IF EXISTS beds CASCADE;
DROP TABLE IF EXISTS room_utilities CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS dorm_utilities CASCADE;
DROP TABLE IF EXISTS utilities CASCADE;
DROP TABLE IF EXISTS dorm_fees CASCADE;
DROP TABLE IF EXISTS dorms CASCADE;
DROP TABLE IF EXISTS policies CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. DROP CUSTOM TYPES (ENUMS)
DROP TYPE IF EXISTS checkout_status_type;
DROP TYPE IF EXISTS handover_type;
DROP TYPE IF EXISTS contract_status_type;
DROP TYPE IF EXISTS payment_status_type;
DROP TYPE IF EXISTS payment_method_type;
DROP TYPE IF EXISTS rental_type;
DROP TYPE IF EXISTS form_status_type;
DROP TYPE IF EXISTS bed_status_type;
DROP TYPE IF EXISTS utility_status_type;
DROP TYPE IF EXISTS utility_type;
DROP TYPE IF EXISTS dorm_room_status_type;
DROP TYPE IF EXISTS user_role_type;

-- 3. FINAL CLEANUP
-- Delete all existing indexes (they are usually dropped with the tables, but just in case)
-- Vacuum to reclaim space
VACUUM;

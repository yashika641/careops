-- ================================================================
-- CareOps Seed Data
-- ================================================================
-- This file contains sample data for testing and development
-- Run this AFTER creating the schema and initial admin user

-- ================================================================
-- SAMPLE CUSTOMERS (You'll need to create these via signup endpoint first)
-- ================================================================
-- Customers will be created through the API signup endpoint
-- These are just reference UUIDs for the sample data below

-- ================================================================
-- SAMPLE STAFF MEMBERS
-- ================================================================
-- NOTE: Staff accounts should be created via the staff signup API endpoint
-- with the proper access code. These are sample staff profiles.

-- Sample Staff Profile 1 (assuming user ID exists)
-- INSERT INTO staff_profiles (id, user_id, specialization, hourly_rate, is_active)
-- VALUES (
--     '11111111-1111-1111-1111-111111111111',
--     'staff-user-id-1',
--     'Home Care Specialist',
--     45.00,
--     true
-- );

-- ================================================================
-- SAMPLE LEADS
-- ================================================================
INSERT INTO leads (id, name, email, phone_number, service_interest, source, status, notes, ai_priority, ai_confidence)
VALUES 
    (
        '21111111-1111-1111-1111-111111111111',
        'John Smith',
        'john.smith@example.com',
        '+1-555-0101',
        'Senior Care',
        'Website',
        'new',
        'Looking for in-home care for elderly parent',
        'high',
        0.85
    ),
    (
        '21111111-2222-2222-2222-222222222222',
        'Sarah Johnson',
        'sarah.j@example.com',
        '+1-555-0102',
        'Physical Therapy',
        'Referral',
        'contacted',
        'Post-surgery rehabilitation needed',
        'high',
        0.92
    ),
    (
        '21111111-3333-3333-3333-333333333333',
        'Michael Brown',
        'mbrown@example.com',
        '+1-555-0103',
        'Mental Health Support',
        'Google Ads',
        'qualified',
        'Seeking counseling services',
        'medium',
        0.75
    ),
    (
        '21111111-4444-4444-4444-444444444444',
        'Emily Davis',
        'emily.davis@example.com',
        '+1-555-0104',
        'Nursing Care',
        'Facebook',
        'new',
        'Round-the-clock nursing required',
        'high',
        0.88
    ),
    (
        '21111111-5555-5555-5555-555555555555',
        'Robert Wilson',
        'r.wilson@example.com',
        '+1-555-0105',
        'Meal Preparation',
        'Website',
        'contacted',
        'Looking for meal prep service 3x per week',
        'medium',
        0.68
    );

-- ================================================================
-- SAMPLE INVENTORY ITEMS
-- ================================================================
INSERT INTO inventory (id, item_name, quantity, supplier, reorder_level, price, category, is_low_stock)
VALUES 
    (
        '31111111-1111-1111-1111-111111111111',
        'Disposable Gloves (Box of 100)',
        150,
        'MediSupply Co',
        50,
        12.99,
        'PPE',
        false
    ),
    (
        '31111111-2222-2222-2222-222222222222',
        'Hand Sanitizer (500ml)',
        45,
        'CleanCare Inc',
        50,
        8.50,
        'Hygiene',
        true
    ),
    (
        '31111111-3333-3333-3333-333333333333',
        'Blood Pressure Monitor',
        25,
        'HealthTech Solutions',
        10,
        89.99,
        'Medical Equipment',
        false
    ),
    (
        '31111111-4444-4444-4444-444444444444',
        'Thermometer (Digital)',
        60,
        'MediSupply Co',
        20,
        15.99,
        'Medical Equipment',
        false
    ),
    (
        '31111111-5555-5555-5555-555555555555',
        'Face Masks (Box of 50)',
        30,
        'SafetyFirst Ltd',
        50,
        18.99,
        'PPE',
        true
    ),
    (
        '31111111-6666-6666-6666-666666666666',
        'Wheelchair',
        8,
        'MobilityAid Pro',
        5,
        450.00,
        'Mobility',
        false
    ),
    (
        '31111111-7777-7777-7777-777777777777',
        'First Aid Kit',
        40,
        'SafetyFirst Ltd',
        15,
        35.00,
        'Emergency',
        false
    ),
    (
        '31111111-8888-8888-8888-888888888888',
        'Pulse Oximeter',
        18,
        'HealthTech Solutions',
        10,
        45.00,
        'Medical Equipment',
        false
    ),
    (
        '31111111-9999-9999-9999-999999999999',
        'Bandages (Assorted)',
        5,
        'MediSupply Co',
        20,
        12.50,
        'First Aid',
        true
    ),
    (
        '31111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'Disinfectant Spray (750ml)',
        75,
        'CleanCare Inc',
        30,
        9.99,
        'Hygiene',
        false
    );

-- ================================================================
-- SAMPLE APPOINTMENTS
-- ================================================================
-- NOTE: These require actual customer_id and staff_id from users table
-- Uncomment and update IDs after creating users

-- INSERT INTO appointments (id, customer_id, service_type, preferred_date, time_slot, location, notes, status, assigned_staff_id)
-- VALUES 
--     (
--         '41111111-1111-1111-1111-111111111111',
--         'customer-user-id-1',
--         'Senior Care Consultation',
--         CURRENT_DATE + INTERVAL '3 days',
--         '10:00 AM - 11:00 AM',
--         '123 Main St, Apt 4B',
--         'Initial consultation for elderly care needs',
--         'confirmed',
--         'staff-user-id-1'
--     ),
--     (
--         '41111111-2222-2222-2222-222222222222',
--         'customer-user-id-2',
--         'Physical Therapy Session',
--         CURRENT_DATE + INTERVAL '5 days',
--         '2:00 PM - 3:00 PM',
--         '456 Oak Avenue',
--         'Post-surgery knee rehabilitation',
--         'pending',
--         NULL
--     ),
--     (
--         '41111111-3333-3333-3333-333333333333',
--         'customer-user-id-3',
--         'Nursing Care',
--         CURRENT_DATE + INTERVAL '1 day',
--         '9:00 AM - 5:00 PM',
--         '789 Pine Road',
--         '8-hour shift, medication administration needed',
--         'confirmed',
--         'staff-user-id-2'
--     );

-- ================================================================
-- NOTES FOR ADMIN SETUP
-- ================================================================
-- To create an admin user, run these steps:

-- 1. Create admin in Supabase Auth Dashboard or via SQL:
-- INSERT INTO auth.users (
--     id,
--     email,
--     encrypted_password,
--     email_confirmed_at,
--     created_at,
--     updated_at
-- ) VALUES (
--     'admin-uuid-here',
--     'admin@careops.com',
--     crypt('your-secure-password', gen_salt('bf')),
--     NOW(),
--     NOW(),
--     NOW()
-- );

-- 2. Add admin to users table:
-- INSERT INTO users (id, email, username, role)
-- VALUES (
--     'admin-uuid-here',
--     'admin@careops.com',
--     'Admin User',
--     'admin'
-- );

-- ================================================================
-- INVENTORY HISTORY SAMPLE
-- ================================================================
-- Sample inventory history entries would be created automatically
-- by the API when inventory is updated

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================
-- Run these to verify seed data was inserted correctly

-- SELECT COUNT(*) as lead_count FROM leads;
-- SELECT COUNT(*) as inventory_count FROM inventory;
-- SELECT COUNT(*) as low_stock_count FROM inventory WHERE is_low_stock = true;
-- SELECT * FROM leads ORDER BY created_at DESC;
-- SELECT * FROM inventory ORDER BY item_name;

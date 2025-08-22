-- Create dummy users for professional verification testing
-- These users will apply for verification (some will be approved, some rejected)

-- Test User 1: Will apply as psychiatrist (should be approved)
INSERT INTO users (first_name, last_name, email, password, status, email_verified, phone_verified, login_attempts, created_at, updated_at, phone)
VALUES ('Shahid', 'Rahman', 'shahid.rahman@email.com', '$2a$10$rLq2l3xJe5k7YhYEe5LKYOHJh5YmJhYaZcRhXcYhZaUhZhYeZhYhY', 'ACTIVE', true, false, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '+8801712345001');

INSERT INTO user_roles (user_id, role)
SELECT id, 'PATIENT' FROM users WHERE email = 'shahid.rahman@email.com';

-- Test User 2: Will apply as psychologist (should be approved)
INSERT INTO users (first_name, last_name, email, password, status, email_verified, phone_verified, login_attempts, created_at, updated_at, phone)
VALUES ('Mariam', 'Ahmed', 'mariam.ahmed@email.com', '$2a$10$rLq2l3xJe5k7YhYEe5LKYOHJh5YmJhYaZcRhXcYhZaUhZhYeZhYhY', 'ACTIVE', true, false, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '+8801812345002');

INSERT INTO user_roles (user_id, role)
SELECT id, 'PATIENT' FROM users WHERE email = 'mariam.ahmed@email.com';

-- Test User 3: Will apply as psychiatrist (should be rejected - invalid BMDC)
INSERT INTO users (first_name, last_name, email, password, status, email_verified, phone_verified, login_attempts, created_at, updated_at, phone)
VALUES ('Tariq', 'Hassan', 'tariq.hassan@email.com', '$2a$10$rLq2l3xJe5k7YhYEe5LKYOHJh5YmJhYaZcRhXcYhZaUhZhYeZhYhY', 'ACTIVE', true, false, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '+8801912345003');

INSERT INTO user_roles (user_id, role)
SELECT id, 'PATIENT' FROM users WHERE email = 'tariq.hassan@email.com';

-- Test User 4: Will apply as psychologist (should be rejected - insufficient qualifications)
INSERT INTO users (first_name, last_name, email, password, status, email_verified, phone_verified, login_attempts, created_at, updated_at, phone)
VALUES ('Sabina', 'Khatun', 'sabina.khatun@email.com', '$2a$10$rLq2l3xJe5k7YhYEe5LKYOHJh5YmJhYaZcRhXcYhZaUhZhYeZhYhY', 'ACTIVE', true, false, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '+8801612345004');

INSERT INTO user_roles (user_id, role)
SELECT id, 'PATIENT' FROM users WHERE email = 'sabina.khatun@email.com';

-- Test User 5: Regular patient (won't apply for verification)
INSERT INTO users (first_name, last_name, email, password, status, email_verified, phone_verified, login_attempts, created_at, updated_at, phone)
VALUES ('Rohit', 'Das', 'rohit.das@email.com', '$2a$10$rLq2l3xJe5k7YhYEe5LKYOHJh5YmJhYaZcRhXcYhZaUhZhYeZhYhY', 'ACTIVE', true, false, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '+8801512345005');

INSERT INTO user_roles (user_id, role)
SELECT id, 'PATIENT' FROM users WHERE email = 'rohit.das@email.com';

-- Add some sample verification applications to test the admin interface
-- Application 1: Pending application from Shahid (Psychiatrist)
INSERT INTO professional_verifications (
    user_id, professional_type, bmdc_number, specialization, experience_years,
    license_document_url, degree_document_url, languages_spoken, clinic_address,
    contact_email, contact_phone, status, correlation_id, created_at, updated_at
)
SELECT 
    u.id, 'PSYCHIATRIST', 'BMDC-TEST-001', 'General Psychiatry', 5,
    'https://example.com/documents/shahid_license.pdf',
    'https://example.com/documents/shahid_degree.pdf',
    '["Bengali", "English"]',
    '123 Test Street, Dhaka-1000',
    'shahid.rahman@email.com',
    '+8801712345001',
    'PENDING',
    CONCAT('PROF_', EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) * 1000, '_', u.id),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM users u WHERE u.email = 'shahid.rahman@email.com';

-- Application 2: Pending application from Mariam (Psychologist)
INSERT INTO professional_verifications (
    user_id, professional_type, degree_institution, degree_title, affiliation,
    specialization, experience_years, license_document_url, degree_document_url,
    languages_spoken, clinic_address, contact_email, contact_phone, status,
    correlation_id, created_at, updated_at
)
SELECT 
    u.id, 'PSYCHOLOGIST', 'University of Dhaka', 'Masters in Clinical Psychology',
    'Bangladesh Psychological Society', 'Cognitive Behavioral Therapy', 4,
    'https://example.com/documents/mariam_license.pdf',
    'https://example.com/documents/mariam_degree.pdf',
    '["Bengali", "English", "Hindi"]',
    '456 Psychology Center, Dhanmondi, Dhaka',
    'mariam.ahmed@email.com',
    '+8801812345002',
    'PENDING',
    CONCAT('PROF_', EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) * 1000 + 1, '_', u.id),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM users u WHERE u.email = 'mariam.ahmed@email.com';

-- Application 3: Under Review application from Tariq (will be rejected)
INSERT INTO professional_verifications (
    user_id, professional_type, bmdc_number, specialization, experience_years,
    license_document_url, degree_document_url, languages_spoken, clinic_address,
    contact_email, contact_phone, status, correlation_id, created_at, updated_at
)
SELECT 
    u.id, 'PSYCHIATRIST', 'INVALID-BMDC', 'Depression Treatment', 2,
    'https://example.com/documents/tariq_license.pdf',
    'https://example.com/documents/tariq_degree.pdf',
    '["Bengali"]',
    '789 Medical Plaza, Gulshan, Dhaka',
    'tariq.hassan@email.com',
    '+8801912345003',
    'UNDER_REVIEW',
    CONCAT('PROF_', EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) * 1000 + 2, '_', u.id),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM users u WHERE u.email = 'tariq.hassan@email.com';

-- All users will have the default password: "password123"
-- You can log in with any of these emails and password "password123" to test

-- Display the created test accounts
SELECT 
    u.id,
    u.first_name,
    u.last_name,
    u.email,
    u.phone,
    u.status,
    STRING_AGG(ur.role, ', ') as roles
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE u.email IN (
    'shahid.rahman@email.com',
    'mariam.ahmed@email.com', 
    'tariq.hassan@email.com',
    'sabina.khatun@email.com',
    'rohit.das@email.com'
)
GROUP BY u.id, u.first_name, u.last_name, u.email, u.phone, u.status
ORDER BY u.id;

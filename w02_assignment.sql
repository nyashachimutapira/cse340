-- ============================================================================
-- W02 Learning Activity: Database Review - Complete Assignment
-- Using PostgreSQL (Local Postgres Connection)
-- ============================================================================

-- ============================================================================
-- QUESTION 1 & 2: PRIMARY KEYS AND FOREIGN KEYS
-- ============================================================================

-- Create a users table with PRIMARY KEY
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    join_date DATE DEFAULT CURRENT_DATE
);

-- Insert sample user data
INSERT INTO users (username, email, join_date) VALUES
    ('johndoe', 'john@example.com', '2023-01-15'),
    ('janedoe', 'jane@example.com', '2023-02-20'),
    ('bobsmith', 'bob@example.com', '2023-03-05');

-- View the users table
SELECT * FROM users;

-- ============================================================================
-- QUESTION 3: ONE-TO-ONE (1:1) RELATIONSHIP
-- ============================================================================

-- Create student_details table with UNIQUE foreign key (ensures 1:1)
CREATE TABLE student_details (
    detail_id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL,  -- UNIQUE ensures one-to-one
    address TEXT,
    phone VARCHAR(20),
    medical_notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users (user_id)
);

-- Insert student details (each user has exactly one detail record)
INSERT INTO student_details (user_id, address, phone, medical_notes) VALUES
    (1, '123 Main St', '555-0101', 'No allergies'),
    (2, '456 Oak Ave', '555-0102', 'Peanut allergy'),
    (3, '789 Pine Rd', '555-0103', 'Asthma');

-- Query 1:1 relationship
SELECT u.username, sd.address, sd.phone
FROM users u
JOIN student_details sd ON u.user_id = sd.user_id;

-- ============================================================================
-- QUESTION 3: ONE-TO-MANY (1:N) RELATIONSHIP
-- ============================================================================

-- Create departments table
CREATE TABLE departments (
    department_id SERIAL PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL
);

-- Create employees table with foreign key to departments
CREATE TABLE employees (
    employee_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    department_id INTEGER,
    FOREIGN KEY (department_id) REFERENCES departments (department_id)
);

-- Insert departments
INSERT INTO departments (department_name) VALUES
    ('Engineering'),
    ('Marketing'),
    ('Sales');

-- Insert employees (multiple per department = 1:N)
INSERT INTO employees (first_name, last_name, department_id) VALUES
    ('Alice', 'Johnson', 1),
    ('Bob', 'Williams', 1),
    ('Carol', 'Brown', 2),
    ('David', 'Miller', 3);

-- Query 1:N relationship - show all employees in each department
SELECT d.department_name, e.first_name, e.last_name
FROM departments d
LEFT JOIN employees e ON d.department_id = e.department_id
ORDER BY d.department_name;

-- ============================================================================
-- QUESTION 3: MANY-TO-MANY (N:M) RELATIONSHIP
-- ============================================================================

-- Create courses table
CREATE TABLE courses (
    course_id SERIAL PRIMARY KEY,
    course_name VARCHAR(100) NOT NULL,
    credits INTEGER
);

-- Create enrollments junction table for N:M relationship
CREATE TABLE enrollments (
    student_id INTEGER,
    course_id INTEGER,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    grade CHAR(2),
    PRIMARY KEY (student_id, course_id),  -- Composite primary key
    FOREIGN KEY (student_id) REFERENCES users (user_id),
    FOREIGN KEY (course_id) REFERENCES courses (course_id)
);

-- Insert courses
INSERT INTO courses (course_name, credits) VALUES
    ('Database Design', 3),
    ('Web Development', 4),
    ('Data Structures', 3),
    ('Systems Programming', 4);

-- Insert enrollments (students in multiple courses, courses with multiple students)
INSERT INTO enrollments (student_id, course_id, grade) VALUES
    (1, 1, 'A'),
    (1, 2, 'B+'),
    (2, 1, 'B'),
    (2, 3, 'A'),
    (3, 2, 'A-'),
    (3, 4, 'B');

-- Query N:M relationship - show all courses for a student
SELECT u.username, c.course_name, c.credits, e.grade
FROM users u
JOIN enrollments e ON u.user_id = e.student_id
JOIN courses c ON e.course_id = c.course_id
ORDER BY u.username, c.course_name;

-- ============================================================================
-- QUESTION 5: INDEXES AND QUERY PERFORMANCE
-- ============================================================================

-- Create an index on the email column (frequently searched)
CREATE INDEX idx_users_email ON users(email);

-- Create an index on the foreign key for faster joins
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);

-- Without index (full table scan)
-- SELECT * FROM users WHERE email = 'john@example.com';

-- With index (fast lookup - uses B-tree)
SELECT * FROM users WHERE email = 'john@example.com';

-- View all indexes in the current schema
SELECT indexname FROM pg_indexes WHERE schemaname = 'public';

-- ============================================================================
-- QUESTION 6: SQL JOINs
-- ============================================================================

-- INNER JOIN: Only matching records
-- Returns students and their course grades (only where student is enrolled)
SELECT u.username, c.course_name, e.grade
FROM users u
INNER JOIN enrollments e ON u.user_id = e.student_id
INNER JOIN courses c ON e.course_id = c.course_id;

-- LEFT JOIN: All from left table + matching from right
-- Returns all users, and their enrollments (NULL if not enrolled)
SELECT u.username, c.course_name, e.grade
FROM users u
LEFT JOIN enrollments e ON u.user_id = e.student_id
LEFT JOIN courses c ON e.course_id = c.course_id
ORDER BY u.username;

-- RIGHT JOIN: All from right table + matching from left
-- Returns all courses, and students enrolled (NULL if no students)
SELECT u.username, c.course_name, e.grade
FROM users u
RIGHT JOIN enrollments e ON u.user_id = e.student_id
RIGHT JOIN courses c ON e.course_id = c.course_id
ORDER BY c.course_name;

-- FULL OUTER JOIN: All records from both tables
-- Returns all users AND all courses, with NULL where no match
SELECT u.username, c.course_name, e.grade
FROM users u
FULL OUTER JOIN enrollments e ON u.user_id = e.student_id
FULL OUTER JOIN courses c ON e.course_id = c.course_id
ORDER BY u.username, c.course_name;

-- ============================================================================
-- BONUS: DEMONSTRATING DATA PERSISTENCE
-- ============================================================================

-- These records will persist even if the server restarts
-- Without a database, restarting would lose all this data
SELECT 'Data persists across server restarts' as concept;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_enrollments FROM enrollments;

-- ============================================================================
-- CLEANUP (Optional - uncomment to delete demo tables)
-- ============================================================================

-- DROP TABLE IF EXISTS enrollments;
-- DROP TABLE IF EXISTS courses;
-- DROP TABLE IF EXISTS employees;
-- DROP TABLE IF EXISTS departments;
-- DROP TABLE IF EXISTS student_details;
-- DROP TABLE IF EXISTS users;

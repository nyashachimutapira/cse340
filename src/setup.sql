-- ============================================================================
-- W02 Learning Activity: Creating Tables and Inserting Data
-- Setup SQL for Service Organizations Application
-- ============================================================================

-- ============================================================================
-- CREATE ORGANIZATION TABLE
-- ============================================================================
-- Table: organization
-- Purpose: Stores information about service organizations
-- 
-- Columns:
-- - organization_id: Unique identifier (auto-incrementing, primary key)
-- - name: Organization name (required)
-- - description: Organization description (required)
-- - contact_email: Organization contact email (required)
-- - logo_filename: Name of the organization's logo image file (required)

CREATE TABLE organization (
    organization_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    logo_filename VARCHAR(255) NOT NULL
);

-- ============================================================================
-- INSERT SAMPLE DATA
-- ============================================================================
-- Insert three sample organizations for testing and development

INSERT INTO organization (name, description, contact_email, logo_filename)
VALUES (
    'BrightFuture Builders',
    'A nonprofit focused on improving community infrastructure through sustainable construction projects.',
    'info@brightfuturebuilders.org',
    'brightfuture-logo.png'
);

INSERT INTO organization (name, description, contact_email, logo_filename)
VALUES (
    'GreenHarvest Growers',
    'An urban farming collective promoting food sustainability and education in local neighborhoods.',
    'contact@greenharvest.org',
    'greenharvest-logo.png'
);

INSERT INTO organization (name, description, contact_email, logo_filename)
VALUES (
    'UnityServe Volunteers',
    'A volunteer coordination group supporting local charities and service initiatives.',
    'hello@unityserve.org',
    'unityserve-logo.png'
);

-- ============================================================================
-- VERIFY DATA INSERTION
-- ============================================================================
-- Select all records from the organization table to verify data insertion

SELECT * FROM organization;

-- ============================================================================
-- CREATE SERVICE_PROJECTS TABLE
-- ============================================================================
-- Table: service_projects
-- Purpose: Stores information about service projects offered by organizations
-- 
-- Columns:
-- - project_id: Unique identifier (auto-incrementing, primary key)
-- - organization_id: Foreign key referencing the sponsoring organization
-- - title: Project title (required)
-- - description: Project description (required)
-- - location: Project location (required)
-- - project_date: Date when the project takes place (required)

CREATE TABLE service_projects (
    project_id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(200) NOT NULL,
    project_date DATE NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES organization (organization_id)
);

-- ============================================================================
-- INSERT SAMPLE SERVICE PROJECTS DATA
-- ============================================================================
-- Insert 5+ sample projects for each organization

-- BrightFuture Builders Projects (organization_id = 1)
INSERT INTO service_projects (organization_id, title, description, location, project_date)
VALUES (
    1,
    'Community Center Renovation',
    'Renovate and modernize the local community center with sustainable building practices.',
    '123 Main Street, Downtown',
    '2026-06-15'
);

INSERT INTO service_projects (organization_id, title, description, location, project_date)
VALUES (
    1,
    'Affordable Housing Construction',
    'Build affordable housing units for families in need within the community.',
    '456 Oak Avenue, Midtown',
    '2026-07-20'
);

INSERT INTO service_projects (organization_id, title, description, location, project_date)
VALUES (
    1,
    'School Playground Infrastructure',
    'Design and build a new playground with sustainable materials at Lincoln Elementary.',
    '789 Elm Street, School District',
    '2026-08-10'
);

INSERT INTO service_projects (organization_id, title, description, location, project_date)
VALUES (
    1,
    'Public Park Restoration',
    'Restore and upgrade public parks with eco-friendly infrastructure.',
    'Central Park, Downtown',
    '2026-09-05'
);

INSERT INTO service_projects (organization_id, title, description, location, project_date)
VALUES (
    1,
    'Water Conservation Initiative',
    'Install rainwater harvesting systems in community buildings.',
    'Multiple Community Locations',
    '2026-10-12'
);

-- GreenHarvest Growers Projects (organization_id = 2)
INSERT INTO service_projects (organization_id, title, description, location, project_date)
VALUES (
    2,
    'Urban Garden Establishment',
    'Create a community urban garden with raised beds and composting facilities.',
    '234 Green Lane, Garden District',
    '2026-05-20'
);

INSERT INTO service_projects (organization_id, title, description, location, project_date)
VALUES (
    2,
    'Food Sustainability Workshop',
    'Teach local residents about sustainable food production and gardening techniques.',
    'Community Center, Downtown',
    '2026-06-08'
);

INSERT INTO service_projects (organization_id, title, description, location, project_date)
VALUES (
    2,
    'School Nutrition Education Program',
    'Develop curriculum and hands-on learning about healthy eating and farming.',
    'Multiple Schools, City Wide',
    '2026-07-15'
);

INSERT INTO service_projects (organization_id, title, description, location, project_date)
VALUES (
    2,
    'Farmers Market Setup',
    'Organize and support weekly farmers markets to promote local produce.',
    'Central Plaza, Downtown',
    '2026-08-01'
);

INSERT INTO service_projects (organization_id, title, description, location, project_date)
VALUES (
    2,
    'Composting Education Program',
    'Launch a city-wide composting initiative with educational seminars.',
    'Various Neighborhood Locations',
    '2026-09-10'
);

-- UnityServe Volunteers Projects (organization_id = 3)
INSERT INTO service_projects (organization_id, title, description, location, project_date)
VALUES (
    3,
    'Senior Companion Program',
    'Match volunteers with senior citizens for companionship and support.',
    'Community Centers Across City',
    '2026-05-15'
);

INSERT INTO service_projects (organization_id, title, description, location, project_date)
VALUES (
    3,
    'Youth Mentorship Initiative',
    'Provide mentoring and guidance to at-risk youth in the community.',
    'Youth Community Center, Midtown',
    '2026-06-20'
);

INSERT INTO service_projects (organization_id, title, description, location, project_date)
VALUES (
    3,
    'Community Food Bank Drive',
    'Organize volunteers to collect and distribute food to families in need.',
    'Food Bank Distribution Center',
    '2026-07-25'
);

INSERT INTO service_projects (organization_id, title, description, location, project_date)
VALUES (
    3,
    'Environmental Cleanup Day',
    'Coordinate volunteers for park and neighborhood cleanup efforts.',
    'Multiple Neighborhood Parks',
    '2026-08-18'
);

INSERT INTO service_projects (organization_id, title, description, location, project_date)
VALUES (
    3,
    'Homeless Support Services',
    'Provide warm meals, clothing, and resources to homeless individuals.',
    'Community Shelter, Downtown',
    '2026-09-22'
);

-- ============================================================================
-- VERIFY SERVICE PROJECTS DATA INSERTION
-- ============================================================================
-- Select all records from the service_projects table with organization names

SELECT 
    sp.project_id,
    sp.title,
    sp.description,
    sp.location,
    sp.project_date,
    o.name as organization_name
FROM service_projects sp
JOIN organization o ON sp.organization_id = o.organization_id
ORDER BY sp.project_date;

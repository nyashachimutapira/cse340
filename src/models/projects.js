import db from './db.js';

/**
 * Retrieves all service projects from the database along with their organization names.
 * 
 * This function uses a JOIN to combine data from the service_projects and organization
 * tables, providing both project details and the name of the organization that sponsors it.
 * 
 * @returns {Promise<Array>} Array of project objects with the following properties:
 *   - project_id: Unique identifier for the project
 *   - organization_id: Identifier of the sponsoring organization
 *   - title: Project title
 *   - description: Project description
 *   - location: Project location
 *   - project_date: Date of the project
 *   - organization_name: Name of the sponsoring organization
 */
const getAllProjects = async() => {
    const query = `
        SELECT 
            sp.project_id, 
            sp.organization_id, 
            sp.title, 
            sp.description, 
            sp.location, 
            sp.project_date,
            o.name as organization_name
        FROM service_projects sp
        JOIN organization o ON sp.organization_id = o.organization_id
        ORDER BY sp.project_date;
    `;

    const result = await db.query(query);

    return result.rows;
};

const getProjectsByOrganizationId = async (organizationId) => {
      const query = `
        SELECT
          project_id,
          organization_id,
          title,
          description,
          location,
          project_date
        FROM service_projects
        WHERE organization_id = $1
        ORDER BY project_date;
      `;
      
      const queryParams = [organizationId];
      const result = await db.query(query, queryParams);

      return result.rows;
};

const getUpcomingProjects = async (numberOfProjects) => {
    const query = `
        SELECT 
            sp.project_id, 
            sp.organization_id, 
            sp.title, 
            sp.description, 
            sp.location, 
            sp.project_date,
            o.name as organization_name
        FROM service_projects sp
        JOIN organization o ON sp.organization_id = o.organization_id
        WHERE sp.project_date >= CURRENT_DATE
        ORDER BY sp.project_date ASC
        LIMIT $1;
    `;

    const result = await db.query(query, [numberOfProjects]);
    return result.rows;
};

const getProjectDetails = async (projectId) => {
    const query = `
        SELECT 
            sp.project_id, 
            sp.organization_id, 
            sp.title, 
            sp.description, 
            sp.location, 
            sp.project_date,
            o.name as organization_name
        FROM service_projects sp
        JOIN organization o ON sp.organization_id = o.organization_id
        WHERE sp.project_id = $1;
    `;

    const result = await db.query(query, [projectId]);
    return result.rows.length > 0 ? result.rows[0] : null;
};

const getProjectsByCategoryId = async (categoryId) => {
    const query = `
        SELECT 
            sp.project_id, 
            sp.organization_id, 
            sp.title, 
            sp.description, 
            sp.location, 
            sp.project_date,
            o.name as organization_name
        FROM service_projects sp
        JOIN project_category pc ON sp.project_id = pc.project_id
        JOIN organization o ON sp.organization_id = o.organization_id
        WHERE pc.category_id = $1
        ORDER BY sp.project_date ASC;
    `;

    const result = await db.query(query, [categoryId]);
    return result.rows;
};

const createProject = async (title, description, location, date, organizationId) => {
    const query = `
        INSERT INTO service_projects (title, description, location, project_date, organization_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING project_id;
    `;

    const queryParams = [title, description, location, date, organizationId];
    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
        throw new Error('Failed to create service project');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Created new service project with ID:', result.rows[0].project_id);
    }

    return result.rows[0].project_id;
};

const updateProject = async (projectId, title, description, location, date, organizationId) => {
    const query = `
        UPDATE service_projects
        SET title = $1, description = $2, location = $3, project_date = $4, organization_id = $5
        WHERE project_id = $6
        RETURNING project_id;
    `;

    const queryParams = [title, description, location, date, organizationId, projectId];
    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
        throw new Error('Project not found');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Updated service project with ID:', projectId);
    }

    return result.rows[0].project_id;
};

/**
 * Adds a user as a volunteer for a specific project.
 * 
 * @param {number} projectId - ID of the project
 * @param {number} userId - ID of the user
 */
const addVolunteer = async (projectId, userId) => {
    const query = `
        INSERT INTO project_volunteer (project_id, user_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING;
    `;
    await db.query(query, [projectId, userId]);
};

/**
 * Removes a user as a volunteer from a specific project.
 * 
 * @param {number} projectId - ID of the project
 * @param {number} userId - ID of the user
 */
const removeVolunteer = async (projectId, userId) => {
    const query = `
        DELETE FROM project_volunteer
        WHERE project_id = $1 AND user_id = $2;
    `;
    await db.query(query, [projectId, userId]);
};

/**
 * Retrieves all projects that a specific user has volunteered for.
 * 
 * @param {number} userId - ID of the user
 * @returns {Promise<Array>} List of projects
 */
const getProjectsByVolunteer = async (userId) => {
    const query = `
        SELECT 
            sp.project_id, 
            sp.organization_id, 
            sp.title, 
            sp.description, 
            sp.location, 
            sp.project_date,
            o.name as organization_name
        FROM service_projects sp
        JOIN project_volunteer pv ON sp.project_id = pv.project_id
        JOIN organization o ON sp.organization_id = o.organization_id
        WHERE pv.user_id = $1
        ORDER BY sp.project_date ASC;
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
};

/**
 * Checks if a specific user has volunteered for a project.
 * 
 * @param {number} projectId - ID of the project
 * @param {number} userId - ID of the user
 * @returns {Promise<boolean>} True if the user has volunteered, false otherwise
 */
const isUserVolunteering = async (projectId, userId) => {
    const query = `
        SELECT 1 
        FROM project_volunteer
        WHERE project_id = $1 AND user_id = $2;
    `;
    const result = await db.query(query, [projectId, userId]);
    return result.rows.length > 0;
};

// Export the model functions
export { 
    getAllProjects, 
    getProjectsByOrganizationId, 
    getUpcomingProjects, 
    getProjectDetails,
    getProjectsByCategoryId,
    createProject,
    updateProject,
    addVolunteer,
    removeVolunteer,
    getProjectsByVolunteer,
    isUserVolunteering
};

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

// Export the model functions
export { 
    getAllProjects, 
    getProjectsByOrganizationId, 
    getUpcomingProjects, 
    getProjectDetails,
    getProjectsByCategoryId
};

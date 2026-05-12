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

export { getAllProjects };

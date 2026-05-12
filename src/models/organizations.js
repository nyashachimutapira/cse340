import db from './db.js';

/**
 * Retrieves all organizations from the database.
 * 
 * @returns {Promise<Array>} Array of organization objects with the following properties:
 *   - organization_id: Unique identifier for the organization
 *   - name: Organization name
 *   - description: Organization description
 *   - contact_email: Organization contact email
 *   - logo_filename: Filename of the organization's logo image
 */
const getAllOrganizations = async() => {
    const query = `
        SELECT organization_id, name, description, contact_email, logo_filename
        FROM public.organization;
    `;

    const result = await db.query(query);

    return result.rows;
};

export { getAllOrganizations };

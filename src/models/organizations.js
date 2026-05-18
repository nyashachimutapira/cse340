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

const getOrganizationDetails = async (organizationId) => {
      const query = `
      SELECT
        organization_id,
        name,
        description,
        contact_email,
        logo_filename
      FROM organization
      WHERE organization_id = $1;
    `;

      const queryParams = [organizationId];
      const result = await db.query(query, queryParams);

      // Return the first row of the result set, or null if no rows are found
      return result.rows.length > 0 ? result.rows[0] : null;
};

// Export the model functions
export { getAllOrganizations, getOrganizationDetails };

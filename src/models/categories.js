import db from './db.js';

/**
 * Retrieves all categories from the database.
 * 
 * @returns {Promise<Array>} Array of category objects with the following properties:
 *   - category_id: Unique identifier for the category
 *   - name: Category name
 */
const getAllCategories = async() => {
    const query = `
        SELECT category_id, name
        FROM public.category
        ORDER BY name;
    `;

    const result = await db.query(query);

    return result.rows;
};

export { getAllCategories };

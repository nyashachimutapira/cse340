import bcrypt from 'bcrypt';
import db from './db.js';

const createUser = async (name, email, passwordHash) => {
    const defaultRole = 'user';
    const query = `
        INSERT INTO users (name, email, password_hash, role_id)
        VALUES ($1, $2, $3, (SELECT role_id FROM roles WHERE role_name = $4))
        RETURNING user_id
    `;
    const queryParams = [name, email, passwordHash, defaultRole];

    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
        throw new Error('Failed to create user');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Created new user with ID:', result.rows[0].user_id);
    }

    return result.rows[0].user_id;
};

const findUserByEmail = async (email) => {
    const query = `
        SELECT u.user_id, u.name, u.email, u.password_hash, r.role_name
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.email = $1
    `;
    const queryParams = [email];

    const result = await db.query(query, queryParams);
    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
};

const verifyPassword = async (password, passwordHash) => {
    return bcrypt.compare(password, passwordHash);
};

const authenticateUser = async (email, password) => {
    const user = await findUserByEmail(email);
    if (!user) {
        return null;
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
        return null;
    }

    const { password_hash, ...publicUser } = user;
    return publicUser;
};

const getAllUsers = async () => {
    const query = `
        SELECT u.user_id, u.name, u.email, r.role_name
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        ORDER BY u.name ASC
    `;

    const result = await db.query(query);

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log(`Retrieved ${result.rows.length} users from database`);
    }

    return result.rows;
};

const createUserWithRole = async (name, email, passwordHash, roleName) => {
    const query = `
        INSERT INTO users (name, email, password_hash, role_id)
        VALUES ($1, $2, $3, (SELECT role_id FROM roles WHERE role_name = $4))
        RETURNING user_id
    `;
    const queryParams = [name, email, passwordHash, roleName];

    const result = await db.query(query, queryParams);

    if (result.rows.length === 0) {
        throw new Error('Failed to create user with role');
    }

    return result.rows[0].user_id;
};

const ensureAdminUserExists = async () => {
    const adminEmail = 'admin@example.com';
    const adminName = 'Admin User';
    const adminPassword = 'cse340!';
    const existingUser = await findUserByEmail(adminEmail);

    if (existingUser) {
        if (existingUser.role_name !== 'admin') {
            await db.query(
                `UPDATE users
                 SET role_id = (SELECT role_id FROM roles WHERE role_name = 'admin')
                 WHERE email = $1`,
                [adminEmail]
            );
        }
        return;
    }

    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await createUserWithRole(adminName, adminEmail, passwordHash, 'admin');
};

export { createUser, authenticateUser, getAllUsers, ensureAdminUserExists };

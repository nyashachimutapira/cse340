import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_URL = process.env.DB_URL;
if (!DB_URL) {
    console.error('DB_URL is not set in environment.');
    process.exit(1);
}

const pool = new pg.Pool({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        console.log('Reading src/setup.sql...');
        const sqlPath = path.join(__dirname, 'src', 'setup.sql');
        let sql = fs.readFileSync(sqlPath, 'utf8');
        
        // Drop tables first to ensure a clean run
        const dropSql = `
            DROP TABLE IF EXISTS project_category CASCADE;
            DROP TABLE IF EXISTS category CASCADE;
            DROP TABLE IF EXISTS service_projects CASCADE;
            DROP TABLE IF EXISTS organization CASCADE;
            DROP TABLE IF EXISTS users CASCADE;
            DROP TABLE IF EXISTS roles CASCADE;
        `;
        
        sql = dropSql + '\n' + sql;

        console.log('Executing SQL (including DROPs) on remote database...');
        await pool.query(sql);
        console.log('Database schema setup completed successfully!');
    } catch (err) {
        console.error('Error executing setup.sql:', err);
    } finally {
        await pool.end();
    }
}

main();

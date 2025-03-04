import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

// Create a new pool using environment variables
export const pool = new Pool({
  user: process.env.DB_USER || 'rosali',
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'todo-app'  // Make sure this matches your database name
});

// Initialize database
export const initDb = async () => {
  try {
    // Test the connection first
    await pool.query('SELECT NOW()');
    console.log('Database connection successful');

    // Read and execute init.sql
    const initSQL = fs.readFileSync(
      path.join(__dirname, 'init.sql'),
      'utf-8'
    );
    await pool.query(initSQL);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Error handling for the pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool; 
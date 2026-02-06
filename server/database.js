import pkg from 'pg';
const { Pool } = pkg;
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Determine which database to use
const usePostgres = !!process.env.DATABASE_URL;
let db;
let pool;

if (usePostgres) {
  // PostgreSQL connection
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  
  pool.on('connect', () => {
    console.log('Connected to PostgreSQL database');
  });
  
  pool.on('error', (err) => {
    console.error('PostgreSQL pool error:', err);
  });
  
  initializePostgresDatabase();
} else {
  // SQLite connection (for local development)
  const DB_PATH = process.env.DB_PATH || join(__dirname, '../data/leave_tracker.db');
  
  const dataDir = dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Error opening database:', err);
    } else {
      console.log('Connected to SQLite database');
      initializeSQLiteDatabase();
    }
  });
}

async function initializePostgresDatabase() {
  try {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Employees table
      await client.query(`
        CREATE TABLE IF NOT EXISTS employees (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          email TEXT,
          team TEXT,
          gender TEXT,
          total_pto_days INTEGER DEFAULT 20,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Leave records table
      await client.query(`
        CREATE TABLE IF NOT EXISTS leaves (
          id SERIAL PRIMARY KEY,
          employee_id INTEGER NOT NULL,
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          days_count INTEGER NOT NULL,
          leave_type TEXT NOT NULL CHECK(leave_type IN ('Planned', 'Unplanned', 'Maternity Leave', 'Paternity Leave')),
          status TEXT DEFAULT 'Approved' CHECK(status IN ('Pending', 'Approved', 'Rejected')),
          reason TEXT,
          email_id TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE
        )
      `);
      
      // Email sync log
      await client.query(`
        CREATE TABLE IF NOT EXISTS email_sync_log (
          id SERIAL PRIMARY KEY,
          last_sync TIMESTAMP,
          emails_processed INTEGER DEFAULT 0,
          status TEXT
        )
      `);
      
      await client.query('COMMIT');
      console.log('PostgreSQL database tables initialized');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error initializing PostgreSQL database:', err);
  }
}

function initializeSQLiteDatabase() {
  db.serialize(() => {
    // Employees table
    db.run(`
      CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        email TEXT,
        team TEXT,
        total_pto_days INTEGER DEFAULT 20,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migration: Add team column if it doesn't exist
    db.get(`SELECT COUNT(*) as count FROM pragma_table_info('employees') WHERE name='team'`, [], (err, row) => {
      if (!err && row && row.count === 0) {
        db.run(`ALTER TABLE employees ADD COLUMN team TEXT`, (err) => {
          if (!err) {
            console.log('Added team column to employees table');
          }
        });
      }
    });

    // Migration: Add gender column if it doesn't exist
    db.get(`SELECT COUNT(*) as count FROM pragma_table_info('employees') WHERE name='gender'`, [], (err, row) => {
      if (!err && row && row.count === 0) {
        db.run(`ALTER TABLE employees ADD COLUMN gender TEXT`, (err) => {
          if (!err) {
            console.log('Added gender column to employees table');
          }
        });
      }
    });

    // Leave records table
    db.run(`
      CREATE TABLE IF NOT EXISTS leaves (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        days_count INTEGER NOT NULL,
        leave_type TEXT NOT NULL CHECK(leave_type IN ('Planned', 'Unplanned', 'Maternity Leave', 'Paternity Leave')),
        status TEXT DEFAULT 'Approved' CHECK(status IN ('Pending', 'Approved', 'Rejected')),
        reason TEXT,
        email_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees (id)
      )
    `);

    // Email sync log
    db.run(`
      CREATE TABLE IF NOT EXISTS email_sync_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        last_sync DATETIME,
        emails_processed INTEGER DEFAULT 0,
        status TEXT
      )
    `);

    console.log('SQLite database tables initialized');
  });
}

// Helper function to convert SQLite ? placeholders to PostgreSQL $1, $2, $3
function convertPlaceholders(query) {
  if (!usePostgres) return query;
  
  let index = 1;
  return query.replace(/\?/g, () => `$${index++}`);
}

// Helper function to convert SQLite date functions to PostgreSQL
function convertDateFunctions(query) {
  if (!usePostgres) return query;
  
  // Convert strftime('%Y', column) to EXTRACT(YEAR FROM column)::text
  query = query.replace(/strftime\('%Y',\s*([^)]+)\)/g, "EXTRACT(YEAR FROM $1)::text");
  
  // Convert strftime('%m', column) to LPAD(EXTRACT(MONTH FROM column)::text, 2, '0')
  query = query.replace(/strftime\('%m',\s*([^)]+)\)/g, "LPAD(EXTRACT(MONTH FROM $1)::text, 2, '0')");
  
  // Convert DATETIME to TIMESTAMP
  query = query.replace(/DATETIME/g, 'TIMESTAMP');
  
  return query;
}

// Database helper functions
export const dbAll = async (query, params = []) => {
  if (usePostgres) {
    let pgQuery = convertDateFunctions(query);
    pgQuery = convertPlaceholders(pgQuery);
    const result = await pool.query(pgQuery, params);
    return result.rows;
  } else {
    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};

export const dbGet = async (query, params = []) => {
  if (usePostgres) {
    let pgQuery = convertDateFunctions(query);
    pgQuery = convertPlaceholders(pgQuery);
    const result = await pool.query(pgQuery, params);
    return result.rows[0];
  } else {
    return new Promise((resolve, reject) => {
      db.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
};

export const dbRun = async (query, params = []) => {
  if (usePostgres) {
    let pgQuery = convertDateFunctions(query);
    pgQuery = convertPlaceholders(pgQuery);
    // For INSERT queries, add RETURNING id
    let finalQuery = pgQuery;
    if (pgQuery.trim().toUpperCase().startsWith('INSERT')) {
      if (!pgQuery.toUpperCase().includes('RETURNING')) {
        finalQuery = pgQuery.trim() + ' RETURNING id';
      }
    }
    const result = await pool.query(finalQuery, params);
    return { 
      id: result.rows[0]?.id || result.rowCount, 
      changes: result.rowCount 
    };
  } else {
    return new Promise((resolve, reject) => {
      db.run(query, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }
};

export default usePostgres ? pool : db;

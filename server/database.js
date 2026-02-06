import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = process.env.DB_PATH || join(__dirname, '../data/leave_tracker.db');

// Ensure data directory exists
const dataDir = dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
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
    db.run(`
      SELECT COUNT(*) as count FROM pragma_table_info('employees') WHERE name='team'
    `, [], function(err, row) {
      if (!err) {
        db.get(`SELECT COUNT(*) as count FROM pragma_table_info('employees') WHERE name='team'`, [], (err, row) => {
          if (!err && row && row.count === 0) {
            db.run(`ALTER TABLE employees ADD COLUMN team TEXT`, (err) => {
              if (!err) {
                console.log('Added team column to employees table');
              }
            });
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

    // Migration: Update leaves table constraint to support new leave types
    db.get(`SELECT sql FROM sqlite_master WHERE type='table' AND name='leaves'`, [], (err, row) => {
      if (!err && row && row.sql && !row.sql.includes('Maternity Leave')) {
        console.log('Migrating leaves table to support maternity/paternity leave...');
        
        // Create new table with updated constraint
        db.run(`
          CREATE TABLE leaves_new (
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
        `, (err) => {
          if (!err) {
            // Copy data from old table
            db.run(`INSERT INTO leaves_new SELECT * FROM leaves`, (err) => {
              if (!err) {
                // Drop old table
                db.run(`DROP TABLE leaves`, (err) => {
                  if (!err) {
                    // Rename new table
                    db.run(`ALTER TABLE leaves_new RENAME TO leaves`, (err) => {
                      if (!err) {
                        console.log('Leaves table migration completed successfully');
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });

    // Email sync log
    db.run(`
      CREATE TABLE IF NOT EXISTS email_sync_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        last_sync DATETIME,
        emails_processed INTEGER DEFAULT 0,
        status TEXT
      )
    `);

    console.log('Database tables initialized');
  });
}

// Database helper functions
export const dbAll = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const dbGet = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const dbRun = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

export default db;

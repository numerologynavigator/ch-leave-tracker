// Sample data seeding script
// Run this to populate your database with test data

import { dbRun, dbGet } from './database.js';

const sampleEmployees = [
  { name: 'John Doe', email: 'john.doe@company.com', total_pto_days: 20 },
  { name: 'Jane Smith', email: 'jane.smith@company.com', total_pto_days: 22 },
  { name: 'Mike Johnson', email: 'mike.johnson@company.com', total_pto_days: 20 },
  { name: 'Sarah Williams', email: 'sarah.williams@company.com', total_pto_days: 25 },
  { name: 'David Brown', email: 'david.brown@company.com', total_pto_days: 20 }
];

const sampleLeaves = [
  { employee_name: 'John Doe', start_date: '2026-01-15', end_date: '2026-01-17', leave_type: 'Planned', reason: 'Vacation' },
  { employee_name: 'Jane Smith', start_date: '2026-01-20', end_date: '2026-01-21', leave_type: 'Unplanned', reason: 'Sick leave' },
  { employee_name: 'Mike Johnson', start_date: '2026-02-10', end_date: '2026-02-14', leave_type: 'Planned', reason: 'Family trip' },
  { employee_name: 'Sarah Williams', start_date: '2026-02-05', end_date: '2026-02-06', leave_type: 'Planned', reason: 'Personal' },
  { employee_name: 'David Brown', start_date: '2026-01-25', end_date: '2026-01-25', leave_type: 'Unplanned', reason: 'Emergency' }
];

export async function seedData() {
  try {
    // Check if data already exists
    const existingEmployees = await dbGet('SELECT COUNT(*) as count FROM employees', []);
    if (existingEmployees && existingEmployees.count > 0) {
      console.log('⏭️  Database already has data, skipping seed');
      return;
    }

    console.log('Seeding sample data...');

    // Insert employees
    const employeeIds = {};
    for (const emp of sampleEmployees) {
      try {
        const result = await dbRun(
          'INSERT INTO employees (name, email, total_pto_days) VALUES (?, ?, ?)',
          [emp.name, emp.email, emp.total_pto_days]
        );
        employeeIds[emp.name] = result.id;
        console.log(`✓ Added employee: ${emp.name}`);
      } catch (err) {
        if (err.message.includes('UNIQUE constraint')) {
          console.log(`- Employee already exists: ${emp.name}`);
        } else {
          throw err;
        }
      }
    }

    // Insert leaves
    for (const leave of sampleLeaves) {
      const empId = employeeIds[leave.employee_name];
      if (!empId) continue;

      const startDate = new Date(leave.start_date);
      const endDate = new Date(leave.end_date);
      const daysCount = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

      await dbRun(
        `INSERT INTO leaves (employee_id, start_date, end_date, days_count, leave_type, status, reason)
         VALUES (?, ?, ?, ?, ?, 'Approved', ?)`,
        [empId, leave.start_date, leave.end_date, daysCount, leave.leave_type, leave.reason]
      );
      console.log(`✓ Added leave for ${leave.employee_name}: ${leave.start_date} to ${leave.end_date}`);
    }

    console.log('\n✅ Sample data seeded successfully!');
    console.log('You can now start the server and view the dashboard.');
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
}

// Only run if called directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  seedData().then(() => process.exit(0)).catch(() => process.exit(1));
}

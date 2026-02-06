import express from 'express';
import { dbAll, dbRun, dbGet } from '../database.js';

const router = express.Router();

// Get all employees
router.get('/', async (req, res) => {
  try {
    const employees = await dbAll(`
      SELECT 
        e.*,
        COALESCE(SUM(CASE WHEN l.leave_type IN ('Planned', 'Unplanned') THEN l.days_count ELSE 0 END), 0) as pto_used,
        (e.total_pto_days - COALESCE(SUM(CASE WHEN l.leave_type IN ('Planned', 'Unplanned') THEN l.days_count ELSE 0 END), 0)) as pto_remaining,
        COALESCE(SUM(CASE WHEN l.leave_type = 'Maternity Leave' THEN l.days_count ELSE 0 END), 0) as maternity_days,
        COALESCE(SUM(CASE WHEN l.leave_type = 'Paternity Leave' THEN l.days_count ELSE 0 END), 0) as paternity_days
      FROM employees e
      LEFT JOIN leaves l ON e.id = l.employee_id 
        AND strftime('%Y', l.start_date) = strftime('%Y', 'now')
        AND l.status = 'Approved'
      GROUP BY e.id
      ORDER BY e.name
    `);
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// Get employee by ID
router.get('/:id', async (req, res) => {
  try {
    const employee = await dbGet(`
      SELECT 
        e.*,
        COALESCE(SUM(CASE WHEN l.leave_type IN ('Planned', 'Unplanned') THEN l.days_count ELSE 0 END), 0) as pto_used,
        (e.total_pto_days - COALESCE(SUM(CASE WHEN l.leave_type IN ('Planned', 'Unplanned') THEN l.days_count ELSE 0 END), 0)) as pto_remaining
      FROM employees e
      LEFT JOIN leaves l ON e.id = l.employee_id 
        AND strftime('%Y', l.start_date) = strftime('%Y', 'now')
        AND l.status = 'Approved'
      WHERE e.id = ?
      GROUP BY e.id
    `, [req.params.id]);
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// Create new employee
router.post('/', async (req, res) => {
  try {
    const { name, email, team, gender, total_pto_days = 20 } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const result = await dbRun(
      'INSERT INTO employees (name, email, team, gender, total_pto_days) VALUES (?, ?, ?, ?, ?)',
      [name, email, team, gender, total_pto_days]
    );

    const employee = await dbGet('SELECT * FROM employees WHERE id = ?', [result.id]);
    res.status(201).json(employee);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Employee already exists' });
    }
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

// Update employee
router.put('/:id', async (req, res) => {
  try {
    const { name, email, team, gender, total_pto_days } = req.body;
    const { id } = req.params;

    await dbRun(
      'UPDATE employees SET name = COALESCE(?, name), email = COALESCE(?, email), team = COALESCE(?, team), gender = COALESCE(?, gender), total_pto_days = COALESCE(?, total_pto_days) WHERE id = ?',
      [name, email, team, gender, total_pto_days, id]
    );

    const employee = await dbGet('SELECT * FROM employees WHERE id = ?', [id]);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

// Delete employee
router.delete('/:id', async (req, res) => {
  try {
    const result = await dbRun('DELETE FROM employees WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

export default router;

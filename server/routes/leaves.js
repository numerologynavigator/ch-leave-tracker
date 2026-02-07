import express from 'express';
import { dbAll, dbRun, dbGet } from '../database.js';
import { differenceInDays, parseISO, format } from 'date-fns';
import { calculateBusinessDays } from '../utils/dateUtils.js';

const router = express.Router();

// Get all leave records
router.get('/', async (req, res) => {
  try {
    const { employee_id, year } = req.query;
    let query = `
      SELECT 
        l.*,
        e.name as employee_name,
        e.email as employee_email
      FROM leaves l
      JOIN employees e ON l.employee_id = e.id
      WHERE 1=1
    `;
    const params = [];

    if (employee_id) {
      query += ' AND l.employee_id = ?';
      params.push(employee_id);
    }

    if (year) {
      query += ` AND strftime('%Y', l.start_date) = ?`;
      params.push(year);
    }

    query += ' ORDER BY l.start_date DESC';

    const leaves = await dbAll(query, params);
    res.json(leaves);
  } catch (error) {
    console.error('Error fetching leaves:', error);
    res.status(500).json({ error: 'Failed to fetch leaves' });
  }
});

// Get leave by ID
router.get('/:id', async (req, res) => {
  try {
    const leave = await dbGet(`
      SELECT 
        l.*,
        e.name as employee_name,
        e.email as employee_email
      FROM leaves l
      JOIN employees e ON l.employee_id = e.id
      WHERE l.id = ?
    `, [req.params.id]);
    
    if (!leave) {
      return res.status(404).json({ error: 'Leave record not found' });
    }
    res.json(leave);
  } catch (error) {
    console.error('Error fetching leave:', error);
    res.status(500).json({ error: 'Failed to fetch leave' });
  }
});

// Create new leave record
router.post('/', async (req, res) => {
  try {
    const { employee_id, start_date, end_date, leave_type, reason, status = 'Approved' } = req.body;
    
    if (!employee_id || !start_date || !end_date || !leave_type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate that end date is not before start date
    const startDateObj = parseISO(start_date);
    const endDateObj = parseISO(end_date);
    if (endDateObj < startDateObj) {
      return res.status(400).json({ 
        error: 'Invalid date range',
        message: 'End date cannot be before start date'
      });
    }

    // Calculate days count based on leave type
    // Maternity and Paternity leave use business days (exclude weekends)
    // Regular PTO uses calendar days
    let days_count;
    if (leave_type === 'Maternity Leave' || leave_type === 'Paternity Leave') {
      days_count = calculateBusinessDays(start_date, end_date);
    } else {
      days_count = differenceInDays(parseISO(end_date), parseISO(start_date)) + 1;
    }

    const result = await dbRun(
      'INSERT INTO leaves (employee_id, start_date, end_date, days_count, leave_type, status, reason) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [employee_id, start_date, end_date, days_count, leave_type, status, reason]
    );

    const leave = await dbGet(`
      SELECT 
        l.*,
        e.name as employee_name,
        e.email as employee_email
      FROM leaves l
      JOIN employees e ON l.employee_id = e.id
      WHERE l.id = ?
    `, [result.id]);
    
    res.status(201).json(leave);
  } catch (error) {
    console.error('Error creating leave:', error);
    res.status(500).json({ error: 'Failed to create leave record' });
  }
});

// Update leave record
router.put('/:id', async (req, res) => {
  try {
    const { start_date, end_date, leave_type, status, reason } = req.body;
    const { id } = req.params;

    // Validate that end date is not before start date
    if (start_date && end_date) {
      const startDateObj = parseISO(start_date);
      const endDateObj = parseISO(end_date);
      if (endDateObj < startDateObj) {
        return res.status(400).json({ 
          error: 'Invalid date range',
          message: 'End date cannot be before start date'
        });
      }
    }

    let days_count;
    if (start_date && end_date && leave_type) {
      // Recalculate days based on leave type
      if (leave_type === 'Maternity Leave' || leave_type === 'Paternity Leave') {
        days_count = calculateBusinessDays(start_date, end_date);
      } else {
        days_count = differenceInDays(parseISO(end_date), parseISO(start_date)) + 1;
      }
    }

    await dbRun(
      `UPDATE leaves SET 
        start_date = COALESCE(?, start_date),
        end_date = COALESCE(?, end_date),
        days_count = COALESCE(?, days_count),
        leave_type = COALESCE(?, leave_type),
        status = COALESCE(?, status),
        reason = COALESCE(?, reason)
      WHERE id = ?`,
      [start_date, end_date, days_count, leave_type, status, reason, id]
    );

    const leave = await dbGet(`
      SELECT 
        l.*,
        e.name as employee_name,
        e.email as employee_email
      FROM leaves l
      JOIN employees e ON l.employee_id = e.id
      WHERE l.id = ?
    `, [id]);
    
    if (!leave) {
      return res.status(404).json({ error: 'Leave record not found' });
    }
    res.json(leave);
  } catch (error) {
    console.error('Error updating leave:', error);
    res.status(500).json({ error: 'Failed to update leave record' });
  }
});

// Delete leave record
router.delete('/:id', async (req, res) => {
  try {
    const result = await dbRun('DELETE FROM leaves WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Leave record not found' });
    }
    res.json({ message: 'Leave record deleted successfully' });
  } catch (error) {
    console.error('Error deleting leave:', error);
    res.status(500).json({ error: 'Failed to delete leave record' });
  }
});

export default router;

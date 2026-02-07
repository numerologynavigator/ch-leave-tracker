import express from 'express';
import { dbAll, dbRun, dbGet } from '../database.js';
import { parseISO, format } from 'date-fns';
import { calculateBusinessDays } from '../utils/dateUtils.js';

const router = express.Router();

// Debug endpoint to check leave types in database
router.get('/debug/types', async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const { year = currentYear } = req.query;

    // Get all unique leave types with counts
    const leaveTypes = await dbAll(`
      SELECT 
        leave_type,
        COUNT(*) as count,
        SUM(days_count) as total_days
      FROM leaves
      WHERE strftime('%Y', start_date) = ?
      AND status = 'Approved'
      GROUP BY leave_type
      ORDER BY count DESC
    `, [year.toString()]);

    // Get sample of each type
    const samples = await dbAll(`
      SELECT 
        id,
        employee_id,
        leave_type,
        start_date,
        end_date,
        days_count,
        status
      FROM leaves
      WHERE strftime('%Y', start_date) = ?
      ORDER BY leave_type, start_date
      LIMIT 20
    `, [year.toString()]);

    res.json({
      year: year.toString(),
      leaveTypes,
      samples,
      note: 'This shows all leave_type values in the database with their counts'
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

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

    // Check for overlapping leaves for the same employee
    const overlappingLeaves = await dbAll(`
      SELECT id, start_date, end_date, leave_type 
      FROM leaves 
      WHERE employee_id = ? 
        AND start_date <= ? 
        AND end_date >= ?
    `, [employee_id, end_date, start_date]);

    if (overlappingLeaves && overlappingLeaves.length > 0) {
      const existingLeave = overlappingLeaves[0];
      return res.status(409).json({ 
        error: 'Overlapping leave exists',
        message: `This employee already has a ${existingLeave.leave_type} leave from ${format(parseISO(existingLeave.start_date), 'MMM dd, yyyy')} to ${format(parseISO(existingLeave.end_date), 'MMM dd, yyyy')}`
      });
    }

    // Calculate days count based on leave type
    // All leave types now exclude weekends (Saturday and Sunday)
    const days_count = calculateBusinessDays(start_date, end_date);

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

    // Check for overlapping leaves when updating dates
    if (start_date && end_date) {
      // Get current employee_id for this leave
      const currentLeave = await dbGet('SELECT employee_id FROM leaves WHERE id = ?', [id]);
      if (!currentLeave) {
        return res.status(404).json({ error: 'Leave record not found' });
      }

      const overlappingLeaves = await dbAll(`
        SELECT id, start_date, end_date, leave_type 
        FROM leaves 
        WHERE employee_id = ? 
          AND id != ?
          AND start_date <= ? 
          AND end_date >= ?
      `, [currentLeave.employee_id, id, end_date, start_date]);

      if (overlappingLeaves && overlappingLeaves.length > 0) {
        const existingLeave = overlappingLeaves[0];
        return res.status(409).json({ 
          error: 'Overlapping leave exists',
          message: `This employee already has a ${existingLeave.leave_type} leave from ${format(parseISO(existingLeave.start_date), 'MMM dd, yyyy')} to ${format(parseISO(existingLeave.end_date), 'MMM dd, yyyy')}`
        });
      }
    }

    let days_count;
    if (start_date && end_date) {
      // All leave types exclude weekends (Saturday and Sunday)
      days_count = calculateBusinessDays(start_date, end_date);
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

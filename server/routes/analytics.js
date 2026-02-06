import express from 'express';
import { dbAll, dbGet } from '../database.js';

const router = express.Router();

// Get dashboard analytics
router.get('/', async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const { year = currentYear } = req.query;

    // Total employees
    const totalEmployees = await dbGet('SELECT COUNT(*) as count FROM employees');
    
    if (!totalEmployees) {
      return res.json({
        summary: {
          totalEmployees: 0,
          totalPTOUsed: 0,
          plannedPercentage: 0,
          unplannedPercentage: 0,
          maternityDays: 0,
          paternityDays: 0,
          year: year
        },
        ptoBreakdown: {},
        monthlyTrend: [],
        topUsers: [],
        efficiency: [],
        recentLeaves: [],
        teamEfficiency: []
      });
    }

    // Total PTO days used this year (excluding maternity/paternity)
    const totalPTOUsed = await dbGet(`
      SELECT COALESCE(SUM(days_count), 0) as total
      FROM leaves
      WHERE strftime('%Y', start_date) = ?
      AND status = 'Approved'
      AND leave_type IN ('Planned', 'Unplanned')
    `, [year.toString()]);

    // Maternity and Paternity leave stats
    const maternityPaternity = await dbGet(`
      SELECT 
        COALESCE(SUM(CASE WHEN leave_type = 'Maternity Leave' THEN days_count ELSE 0 END), 0) as maternity_days,
        COALESCE(SUM(CASE WHEN leave_type = 'Paternity Leave' THEN days_count ELSE 0 END), 0) as paternity_days
      FROM leaves
      WHERE strftime('%Y', start_date) = ?
      AND status = 'Approved'
    `, [year.toString()]);

    // Planned vs Unplanned PTO (excluding maternity/paternity)
    const ptoBreakdown = await dbAll(`
      SELECT 
        leave_type,
        COUNT(*) as count,
        SUM(days_count) as total_days
      FROM leaves
      WHERE strftime('%Y', start_date) = ?
      AND status = 'Approved'
      AND leave_type IN ('Planned', 'Unplanned')
      GROUP BY leave_type
    `, [year.toString()]);

    // Monthly PTO trend (excluding maternity/paternity)
    const monthlyTrend = await dbAll(`
      SELECT 
        strftime('%m', start_date) as month,
        leave_type,
        COUNT(*) as count,
        SUM(days_count) as total_days
      FROM leaves
      WHERE strftime('%Y', start_date) = ?
      AND status = 'Approved'
      AND leave_type IN ('Planned', 'Unplanned')
      GROUP BY month, leave_type
      ORDER BY month
    `, [year.toString()]);

    // Top PTO users
    const topUsers = await dbAll(`
      SELECT 
        e.id,
        e.name,
        COUNT(l.id) as leave_count,
        SUM(l.days_count) as total_days,
        SUM(CASE WHEN l.leave_type = 'Planned' THEN l.days_count ELSE 0 END) as planned_days,
        SUM(CASE WHEN l.leave_type = 'Unplanned' THEN l.days_count ELSE 0 END) as unplanned_days
      FROM employees e
      LEFT JOIN leaves l ON e.id = l.employee_id 
        AND strftime('%Y', l.start_date) = ?
        AND l.status = 'Approved'
      GROUP BY e.id, e.name
      HAVING total_days > 0
      ORDER BY total_days DESC
      LIMIT 10
    `, [year.toString()]);

    // Team efficiency metrics
    const efficiency = await dbAll(`
      SELECT 
        e.name,
        COALESCE(e.team, 'No Team') as team,
        e.total_pto_days,
        COALESCE(SUM(CASE WHEN l.leave_type IN ('Planned', 'Unplanned') THEN l.days_count ELSE 0 END), 0) as pto_used,
        (e.total_pto_days - COALESCE(SUM(CASE WHEN l.leave_type IN ('Planned', 'Unplanned') THEN l.days_count ELSE 0 END), 0)) as pto_remaining,
        COALESCE(SUM(CASE WHEN l.leave_type = 'Planned' THEN l.days_count ELSE 0 END), 0) as planned,
        COALESCE(SUM(CASE WHEN l.leave_type = 'Unplanned' THEN l.days_count ELSE 0 END), 0) as unplanned,
        CASE 
          WHEN COALESCE(SUM(CASE WHEN l.leave_type IN ('Planned', 'Unplanned') THEN l.days_count ELSE 0 END), 0) > 0 
          THEN ROUND(COALESCE(SUM(CASE WHEN l.leave_type = 'Planned' THEN l.days_count ELSE 0 END), 0) * 100.0 / COALESCE(SUM(CASE WHEN l.leave_type IN ('Planned', 'Unplanned') THEN l.days_count ELSE 0 END), 0), 1)
          ELSE 0 
        END as planned_percentage,
        ROUND(((e.total_pto_days - COALESCE(SUM(CASE WHEN l.leave_type = 'Unplanned' THEN l.days_count ELSE 0 END), 0)) * 100.0 / e.total_pto_days), 1) as work_efficiency
      FROM employees e
      LEFT JOIN leaves l ON e.id = l.employee_id 
        AND strftime('%Y', l.start_date) = ?
        AND l.status = 'Approved'
      GROUP BY e.id, e.name, e.team, e.total_pto_days
      ORDER BY e.team, e.name
    `, [year.toString()]);

    // Recent leaves
    const recentLeaves = await dbAll(`
      SELECT 
        l.*,
        e.name as employee_name
      FROM leaves l
      JOIN employees e ON l.employee_id = e.id
      WHERE strftime('%Y', l.start_date) = ?
      ORDER BY l.created_at DESC
      LIMIT 10
    `, [year.toString()]);

    // Team-wise efficiency
    const teamEfficiency = await dbAll(`
      SELECT 
        COALESCE(e.team, 'No Team') as team,
        COUNT(DISTINCT e.id) as employee_count,
        SUM(e.total_pto_days) as team_total_pto,
        COALESCE(SUM(CASE WHEN l.leave_type IN ('Planned', 'Unplanned') THEN l.days_count ELSE 0 END), 0) as total_pto_used,
        COALESCE(SUM(CASE WHEN l.leave_type = 'Planned' THEN l.days_count ELSE 0 END), 0) as planned_days,
        COALESCE(SUM(CASE WHEN l.leave_type = 'Unplanned' THEN l.days_count ELSE 0 END), 0) as unplanned_days,
        CASE 
          WHEN COALESCE(SUM(CASE WHEN l.leave_type IN ('Planned', 'Unplanned') THEN l.days_count ELSE 0 END), 0) > 0 
          THEN ROUND(COALESCE(SUM(CASE WHEN l.leave_type = 'Planned' THEN l.days_count ELSE 0 END), 0) * 100.0 / COALESCE(SUM(CASE WHEN l.leave_type IN ('Planned', 'Unplanned') THEN l.days_count ELSE 0 END), 0), 1)
          ELSE 0 
        END as planned_percentage,
        ROUND(((SUM(e.total_pto_days) - COALESCE(SUM(CASE WHEN l.leave_type = 'Unplanned' THEN l.days_count ELSE 0 END), 0)) * 100.0 / SUM(e.total_pto_days)), 1) as work_efficiency
      FROM employees e
      LEFT JOIN leaves l ON e.id = l.employee_id 
        AND strftime('%Y', l.start_date) = ?
        AND l.status = 'Approved'
      GROUP BY COALESCE(e.team, 'No Team')
      ORDER BY planned_percentage DESC
    `, [year.toString()]);

    // Calculate overall planned percentage based on actual PTO days
    const totalPlannedDays = ptoBreakdown.find(p => p.leave_type === 'Planned')?.total_days || 0;
    const totalUnplannedDays = ptoBreakdown.find(p => p.leave_type === 'Unplanned')?.total_days || 0;
    const totalDays = totalPlannedDays + totalUnplannedDays;
    const actualPlannedPercentage = totalDays > 0 ? Math.round((totalPlannedDays / totalDays) * 100) : 0;

    res.json({
      summary: {
        totalEmployees: totalEmployees.count,
        totalPTOUsed: totalPTOUsed.total,
        plannedPercentage: actualPlannedPercentage,
        unplannedPercentage: totalDays > 0 ? 100 - actualPlannedPercentage : 0,
        maternityDays: maternityPaternity.maternity_days,
        paternityDays: maternityPaternity.paternity_days,
        year: year
      },
      ptoBreakdown: ptoBreakdown.reduce((acc, item) => {
        acc[item.leave_type.toLowerCase()] = {
          count: item.count,
          totalDays: item.total_days
        };
        return acc;
      }, {}),
      monthlyTrend,
      topUsers,
      teamEfficiency: efficiency,
      teamWiseEfficiency: teamEfficiency,
      recentLeaves
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch analytics',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;

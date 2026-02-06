import express from 'express';
import { syncEmails } from '../services/emailService.js';
import { dbAll } from '../database.js';

const router = express.Router();

// Manually trigger email sync
router.post('/sync', async (req, res) => {
  try {
    const result = await syncEmails();
    res.json(result);
  } catch (error) {
    console.error('Email sync error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to sync emails',
      message: error.message 
    });
  }
});

// Get sync history
router.get('/sync-history', async (req, res) => {
  try {
    const history = await dbAll(`
      SELECT * FROM email_sync_log 
      ORDER BY last_sync DESC 
      LIMIT 20
    `);
    res.json(history);
  } catch (error) {
    console.error('Error fetching sync history:', error);
    res.status(500).json({ error: 'Failed to fetch sync history' });
  }
});

export default router;

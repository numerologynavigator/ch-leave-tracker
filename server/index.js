import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
import employeeRoutes from './routes/employees.js';
import leaveRoutes from './routes/leaves.js';
import analyticsRoutes from './routes/analytics.js';
import emailRoutes from './routes/email.js';
import { seedData } from './seed.js';

// Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/email', emailRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = join(__dirname, '../client/dist');
  app.use(express.static(clientBuildPath));
  
  app.get('*', (req, res) => {
    res.sendFile(join(clientBuildPath, 'index.html'));
  });
}

// Schedule email sync every 15 minutes
// Uncomment after setting up Microsoft Graph credentials
// import { syncEmails } from './services/emailService.js';
// cron.schedule('*/15 * * * *', async () => {
//   console.log('Running scheduled email sync...');
//   try {
//     await syncEmails();
//     console.log('Email sync completed successfully');
//   } catch (error) {
//     console.error('Email sync failed:', error);
//   }
// });

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Auto-seed database in production if empty
  if (process.env.NODE_ENV === 'production') {
    setTimeout(async () => {
      try {
        await seedData();
      } catch (error) {
        console.error('Auto-seed failed:', error);
      }
    }, 2000); // Wait 2 seconds for DB to initialize
  }
});

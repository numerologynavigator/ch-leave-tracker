import { dbAll, dbRun, dbGet } from '../database.js';
import { differenceInDays, parseISO } from 'date-fns';
import { calculateBusinessDays } from '../utils/dateUtils.js';

// Initialize Microsoft Graph client (lazy loaded when needed)
let graphClient = null;

async function getGraphClient() {
  if (!graphClient) {
    // Lazy load Microsoft Graph dependencies only when needed
    const { Client } = await import('@microsoft/microsoft-graph-client');
    const { ClientSecretCredential } = await import('@azure/identity');
    const { TokenCredentialAuthenticationProvider } = await import('@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials');
    
    const credential = new ClientSecretCredential(
      process.env.MICROSOFT_TENANT_ID,
      process.env.MICROSOFT_CLIENT_ID,
      process.env.MICROSOFT_CLIENT_SECRET
    );

    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
      scopes: ['https://graph.microsoft.com/.default']
    });

    graphClient = Client.initWithMiddleware({ authProvider });
  }
  return graphClient;
}

// Parse PTO information from email
function parsePTOEmail(subject, body, senderEmail) {
  const ptoInfo = {
    employeeEmail: senderEmail ? senderEmail.toLowerCase() : null,
    startDate: null,
    endDate: null,
    leaveType: 'Planned',
    reason: ''
  };

  // Also try to extract email from body if different from sender
  const emailPattern = /(?:email|from):\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
  const emailMatch = body.match(emailPattern);
  if (emailMatch && emailMatch[1]) {
    ptoInfo.employeeEmail = emailMatch[1].toLowerCase();
  }

  // Extract dates - multiple formats
  const datePatterns = [
    /(\d{1,2}\/\d{1,2}\/\d{4})\s*(?:to|-|through)\s*(\d{1,2}\/\d{1,2}\/\d{4})/i,
    /(\d{4}-\d{2}-\d{2})\s*(?:to|-|through)\s*(\d{4}-\d{2}-\d{2})/i,
    /(?:from|starting)\s*(\d{1,2}\/\d{1,2}\/\d{4})\s*(?:to|until|through)\s*(\d{1,2}\/\d{1,2}\/\d{4})/i,
  ];

  const combinedText = subject + ' ' + body;
  for (const pattern of datePatterns) {
    const match = combinedText.match(pattern);
    if (match) {
      ptoInfo.startDate = match[1];
      ptoInfo.endDate = match[2];
      break;
    }
  }

  // Determine if planned or unplanned
  const unplannedKeywords = ['unplanned', 'emergency', 'sick', 'urgent', 'last minute'];
  const plannedKeywords = ['planned', 'vacation', 'scheduled'];
  
  const lowerText = combinedText.toLowerCase();
  if (unplannedKeywords.some(keyword => lowerText.includes(keyword))) {
    ptoInfo.leaveType = 'Unplanned';
  } else if (plannedKeywords.some(keyword => lowerText.includes(keyword))) {
    ptoInfo.leaveType = 'Planned';
  }

  // Extract reason
  const reasonMatch = combinedText.match(/reason:\s*([^\n.]+)/i);
  if (reasonMatch) {
    ptoInfo.reason = reasonMatch[1].trim();
  }

  return ptoInfo;
}

// Sync emails from Outlook
export async function syncEmails() {
  try {
    if (!process.env.MICROSOFT_CLIENT_ID || !process.env.MICROSOFT_CLIENT_SECRET) {
      console.log('Microsoft Graph credentials not configured. Skipping email sync.');
      return { success: false, message: 'Microsoft Graph credentials not configured. Please set up Azure AD app and add credentials to .env file.' };
    }

    const client = await getGraphClient();
    const monitoredEmail = process.env.MONITORED_EMAIL;

    // Get last sync time
    const lastSync = await dbGet('SELECT last_sync FROM email_sync_log ORDER BY id DESC LIMIT 1');
    const filterDate = lastSync?.last_sync 
      ? new Date(lastSync.last_sync).toISOString() 
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(); // Last 7 days

    // Fetch emails from inbox
    const messages = await client
      .api(`/users/${monitoredEmail}/mailFolders/inbox/messages`)
      .filter(`receivedDateTime ge ${filterDate} and (contains(subject, 'PTO') or contains(subject, 'leave') or contains(subject, 'vacation'))`)
      .select('id,subject,bodyPreview,body,receivedDateTime,from')
      .top(50)
      .get();

    let processedCount = 0;
    let addedCount = 0;

    for (const message of messages.value) {
      processedCount++;

      // Check if email already processed
      const existing = await dbGet('SELECT id FROM leaves WHERE email_id = ?', [message.id]);
      if (existing) {
        continue;
      }

      // Parse email content
      const body = message.body?.content || message.bodyPreview || '';
      const senderEmail = message.from?.emailAddress?.address;
      const ptoInfo = parsePTOEmail(message.subject, body, senderEmail);

      if (!ptoInfo.employeeEmail || !ptoInfo.startDate || !ptoInfo.endDate) {
        console.log(`Skipping email - incomplete info: ${message.subject}`);
        continue;
      }

      // Find employee by email address
      let employee = await dbGet('SELECT id, name FROM employees WHERE LOWER(email) = ?', [ptoInfo.employeeEmail]);
      
      if (!employee) {
        console.log(`No employee found with email: ${ptoInfo.employeeEmail}. Skipping PTO request.`);
        console.log(`Please add this employee to the system first.`);
        continue;
      }

      // Normalize dates
      let startDate, endDate;
      try {
        if (ptoInfo.startDate.includes('/')) {
          const [m, d, y] = ptoInfo.startDate.split('/');
          startDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        } else {
          startDate = ptoInfo.startDate;
        }

        if (ptoInfo.endDate.includes('/')) {
          const [m, d, y] = ptoInfo.endDate.split('/');
          endDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        } else {
          endDate = ptoInfo.endDate;
        }
      } catch (e) {
        console.error('Date parsing error:', e);
        continue;
      }

      // Calculate days
      const daysCount = differenceInDays(parseISO(endDate), parseISO(startDate)) + 1;

      // Create leave record
      await dbRun(
        `INSERT INTO leaves (employee_id, start_date, end_date, days_count, leave_type, status, reason, email_id)
         VALUES (?, ?, ?, ?, ?, 'Approved', ?, ?)`,
        [employee.id, startDate, endDate, daysCount, ptoInfo.leaveType, ptoInfo.reason, message.id]
      );

      addedCount++;
      console.log(`Added PTO record for ${employee.name} (${ptoInfo.employeeEmail}): ${startDate} to ${endDate} (${ptoInfo.leaveType})`);
    }

    // Log sync
    await dbRun(
      'INSERT INTO email_sync_log (last_sync, emails_processed, status) VALUES (datetime("now"), ?, ?)',
      [processedCount, 'success']
    );

    return {
      success: true,
      processedCount,
      addedCount,
      message: `Processed ${processedCount} emails, added ${addedCount} new PTO records`
    };
  } catch (error) {
    console.error('Email sync error:', error);
    await dbRun(
      'INSERT INTO email_sync_log (last_sync, emails_processed, status) VALUES (datetime("now"), 0, ?)',
      [error.message]
    );
    throw error;
  }
}

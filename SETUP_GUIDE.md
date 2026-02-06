# Leave Tracker - Quick Start Guide

## Installation & Setup

### Step 1: Install Dependencies

Open PowerShell in the project directory and run:

```powershell
cd "c:\Leave Tracker"
npm install
cd client
npm install
cd ..
```

### Step 2: Configure Environment Variables

Create a `.env` file in the root directory:

```powershell
Copy-Item .env.example .env
```

Edit the `.env` file with your settings. For now, you can start without email integration:

```
PORT=5000
NODE_ENV=development
DB_PATH=./data/leave_tracker.db
```

### Step 3: Start the Application

```powershell
npm run dev
```

This will start both the backend (port 5000) and frontend (port 5173).

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## Using the Application

### 1. Add Employees

1. Navigate to the "Employees" tab
2. Click "Add Employee"
3. Enter employee details (name, email, total PTO days)
4. Click "Add Employee"

### 2. Add Leave Records

**Manually:**
1. Go to the "Leaves" tab
2. Click "Add Leave"
3. Select employee, dates, and leave type (Planned/Unplanned)
4. Submit the form

**Via Email (requires setup):**
- Configure Microsoft Graph API (see below)
- Send emails with PTO details to the monitored inbox
- Click "Sync Now" in the Email Sync tab

### 3. View Dashboard Analytics

The Dashboard shows:
- **Total employees and PTO usage**
- **Planned vs Unplanned PTO breakdown**
- **Monthly trends** (bar chart showing PTO patterns)
- **Team efficiency table** (who's planning vs improvising)
- **Recent leave requests**

## Setting Up Email Integration (Optional)

### Prerequisites
- Microsoft 365 account with admin access
- Azure subscription (free tier works)

### Steps:

1. **Register Azure AD Application:**
   - Go to https://portal.azure.com
   - Navigate to "Azure Active Directory" → "App registrations"
   - Click "New registration"
   - Name: "Leave Tracker"
   - Supported account types: "Single tenant"
   - Click "Register"

2. **Configure Authentication:**
   - Copy the "Application (client) ID"
   - Copy the "Directory (tenant) ID"
   - Go to "Certificates & secrets"
   - Click "New client secret"
   - Copy the secret VALUE (not the ID)

3. **Set API Permissions:**
   - Go to "API permissions"
   - Click "Add a permission" → "Microsoft Graph" → "Application permissions"
   - Add these permissions:
     - `Mail.Read`
     - `User.Read.All`
   - Click "Grant admin consent for [your organization]"

4. **Update .env file:**
   ```
   MICROSOFT_CLIENT_ID=your_application_client_id
   MICROSOFT_CLIENT_SECRET=your_client_secret_value
   MICROSOFT_TENANT_ID=your_directory_tenant_id
   MONITORED_EMAIL=your_email@company.com
   ```

5. **Restart the server:**
   - Stop the running process (Ctrl+C)
   - Run `npm run dev` again

6. **Test Email Sync:**
   - Send a test email to your monitored inbox with subject: "PTO Request: John Doe - 2/10/2026 to 2/12/2026 (Planned)"
   - Go to Email Sync tab
   - Click "Sync Now"

## Email Format Guidelines

For best automatic parsing results, format PTO emails like this:

**Subject Line:**
```
PTO Request: [Employee Name] - [Start Date] to [End Date] (Planned/Unplanned)
```

**Examples:**
- `PTO Request: Jane Smith - 3/1/2026 to 3/5/2026 (Planned)`
- `Leave Request: John Doe - 2/15/2026 to 2/16/2026 (Unplanned)`

**Email Body (alternative):**
```
Employee: Jane Smith
Start Date: 3/1/2026
End Date: 3/5/2026
Type: Planned
Reason: Family vacation
```

## Understanding the Metrics

### Team Efficiency
- **High Planning %**: Employee takes mostly planned PTO (good for team scheduling)
- **Low Planning %**: More unplanned/emergency PTO (may indicate issues)

### Dashboard Insights
- **Monthly Trends**: Identify busy/slow months for leave
- **PTO Distribution**: Balance between planned and unplanned time off
- **Employee Usage**: Who's using their PTO and who might be burning out

## Troubleshooting

### Database Issues
If you see database errors:
```powershell
Remove-Item -Recurse -Force data
```
Restart the server to recreate the database.

### Port Already in Use
Change the PORT in `.env`:
```
PORT=5001
```

### Email Sync Not Working
1. Verify Azure AD credentials in `.env`
2. Check API permissions were granted
3. Look at server console for error messages
4. Verify email format matches expected patterns

## Advanced Usage

### Automatic Sync
The server automatically syncs emails every 15 minutes when properly configured. To disable, comment out the cron job in `server/index.js`.

### Customize PTO Allocation
Edit employee records to set different PTO day allocations per person.

### Export Data
Use the API endpoints directly:
- `GET http://localhost:5000/api/employees` - All employees
- `GET http://localhost:5000/api/leaves` - All leaves
- `GET http://localhost:5000/api/analytics` - Analytics data

## Support

For issues:
1. Check server console for errors
2. Check browser console (F12) for frontend errors
3. Verify all environment variables are set correctly
4. Review the README.md for detailed documentation

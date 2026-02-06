# Leave Tracker

An automated leave tracking system that integrates with Outlook to monitor PTO requests and provides team analytics dashboards.

## Features

- 📧 **Automatic Email Integration**: Reads Outlook emails to detect PTO requests
- 📊 **Dashboard Analytics**: Visual insights into team leave patterns
- 📈 **Planned vs Unplanned PTO**: Track and compare different leave types
- 👥 **Team Overview**: Monitor PTO balances and usage across your team
- ⚡ **Real-time Updates**: Automatic sync with email inbox
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- Microsoft 365 account with Outlook access
- Azure AD app registration (for email access)

### 1. Clone and Install

```bash
cd "c:\Leave Tracker"
npm run install-all
```

### 2. Configure Azure AD Application

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to Azure Active Directory > App registrations > New registration
3. Name: "Leave Tracker"
4. Supported account types: Single tenant
5. Register the application
6. Copy the Application (client) ID and Directory (tenant) ID
7. Go to Certificates & secrets > New client secret
8. Copy the secret value
9. Go to API permissions > Add permission > Microsoft Graph > Application permissions
10. Add these permissions:
    - Mail.Read
    - User.Read.All
11. Grant admin consent

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your Azure credentials:
- MICROSOFT_CLIENT_ID
- MICROSOFT_CLIENT_SECRET
- MICROSOFT_TENANT_ID
- MONITORED_EMAIL (your email address to monitor)

### 4. Run the Application

```bash
npm run dev
```

- Backend: http://localhost:5000
- Frontend: http://localhost:5173

## How It Works

1. **Email Parsing**: The system checks your Outlook inbox every 15 minutes for PTO-related emails
2. **Data Extraction**: Uses AI-powered parsing to extract employee name, dates, and PTO type
3. **Database Storage**: Stores all PTO records in SQLite database
4. **Dashboard Display**: Shows real-time analytics and team metrics

## Email Format

For best results, PTO request emails should include:
- Employee name
- Start date and end date
- Type: "Planned" or "Unplanned"
- Example: "John Doe - PTO Request from 2/10/2026 to 2/12/2026 (Planned)"

## API Endpoints

- `GET /api/employees` - Get all employees
- `GET /api/leaves` - Get all leave records
- `GET /api/analytics` - Get dashboard analytics
- `POST /api/employees` - Add new employee
- `POST /api/leaves` - Add new leave record
- `POST /api/sync-emails` - Manually trigger email sync

## Technologies Used

- **Frontend**: React, Vite, Recharts, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: SQLite
- **Email**: Microsoft Graph API
- **Scheduling**: node-cron

## Support

For issues or questions, please check the logs in the console or contact your administrator.

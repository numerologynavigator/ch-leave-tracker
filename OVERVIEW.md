# 🎯 Leave Tracker - Complete Overview

## What You Got

A **fully functional leave tracking web application** that:

✅ **Tracks team PTO automatically** from Outlook emails  
✅ **Beautiful dashboard** with analytics and visualizations  
✅ **Planned vs Unplanned PTO metrics** for team efficiency  
✅ **No manual tracking needed** - everything is automated  
✅ **Modern, responsive design** that works on all devices  

---

## 🚀 Quick Start (3 Steps)

### 1️⃣ Install Dependencies
```powershell
cd "c:\Leave Tracker"
npm run install-all
```

### 2️⃣ Start the Application
```powershell
.\start.ps1
```
*Or manually: `npm run dev`*

### 3️⃣ Open Your Browser
- **Dashboard**: http://localhost:5173
- **API**: http://localhost:5000

---

## 📊 Features Breakdown

### 🎨 Frontend (React)
- **Dashboard Page**: Real-time analytics and charts
  - Total PTO usage statistics
  - Planned vs Unplanned breakdown (pie chart)
  - Monthly trends (bar chart)
  - Team efficiency table with progress bars
  - Recent leave requests

- **Employees Page**: Manage team members
  - Add/edit/delete employees
  - View PTO balances (total, used, remaining)
  - Track individual usage

- **Leaves Page**: Manage leave records
  - Add/edit/delete leave entries
  - Filter by type (Planned/Unplanned)
  - View all leave history

- **Email Sync Page**: Monitor automation
  - Manual sync trigger
  - Sync history and status
  - Setup instructions
  - Email format guidelines

### ⚙️ Backend (Node.js + Express)
- **RESTful API** with complete CRUD operations
- **SQLite Database** for data persistence
- **Microsoft Graph Integration** for Outlook email reading
- **Intelligent Email Parsing** to extract PTO details
- **Automatic Syncing** every 15 minutes (when configured)
- **Comprehensive Analytics** engine

### 📧 Email Integration
The system automatically:
1. Monitors your Outlook inbox
2. Detects PTO-related emails
3. Extracts employee name, dates, and type
4. Creates leave records automatically
5. Syncs every 15 minutes

**Supported Email Formats:**
- Subject: "PTO Request: John Doe - 2/10/2026 to 2/14/2026 (Planned)"
- Body with structured data (see SETUP_GUIDE.md)

---

## 📁 Project Structure

```
c:\Leave Tracker\
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx  # Analytics & charts
│   │   │   ├── Employees.jsx  # Employee management
│   │   │   ├── Leaves.jsx     # Leave records
│   │   │   └── EmailSync.jsx  # Email sync controls
│   │   ├── App.jsx            # Main app & routing
│   │   └── index.css          # Tailwind styles
│   ├── package.json
│   └── vite.config.js
│
├── server/                    # Node.js backend
│   ├── routes/
│   │   ├── employees.js       # Employee API endpoints
│   │   ├── leaves.js          # Leave API endpoints
│   │   ├── analytics.js       # Analytics API
│   │   └── email.js           # Email sync API
│   ├── services/
│   │   └── emailService.js    # Microsoft Graph integration
│   ├── database.js            # SQLite setup & helpers
│   ├── index.js               # Express server
│   └── seed.js                # Sample data script
│
├── data/                      # SQLite database (auto-created)
├── .env                       # Configuration (create from .env.example)
├── package.json               # Root dependencies
├── README.md                  # Full documentation
├── SETUP_GUIDE.md             # Detailed setup instructions
├── API_DOCS.md                # API reference
└── start.ps1                  # Quick start script
```

---

## 🎯 Understanding the Dashboard Metrics

### Team Efficiency Analysis
- **High Planning % (70%+)**: Good! Employee plans PTO in advance
- **Low Planning % (<50%)**: More unplanned absences (may need attention)

### Key Insights
- **Monthly Trends**: Identify vacation-heavy months
- **PTO Distribution**: Balance between planned and emergency leave
- **Employee Usage**: Track who's using PTO vs who might be burning out

---

## 🔧 Configuration Options

### Without Email (Basic Mode)
Just need `.env` with:
```
PORT=5000
DB_PATH=./data/leave_tracker.db
```
Manually add leave records via the web interface.

### With Email (Full Automation)
Configure Azure AD + Microsoft Graph (see SETUP_GUIDE.md):
```
MICROSOFT_CLIENT_ID=your_client_id
MICROSOFT_CLIENT_SECRET=your_secret
MICROSOFT_TENANT_ID=your_tenant_id
MONITORED_EMAIL=your_email@company.com
```
Automatic PTO tracking from emails!

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, TailwindCSS |
| Charts | Recharts |
| Backend | Node.js, Express |
| Database | SQLite |
| Email | Microsoft Graph API |
| Icons | Lucide React |

---

## 📖 Next Steps

1. **Start the app**: `.\start.ps1`
2. **Add employees**: Click "Add Employee" in the Employees tab
3. **Add leave records**: Use the Leaves tab or set up email sync
4. **View analytics**: Check the Dashboard for insights

### Optional: Enable Email Automation
- Follow **SETUP_GUIDE.md** for Azure AD setup
- Configure email credentials in `.env`
- Test with sample emails
- Enable automatic 15-minute syncing

---

## 💡 Pro Tips

- **Seed sample data**: Run `npm run seed` to populate with test data
- **Customize PTO days**: Edit employees to set individual allocations
- **Export data**: Use API endpoints (see API_DOCS.md)
- **Filter views**: Use filters in Leaves page for better insights
- **Year selection**: Dashboard has dropdown to view different years

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port in use | Change PORT in .env |
| Database errors | Delete `data/` folder, restart server |
| Email not syncing | Check Azure credentials, verify permissions |
| Build errors | Delete `node_modules`, run `npm run install-all` |

---

## 📞 Support Files

- **README.md**: Complete documentation
- **SETUP_GUIDE.md**: Step-by-step setup instructions
- **API_DOCS.md**: API endpoint reference

---

## 🎉 You're All Set!

Your leave tracker is ready to use. No more manual spreadsheets, no more missed PTO requests. Just automated, beautiful team management.

**Start now**: `.\start.ps1`

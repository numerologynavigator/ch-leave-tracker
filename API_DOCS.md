# API Documentation

Base URL: `http://localhost:5000/api`

## Employees

### GET /employees
Get all employees with PTO summary.

**Response:**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@company.com",
    "total_pto_days": 20,
    "pto_used": 5,
    "pto_remaining": 15,
    "created_at": "2026-02-01T00:00:00.000Z"
  }
]
```

### GET /employees/:id
Get single employee by ID.

### POST /employees
Create new employee.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@company.com",
  "total_pto_days": 20
}
```

### PUT /employees/:id
Update employee.

### DELETE /employees/:id
Delete employee and all associated leave records.

## Leaves

### GET /leaves
Get all leave records.

**Query Parameters:**
- `employee_id` - Filter by employee
- `year` - Filter by year (e.g., 2026)

**Response:**
```json
[
  {
    "id": 1,
    "employee_id": 1,
    "employee_name": "John Doe",
    "start_date": "2026-02-10",
    "end_date": "2026-02-14",
    "days_count": 5,
    "leave_type": "Planned",
    "status": "Approved",
    "reason": "Vacation",
    "email_id": null,
    "created_at": "2026-02-03T00:00:00.000Z"
  }
]
```

### POST /leaves
Create new leave record.

**Request Body:**
```json
{
  "employee_id": 1,
  "start_date": "2026-02-10",
  "end_date": "2026-02-14",
  "leave_type": "Planned",
  "reason": "Family vacation",
  "status": "Approved"
}
```

### PUT /leaves/:id
Update leave record.

### DELETE /leaves/:id
Delete leave record.

## Analytics

### GET /analytics
Get dashboard analytics.

**Query Parameters:**
- `year` - Year to analyze (default: current year)

**Response:**
```json
{
  "summary": {
    "totalEmployees": 10,
    "totalPTOUsed": 125,
    "avgPlannedPercentage": 75,
    "year": 2026
  },
  "ptoBreakdown": {
    "planned": { "count": 30, "totalDays": 95 },
    "unplanned": { "count": 10, "totalDays": 30 }
  },
  "monthlyTrend": [...],
  "topUsers": [...],
  "teamEfficiency": [...],
  "recentLeaves": [...]
}
```

## Email Sync

### POST /email/sync
Manually trigger email synchronization.

**Response:**
```json
{
  "success": true,
  "processedCount": 15,
  "addedCount": 3,
  "message": "Processed 15 emails, added 3 new PTO records"
}
```

### GET /email/sync-history
Get email sync history.

**Response:**
```json
[
  {
    "id": 1,
    "last_sync": "2026-02-03T10:00:00.000Z",
    "emails_processed": 15,
    "status": "success"
  }
]
```

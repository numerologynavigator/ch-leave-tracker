# 🚀 Deploy Leave Tracker with Supabase + Render (100% FREE Forever)

## ✅ What You Get
- **Supabase:** Free PostgreSQL database (500MB storage, forever free)
- **Render:** Free hosting for your app
- **Persistent Data:** Your data survives restarts!
- **No Credit Card Required**

---

## Step 1: Create Supabase Database (5 minutes)

### 1.1 Sign up for Supabase
1. Go to [supabase.com](https://supabase.com)
2. Click **Start your project**
3. Sign up with GitHub (no credit card needed)

### 1.2 Create a New Project
1. Click **New Project**
2. Fill in:
   - **Name:** `leave-tracker`
   - **Database Password:** Create a strong password (SAVE THIS!)
   - **Region:** Choose closest to you
   - **Pricing Plan:** FREE (already selected)
3. Click **Create new project**
4. Wait ~2 minutes for database to provision

### 1.3 Get Your Database Connection String
1. In your Supabase project, click **Settings** (gear icon) → **Database**
2. Scroll to **Connection string** section
3. Select **URI** tab
4. Copy the connection string that looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with the password you created in step 1.2
6. **SAVE THIS CONNECTION STRING** - you'll need it next!

---

## Step 2: Deploy to Render (5 minutes)

### 2.1 Push Your Code to GitHub (if not already done)
```powershell
cd "c:\Leave Tracker"
git add .
git commit -m "Add PostgreSQL support with Supabase"
git push
```

### 2.2 Deploy on Render
1. Go to [render.com](https://render.com/dashboard)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name:** `leave-tracker`
   - **Environment:** `Node`
   - **Build Command:** `npm install && cd client && npm install && npm run build`
   - **Start Command:** `node server/index.js`
   - **Instance Type:** **Free**

### 2.3 Add Environment Variables
Before clicking "Create Web Service", scroll down to **Environment Variables** and add:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | (paste your Supabase connection string from Step 1.3) |

**Example:**
```
DATABASE_URL=postgresql://postgres:YourPassword123@db.abcdefghijk.supabase.co:5432/postgres
```

### 2.4 Create Web Service
1. Click **Create Web Service**
2. Wait 3-5 minutes for deployment
3. Your app will be live at: `https://leave-tracker.onrender.com`

---

## Step 3: Verify Everything Works

1. Visit your Render app URL
2. You should see the dashboard with 0 employees
3. Click **Employees** → Add a test employee
4. Add some leave records
5. **Restart test:** 
   - Go to Render dashboard → Click **Manual Deploy** → **Deploy latest commit**
   - After restart, your data should still be there! ✅

---

## 🎉 You're Done!

Your Leave Tracker now has:
- ✅ Free PostgreSQL database (Supabase)
- ✅ Free hosting (Render)
- ✅ **Permanent data storage** - data persists across restarts!
- ✅ Auto-deploy on Git push
- ✅ Free SSL certificate

---

## 📊 View Your Database (Optional)

Want to see your database tables and data?

1. Go to your Supabase project
2. Click **Table Editor** in the left menu
3. You'll see your tables: `employees`, `leaves`, `email_sync_log`
4. You can view, edit, and query data directly!

---

## 🔧 Troubleshooting

### App shows "Database connection error"
- Check that DATABASE_URL is set correctly in Render
- Make sure you replaced `[YOUR-PASSWORD]` in the connection string
- Verify your Supabase project is active

### Data still disappearing after restart
- Confirm DATABASE_URL environment variable is set in Render
- Check Render logs for connection errors
- Make sure connection string includes port `:5432`

### App won't start
- Check Render logs (click on your service → **Logs**)
- Common issue: Missing `DATABASE_URL` variable

---

## 💡 Next Steps

### Enable Auto-Seed (Optional)
Your app auto-seeds with sample data if database is empty. To disable:
1. Go to [server/index.js](server/index.js)
2. Comment out lines 60-68 (the auto-seed code)

### Local Development
Your app works with SQLite locally and PostgreSQL in production automatically!

**Run locally:**
```powershell
npm run dev
```
- Uses SQLite (data stored in `data/leave_tracker.db`)
- No DATABASE_URL needed locally

**Test PostgreSQL locally:**
```powershell
$env:DATABASE_URL="your-supabase-connection-string"
npm start
```

---

## 📈 Free Tier Limits

### Supabase (Free Forever)
- ✅ 500MB database storage
- ✅ Unlimited API requests
- ✅ 50,000 monthly active users
- ✅ 2GB file storage
- ✅ 1GB bandwidth/month

**Perfect for:** Small to medium teams (up to 100+ employees)

### Render (Free Tier)
- ✅ 750 hours/month (enough for 24/7)
- ✅ 512 MB RAM
- ⚠️ Spins down after 15 min inactivity (wakes in ~30 sec)

---

## 🆙 Upgrade Options (If Needed Later)

### If You Outgrow Free Tier:

**Option 1: Keep Supabase Free + Upgrade Render**
- Supabase: FREE (500MB is plenty)
- Render: $7/month for always-on instance

**Option 2: Switch to Railway**
- $5/month (covers both app + database)
- Better performance
- No cold starts

---

## 🔐 Security Notes

- ✅ Your DATABASE_URL is encrypted in Render
- ✅ Supabase uses industry-standard security
- ✅ Connection is SSL encrypted
- ⚠️ Never commit DATABASE_URL to Git
- ⚠️ Don't share your connection string publicly

---

## ❓ Questions?

**Database not connecting?**
- Verify DATABASE_URL format: `postgresql://postgres:PASSWORD@HOST:5432/postgres`
- Check Supabase project is not paused (free tier projects stay active with usage)

**Need help?**
- Check Render logs for errors
- Visit Supabase dashboard to verify database is running
- Test connection string with a PostgreSQL client

---

**Enjoy your FREE, fully persistent Leave Tracker! 🎉**

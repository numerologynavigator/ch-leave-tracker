# Deploying Leave Tracker to the Internet

## Option 1: Railway (Recommended - Easiest)

Railway can host your full-stack app with SQLite database.

### Steps:

1. **Create GitHub Repository**
   ```powershell
   cd "c:\Leave Tracker"
   git init
   git add .
   git commit -m "Initial commit - Leave Tracker"
   ```

2. **Push to GitHub**
   - Go to github.com and create a new repository called "leave-tracker"
   - Run:
   ```powershell
   git remote add origin https://github.com/YOUR_USERNAME/leave-tracker.git
   git branch -M main
   git push -u origin main
   ```

3. **Deploy to Railway**
   - Go to https://railway.app
   - Sign up with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your "leave-tracker" repository
   - Railway will auto-detect and deploy!

4. **Configure Environment Variables**
   - In Railway dashboard, go to your project
   - Click "Variables" tab
   - Add these:
     ```
     NODE_ENV=production
     PORT=5000
     ```
   - If you want email sync, add Microsoft credentials too

5. **Get Your URL**
   - Railway will give you a URL like: `https://leave-tracker-production.up.railway.app`
   - Access it from anywhere!

**Cost:** Free tier includes $5/month credit (enough for small apps)

---

## Option 2: Vercel (Frontend) + Render (Backend)

### Frontend on Vercel:

1. **Update vite.config.js** to point to production API:
   ```javascript
   // In client/vite.config.js
   server: {
     proxy: {
       '/api': {
         target: process.env.VITE_API_URL || 'http://localhost:5000',
         changeOrigin: true
       }
     }
   }
   ```

2. **Deploy to Vercel**
   - Push to GitHub (same as above)
   - Go to https://vercel.com
   - Import your repository
   - Set Root Directory to: `client`
   - Deploy!

### Backend on Render:

1. **Create render.yaml** in root:
   ```yaml
   services:
     - type: web
       name: leave-tracker-api
       env: node
       buildCommand: npm install
       startCommand: npm run server
       envVars:
         - key: NODE_ENV
           value: production
   ```

2. **Deploy to Render**
   - Go to https://render.com
   - New → Web Service
   - Connect GitHub repo
   - Deploy!

3. **Update Vercel Environment**
   - In Vercel dashboard, add environment variable:
     - `VITE_API_URL` = your Render backend URL

**Cost:** Both have free tiers

---

## Option 3: Azure (Since you're using Deloitte/Microsoft)

1. **Azure App Service**
   - Go to Azure Portal
   - Create App Service (Node.js)
   - Deploy via GitHub Actions or ZIP deploy

2. **Azure Static Web Apps** (for frontend)
   - Perfect for React apps
   - Auto-builds on Git push

**Cost:** Has free tier, likely covered by your organization

---

## Important: Database Considerations

**SQLite on Cloud:**
- Railway: ✅ Works (persistent storage)
- Render: ✅ Works (persistent disk)
- Vercel: ❌ Doesn't work (ephemeral filesystem)

**For production, consider:**
- Keep SQLite (works on Railway/Render)
- Or upgrade to PostgreSQL (free tier on Railway/Render/Supabase)

---

## Quick Start Guide

### Fastest way (Railway):

```powershell
# 1. Initialize git
cd "c:\Leave Tracker"
git init
git add .
git commit -m "Leave tracker initial deployment"

# 2. Create GitHub repo and push
# (Do this on github.com first, then:)
git remote add origin https://github.com/YOUR_USERNAME/leave-tracker.git
git push -u origin main

# 3. Deploy on Railway
# - Go to railway.app
# - Connect GitHub
# - Deploy
# - Done! 🎉
```

### Add these files before deploying:

**Create .gitignore updates:**
```
node_modules/
.env
*.db
data/
.DS_Store
dist/
build/
```

**Create Procfile (for Railway/Render):**
```
web: npm run server
```

---

## After Deployment:

1. **Update .env in Railway/Render dashboard** with your production values
2. **Test the application** at your new URL
3. **Share the URL** with your team
4. **Set up custom domain** (optional, in Railway/Vercel settings)

---

## Recommended: Railway

Railway is the easiest for your use case because:
- ✅ Handles both frontend and backend
- ✅ SQLite database persists
- ✅ Auto-deploys on Git push
- ✅ Free $5/month credit
- ✅ Simple setup
- ✅ Good for internal tools

**Your app will be live at:** `https://your-app.up.railway.app`

# Deploy for FREE - No Credit Card Required

## Option 1: Render (100% Free - Recommended)

**Best for:** Full-stack apps,永久免费 (free forever)

### Steps:

#### 1. Push to GitHub:
```powershell
cd "c:\Leave Tracker"
git init
git add .
git commit -m "Initial deployment"
```

Go to github.com, create repository "leave-tracker", then:
```powershell
git remote add origin https://github.com/YOUR_USERNAME/leave-tracker.git
git branch -M main
git push -u origin main
```

#### 2. Deploy to Render:
1. Go to [render.com](https://render.com)
2. Sign up with GitHub (free, no credit card)
3. Click "New +" → "Web Service"
4. Connect your "leave-tracker" repository
5. Configure:
   - **Name:** leave-tracker
   - **Build Command:** `npm install && cd client && npm install && npm run build`
   - **Start Command:** `node server/index.js`
   - **Plan:** FREE
6. Click "Create Web Service"

**Your app will be live at:** `https://leave-tracker-xxxx.onrender.com`

**Free tier includes:**
- ✅ 750 hours/month (enough for 24/7)
- ✅ 512 MB RAM
- ✅ SQLite database persists
- ✅ Auto-deploy on Git push
- ✅ Free SSL certificate

**Limitations:**
- ⚠️ Spins down after 15 mins of inactivity (first request takes ~30 seconds to wake up)
- Good for internal tools, not high-traffic sites

---

## Option 2: Railway (Free $5/Month Credit)

**Best for:** No sleep, instant response

### Steps:

#### 1. Push to GitHub (if not done):
```powershell
cd "c:\Leave Tracker"
git init
git add .
git commit -m "Initial deployment"
git remote add origin https://github.com/YOUR_USERNAME/leave-tracker.git
git push -u origin main
```

#### 2. Deploy to Railway:
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub (no credit card for trial)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select "leave-tracker"
5. Railway auto-detects and deploys!

**Your app will be live at:** `https://leave-tracker-production.up.railway.app`

**Free tier:**
- ✅ $5 credit/month (renews monthly)
- ✅ Enough for small teams
- ✅ No sleep/wake delays
- ✅ Better performance than Render free tier

**Note:** After trial, need credit card for $5/mo credit (but won't charge if under $5)

---

## Option 3: Vercel (Frontend) + Render (Backend) - Both FREE

**Best for:** Fastest frontend performance

### Frontend on Vercel:

#### 1. Update client vite config:
Add to `client/vite.config.js`:
```javascript
export default defineConfig({
  // ... existing config
  build: {
    outDir: 'dist'
  }
})
```

#### 2. Deploy Frontend:
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (free)
3. Click "New Project"
4. Import "leave-tracker"
5. Configure:
   - **Framework:** Vite
   - **Root Directory:** client
   - **Build Command:** `npm run build`
   - **Output Directory:** dist
6. Add Environment Variable:
   - `VITE_API_URL` = `https://your-render-backend-url.onrender.com`
7. Deploy!

### Backend on Render:
Follow Option 1 above (Render free tier)

**Frontend URL:** `https://leave-tracker.vercel.app`
**Backend URL:** `https://leave-tracker-api.onrender.com`

Both completely free forever!

---

## Option 4: Netlify (Frontend) + Render (Backend)

Similar to Vercel option:

1. **Frontend:** Deploy to [netlify.com](https://netlify.com) (drag & drop `client/dist` folder)
2. **Backend:** Deploy to Render (see Option 1)

Both free forever!

---

## Option 5: Fly.io (Free Tier)

**Best for:** Global edge deployment

### Steps:

#### 1. Install Fly CLI:
```powershell
# PowerShell (as Admin):
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

#### 2. Create account & login:
```powershell
fly auth signup
fly auth login
```

#### 3. Create fly.toml:
(Already created below)

#### 4. Deploy:
```powershell
cd "c:\Leave Tracker"
fly launch --name leave-tracker
fly deploy
```

**Free tier:**
- ✅ 3 VMs with 256MB RAM
- ✅ 3GB persistent storage
- ✅ 160GB outbound data/month
- ✅ No sleep delays

---

## Option 6: Cyclic.sh (Easiest - Deprecated but check alternatives)

**Alternative similar services:**
- **Deta Space** - Free, unlimited
- **Koyeb** - Free tier available

---

## Comparison Table:

| Service | Free Tier | Sleep/Wake | SQLite | Credit Card |
|---------|-----------|------------|--------|-------------|
| **Render** | ✅ 750hr/mo | ⚠️ 15min idle | ✅ Yes | ❌ No |
| **Railway** | ✅ $5/mo credit | ✅ No sleep | ✅ Yes | ⚠️ For $5/mo |
| **Vercel** | ✅ 100GB bandwidth | ✅ No sleep | ❌ No (frontend only) | ❌ No |
| **Fly.io** | ✅ 3 VMs | ✅ No sleep | ✅ Yes | ⚠️ Required |
| **AWS Free Tier** | ✅ 12 months | ✅ No sleep | ✅ Yes | ✅ Required |

---

## My Recommendation for 100% Free:

### 🏆 **Render (Option 1)** - Simplest

**Pros:**
- ✅ No credit card needed
- ✅ One service hosts everything
- ✅ Auto-deploy from GitHub
- ✅ Free SSL
- ✅ SQLite persists
- ✅ Free forever

**Cons:**
- ⚠️ Sleeps after 15min (first load takes 30 seconds)
- For internal team tool, this is fine!

**Perfect for:** Small teams, internal tools, <50 users

### Alternative: **Railway** if you want instant response (no sleep)

---

## Quick Start (Render - 5 Minutes):

```powershell
# 1. Initialize Git
cd "c:\Leave Tracker"
git init
git add .
git commit -m "Ready for deployment"

# 2. Create GitHub repo, then:
git remote add origin https://github.com/YOUR_USERNAME/leave-tracker.git
git branch -M main
git push -u origin main

# 3. Go to render.com
# - Sign up with GitHub
# - New Web Service
# - Connect leave-tracker repo
# - Build: npm install && cd client && npm install && npm run build
# - Start: node server/index.js
# - Deploy!
```

**Done! Free forever, no credit card! 🎉**

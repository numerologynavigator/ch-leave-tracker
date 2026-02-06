# FREE Deployment Options for Leave Tracker

## 🌟 Top 3 Free Options (Recommended)

### 1. **Render** (Easiest & Free Forever)
**Best for:** Full-stack apps with database
**Free Tier:** 750 hours/month, auto-sleep after 15 min inactivity

#### Steps:
1. **Push code to GitHub** (use `push-to-github.ps1`)
2. **Go to:** https://render.com
3. **Sign up** with GitHub
4. **New** → **Web Service**
5. **Connect repository:** `numerologynavigator/ch-leave-tracker`
6. **Configure:**
   - Name: `leave-tracker`
   - Environment: `Node`
   - Build Command: `npm install && cd client && npm install && npm run build`
   - Start Command: `node server/index.js`
   - Instance Type: **Free**
7. **Add Environment Variables:**
   - `NODE_ENV` = `production`
8. **Create Web Service**

**✓ Your app will be live at:** `https://leave-tracker.onrender.com`

**Pros:**
- ✅ 100% Free forever
- ✅ SQLite database persists
- ✅ Auto HTTPS
- ✅ Auto-deploy on Git push

**Cons:**
- ⚠️ Sleeps after 15 min (wakes up in 1 min on first request)

---

### 2. **Railway** (Great Performance)
**Best for:** Fast deployment with good free tier
**Free Tier:** $5/month credit (enough for small apps)

#### Steps:
1. **Push code to GitHub**
2. **Go to:** https://railway.app
3. **Sign up** with GitHub
4. **New Project** → **Deploy from GitHub**
5. **Select:** `numerologynavigator/ch-leave-tracker`
6. **Railway auto-detects** Node.js and deploys!

**✓ Your app will be live at:** `https://your-app.railway.app`

**Pros:**
- ✅ $5/month free credit
- ✅ No sleep/cold starts
- ✅ Fast performance
- ✅ Easy setup

**Cons:**
- ⚠️ Limited to $5/month usage

---

### 3. **Fly.io** (Best Performance & Location Options)
**Best for:** Production-grade free hosting
**Free Tier:** 3 shared VMs, 160GB transfer/month

#### Steps:
1. **Push code to GitHub**
2. **Install Fly CLI:**
   ```powershell
   iwr https://fly.io/install.ps1 -useb | iex
   ```
3. **Login:**
   ```powershell
   fly auth login
   ```
4. **Deploy:**
   ```powershell
   cd "c:\Leave Tracker"
   fly launch
   # Follow prompts (app name, region)
   # Say YES to deploy
   ```

**✓ Your app will be live at:** `https://your-app.fly.dev`

**Pros:**
- ✅ Excellent free tier
- ✅ No cold starts
- ✅ Choose region (low latency)
- ✅ Production-ready

**Cons:**
- ⚠️ Requires credit card (won't charge on free tier)

---

## 🎯 Quick Comparison

| Service | Free Hours | Database | Cold Starts | Setup Time |
|---------|-----------|----------|-------------|------------|
| **Render** | 750/mo | ✅ Persists | ⚠️ Yes (15min) | 5 min |
| **Railway** | $5 credit | ✅ Persists | ❌ No | 2 min |
| **Fly.io** | Unlimited | ✅ Persists | ❌ No | 5 min |
| **Vercel** | Unlimited | ❌ Ephemeral | ❌ No | 3 min* |
| **Netlify** | Unlimited | ❌ Ephemeral | ❌ No | 3 min* |

*Vercel/Netlify only work for frontend. Backend needs separate hosting.

---

## 🚀 Recommended: Render (100% Free Forever)

### Quick Deploy to Render:

1. **Run this script first:**
   ```powershell
   .\push-to-github.ps1
   ```

2. **Go to:** https://render.com/deploy
3. **Sign up** and click **"New +"** → **"Web Service"**
4. **Connect GitHub** and select your repo
5. **Settings:**
   - **Build Command:** `npm install && cd client && npm install && npm run build`
   - **Start Command:** `node server/index.js`
   - **Instance Type:** Free
6. **Click "Create Web Service"**

**Done! Your app will be live in ~5 minutes.**

---

## 📝 After Deployment:

1. **Get your URL** (e.g., `https://leave-tracker.onrender.com`)
2. **Test all features:**
   - Add employees
   - Add leaves
   - View analytics
3. **Optional: Add custom domain** (free on all platforms)
4. **Set up auto-deploy** (push to GitHub = auto update)

---

## 💡 Pro Tips:

- **Render** is best if you want truly free forever
- **Railway** is best for no cold starts (until credit runs out)
- **Fly.io** is best for production performance
- All options support **SQLite** database persistence
- All provide **free HTTPS** certificates
- All support **environment variables** for sensitive data

---

## Need Help?

Run the push script first:
```powershell
.\push-to-github.ps1
```

Then deploy to your chosen platform! 🎉

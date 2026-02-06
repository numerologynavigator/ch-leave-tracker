# Deploy to AWS - Simplest Method

## Option 1: AWS Elastic Beanstalk (Recommended - Easiest)

### Prerequisites:
1. AWS Account (free tier available)
2. AWS CLI installed

### Install AWS CLI:
```powershell
# Download and install from: https://aws.amazon.com/cli/
# Or use chocolatey:
choco install awscli

# Verify installation:
aws --version
```

### Steps:

#### 1. Install Elastic Beanstalk CLI:
```powershell
pip install awsebcli --upgrade --user
```

#### 2. Configure AWS Credentials:
```powershell
aws configure
# Enter your:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region (e.g., us-east-1)
# - Output format: json
```

#### 3. Initialize Elastic Beanstalk:
```powershell
cd "c:\Leave Tracker"
eb init

# Select:
# - Region: (choose closest to you)
# - Application name: leave-tracker
# - Platform: Node.js
# - Platform version: (latest)
# - SSH: Yes (for debugging)
```

#### 4. Create Environment and Deploy:
```powershell
eb create leave-tracker-env

# Wait 5-10 minutes for deployment...
# EB will automatically:
# - Install dependencies
# - Build frontend
# - Start backend
# - Assign a URL
```

#### 5. Get Your URL:
```powershell
eb open
```

**Your app will be live at:** `http://leave-tracker-env.eba-xxxxxx.us-east-1.elasticbeanstalk.com`

### Future Updates:
```powershell
# After making changes:
git add .
git commit -m "Update features"
eb deploy
```

**Cost:** Free tier covers 750 hours/month for 12 months

---

## Option 2: AWS Amplify (Frontend) + Lambda (Backend)

### For Frontend:

#### 1. Push to GitHub (if not done):
```powershell
cd "c:\Leave Tracker"
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/leave-tracker.git
git push -u origin main
```

#### 2. Deploy to Amplify:
- Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
- Click "New app" → "Host web app"
- Connect GitHub repository
- Build settings:
  ```yaml
  version: 1
  applications:
    - appRoot: client
      frontend:
        phases:
          preBuild:
            commands:
              - npm install
          build:
            commands:
              - npm run build
        artifacts:
          baseDirectory: dist
          files:
            - '**/*'
        cache:
          paths:
            - node_modules/**/*
  ```
- Deploy!

### For Backend:

Use **AWS Lambda + API Gateway** (more complex) OR **AWS App Runner** (simpler):

#### AWS App Runner:
- Go to [AWS App Runner Console](https://console.aws.amazon.com/apprunner)
- Create service from source code
- Connect GitHub
- Auto-deploy on push

**Cost:** Amplify ~$0.15/GB, App Runner $0.007/hour when idle

---

## Option 3: AWS EC2 (Most Control)

### Steps:

#### 1. Launch EC2 Instance:
- Go to [AWS EC2 Console](https://console.aws.amazon.com/ec2)
- Launch Instance
- Choose: Ubuntu Server (free tier: t2.micro)
- Configure security group:
  - Port 22 (SSH)
  - Port 80 (HTTP)
  - Port 5000 (Your app)
- Download key pair (.pem file)

#### 2. Connect to Instance:
```powershell
# Convert .pem to .ppk if using PuTTY
# Or use SSH:
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
```

#### 3. Setup Server:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Clone your repository
git clone https://github.com/YOUR_USERNAME/leave-tracker.git
cd leave-tracker

# Install dependencies
npm install
cd client && npm install && npm run build && cd ..

# Set environment to production
echo "NODE_ENV=production" > .env

# Start with PM2
pm2 start server/index.js --name leave-tracker
pm2 startup
pm2 save
```

#### 4. Setup Nginx (optional, for production):
```bash
sudo apt install nginx -y

# Configure nginx
sudo nano /etc/nginx/sites-available/leave-tracker
```

Add:
```nginx
server {
    listen 80;
    server_name your-ec2-public-ip;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/leave-tracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**Access:** `http://your-ec2-public-ip`

**Cost:** Free tier t2.micro for 12 months

---

## Recommended: AWS Elastic Beanstalk

**Why?**
- ✅ Simplest setup (3 commands)
- ✅ Handles frontend + backend together
- ✅ SQLite database persists
- ✅ Auto-scaling
- ✅ Health monitoring
- ✅ Easy updates (`eb deploy`)
- ✅ Free tier eligible

**Quick Start:**
```powershell
pip install awsebcli --upgrade --user
cd "c:\Leave Tracker"
eb init
eb create leave-tracker-env
eb open
```

**Done! Your app is live on AWS.**

---

## Important: Database Consideration

**SQLite on AWS:**
- ✅ Works on Elastic Beanstalk (with persistent storage)
- ✅ Works on EC2
- ⚠️ Not recommended for Amplify/Lambda (ephemeral)

**For production scale, consider:**
- **AWS RDS** (PostgreSQL/MySQL) - Managed database
- **Amazon Aurora** - AWS's high-performance database
- Keep SQLite for small teams (<20 people)

---

## Post-Deployment Checklist:

1. ✅ Update CORS settings in backend if needed
2. ✅ Set environment variables in AWS console
3. ✅ Test all features (add employee, add leave, email sync)
4. ✅ Setup custom domain (optional - Route 53)
5. ✅ Enable HTTPS (Let's Encrypt or AWS Certificate Manager)
6. ✅ Setup backups for database
7. ✅ Monitor costs in AWS Billing Dashboard

---

## Cost Estimates:

| Service | Free Tier | After Free Tier |
|---------|-----------|-----------------|
| Elastic Beanstalk | 750 hrs/mo × 12 mo | ~$15-25/month |
| EC2 t2.micro | 750 hrs/mo × 12 mo | ~$8-10/month |
| Amplify | 1000 build mins/mo | $0.01/build min |
| App Runner | None | $0.007/hr idle |

**Recommended:** Start with Elastic Beanstalk free tier

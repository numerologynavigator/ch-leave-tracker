# Push Leave Tracker to GitHub
Write-Host "Pushing Leave Tracker to GitHub..." -ForegroundColor Green

# Initialize git if not already done
if (-not (Test-Path ".git")) {
    Write-Host "Initializing git repository..." -ForegroundColor Yellow
    git init
    Write-Host "Git initialized" -ForegroundColor Green
} else {
    Write-Host "Git repository already exists" -ForegroundColor Green
}

# Create .gitignore if it doesn't exist
if (-not (Test-Path ".gitignore")) {
    Write-Host "Creating .gitignore..." -ForegroundColor Yellow
    
    $gitignoreContent = @"
# Dependencies
node_modules/
client/node_modules/

# Build outputs
client/dist/
dist/
build/

# Environment files
.env
.env.local
.env.production

# Database
data/
*.db
*.sqlite
*.sqlite3

# Python
.venv/
__pycache__/
*.pyc

# Logs
*.log
npm-debug.log*
logs/

# OS files
.DS_Store
Thumbs.db
desktop.ini

# IDE
.vscode/
.idea/
*.swp
*.swo

# Temporary files
*.tmp
eb-package-temp/
*.zip

# Backup files
*.backup
"@
    
    $gitignoreContent | Out-File -FilePath ".gitignore" -Encoding utf8
    Write-Host ".gitignore created" -ForegroundColor Green
}

# Add all files
Write-Host "Adding files to git..." -ForegroundColor Yellow
git add .

# Commit
Write-Host "Creating commit..." -ForegroundColor Yellow
$commitMessage = "Initial commit - Leave Tracker application"
git commit -m $commitMessage

# Add remote (will fail if already exists, that's okay)
Write-Host "Adding remote repository..." -ForegroundColor Yellow
git remote add origin https://github.com/numerologynavigator/ch-leave-tracker.git 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Remote already exists, updating..." -ForegroundColor Yellow
    git remote set-url origin https://github.com/numerologynavigator/ch-leave-tracker.git
}

# Get current branch name
$branch = git rev-parse --abbrev-ref HEAD 2>$null
if (-not $branch) {
    $branch = "main"
    git branch -M main
}

Write-Host "Remote configured" -ForegroundColor Green

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "Branch: $branch" -ForegroundColor Cyan

git push -u origin $branch

if ($LASTEXITCODE -eq 0) {
    Write-Host "Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "Repository: https://github.com/numerologynavigator/ch-leave-tracker" -ForegroundColor Cyan
    Write-Host "Next: Deploy using one of the free options (see FREE_DEPLOYMENT_OPTIONS.md)" -ForegroundColor Yellow
} else {
    Write-Host "Push failed. You may need to authenticate with GitHub first" -ForegroundColor Red
}

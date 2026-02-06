# Start the Leave Tracker application

Write-Host "🚀 Starting Leave Tracker..." -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm run install-all
    Write-Host ""
}

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "⚙️  Creating .env file..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✓ Created .env file - please configure it with your settings" -ForegroundColor Green
    Write-Host ""
}

# Check if database needs seeding
if (-not (Test-Path "data/leave_tracker.db")) {
    Write-Host "🌱 Would you like to seed the database with sample data? (Y/N)" -ForegroundColor Yellow
    $seed = Read-Host
    if ($seed -eq "Y" -or $seed -eq "y") {
        npm run seed
        Write-Host ""
    }
}

Write-Host "🎯 Starting application..." -ForegroundColor Green
Write-Host ""
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

npm run dev

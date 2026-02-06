# Create deployment package for AWS Elastic Beanstalk
Write-Host "Creating Elastic Beanstalk deployment package..." -ForegroundColor Green

# Create temp directory
$tempDir = "eb-package-temp"
if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copy required files
Write-Host "Copying required files..." -ForegroundColor Yellow

# Root files
Copy-Item "package.json" $tempDir
Copy-Item "README.md" $tempDir -ErrorAction SilentlyContinue

# Server folder
Copy-Item -Recurse "server" $tempDir

# Client folder (source only, no node_modules)
New-Item -ItemType Directory -Path "$tempDir/client" | Out-Null
Copy-Item "client/package.json" "$tempDir/client"
Copy-Item "client/index.html" "$tempDir/client"
Copy-Item "client/vite.config.js" "$tempDir/client"
Copy-Item "client/postcss.config.js" "$tempDir/client"
Copy-Item "client/tailwind.config.js" "$tempDir/client"
Copy-Item -Recurse "client/src" "$tempDir/client"

# .ebignore if exists
if (Test-Path ".ebignore") {
    Copy-Item ".ebignore" $tempDir
}

# Create zip
$zipFile = "leave-tracker-eb.zip"
if (Test-Path $zipFile) {
    Remove-Item $zipFile
}

Write-Host "Creating ZIP file..." -ForegroundColor Yellow
Compress-Archive -Path "$tempDir/*" -DestinationPath $zipFile

# Clean up
Remove-Item -Recurse -Force $tempDir

# Get file size
$size = (Get-Item $zipFile).Length / 1MB
Write-Host "`nDeployment package created: $zipFile" -ForegroundColor Green
Write-Host "Size: $([math]::Round($size, 2)) MB" -ForegroundColor Cyan
Write-Host "`nThis package is ready to upload to AWS Elastic Beanstalk!" -ForegroundColor Green

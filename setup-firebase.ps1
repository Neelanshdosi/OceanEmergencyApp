# Firebase Setup Script for Ocean Emergency App
# Run this script after you get your Firebase credentials

Write-Host "🔥 Firebase Setup for Ocean Emergency App" -ForegroundColor Green
Write-Host ""

# Check if firebase-service-account.json exists
if (Test-Path "firebase-service-account.json") {
    Write-Host "✅ firebase-service-account.json found" -ForegroundColor Green
} else {
    Write-Host "❌ firebase-service-account.json not found" -ForegroundColor Red
    Write-Host "Please download your Firebase service account key and save it as 'firebase-service-account.json'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Steps to get Firebase credentials:" -ForegroundColor Cyan
    Write-Host "1. Go to https://console.firebase.google.com/" -ForegroundColor White
    Write-Host "2. Create a new project or select existing project" -ForegroundColor White
    Write-Host "3. Go to Project Settings > Service Accounts" -ForegroundColor White
    Write-Host "4. Click 'Generate new private key'" -ForegroundColor White
    Write-Host "5. Download the JSON file and rename it to 'firebase-service-account.json'" -ForegroundColor White
    Write-Host "6. Place it in this project root directory" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Set environment variables
Write-Host "Setting environment variables..." -ForegroundColor Yellow

# Read the project ID from the JSON file
$jsonContent = Get-Content "firebase-service-account.json" | ConvertFrom-Json
$projectId = $jsonContent.project_id

if ($projectId) {
    $env:FIREBASE_PROJECT_ID = $projectId
    $env:GOOGLE_APPLICATION_CREDENTIALS = ".\firebase-service-account.json"
    
    Write-Host "✅ FIREBASE_PROJECT_ID set to: $projectId" -ForegroundColor Green
    Write-Host "✅ GOOGLE_APPLICATION_CREDENTIALS set to: .\firebase-service-account.json" -ForegroundColor Green
} else {
    Write-Host "❌ Could not read project_id from firebase-service-account.json" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Environment variables set! You can now:" -ForegroundColor Green
Write-Host "1. Restart the frontend: pnpm dev" -ForegroundColor White
Write-Host "2. Restart the backend: cd backend && python app.py" -ForegroundColor White
Write-Host "3. Open http://localhost:8080 in your browser" -ForegroundColor White
Write-Host ""
Write-Host "The app should now work without Firebase errors!" -ForegroundColor Green

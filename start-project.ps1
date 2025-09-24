# Ocean Emergency App Startup Script
Write-Host "🚀 Starting Ocean Emergency App" -ForegroundColor Green
Write-Host ""

# Set Firebase environment variables
$env:FIREBASE_PROJECT_ID = "ocean-emergency-8a649"
$env:GOOGLE_APPLICATION_CREDENTIALS = ".\firebase-service-account.json"

Write-Host "✅ Firebase environment variables set" -ForegroundColor Green
Write-Host ""

# Start frontend in new window
Write-Host "Starting frontend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; pnpm dev"

# Wait a moment for frontend to start
Start-Sleep -Seconds 3

# Start backend in new window
Write-Host "Starting backend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; python app.py"

Write-Host ""
Write-Host "🎉 Both servers are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend: http://localhost:8080" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

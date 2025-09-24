Write-Host "Starting Ocean Emergency App with all fixes..." -ForegroundColor Green

# Set environment variables
$env:FIREBASE_PROJECT_ID = "ocean-emergency-8a649"
$env:GOOGLE_APPLICATION_CREDENTIALS = ".\firebase-service-account.json"

Write-Host "`n✅ Environment variables set" -ForegroundColor Green

# Start Flask backend in new window
Write-Host "Starting Flask backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\New folder (3)\New folder\OceanEmergencyApp-main\backend'; `$env:FIREBASE_PROJECT_ID='ocean-emergency-8a649'; `$env:GOOGLE_APPLICATION_CREDENTIALS='..\firebase-service-account.json'; python app.py"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend
Write-Host "Starting React frontend..." -ForegroundColor Yellow
pnpm dev

Write-Host "`n✅ Both servers should now be running!" -ForegroundColor Green
Write-Host "`nFrontend: http://localhost:8080/" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:5000/" -ForegroundColor Cyan
Write-Host "`nAdmin Credentials:" -ForegroundColor Magenta
Write-Host "📧 Email: admin@ocean-emergency.com" -ForegroundColor White
Write-Host "🔑 Password: admin123" -ForegroundColor White
Write-Host "👤 Role: admin" -ForegroundColor White

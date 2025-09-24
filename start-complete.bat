@echo off
echo Starting Ocean Emergency App with all fixes...

REM Set environment variables
set FIREBASE_PROJECT_ID=ocean-emergency-8a649
set GOOGLE_APPLICATION_CREDENTIALS=.\firebase-service-account.json

echo.
echo ✅ Environment variables set
echo.

REM Start Flask backend in new window
echo Starting Flask backend...
start "Flask Backend" cmd /k "cd backend && set FIREBASE_PROJECT_ID=ocean-emergency-8a649 && set GOOGLE_APPLICATION_CREDENTIALS=..\firebase-service-account.json && python app.py"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
echo Starting React frontend...
pnpm dev

echo.
echo ✅ Both servers should now be running!
echo.
echo Frontend: http://localhost:8080/
echo Backend: http://localhost:5000/
echo.
echo Admin Credentials:
echo 📧 Email: admin@ocean-emergency.com
echo 🔑 Password: admin123
echo 👤 Role: admin
echo.
pause

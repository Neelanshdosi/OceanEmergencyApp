@echo off
echo 🚀 Starting Ocean Emergency App
echo.

REM Set Firebase environment variables
set FIREBASE_PROJECT_ID=ocean-emergency-8a649
set GOOGLE_APPLICATION_CREDENTIALS=.\firebase-service-account.json

echo ✅ Firebase environment variables set
echo.

REM Start frontend in new window
echo Starting frontend server...
start "Frontend Server" cmd /k "cd /d "%~dp0" && pnpm dev"

REM Wait a moment for frontend to start
timeout /t 3 /nobreak >nul

REM Start backend in new window
echo Starting backend server...
start "Backend Server" cmd /k "cd /d "%~dp0\backend" && python app.py"

echo.
echo 🎉 Both servers are starting!
echo.
echo Frontend: http://localhost:8080
echo Backend: http://localhost:5000
echo.
echo Press any key to exit this window...
pause >nul

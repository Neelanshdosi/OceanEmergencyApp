@echo off
echo 🔥 Firebase Setup for Ocean Emergency App
echo.

REM Check if firebase-service-account.json exists
if exist "firebase-service-account.json" (
    echo ✅ firebase-service-account.json found
) else (
    echo ❌ firebase-service-account.json not found
    echo Please download your Firebase service account key and save it as 'firebase-service-account.json'
    echo.
    echo Steps to get Firebase credentials:
    echo 1. Go to https://console.firebase.google.com/
    echo 2. Create a new project or select existing project
    echo 3. Go to Project Settings ^> Service Accounts
    echo 4. Click 'Generate new private key'
    echo 5. Download the JSON file and rename it to 'firebase-service-account.json'
    echo 6. Place it in this project root directory
    echo.
    pause
    exit /b 1
)

echo Setting environment variables...
set FIREBASE_PROJECT_ID=your-firebase-project-id
set GOOGLE_APPLICATION_CREDENTIALS=.\firebase-service-account.json

echo.
echo ✅ Environment variables set!
echo.
echo 🚀 You can now:
echo 1. Restart the frontend: pnpm dev
echo 2. Restart the backend: cd backend && python app.py
echo 3. Open http://localhost:8080 in your browser
echo.
echo The app should now work without Firebase errors!
pause

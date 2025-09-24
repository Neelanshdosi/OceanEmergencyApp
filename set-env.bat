@echo off
echo Setting up environment variables for Ocean Emergency App...
echo.

REM Set Firebase environment variables
set FIREBASE_PROJECT_ID=ocean-emergency-8a649
set GOOGLE_APPLICATION_CREDENTIALS=.\firebase-service-account.json

echo ✅ Environment variables set:
echo FIREBASE_PROJECT_ID=%FIREBASE_PROJECT_ID%
echo GOOGLE_APPLICATION_CREDENTIALS=%GOOGLE_APPLICATION_CREDENTIALS%
echo.

echo Now you can run:
echo   pnpm dev
echo   cd backend && python app.py
echo.
pause

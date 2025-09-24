@echo off
echo Starting Flask Backend Server...
echo.

REM Set environment variables
set FIREBASE_PROJECT_ID=ocean-emergency-8a649
set GOOGLE_APPLICATION_CREDENTIALS=..\firebase-service-account.json
set FLASK_ENV=development
set FLASK_DEBUG=True

echo ✅ Environment variables set
echo.

REM Activate virtual environment and start Flask
call .venv\Scripts\activate
python app.py

pause

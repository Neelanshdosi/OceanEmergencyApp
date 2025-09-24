@echo off
echo Setting up Ocean Emergency App Admin...

REM Set environment variables
set FIREBASE_PROJECT_ID=ocean-emergency-8a649
set GOOGLE_APPLICATION_CREDENTIALS=.\firebase-service-account.json

echo.
echo Creating admin user...
cd backend
python seed_admin.py

echo.
echo ✅ Admin setup complete!
echo.
echo Admin Credentials:
echo 📧 Email: admin@ocean-emergency.com
echo 🔑 Password: admin123
echo 👤 Role: admin
echo.
echo You can now:
echo 1. Start the project: pnpm dev
echo 2. Login as admin in the app
echo 3. Access admin panel at /admin
echo.
pause

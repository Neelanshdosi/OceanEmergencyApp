@echo off
echo Setting up Git repository for Ocean Emergency App...

REM Initialize git repository
git init

REM Add all files
git add .

REM Create initial commit
git commit -m "Initial commit: Ocean Emergency App with Firebase integration"

echo.
echo ✅ Git repository initialized!
echo.
echo Next steps:
echo 1. Create a new repository on GitHub.com
echo 2. Copy the repository URL
echo 3. Run: git remote add origin YOUR_REPO_URL
echo 4. Run: git push -u origin main
echo.
echo Or use GitHub Desktop for easier setup!
pause

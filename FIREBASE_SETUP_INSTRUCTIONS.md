# 🔥 Firebase Setup Instructions

## Quick Setup (Recommended)

1. **Get Firebase Credentials:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select existing project
   - Go to **Project Settings** → **Service Accounts**
   - Click **"Generate new private key"**
   - Download the JSON file

2. **Add to Project:**
   - Rename the downloaded file to `firebase-service-account.json`
   - Place it in the project root directory (same level as `package.json`)

3. **Run Setup Script:**
   ```bash
   # Windows
   .\setup-firebase.bat
   
   # PowerShell
   .\setup-firebase.ps1
   ```

4. **Restart Servers:**
   ```bash
   # Frontend
   pnpm dev
   
   # Backend (in new terminal)
   cd backend
   python app.py
   ```

## Manual Setup

If you prefer to set up manually:

1. **Set Environment Variables:**
   ```bash
   # Windows PowerShell
   $env:FIREBASE_PROJECT_ID="your-project-id"
   $env:GOOGLE_APPLICATION_CREDENTIALS=".\firebase-service-account.json"
   
   # Windows CMD
   set FIREBASE_PROJECT_ID=your-project-id
   set GOOGLE_APPLICATION_CREDENTIALS=.\firebase-service-account.json
   ```

2. **Replace `your-project-id`** with your actual Firebase project ID from the JSON file

## What You Need

- **Firebase Project**: Create at [console.firebase.google.com](https://console.firebase.google.com/)
- **Firestore Database**: Enable in your Firebase project
- **Service Account Key**: Download from Project Settings → Service Accounts

## Files Created

- `firebase-service-account.json` - Your Firebase credentials (you need to add this)
- `setup-firebase.bat` - Windows batch setup script
- `setup-firebase.ps1` - PowerShell setup script
- `config.env` - Environment configuration template

## After Setup

Once you've added your Firebase credentials:

1. **Frontend**: http://localhost:8080 (should work without Firebase errors)
2. **Backend**: http://localhost:5000 (API endpoints will work)
3. **Database**: Firestore will be connected and functional

## Troubleshooting

- **"Project Id not detected"**: Make sure `firebase-service-account.json` is in the project root
- **"Permission denied"**: Check your Firestore security rules
- **"File not found"**: Ensure the JSON file is named exactly `firebase-service-account.json`

## Security Note

- Never commit `firebase-service-account.json` to version control
- The file is already in `.gitignore`
- For production, use environment variables or secure key management

# Firestore Setup Guide

## Prerequisites

1. **Firebase Project**: Create a project at [Firebase Console](https://console.firebase.google.com/)
2. **Firestore Database**: Enable Firestore in your Firebase project
3. **Service Account**: Create a service account key for local development

## Setup Options

### Option 1: Service Account Key (Recommended for Local Development)

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file and place it in your project root
4. Set the environment variable:
   ```bash
   # Windows PowerShell
   $env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\your\service-account-key.json"
   
   # Windows CMD
   set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\your\service-account-key.json
   ```

### Option 2: Application Default Credentials (For Production)

1. Set your Firebase project ID:
   ```bash
   $env:FIREBASE_PROJECT_ID="your-project-id"
   ```
2. Use Firebase CLI or Google Cloud SDK for authentication

## Testing the Integration

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Check the console for Firestore initialization messages:
   - ✅ "Firestore initialized successfully" - Database connected
   - ⚠️ "Firestore initialization failed, falling back to in-memory storage" - Using fallback

3. Test the API endpoints:
   - `GET http://localhost:8080/api/reports` - List reports
   - `POST http://localhost:8080/api/reports` - Create report

## Firestore Security Rules

Make sure your Firestore security rules allow read/write access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reports/{document} {
      allow read, write: if true; // For development only
    }
  }
}
```

**⚠️ Warning**: The above rules allow public access. For production, implement proper authentication and authorization rules.

## Troubleshooting

- **"Firestore not initialized"**: Check your service account key path and permissions
- **"Permission denied"**: Verify your Firestore security rules
- **"Project not found"**: Ensure your Firebase project ID is correct

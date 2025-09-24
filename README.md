# Ocean Emergency App

A full-stack crowdsourced ocean hazard reporting platform with real-time mapping, social media integration, and emergency response coordination.

## 🏗️ Architecture

This project consists of multiple components:

- **Frontend**: React + TypeScript + Vite (Port 8080)
- **Backend**: Python Flask API (Port 5000) 
- **Database**: Firebase Firestore
- **Social Integration**: Twitter API
- **Maps**: Leaflet with React-Leaflet

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **pnpm** (preferred) or npm
- **Python** 3.11+
- **Firebase Project** with Firestore enabled
- **Twitter Developer Account** (optional, for social features)

### 1. Install Dependencies

```bash
# Install Node.js dependencies
pnpm install

# Install Python dependencies
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Firebase Setup (Required)

**Quick Setup:**
1. Download your Firebase service account key from [Firebase Console](https://console.firebase.google.com/)
2. Save it as `firebase-service-account.json` in the project root
3. Run the setup script:
   ```bash
   # Windows
   .\setup-firebase.bat
   
   # PowerShell
   .\setup-firebase.ps1
   ```

**Manual Setup:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing project
3. Go to **Project Settings** → **Service Accounts**
4. Click **"Generate new private key"**
5. Download the JSON file and rename it to `firebase-service-account.json`
6. Place it in the project root directory
7. Set environment variables:
   ```bash
   # Windows PowerShell
   $env:FIREBASE_PROJECT_ID="your-project-id"
   $env:GOOGLE_APPLICATION_CREDENTIALS=".\firebase-service-account.json"
   
   # Windows CMD
   set FIREBASE_PROJECT_ID=your-project-id
   set GOOGLE_APPLICATION_CREDENTIALS=.\firebase-service-account.json
   ```

### 3. Firebase Setup

1. Download your Firebase service account key as `firebase-service-account.json`
2. Place it in the project root
3. Ensure Firestore is enabled in your Firebase project

### 4. Run the Application

#### Option A: Full Stack (Recommended)

```bash
# Terminal 1: Start the React frontend + Express server
pnpm dev

# Terminal 2: Start the Python Flask backend
cd backend
python app.py
```

The app will be available at:
- **Frontend**: http://localhost:8080
- **Flask API**: http://localhost:5000

#### Option B: Frontend Only

```bash
pnpm dev
```

This starts the React app with the integrated Express server on port 8080.

#### Option C: Backend Only

```bash
cd backend
python app.py
```

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── components/         # UI components
│   ├── pages/             # Route pages
│   └── context/           # React context
├── server/                # Express server (Node.js)
│   ├── routes/           # API routes
│   └── services/         # External services
├── backend/              # Flask backend (Python)
│   ├── app.py           # Main Flask app
│   ├── auth.py          # Authentication
│   └── firestore.py     # Database operations
├── shared/               # Shared types
└── public/               # Static assets
```

## 🔧 Development Commands

```bash
# Frontend development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm test             # Run tests
pnpm typecheck        # TypeScript validation

# Backend development
cd backend
python app.py         # Start Flask server
python seed.py        # Seed database with sample data
```

## 🌐 API Endpoints

### Flask Backend (Port 5000)

- `POST /register` - User registration
- `POST /login` - User authentication
- `POST /report` - Submit emergency report
- `GET /reports` - Get reports with filters
- `PUT /report/:id/verify` - Verify report
- `POST /social-media` - Post to social media
- `GET /analytics/hotspots` - Get hotspot analytics

### Express Server (Port 8080)

- `GET /api/reports` - Get reports
- `POST /api/reports` - Create report
- `GET /api/twitter/search` - Search Twitter
- `GET /api/twitter/ocean-emergency` - Get ocean emergency tweets

## 🗄️ Database Setup

### Firestore Collections

- `reports` - Emergency reports
- `users` - User accounts
- `social_posts` - Social media posts
- `analytics` - Analytics data

### Seeding Data

```bash
cd backend
python seed.py
```

## 🐦 Twitter Integration

1. Get Twitter API credentials from [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Add credentials to your `.env` file
3. Test the integration:

```bash
curl "http://localhost:8080/api/twitter/ocean-emergency?location=California"
```

## 🚀 Deployment

### Frontend (Netlify/Vercel)

```bash
pnpm build
# Deploy dist/spa/ folder
```

### Backend (Python)

```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Environment Variables for Production

- `FIREBASE_PROJECT_ID`
- `GOOGLE_APPLICATION_CREDENTIALS`
- `TWITTER_API_KEY`
- `TWITTER_API_SECRET`
- `TWITTER_ACCESS_TOKEN`
- `TWITTER_ACCESS_SECRET`

## 🔒 Security Notes

- Never commit `firebase-service-account.json` or `.env` files
- Use environment variables for all sensitive data
- Implement proper Firestore security rules for production
- Use Firebase Auth for production authentication

## 🆘 Troubleshooting

### Common Issues

1. **Firestore not connecting**: Check your service account key path
2. **Twitter API errors**: Verify your API credentials
3. **CORS issues**: Ensure Flask CORS is properly configured
4. **Port conflicts**: Check if ports 5000 and 8080 are available

### Debug Mode

```bash
# Enable Flask debug mode
cd backend
export FLASK_DEBUG=1  # Linux/Mac
set FLASK_DEBUG=1     # Windows
python app.py
```

## 📝 Features

- 🗺️ Interactive map with real-time emergency reports
- 📱 Mobile-responsive design
- 🔐 User authentication and role-based access
- 📊 Analytics and hotspot detection
- 🐦 Social media integration
- 📸 Photo upload and storage
- 🌊 Ocean-specific emergency categories
- 📍 GPS location services
- 🔔 Real-time notifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

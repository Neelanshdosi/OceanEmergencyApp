# BlueWatch Flask Backend

This folder contains a Flask + Firebase backend for the crowdsourced ocean hazard reporting platform.

## Prerequisites

- Python 3.11+
- A Firebase project with Firestore and Storage enabled
- A Service Account key (JSON) downloaded from Firebase console

## Setup

1. Copy your Service Account JSON into this folder as `service-account.json` (or set an absolute path).
2. Create `.env` from the example and fill values:

```
cp .env.example .env
```

3. Create a virtual environment and install dependencies:

```
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

4. Run the server:

```
python -m backend.app
# or
python backend/app.py
```

Server will start on http://localhost:5000

## API Summary

- POST /register {name,email,password,role?} → {user, token}
- POST /login {email,password} → {user, token}
- POST /report (Bearer token) {event_type,description,latitude,longitude, media_url? | media_base64?} → 201 report
- GET /reports (Bearer token) [event_type,verified,from,to,bbox=minLng,minLat,maxLng,maxLat] → {items}
- PUT /report/:id/verify (Bearer token, role=official|analyst) → {id,verified:true}
- POST /social-media (Bearer token, role=official|analyst) {platform,post_text,keywords?,sentiment?,location?} → 201 post
- GET /social-media (Bearer token) [keyword,sentiment] → {items}
- GET /analytics/hotspots (Bearer token) → grid hotspot buckets

## Frontend Integration

Set API base to your Flask URL and send Authorization: `Bearer <token>` after login. Media can be uploaded by passing `media_base64` (data URL) to /report; the server uploads it to Firebase Storage and stores the public URL in Firestore.

## Seeding

```
python -m backend.seed
```

## Notes

- This is a prototype: public URLs are used for Storage, JWT is HS256 with a shared secret. For production, use Firebase Auth and signed URLs.

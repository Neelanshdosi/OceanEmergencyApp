import os
from typing import Optional
import firebase_admin
from firebase_admin import credentials, firestore

_app: Optional[firebase_admin.App] = None
_db: Optional[firestore.Client] = None


def get_db() -> firestore.Client:
    global _app, _db
    if _db is not None:
        return _db

    # Initialize Firebase Admin using service account or ADC
    if not firebase_admin._apps:
        cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        if cred_path and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            _app = firebase_admin.initialize_app(cred)
        else:
            _app = firebase_admin.initialize_app()  # ADC (e.g., on Cloud Run)
    _db = firestore.client(app=_app)
    return _db

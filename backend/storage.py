import base64
import os
import re
import time
from typing import Optional
from firebase_admin import storage as fb_storage
import firebase_admin
from firebase_admin import credentials

_bucket = None


def get_bucket():
    global _bucket
    if _bucket is not None:
        return _bucket
    if not firebase_admin._apps:
        cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        if cred_path and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred, {
                'storageBucket': os.getenv('FIREBASE_STORAGE_BUCKET')
            })
        else:
            firebase_admin.initialize_app(options={'storageBucket': os.getenv('FIREBASE_STORAGE_BUCKET')})
    _bucket = fb_storage.bucket()
    return _bucket


def upload_base64(data_url: str, prefix: str = "uploads/") -> Optional[str]:
    """Upload a data URL (base64) to Firebase Storage. Return public URL.

    Accepts strings like: data:image/png;base64,AAA...
    """
    m = re.match(r"^data:(?P<mime>[^;]+);base64,(?P<data>.+)$", data_url)
    if not m:
        return None
    mime = m.group('mime')
    raw = base64.b64decode(m.group('data'))

    bucket = get_bucket()
    name = f"{prefix}{int(time.time()*1000)}.bin"
    blob = bucket.blob(name)
    blob.upload_from_string(raw, content_type=mime)
    blob.make_public()  # for prototype; prefer signed URLs in prod
    return blob.public_url

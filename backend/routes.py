from datetime import datetime
from typing import Any, Dict, List, Optional

from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash, check_password_hash
from google.cloud.firestore_v1 import FieldFilter

from firestore import get_db
from auth import create_token, require_auth
from storage import upload_base64

api = Blueprint('api', __name__)

# Root route
@api.get('/')
def root():
    return jsonify({
        'message': 'Ocean Emergency App API',
        'status': 'running',
        'version': '1.0.0',
        'endpoints': {
            'users': '/register, /login',
            'reports': '/report, /reports',
            'social': '/social-media',
            'admin': '/admin/users, /admin/reports, /admin/social'
        }
    })

# Health check
@api.get('/health')
def health():
    return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()})

# Utility parsers

def parse_float(x: Optional[str]) -> Optional[float]:
    try:
        return float(x) if x is not None else None
    except Exception:
        return None


# Users
@api.post('/register')
def register():
    data = request.get_json(force=True) or {}
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'citizen')
    if not name or not email or not password:
        return jsonify({'error': 'Missing required fields'}), 400
    db = get_db()
    users = db.collection('users')
    # Ensure unique email
    existing = users.where(filter=FieldFilter('email', '==', email)).limit(1).get()
    if existing:
        return jsonify({'error': 'Email already registered'}), 409
    doc = users.document()
    user = {
        'id': doc.id,
        'name': name,
        'email': email,
        'role': role,
        'password_hash': generate_password_hash(password),
        'created_at': datetime.utcnow().isoformat(),
    }
    doc.set(user)
    token = create_token(user)
    return jsonify({'user': {k: v for k, v in user.items() if k != 'password_hash'}, 'token': token})


@api.post('/login')
def login():
    data = request.get_json(force=True) or {}
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'error': 'Missing email or password'}), 400
    db = get_db()
    users = db.collection('users')
    docs = users.where(filter=FieldFilter('email', '==', email)).limit(1).get()
    if not docs:
        return jsonify({'error': 'Invalid credentials'}), 401
    user = docs[0].to_dict()
    if not check_password_hash(user['password_hash'], password):
        return jsonify({'error': 'Invalid credentials'}), 401
    token = create_token(user)
    return jsonify({'user': {k: v for k, v in user.items() if k != 'password_hash'}, 'token': token})


# Reports
@api.post('/report')
@require_auth()
def create_report():
    data = request.get_json(force=True) or {}
    event_type = data.get('event_type')
    description = data.get('description')
    lat = data.get('latitude')
    lng = data.get('longitude')
    media = data.get('media_base64')  # optional base64 data URL
    media_url = data.get('media_url')
    if not event_type or not description or lat is None or lng is None:
        return jsonify({'error': 'Missing required fields'}), 400

    # Upload base64 if provided
    if media and not media_url:
        uploaded = upload_base64(media, prefix='reports/')
        if uploaded:
            media_url = uploaded

    db = get_db()
    doc = db.collection('reports').document()
    report = {
        'id': doc.id,
        'user_id': request.user['sub'],  # type: ignore
        'event_type': event_type,
        'description': description,
        'media_url': media_url or None,
        'geolocation': {'lat': float(lat), 'lng': float(lng)},
        'timestamp': datetime.utcnow().isoformat(),
        'verified': False,
        'source': 'citizen',
    }
    doc.set(report)
    return jsonify(report), 201


@api.get('/reports')
@require_auth()
def list_reports():
    db = get_db()
    q = db.collection('reports')

    # Equality filters
    event_type = request.args.get('event_type')
    verified = request.args.get('verified')
    if event_type:
        q = q.where(filter=FieldFilter('event_type', '==', event_type))
    if verified in ('true', 'false'):
        q = q.where(filter=FieldFilter('verified', '==', verified == 'true'))

    # Date range
    date_from = request.args.get('from')
    date_to = request.args.get('to')
    if date_from:
        q = q.where(filter=FieldFilter('timestamp', '>=', date_from))
    if date_to:
        q = q.where(filter=FieldFilter('timestamp', '<=', date_to))

    docs = q.order_by('timestamp', direction=firestore.Query.DESCENDING).limit(500).get()  # type: ignore
    items = [d.to_dict() for d in docs]

    # BBOX filter (client-side due to Firestore composite constraints)
    bbox = request.args.get('bbox')
    if bbox:
        min_lng, min_lat, max_lng, max_lat = map(float, bbox.split(','))
        items = [r for r in items if (min_lat <= r['geolocation']['lat'] <= max_lat and min_lng <= r['geolocation']['lng'] <= max_lng)]

    return jsonify({'items': items})


@api.put('/report/<rid>/verify')
@require_auth(roles=['official', 'analyst'])
def verify_report(rid: str):
    db = get_db()
    ref = db.collection('reports').document(rid)
    if not ref.get().exists:
        return jsonify({'error': 'Not found'}), 404
    ref.update({'verified': True})
    return jsonify({'id': rid, 'verified': True})


# Social media (simulated)
@api.post('/social-media')
@require_auth(roles=['official', 'analyst'])
def add_social():
    data = request.get_json(force=True) or {}
    text = data.get('post_text', '')
    platform = data.get('platform', 'twitter')
    keywords = data.get('keywords') or extract_keywords(text)
    sentiment = data.get('sentiment') or simple_sentiment(text)
    loc = data.get('location')

    db = get_db()
    doc = db.collection('social_media').document()
    post = {
        'id': doc.id,
        'platform': platform,
        'post_text': text,
        'keywords': keywords,
        'sentiment': sentiment,
        'timestamp': datetime.utcnow().isoformat(),
        'location': loc or None,
    }
    doc.set(post)
    return jsonify(post), 201


@api.get('/social-media')
@require_auth()
def list_social():
    db = get_db()
    q = db.collection('social_media')
    keyword = request.args.get('keyword')
    sentiment = request.args.get('sentiment')
    if sentiment:
        q = q.where(filter=FieldFilter('sentiment', '==', sentiment))
    docs = q.order_by('timestamp', direction=firestore.Query.DESCENDING).limit(200).get()  # type: ignore
    items = [d.to_dict() for d in docs]
    if keyword:
        items = [i for i in items if keyword.lower() in i.get('post_text', '').lower()]
    return jsonify({'items': items})


# Admin routes
@api.get('/admin/users')
@require_auth(roles=['admin'])
def admin_users():
    db = get_db()
    users = db.collection('users').order_by('created_at', direction=firestore.Query.DESCENDING).get()
    return jsonify({'users': [u.to_dict() for u in users]})

@api.get('/admin/reports')
@require_auth(roles=['admin'])
def admin_reports():
    db = get_db()
    reports = db.collection('reports').order_by('timestamp', direction=firestore.Query.DESCENDING).get()
    return jsonify({'reports': [r.to_dict() for r in reports]})

@api.get('/admin/social')
@require_auth(roles=['admin'])
def admin_social():
    db = get_db()
    social = db.collection('social_media').order_by('timestamp', direction=firestore.Query.DESCENDING).get()
    return jsonify({'posts': [s.to_dict() for s in social]})

@api.patch('/admin/users/<user_id>/toggle')
@require_auth(roles=['admin'])
def toggle_user_status(user_id: str):
    data = request.get_json(force=True) or {}
    is_active = data.get('is_active', True)
    
    db = get_db()
    user_ref = db.collection('users').document(user_id)
    user_ref.update({'is_active': is_active})
    
    return jsonify({'id': user_id, 'is_active': is_active})

# Simple NLP helpers for prototype
HAZARD_KEYWORDS = [
    'tsunami', 'flood', 'flooding', 'high waves', 'rip current', 'oil spill', 'debris', 'storm surge', 'hurricane', 'cyclone'
]
POSITIVE = ['calm', 'safe', 'clear', 'ok', 'fine']
NEGATIVE = ['danger', 'warning', 'rough', 'strong', 'huge', 'massive', 'deadly', 'evacuate']


def extract_keywords(text: str) -> List[str]:
    t = text.lower()
    return [k for k in HAZARD_KEYWORDS if k in t]


def simple_sentiment(text: str) -> str:
    t = text.lower()
    score = 0
    score += sum(1 for w in POSITIVE if w in t)
    score -= sum(1 for w in NEGATIVE if w in t)
    return 'positive' if score > 0 else 'negative' if score < 0 else 'neutral'


# Optional: hotspot aggregation via simple grid bucketing
@api.get('/analytics/hotspots')
@require_auth()
def hotspots():
    db = get_db()
    docs = db.collection('reports').order_by('timestamp').limit(1000).get()
    buckets: Dict[str, Dict[str, Any]] = {}
    for d in docs:
        r = d.to_dict()
        lat = r['geolocation']['lat']
        lng = r['geolocation']['lng']
        key = f"{round(lat, 1)}_{round(lng, 1)}"  # ~10km grid
        b = buckets.get(key)
        if not b:
            buckets[key] = {'lat': round(lat, 1), 'lng': round(lng, 1), 'count': 0}
        buckets[key]['count'] += 1  # type: ignore
    return jsonify({'items': list(buckets.values())})

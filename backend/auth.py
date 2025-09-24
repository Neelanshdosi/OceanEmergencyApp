import os
import time
from functools import wraps
from typing import Any, Callable, Dict, Optional

import jwt
from flask import request, jsonify

SECRET = os.getenv("SECRET_KEY", "change-me")


def create_token(user: Dict[str, Any]) -> str:
    payload = {
        'sub': user['id'],
        'name': user.get('name'),
        'role': user.get('role', 'citizen'),
        'iat': int(time.time()),
        'exp': int(time.time()) + 60 * 60 * 24,
    }
    return jwt.encode(payload, SECRET, algorithm='HS256')


def require_auth(roles: Optional[list[str]] = None):
    roles = roles or []

    def decorator(fn: Callable):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            auth = request.headers.get('Authorization', '')
            if not auth.startswith('Bearer '):
                return jsonify({'error': 'Unauthorized'}), 401
            token = auth[7:]
            try:
                payload = jwt.decode(token, SECRET, algorithms=['HS256'])
            except Exception:
                return jsonify({'error': 'Invalid token'}), 401
            if roles and payload.get('role') not in roles:
                return jsonify({'error': 'Forbidden'}), 403
            request.user = payload  # type: ignore
            return fn(*args, **kwargs)
        return wrapper
    return decorator

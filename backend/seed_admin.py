#!/usr/bin/env python3
"""
Create admin user for Ocean Emergency App
"""
import os
import sys
from datetime import datetime
from werkzeug.security import generate_password_hash

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from firestore import get_db

def create_admin_user():
    """Create admin user in Firestore"""
    try:
        db = get_db()
        users = db.collection('users')
        
        # Check if admin already exists
        admin_query = users.where('email', '==', 'admin@ocean-emergency.com').limit(1).get()
        if admin_query:
            print("✅ Admin user already exists")
            return
        
        # Create admin user
        admin_user = {
            'name': 'Ocean Emergency Admin',
            'email': 'admin@ocean-emergency.com',
            'password_hash': generate_password_hash('admin123'),
            'role': 'admin',
            'created_at': datetime.utcnow().isoformat(),
            'is_active': True,
            'permissions': ['manage_users', 'manage_reports', 'manage_social', 'view_analytics']
        }
        
        # Add to Firestore
        doc_ref = users.document()
        admin_user['id'] = doc_ref.id
        doc_ref.set(admin_user)
        
        print("✅ Admin user created successfully!")
        print("📧 Email: admin@ocean-emergency.com")
        print("🔑 Password: admin123")
        print("👤 Role: admin")
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")

if __name__ == "__main__":
    create_admin_user()

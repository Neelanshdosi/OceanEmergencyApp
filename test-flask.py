#!/usr/bin/env python3
"""
Simple Flask test to verify the backend is working
"""
import requests
import json

def test_flask_backend():
    try:
        # Test root endpoint
        response = requests.get('http://localhost:5000/', timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        # Test health endpoint
        response = requests.get('http://localhost:5000/health', timeout=5)
        print(f"Health Status Code: {response.status_code}")
        print(f"Health Response: {response.text}")
        
        # Test API endpoint
        response = requests.get('http://localhost:5000/api/', timeout=5)
        print(f"API Status Code: {response.status_code}")
        print(f"API Response: {response.text}")
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Flask backend on port 5000")
    except requests.exceptions.Timeout:
        print("❌ Request timed out")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_flask_backend()

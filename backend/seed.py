from datetime import datetime, timedelta
import random
from .firestore import get_db

EVENTS = ['high_waves', 'flooding', 'rip_current', 'oil_spill', 'debris']


def run():
    db = get_db()
    base_lat, base_lng = 37.7749, -122.4194
    for i in range(20):
        lat = base_lat + random.uniform(-0.5, 0.5)
        lng = base_lng + random.uniform(-0.5, 0.5)
        doc = db.collection('reports').document()
        doc.set({
            'id': doc.id,
            'user_id': 'seed',
            'event_type': random.choice(EVENTS),
            'description': 'Seed report',
            'media_url': None,
            'geolocation': {'lat': lat, 'lng': lng},
            'timestamp': (datetime.utcnow() - timedelta(minutes=i)).isoformat(),
            'verified': random.random() > 0.5,
            'source': 'citizen',
        })


if __name__ == '__main__':
    run()

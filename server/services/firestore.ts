import admin from 'firebase-admin';
import { Report, ReportInput, ReportsQuery } from '@shared/api';

// Initialize Firebase Admin SDK
let db: admin.firestore.Firestore;

try {
  // Try to initialize with service account key if available
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  
  if (serviceAccountPath && process.env.FIREBASE_PROJECT_ID) {
    // Use the service account file directly
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  } else {
    // Use Application Default Credentials (for production/Cloud Run)
    admin.initializeApp();
  }
  
  // Configure Firestore to ignore undefined properties
  const firestore = admin.firestore();
  firestore.settings({ ignoreUndefinedProperties: true });
  
  db = admin.firestore();
  console.log('✅ Firestore initialized successfully');
} catch (error) {
  console.warn('⚠️  Firestore initialization failed, falling back to in-memory storage:', error.message);
  db = null as any;
}

// Fallback in-memory storage
const inMemoryReports: Report[] = [];

export class FirestoreService {
  private collection = 'reports';

  async createReport(reportInput: ReportInput, userRole: string, userName: string): Promise<Report> {
    if (!db) {
      // Use in-memory storage as fallback
      const now = new Date().toISOString();
      const report: Report = {
        id: `${Date.now()}-${Math.random()}`,
        title: reportInput.title,
        description: reportInput.description,
        type: reportInput.type,
        latitude: reportInput.latitude,
        longitude: reportInput.longitude,
        timestamp: reportInput.timestamp ?? now,
        media: reportInput.media ?? [],
        source: userRole === 'analyst' ? 'official' : 'citizen',
        verified: false,
        user: { id: userName, name: userName, role: userRole as any },
      };
      inMemoryReports.unshift(report);
      return report;
    }

    const now = new Date().toISOString();
    const report: Report = {
      id: admin.firestore().collection('temp').doc().id, // Generate a Firestore-compatible ID
      title: reportInput.title,
      description: reportInput.description,
      type: reportInput.type,
      latitude: reportInput.latitude,
      longitude: reportInput.longitude,
      timestamp: reportInput.timestamp ?? now,
      media: reportInput.media ?? [],
      source: userRole === 'analyst' ? 'official' : 'citizen',
      verified: false,
      user: { id: userName, name: userName, role: userRole as any },
    };

    await db.collection(this.collection).doc(report.id).set(report);
    return report;
  }

  async getReports(query: ReportsQuery = {}): Promise<Report[]> {
    if (!db) {
      // Use in-memory storage as fallback
      let items = [...inMemoryReports];
      
      // Apply filters
      if (query.type && query.type !== 'all') {
        items = items.filter((r) => r.type === query.type);
      }
      if (query.source && query.source !== 'all') {
        items = items.filter((r) => r.source === query.source);
      }
      if (query.verified && query.verified !== 'all') {
        items = items.filter((r) => String(r.verified) === query.verified);
      }
      if (query.from) items = items.filter((r) => r.timestamp >= query.from!);
      if (query.to) items = items.filter((r) => r.timestamp <= query.to!);
      if (query.bbox) {
        const [minLng, minLat, maxLng, maxLat] = query.bbox.split(',').map(Number);
        items = items.filter(
          r =>
            r.longitude >= minLng &&
            r.longitude <= maxLng &&
            r.latitude >= minLat &&
            r.latitude <= maxLat
        );
      }
      
      return items;
    }

    let queryRef: admin.firestore.Query = db.collection(this.collection);

    // Apply filters
    if (query.type && query.type !== 'all') {
      queryRef = queryRef.where('type', '==', query.type);
    }
    if (query.source && query.source !== 'all') {
      queryRef = queryRef.where('source', '==', query.source);
    }
    if (query.verified && query.verified !== 'all') {
      queryRef = queryRef.where('verified', '==', query.verified === 'true');
    }
    if (query.from) {
      queryRef = queryRef.where('timestamp', '>=', query.from);
    }
    if (query.to) {
      queryRef = queryRef.where('timestamp', '<=', query.to);
    }

    // Order by timestamp descending (newest first)
    queryRef = queryRef.orderBy('timestamp', 'desc');

    const snapshot = await queryRef.get();
    let reports = snapshot.docs.map(doc => doc.data() as Report);

    // Apply bounding box filter (not supported by Firestore directly)
    if (query.bbox) {
      const [minLng, minLat, maxLng, maxLat] = query.bbox.split(',').map(Number);
      reports = reports.filter(
        r =>
          r.longitude >= minLng &&
          r.longitude <= maxLng &&
          r.latitude >= minLat &&
          r.latitude <= maxLat
      );
    }

    return reports;
  }

  async getReportById(id: string): Promise<Report | null> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const doc = await db.collection(this.collection).doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return doc.data() as Report;
  }

  async updateReport(id: string, updates: Partial<Report>): Promise<Report | null> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const docRef = db.collection(this.collection).doc(id);
    await docRef.update(updates);
    
    const updatedDoc = await docRef.get();
    if (!updatedDoc.exists) {
      return null;
    }
    return updatedDoc.data() as Report;
  }

  async verifyReport(id: string): Promise<Report | null> {
    if (!db) {
      // Use in-memory storage as fallback
      const report = inMemoryReports.find(r => r.id === id);
      if (report) {
        report.verified = true;
        return report;
      }
      return null;
    }
    return this.updateReport(id, { verified: true });
  }

  async seedReports(): Promise<void> {
    if (!db) {
      // Use in-memory storage as fallback
      if (inMemoryReports.length > 0) {
        console.log('📊 Reports already seeded in memory, skipping...');
        return;
      }
      
      const seedData = [
        {
          title: 'Unusually high waves',
          description: 'Waves crashing over pier.',
          type: 'high_waves' as const,
          latitude: 37.7749,
          longitude: -122.4194,
        },
        {
          title: 'Debris near shore',
          description: 'Logs and plastics floating.',
          type: 'debris' as const,
          latitude: 34.0195,
          longitude: -118.4912,
        },
        {
          title: 'Rip current warning',
          description: 'Strong pull in water.',
          type: 'rip_current' as const,
          latitude: 21.3069,
          longitude: -157.8583,
        },
      ];

      for (const base of seedData) {
        const report: Report = {
          id: `${Date.now()}-${Math.random()}`,
          timestamp: new Date().toISOString(),
          source: 'citizen',
          verified: Math.random() > 0.5,
          media: [],
          user: { id: 'seed', name: 'Seeder', role: 'citizen' },
          ...base,
        };
        inMemoryReports.push(report);
      }
      
      console.log('🌱 Seeded sample reports to in-memory storage');
      return;
    }

    // Check if reports already exist
    const existingReports = await this.getReports();
    if (existingReports.length > 0) {
      console.log('📊 Reports already seeded, skipping...');
      return;
    }

    const seedData = [
      {
        title: 'Unusually high waves',
        description: 'Waves crashing over pier.',
        type: 'high_waves' as const,
        latitude: 37.7749,
        longitude: -122.4194,
      },
      {
        title: 'Debris near shore',
        description: 'Logs and plastics floating.',
        type: 'debris' as const,
        latitude: 34.0195,
        longitude: -118.4912,
      },
      {
        title: 'Rip current warning',
        description: 'Strong pull in water.',
        type: 'rip_current' as const,
        latitude: 21.3069,
        longitude: -157.8583,
      },
    ];

    const batch = db.batch();
    
    for (const base of seedData) {
      const report: Report = {
        id: db.collection('temp').doc().id,
        timestamp: new Date().toISOString(),
        source: 'citizen',
        verified: Math.random() > 0.5,
        media: [],
        user: { id: 'seed', name: 'Seeder', role: 'citizen' },
        ...base,
      };
      
      const docRef = db.collection(this.collection).doc(report.id);
      batch.set(docRef, report);
    }

    await batch.commit();
    console.log('🌱 Seeded sample reports to Firestore');
  }
}

export const firestoreService = new FirestoreService();

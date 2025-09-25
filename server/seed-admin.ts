import admin from 'firebase-admin';
import bcrypt from 'bcryptjs';
import { User } from '@shared/api';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  } catch (error) {
    console.error('Firebase Admin initialization failed:', error);
  }
}

const db = admin.firestore();

export async function seedAdmin() {
  try {
    const adminEmail = 'admin@oceanemergency.com';
    const adminPassword = 'OceanEmergency2024!';
    const adminName = 'System Administrator';

    // Check if admin already exists
    const existingAdmin = await db.collection('users').where('email', '==', adminEmail).get();
    
    if (!existingAdmin.empty) {
      console.log('✅ Admin account already exists');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const now = new Date().toISOString();

    const adminUser: User = {
      id: db.collection('users').doc().id,
      email: adminEmail,
      name: adminName,
      role: 'admin',
      avatar: null,
      createdAt: now,
    };

    const userDoc = {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
      avatar: adminUser.avatar,
      createdAt: adminUser.createdAt,
      password: hashedPassword,
    };

    await db.collection('users').doc(adminUser.id).set(userDoc);

    console.log('✅ Admin account created successfully');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('⚠️  Please change the password after first login!');
  } catch (error) {
    console.error('❌ Failed to create admin account:', error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedAdmin().then(() => process.exit(0));
}

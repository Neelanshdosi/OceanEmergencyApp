import admin from 'firebase-admin';
import admin from 'firebase-admin';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, AuthRequest, AuthResponse } from '@shared/api';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export class AuthService {
  private db: admin.firestore.Firestore | null = null;
  private usersCollection = 'users';
  private useMemory = false;
  private inMemoryUsers: User[] = [];

  constructor() {
    try {
      this.db = admin.firestore();
      // simple check
      if (!this.db) throw new Error('Firestore not available');
    } catch (err: any) {
      console.warn('Firestore not initialized for AuthService, falling back to in-memory users:', err?.message);
      this.db = null;
      this.useMemory = true;
    }
  }

  async createUser(userData: {
    email: string;
    password: string;
    name: string;
    role: 'citizen' | 'analyst' | 'admin';
    avatar?: string;
  }): Promise<User> {
    // Prevent admin registration through normal flow
    if (userData.role === 'admin') {
      throw new Error('Admin accounts cannot be created through registration');
    }

    // Check if user already exists
    const existingUser = await this.getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const now = new Date().toISOString();

    if (this.useMemory || !this.db) {
      const user: User = {
        id: `mem_${Date.now()}_${Math.random()}`,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        avatar: userData.avatar,
        createdAt: now,
      };
      const userDoc = { ...user, password: hashedPassword } as any;
      this.inMemoryUsers.push(userDoc as any);
      return user;
    }

    const user: User = {
      id: this.db!.collection('temp').doc().id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      avatar: userData.avatar,
      createdAt: now,
    };

    // Store user in database
    const userDoc = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar || null,
      createdAt: user.createdAt,
      password: hashedPassword, // Store hashed password separately
    };

    await this.db!.collection(this.usersCollection).doc(user.id).set(userDoc);

    return user;
  }

  async authenticateUser(email: string, password: string): Promise<AuthResponse> {
    const userDoc = await this.db
      .collection(this.usersCollection)
      .where('email', '==', email)
      .limit(1)
      .get();

    if (userDoc.empty) {
      throw new Error('Invalid email or password');
    }

    const userData = userDoc.docs[0].data();
    const isValidPassword = await bcrypt.compare(password, userData.password);

    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await this.db.collection(this.usersCollection).doc(userData.id).update({
      lastLoginAt: new Date().toISOString(),
    });

    const user: User = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      avatar: userData.avatar,
      createdAt: userData.createdAt,
      lastLoginAt: new Date().toISOString(),
    };

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return { user, token };
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const userDoc = await this.db
      .collection(this.usersCollection)
      .where('email', '==', email)
      .limit(1)
      .get();

    if (userDoc.empty) {
      return null;
    }

    const userData = userDoc.docs[0].data();
    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      avatar: userData.avatar,
      createdAt: userData.createdAt,
      lastLoginAt: userData.lastLoginAt,
    };
  }

  async getUserById(id: string): Promise<User | null> {
    const userDoc = await this.db.collection(this.usersCollection).doc(id).get();
    
    if (!userDoc.exists) {
      return null;
    }

    const userData = userDoc.data()!;
    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      avatar: userData.avatar,
      createdAt: userData.createdAt,
      lastLoginAt: userData.lastLoginAt,
    };
  }

  async verifyToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
      return await this.getUserById(decoded.userId);
    } catch (error) {
      return null;
    }
  }

  async googleAuth(email: string, name: string, picture?: string): Promise<AuthResponse> {
    let user = await this.getUserByEmail(email);
    
    if (!user) {
      // Create new user with Google account
      const now = new Date().toISOString();
      const newUser: User = {
        id: this.db.collection('temp').doc().id,
        email: email,
        name: name,
        role: 'citizen', // Default role for Google users
        avatar: picture,
        createdAt: now,
      };

      // Store user in database (no password for Google users)
      const userDoc = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        avatar: newUser.avatar || null,
        createdAt: newUser.createdAt,
        password: null, // No password for Google users
      };
      
      await this.db.collection(this.usersCollection).doc(newUser.id).set(userDoc);
      user = newUser;
    } else {
      // Update existing user's Google info
      await this.db.collection(this.usersCollection).doc(user.id).update({
        avatar: picture,
        lastLoginAt: new Date().toISOString(),
      });
      
      user.avatar = picture;
      user.lastLoginAt = new Date().toISOString();
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return { user, token };
  }
}

export const authService = new AuthService();

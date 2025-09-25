import { RequestHandler } from 'express';
import { authService } from '../services/auth';
import { AuthRequest, AuthResponse, User } from '@shared/api';
import jwt from 'jsonwebtoken';

export const register: RequestHandler = async (req, res) => {
  try {
    const { email, password, name, role = 'citizen' } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const user = await authService.createUser({
      email,
      password,
      name,
      role,
    });

    // Generate token for immediate login
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    const response: AuthResponse = { user, token };
    res.status(201).json(response);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message });
  }
};

export const login: RequestHandler = async (req, res) => {
  try {
    const { email, password }: AuthRequest = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const response: AuthResponse = await authService.authenticateUser(email, password);
    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: error.message });
  }
};

export const googleAuth: RequestHandler = async (req, res) => {
  try {
    const { email, name, picture } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required for Google authentication' });
    }

    const response: AuthResponse = await authService.createOrUpdateGoogleUser({
      email,
      name,
      picture,
    });

    res.json(response);
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(400).json({ error: error.message });
  }
};

export const getProfile: RequestHandler = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const user = await authService.verifyToken(token);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const updateProfile: RequestHandler = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const user = await authService.verifyToken(token);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { name, avatar } = req.body;
    const updates: Partial<User> = {};
    
    if (name) updates.name = name;
    if (avatar) updates.avatar = avatar;

    // Update user in database
    const updatedUser = await authService.getUserById(user.id);
    
    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(400).json({ error: error.message });
  }
};

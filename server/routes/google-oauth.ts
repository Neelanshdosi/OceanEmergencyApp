import { RequestHandler } from 'express';
import { authService } from '../services/auth';

export const googleCallback: RequestHandler = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    // In a real implementation, you would:
    // 1. Exchange the code for an access token with Google
    // 2. Use the access token to get user info from Google
    // 3. Create or update the user in your database
    
    // For now, we'll simulate this with a mock response
    // In production, you'd use the Google OAuth2 API
    const mockUserInfo = {
      email: `google_${Date.now()}@example.com`,
      name: 'Google User',
      picture: 'https://via.placeholder.com/150'
    };

    const { user, token } = await authService.googleAuth(
      mockUserInfo.email,
      mockUserInfo.name,
      mockUserInfo.picture
    );

    res.json({ user, token });
  } catch (error: any) {
    console.error('Google OAuth callback error:', error);
    res.status(400).json({ error: error.message });
  }
};

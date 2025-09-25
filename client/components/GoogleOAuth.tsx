import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface GoogleOAuthProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const GoogleOAuth: React.FC<GoogleOAuthProps> = ({ onSuccess, onError }) => {
  const { googleLogin } = useAuth();

  useEffect(() => {
    // Handle Google OAuth callback
    const handleGoogleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');

      if (error) {
        onError?.(error);
        return;
      }

      if (code) {
        try {
          // Exchange code for user info
          const response = await fetch('/api/auth/google/callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          });

          if (!response.ok) {
            throw new Error('Failed to authenticate with Google');
          }

          const data = await response.json();
          await googleLogin(data.email, data.name, data.picture);
          onSuccess?.();
        } catch (err) {
          onError?.(err instanceof Error ? err.message : 'Google authentication failed');
        }
      }
    };

    handleGoogleCallback();
  }, [googleLogin, onSuccess, onError]);

  const handleGoogleLogin = () => {
    // For demo purposes, we'll simulate Google OAuth with a simple redirect
    // In production, you would use the actual Google OAuth flow
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    
    // Simulate Google OAuth by redirecting to our callback with mock data
    const mockCode = `mock_google_code_${Date.now()}`;
    window.location.href = `${redirectUri}?code=${mockCode}`;
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Continue with Google
    </button>
  );
};

import { RequestHandler } from 'express';

/**
 * Test endpoint to verify Twitter API integration
 * This endpoint doesn't require actual Twitter credentials for testing
 */
export const testTwitterIntegration: RequestHandler = async (req, res) => {
  try {
    // Check if Twitter credentials are configured
    const hasCredentials = !!(
      process.env.TWITTER_API_KEY &&
      process.env.TWITTER_API_SECRET &&
      process.env.TWITTER_ACCESS_TOKEN &&
      process.env.TWITTER_ACCESS_SECRET
    );

    if (!hasCredentials) {
      return res.json({
        status: 'warning',
        message: 'Twitter API credentials not configured',
        instructions: [
          '1. Get Twitter API credentials from https://developer.twitter.com/en/portal/dashboard',
          '2. Add the following environment variables to your .env file:',
          '   - TWITTER_API_KEY',
          '   - TWITTER_API_SECRET', 
          '   - TWITTER_ACCESS_TOKEN',
          '   - TWITTER_ACCESS_SECRET',
          '3. Restart the server',
        ],
        endpoints: [
          'GET /api/twitter/search - Search tweets',
          'GET /api/twitter/ocean-emergency - Search ocean emergency tweets',
          'GET /api/twitter/ocean-emergency/social - Get formatted social feed',
          'POST /api/twitter/post - Post a tweet',
          'GET /api/twitter/user/:username - Get user info',
          'GET /api/twitter/trending - Get trending topics',
          'GET /api/twitter/hashtags - Search by hashtags',
        ],
      });
    }

    // If credentials are configured, try to initialize the service
    try {
      const { createTwitterService } = await import('../services/twitter');
      // Try to initialize the service to verify configuration
      createTwitterService();

      res.json({
        status: 'success',
        message: 'Twitter API integration is properly configured',
        endpoints: [
          'GET /api/twitter/search - Search tweets',
          'GET /api/twitter/ocean-emergency - Search ocean emergency tweets', 
          'GET /api/twitter/ocean-emergency/social - Get formatted social feed',
          'POST /api/twitter/post - Post a tweet',
          'GET /api/twitter/user/:username - Get user info',
          'GET /api/twitter/trending - Get trending topics',
          'GET /api/twitter/hashtags - Search by hashtags',
        ],
        example_usage: {
          search_tweets: 'GET /api/twitter/search?query=tsunami&max_results=10',
          ocean_emergency: 'GET /api/twitter/ocean-emergency?location=California&max_results=20',
          social_feed: 'GET /api/twitter/ocean-emergency/social?location=Florida&max_results=15',
          hashtags: 'GET /api/twitter/hashtags?hashtags=tsunami,flood,storm&max_results=20',
        },
      });
    } catch (error) {
      res.json({
        status: 'error',
        message: 'Twitter API service initialization failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  } catch (error) {
    console.error('Twitter test error:', error);
    res.status(500).json({ error: 'Failed to test Twitter integration' });
  }
};

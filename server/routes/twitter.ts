import { RequestHandler } from 'express';
import { createTwitterService } from '../services/twitter';
import {
  TwitterSearchParams,
  TwitterSearchResponse,
  TwitterPostResponse,
  SocialResponse,
} from '@shared/api';

function getTwitterServiceOrRespond(res: any) {
  try {
    return createTwitterService();
  } catch (err) {
    console.error('Twitter service init error:', err);
    res.status(503).json({ error: 'Twitter API not configured' });
    return null as any;
  }
}

/**
 * Search for tweets with custom query
 */
let twitterRateLimitedUntil = 0; // epoch seconds - simple in-memory cooldown

function makeFallbackSocial(query?: string) {
  // Simple India-focused fallback posts generator
  const now = Date.now();
  const texts = [
    'Huge waves reported near Chennai Marina, people advised to stay away from the shore',
    'Oil spill sighted off the coast of Goa, strong smell in nearby beaches',
    'Calm waters today at Kovalam despite yesterday\'s storm',
    'Rip current warning near Puri beach reported by locals',
    'Flooding reported in Mumbai\'s coastal road after high tide',
    'Tsunami alert tested — no casualties reported along Andaman and Nicobar islands',
  ];

  const items = texts
    .map((t, i) => ({
      id: `fallback-${now}-${i}`,
      platform: i % 2 === 0 ? 'twitter' : 'reddit',
      text: t,
      createdAt: new Date(now - i * 60000).toISOString(),
      user: i % 2 === 0 ? '@coastwatch' : 'u/seaScope',
      location: i % 3 === 0 ? { lat: 19.076 + Math.random() * 0.05, lng: 72.8777 + Math.random() * 0.05 } : null,
      keywords: [],
      sentiment: 'neutral',
    }));

  if (!query) return items;
  const q = String(query).toLowerCase();
  return items.filter(p => p.text.toLowerCase().includes(q));
}

export const searchTweets: RequestHandler = async (req, res) => {
  try {
    const {
      query,
      max_results = 10,
      start_time,
      end_time,
      since_id,
      until_id,
      next_token,
    } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // If we're currently rate-limited, immediately return fallback
    const now = Math.floor(Date.now() / 1000);
    if (twitterRateLimitedUntil && now < twitterRateLimitedUntil) {
      console.warn('Twitter API rate-limited, returning fallback data until', twitterRateLimitedUntil);
      const items = makeFallbackSocial(query);
      return res.json({ data: items, includes: {}, meta: { fallback: true } } as TwitterSearchResponse);
    }

    const params: TwitterSearchParams = {
      query,
      max_results: parseInt(max_results as string) || 10,
      start_time: start_time as string,
      end_time: end_time as string,
      since_id: since_id as string,
      until_id: until_id as string,
      next_token: next_token as string,
    };

    const twitterService = getTwitterServiceOrRespond(res);
    if (!twitterService) return;
    const result: TwitterSearchResponse = await twitterService.searchTweets(params);
    res.json(result);
  } catch (error: any) {
    console.error('Search tweets error:', error);
    // Detect rate-limit (twitter-api-v2 throws ApiResponseError with code)
    if (error && error.code === 429 || error?.type === 'response' && error?.code === 429) {
      const reset = error?.headers?.['x-rate-limit-reset'] ? parseInt(error.headers['x-rate-limit-reset'], 10) : null;
      if (reset) twitterRateLimitedUntil = reset;
      else twitterRateLimitedUntil = Math.floor(Date.now() / 1000) + 60; // 1 minute fallback

      const items = makeFallbackSocial(req.query.query as string | undefined);
      return res.status(200).json({ data: items, includes: {}, meta: { fallback: true, reason: 'rate_limited' } } as any);
    }

    res.status(500).json({ error: 'Failed to search tweets' });
  }
};

/**
 * Search for ocean emergency related tweets
 */
export const searchOceanEmergencyTweets: RequestHandler = async (req, res) => {
  try {
    const { location, max_results = 20 } = req.query;
    
    const twitterService = getTwitterServiceOrRespond(res);
    if (!twitterService) return;
    const result: TwitterSearchResponse = await twitterService.searchOceanEmergencyTweets(
      location as string,
      parseInt(max_results as string) || 20
    );

    res.json(result);
  } catch (error) {
    console.error('Search ocean emergency tweets error:', error);
    res.status(500).json({ error: 'Failed to search ocean emergency tweets' });
  }
};

/**
 * Get ocean emergency tweets formatted for the social feed
 */
export const getOceanEmergencySocialFeed: RequestHandler = async (req, res) => {
  try {
    const { location, max_results = 20 } = req.query;

    // If rate-limited, return fallback
    const now = Math.floor(Date.now() / 1000);
    if (twitterRateLimitedUntil && now < twitterRateLimitedUntil) {
      console.warn('Twitter API rate-limited, returning fallback social feed');
      const items = makeFallbackSocial(location as string | undefined).map((it, i) => ({
        id: it.id,
        platform: it.platform as any,
        text: it.text,
        createdAt: it.createdAt,
        user: it.user,
        location: it.location,
        keywords: it.keywords,
        sentiment: it.sentiment as any,
      }));
      const result: SocialResponse = { items };
      return res.json(result);
    }

    const twitterService = getTwitterServiceOrRespond(res);
    if (!twitterService) return;

    const tweetsResult = await twitterService.searchOceanEmergencyTweets(
      location as string,
      parseInt(max_results as string) || 20
    );

    const socialPosts = twitterService.convertTweetsToSocialPosts(
      tweetsResult.data,
      tweetsResult.includes?.users
    );

    const result: SocialResponse = {
      items: socialPosts,
    };

    res.json(result);
  } catch (error: any) {
    console.error('Get ocean emergency social feed error:', error);
    if (error && (error.code === 429 || error?.type === 'response' && error?.code === 429)) {
      const reset = error?.headers?.['x-rate-limit-reset'] ? parseInt(error.headers['x-rate-limit-reset'], 10) : null;
      if (reset) twitterRateLimitedUntil = reset; else twitterRateLimitedUntil = Math.floor(Date.now() / 1000) + 60;
      const items = makeFallbackSocial(req.query.location as string | undefined).map((it:any) => ({
        id: it.id,
        platform: it.platform as any,
        text: it.text,
        createdAt: it.createdAt,
        user: it.user,
        location: it.location,
        keywords: it.keywords,
        sentiment: it.sentiment as any,
      }));
      return res.json({ items } as SocialResponse);
    }

    res.status(500).json({ error: 'Failed to get ocean emergency social feed' });
  }
};

/**
 * Post a tweet (requires elevated access)
 */
export const postTweet: RequestHandler = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    if (text.length > 280) {
      return res.status(400).json({ error: 'Tweet text exceeds 280 characters' });
    }
    
    const twitterService = getTwitterServiceOrRespond(res);
    if (!twitterService) return;
    const result: TwitterPostResponse = await twitterService.postTweet(text);
    res.json(result);
  } catch (error) {
    console.error('Post tweet error:', error);
    res.status(500).json({ error: 'Failed to post tweet' });
  }
};

/**
 * Get user information by username
 */
export const getUserByUsername: RequestHandler = async (req, res) => {
  try {
    const { username } = req.params;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    const twitterService = getTwitterServiceOrRespond(res);
    if (!twitterService) return;

    const user = await twitterService.getUserByUsername(username);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user information' });
  }
};

/**
 * Get trending topics
 */
export const getTrendingTopics: RequestHandler = async (req, res) => {
  try {
    const { woeid = 1 } = req.query;
    
    const twitterService = getTwitterServiceOrRespond(res);
    if (!twitterService) return;

    const trends = await twitterService.getTrendingTopics(parseInt(woeid as string) || 1);
    res.json({ trends });
  } catch (error) {
    console.error('Get trending topics error:', error);
    res.status(500).json({ error: 'Failed to get trending topics' });
  }
};

/**
 * Get tweets by specific hashtags related to ocean emergencies
 */
export const getTweetsByHashtags: RequestHandler = async (req, res) => {
  try {
    const { hashtags, max_results = 20 } = req.query;
    
    if (!hashtags || typeof hashtags !== 'string') {
      return res.status(400).json({ error: 'Hashtags parameter is required' });
    }
    
    const hashtagList = hashtags.split(',').map(tag => `#${tag.trim()}`).join(' OR ');
    const query = `${hashtagList} -is:retweet lang:en`;
    
    const params: TwitterSearchParams = {
      query,
      max_results: parseInt(max_results as string) || 20,
    };
    
    const twitterService = getTwitterServiceOrRespond(res);
    if (!twitterService) return;
    const result: TwitterSearchResponse = await twitterService.searchTweets(params);
    res.json(result);
  } catch (error) {
    console.error('Get tweets by hashtags error:', error);
    res.status(500).json({ error: 'Failed to get tweets by hashtags' });
  }
};

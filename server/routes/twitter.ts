import { RequestHandler } from 'express';
import { twitterService } from '../services/twitter';
import {
  TwitterSearchParams,
  TwitterSearchResponse,
  TwitterPostResponse,
  SocialResponse,
} from '@shared/api';

/**
 * Search for tweets with custom query
 */
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

    const params: TwitterSearchParams = {
      query,
      max_results: parseInt(max_results as string) || 10,
      start_time: start_time as string,
      end_time: end_time as string,
      since_id: since_id as string,
      until_id: until_id as string,
      next_token: next_token as string,
    };

    const result: TwitterSearchResponse = await twitterService.searchTweets(params);
    res.json(result);
  } catch (error) {
    console.error('Search tweets error:', error);
    res.status(500).json({ error: 'Failed to search tweets' });
  }
};

/**
 * Search for ocean emergency related tweets
 */
export const searchOceanEmergencyTweets: RequestHandler = async (req, res) => {
  try {
    const { location, max_results = 20 } = req.query;
    
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
  } catch (error) {
    console.error('Get ocean emergency social feed error:', error);
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
    
    const result: TwitterSearchResponse = await twitterService.searchTweets(params);
    res.json(result);
  } catch (error) {
    console.error('Get tweets by hashtags error:', error);
    res.status(500).json({ error: 'Failed to get tweets by hashtags' });
  }
};


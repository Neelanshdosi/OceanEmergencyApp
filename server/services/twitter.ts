import { TwitterApi, TwitterApiTokens } from 'twitter-api-v2';
import {
  TwitterSearchParams,
  TwitterSearchResponse,
  TwitterPostResponse,
  TwitterTweet,
  TwitterUser,
} from '@shared/api';

export class TwitterService {
  private client: TwitterApi;

  constructor() {
    const tokens: TwitterApiTokens = {
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN!,
      accessSecret: process.env.TWITTER_ACCESS_SECRET!,
    };

    if (!tokens.appKey || !tokens.appSecret || !tokens.accessToken || !tokens.accessSecret) {
      throw new Error('Twitter API credentials are not properly configured');
    }

    this.client = new TwitterApi(tokens);
  }

  /**
   * Search for tweets based on query parameters
   */
  async searchTweets(params: TwitterSearchParams): Promise<TwitterSearchResponse> {
    try {
      const searchParams = {
        query: params.query,
        max_results: params.max_results || 10,
        'tweet.fields': 'created_at,author_id,public_metrics,geo,place_id',
        'user.fields': 'username,name,public_metrics,verified',
        'place.fields': 'id,name,country_code,country,place_type,full_name',
        expansions: 'author_id,geo.place_id',
        ...(params.start_time && { start_time: params.start_time }),
        ...(params.end_time && { end_time: params.end_time }),
        ...(params.since_id && { since_id: params.since_id }),
        ...(params.until_id && { until_id: params.until_id }),
        ...(params.next_token && { next_token: params.next_token }),
      };

      const response = await this.client.v2.search(params.query, searchParams);
      
      return {
        data: (response.data || []) as TwitterTweet[],
        includes: response.includes as { users?: TwitterUser[] },
        meta: response.meta,
      };
    } catch (error) {
      console.error('Twitter search error:', error);
      throw new Error('Failed to search tweets');
    }
  }

  /**
   * Search for tweets related to ocean emergencies
   */
  async searchOceanEmergencyTweets(
    location?: string,
    maxResults: number = 20
  ): Promise<TwitterSearchResponse> {
    const emergencyKeywords = [
      'tsunami',
      'flood',
      'storm surge',
      'high waves',
      'rip current',
      'oil spill',
      'marine debris',
      'coastal flooding',
      'storm warning',
      'emergency',
    ];

    const locationQuery = location ? `near:${location}` : '';
    const keywordsQuery = emergencyKeywords.join(' OR ');
    const query = `${keywordsQuery} ${locationQuery} -is:retweet lang:en`;

    return this.searchTweets({
      query,
      max_results: maxResults,
    });
  }

  /**
   * Post a tweet (requires elevated access)
   */
  async postTweet(text: string): Promise<TwitterPostResponse> {
    try {
      const response = await this.client.v2.tweet(text);
      return {
        success: true,
        tweet_id: response.data.id,
      };
    } catch (error) {
      console.error('Twitter post error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to post tweet',
      };
    }
  }

  /**
   * Get user information by username
   */
  async getUserByUsername(username: string): Promise<TwitterUser | null> {
    try {
      const user = await this.client.v2.userByUsername(username, {
        'user.fields': 'username,name,public_metrics,verified',
      });
      return user.data as TwitterUser;
    } catch (error) {
      console.error('Twitter user lookup error:', error);
      return null;
    }
  }

  /**
   * Get trending topics for a specific location
   */
  async getTrendingTopics(woeid: number = 1): Promise<string[]> {
    try {
      const trends = await this.client.v1.trendsByPlace(woeid);
      return trends[0]?.trends?.map((trend: any) => trend.name) || [];
    } catch (error) {
      console.error('Twitter trends error:', error);
      return [];
    }
  }

  /**
   * Convert Twitter tweets to SocialPost format for the app
   */
  convertTweetsToSocialPosts(tweets: TwitterTweet[], users?: TwitterUser[]): any[] {
    const userMap = new Map(users?.map(user => [user.id, user]) || []);

    return tweets.map(tweet => {
      const user = userMap.get(tweet.author_id);
      const location = tweet.geo?.coordinates?.coordinates 
        ? { lat: tweet.geo.coordinates.coordinates[1], lng: tweet.geo.coordinates.coordinates[0] }
        : null;

      // Extract keywords from tweet text
      const keywords = this.extractKeywords(tweet.text);
      
      // Simple sentiment analysis (basic keyword-based)
      const sentiment = this.analyzeSentiment(tweet.text);

      return {
        id: tweet.id,
        platform: 'twitter' as const,
        text: tweet.text,
        createdAt: tweet.created_at,
        user: user?.username || 'unknown',
        location,
        keywords,
        sentiment,
        metrics: {
          retweets: tweet.public_metrics.retweet_count,
          likes: tweet.public_metrics.like_count,
          replies: tweet.public_metrics.reply_count,
        },
      };
    });
  }

  private extractKeywords(text: string): string[] {
    const emergencyKeywords = [
      'tsunami', 'flood', 'storm', 'wave', 'surge', 'current', 'spill', 'debris',
      'emergency', 'warning', 'alert', 'danger', 'evacuate', 'shelter', 'rescue',
      'coastal', 'marine', 'ocean', 'sea', 'beach', 'shore', 'harbor', 'port'
    ];
    
    const words = text.toLowerCase().split(/\W+/);
    return words.filter(word => emergencyKeywords.includes(word));
  }

  private analyzeSentiment(text: string): 'negative' | 'neutral' | 'positive' {
    const negativeWords = ['danger', 'emergency', 'warning', 'alert', 'flood', 'damage', 'destroy', 'evacuate'];
    const positiveWords = ['safe', 'help', 'rescue', 'support', 'recovery', 'clear'];
    
    const lowerText = text.toLowerCase();
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    
    if (negativeCount > positiveCount) return 'negative';
    if (positiveCount > negativeCount) return 'positive';
    return 'neutral';
  }
}

// Factory to create a TwitterService instance on demand
export function createTwitterService() {
  return new TwitterService();
}

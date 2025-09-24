# Twitter API Integration Setup

This document explains how to set up Twitter API integration for the Ocean Emergency App.

## Prerequisites

1. A Twitter Developer Account
2. A Twitter App with API access

## Getting Twitter API Credentials

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new app or use an existing one
3. Navigate to your app's "Keys and tokens" section
4. Generate the following credentials:
   - API Key (Consumer Key)
   - API Secret (Consumer Secret)
   - Access Token
   - Access Token Secret

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# Twitter API Configuration
TWITTER_API_KEY=your_twitter_api_key_here
TWITTER_API_SECRET=your_twitter_api_secret_here
TWITTER_ACCESS_TOKEN=your_twitter_access_token_here
TWITTER_ACCESS_SECRET=your_twitter_access_secret_here
```

## API Endpoints

The following Twitter API endpoints are available:

### Search Tweets
- **GET** `/api/twitter/search`
- **Query Parameters:**
  - `query` (required): Search query string
  - `max_results` (optional): Number of results (default: 10)
  - `start_time` (optional): Start time for search (ISO 8601)
  - `end_time` (optional): End time for search (ISO 8601)
  - `since_id` (optional): Return results after this tweet ID
  - `until_id` (optional): Return results before this tweet ID
  - `next_token` (optional): Pagination token

### Ocean Emergency Tweets
- **GET** `/api/twitter/ocean-emergency`
- **Query Parameters:**
  - `location` (optional): Location to search near
  - `max_results` (optional): Number of results (default: 20)

### Ocean Emergency Social Feed
- **GET** `/api/twitter/ocean-emergency/social`
- **Query Parameters:**
  - `location` (optional): Location to search near
  - `max_results` (optional): Number of results (default: 20)
- **Returns:** Formatted social posts for the app's social feed

### Post Tweet
- **POST** `/api/twitter/post`
- **Body:**
  ```json
  {
    "text": "Your tweet text here"
  }
  ```
- **Note:** Requires elevated access on Twitter API

### Get User Information
- **GET** `/api/twitter/user/:username`
- **Returns:** User information for the specified username

### Get Trending Topics
- **GET** `/api/twitter/trending`
- **Query Parameters:**
  - `woeid` (optional): Where On Earth ID (default: 1 for worldwide)

### Get Tweets by Hashtags
- **GET** `/api/twitter/hashtags`
- **Query Parameters:**
  - `hashtags` (required): Comma-separated list of hashtags
  - `max_results` (optional): Number of results (default: 20)

## Usage Examples

### Search for ocean emergency tweets
```bash
curl "http://localhost:8080/api/twitter/ocean-emergency?location=California&max_results=10"
```

### Get social feed formatted for the app
```bash
curl "http://localhost:8080/api/twitter/ocean-emergency/social?location=Florida&max_results=15"
```

### Search by hashtags
```bash
curl "http://localhost:8080/api/twitter/hashtags?hashtags=tsunami,flood,storm&max_results=20"
```

### Post a tweet (requires elevated access)
```bash
curl -X POST "http://localhost:8080/api/twitter/post" \
  -H "Content-Type: application/json" \
  -d '{"text": "Ocean emergency alert: High waves detected in the area. Stay safe!"}'
```

## Features

- **Smart Search**: Automatically searches for ocean emergency related keywords
- **Location-based**: Can filter tweets by location
- **Sentiment Analysis**: Basic sentiment analysis of tweets
- **Keyword Extraction**: Extracts relevant keywords from tweets
- **Social Feed Integration**: Converts Twitter data to app's social feed format
- **Trending Topics**: Get current trending topics
- **User Information**: Look up user details by username

## Rate Limits

Twitter API has rate limits. The app handles these gracefully with error messages. For production use, consider implementing rate limiting and caching.

## Security Notes

- Keep your Twitter API credentials secure
- Never commit credentials to version control
- Use environment variables for all sensitive data
- Consider using Twitter API v2 for better rate limits and features


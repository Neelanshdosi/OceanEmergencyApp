/**
 * Shared types for client and server
 */

export type HazardType =
  | "tsunami"
  | "high_waves"
  | "flooding"
  | "rip_current"
  | "oil_spill"
  | "debris"
  | "other";

export type ReportSource = "citizen" | "social" | "official";

export interface MediaItem {
  id: string; // uuid
  kind: "image" | "video";
  dataUrl: string; // base64 data URL for prototype only
}

export interface ReportInput {
  title: string;
  description: string;
  type: HazardType;
  latitude: number;
  longitude: number;
  timestamp?: string; // ISO string, server will set if omitted
  media?: MediaItem[];
}

export interface Report extends ReportInput {
  id: string; // uuid
  timestamp: string; // ISO string
  source: ReportSource;
  verified: boolean;
  user?: { id: string; name: string; role: UserRole } | null;
}

export type UserRole = "citizen" | "analyst" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface SocialMediaPin {
  id: string;
  platform: "twitter" | "reddit" | "news";
  text: string;
  location: { lat: number; lng: number };
  createdAt: string;
  user: string;
  sentiment: "negative" | "neutral" | "positive";
  keywords: string[];
}

export interface ReportsQuery {
  type?: HazardType | "all";
  source?: ReportSource | "all";
  verified?: "true" | "false" | "all";
  from?: string; // ISO date
  to?: string; // ISO date
  bbox?: string; // minLng,minLat,maxLng,maxLat
}

export interface ReportsResponse {
  items: Report[];
}

export interface SocialPost {
  id: string;
  platform: "twitter" | "reddit" | "news";
  text: string;
  createdAt: string; // ISO
  user: string;
  location?: { lat: number; lng: number } | null;
  keywords: string[];
  sentiment: "negative" | "neutral" | "positive";
}

export interface SocialResponse {
  items: SocialPost[];
}

export interface DemoResponse {
  message: string;
}

// Twitter API Types
export interface TwitterTweet {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  public_metrics: {
    retweet_count: number;
    like_count: number;
    reply_count: number;
    quote_count: number;
  };
  geo?: {
    coordinates: {
      type: string;
      coordinates: [number, number];
    };
  };
  place?: {
    id: string;
    name: string;
    country_code: string;
    country: string;
    place_type: string;
    full_name: string;
  };
}

export interface TwitterUser {
  id: string;
  username: string;
  name: string;
  public_metrics: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
    listed_count: number;
  };
  verified: boolean;
}

export interface TwitterSearchResponse {
  data: TwitterTweet[];
  includes?: {
    users?: TwitterUser[];
  };
  meta: {
    result_count: number;
    newest_id?: string;
    oldest_id?: string;
    next_token?: string;
  };
}

export interface TwitterSearchParams {
  query: string;
  max_results?: number;
  start_time?: string;
  end_time?: string;
  since_id?: string;
  until_id?: string;
  next_token?: string;
}

export interface TwitterPostResponse {
  success: boolean;
  tweet_id?: string;
  error?: string;
}

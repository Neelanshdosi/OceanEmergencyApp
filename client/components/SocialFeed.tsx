import { useEffect, useState } from "react";
import { MapPin, ExternalLink, MessageSquare, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SocialPost } from "@shared/api";

interface EnhancedSocialPost extends Omit<SocialPost, 'user'> {
  location?: { lat: number; lng: number };
  user?: string;
  url?: string;
}

export const SocialFeed: React.FC = () => {
  const [items, setItems] = useState<EnhancedSocialPost[]>([]);
  const [q, setQ] = useState("ocean OR wave OR flood OR tsunami");
  const [selectedPost, setSelectedPost] = useState<EnhancedSocialPost | null>(null);
  const [showMap, setShowMap] = useState(false);

  const emergencyKeywords = ['tsunami','flood','storm','wave','surge','rip','spill','debris','coastal','emergency','warning','danger'];

  const mapTweetToPost = (tweet: any, users: any[] | undefined): EnhancedSocialPost => {
    const user = users?.find((u: any) => u.id === tweet.author_id) || null;
    const location = tweet.geo?.coordinates?.coordinates
      ? { lat: tweet.geo.coordinates.coordinates[1], lng: tweet.geo.coordinates.coordinates[0] }
      : tweet.geo?.place ? null : null;

    const keywords = (tweet.text || '')
      .toLowerCase()
      .split(/\W+/)
      .filter((w: string) => emergencyKeywords.includes(w));

    const negative = ['danger','emergency','warning','flood','damage','evacuate','tsunami','storm','surge','rip','spill','massive','huge'];
    const positive = ['safe','calm','clear','ok','fine'];
    const t = (tweet.text || '').toLowerCase();
    let score = 0;
    for (const w of negative) if (t.includes(w)) score -= 1;
    for (const w of positive) if (t.includes(w)) score += 1;
    const sentiment = score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral';

    return {
      id: tweet.id,
      platform: 'twitter',
      text: tweet.text || '',
      createdAt: tweet.created_at || new Date().toISOString(),
      user: user?.username || user?.name || `@${tweet.author_id}`,
      location,
      keywords,
      sentiment,
      url: tweet.id ? `https://twitter.com/i/web/status/${tweet.id}` : undefined,
      metrics: tweet.public_metrics ? {
        retweets: tweet.public_metrics.retweet_count,
        likes: tweet.public_metrics.like_count,
        replies: tweet.public_metrics.reply_count,
      } : undefined,
    } as EnhancedSocialPost;
  };

  const fetchPosts = async () => {
    try {
      // First try Twitter search endpoint
      const twitterRes = await fetch(`/api/twitter/search?query=${encodeURIComponent(q)}&max_results=20`);
      if (twitterRes.ok) {
        const json = await twitterRes.json();
        if (json && Array.isArray(json.data)) {
          const users = json.includes?.users || [];
          const posts = (json.data as any[]).map(t => mapTweetToPost(t, users));
          setItems(posts);
          return;
        }
      }

      // Fallback to social endpoint (simulated or aggregated)
      const res = await fetch(`/api/social?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const json = await res.json();
      setItems(json.items as EnhancedSocialPost[]);
    } catch (error) {
      console.error('Error fetching social posts:', error);
      // Fallback to simulated data
      setItems([
        {
          id: '1',
          platform: 'twitter',
          text: 'Massive waves hitting the coast! Stay safe everyone! #OceanEmergency #TsunamiWarning',
          keywords: ['waves', 'coast', 'tsunami', 'emergency'],
          sentiment: 'negative',
          createdAt: new Date().toISOString(),
          location: { lat: 37.7749, lng: -122.4194 },
          user: '@coastguard_official',
          url: 'https://twitter.com/example/status/123'
        },
        {
          id: '2',
          platform: 'reddit',
          text: 'Just witnessed an incredible storm surge in Miami. The ocean is really showing its power today.',
          keywords: ['storm', 'surge', 'miami', 'ocean'],
          sentiment: 'neutral',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          location: { lat: 25.7617, lng: -80.1918 },
          user: 'u/stormwatcher',
          url: 'https://reddit.com/r/miami/comments/123'
        }
      ]);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [q]);

  const handlePostClick = (post: EnhancedSocialPost) => {
    setSelectedPost(post);
    if (post.location) {
      setShowMap(true);
    }
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return '🐦';
      case 'reddit':
        return '🔴';
      case 'facebook':
        return '📘';
      default:
        return '📱';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'negative':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'positive':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Social Media Monitoring
          </CardTitle>
          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="flex-1 rounded-md border px-3 py-2 text-sm"
              placeholder="Search for ocean emergency keywords..."
            />
            <Button size="sm" onClick={() => fetchPosts()}>
              Search
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {items.map((post) => (
              <div 
                key={post.id} 
                className="rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handlePostClick(post)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getPlatformIcon(post.platform)}</span>
                    <span className="font-medium text-sm">{post.user || `@${post.platform}_user`}</span>
                    <Badge variant="outline" className="text-xs">
                      {post.platform}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getSentimentColor(post.sentiment)}`}
                    >
                      {post.sentiment}
                    </Badge>
                    {post.location && (
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Located
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(post.createdAt).toLocaleString()}
                  </div>
                </div>
                
                <p className="text-sm mb-3 leading-relaxed">{post.text}</p>
                
                {post.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {post.keywords.map((keyword) => (
                      <Badge 
                        key={keyword} 
                        variant="secondary" 
                        className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100"
                      >
                        #{keyword}
                      </Badge>
                    ))}
                  </div>
                )}

                {post.location && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>
                      Location: {post.location.lat.toFixed(4)}, {post.location.lng.toFixed(4)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between mt-3 pt-2 border-t">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (post.url) openInNewTab(post.url);
                    }}
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View Original
                  </Button>
                  
                  {post.location && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPost(post);
                        setShowMap(true);
                      }}
                      className="flex items-center gap-1 hover:bg-blue-50 hover:border-blue-300"
                    >
                      <MapPin className="h-3 w-3" />
                      Show on Map
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Map Modal for Selected Post */}
      {selectedPost && showMap && selectedPost.location && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]"
          onClick={() => setShowMap(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto relative z-[101]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Post Location</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowMap(false)}
              >
                Close
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{getPlatformIcon(selectedPost.platform)}</span>
                  <span className="font-medium">{selectedPost.user}</span>
                  <Badge variant="outline">{selectedPost.platform}</Badge>
                </div>
                <p className="text-sm mb-2">{selectedPost.text}</p>
                <p className="text-xs text-muted-foreground">
                  Location: {selectedPost.location.lat.toFixed(6)}, {selectedPost.location.lng.toFixed(6)}
                </p>
              </div>
              
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center relative">
                <div className="text-center">
                  <MapPin className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Interactive Map</p>
                  <p className="text-xs text-gray-500">
                    Lat: {selectedPost.location.lat.toFixed(4)}, 
                    Lng: {selectedPost.location.lng.toFixed(4)}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Button 
                      size="sm" 
                      onClick={() => {
                        const mapUrl = `https://www.google.com/maps?q=${selectedPost.location!.lat},${selectedPost.location!.lng}`;
                        window.open(mapUrl, '_blank');
                      }}
                    >
                      Open in Google Maps
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        // Copy coordinates to clipboard
                        const coords = `${selectedPost.location!.lat}, ${selectedPost.location!.lng}`;
                        navigator.clipboard.writeText(coords).then(() => {
                          alert('Coordinates copied to clipboard!');
                        });
                      }}
                    >
                      Copy Coordinates
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MapPin, MessageSquare, BarChart3, Shield, AlertTriangle } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  is_active: boolean;
}

interface Report {
  id: string;
  event_type: string;
  description: string;
  latitude: number;
  longitude: number;
  verified: boolean;
  timestamp: string;
}

interface SocialPost {
  id: string;
  platform: string;
  post_text: string;
  keywords: string[];
  sentiment: string;
  location?: { lat: number; lng: number };
  timestamp: string;
}

export const Admin: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReports: 0,
    verifiedReports: 0,
    socialPosts: 0,
    activeUsers: 0
  });

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      // Load users
      const usersRes = await fetch('/api/admin/users');
      const usersData = await usersRes.json();
      setUsers(usersData.users || []);

      // Load reports
      const reportsRes = await fetch('/api/admin/reports');
      const reportsData = await reportsRes.json();
      setReports(reportsData.reports || []);

      // Load social posts
      const socialRes = await fetch('/api/admin/social');
      const socialData = await socialRes.json();
      setSocialPosts(socialData.posts || []);

      // Calculate stats
      setStats({
        totalUsers: usersData.users?.length || 0,
        totalReports: reportsData.reports?.length || 0,
        verifiedReports: reportsData.reports?.filter((r: Report) => r.verified).length || 0,
        socialPosts: socialData.posts?.length || 0,
        activeUsers: usersData.users?.filter((u: User) => u.is_active).length || 0
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  const verifyReport = async (reportId: string) => {
    try {
      await fetch(`/api/reports/${reportId}/verify`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth:token')}`
        }
      });
      loadAdminData(); // Reload data
    } catch (error) {
      console.error('Error verifying report:', error);
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await fetch(`/api/admin/users/${userId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth:token')}`
        },
        body: JSON.stringify({ is_active: !isActive })
      });
      loadAdminData(); // Reload data
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage Ocean Emergency App</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReports}</div>
            <p className="text-xs text-muted-foreground">
              {stats.verifiedReports} verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Social Posts</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.socialPosts}</div>
            <p className="text-xs text-muted-foreground">
              Social media activity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verification Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalReports > 0 ? Math.round((stats.verifiedReports / stats.totalReports) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Reports verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.name}</span>
                        <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'official' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                        <Badge variant={user.is_active ? 'default' : 'secondary'}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleUserStatus(user.id, user.is_active)}
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Report Management</CardTitle>
              <CardDescription>Review and verify emergency reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={report.verified ? 'default' : 'secondary'}>
                            {report.verified ? 'Verified' : 'Pending'}
                          </Badge>
                          <Badge variant="outline">{report.event_type}</Badge>
                        </div>
                        <p className="text-sm">{report.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Location: {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(report.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {!report.verified && (
                        <Button
                          size="sm"
                          onClick={() => verifyReport(report.id)}
                        >
                          Verify
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Monitoring</CardTitle>
              <CardDescription>Monitor social media posts and their locations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {socialPosts.map((post) => (
                  <div key={post.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{post.platform}</Badge>
                          <Badge variant={post.sentiment === 'negative' ? 'destructive' : post.sentiment === 'positive' ? 'default' : 'secondary'}>
                            {post.sentiment}
                          </Badge>
                          {post.location && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              Located
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm">{post.post_text}</p>
                        {post.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {post.keywords.map((keyword) => (
                              <Badge key={keyword} variant="secondary" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {post.location && (
                          <p className="text-xs text-muted-foreground">
                            Location: {post.location.lat.toFixed(4)}, {post.location.lng.toFixed(4)}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(post.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

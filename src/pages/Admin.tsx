import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sidebar } from "@/components/Sidebar";
import { ConfessionCard } from "@/components/ConfessionCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, TrendingUp, MessageSquare, Heart, Search, Filter, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Admin = () => {
  const [confessions, setConfessions] = useState<any[]>([]);
  const [filteredConfessions, setFilteredConfessions] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ 
    total: 0, 
    withIp: 0, 
    today: 0, 
    thisWeek: 0,
    totalLikes: 0,
    totalComments: 0
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAndFetch();

    const confessionsChannel = supabase
      .channel('admin-real-time')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'confessions' },
        () => {
          fetchConfessions();
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(confessionsChannel);
    };
  }, []);

  const checkAdminAndFetch = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      navigate("/");
      return;
    }

    setIsAdmin(true);
    await fetchConfessions();
    await fetchStats();
  };

  const fetchConfessions = async () => {
    const { data } = await supabase
      .from("confessions")
      .select(`
        *,
        confession_likes(count),
        confession_comments(count)
      `)
      .order("created_at", { ascending: false });

    const enrichedData = (data || []).map(c => ({
      ...c,
      likesCount: c.confession_likes?.[0]?.count || 0,
      commentsCount: c.confession_comments?.[0]?.count || 0
    }));

    setConfessions(enrichedData);
    setFilteredConfessions(enrichedData);
    setLoading(false);
  };

  const fetchStats = async () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const { count: total } = await supabase
      .from("confessions")
      .select("*", { count: "exact", head: true });

    const { count: withIp } = await supabase
      .from("confessions")
      .select("*", { count: "exact", head: true })
      .not("ip_address", "is", null);

    const { count: todayCount } = await supabase
      .from("confessions")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today.toISOString());

    const { count: thisWeek } = await supabase
      .from("confessions")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekAgo.toISOString());

    const { count: totalLikes } = await supabase
      .from("confession_likes")
      .select("*", { count: "exact", head: true });

    const { count: totalComments } = await supabase
      .from("confession_comments")
      .select("*", { count: "exact", head: true });

    setStats({ 
      total: total || 0, 
      withIp: withIp || 0,
      today: todayCount || 0,
      thisWeek: thisWeek || 0,
      totalLikes: totalLikes || 0,
      totalComments: totalComments || 0
    });
  };

  useEffect(() => {
    let filtered = [...confessions];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (filterType === "with-ip") {
      filtered = filtered.filter(c => c.ip_address);
    } else if (filterType === "no-ip") {
      filtered = filtered.filter(c => !c.ip_address);
    } else if (filterType === "popular") {
      filtered = filtered.filter(c => c.likesCount > 0 || c.commentsCount > 0);
    }

    // Sort
    if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sortBy === "most-liked") {
      filtered.sort((a, b) => b.likesCount - a.likesCount);
    } else if (sortBy === "most-commented") {
      filtered.sort((a, b) => b.commentsCount - a.commentsCount);
    }

    setFilteredConfessions(filtered);
  }, [searchQuery, filterType, sortBy, confessions]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar isAdmin={true} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
            <p className="text-muted-foreground">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isAdmin={isAdmin} />
      
      <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full lg:ml-0 ml-0">
        {/* Header */}
        <div className="mb-6 lg:mb-8 mt-12 lg:mt-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Complete system overview and management</p>
              </div>
            </div>
            <Badge variant="secondary" className="w-fit">
              <span className="text-xs font-medium">Live Updates Enabled</span>
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-4 mb-8">
          <Card className="border-l-4 border-l-primary hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl lg:text-3xl font-bold text-primary">{stats.total}</p>
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-lg">📝</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">All confessions</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground font-medium">Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl lg:text-3xl font-bold text-green-600">{stats.today}</p>
                <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Last 24 hours</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground font-medium">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl lg:text-3xl font-bold text-blue-600">{stats.thisWeek}</p>
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Last 7 days</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-pink-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground font-medium">Total Likes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl lg:text-3xl font-bold text-pink-600">{stats.totalLikes}</p>
                <div className="h-8 w-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
                  <Heart className="h-4 w-4 text-pink-600" />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground font-medium">Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl lg:text-3xl font-bold text-purple-600">{stats.totalComments}</p>
                <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-purple-600" />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Total engagement</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground font-medium">IP Tracked</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl lg:text-3xl font-bold text-orange-600">
                  {stats.total > 0 ? Math.round((stats.withIp / stats.total) * 100) : 0}%
                </p>
                <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <span className="text-lg">🔍</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">{stats.withIp} tracked</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search confessions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2 flex-wrap lg:flex-nowrap">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full lg:w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Confessions</SelectItem>
                    <SelectItem value="with-ip">With IP</SelectItem>
                    <SelectItem value="no-ip">No IP</SelectItem>
                    <SelectItem value="popular">Popular</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full lg:w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="most-liked">Most Liked</SelectItem>
                    <SelectItem value="most-commented">Most Commented</SelectItem>
                  </SelectContent>
                </Select>

                {(searchQuery || filterType !== "all") && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setFilterType("all");
                    }}
                    className="whitespace-nowrap"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
            
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <span>Showing {filteredConfessions.length} of {confessions.length} confessions</span>
            </div>
          </CardContent>
        </Card>

        {/* Confessions List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Confessions Management</h3>
          </div>
          
          {filteredConfessions.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No confessions found matching your filters.</p>
              </CardContent>
            </Card>
          ) : (
            filteredConfessions.map((confession) => (
              <div key={confession.id} className="relative">
                <ConfessionCard
                  confession={confession}
                  isAdmin={isAdmin}
                  onDelete={() => {
                    fetchConfessions();
                    fetchStats();
                  }}
                />
                <div className="flex items-center gap-4 mt-2 px-6 text-xs text-muted-foreground">
                  {confession.ip_address && (
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                      IP: {confession.ip_address}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {confession.likesCount} likes
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {confession.commentsCount} comments
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;

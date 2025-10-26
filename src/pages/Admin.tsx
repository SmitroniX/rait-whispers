import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sidebar } from "@/components/Sidebar";
import { ConfessionCard } from "@/components/ConfessionCard";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

const Admin = () => {
  const [confessions, setConfessions] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, withIp: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAndFetch();
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
      .select("*")
      .order("created_at", { ascending: false });

    setConfessions(data || []);
    setLoading(false);
    
    const channel = supabase
      .channel("admin-confessions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "confessions" },
        () => {
          fetchConfessions();
          fetchStats();
        }
      )
      .subscribe();
  };

  const fetchStats = async () => {
    const { count: total } = await supabase
      .from("confessions")
      .select("*", { count: "exact", head: true });

    const { count: withIp } = await supabase
      .from("confessions")
      .select("*", { count: "exact", head: true })
      .not("ip_address", "is", null);

    setStats({ total: total || 0, withIp: withIp || 0 });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar isAdmin={true} />
        <div className="flex-1 p-8 text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar isAdmin={isAdmin} />
      
      <main className="flex-1 p-4 lg:p-8 max-w-6xl mx-auto w-full">
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-6 w-6 lg:h-8 lg:w-8 text-primary" />
            <h1 className="text-2xl lg:text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-sm lg:text-base text-muted-foreground">Manage confessions and monitor activity</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-muted-foreground">Total Confessions</h3>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary text-xl">📝</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-primary">{stats.total}</p>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-secondary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-muted-foreground">With IP Tracking</h3>
                <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                  <span className="text-secondary text-xl">🔍</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-secondary">{stats.withIp}</p>
              <p className="text-xs text-muted-foreground mt-1">Tracked submissions</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-accent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-muted-foreground">IP Coverage</h3>
                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-accent text-xl">📊</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-accent">
                {stats.total > 0 ? Math.round((stats.withIp / stats.total) * 100) : 0}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">Coverage rate</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-muted-foreground">Recent Activity</h3>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary text-xl">⚡</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-primary">
                {confessions.filter(c => 
                  new Date(c.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                ).length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Last 24 hours</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">All Confessions</h3>
            <span className="text-sm text-muted-foreground">{confessions.length} total</span>
          </div>
          {confessions.map((confession) => (
            <div key={confession.id}>
              <ConfessionCard
                confession={confession}
                isAdmin={isAdmin}
                onDelete={fetchConfessions}
              />
              {confession.ip_address && (
                <div className="text-xs text-muted-foreground mt-2 px-6">
                  IP: {confession.ip_address}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Admin;

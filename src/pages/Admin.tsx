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
      
      <main className="flex-1 p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">Manage confessions and monitor activity</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm text-muted-foreground mb-2">Total Confessions</h3>
              <p className="text-3xl font-bold text-primary">{stats.total}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm text-muted-foreground mb-2">With IP Tracking</h3>
              <p className="text-3xl font-bold text-secondary">{stats.withIp}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm text-muted-foreground mb-2">IP Coverage</h3>
              <p className="text-3xl font-bold text-accent">
                {stats.total > 0 ? Math.round((stats.withIp / stats.total) * 100) : 0}%
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-4">All Confessions</h3>
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

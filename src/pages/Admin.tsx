import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { ConfessionCard } from "@/components/ConfessionCard";
import { Card } from "@/components/ui/card";
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
      <div className="min-h-screen">
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold">Admin Dashboard</h2>
          </div>
          <p className="text-muted-foreground">Manage confessions and monitor activity</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
          <Card className="confession-card p-6 border-primary/20">
            <h3 className="text-sm text-muted-foreground mb-2">Total Confessions</h3>
            <p className="text-3xl font-bold text-primary">{stats.total}</p>
          </Card>
          
          <Card className="confession-card p-6 border-primary/20">
            <h3 className="text-sm text-muted-foreground mb-2">With IP Tracking</h3>
            <p className="text-3xl font-bold text-secondary">{stats.withIp}</p>
          </Card>

          <Card className="confession-card p-6 border-primary/20">
            <h3 className="text-sm text-muted-foreground mb-2">IP Coverage</h3>
            <p className="text-3xl font-bold text-accent">
              {stats.total > 0 ? Math.round((stats.withIp / stats.total) * 100) : 0}%
            </p>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
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

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sidebar } from "@/components/Sidebar";
import { ConfessionCard } from "@/components/ConfessionCard";
import { Skeleton } from "@/components/ui/skeleton";

const Trending = () => {
  const [confessions, setConfessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchTrendingConfessions();
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
    }
  };

  const fetchTrendingConfessions = async () => {
    // Get confessions from last 7 days with most engagement (likes + comments)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: confessionsData } = await supabase
      .from("confessions")
      .select(`
        *,
        confession_likes(count),
        confession_comments(count)
      `)
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: false });

    if (confessionsData) {
      // Calculate engagement score and sort
      const scored = confessionsData.map(c => ({
        ...c,
        score: (c.confession_likes?.[0]?.count || 0) * 2 + (c.confession_comments?.[0]?.count || 0)
      })).sort((a, b) => b.score - a.score);

      setConfessions(scored);
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar isAdmin={isAdmin} />

      <main className="flex-1 p-4 lg:p-8 max-w-4xl mx-auto w-full">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2 lg:mb-3">Trending Confessions 🔥</h1>
          <p className="text-sm lg:text-base text-muted-foreground">
            Most engaging confessions from the past week
          </p>
        </div>

        <div className="space-y-4">
          {loading ? (
            <>
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </>
          ) : confessions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No trending confessions yet. Be the first to share!
            </div>
          ) : (
            confessions.map((confession) => (
              <ConfessionCard key={confession.id} confession={confession} />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Trending;

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sidebar } from "@/components/Sidebar";
import { ConfessionCard } from "@/components/ConfessionCard";
import { Skeleton } from "@/components/ui/skeleton";

const MostLiked = () => {
  const [confessions, setConfessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchMostLikedConfessions();
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

  const fetchMostLikedConfessions = async () => {
    const { data: confessionsData } = await supabase
      .from("confessions")
      .select(`
        *,
        confession_likes(count)
      `)
      .order("created_at", { ascending: false });

    if (confessionsData) {
      const sorted = confessionsData
        .map(c => ({
          ...c,
          likes: c.confession_likes?.[0]?.count || 0
        }))
        .sort((a, b) => b.likes - a.likes);

      setConfessions(sorted);
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar isAdmin={isAdmin} />

      <main className="flex-1 p-4 lg:p-8 max-w-4xl mx-auto w-full">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2 lg:mb-3">Most Liked Confessions ❤️</h1>
          <p className="text-sm lg:text-base text-muted-foreground">Confessions with the most hearts</p>
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
              No confessions yet. Be the first to share!
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

export default MostLiked;
